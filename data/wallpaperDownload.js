const downloadConfig = {
  title: '壁纸网盘下载',
  desc: '壁纸资源不在小程序内展示。复制网盘链接后，请到浏览器或网盘 App 中打开下载。',
  link: '',
  code: '',
  notice: '请仅下载和使用已获得授权或可合法使用的壁纸资源。'
};

function getWallpaperDownloadConfig() {
  return { ...downloadConfig };
}

module.exports = {
  downloadConfig,
  getWallpaperDownloadConfig
};
