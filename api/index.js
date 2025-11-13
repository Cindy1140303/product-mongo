// Vercel Serverless Function
// 處理所有 /api/* 請求

const app = require('../server');

// Vercel 需要一個處理函數
module.exports = async (req, res) => {
  // 確保 URL 以 /api 開頭，因為 Express 路由需要它
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  
  // 讓 Express 處理請求
  return app(req, res);
};
