const { findTemplateById, getAllTemplates } = require('../../data/templates');
const storage = require('../../utils/storage');

function formatListTime(ts) {
  if (!ts) return '刚刚生成';
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

function countListItems(list) {
  const groups = list.groups || [];
  let total = 0;
  groups.forEach(group => {
    (group.items || []).forEach(item => {
      if (!item) return;
      total += 1;
    });
  });
  return total;
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
    pinnedTemplates: [],
    stats: {},
    syncStatusText: '本地模式',
    syncDesc: '用户数据仅保存在本机缓存中',
    lastSyncText: '仅本机保存'
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const customLists = storage.getCustomLists()
      .slice()
      .sort((a, b) => Number(b.createdAt || b.updatedAt || 0) - Number(a.createdAt || a.updatedAt || 0))
      .map(item => ({
        ...item,
        generatedText: `生成于 ${formatListTime(item.createdAt || item.updatedAt)}`,
        itemCount: countListItems(item)
      }));
    const allTemplates = getAllTemplates();
    const pinnedTemplates = storage.getPinnedTemplates()
      .map(id => allTemplates.find(item => item.id === id))
      .filter(Boolean);
    this.setData({
      customLists,
      pinnedTemplates,
      stats: {
        customCount: customLists.length,
        pinnedCount: pinnedTemplates.length
      },
      syncStatusText: '本地模式',
      syncDesc: '用户数据仅保存在本机缓存中',
      lastSyncText: '仅本机保存'
    });
  },

  goChecklist(event) {
    const id = event.currentTarget.dataset.id;
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

  onShareAppMessage() {
    return {
      title: '万能生活清单助手：出门、搬家、待产都不怕漏',
      path: '/pages/index/index'
    };
  }
});
