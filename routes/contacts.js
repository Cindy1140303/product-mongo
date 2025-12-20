const express = require('express');
const router = express.Router();
const { getUserCollection } = require('../config/mongodb');
const { ObjectId } = require('mongodb');

// 中介軟體:提取使用者 ID（如果沒有則使用預設值）
const getUserId = (req, res, next) => {
  const userId = req.headers['x-user-id'] || 'default-user';
  req.userId = userId;
  next();
};

router.use(getUserId);

/**
 * GET /api/contacts
 * 獲取所有聯絡人
 */
router.get('/', async (req, res) => {
  try {
    const collection = getUserCollection(req.userId, 'contacts');
    const { search } = req.query;
    
    let contacts = await collection.find({ userId: req.userId }).toArray();
    
    // 轉換 _id 為 id
    contacts = contacts.map(doc => ({
      id: doc._id.toString(),
      ...doc,
      _id: undefined
    }));

    // 前端搜尋篩選
    if (search) {
      const searchLower = search.toLowerCase();
      contacts = contacts.filter(contact => 
        contact.name?.toLowerCase().includes(searchLower) ||
        contact.email?.toLowerCase().includes(searchLower)
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
    const collection = getUserCollection(req.userId, 'contacts');
    const doc = await collection.findOne({ 
      _id: new ObjectId(req.params.id),
      userId: req.userId 
    });

    if (!doc) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到該聯絡人' 
      });
    }

    res.json({ 
      success: true, 
      data: { id: doc._id.toString(), ...doc, _id: undefined }
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
 * 新增聯絡人
 */
router.post('/', async (req, res) => {
  try {
    console.log('📝 收到新增聯絡人請求:', req.body);
    console.log('👤 使用者ID:', req.userId);
    
    const { name, email, phone, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少必填欄位（姓名、信箱）' 
      });
    }

    const collection = getUserCollection(req.userId, 'contacts');

    const newContact = {
      name,
      email,
      phone: phone || '',
      message: message || '',
      userId: req.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await collection.insertOne(newContact);

    res.status(201).json({ 
      success: true, 
      message: '聯絡人新增成功',
      data: { id: result.insertedId.toString(), ...newContact }
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
    const { name, email, phone, message } = req.body;

    const collection = getUserCollection(req.userId, 'contacts');
    const doc = await collection.findOne({ 
      _id: new ObjectId(req.params.id),
      userId: req.userId 
    });

    if (!doc) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到該聯絡人' 
      });
    }

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (message !== undefined) updateData.message = message;

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
      message: '聯絡人更新成功',
      data: { id: updatedDoc._id.toString(), ...updatedDoc, _id: undefined }
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
    const collection = getUserCollection(req.userId, 'contacts');
    
    const result = await collection.deleteOne({ 
      _id: new ObjectId(req.params.id),
      userId: req.userId 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到該聯絡人' 
      });
    }

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
