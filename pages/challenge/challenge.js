const storage = require('../../utils/storage');

function formatWeekday(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`);
  const labels = ['日', '一', '二', '三', '四', '五', '六'];
  return labels[date.getDay()];
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function buildRecentDays(checkedDates) {
  const rows = [];
  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - index);
    const key = formatDate(date);
    rows.push({
      key,
      day: key.slice(5),
      weekday: formatWeekday(key),
      checked: !!checkedDates[key]
    });
  }
  return rows;
}

Page({
  data: {
    todayKey: '',
    todayChecked: false,
    streak: 0,
    total: 0,
    recentDays: [],
    encourageText: ''
  },

  onShow() {
    this.refresh();
  },

  refresh() {
    const challenge = storage.getDailyChallenge();
    const todayChecked = storage.isTodayChecked();
    this.setData({
      todayKey: storage.getTodayKey(),
      todayChecked,
      streak: challenge.streak,
      total: challenge.total,
      recentDays: buildRecentDays(challenge.checkedDates || {}),
      encourageText: todayChecked ? '今天已经完成，明天继续保持。' : '完成任意一个生活清单动作，就可以打卡。'
    });
  },

  checkIn() {
    if (this.data.todayChecked) {
      wx.showToast({ title: '今天已经打卡', icon: 'none' });
      return;
    }
    storage.checkInToday();
    this.refresh();
    wx.showToast({ title: '打卡成功', icon: 'success' });
  },

  resetChallenge() {
    wx.showModal({
      title: '清空打卡记录',
      content: '连续天数和累计天数都会清空，确定继续吗？',
      success: res => {
        if (!res.confirm) return;
        storage.resetDailyChallenge();
        this.refresh();
        wx.showToast({ title: '已清空', icon: 'success' });
      }
    });
  },

  onShareAppMessage() {
    return {
      title: `我已连续打卡 ${this.data.streak || 0} 天，一起防遗漏`,
      path: '/pages/challenge/challenge'
    };
  }
});
