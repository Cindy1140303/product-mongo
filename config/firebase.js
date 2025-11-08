require('dotenv').config();
const admin = require('firebase-admin');

let firebaseInitialized = false;
let initializationError = null;

// 初始化 Firebase Admin SDK
const initializeFirebase = () => {
  // 如果已經初始化過，不要重複初始化
  if (firebaseInitialized) {
    return true;
  }

  // 如果之前初始化失敗過，不要重試
  if (initializationError) {
    console.warn('⚠️ Firebase 已經初始化失敗，跳過重試');
    return false;
  }

  try {
    // 檢查必要的環境變數
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
      throw new Error('缺少必要的 Firebase 環境變數');
    }

    // 檢查是否已經有 Firebase app 實例
    if (admin.apps.length > 0) {
      console.log('ℹ️ Firebase Admin 已經初始化');
      firebaseInitialized = true;
      return true;
    }

    // 從環境變數讀取 Firebase 配置
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
    });

    firebaseInitialized = true;
    console.log('✅ Firebase Admin 初始化成功');
    return true;
  } catch (error) {
    initializationError = error;
    console.error('❌ Firebase Admin 初始化失敗:', error.message);
    console.error('⚠️ API 路由將無法使用，但應用程式會繼續運行');
    return false;
  }
};

// 獲取 Firestore 資料庫實例
const getDb = () => {
  if (!firebaseInitialized) {
    throw new Error('Firebase 未初始化或初始化失敗');
  }
  return admin.firestore();
};

// 檢查 Firebase 是否已初始化
const isFirebaseReady = () => {
  return firebaseInitialized;
};

// 獲取初始化錯誤（如果有）
const getInitError = () => {
  return initializationError;
};

// 獲取集合路徑
const getCollectionPath = (userId, collectionName) => {
  const appId = process.env.APP_ID || 'default-app-id';
  return `artifacts/${appId}/users/${userId}/${collectionName}`;
};

// 驗證 Firebase ID Token
const verifyIdToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error('無效的身份驗證令牌');
  }
};

module.exports = {
  initializeFirebase,
  getDb,
  getCollectionPath,
  verifyIdToken,
  isFirebaseReady,
  getInitError,
  admin
};
