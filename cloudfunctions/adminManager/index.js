const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

async function getAdminOpenids() {
  const result = await db.collection('app_config')
    .where({ key: 'admin_openids' })
    .limit(1)
    .get();
  const config = result.data && result.data[0];
  return Array.isArray(config && config.value) ? config.value : [];
}

async function assertAdmin(openid) {
  if (!openid) return false;
  const admins = await getAdminOpenids();
  return admins.includes(openid);
}

async function listFeedbacks(limit) {
  const result = await db.collection('feedbacks')
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();
  return (result.data || []).map(item => ({
    id: item._id,
    content: item.content || '',
    status: item.status || 'new',
    meta: item.meta || {},
    createdAt: item.createdAt || ''
  }));
}

exports.main = async (event = {}) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const operation = event.operation || 'state';

  try {
    const isAdmin = await assertAdmin(openid);
    if (operation === 'state') {
      return { ok: true, isAdmin };
    }

    if (!isAdmin) {
      return { ok: false, error: 'NO_PERMISSION', isAdmin: false };
    }

    if (operation === 'listFeedbacks') {
      const limit = Math.min(Math.max(Number(event.limit || 50), 1), 100);
      return { ok: true, isAdmin: true, data: await listFeedbacks(limit) };
    }

    return { ok: false, error: 'UNKNOWN_OPERATION', isAdmin: true };
  } catch (error) {
    console.error('adminManager failed:', error);
    return { ok: false, error: error.message || String(error) };
  }
};
