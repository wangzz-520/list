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

async function login() {
  if (typeof wx === 'undefined' || !wx.cloud) {
    return { ok: false, reason: 'cloud_not_ready' };
  }
  try {
    const res = await wx.cloud.callFunction({ name: 'login', data: {} });
    const result = res.result || {};
    if (!result || result.ok === false) {
      return {
        ok: false,
        reason: 'login_failed',
        error: result && (result.error || result.reason)
      };
    }
    return {
      ok: true,
      openid: result.openid || '',
      appid: result.appid || '',
      unionid: result.unionid || '',
      userRecord: result.userRecord || null
    };
  } catch (error) {
    console.warn('[cloudApi] login failed', error);
    return {
      ok: false,
      reason: 'call_failed',
      error
    };
  }
}

async function getTemplateById(id) {
  if (!id) return null;
  const rows = await getTemplates({ id });
  return rows[0] || null;
}

async function getAdminState() {
  const result = await callFunction('adminManager', { operation: 'state' });
  return {
    ok: !!(result && result.ok),
    isAdmin: !!(result && result.isAdmin)
  };
}

async function getAdminFeedbacks(params = {}) {
  const result = await callFunction('adminManager', {
    operation: 'listFeedbacks',
    limit: params.limit || 50
  });
  if (!result || result.ok === false) return [];
  return result.data || [];
}

async function submitFeedback(content, meta = {}) {
  const text = String(content || '').trim();
  if (!text) return { ok: false, reason: 'empty_content' };
  return callFunction('submitFeedback', { content: text, meta });
}

async function createShareList(payload = {}) {
  return callFunction('createShareList', payload);
}

async function getShareList(shareId) {
  const id = String(shareId || '').trim();
  if (!id) return null;
  const result = await callFunction('createShareList', { operation: 'get', shareId: id });
  if (!result || result.ok === false) return null;
  return result.data || null;
}

module.exports = {
  isCloudReady,
  callFunction,
  login,
  getTemplates,
  getTemplateById,
  getAdminState,
  getAdminFeedbacks,
  submitFeedback,
  createShareList,
  getShareList
};
