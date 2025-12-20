const express = require('express');
const router = express.Router();
const { getUserCollection } = require('../config/mongodb');
const { ObjectId } = require('mongodb');
const { format } = require('date-fns');

// 中介軟體:提取使用者 ID（如果沒有則使用預設值）
const getUserId = (req, res, next) => {
  const userId = req.headers['x-user-id'] || 'default-user';
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
    const collection = getUserCollection(req.userId, 'orders');
    const { search } = req.query;
    
    let orders = await collection.find({ userId: req.userId }).toArray();
    
    // 轉換 _id 為 id
    orders = orders.map(doc => ({
      id: doc._id.toString(),
      ...doc,
      _id: undefined
    }));

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
    const collection = getUserCollection(req.userId, 'orders');
    const doc = await collection.findOne({ 
      _id: new ObjectId(req.params.id),
      userId: req.userId 
    });

    if (!doc) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到該訂單' 
      });
    }

    res.json({ 
      success: true, 
      data: { id: doc._id.toString(), ...doc, _id: undefined }
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

    const collection = getUserCollection(req.userId, 'orders');

    // 檢查序號是否已存在
    const existingOrder = await collection.findOne({ 
      serialNumber, 
      userId: req.userId 
    });

    if (existingOrder) {
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
      userId: req.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await collection.insertOne(newOrder);

    res.status(201).json({ 
      success: true, 
      message: '訂單新增成功',
      data: { id: result.insertedId.toString(), ...newOrder }
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

    const collection = getUserCollection(req.userId, 'orders');
    const doc = await collection.findOne({ 
      _id: new ObjectId(req.params.id),
      userId: req.userId 
    });

    if (!doc) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到該訂單' 
      });
    }

    // 如果序號有變更，檢查新序號是否重複
    if (serialNumber && serialNumber !== doc.serialNumber) {
      const existingOrder = await collection.findOne({ 
        serialNumber, 
        userId: req.userId 
      });

      if (existingOrder) {
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

    await collection.updateOne(
      { _id: new ObjectId(req.params.id), userId: req.userId },
      { $set: updateData }
    );

    const updatedDoc = await collection.findOne({ 
      _id: new ObjectId(req.params.id),
      userId: req.userId 
    });
    
    res.json({ 
      success: true, 
      message: '訂單更新成功',
      data: { id: updatedDoc._id.toString(), ...updatedDoc, _id: undefined }
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
    const collection = getUserCollection(req.userId, 'orders');
    
    const result = await collection.deleteOne({ 
      _id: new ObjectId(req.params.id),
      userId: req.userId 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到該訂單' 
      });
    }

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
    const collection = getUserCollection(req.userId, 'orders');
    const orders = await collection.find({ userId: req.userId }).toArray();

    if (orders.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '沒有訂單資料可匯出' 
      });
    }

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
        order._id.toString(),
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
