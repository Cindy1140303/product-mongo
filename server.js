const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 載入環境變數
dotenv.config();

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
app.get('/health', async (req, res) => {
  const { isMongoDBReady, getConnectionError } = require('./config/mongodb');
  const mongoStatus = isMongoDBReady() ? 'connected' : 'not connected';
  const mongoError = getConnectionError();
  
  res.json({ 
    status: 'ok', 
    message: '產品訂單管理系統後端 API 運行中',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    mongodb: mongoStatus,
    mongoError: mongoError ? mongoError.message : null
  });
});

app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: '產品訂單管理系統 API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      products: '/api/products',
      orders: '/api/orders',
      customers: '/api/customers',
      contacts: '/api/contacts',
      dashboard: '/api/dashboard'
    }
  });
});

// 延遲 MongoDB 初始化，只在實際使用時才初始化
let mongoDBInitialized = false;
const initMongoDBOnce = async () => {
  if (mongoDBInitialized) return;
  
  if (!process.env.DB_USERNAME || !process.env.DB_PASSWORD) {
    console.error('❌ 缺少環境變數: DB_USERNAME 或 DB_PASSWORD');
    throw new Error('資料庫配置錯誤');
  }
  
  try {
    const { connectToMongoDB } = require('./config/mongodb');
    await connectToMongoDB();
    mongoDBInitialized = true;
    console.log('✅ MongoDB 連線成功');
  } catch (error) {
    console.error('⚠️ MongoDB 連線失敗:', error.message);
    throw error;
  }
};

// API 路由（延遲初始化 MongoDB）
app.use('/api/*', async (req, res, next) => {
  try {
    await initMongoDBOnce();
    next();
  } catch (error) {
    res.status(503).json({
      success: false,
      message: '資料庫連線失敗',
      error: error.message
    });
  }
});

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

// 只在非 Vercel 環境下啟動伺服器
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 伺服器運行於 http://localhost:${PORT}`);
    console.log(`📚 健康檢查: http://localhost:${PORT}/health`);
    console.log(`🌍 環境: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
