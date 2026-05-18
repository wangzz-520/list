const cloud = require('wx-server-sdk');
const { templates, categories } = require('./templates');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const COLLECTIONS = [
  {
    name: 'checklist_templates',
    desc: '公共清单模板'
  },
  {
    name: 'app_config',
    desc: '应用配置'
  },
  {
    name: 'user_data',
    desc: '用户私有数据'
  },
  {
    name: 'feedbacks',
    desc: '用户反馈'
  },
  {
    name: 'shared_lists',
    desc: '共享清单快照'
  }
];

function isAlreadyExists(error) {
  const message = String(error && (error.message || error.errMsg || error) || '');
  const code = String(error && (error.errCode || error.code) || '');
  return (
    code === '-501001' ||
    code === 'DATABASE_COLLECTION_ALREADY_EXISTS' ||
    message.includes('already exists') ||
    message.includes('collection already exists') ||
    message.includes('Collection already exists') ||
    message.includes('Table already exist')
  );
}

function normalizeError(error) {
  return {
    code: error && (error.errCode || error.code) || '',
    message: String(error && (error.message || error.errMsg || error) || 'unknown error')
  };
}

async function ensureCollection(item) {
  try {
    await db.createCollection(item.name);
    return {
      name: item.name,
      desc: item.desc,
      ok: true,
      status: 'created'
    };
  } catch (error) {
    if (isAlreadyExists(error)) {
      return {
        name: item.name,
        desc: item.desc,
        ok: true,
        status: 'exists'
      };
    }
    return {
      name: item.name,
      desc: item.desc,
      ok: false,
      status: 'failed',
      error: normalizeError(error)
    };
  }
}

async function upsertByKey(collectionName, keyField, keyValue, data, options = {}) {
  const collection = db.collection(collectionName);
  const existed = await collection.where({ [keyField]: keyValue }).limit(1).get();
  const nextData = {
    ...data,
    updatedAt: db.serverDate()
  };

  if (existed.data && existed.data.length > 0) {
    if (options.skipIfExists) return 'existed';
    await collection.doc(existed.data[0]._id).update({ data: nextData });
    return 'updated';
  }

  await collection.add({
    data: {
      ...nextData,
      createdAt: db.serverDate()
    }
  });
  return 'created';
}

async function initAppConfig() {
  const categoriesResult = await upsertByKey('app_config', 'key', 'categories', {
    key: 'categories',
    value: categories
  });
  const adminResult = await upsertByKey('app_config', 'key', 'admin_openids', {
    key: 'admin_openids',
    value: []
  }, { skipIfExists: true });

  return {
    categories: categoriesResult,
    adminOpenids: adminResult
  };
}

async function initTemplates(options = {}) {
  const offset = Math.max(Number(options.offset || 0), 0);
  const limit = Math.max(Number(options.limit || templates.length), 1);
  const rows = templates.slice(offset, offset + limit);
  let created = 0;
  let updated = 0;
  let existed = 0;

  for (const template of rows) {
    const result = await upsertByKey('checklist_templates', 'id', template.id, {
      ...template,
      status: 'online',
      version: Number(template.version || 1)
    });
    if (result === 'created') created += 1;
    if (result === 'updated') updated += 1;
    if (result === 'existed') existed += 1;
  }

  return {
    total: templates.length,
    offset,
    limit,
    processed: rows.length,
    created,
    updated,
    existed,
    nextOffset: offset + rows.length,
    hasMore: offset + rows.length < templates.length
  };
}

async function initCollections() {
  const results = await Promise.all(COLLECTIONS.map(item => ensureCollection(item)));

  const failed = results.filter(item => !item.ok);
  return {
    ok: failed.length === 0,
    total: results.length,
    created: results.filter(item => item.status === 'created').length,
    existed: results.filter(item => item.status === 'exists').length,
    failed: failed.length,
    results
  };
}

exports.main = async (event = {}) => {
  const operation = event.operation || 'all';

  if (operation === 'collections') {
    const collections = await initCollections();
    return {
      ...collections,
      seeded: false
    };
  }

  if (operation === 'config') {
    const config = await initAppConfig();
    return {
      ok: true,
      seeded: true,
      config
    };
  }

  if (operation === 'templates') {
    const templateSeed = await initTemplates({
      offset: event.offset,
      limit: event.limit || 10
    });
    return {
      ok: true,
      seeded: true,
      templates: templateSeed,
      categories: categories.length
    };
  }

  const collections = await initCollections();
  if (!collections.ok) {
    const failed = collections.results.filter(item => !item.ok);
    if (failed.length > 0) {
      return {
        ok: false,
        total: collections.total,
        created: collections.created,
        existed: collections.existed,
        failed: collections.failed,
        results: collections.results,
        seeded: false,
        seedError: 'COLLECTION_INIT_FAILED'
      };
    }
  }

  try {
    const config = await initAppConfig();
    const templateSeed = await initTemplates();
    return {
      ok: true,
      total: collections.total,
      created: collections.created,
      existed: collections.existed,
      failed: 0,
      results: collections.results,
      seeded: true,
      config,
      templates: templateSeed,
      categories: categories.length
    };
  } catch (error) {
    console.error('initDatabase seed failed:', error);
    return {
      ok: false,
      total: collections.total,
      created: collections.created,
      existed: collections.existed,
      failed: 0,
      results: collections.results,
      seeded: false,
      seedError: normalizeError(error),
      templates: {
        total: templates.length
      },
      categories: categories.length
    };
  }
};
