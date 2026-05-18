const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

function createEmptyUserData() {
  return {
    schemaVersion: 1,
    drafts: {},
    favorites: [],
    pinnedTemplates: [],
    recents: [],
    completedLists: [],
    customLists: [],
    feedbacks: [],
    clientExportedAt: 0
  };
}

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

function normalizeCustomList(list = {}) {
  return {
    id: String(list.id || '').trim(),
    title: String(list.title || '我的清单').trim().slice(0, 80),
    icon: String(list.icon || '✓').trim().slice(0, 8),
    category: String(list.category || 'custom').trim(),
    description: String(list.description || '').trim().slice(0, 160),
    groups: Array.isArray(list.groups) ? list.groups : [],
    createdAt: Number(list.createdAt || Date.now()),
    updatedAt: Number(list.updatedAt || Date.now())
  };
}

async function getUserRecord(collection, openid) {
  const existed = await collection.where({ _openid: openid }).limit(1).get();
  return existed.data && existed.data.length > 0 ? existed.data[0] : null;
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
      const existed = await getUserRecord(collection, openid);
      if (existed) {
        await collection.doc(existed._id).update({
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

    if (operation === 'saveCustomList') {
      const list = normalizeCustomList(event.list || {});
      if (!list.id) return { ok: false, error: 'EMPTY_CUSTOM_LIST_ID' };

      const existed = await getUserRecord(collection, openid);
      const currentData = existed && existed.data ? (existed.data.data || createEmptyUserData()) : createEmptyUserData();
      const customLists = Array.isArray(currentData.customLists) ? currentData.customLists : [];
      const nextCustomLists = customLists.filter(item => item && item.id !== list.id);
      nextCustomLists.unshift(list);

      const nextData = {
        ...currentData,
        schemaVersion: 1,
        customLists: nextCustomLists.slice(0, 200),
        clientExportedAt: Number(event.clientExportedAt || Date.now())
      };

      if (existed) {
        await collection.doc(existed._id).update({
          data: {
            data: nextData,
            updatedAt: db.serverDate()
          }
        });
      } else {
        await collection.add({
          data: {
            _openid: openid,
            data: nextData,
            createdAt: db.serverDate(),
            updatedAt: db.serverDate()
          }
        });
      }

      return { ok: true, data: list };
    }

    return { ok: false, error: `Unsupported operation: ${operation}` };
  } catch (error) {
    console.error('syncUserData failed:', error);
    return { ok: false, error: error.message || String(error) };
  }
};
