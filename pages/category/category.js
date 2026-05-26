const { categories, getCategoryById, getTemplatesByCategory } = require('../../data/templates');

Page({
  data: {
    categories,
    activeCategory: 'travel',
    activeCategoryInfo: categories[0],
    templates: []
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
    this.loadCategory(id);
  },

  loadCategory(id) {
    const info = getCategoryById(id) || categories[0];
    this.setData({
      activeCategory: info.id,
      activeCategoryInfo: info,
      templates: getTemplatesByCategory(info.id)
    });
  },

  goChecklist(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/checklist/checklist?id=${id}` });
  }
});
