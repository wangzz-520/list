const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

const MAX_GROUPS = 30;
const MAX_ITEMS = 240;
const MAX_TEXT_LENGTH = 80;

function normalizeText(value, fallback = '') {
  return String(value || fallback).trim().slice(0, MAX_TEXT_LENGTH);
}

function normalizeGroups(groups = []) {
  let itemCount = 0;
  return groups
    .slice(0, MAX_GROUPS)
    .map((group, groupIndex) => {
      const rawItems = Array.isArray(group.items) ? group.items : [];
      const items = [];
      rawItems.forEach((item, itemIndex) => {
        if (itemCount >= MAX_ITEMS) return;
        const text = normalizeText(typeof item === 'string' ? item : item.text);
        if (!text) return;
        itemCount += 1;
        items.push({
          id: normalizeText(item.id, `item_${groupIndex}_${itemIndex}`),
          text,
          checked: !!item.checked,
          custom: !!item.custom
        });
      });
      return {
        id: normalizeText(group.id, `group_${groupIndex}`),
        name: normalizeText(group.name, '清单分组'),
        items
      };
    })
    .filter(group => group.items.length > 0);
}

async function getShareList(event = {}) {
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
      icon: data.icon || '✓',
      description: data.description || '',
      groups: Array.isArray(data.groups) ? data.groups : [],
      status: data.status,
      version: data.version || 1,
      createdAt: data.createdAt || null,
      updatedAt: data.updatedAt || null
    }
  };
}

async function createShareList(event = {}) {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  if (!openid) return { ok: false, error: 'OPENID_NOT_FOUND' };

  const groups = normalizeGroups(event.groups);
  if (groups.length === 0) {
    return { ok: false, error: 'EMPTY_GROUPS' };
  }

  const result = await db.collection('shared_lists').add({
    data: {
      _openid: openid,
      sourceId: normalizeText(event.sourceId),
      title: normalizeText(event.title, '共享清单'),
      icon: normalizeText(event.icon, '✓').slice(0, 8),
      description: String(event.description || '').trim().slice(0, 160),
      groups,
      status: 'active',
      version: 1,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
  });

  return {
    ok: true,
    shareId: result._id
  };
}

exports.main = async (event = {}) => {
  const operation = event.operation || 'create';
  try {
    if (operation === 'get') {
      return await getShareList(event);
    }
    return await createShareList(event);
  } catch (error) {
    console.error('createShareList failed:', operation, error);
    return {
      ok: false,
      error: error.message || String(error)
    };
  }
};
