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
 * GET /api/contacts
 * 獲取所有內部聯絡人
 */
router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const collectionPath = getCollectionPath(req.userId, 'contacts');
    const { search } = req.query;
    
    const snapshot = await db.collection(collectionPath).get();
    
    let contacts = [];
    snapshot.forEach(doc => {
      contacts.push({ id: doc.id, ...doc.data() });
    });

    // 前端搜尋篩選
    if (search) {
      const searchLower = search.toLowerCase();
      contacts = contacts.filter(contact => 
        contact.name?.toLowerCase().includes(searchLower) ||
        contact.department?.toLowerCase().includes(searchLower)
      );
    }

    res.json({ 
      success: true, 
      data: contacts,
      count: contacts.length
    });
  } catch (error) {
    console.error('獲取聯絡人列表錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '獲取聯絡人列表失敗',
      error: error.message 
    });
  }
});

/**
 * GET /api/contacts/:id
 * 獲取單一聯絡人
 */
router.get('/:id', async (req, res) => {
  try {
    const db = getDb();
    const collectionPath = getCollectionPath(req.userId, 'contacts');
    const docRef = db.collection(collectionPath).doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到該聯絡人' 
      });
    }

    res.json({ 
      success: true, 
      data: { id: doc.id, ...doc.data() }
    });
  } catch (error) {
    console.error('獲取聯絡人錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '獲取聯絡人資料失敗',
      error: error.message 
    });
  }
});

/**
 * POST /api/contacts
 * 新增內部聯絡人
 */
router.post('/', async (req, res) => {
  try {
    const { name, department, phone, email } = req.body;

    // 驗證必填欄位
    if (!name || !department) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必填欄位（姓名、部門）' 
      });
    }

    const db = getDb();
    const collectionPath = getCollectionPath(req.userId, 'contacts');

    const newContact = {
      name,
      department,
      phone: phone || '',
      email: email || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection(collectionPath).add(newContact);

    res.status(201).json({ 
      success: true, 
      message: '聯絡人新增成功',
      data: { id: docRef.id, ...newContact }
    });
  } catch (error) {
    console.error('新增聯絡人錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '新增聯絡人失敗',
      error: error.message 
    });
  }
});

/**
 * PUT /api/contacts/:id
 * 更新聯絡人
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, department, phone, email } = req.body;

    const db = getDb();
    const collectionPath = getCollectionPath(req.userId, 'contacts');
    const docRef = db.collection(collectionPath).doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到該聯絡人' 
      });
    }

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (name) updateData.name = name;
    if (department) updateData.department = department;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    res.json({ 
      success: true, 
      message: '聯絡人更新成功',
      data: { id: updatedDoc.id, ...updatedDoc.data() }
    });
  } catch (error) {
    console.error('更新聯絡人錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '更新聯絡人失敗',
      error: error.message 
    });
  }
});

/**
 * DELETE /api/contacts/:id
 * 刪除聯絡人
 */
router.delete('/:id', async (req, res) => {
  try {
    const db = getDb();
    const collectionPath = getCollectionPath(req.userId, 'contacts');
    const docRef = db.collection(collectionPath).doc(req.params.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到該聯絡人' 
      });
    }

    await docRef.delete();

    res.json({ 
      success: true, 
      message: '聯絡人刪除成功'
    });
  } catch (error) {
    console.error('刪除聯絡人錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '刪除聯絡人失敗',
      error: error.message 
    });
  }
});

module.exports = router;
