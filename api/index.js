// Vercel Serverless Function
// 處理所有 /api/* 請求

const app = require('../server');

// Vercel 需要一個處理函數，而不是直接導出 app
module.exports = async (req, res) => {
  // 移除 /api 前綴，因為 Vercel 會自動處理
  req.url = req.url.replace(/^\/api/, '') || '/';
  
  // 讓 Express 處理請求
  return app(req, res);
};
