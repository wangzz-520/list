const cloudApi = require('../../utils/cloudApi');

function formatTime(value) {
  if (!value) return '未知时间';
  const date = typeof value === 'number' ? new Date(value) : new Date(value);
  if (Number.isNaN(date.getTime())) return '未知时间';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${month}-${day} ${hour}:${minute}`;
}

Page({
  data: {
    checking: true,
    isAdmin: false,
    feedbackLoading: false,
    feedbacks: []
  },

  onLoad() {
    this.checkAdmin();
  },

  async checkAdmin() {
    const result = await cloudApi.getAdminState();
    const isAdmin = !!(result && result.isAdmin);
    this.setData({ checking: false, isAdmin });
    if (isAdmin) this.loadFeedbacks();
  },

  async loadFeedbacks() {
    this.setData({ feedbackLoading: true });
    const rows = await cloudApi.getAdminFeedbacks({ limit: 50 });
    this.setData({
      feedbackLoading: false,
      feedbacks: rows.map(item => ({
        ...item,
        timeText: formatTime(item.createdAt)
      }))
    });
  }
});
