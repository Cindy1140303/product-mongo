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
 * GET /api/customers
 * 獲取所有客戶
 */
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const collectionPath = getCollectionPath(req.userId, 'customers');
    const { search } = req.query;
    
    const snapshot = await db.collection(collectionPath).get();
    
    let customers = [];
    snapshot.forEach(doc => {
      customers.push({ id: doc.id, ...doc.data() });
    });

    // 前端搜尋篩選
    if (search) {
      const searchLower = search.toLowerCase();
      customers = customers.filter(customer => 
        customer.name?.toLowerCase().includes(searchLower) ||
        customer.contactPerson?.toLowerCase().includes(searchLower)
      );
    }

    res.json({ 
      success: true, 
      data: customers,
      count: customers.length
    });
  } catch (error) {
    console.error('獲取客戶列表錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '獲取客戶列表失敗',
      error: error.message 
    });
  }
});

/**
 * GET /api/customers/:id
 * 獲取單一客戶
 */
router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const collectionPath = getCollectionPath(req.userId, 'customers');
    const docRef = db.collection(collectionPath).doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到該客戶' 
      });
    }

    res.json({ 
      success: true, 
      data: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    console.error('獲取客戶錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '獲取客戶資料失敗',
      error: error.message 
    });
  }
});

/**
 * POST /api/customers
 * 新增客戶
 */
router.post('/', async (req, res) => {
  try {
    const { name, contactPerson, phone, email } = req.body;

    // 驗證必填欄位
    if (!name || !contactPerson) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必填欄位（客戶名稱、聯絡人）' 
      });
    }

    const db = getDb();
    const collectionPath = getCollectionPath(req.userId, 'customers');

    // 檢查客戶名稱是否已存在
    const existingCustomers = await db.collection(collectionPath)
      .where('name', '==', name)
      .get();

    if (!existingCustomers.empty) {
      return res.status(400).json({ 
        success: false, 
        message: '此客戶名稱已存在，請使用獨特的名稱' 
      });
    }

    const newCustomer = {
      name,
      contactPerson,
      phone: phone || '',
      email: email || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection(collectionPath).add(newCustomer);

    res.status(201).json({ 
      success: true, 
      message: '客戶新增成功',
      data: { id: docRef.id, ...newCustomer }
    });
  } catch (error) {
    console.error('新增客戶錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '新增客戶失敗',
      error: error.message 
    });
  }
});

/**
 * PUT /api/customers/:id
 * 更新客戶
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, contactPerson, phone, email } = req.body;

    const db = getDb();
    const collectionPath = getCollectionPath(req.userId, 'customers');
    const docRef = db.collection(collectionPath).doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到該客戶' 
      });
    }

    // 如果名稱有變更，檢查新名稱是否重複
    if (name && name !== doc.data().name) {
      const existingCustomers = await db.collection(collectionPath)
        .where('name', '==', name)
        .get();

      if (!existingCustomers.empty) {
        return res.status(400).json({ 
          success: false, 
          message: '此客戶名稱已存在，請使用獨特的名稱' 
        });
      }
    }

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (name) updateData.name = name;
    if (contactPerson) updateData.contactPerson = contactPerson;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    res.json({ 
      success: true, 
      message: '客戶更新成功',
      data: { id: updatedDoc.id, ...updatedDoc.data() }
    });
  } catch (error) {
    console.error('更新客戶錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '更新客戶失敗',
      error: error.message 
    });
  }
});

/**
 * DELETE /api/customers/:id
 * 刪除客戶
 */
router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    const collectionPath = getCollectionPath(req.userId, 'customers');
    const docRef = db.collection(collectionPath).doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到該客戶' 
      });
    }

    await docRef.delete();

    res.json({ 
      success: true, 
      message: '客戶刪除成功'
    });
  } catch (error) {
    console.error('刪除客戶錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '刪除客戶失敗',
      error: error.message 
    });
  }
});

module.exports = router;
