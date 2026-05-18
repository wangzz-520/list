const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

function normalizeShareId(value) {
  return String(value || '').trim();
}

exports.main = async (event = {}) => {
  const shareId = normalizeShareId(event.shareId);
  if (!shareId) {
    return { ok: false, error: 'EMPTY_SHARE_ID' };
  }

  try {
    const result = await cloud.openapi.wxacode.getUnlimited({
      scene: shareId,
      page: 'pages/checklist/checklist',
      checkPath: false,
      width: 280
    });

    if (!result || !result.buffer) {
      return {
        ok: false,
        error: 'EMPTY_QR_BUFFER',
        raw: {
          errCode: result && result.errCode,
          errMsg: result && result.errMsg
        }
      };
    }

    const base64 = result.buffer.toString('base64');

    return {
      ok: true,
      mimeType: 'image/png',
      base64
    };
  } catch (error) {
    console.error('getShareQrCode failed:', error);
    return {
      ok: false,
      error: error.message || String(error),
      errCode: error.errCode || error.code || '',
      errMsg: error.errMsg || ''
    };
  }
};
