const storage = require('../../utils/storage');

Page({
  data: {
    title: '',
    newItemText: '',
    items: []
  },

  onTitleInput(event) {
    this.setData({ title: event.detail.value });
  },

  onItemInput(event) {
    this.setData({ newItemText: event.detail.value });
  },

  addItem() {
    const text = String(this.data.newItemText || '').trim();
    if (!text) {
      wx.showToast({ title: '请输入事项', icon: 'none' });
      return;
    }
    const items = this.data.items.concat({
      id: `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      text,
      custom: false
    });
    this.setData({ items, newItemText: '' });
  },

  removeItem(event) {
    const index = Number(event.currentTarget.dataset.index);
    const items = this.data.items.slice();
    items.splice(index, 1);
    this.setData({ items });
  },

  saveList() {
    const title = String(this.data.title || '').trim();
    if (!title) {
      wx.showToast({ title: '请输入清单名称', icon: 'none' });
      return;
    }
    if (this.data.items.length === 0) {
      wx.showToast({ title: '请至少添加一条事项', icon: 'none' });
      return;
    }

    const id = `custom_${Date.now()}`;
    const list = {
      id,
      title,
      icon: '✅',
      category: 'custom',
      description: '你创建的自定义生活清单。',
      groups: [
        {
          id: 'default',
          name: '自定义事项',
          items: this.data.items
        }
      ]
    };

    storage.saveCustomList(list);
    this.setData({ title: '', newItemText: '', items: [] });
    wx.navigateTo({ url: `/pages/checklist/checklist?id=${id}` });
  }
});
