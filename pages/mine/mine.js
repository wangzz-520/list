const { getAllTemplates } = require('../../data/templates');
const storage = require('../../utils/storage');
const cloudApi = require('../../utils/cloudApi');
const cloudSync = require('../../utils/cloudSync');

Page({
  data: {
    favoriteTemplates: [],
    customLists: [],
    challenge: {},
    feedbackText: '',
    cloudEnabled: false,
    syncing: false
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const favorites = storage.getFavorites();
    const all = getAllTemplates();
    const customLists = storage.getCustomLists();
    const allMap = {};
    all.concat(customLists).forEach(item => { allMap[item.id] = item; });
    const favoriteTemplates = favorites.map(id => allMap[id]).filter(Boolean);
    this.setData({
      favoriteTemplates,
      customLists,
      challenge: this.getChallengeSummary(),
      cloudEnabled: cloudApi.isCloudReady()
    });
  },

  getChallengeSummary() {
    const challenge = storage.getDailyChallenge();
    return {
      todayChecked: storage.isTodayChecked(),
      streak: challenge.streak,
      total: challenge.total
    };
  },

  goChecklist(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/checklist/checklist?id=${id}` });
  },

  goChallenge() {
    wx.navigateTo({ url: '/pages/challenge/challenge' });
  },

  goDecision() {
    wx.navigateTo({ url: '/pages/decision/decision' });
  },

  removeCustom(event) {
    const id = event.currentTarget.dataset.id;
    wx.showModal({
      title: '删除自定义清单',
      content: '删除后不可恢复，确定继续吗？',
      success: res => {
        if (!res.confirm) return;
        storage.removeCustomList(id);
        this.refresh();
      }
    });
  },

  onFeedbackInput(event) {
    this.setData({ feedbackText: event.detail.value });
  },

  async submitFeedback() {
    const text = String(this.data.feedbackText || '').trim();
    if (!text) {
      wx.showToast({ title: '请输入反馈内容', icon: 'none' });
      return;
    }
    storage.addFeedback(text);
    await cloudApi.submitFeedback(text, { page: 'mine' });
    this.setData({ feedbackText: '' });
    wx.showToast({ title: '已提交', icon: 'success' });
  },

  async syncCloudNow() {
    if (!cloudApi.isCloudReady()) {
      wx.showToast({ title: '云开发未启用', icon: 'none' });
      return;
    }
    this.setData({ syncing: true });
    await cloudSync.pushNow();
    const result = await cloudSync.pullAndMerge();
    this.setData({ syncing: false });
    this.refresh();
    wx.showToast({ title: result && result.ok ? '同步完成' : '同步失败', icon: 'none' });
  },

  clearAll() {
    wx.showModal({
      title: '清空本地数据',
      content: '收藏、最近使用、自定义清单和勾选记录都会被清空。云端数据会在下次同步时按本地状态覆盖，请谨慎操作。',
      success: res => {
        if (!res.confirm) return;
        storage.clearAllUserData();
        this.refresh();
        wx.showToast({ title: '已清空', icon: 'success' });
      }
    });
  }
});
