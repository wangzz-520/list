const { findTemplateById } = require('../../data/templates');
const storage = require('../../utils/storage');
const cloudApi = require('../../utils/cloudApi');
const cloudSync = require('../../utils/cloudSync');
const { normalizeGroups, calcProgress, clone } = require('../../utils/checklist');

function leaveInvalidPage() {
  const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
  if (pages.length > 1) {
    wx.navigateBack({ delta: 1 });
    return;
  }
  wx.switchTab({ url: '/pages/index/index' });
}

function normalizeListName(value, fallback) {
  const text = String(value || '').trim();
  return text || fallback;
}

function flattenPosterItems(groups) {
  const rows = [];
  (groups || []).forEach(group => {
    rows.push({ type: 'group', text: group.name || '清单分组' });
    (group.items || []).forEach(item => {
      rows.push({
        type: 'item',
        text: typeof item === 'string' ? item : item.text
      });
    });
  });
  return rows;
}

function clipText(text, maxLength) {
  const value = String(text || '');
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

Page({
  data: {
    listId: '',
    loaded: false,
    title: '',
    listName: '',
    nameLabel: '生成后的清单名称',
    icon: '✓',
    description: '',
    shareId: '',
    originalGroups: [],
    groups: [],
    progress: { total: 0, done: 0, percent: 0 },
    progressLabel: '完成进度',
    checkedCellClass: 'task-done',
    checkedTextClass: 'text-done',
    isPinned: false,
    isCustom: false,
    isShared: false,
    primaryCopyText: '复制为我的清单',
    newItemText: '',
    addGroupIndex: 0,
    groupOptions: [],
    posterHeight: 1400,
    generating: false,
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
      setTimeout(leaveInvalidPage, 800);
      return;
    }

    const listId = `share_${source.id}`;
    const draft = storage.getDraft(listId);
    const groups = normalizeGroups(source.groups, draft);
    const progress = calcProgress(groups);

    storage.addRecent({ id: listId, title: source.title, icon: source.icon });
    wx.setNavigationBarTitle({ title: source.title });

    this.setData({
      loaded: true,
      listId,
      shareId: source.id,
      title: source.title,
      listName: `${source.title} 副本`,
      nameLabel: '复制后的清单名称',
      icon: source.icon || '✓',
      description: '来自好友分享的清单快照。',
      originalGroups: source.groups || [],
      groups,
      progress,
      progressLabel: '完成进度',
      checkedCellClass: 'task-done',
      checkedTextClass: 'text-done',
      addGroupIndex: 0,
      groupOptions: groups.map(group => group.name),
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
      setTimeout(leaveInvalidPage, 800);
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
      setTimeout(leaveInvalidPage, 800);
      return;
    }

    const draft = storage.getDraft(id);
    const groups = normalizeGroups(source.groups, draft);
    const progress = calcProgress(groups);

    storage.addRecent({ id: source.id, title: source.title, icon: source.icon });
    wx.setNavigationBarTitle({ title: source.title });

    this.setData({
      loaded: true,
      listId: source.id,
      shareId: '',
      title: source.title,
      listName: isCustom ? source.title : `我的${source.title}`,
      nameLabel: isCustom ? '清单名称' : '生成后的清单名称',
      icon: source.icon || '✓',
      description: source.description || '',
      originalGroups: source.groups || [],
      groups,
      progress,
      progressLabel: isCustom ? '完成进度' : '已选择',
      checkedCellClass: isCustom ? 'task-done' : 'task-selected',
      checkedTextClass: isCustom ? 'text-done' : '',
      addGroupIndex: 0,
      groupOptions: groups.map(group => group.name),
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
      title: '娓呭崟瀹屾垚',
      icon: 'success'
    });
  },

  toggleItem(event) {
    if (this.data.isCustom) {
      return;
    }
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

  onListNameInput(event) {
    this.setData({ listName: event.detail.value });
  },

  saveListName() {
    if (!this.data.isCustom) return;
    const title = normalizeListName(this.data.listName, this.data.title);
    const source = storage.getCustomList(this.data.listId);
    if (!source) return;
    storage.saveCustomList({
      ...source,
      title
    });
    storage.addRecent({ id: source.id, title, icon: source.icon || this.data.icon });
    this.setData({ title, listName: title });
    wx.setNavigationBarTitle({ title });
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
    if (event && typeof event.stopPropagation === 'function') {
      event.stopPropagation();
    }
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

        const previousProgress = this.data.progress;
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
        this.handleCompletion(previousProgress, groups);
      }
    });
  },

  togglePinned() {
    if (this.data.isCustom) {
      wx.showToast({ title: '自定义清单不用置顶', icon: 'none' });
      return;
    }
    if (this.data.isShared) {
      wx.showToast({ title: '共享清单不能设为常用', icon: 'none' });
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

  drawPosterText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    const chars = String(text || '').split('');
    const lines = [];
    let line = '';
    chars.forEach(char => {
      const testLine = line + char;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        lines.push(line);
        line = char;
      } else {
        line = testLine;
      }
    });
    if (line) lines.push(line);
    lines.slice(0, maxLines || lines.length).forEach((row, index) => {
      ctx.fillText(row, x, y + index * lineHeight);
    });
    return y + Math.min(lines.length, maxLines || lines.length) * lineHeight;
  },

  canvasToTempFilePath(height) {
    return new Promise((resolve, reject) => {
      wx.canvasToTempFilePath({
        canvasId: 'checklistPoster',
        width: 600,
        height,
        destWidth: 1200,
        destHeight: height * 2,
        success: res => resolve(res.tempFilePath),
        fail: reject
      }, this);
    });
  },

  saveImageToAlbum(filePath) {
    return new Promise(resolve => {
      wx.saveImageToPhotosAlbum({
        filePath,
        success: () => resolve(true),
        fail: error => {
          console.warn('save checklist image failed:', error);
          resolve(false);
        }
      });
    });
  },

  saveChecklistImage(list) {
    return new Promise(resolve => {
      const ctx = wx.createCanvasContext('checklistPoster', this);
      const rows = flattenPosterItems(list.groups || []);
      const itemCount = rows.filter(row => row.type === 'item').length;
      const maxRows = 80;
      const renderedRows = rows.slice(0, maxRows);
      const groupCount = renderedRows.filter(row => row.type === 'group').length;
      const rowCount = renderedRows.length - groupCount;
      const posterHeight = Math.max(900, 360 + groupCount * 50 + rowCount * 44 + 150);
      const footerY = posterHeight - 54;
      this.setData({ posterHeight });

      ctx.setFillStyle('#eef4ff');
      ctx.fillRect(0, 0, 600, posterHeight);

      ctx.setFillStyle('#dfeaff');
      ctx.beginPath();
      ctx.arc(520, 86, 110, 0, Math.PI * 2);
      ctx.fill();

      ctx.setFillStyle('#f8fbff');
      ctx.beginPath();
      ctx.arc(76, posterHeight - 160, 150, 0, Math.PI * 2);
      ctx.fill();

      ctx.setFillStyle('#ffffff');
      roundRect(ctx, 34, 34, 532, posterHeight - 68, 28);
      ctx.fill();

      const gradient = ctx.createLinearGradient(34, 34, 566, 196);
      gradient.addColorStop(0, '#2f6fed');
      gradient.addColorStop(1, '#6aa7ff');
      ctx.setFillStyle(gradient);
      roundRect(ctx, 34, 34, 532, 172, 28);
      ctx.fill();

      ctx.setFillStyle('rgba(255, 255, 255, 0.22)');
      ctx.beginPath();
      ctx.arc(492, 74, 64, 0, Math.PI * 2);
      ctx.fill();

      ctx.setFillStyle('#ffffff');
      roundRect(ctx, 58, 58, 62, 62, 16);
      ctx.fill();

      ctx.setFillStyle('#2f6fed');
      ctx.setFontSize(34);
      ctx.fillText(list.icon || '✓', 72, 101);

      ctx.setFillStyle('rgba(255, 255, 255, 0.86)');
      ctx.setFontSize(18);
      ctx.fillText('万能生活清单助手', 136, 80);

      ctx.setFillStyle('#ffffff');
      ctx.setFontSize(31);
      ctx.fillText(clipText(list.title, 14), 136, 120);

      ctx.setFillStyle('#172033');
      roundRect(ctx, 58, 232, 484, 74, 18);
      ctx.setFillStyle('#f5f8fd');
      ctx.fill();

      ctx.setFillStyle('#2f6fed');
      ctx.setFontSize(24);
      ctx.fillText(`${itemCount}`, 84, 278);

      ctx.setFillStyle('#75839a');
      ctx.setFontSize(18);
      ctx.fillText('个事项已整理好', 128, 276);

      ctx.setFillStyle('#19a974');
      roundRect(ctx, 408, 250, 108, 32, 16);
      ctx.fill();
      ctx.setFillStyle('#ffffff');
      ctx.setFontSize(16);
      ctx.fillText('可查看', 436, 272);

      let y = 348;
      let renderedItems = 0;
      renderedRows.forEach(row => {
        if (row.type === 'group') {
          y += 14;
          ctx.setFillStyle('#edf4ff');
          roundRect(ctx, 58, y - 24, 484, 38, 12);
          ctx.fill();
          ctx.setFillStyle('#2f6fed');
          ctx.setFontSize(19);
          ctx.fillText(clipText(row.text, 18), 76, y);
          y += 36;
          return;
        }

        ctx.setFillStyle('#ffffff');
        roundRect(ctx, 58, y - 24, 484, 42, 12);
        ctx.fill();

        ctx.setFillStyle('#172033');
        ctx.setFontSize(19);
        this.drawPosterText(ctx, clipText(row.text, 28), 76, y + 5, 430, 24, 1);
        y += 44;
        renderedItems += 1;
      });

      if (itemCount > renderedItems) {
        ctx.setFillStyle('#8793a8');
        ctx.setFontSize(18);
        ctx.fillText(`还有 ${itemCount - renderedItems} 项，请在小程序内查看`, 74, footerY - 28);
      }

      ctx.setFillStyle('#b2bfd3');
      ctx.setFontSize(16);
      ctx.fillText('保存图片后，也可在小程序中继续查看这份清单', 92, footerY);

      ctx.draw(false, () => {
        setTimeout(async () => {
          try {
            const filePath = await this.canvasToTempFilePath(posterHeight);
            const saved = await this.saveImageToAlbum(filePath);
            resolve(saved);
          } catch (error) {
            console.warn('create checklist image failed:', error);
            resolve(false);
          }
        }, 120);
      });
    });
  },

  async copyChecklist() {
    if (this.data.generating) return;
    const isTemplate = !this.data.isCustom && !this.data.isShared;
    const sourceGroups = this.data.groups;
    const groups = this.buildCustomGroups(sourceGroups, { onlySelected: isTemplate });
    if (isTemplate && groups.length === 0) {
      wx.showToast({ title: '请先勾选要生成的事项', icon: 'none' });
      return;
    }
    this.setData({ generating: true });
    const id = `custom_${Date.now()}`;
    const fallbackTitle = isTemplate ? `我的${this.data.title}` : `${this.data.title} 副本`;
    const title = normalizeListName(this.data.listName, fallbackTitle);
    const customList = {
      id,
      title,
      icon: this.data.icon || '✓',
      category: 'custom',
      description: isTemplate
        ? '从模板快速生成的我的清单，可继续查看和分享。'
        : '从已有清单复制生成，可继续查看和分享。',
      groups
    };
    storage.saveCustomList(customList);
    storage.addRecent({ id, title, icon: customList.icon });
    if (isTemplate) {
      const draft = storage.getDraft(this.data.listId);
      storage.saveDraft(this.data.listId, {
        ...draft,
        checkedMap: {}
      });
      const resetGroups = normalizeGroups(this.data.originalGroups, storage.getDraft(this.data.listId));
      this.refresh(resetGroups);
    }
    const syncResult = await cloudSync.saveCustomListNow(customList);
    if (!syncResult || syncResult.ok === false) {
      console.warn('custom checklist cloud sync skipped or failed:', syncResult);
      await cloudSync.pushNow();
    }
    const savedImage = await this.saveChecklistImage(customList);
    this.setData({ generating: false });
    wx.showToast({
      title: savedImage ? '已保存图片' : (isTemplate ? '已生成' : '已复制'),
      icon: 'success',
      duration: 700
    });
    setTimeout(() => {
      wx.switchTab({ url: '/pages/index/index' });
    }, 300);
  },

  buildChecklistShareText() {
    const lines = [`${this.data.icon || '✓'} ${this.data.title}`];
    (this.data.groups || []).forEach(group => {
      const items = group.items || [];
      if (items.length === 0) return;
      lines.push('', `【${group.name || '清单分组'}】`);
      items.forEach(item => {
        lines.push(`- ${typeof item === 'string' ? item : item.text}`);
      });
    });
    lines.push('', '来自：万能生活清单助手');
    return lines.join('\n');
  },

  copyChecklistText() {
    wx.setClipboardData({
      data: this.buildChecklistShareText(),
      success: () => {
        wx.showToast({ title: '清单内容已复制', icon: 'success' });
      }
    });
  },

  async createCloudShare() {
    if (this.data.shareId) return this.data.shareId;
    if (!cloudApi.isCloudReady()) return '';

    const result = await cloudApi.createShareList({
      sourceId: this.data.listId,
      title: this.data.title,
      icon: this.data.icon,
      description: this.data.description,
      groups: this.data.groups
    });

    if (result && result.ok && result.shareId) {
      this.setData({ shareId: result.shareId });
      return result.shareId;
    }
    return '';
  },

  onShareAppMessage() {
    const title = `我整理了一份「${this.data.title}」，看看有没有漏`;
    const fallbackPath = this.data.isCustom
      ? '/pages/index/index'
      : `/pages/checklist/checklist?id=${this.data.listId}`;

    if (cloudApi.isCloudReady()) {
      return {
        title,
        path: fallbackPath,
        promise: this.createCloudShare().then(shareId => ({
          title,
          path: shareId ? `/pages/checklist/checklist?shareId=${shareId}` : fallbackPath
        }))
      };
    }

    return {
      title,
      path: fallbackPath
    };
  }
});
