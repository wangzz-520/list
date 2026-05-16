const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

function normalizePayload(payload = {}) {
  return {
    schemaVersion: 1,
    drafts: payload.drafts || {},
    favorites: Array.isArray(payload.favorites) ? payload.favorites.slice(0, 300) : [],
    pinnedTemplates: Array.isArray(payload.pinnedTemplates) ? payload.pinnedTemplates.slice(0, 20) : [],
    recents: Array.isArray(payload.recents) ? payload.recents.slice(0, 30) : [],
    completedLists: Array.isArray(payload.completedLists) ? payload.completedLists.slice(0, 50) : [],
    customLists: Array.isArray(payload.customLists) ? payload.customLists.slice(0, 200) : [],
    feedbacks: Array.isArray(payload.feedbacks) ? payload.feedbacks.slice(0, 50) : [],
    clientExportedAt: Number(payload.exportedAt || Date.now())
  };
}

exports.main = async (event = {}) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const collection = db.collection('user_data');
  const operation = event.operation || 'pull';

  if (!openid) {
    return { ok: false, error: 'OPENID_NOT_FOUND' };
  }

  try {
    if (operation === 'pull') {
      const result = await collection.where({ _openid: openid }).limit(1).get();
      return {
        ok: true,
        data: result.data && result.data.length > 0 ? result.data[0].data : null
      };
    }

    if (operation === 'push') {
      const payload = normalizePayload(event.payload || {});
      const existed = await collection.where({ _openid: openid }).limit(1).get();
      if (existed.data && existed.data.length > 0) {
        await collection.doc(existed.data[0]._id).update({
          data: {
            data: payload,
            updatedAt: db.serverDate()
          }
        });
      } else {
        await collection.add({
          data: {
            _openid: openid,
            data: payload,
            createdAt: db.serverDate(),
            updatedAt: db.serverDate()
          }
        });
      }

      return { ok: true, data: payload };
    }

    return { ok: false, error: `Unsupported operation: ${operation}` };
  } catch (error) {
    console.error('syncUserData failed:', error);
    return { ok: false, error: error.message || String(error) };
  }
};
