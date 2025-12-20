// Vercel Serverless Function
// 處理所有 /api 請求

const app = require('../server');

// Vercel serverless function 入口
module.exports = async (req, res) => {
  // 設定 CORS 標頭
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-User-Id, Content-Type, Authorization');

  // 處理 OPTIONS 請求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Vercel 會保留完整的請求路徑，包括 /api
  // 但為了確保，我們檢查並在需要時添加 /api 前綴
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  
  console.log('📥 收到請求:', req.method, req.url);
  
  // 將請求傳遞給 Express app
  return app(req, res);
};
