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

function buildChecklistItems(options) {
  return options.map((text, index) => ({
    id: `item_${Date.now()}_${index}_${Math.floor(Math.random() * 1000)}`,
    text,
    custom: true
  }));
}

Page({
  data: {
    title: '',
    options: [createOption(), createOption()],
    result: '',
    excludeLastResult: false,
    history: [],
    quickSets: [
      {
        name: '吃什么',
        title: '今天吃什么',
        options: ['米饭套餐', '面条/粉', '轻食沙拉', '火锅/麻辣烫', '自己做饭', '外卖随便点']
      },
      {
        name: '去哪玩',
        title: '今天去哪玩',
        options: ['公园散步', '商场逛逛', '看电影', '咖啡馆坐坐', '近郊短途', '在家休息']
      },
      {
        name: '先做哪件事',
        title: '先做哪件事',
        options: ['先做最重要的', '先做最简单的', '先做最耗时的', '先处理最拖延的', '先做能立刻完成的']
      }
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

  onExcludeChange(event) {
    this.setData({ excludeLastResult: Boolean(event.detail.value) });
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
      title: preset.title,
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

    const lastResult = this.data.result || (this.data.history[0] && this.data.history[0].result);
    const candidates = this.data.excludeLastResult && lastResult
      ? options.filter(text => text !== lastResult)
      : options;
    const pool = candidates.length > 0 ? candidates : options;
    const result = pool[Math.floor(Math.random() * pool.length)];
    const title = String(this.data.title || '').trim() || '临时选择';

    storage.addDecisionHistory({ title, result, options });
    this.setData({ result });
    this.refreshHistory();
  },

  saveAsChecklist() {
    const options = cleanOptions(this.data.options);
    if (options.length < 1) {
      wx.showToast({ title: '请先填写选项', icon: 'none' });
      return;
    }

    const title = String(this.data.title || '').trim() || '选择清单';
    const id = `custom_${Date.now()}`;
    storage.saveCustomList({
      id,
      title: title.includes('清单') ? title : `${title}选择清单`,
      icon: '🎲',
      category: 'custom',
      description: '从选择困难症助手保存的候选清单，可继续勾选和复用。',
      groups: [
        {
          id: 'decision_options',
          name: '候选选项',
          items: buildChecklistItems(options)
        }
      ]
    });

    wx.showToast({ title: '已保存', icon: 'success' });
    setTimeout(() => {
      wx.navigateTo({ url: `/pages/checklist/checklist?id=${id}` });
    }, 350);
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
