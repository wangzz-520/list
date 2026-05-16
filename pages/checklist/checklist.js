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
    shareId: '',
    originalGroups: [],
    groups: [],
    progress: { total: 0, done: 0, percent: 0 },
    progressLabel: '完成进度',
    checkedCellClass: 'task-done',
    checkedTextClass: 'text-done',
    isFavorite: false,
    isPinned: false,
    isCustom: false,
    isShared: false,
    primaryCopyText: '复制为我的清单',
    newItemText: '',
    addGroupIndex: 0,
    groupOptions: [],
    cloudEnabled: false
  },

  onLoad(options) {
    if (options.shareId) {
      this.loadSharedChecklist(options.shareId);
      return;
    }
    this.loadChecklist(options.id);
  },

  async loadSharedChecklist(shareId) {
    const source = await cloudApi.getShareList(shareId);
    if (!source) {
      wx.showToast({ title: '共享清单不存在', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 800);
      return;
    }

    const listId = `share_${source.id}`;
    const draft = storage.getDraft(listId);
    const groups = normalizeGroups(source.groups, draft);
    const progress = calcProgress(groups);

    storage.addRecent({ id: listId, title: source.title, icon: source.icon });
    wx.setNavigationBarTitle({ title: source.title });

    this.setData({
      listId,
      shareId: source.id,
      title: source.title,
      icon: source.icon || '✅',
      description: '来自好友分享的清单快照。',
      originalGroups: source.groups || [],
      groups,
      progress,
      progressLabel: '完成进度',
      checkedCellClass: 'task-done',
      checkedTextClass: 'text-done',
      addGroupIndex: 0,
      groupOptions: groups.map(group => group.name),
      isFavorite: false,
      isPinned: false,
      isCustom: false,
      isShared: true,
      primaryCopyText: '复制分享清单',
      cloudEnabled: cloudApi.isCloudReady()
    });
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
      shareId: '',
      title: source.title,
      icon: source.icon || '✅',
      description: source.description || '',
      originalGroups: source.groups || [],
      groups,
      progress,
      progressLabel: isCustom ? '完成进度' : '已选择',
      checkedCellClass: isCustom ? 'task-done' : 'task-selected',
      checkedTextClass: isCustom ? 'text-done' : '',
      addGroupIndex: 0,
      groupOptions: groups.map(group => group.name),
      isFavorite: storage.isFavorite(source.id),
      isPinned: storage.isPinnedTemplate(source.id),
      isCustom,
      isShared: false,
      primaryCopyText: isCustom ? '复制当前清单' : '生成我的清单',
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
      progress: calcProgress(groups),
      groupOptions: groups.map(group => group.name),
      addGroupIndex: Math.min(this.data.addGroupIndex || 0, Math.max(groups.length - 1, 0))
    });
  },

  handleCompletion(previousProgress, groups) {
    if (!this.data.isCustom && !this.data.isShared) {
      return;
    }
    const progress = calcProgress(groups);
    if (progress.total === 0 || progress.percent < 100 || previousProgress.percent >= 100) {
      return;
    }
    storage.markListCompleted({
      id: this.data.listId,
      shareId: this.data.shareId,
      title: this.data.title,
      icon: this.data.icon,
      progress
    });
    wx.showToast({
      title: '清单完成',
      icon: 'success'
    });
  },

  toggleItem(event) {
    const groupIndex = Number(event.currentTarget.dataset.groupIndex);
    const itemIndex = Number(event.currentTarget.dataset.itemIndex);
    const previousProgress = this.data.progress;
    const groups = clone(this.data.groups);
    const task = groups[groupIndex].items[itemIndex];
    task.checked = !task.checked;
    this.persistFromGroups(groups);
    this.refresh(groups);
    this.handleCompletion(previousProgress, groups);
  },

  onNewItemInput(event) {
    this.setData({ newItemText: event.detail.value });
  },

  onAddGroupChange(event) {
    this.setData({ addGroupIndex: Number(event.detail.value || 0) });
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

    const targetIndex = Math.min(this.data.addGroupIndex || 0, groups.length - 1);
    const groupId = groups[targetIndex].id;
    const newItem = {
      id: `custom_${Date.now()}`,
      text,
      checked: false,
      custom: true
    };
    groups[targetIndex].items.push(newItem);

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
        const previousProgress = this.data.progress;
        storage.saveDraft(this.data.listId, draft);
        this.refresh(groups);
        this.handleCompletion(previousProgress, groups);
      }
    });
  },

  toggleFavorite() {
    const result = storage.toggleFavorite(this.data.listId);
    this.setData({ isFavorite: result });
    wx.showToast({ title: result ? '已收藏' : '已取消', icon: 'none' });
  },

  togglePinned() {
    if (this.data.isCustom) {
      wx.showToast({ title: '自定义清单不用置顶', icon: 'none' });
      return;
    }
    if (this.data.isShared) {
      wx.showToast({ title: '共享清单不能设常用', icon: 'none' });
      return;
    }
    const result = storage.togglePinnedTemplate(this.data.listId);
    this.setData({ isPinned: result });
    wx.showToast({ title: result ? '已设为常用' : '已取消常用', icon: 'none' });
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

  buildCustomGroups(sourceGroups, options = {}) {
    const onlySelected = !!options.onlySelected;
    return (sourceGroups || []).map((group, groupIndex) => {
      const items = (group.items || [])
        .filter(item => {
          if (!onlySelected) return true;
          if (typeof item === 'string') return false;
          return !!item.checked || !!item.custom;
        })
        .map(item => ({
          id: `item_${Date.now()}_${Math.floor(Math.random() * 100000)}`,
          text: typeof item === 'string' ? item : item.text,
          custom: true
        }));
      return {
        id: `group_${groupIndex}_${Date.now()}`,
        name: group.name,
        items
      };
    }).filter(group => group.items.length > 0);
  },

  copyChecklist() {
    const isTemplate = !this.data.isCustom && !this.data.isShared;
    const sourceGroups = this.data.groups;
    const groups = this.buildCustomGroups(sourceGroups, { onlySelected: isTemplate });
    if (isTemplate && groups.length === 0) {
      wx.showToast({ title: '请先勾选要生成的事项', icon: 'none' });
      return;
    }
    const id = `custom_${Date.now()}`;
    const title = isTemplate ? `我的${this.data.title}` : `${this.data.title} 副本`;
    storage.saveCustomList({
      id,
      title,
      icon: this.data.icon || '✅',
      category: 'custom',
      description: isTemplate
        ? '从模板快速生成的我的清单，可继续编辑、勾选和分享。'
        : '从已有清单复制生成，可继续编辑、勾选和分享。',
      groups
    });
    wx.showToast({ title: isTemplate ? '已生成' : '已复制', icon: 'success' });
    setTimeout(() => {
      wx.navigateTo({ url: `/pages/checklist/checklist?id=${id}` });
    }, 400);
  },

  async createCloudShare() {
    if (this.data.shareId) {
      return this.data.shareId;
    }
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
    if (cloudApi.isCloudReady()) {
      return {
        title: `${this.data.title}｜万能生活清单助手`,
        path: `/pages/checklist/checklist?id=${this.data.listId}`,
        promise: this.createCloudShare().then(shareId => ({
          title: `${this.data.title}｜万能生活清单助手`,
          path: shareId
            ? `/pages/checklist/checklist?shareId=${shareId}`
            : `/pages/checklist/checklist?id=${this.data.listId}`
        }))
      };
    }
    return {
      title: `${this.data.title}｜万能生活清单助手`,
      path: `/pages/checklist/checklist?id=${this.data.listId}`
    };
  }
});
