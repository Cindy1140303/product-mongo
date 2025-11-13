const express = require('express');
const router = express.Router();
const { getUserCollection } = require('../config/mongodb');

// 中介軟體:提取使用者 ID
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
 * GET /api/dashboard/stats
 * 獲取儀表板統計資料
 */
router.get('/stats', async (req, res) => {
  try {
    const productsCollection = getUserCollection(req.userId, 'products');
    const ordersCollection = getUserCollection(req.userId, 'orders');
    const customersCollection = getUserCollection(req.userId, 'customers');
    const contactsCollection = getUserCollection(req.userId, 'contacts');

    // 平行查詢所有集合
    const [products, orders, customers, contacts] = await Promise.all([
      productsCollection.find({ userId: req.userId }).toArray(),
      ordersCollection.find({ userId: req.userId }).toArray(),
      customersCollection.find({ userId: req.userId }).toArray(),
      contactsCollection.find({ userId: req.userId }).toArray()
    ]);

    // 計算產品總值
    const totalProductValue = products.reduce((sum, product) => {
      return sum + (product.sellingPrice || 0) * (product.quantity || 0);
    }, 0);

    // 計算訂單總收入
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + (order.unitPrice || 0) * (order.quantity || 0);
    }, 0);

    // 計算低庫存產品（數量 < 10）
    const lowStockProducts = products.filter(p => (p.quantity || 0) < 10).length;

    // 計算近期訂單（最近30天）
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentOrders = orders.filter(order => {
      if (!order.createdAt) return false;
      const orderDate = new Date(order.createdAt);
      return orderDate >= thirtyDaysAgo;
    }).length;

    res.json({
      success: true,
      data: {
        products: {
          total: products.length,
          totalValue: totalProductValue,
          lowStock: lowStockProducts
        },
        orders: {
          total: orders.length,
          totalRevenue: totalRevenue,
          recent: recentOrders
        },
        customers: {
          total: customers.length
        },
        contacts: {
          total: contacts.length
        }
      }
    });
  } catch (error) {
    console.error('獲取儀表板統計錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取統計資料失敗',
      error: error.message
    });
  }
});

/**
 * GET /api/dashboard/recent-orders
 * 獲取最近訂單
 */
router.get('/recent-orders', async (req, res) => {
  try {
    const collection = getUserCollection(req.userId, 'orders');
    const limit = parseInt(req.query.limit) || 10;

    const orders = await collection
      .find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    const formattedOrders = orders.map(doc => ({
      id: doc._id.toString(),
      ...doc,
      _id: undefined
    }));

    res.json({
      success: true,
      data: formattedOrders
    });
  } catch (error) {
    console.error('獲取最近訂單錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取最近訂單失敗',
      error: error.message
    });
  }
});

/**
 * GET /api/dashboard/low-stock
 * 獲取低庫存產品
 */
router.get('/low-stock', async (req, res) => {
  try {
    const collection = getUserCollection(req.userId, 'products');
    const threshold = parseInt(req.query.threshold) || 10;

    const products = await collection
      .find({ 
        userId: req.userId,
        quantity: { $lt: threshold }
      })
      .sort({ quantity: 1 })
      .toArray();

    const formattedProducts = products.map(doc => ({
      id: doc._id.toString(),
      ...doc,
      _id: undefined
    }));

    res.json({
      success: true,
      data: formattedProducts
    });
  } catch (error) {
    console.error('獲取低庫存產品錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取低庫存產品失敗',
      error: error.message
    });
  }
});

module.exports = router;
