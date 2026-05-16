const storage = require('../../utils/storage');

function createOption(text = '') {
  return {
    id: `option_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    text
  };
}

function cleanOptions(options) {
  return (options || [])
    .map(item => String(item.text || '').trim())
    .filter(Boolean)
    .slice(0, 20);
}

Page({
  data: {
    title: '',
    options: [createOption(), createOption()],
    result: '',
    history: [],
    quickSets: [
      { name: '今天吃什么', options: ['米饭套餐', '面条', '轻食', '自己做饭'] },
      { name: '周末安排', options: ['在家整理', '出门走走', '看电影', '见朋友'] },
      { name: '先做哪件事', options: ['最紧急的', '最简单的', '最耗时的', '最想拖的'] }
    ]
  },

  onShow() {
    this.refreshHistory();
  },

  refreshHistory() {
    this.setData({ history: storage.getDecisionHistory() });
  },

  onTitleInput(event) {
    this.setData({ title: event.detail.value });
  },

  onOptionInput(event) {
    const index = Number(event.currentTarget.dataset.index);
    const options = this.data.options.slice();
    options[index] = {
      ...options[index],
      text: event.detail.value
    };
    this.setData({ options, result: '' });
  },

  addOption() {
    if (this.data.options.length >= 20) {
      wx.showToast({ title: '最多添加 20 个选项', icon: 'none' });
      return;
    }
    this.setData({
      options: this.data.options.concat(createOption()),
      result: ''
    });
  },

  removeOption(event) {
    const index = Number(event.currentTarget.dataset.index);
    if (this.data.options.length <= 2) {
      wx.showToast({ title: '至少保留 2 个选项', icon: 'none' });
      return;
    }
    const options = this.data.options.slice();
    options.splice(index, 1);
    this.setData({ options, result: '' });
  },

  useQuickSet(event) {
    const index = Number(event.currentTarget.dataset.index);
    const preset = this.data.quickSets[index];
    if (!preset) return;
    this.setData({
      title: preset.name,
      options: preset.options.map(text => createOption(text)),
      result: ''
    });
  },

  chooseOne() {
    const options = cleanOptions(this.data.options);
    if (options.length < 2) {
      wx.showToast({ title: '请至少填写 2 个选项', icon: 'none' });
      return;
    }
    const result = options[Math.floor(Math.random() * options.length)];
    const title = String(this.data.title || '').trim() || '临时选择';
    storage.addDecisionHistory({ title, result, options });
    this.setData({ result });
    this.refreshHistory();
  },

  resetOptions() {
    this.setData({
      title: '',
      options: [createOption(), createOption()],
      result: ''
    });
  },

  clearHistory() {
    wx.showModal({
      title: '清空选择记录',
      content: '最近选择记录会被清空，确定继续吗？',
      success: res => {
        if (!res.confirm) return;
        storage.clearDecisionHistory();
        this.refreshHistory();
        wx.showToast({ title: '已清空', icon: 'success' });
      }
    });
  },

  onShareAppMessage() {
    return {
      title: '选择困难症助手：帮你快速定下来',
      path: '/pages/decision/decision'
    };
  }
});
