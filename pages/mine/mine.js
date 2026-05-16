const { findTemplateById, getAllTemplates } = require('../../data/templates');
const storage = require('../../utils/storage');
const cloudApi = require('../../utils/cloudApi');
const cloudSync = require('../../utils/cloudSync');

function formatTime(ts) {
  if (!ts) return '尚未同步';
  const date = new Date(ts);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hour}:${minute}`;
}

function cloneGroups(groups) {
  return (groups || []).map((group, groupIndex) => ({
    id: `group_${groupIndex}_${Date.now()}`,
    name: group.name,
    items: (group.items || []).map((item, itemIndex) => ({
      id: `item_${Date.now()}_${groupIndex}_${itemIndex}`,
      text: typeof item === 'string' ? item : item.text,
      custom: true
    }))
  }));
}

function resolveSource(id) {
  if (!id) return null;
  if (id.startsWith('custom_')) return storage.getCustomList(id);
  if (id.startsWith('share_')) return null;
  return findTemplateById(id);
}

Page({
  data: {
    customLists: [],
    completedLists: [],
    pinnedTemplates: [],
    stats: {},
    feedbackText: '',
    cloudEnabled: false,
    syncStatusText: '本地模式',
    syncDesc: '当前使用本地缓存',
    lastSyncText: '尚未同步',
    syncing: false
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const customLists = storage.getCustomLists();
    const completedLists = storage.getCompletedLists().slice(0, 10);
    const allTemplates = getAllTemplates();
    const pinnedTemplates = storage.getPinnedTemplates()
      .map(id => allTemplates.find(item => item.id === id))
      .filter(Boolean);
    const cloudEnabled = cloudApi.isCloudReady();

    this.setData({
      customLists,
      completedLists,
      pinnedTemplates,
      stats: {
        customCount: customLists.length,
        completedCount: completedLists.length,
        pinnedCount: pinnedTemplates.length
      },
      cloudEnabled,
      syncStatusText: cloudEnabled ? '云同步可用' : '本地模式',
      syncDesc: cloudEnabled
        ? `云同步可用，最近同步：${formatTime(storage.getLastCloudSyncAt())}`
        : '当前使用本地缓存，配置云环境后可同步',
      lastSyncText: cloudEnabled ? formatTime(storage.getLastCloudSyncAt()) : '未启用云同步'
    });
  },

  goChecklist(event) {
    const id = event.currentTarget.dataset.id;
    const shareId = event.currentTarget.dataset.shareId;
    if (shareId) {
      wx.navigateTo({ url: `/pages/checklist/checklist?shareId=${shareId}` });
      return;
    }
    wx.navigateTo({ url: `/pages/checklist/checklist?id=${id}` });
  },

  goDecision() {
    wx.navigateTo({ url: '/pages/decision/decision' });
  },

  copyList(event) {
    const id = event.currentTarget.dataset.id;
    const source = resolveSource(id);
    if (!source) {
      wx.showToast({ title: '当前清单暂不支持复制', icon: 'none' });
      return;
    }

    const listId = `custom_${Date.now()}`;
    storage.saveCustomList({
      id: listId,
      title: `${source.title} 副本`,
      icon: source.icon || '✅',
      category: 'custom',
      description: '从已有清单复制生成，可继续编辑、勾选和分享。',
      groups: cloneGroups(source.groups)
    });
    wx.showToast({ title: '已复制', icon: 'success' });
    setTimeout(() => {
      wx.navigateTo({ url: `/pages/checklist/checklist?id=${listId}` });
    }, 350);
  },

  removeCustom(event) {
    const id = event.currentTarget.dataset.id;
    const target = this.data.customLists.find(item => item.id === id);
    wx.showModal({
      title: '删除清单',
      content: `确定删除「${target ? target.title : '这张清单'}」吗？删除后不可恢复。`,
      confirmColor: '#d93f3f',
      success: res => {
        if (!res.confirm) return;
        storage.removeCustomList(id);
        this.refresh();
        wx.showToast({ title: '已删除', icon: 'success' });
      }
    });
  },

  unpinTemplate(event) {
    const id = event.currentTarget.dataset.id;
    const target = this.data.pinnedTemplates.find(item => item.id === id);
    wx.showModal({
      title: '取消常用',
      content: `确定将「${target ? target.title : '这张清单'}」移出常用吗？`,
      success: res => {
        if (!res.confirm) return;
        storage.togglePinnedTemplate(id);
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
      wx.showToast({ title: '当前为本地模式', icon: 'none' });
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
      content: '收藏、常用、最近完成、自定义清单和勾选记录都会清空。请谨慎操作。',
      confirmColor: '#d93f3f',
      success: res => {
        if (!res.confirm) return;
        storage.clearAllUserData();
        this.refresh();
        wx.showToast({ title: '已清空', icon: 'success' });
      }
    });
  }
});
