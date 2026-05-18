const { getWallpaperDownloadConfig } = require('../../data/wallpaperDownload');

Page({
  data: {
    config: getWallpaperDownloadConfig()
  },

  copyLink() {
    const link = String(this.data.config.link || '').trim();
    if (!link) {
      wx.showToast({ title: '暂未配置链接', icon: 'none' });
      return;
    }
    wx.setClipboardData({
      data: link,
      success: () => {
        wx.showToast({ title: '链接已复制', icon: 'success' });
      }
    });
  },

  copyCode() {
    const code = String(this.data.config.code || '').trim();
    if (!code) {
      wx.showToast({ title: '暂无提取码', icon: 'none' });
      return;
    }
    wx.setClipboardData({
      data: code,
      success: () => {
        wx.showToast({ title: '提取码已复制', icon: 'success' });
      }
    });
  }
});
