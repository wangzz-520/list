const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

exports.main = async (event = {}) => {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const content = String(event.content || '').trim().slice(0, 500);
  if (!openid) return { ok: false, error: 'OPENID_NOT_FOUND' };
  if (!content) return { ok: false, error: 'EMPTY_CONTENT' };

  try {
    const result = await db.collection('feedbacks').add({
      data: {
        _openid: openid,
        content,
        meta: event.meta || {},
        status: 'new',
        createdAt: db.serverDate()
      }
    });

    return { ok: true, id: result._id };
  } catch (error) {
    console.error('submitFeedback failed:', error);
    return { ok: false, error: error.message || String(error) };
  }
};
