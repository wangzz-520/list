const cloud = require('wx-server-sdk');

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
    desc: '分享清单快照'
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

exports.main = async () => {
  const results = [];

  for (const item of COLLECTIONS) {
    // Create sequentially so CloudBase errors are easier to read in logs.
    // eslint-disable-next-line no-await-in-loop
    results.push(await ensureCollection(item));
  }

  const failed = results.filter(item => !item.ok);
  return {
    ok: failed.length === 0,
    total: results.length,
    created: results.filter(item => item.status === 'created').length,
    existed: results.filter(item => item.status === 'exists').length,
    failed: failed.length,
    results
  };
};
