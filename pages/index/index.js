const { categories, getAllTemplates, searchTemplates } = require('../../data/templates');
const storage = require('../../utils/storage');
const cloudApi = require('../../utils/cloudApi');

Page({
  data: {
    keyword: '',
    categories,
    popularTemplates: [],
    searchResults: [],
    recents: [],
    challenge: {},
    cloudEnabled: false
  },

  onShow() {
    const templates = getAllTemplates().sort((a, b) => b.heat - a.heat).slice(0, 8);
    this.setData({
      popularTemplates: templates,
      recents: storage.getRecents(),
      challenge: this.getChallengeSummary(),
      cloudEnabled: cloudApi.isCloudReady()
    });

    this.loadCloudPopularTemplates();
  },

  async loadCloudPopularTemplates() {
    const rows = await cloudApi.getTemplates({ sortByHot: true, limit: 8 });
    if (!rows || rows.length === 0) return;
    this.setData({ popularTemplates: rows });
  },

  onSearchInput(event) {
    const keyword = event.detail.value;
    this.setData({
      keyword,
      searchResults: keyword ? searchTemplates(keyword) : []
    });

    if (keyword) {
      this.searchCloudTemplates(keyword);
    }
  },

  async searchCloudTemplates(keyword) {
    const rows = await cloudApi.getTemplates({ keyword, limit: 30 });
    if (!rows || rows.length === 0) return;
    if (this.data.keyword === keyword) {
      this.setData({ searchResults: rows });
    }
  },

  goCategory(event) {
    const id = event.currentTarget.dataset.id;
    wx.switchTab({ url: '/pages/category/category' });
    wx.setStorageSync('life_checklist_v1_pending_category', id);
  },

  goChecklist(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/checklist/checklist?id=${id}` });
  },

  goCustom() {
    wx.switchTab({ url: '/pages/custom/custom' });
  },

  goChallenge() {
    wx.navigateTo({ url: '/pages/challenge/challenge' });
  },

  goDecision() {
    wx.navigateTo({ url: '/pages/decision/decision' });
  },

  getChallengeSummary() {
    const challenge = storage.getDailyChallenge();
    return {
      todayChecked: storage.isTodayChecked(),
      streak: challenge.streak,
      total: challenge.total
    };
  },

  onShareAppMessage() {
    return {
      title: '万能生活清单助手：出门、搬家、装修都不怕漏',
      path: '/pages/index/index'
    };
  }
});
