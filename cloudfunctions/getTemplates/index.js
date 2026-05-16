const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

function matchKeyword(template, keyword) {
  const kw = String(keyword || '').trim().toLowerCase();
  if (!kw) return true;
  const groupTexts = (template.groups || []).reduce((rows, group) => {
    rows.push(group.name);
    (group.items || []).forEach(item => {
      rows.push(typeof item === 'string' ? item : item.text);
    });
    return rows;
  }, []);
  const haystack = [
    template.title,
    template.description,
    template.category,
    ...groupTexts
  ].join(' ').toLowerCase();
  return haystack.includes(kw);
}

exports.main = async (event = {}) => {
  const collection = db.collection('checklist_templates');
  const limit = Math.min(Math.max(Number(event.limit || 50), 1), 100);

  try {
    if (event.id) {
      const one = await collection.where({ id: event.id, status: 'online' }).limit(1).get();
      return { ok: true, data: one.data || [] };
    }

    const where = { status: 'online' };
    if (event.category) where.category = event.category;

    const result = await collection
      .where(where)
      .orderBy(event.sortByHot === false ? 'updatedAt' : 'heat', 'desc')
      .limit(100)
      .get();

    const data = (result.data || [])
      .filter(item => matchKeyword(item, event.keyword))
      .slice(0, limit);

    return { ok: true, data };
  } catch (error) {
    console.error('getTemplates failed:', error);
    return { ok: false, error: error.message || String(error), data: [] };
  }
};
