const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initializeFirebase } = require('./config/firebase');

// 載入環境變數
dotenv.config();

// 初始化 Firebase
initializeFirebase();

// 建立 Express 應用程式
const app = express();
const PORT = process.env.PORT || 3000;

// 中介軟體設定
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 請求日誌中介軟體
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// 健康檢查路由
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: '產品訂單管理系統後端 API 運行中',
    timestamp: new Date().toISOString()
  });
});

// API 路由
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/dashboard', require('./routes/dashboard'));

// 404 錯誤處理
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: '找不到請求的資源' 
  });
});

// 全域錯誤處理中介軟體
app.use((err, req, res, next) => {
  console.error('錯誤:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '伺服器內部錯誤',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 伺服器運行於 http://localhost:${PORT}`);
  console.log(`📚 健康檢查: http://localhost:${PORT}/health`);
  console.log(`🌍 環境: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
