const express = require('express');
const router = express.Router();
const { getDb, getCollectionPath } = require('../config/firebase');
const { format } = require('date-fns');

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
 * GET /api/orders
 * 獲取所有訂單（支援查詢參數篩選）
 */
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const collectionPath = getCollectionPath(req.userId, 'orders');
    const { search } = req.query;
    
    let query = db.collection(collectionPath);
    const snapshot = await query.get();
    
    let orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    // 前端搜尋篩選（如果提供 search 參數）
    if (search) {
      const searchLower = search.toLowerCase();
      orders = orders.filter(order => 
        order.productName?.toLowerCase().includes(searchLower) ||
        order.serialNumber?.toLowerCase().includes(searchLower) ||
        order.customerName?.toLowerCase().includes(searchLower)
      );
    }

    res.json({ 
      success: true, 
      data: orders,
      count: orders.length
    });
  } catch (error) {
    console.error('獲取訂單列表錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '獲取訂單列表失敗',
      error: error.message 
    });
  }
});

/**
 * GET /api/orders/:id
 * 獲取單一訂單
 */
router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const collectionPath = getCollectionPath(req.userId, 'orders');
    const docRef = db.collection(collectionPath).doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到該訂單' 
      });
    }

    res.json({ 
      success: true, 
      data: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    console.error('獲取訂單錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '獲取訂單資料失敗',
      error: error.message 
    });
  }
});

/**
 * POST /api/orders
 * 新增訂單
 */
router.post('/', async (req, res) => {
  try {
    const { 
      productName, 
      serialNumber, 
      unitPrice, 
      quantity, 
      startDate, 
      endDate, 
      customerName 
    } = req.body;

    // 驗證必填欄位
    if (!productName || !serialNumber || unitPrice === undefined || !quantity || !startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必填欄位' 
      });
    }

    const db = getDb();
    const collectionPath = getCollectionPath(req.userId, 'orders');

    // 檢查序號是否已存在
    const existingOrders = await db.collection(collectionPath)
      .where('serialNumber', '==', serialNumber)
      .get();

    if (!existingOrders.empty) {
      return res.status(400).json({ 
        success: false, 
        message: '此產品序號已被使用，請使用獨特序號' 
      });
    }

    const newOrder = {
      productName,
      serialNumber,
      unitPrice: parseFloat(unitPrice),
      quantity: parseInt(quantity),
      startDate,
      endDate,
      customerName: customerName || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection(collectionPath).add(newOrder);

    res.status(201).json({ 
      success: true, 
      message: '訂單新增成功',
      data: { id: docRef.id, ...newOrder }
    });
  } catch (error) {
    console.error('新增訂單錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '新增訂單失敗',
      error: error.message 
    });
  }
});

/**
 * PUT /api/orders/:id
 * 更新訂單
 */
router.put('/:id', async (req, res) => {
  try {
    const { 
      productName, 
      serialNumber, 
      unitPrice, 
      quantity, 
      startDate, 
      endDate, 
      customerName 
    } = req.body;

    const db = getDb();
    const collectionPath = getCollectionPath(req.userId, 'orders');
    const docRef = db.collection(collectionPath).doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到該訂單' 
      });
    }

    // 如果序號有變更，檢查新序號是否重複
    if (serialNumber && serialNumber !== doc.data().serialNumber) {
      const existingOrders = await db.collection(collectionPath)
        .where('serialNumber', '==', serialNumber)
        .get();

      if (!existingOrders.empty) {
        return res.status(400).json({ 
          success: false, 
          message: '此產品序號已被使用，請使用獨特序號' 
        });
      }
    }

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (productName) updateData.productName = productName;
    if (serialNumber) updateData.serialNumber = serialNumber;
    if (unitPrice !== undefined) updateData.unitPrice = parseFloat(unitPrice);
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (startDate) updateData.startDate = startDate;
    if (endDate) updateData.endDate = endDate;
    if (customerName !== undefined) updateData.customerName = customerName;

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    res.json({ 
      success: true, 
      message: '訂單更新成功',
      data: { id: updatedDoc.id, ...updatedDoc.data() }
    });
  } catch (error) {
    console.error('更新訂單錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '更新訂單失敗',
      error: error.message 
    });
  }
});

/**
 * DELETE /api/orders/:id
 * 刪除訂單
 */
router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    const collectionPath = getCollectionPath(req.userId, 'orders');
    const docRef = db.collection(collectionPath).doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到該訂單' 
      });
    }

    await docRef.delete();

    res.json({ 
      success: true, 
      message: '訂單刪除成功'
    });
  } catch (error) {
    console.error('刪除訂單錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '刪除訂單失敗',
      error: error.message 
    });
  }
});

/**
 * GET /api/orders/export/csv
 * 匯出訂單為 CSV 格式
 */
router.get('/export/csv', async (req, res) => {
  try {
    const db = getDb();
    const collectionPath = getCollectionPath(req.userId, 'orders');
    const snapshot = await db.collection(collectionPath).get();

    if (snapshot.empty) {
      return res.status(404).json({ 
        success: false, 
        message: '沒有訂單資料可匯出' 
      });
    }

    const orders = [];
    snapshot.forEach(doc => {
      orders.push({ id: doc.id, ...doc.data() });
    });

    // 建立 CSV 內容
    const headers = ["訂單ID", "產品名稱", "產品序號", "客戶名稱", "單價", "個數", "總價", "訂單開始日期", "訂單結束日期", "建立日期"];
    let csvContent = '\uFEFF' + headers.join(',') + '\n'; // \uFEFF 是 BOM，解決中文亂碼

    orders.forEach(order => {
      const total = (order.unitPrice || 0) * (order.quantity || 0);
      const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        try {
          return dateStr.split('T')[0];
        } catch {
          return dateStr;
        }
      };

      const row = [
        order.id,
        order.productName || '',
        order.serialNumber || '',
        order.customerName || '',
        (order.unitPrice || 0).toFixed(2),
        order.quantity || 0,
        total.toFixed(2),
        formatDate(order.startDate),
        formatDate(order.endDate),
        formatDate(order.createdAt)
      ].map(item => `"${String(item).replace(/"/g, '""')}"`).join(',');

      csvContent += row + '\n';
    });

    // 設定 CSV 下載的 HTTP 標頭
    const today = format(new Date(), 'yyyy-MM-dd');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="Order_Quote_${today}.csv"`);
    res.send(csvContent);

  } catch (error) {
    console.error('匯出 CSV 錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '匯出 CSV 失敗',
      error: error.message 
    });
  }
});

module.exports = router;
