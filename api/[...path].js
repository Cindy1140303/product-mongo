// Vercel Serverless Function 包裝器
// 這個檔案會處理所有 /api/* 請求並轉發到 Express app

const app = require('../server');

module.exports = app;
