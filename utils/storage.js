const KEYS = {
  DRAFTS: 'life_checklist_v1_drafts',
  FAVORITES: 'life_checklist_v1_favorites',
  PINNED_TEMPLATES: 'life_checklist_v1_pinned_templates',
  RECENTS: 'life_checklist_v1_recents',
  COMPLETED_LISTS: 'life_checklist_v1_completed_lists',
  CUSTOM_LISTS: 'life_checklist_v1_custom_lists',
  DECISION_HISTORY: 'life_checklist_v1_decision_history'
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function read(key, fallback) {
  try {
    const value = wx.getStorageSync(key);
    if (value === '' || value === undefined || value === null) return clone(fallback);
    return value;
  } catch (error) {
    console.warn('storage read failed:', key, error);
    return clone(fallback);
  }
}

function write(key, value, options = {}) {
  try {
    wx.setStorageSync(key, value);
    return true;
  } catch (error) {
    console.warn('storage write failed:', key, error);
    return false;
  }
}

function getDraft(listId) {
  const drafts = read(KEYS.DRAFTS, {});
  return drafts[listId] || { checkedMap: {}, deletedIds: [], extraItemsByGroup: {} };
}

function getDrafts() {
  return read(KEYS.DRAFTS, {});
}

function saveDraft(listId, draft) {
  const drafts = read(KEYS.DRAFTS, {});
  drafts[listId] = {
    ...draft,
    updatedAt: Date.now()
  };
  return write(KEYS.DRAFTS, drafts);
}

function clearDraft(listId) {
  const drafts = read(KEYS.DRAFTS, {});
  delete drafts[listId];
  return write(KEYS.DRAFTS, drafts);
}

function getFavorites() {
  return read(KEYS.FAVORITES, []);
}

function isFavorite(id) {
  return getFavorites().includes(id);
}

function toggleFavorite(id) {
  const favorites = getFavorites();
  const index = favorites.indexOf(id);
  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.unshift(id);
  }
  write(KEYS.FAVORITES, favorites);
  return favorites.includes(id);
}

function getPinnedTemplates() {
  return read(KEYS.PINNED_TEMPLATES, []);
}

function isPinnedTemplate(id) {
  return getPinnedTemplates().includes(id);
}

function togglePinnedTemplate(id) {
  const pinned = getPinnedTemplates();
  const index = pinned.indexOf(id);
  if (index >= 0) {
    pinned.splice(index, 1);
  } else {
    pinned.unshift(id);
  }
  write(KEYS.PINNED_TEMPLATES, pinned.slice(0, 20));
  return pinned.includes(id);
}

function addRecent(item) {
  const recents = read(KEYS.RECENTS, []);
  const next = recents.filter(row => row.id !== item.id);
  next.unshift({ id: item.id, title: item.title, icon: item.icon || '✅', ts: Date.now() });
  write(KEYS.RECENTS, next.slice(0, 12));
}

function getRecents() {
  return read(KEYS.RECENTS, []);
}

function getCompletedLists() {
  return read(KEYS.COMPLETED_LISTS, []);
}

function markListCompleted(item) {
  const completed = getCompletedLists();
  const today = getTodayKey();
  const next = completed.filter(row => !(row.id === item.id && row.completedDate === today));
  next.unshift({
    id: item.id,
    title: item.title,
    icon: item.icon || '✅',
    completedAt: Date.now(),
    completedDate: today,
    progress: item.progress || { total: 0, done: 0, percent: 100 }
  });
  write(KEYS.COMPLETED_LISTS, next.slice(0, 50));
  return next[0];
}

function getCustomLists() {
  return read(KEYS.CUSTOM_LISTS, []);
}

function getCustomList(id) {
  return getCustomLists().find(item => item.id === id) || null;
}

function saveCustomList(list) {
  const lists = getCustomLists();
  const index = lists.findIndex(item => item.id === list.id);
  const now = Date.now();
  const normalized = {
    ...list,
    updatedAt: now,
    createdAt: list.createdAt || now
  };
  if (index >= 0) {
    lists[index] = normalized;
  } else {
    lists.unshift(normalized);
  }
  return write(KEYS.CUSTOM_LISTS, lists);
}

function removeCustomList(id) {
  const lists = getCustomLists().filter(item => item.id !== id);
  const completed = getCompletedLists().filter(item => item.id !== id);
  clearDraft(id);
  write(KEYS.COMPLETED_LISTS, completed);
  return write(KEYS.CUSTOM_LISTS, lists);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTodayKey() {
  return formatDate(new Date());
}

function getDecisionHistory() {
  return read(KEYS.DECISION_HISTORY, []);
}

function addDecisionHistory(record) {
  const history = getDecisionHistory();
  const normalized = {
    id: record.id || `decision_${Date.now()}`,
    title: record.title || '临时选择',
    result: record.result || '',
    options: Array.isArray(record.options) ? record.options.slice(0, 20) : [],
    createdAt: record.createdAt || Date.now()
  };
  history.unshift(normalized);
  write(KEYS.DECISION_HISTORY, history.slice(0, 20));
  return normalized;
}

function clearDecisionHistory() {
  return write(KEYS.DECISION_HISTORY, []);
}

function clearAllUserData() {
  write(KEYS.DRAFTS, {});
  write(KEYS.FAVORITES, []);
  write(KEYS.PINNED_TEMPLATES, []);
  write(KEYS.RECENTS, []);
  write(KEYS.COMPLETED_LISTS, []);
  write(KEYS.CUSTOM_LISTS, []);
  write(KEYS.DECISION_HISTORY, []);
}

function exportUserData() {
  return {
    schemaVersion: 1,
    drafts: read(KEYS.DRAFTS, {}),
    favorites: read(KEYS.FAVORITES, []),
    pinnedTemplates: read(KEYS.PINNED_TEMPLATES, []),
    recents: read(KEYS.RECENTS, []),
    completedLists: read(KEYS.COMPLETED_LISTS, []),
    customLists: read(KEYS.CUSTOM_LISTS, []),
    exportedAt: Date.now()
  };
}

module.exports = {
  KEYS,
  getDraft,
  getDrafts,
  saveDraft,
  clearDraft,
  getFavorites,
  isFavorite,
  toggleFavorite,
  getPinnedTemplates,
  isPinnedTemplate,
  togglePinnedTemplate,
  addRecent,
  getRecents,
  getCompletedLists,
  markListCompleted,
  getCustomLists,
  getCustomList,
  saveCustomList,
  removeCustomList,
  getTodayKey,
  getDecisionHistory,
  addDecisionHistory,
  clearDecisionHistory,
  clearAllUserData,
  exportUserData
};
