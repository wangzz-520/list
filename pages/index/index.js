const {
  categories,
  getAllTemplates,
  getTemplatesByCategory
} = require('../../data/templates');
const storage = require('../../utils/storage');

Page({
  data: {
    pinnedTemplates: [],
    templateSections: []
  },

  onShow() {
    const allTemplates = getAllTemplates();
    const pinnedIds = storage.getPinnedTemplates();
    const pinnedTemplates = pinnedIds
      .map(id => allTemplates.find(item => item.id === id))
      .filter(Boolean)
      .slice(0, 4);
    const templateSections = categories.slice(0, 4).map(category => {
      const rows = getTemplatesByCategory(category.id)
        .sort((a, b) => b.heat - a.heat);
      return {
        ...category,
        total: rows.length,
        templates: rows.slice(0, 2)
      };
    }).filter(section => section.templates.length > 0);

    this.setData({
      pinnedTemplates,
      templateSections
    });
  },

  goCategory(event) {
    const id = event.currentTarget.dataset.id;
    wx.switchTab({ url: '/pages/category/category' });
    if (id) {
      wx.setStorageSync('life_checklist_v1_pending_category', id);
    }
  },

  goChecklist(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/checklist/checklist?id=${id}` });
  },

  goMine() {
    wx.switchTab({ url: '/pages/mine/mine' });
  },

  goDecision() {
    wx.navigateTo({ url: '/pages/decision/decision' });
  },

  onShareAppMessage() {
    return {
      title: '万能生活清单助手：出门、搬家、待产都不怕漏',
      path: '/pages/index/index'
    };
  }
});
