function getAppSafe() {
  try {
    return typeof getApp === 'function' ? getApp() : null;
  } catch (error) {
    return null;
  }
}

function isCloudReady() {
  const app = getAppSafe();
  return !!(
    app &&
    app.globalData &&
    app.globalData.cloudReady &&
    typeof wx !== 'undefined' &&
    wx.cloud
  );
}

function callFunction(name, data = {}) {
  if (!isCloudReady()) {
    return Promise.resolve({ ok: false, reason: 'cloud_not_ready' });
  }
  return wx.cloud.callFunction({ name, data })
    .then(res => res.result || {})
    .catch(error => {
      console.warn(`[cloudApi] ${name} failed`, error);
      return { ok: false, reason: 'call_failed', error };
    });
}

async function getTemplates(params = {}) {
  const result = await callFunction('getTemplates', params);
  if (!result || result.ok === false) return [];
  return result.data || result.templates || [];
}

async function getTemplateById(id) {
  if (!id) return null;
  const rows = await getTemplates({ id });
  return rows[0] || null;
}

async function submitFeedback(content, meta = {}) {
  const text = String(content || '').trim();
  if (!text) return { ok: false, reason: 'empty_content' };
  return callFunction('submitFeedback', { content: text, meta });
}

async function createShareList(payload = {}) {
  return callFunction('createShareList', payload);
}

module.exports = {
  isCloudReady,
  callFunction,
  getTemplates,
  getTemplateById,
  submitFeedback,
  createShareList
};
