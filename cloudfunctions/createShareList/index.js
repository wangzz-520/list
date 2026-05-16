const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event = {}) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const title = String(event.title || '共享清单').trim().slice(0, 80);
  const groups = Array.isArray(event.groups) ? event.groups : [];

  if (!openid) return { ok: false, error: 'OPENID_NOT_FOUND' };
  if (groups.length === 0) {
    return { ok: false, error: 'EMPTY_GROUPS' };
  }

  try {
    const result = await db.collection('shared_lists').add({
      data: {
        _openid: openid,
        sourceId: event.sourceId || '',
        title,
        icon: event.icon || '✅',
        groups,
        status: 'active',
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    });

    return { ok: true, shareId: result._id };
  } catch (error) {
    console.error('createShareList failed:', error);
    return { ok: false, error: error.message || String(error) };
  }
};
