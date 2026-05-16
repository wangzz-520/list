const { categories, getCategoryById, getTemplatesByCategory, searchTemplates } = require('../../data/templates');
const cloudApi = require('../../utils/cloudApi');

Page({
  data: {
    keyword: '',
    categories,
    activeCategory: 'travel',
    activeCategoryInfo: categories[0],
    templates: [],
    searchResults: [],
    cloudEnabled: false
  },

  onShow() {
    const pending = wx.getStorageSync('life_checklist_v1_pending_category');
    if (pending) {
      wx.removeStorageSync('life_checklist_v1_pending_category');
      this.loadCategory(pending);
      return;
    }
    this.loadCategory(this.data.activeCategory);
  },

  selectCategory(event) {
    const id = event.currentTarget.dataset.id;
    this.setData({ keyword: '', searchResults: [] });
    this.loadCategory(id);
  },

  onSearchInput(event) {
    const keyword = event.detail.value;
    this.setData({
      keyword,
      searchResults: keyword ? searchTemplates(keyword).slice(0, 30) : []
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

  loadCategory(id) {
    const info = getCategoryById(id) || categories[0];
    this.setData({
      activeCategory: info.id,
      activeCategoryInfo: info,
      templates: getTemplatesByCategory(info.id),
      cloudEnabled: cloudApi.isCloudReady()
    });
    this.loadCloudCategory(info.id);
  },

  async loadCloudCategory(categoryId) {
    const rows = await cloudApi.getTemplates({ category: categoryId, sortByHot: true, limit: 50 });
    if (!rows || rows.length === 0) return;
    if (this.data.activeCategory === categoryId) {
      this.setData({ templates: rows });
    }
  },

  goChecklist(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/checklist/checklist?id=${id}` });
  }
});
