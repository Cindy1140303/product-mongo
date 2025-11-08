const express = require('express');
const router = express.Router();
const { getDb, getCollectionPath } = require('../config/firebase');

// 中介軟體：提取使用者 ID
const getUserId = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(400).json({ success: false, message: '缺少使用者 ID' });
  }
  req.userId = userId;
  next();
};

router.use(getUserId);

/**
 * 計算日期差距（天數）
 */
const daysUntil = (dateString) => {
  const oneDay = 24 * 60 * 60 * 1000;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0);

  if (isNaN(targetDate)) return null;

  const diffDays = Math.round((targetDate.getTime() - today.getTime()) / oneDay);
  return diffDays;
};

/**
 * GET /api/dashboard
 * 獲取儀表板統計資料
 */
router.get('/', async (req, res) => {
  try {
    const db = getDb();

    // 取得所有集合的資料
    const [productsSnapshot, ordersSnapshot, customersSnapshot, contactsSnapshot] = await Promise.all([
      db.collection(getCollectionPath(req.userId, 'products')).get(),
      db.collection(getCollectionPath(req.userId, 'orders')).get(),
      db.collection(getCollectionPath(req.userId, 'customers')).get(),
      db.collection(getCollectionPath(req.userId, 'contacts')).get()
    ]);

    const products = [];
    productsSnapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });

    // 篩選即將到期的產品（30 天內）
    const expiringProducts = products
      .map(p => ({
        ...p,
        daysRemaining: daysUntil(p.expirationDate)
      }))
      .filter(p => p.daysRemaining !== null && p.daysRemaining <= 30 && p.daysRemaining >= 0)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);

    // 統計資料
    const statistics = {
      totalProducts: productsSnapshot.size,
      totalOrders: ordersSnapshot.size,
      totalCustomers: customersSnapshot.size,
      totalContacts: contactsSnapshot.size,
      expiringProductsCount: expiringProducts.length
    };

    res.json({ 
      success: true, 
      data: {
        statistics,
        expiringProducts
      }
    });
  } catch (error) {
    console.error('獲取儀表板資料錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '獲取儀表板資料失敗',
      error: error.message 
    });
  }
});

/**
 * GET /api/dashboard/expiring-products
 * 獲取即將到期的產品（30 天內）
 */
router.get('/expiring-products', async (req, res) => {
  try {
    const db = getDb();
    const { days = 30 } = req.query; // 預設 30 天
    
    const collectionPath = getCollectionPath(req.userId, 'products');
    const snapshot = await db.collection(collectionPath).get();
    
    const products = [];
    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });

    const daysThreshold = parseInt(days);
    const expiringProducts = products
      .map(p => ({
        ...p,
        daysRemaining: daysUntil(p.expirationDate)
      }))
      .filter(p => p.daysRemaining !== null && p.daysRemaining <= daysThreshold && p.daysRemaining >= 0)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);

    res.json({ 
      success: true, 
      data: expiringProducts,
      count: expiringProducts.length,
      daysThreshold
    });
  } catch (error) {
    console.error('獲取即將到期產品錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '獲取即將到期產品失敗',
      error: error.message 
    });
  }
});

module.exports = router;
