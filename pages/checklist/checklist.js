const { findTemplateById } = require('../../data/templates');
const storage = require('../../utils/storage');
const cloudApi = require('../../utils/cloudApi');
const { normalizeGroups, calcProgress, clone } = require('../../utils/checklist');

Page({
  data: {
    listId: '',
    title: '',
    icon: '✅',
    description: '',
    originalGroups: [],
    groups: [],
    progress: { total: 0, done: 0, percent: 0 },
    isFavorite: false,
    isCustom: false,
    newItemText: '',
    cloudEnabled: false
  },

  onLoad(options) {
    const id = options.id;
    this.loadChecklist(id);
  },

  async loadChecklist(id) {
    if (!id) {
      wx.showToast({ title: '清单不存在', icon: 'none' });
      return;
    }

    let source = null;
    let isCustom = false;

    if (id.startsWith('custom_')) {
      source = storage.getCustomList(id);
      isCustom = true;
    } else {
      source = findTemplateById(id);
      const cloudSource = await cloudApi.getTemplateById(id);
      if (cloudSource) source = cloudSource;
    }

    if (!source) {
      wx.showToast({ title: '清单不存在', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 800);
      return;
    }

    const draft = storage.getDraft(id);
    const groups = normalizeGroups(source.groups, draft);
    const progress = calcProgress(groups);

    storage.addRecent({ id: source.id, title: source.title, icon: source.icon });
    wx.setNavigationBarTitle({ title: source.title });

    this.setData({
      listId: source.id,
      title: source.title,
      icon: source.icon || '✅',
      description: source.description || '',
      originalGroups: source.groups || [],
      groups,
      progress,
      isFavorite: storage.isFavorite(source.id),
      isCustom,
      cloudEnabled: cloudApi.isCloudReady()
    });
  },

  persistFromGroups(groups) {
    const checkedMap = {};
    groups.forEach(group => {
      (group.items || []).forEach(item => {
        if (item.checked) checkedMap[item.id] = true;
      });
    });
    const draft = storage.getDraft(this.data.listId);
    draft.checkedMap = checkedMap;
    storage.saveDraft(this.data.listId, draft);
  },

  refresh(groups) {
    this.setData({
      groups,
      progress: calcProgress(groups)
    });
  },

  toggleItem(event) {
    const groupIndex = Number(event.currentTarget.dataset.groupIndex);
    const itemIndex = Number(event.currentTarget.dataset.itemIndex);
    const groups = clone(this.data.groups);
    const task = groups[groupIndex].items[itemIndex];
    task.checked = !task.checked;
    this.persistFromGroups(groups);
    this.refresh(groups);
  },

  onNewItemInput(event) {
    this.setData({ newItemText: event.detail.value });
  },

  addItem() {
    const text = String(this.data.newItemText || '').trim();
    if (!text) {
      wx.showToast({ title: '请输入事项内容', icon: 'none' });
      return;
    }

    const groups = clone(this.data.groups);
    if (groups.length === 0) {
      groups.push({ id: 'default', name: '自定义事项', items: [] });
    }

    const groupId = groups[0].id;
    const newItem = {
      id: `custom_${Date.now()}`,
      text,
      checked: false,
      custom: true
    };
    groups[0].items.push(newItem);

    const draft = storage.getDraft(this.data.listId);
    draft.extraItemsByGroup = draft.extraItemsByGroup || {};
    draft.extraItemsByGroup[groupId] = draft.extraItemsByGroup[groupId] || [];
    draft.extraItemsByGroup[groupId].push(newItem);
    storage.saveDraft(this.data.listId, draft);

    this.setData({ newItemText: '' });
    this.refresh(groups);
    wx.showToast({ title: '已添加', icon: 'success' });
  },

  deleteItem(event) {
    const groupIndex = Number(event.currentTarget.dataset.groupIndex);
    const itemIndex = Number(event.currentTarget.dataset.itemIndex);
    const groups = clone(this.data.groups);
    const task = groups[groupIndex].items[itemIndex];
    const groupId = groups[groupIndex].id;

    wx.showModal({
      title: '删除事项',
      content: `确定删除“${task.text}”吗？`,
      success: res => {
        if (!res.confirm) return;
        groups[groupIndex].items.splice(itemIndex, 1);

        const draft = storage.getDraft(this.data.listId);
        draft.deletedIds = draft.deletedIds || [];
        draft.extraItemsByGroup = draft.extraItemsByGroup || {};

        if (task.custom) {
          const extras = draft.extraItemsByGroup[groupId] || [];
          draft.extraItemsByGroup[groupId] = extras.filter(item => item.id !== task.id);
        } else {
          draft.deletedIds.push(task.id);
        }

        if (draft.checkedMap) delete draft.checkedMap[task.id];
        storage.saveDraft(this.data.listId, draft);
        this.refresh(groups);
      }
    });
  },

  toggleFavorite() {
    const result = storage.toggleFavorite(this.data.listId);
    this.setData({ isFavorite: result });
    wx.showToast({ title: result ? '已收藏' : '已取消', icon: 'none' });
  },

  resetChecklist() {
    wx.showModal({
      title: '重置清单',
      content: this.data.isCustom ? '将清空勾选状态，自定义清单内容会保留。' : '将恢复模板初始状态，自定义添加的事项会被清除。',
      success: res => {
        if (!res.confirm) return;
        storage.clearDraft(this.data.listId);
        this.loadChecklist(this.data.listId);
        wx.showToast({ title: '已重置', icon: 'success' });
      }
    });
  },

  async createCloudShare() {
    const result = await cloudApi.createShareList({
      sourceId: this.data.listId,
      title: this.data.title,
      icon: this.data.icon,
      groups: this.data.groups
    });
    if (result && result.ok && result.shareId) {
      wx.showToast({ title: '共享清单已生成', icon: 'success' });
      return result.shareId;
    }
    wx.showToast({ title: '共享失败，已使用普通转发', icon: 'none' });
    return '';
  },

  onShareAppMessage() {
    return {
      title: `${this.data.title}｜万能生活清单助手`,
      path: `/pages/checklist/checklist?id=${this.data.listId}`
    };
  }
});
