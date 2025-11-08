require('dotenv').config();
const admin = require('firebase-admin');

// 初始化 Firebase Admin SDK
const initializeFirebase = () => {
  try {
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

    console.log('✅ Firebase Admin 初始化成功');
  } catch (error) {
    console.error('❌ Firebase Admin 初始化失敗:', error.message);
    process.exit(1);
  }
};

// 獲取 Firestore 資料庫實例
const getDb = () => {
  return admin.firestore();
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
  admin
};
