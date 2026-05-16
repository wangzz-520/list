const cloudConfig = require('../config/cloud');

const KEYS = {
  DRAFTS: 'life_checklist_v1_drafts',
  FAVORITES: 'life_checklist_v1_favorites',
  RECENTS: 'life_checklist_v1_recents',
  CUSTOM_LISTS: 'life_checklist_v1_custom_lists',
  DAILY_CHALLENGE: 'life_checklist_v1_daily_challenge',
  DECISION_HISTORY: 'life_checklist_v1_decision_history',
  FEEDBACKS: 'life_checklist_v1_feedbacks',
  LAST_CLOUD_SYNC_AT: 'life_checklist_v1_last_cloud_sync_at'
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

function getAppSafe() {
  try {
    return typeof getApp === 'function' ? getApp() : null;
  } catch (error) {
    return null;
  }
}

function canCloudSync() {
  const app = getAppSafe();
  return !!(
    cloudConfig.ENABLE_CLOUD &&
    app &&
    app.globalData &&
    app.globalData.cloudReady &&
    typeof wx !== 'undefined' &&
    wx.cloud
  );
}

function scheduleCloudPush() {
  if (!canCloudSync()) return;
  const app = getAppSafe();
  clearTimeout(app.globalData.cloudSyncTimer);
  app.globalData.cloudSyncTimer = setTimeout(() => {
    const payload = exportUserData();
    wx.cloud.callFunction({
      name: 'syncUserData',
      data: {
        operation: 'push',
        payload
      }
    }).then(() => {
      write(KEYS.LAST_CLOUD_SYNC_AT, Date.now(), { silent: true });
    }).catch(error => {
      console.warn('cloud sync push failed:', error);
    });
  }, cloudConfig.CLOUD_SYNC_DEBOUNCE_MS || 1200);
}

function write(key, value, options = {}) {
  try {
    wx.setStorageSync(key, value);
    if (!options.silent) scheduleCloudPush();
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

function addRecent(item) {
  const recents = read(KEYS.RECENTS, []);
  const next = recents.filter(row => row.id !== item.id);
  next.unshift({ id: item.id, title: item.title, icon: item.icon || '✅', ts: Date.now() });
  write(KEYS.RECENTS, next.slice(0, 12));
}

function getRecents() {
  return read(KEYS.RECENTS, []);
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
  clearDraft(id);
  return write(KEYS.CUSTOM_LISTS, lists);
}

function addFeedback(content) {
  const feedbacks = read(KEYS.FEEDBACKS, []);
  feedbacks.unshift({ id: `feedback_${Date.now()}`, content, createdAt: Date.now() });
  return write(KEYS.FEEDBACKS, feedbacks.slice(0, 30));
}

function getFeedbacks() {
  return read(KEYS.FEEDBACKS, []);
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

function getYesterdayKey() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return formatDate(date);
}

function getDailyChallenge() {
  const data = read(KEYS.DAILY_CHALLENGE, {});
  const checkedDates = data.checkedDates || {};
  return {
    checkedDates,
    lastCheckedDate: data.lastCheckedDate || '',
    streak: Number(data.streak || 0),
    total: Number(data.total || Object.keys(checkedDates).length || 0),
    updatedAt: data.updatedAt || 0
  };
}

function isTodayChecked() {
  const challenge = getDailyChallenge();
  return !!challenge.checkedDates[getTodayKey()];
}

function checkInToday() {
  const today = getTodayKey();
  const yesterday = getYesterdayKey();
  const challenge = getDailyChallenge();

  if (challenge.checkedDates[today]) {
    return { ...challenge, todayChecked: true };
  }

  const checkedDates = {
    ...challenge.checkedDates,
    [today]: Date.now()
  };
  const streak = challenge.lastCheckedDate === yesterday ? challenge.streak + 1 : 1;
  const next = {
    checkedDates,
    lastCheckedDate: today,
    streak,
    total: Object.keys(checkedDates).length,
    updatedAt: Date.now()
  };
  write(KEYS.DAILY_CHALLENGE, next);
  return { ...next, todayChecked: true };
}

function resetDailyChallenge() {
  const empty = {
    checkedDates: {},
    lastCheckedDate: '',
    streak: 0,
    total: 0,
    updatedAt: Date.now()
  };
  write(KEYS.DAILY_CHALLENGE, empty);
  return empty;
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
  write(KEYS.RECENTS, []);
  write(KEYS.CUSTOM_LISTS, []);
  write(KEYS.DAILY_CHALLENGE, {});
  write(KEYS.DECISION_HISTORY, []);
  write(KEYS.FEEDBACKS, []);
}

function exportUserData() {
  return {
    schemaVersion: 1,
    drafts: read(KEYS.DRAFTS, {}),
    favorites: read(KEYS.FAVORITES, []),
    recents: read(KEYS.RECENTS, []),
    customLists: read(KEYS.CUSTOM_LISTS, []),
    feedbacks: read(KEYS.FEEDBACKS, []),
    exportedAt: Date.now()
  };
}

function mergeArrayById(localRows, cloudRows, limit) {
  const map = {};
  (cloudRows || []).concat(localRows || []).forEach(row => {
    if (!row || !row.id) return;
    const existed = map[row.id];
    if (!existed || Number(row.updatedAt || row.ts || row.createdAt || 0) >= Number(existed.updatedAt || existed.ts || existed.createdAt || 0)) {
      map[row.id] = row;
    }
  });
  return Object.values(map)
    .sort((a, b) => Number(b.updatedAt || b.ts || b.createdAt || 0) - Number(a.updatedAt || a.ts || a.createdAt || 0))
    .slice(0, limit || 1000);
}

function mergeDrafts(localDrafts, cloudDrafts) {
  return {
    ...(cloudDrafts || {}),
    ...(localDrafts || {})
  };
}

function importUserData(cloudData = {}) {
  const local = exportUserData();
  const favorites = Array.from(new Set([...(cloudData.favorites || []), ...(local.favorites || [])]));
  const recents = mergeArrayById(local.recents, cloudData.recents, 12);
  const customLists = mergeArrayById(local.customLists, cloudData.customLists, 100);
  const feedbacks = mergeArrayById(local.feedbacks, cloudData.feedbacks, 30);
  const drafts = mergeDrafts(local.drafts, cloudData.drafts);

  write(KEYS.DRAFTS, drafts, { silent: true });
  write(KEYS.FAVORITES, favorites, { silent: true });
  write(KEYS.RECENTS, recents, { silent: true });
  write(KEYS.CUSTOM_LISTS, customLists, { silent: true });
  write(KEYS.FEEDBACKS, feedbacks, { silent: true });
  write(KEYS.LAST_CLOUD_SYNC_AT, Date.now(), { silent: true });

  return exportUserData();
}

module.exports = {
  KEYS,
  getDraft,
  saveDraft,
  clearDraft,
  getFavorites,
  isFavorite,
  toggleFavorite,
  addRecent,
  getRecents,
  getCustomLists,
  getCustomList,
  saveCustomList,
  removeCustomList,
  addFeedback,
  getFeedbacks,
  getTodayKey,
  getDailyChallenge,
  isTodayChecked,
  checkInToday,
  resetDailyChallenge,
  getDecisionHistory,
  addDecisionHistory,
  clearDecisionHistory,
  clearAllUserData,
  exportUserData,
  importUserData,
  scheduleCloudPush
};
