const storage = require('./storage');
const cloudApi = require('./cloudApi');

async function pullAndMerge() {
  if (!cloudApi.isCloudReady()) {
    return { ok: false, reason: 'cloud_not_ready' };
  }
  const result = await cloudApi.callFunction('syncUserData', { operation: 'pull' });
  if (!result || result.ok === false) return result;
  if (result.data) {
    storage.importUserData(result.data);
  }
  return { ok: true, data: storage.exportUserData() };
}

async function pushNow() {
  if (!cloudApi.isCloudReady()) {
    return { ok: false, reason: 'cloud_not_ready' };
  }
  const payload = storage.exportUserData();
  const result = await cloudApi.callFunction('syncUserData', { operation: 'push', payload });
  if (result && result.ok) {
    storage.markCloudSyncedAt(Date.now());
  }
  return result;
}

async function saveCustomListNow(list) {
  if (!cloudApi.isCloudReady()) {
    return { ok: false, reason: 'cloud_not_ready' };
  }
  const result = await cloudApi.callFunction('syncUserData', {
    operation: 'saveCustomList',
    list,
    clientExportedAt: Date.now()
  });
  if (result && result.ok) {
    storage.markCloudSyncedAt(Date.now());
  }
  return result;
}

module.exports = {
  pullAndMerge,
  pushNow,
  saveCustomListNow
};
