const express = require('express');
const router = express.Router();
const { getDb, getCollectionPath } = require('../config/firebase');

// 中介軟體：從請求標頭提取使用者 ID（可擴展為完整身份驗證）
const getUserId = (req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(400).json({ success: false, message: '缺少使用者 ID' });
  }
  req.userId = userId;
  next();
};

// 套用使用者 ID 中介軟體到所有路由
router.use(getUserId);

/**
 * GET /api/products
 * 獲取所有產品規格
 */
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const collectionPath = getCollectionPath(req.userId, 'products');
    const snapshot = await db.collection(collectionPath).get();
    
    const products = [];
    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });

    res.json({ 
      success: true, 
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('獲取產品列表錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '獲取產品列表失敗',
      error: error.message 
    });
  }
});

/**
 * GET /api/products/:id
 * 獲取單一產品規格
 */
router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const collectionPath = getCollectionPath(req.userId, 'products');
    const docRef = db.collection(collectionPath).doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到該產品規格' 
      });
    }

    res.json({ 
      success: true, 
      data: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    console.error('獲取產品錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '獲取產品資料失敗',
      error: error.message 
    });
  }
});

/**
 * POST /api/products
 * 新增產品規格
 */
router.post('/', async (req, res) => {
  try {
    const { name, content, costPrice, sellingPrice, quantity, serialPrefix, expirationDate } = req.body;

    // 驗證必填欄位
    if (!name || costPrice === undefined || sellingPrice === undefined || !expirationDate) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必填欄位' 
      });
    }

    const db = getDb();
    const collectionPath = getCollectionPath(req.userId, 'products');

    // 檢查產品名稱是否已存在
    const existingProducts = await db.collection(collectionPath)
      .where('name', '==', name)
      .get();

    if (!existingProducts.empty) {
      return res.status(400).json({ 
        success: false, 
        message: '此產品名稱已存在，請使用獨特的名稱' 
      });
    }

    const newProduct = {
      name,
      content: content || '',
      costPrice: parseFloat(costPrice),
      sellingPrice: parseFloat(sellingPrice),
      quantity: parseInt(quantity) || 0,
      serialPrefix: serialPrefix || '',
      expirationDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection(collectionPath).add(newProduct);

    res.status(201).json({ 
      success: true, 
      message: '產品規格新增成功',
      data: { id: docRef.id, ...newProduct }
    });
  } catch (error) {
    console.error('新增產品錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '新增產品規格失敗',
      error: error.message 
    });
  }
});

/**
 * PUT /api/products/:id
 * 更新產品規格
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, content, costPrice, sellingPrice, quantity, serialPrefix, expirationDate } = req.body;

    const db = getDb();
    const collectionPath = getCollectionPath(req.userId, 'products');
    const docRef = db.collection(collectionPath).doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到該產品規格' 
      });
    }

    // 如果名稱有變更，檢查新名稱是否重複
    if (name && name !== doc.data().name) {
      const existingProducts = await db.collection(collectionPath)
        .where('name', '==', name)
        .get();

      if (!existingProducts.empty) {
        return res.status(400).json({ 
          success: false, 
          message: '此產品名稱已存在，請使用獨特的名稱' 
        });
      }
    }

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (name) updateData.name = name;
    if (content !== undefined) updateData.content = content;
    if (costPrice !== undefined) updateData.costPrice = parseFloat(costPrice);
    if (sellingPrice !== undefined) updateData.sellingPrice = parseFloat(sellingPrice);
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (serialPrefix !== undefined) updateData.serialPrefix = serialPrefix;
    if (expirationDate) updateData.expirationDate = expirationDate;

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    res.json({ 
      success: true, 
      message: '產品規格更新成功',
      data: { id: updatedDoc.id, ...updatedDoc.data() }
    });
  } catch (error) {
    console.error('更新產品錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '更新產品規格失敗',
      error: error.message 
    });
  }
});

/**
 * DELETE /api/products/:id
 * 刪除產品規格
 */
router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    const collectionPath = getCollectionPath(req.userId, 'products');
    const docRef = db.collection(collectionPath).doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到該產品規格' 
      });
    }

    await docRef.delete();

    res.json({ 
      success: true, 
      message: '產品規格刪除成功'
    });
  } catch (error) {
    console.error('刪除產品錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '刪除產品規格失敗',
      error: error.message 
    });
  }
});

module.exports = router;
