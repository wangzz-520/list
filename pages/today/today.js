const { findTemplateById, getAllTemplates } = require('../../data/templates');
const storage = require('../../utils/storage');
const { normalizeGroups, calcProgress } = require('../../utils/checklist');

function resolveList(id) {
  if (!id) return null;
  if (id.startsWith('custom_')) {
    return storage.getCustomList(id);
  }
  return findTemplateById(id);
}

function buildProgress(source, draft) {
  const groups = normalizeGroups(source.groups || [], draft || {});
  return calcProgress(groups);
}

Page({
  data: {
    todayKey: '',
    pendingLists: [],
    pinnedLists: [],
    completedToday: [],
    emptyText: '今天还没有进行中的清单'
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const drafts = storage.getDrafts();
    const allTemplates = getAllTemplates();
    const pinnedLists = storage.getPinnedTemplates()
      .map(id => allTemplates.find(item => item.id === id))
      .filter(Boolean)
      .map(item => ({ ...item, tag: '常用' }));

    const pendingLists = Object.keys(drafts).map(id => {
      const source = resolveList(id);
      if (!source) return null;
      const progress = buildProgress(source, drafts[id]);
      if (progress.done <= 0 || progress.percent >= 100) return null;
      return {
        id,
        title: source.title,
        icon: source.icon || '✅',
        description: source.description || '继续完成这张清单',
        progress,
        tag: `${progress.done}/${progress.total}`
      };
    }).filter(Boolean).sort((a, b) => b.progress.percent - a.progress.percent).slice(0, 8);

    const todayKey = storage.getTodayKey();
    const completedToday = storage.getCompletedLists()
      .filter(item => item.completedDate === todayKey)
      .slice(0, 8);
    this.setData({
      todayKey,
      pendingLists,
      pinnedLists,
      completedToday
    });
  },

  goChecklist(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/checklist/checklist?id=${id}` });
  },

  onShareAppMessage() {
    return {
      title: '今日要做：把生活清单一项项完成',
      path: '/pages/today/today'
    };
  }
});
