// 微信云开发配置
// 1. 在微信开发者工具中开通云开发环境
// 2. 将环境 ID 填到 CLOUD_ENV_ID，例如：'prod-xxxxx'
// 3. 部署 cloudfunctions 目录下的云函数

const CLOUD_ENV_ID = ''; // 留空时使用微信开发者工具当前默认云环境
const ENABLE_CLOUD = true;
const CLOUD_SYNC_DEBOUNCE_MS = 1200;

module.exports = {
  CLOUD_ENV_ID,
  ENABLE_CLOUD,
  CLOUD_SYNC_DEBOUNCE_MS
};
