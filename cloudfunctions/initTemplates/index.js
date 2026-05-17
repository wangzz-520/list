const cloud = require('wx-server-sdk');
const { templates, categories } = require('./templates');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

async function ensureCollection(name) {
  try {
    await db.createCollection(name);
  } catch (error) {
    const message = String(error && (error.message || error.errMsg || error) || '');
    if (
      message.includes('already exists') ||
      message.includes('Collection already exists') ||
      message.includes('DATABASE_COLLECTION_ALREADY_EXISTS')
    ) {
      return;
    }
    // Some CloudBase environments do not allow createCollection from a cloud
    // function. In that case the next database call will return the actionable
    // error, so keep initialization flow simple.
    if (!message.includes('exists')) {
      console.warn(`create collection ${name} skipped:`, error);
    }
  }
}

async function upsertTemplate(template) {
  const collection = db.collection('checklist_templates');
  const existed = await collection.where({ id: template.id }).limit(1).get();
  const data = {
    ...template,
    status: 'online',
    version: Number(template.version || 1),
    updatedAt: db.serverDate()
  };

  if (existed.data && existed.data.length > 0) {
    await collection.doc(existed.data[0]._id).update({ data });
    return 'updated';
  }

  await collection.add({
    data: {
      ...data,
      createdAt: db.serverDate()
    }
  });
  return 'created';
}

async function upsertConfig() {
  const collection = db.collection('app_config');
  const existed = await collection.where({ key: 'categories' }).limit(1).get();
  const data = {
    key: 'categories',
    value: categories,
    updatedAt: db.serverDate()
  };
  if (existed.data && existed.data.length > 0) {
    await collection.doc(existed.data[0]._id).update({ data });
  } else {
    await collection.add({ data: { ...data, createdAt: db.serverDate() } });
  }
}

exports.main = async () => {
  let created = 0;
  let updated = 0;

  try {
    await ensureCollection('checklist_templates');
    await ensureCollection('app_config');

    for (const template of templates) {
      const result = await upsertTemplate(template);
      if (result === 'created') created += 1;
      if (result === 'updated') updated += 1;
    }

    await upsertConfig();

    return {
      ok: true,
      total: templates.length,
      created,
      updated,
      categories: categories.length
    };
  } catch (error) {
    console.error('initTemplates failed:', error);
    return {
      ok: false,
      error: error.message || String(error),
      total: templates.length,
      created,
      updated,
      categories: categories.length
    };
  }
};
