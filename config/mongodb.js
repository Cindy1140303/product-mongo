const { MongoClient } = require('mongodb');

let client = null;
let db = null;
let isConnecting = false;
let connectionError = null;

/**
 * 連接到 MongoDB
 */
async function connectToMongoDB() {
  if (db) {
    return db;
  }

  if (isConnecting) {
    // 等待正在進行的連接
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return db;
  }

  try {
    isConnecting = true;
    connectionError = null;

    const username = process.env.DB_USERNAME;
    const password = process.env.DB_PASSWORD;
    
    console.log('🔍 檢查環境變數:');
    console.log('  - DB_USERNAME:', username ? '已設定' : '❌ 未設定');
    console.log('  - DB_PASSWORD:', password ? '已設定' : '❌ 未設定');
    
    if (!username || !password) {
      throw new Error('缺少資料庫連線憑證 (DB_USERNAME 或 DB_PASSWORD)');
    }

    // URL 編碼密碼以處理特殊字符
    const encodedPassword = encodeURIComponent(password);
    const uri = `mongodb+srv://${username}:${encodedPassword}@cluster0.rvu2bwc.mongodb.net/?appName=Cluster0`;
    
    console.log('🔗 嘗試連線到 MongoDB Atlas...');
    
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    });

    await client.connect();
    db = client.db('product_management');
    
    console.log('✅ MongoDB 連線成功');
    return db;
  } catch (error) {
    connectionError = error;
    console.error('❌ MongoDB 連線失敗:', error.message);
    db = null;
    client = null;
    throw error;
  } finally {
    isConnecting = false;
  }
}

/**
 * 獲取資料庫實例
 */
function getDb() {
  if (!db) {
    throw new Error('資料庫尚未連線。請先呼叫 connectToMongoDB()');
  }
  return db;
}

/**
 * 檢查資料庫是否已連線
 */
function isMongoDBReady() {
  return db !== null;
}

/**
 * 獲取連線錯誤
 */
function getConnectionError() {
  return connectionError;
}

/**
 * 關閉資料庫連線
 */
async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB 連線已關閉');
  }
}

/**
 * 獲取使用者的集合
 */
function getUserCollection(userId, collectionName) {
  const db = getDb();
  // 在 MongoDB 中，每個使用者的資料存儲在同一個集合中，使用 userId 欄位區分
  return db.collection(collectionName);
}

module.exports = {
  connectToMongoDB,
  getDb,
  isMongoDBReady,
  getConnectionError,
  closeConnection,
  getUserCollection,
};
