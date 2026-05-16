const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event = {}) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const operation = event.operation || 'create';
  const title = String(event.title || '共享清单').trim().slice(0, 80);
  const groups = Array.isArray(event.groups) ? event.groups : [];

  try {
    if (operation === 'get') {
      const shareId = String(event.shareId || '').trim();
      if (!shareId) return { ok: false, error: 'EMPTY_SHARE_ID' };
      const result = await db.collection('shared_lists').doc(shareId).get();
      const data = result.data;
      if (!data || data.status !== 'active') {
        return { ok: false, error: 'SHARE_NOT_FOUND' };
      }
      return {
        ok: true,
        data: {
          id: shareId,
          sourceId: data.sourceId || '',
          title: data.title || '共享清单',
          icon: data.icon || '✅',
          groups: Array.isArray(data.groups) ? data.groups : [],
          status: data.status
        }
      };
    }

    if (!openid) return { ok: false, error: 'OPENID_NOT_FOUND' };
    if (groups.length === 0) {
      return { ok: false, error: 'EMPTY_GROUPS' };
    }

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
    console.error('createShareList failed:', operation, error);
    return { ok: false, error: error.message || String(error) };
  }
};
