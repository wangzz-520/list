const cloudConfig = require('./config/cloud');
const cloudSync = require('./utils/cloudSync');
const cloudApi = require('./utils/cloudApi');
const storage = require('./utils/storage');

function getMiniProgramAppId() {
  try {
    const accountInfo = wx.getAccountInfoSync ? wx.getAccountInfoSync() : null;
    return accountInfo && accountInfo.miniProgram ? accountInfo.miniProgram.appId : '';
  } catch (error) {
    return '';
  }
}

App({
  globalData: {
    appName: '万能生活清单助手',
    version: '1.1.0-cloud',
    storageVersion: 'v1',
    cloudReady: false,
    openid: '',
    appid: '',
    unionid: '',
    cloudSyncTimer: null
  },

  onLaunch() {
    console.log('万能生活清单助手启动');

    if (!cloudConfig.ENABLE_CLOUD) {
      console.log('云开发未启用，当前使用本地缓存模式');
      return;
    }

    const appId = getMiniProgramAppId();
    if (!appId || appId === 'touristappid') {
      console.warn('当前为测试号或未配置真实 AppID，云开发已自动降级为本地模式');
      return;
    }

    if (!wx.cloud) {
      console.warn('当前基础库不支持 wx.cloud，请在微信开发者工具中启用云开发能力');
      return;
    }

    try {
      const initOptions = cloudConfig.CLOUD_ENV_ID
        ? { env: cloudConfig.CLOUD_ENV_ID, traceUser: true }
        : { traceUser: true };
      wx.cloud.init(initOptions);
      this.globalData.cloudReady = true;
      console.log('云开发初始化完成');

      cloudApi.login().then(result => {
        if (!result || !result.openid) {
          console.warn('获取 openid 失败，用户数据仍会由云函数按 _openid 隔离', result || {});
          return;
        }
        this.globalData.openid = result.openid;
        this.globalData.appid = result.appid || '';
        this.globalData.unionid = result.unionid || '';
        storage.markCloudSyncedAt();
        console.log('openid 获取完成');
      });

      cloudSync.pullAndMerge().then(result => {
        if (result && result.ok) {
          console.log('云端用户数据同步完成');
        }
      });
    } catch (error) {
      this.globalData.cloudReady = false;
      console.warn('云开发初始化失败，已自动降级为本地模式', error);
    }
  }
});
