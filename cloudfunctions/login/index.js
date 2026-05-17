const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

function createEmptyUserData() {
  return {
    schemaVersion: 1,
    drafts: {},
    favorites: [],
    pinnedTemplates: [],
    recents: [],
    completedLists: [],
    customLists: [],
    feedbacks: [],
    clientExportedAt: 0
  };
}

async function upsertUserLogin(wxContext) {
  const openid = wxContext.OPENID;
  if (!openid) return { ok: false, error: 'OPENID_NOT_FOUND' };

  const collection = db.collection('user_data');
  const existed = await collection.where({ _openid: openid }).limit(1).get();
  const loginData = {
    appid: wxContext.APPID || '',
    unionid: wxContext.UNIONID || '',
    lastLoginAt: db.serverDate()
  };

  if (existed.data && existed.data.length > 0) {
    await collection.doc(existed.data[0]._id).update({
      data: loginData
    });
    return { ok: true, status: 'updated' };
  }

  await collection.add({
    data: {
      _openid: openid,
      data: createEmptyUserData(),
      ...loginData,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
  });
  return { ok: true, status: 'created' };
}

exports.main = async () => {
  const wxContext = cloud.getWXContext();
  let userRecord = { ok: false, status: 'skipped' };
  try {
    userRecord = await upsertUserLogin(wxContext);
  } catch (error) {
    console.error('login upsert user_data failed:', error);
    userRecord = {
      ok: false,
      error: error.message || String(error)
    };
  }

  return {
    ok: true,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID || '',
    userRecord
  };
};
