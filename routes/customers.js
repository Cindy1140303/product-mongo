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
 * GET /api/customers
 * 獲取所有客戶
 */
router.get('/', async (req, res) => {
  try {
    const collection = getUserCollection(req.userId, 'customers');
    const { search } = req.query;
    
    let customers = await collection.find({ userId: req.userId }).toArray();
    
    // 轉換 _id 為 id
    customers = customers.map(doc => ({
      id: doc._id.toString(),
      ...doc,
      _id: undefined
    }));

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
    const collection = getUserCollection(req.userId, 'customers');
    const doc = await collection.findOne({ 
      _id: new ObjectId(req.params.id),
      userId: req.userId 
    });

    if (!doc) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到該客戶' 
      });
    }

    res.json({ 
      success: true, 
      data: { id: doc._id.toString(), ...doc, _id: undefined }
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
    const { name, contactPerson, phone, email, address } = req.body;

    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: '缺少客戶名稱' 
      });
    }

    const collection = getUserCollection(req.userId, 'customers');

    // 檢查客戶名稱是否重複
    const existingCustomer = await collection.findOne({ 
      name, 
      userId: req.userId 
    });

    if (existingCustomer) {
      return res.status(400).json({ 
        success: false, 
        message: '此客戶名稱已存在' 
      });
    }

    const newCustomer = {
      name,
      contactPerson: contactPerson || '',
      phone: phone || '',
      email: email || '',
      address: address || '',
      userId: req.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await collection.insertOne(newCustomer);

    res.status(201).json({ 
      success: true, 
      message: '客戶新增成功',
      data: { id: result.insertedId.toString(), ...newCustomer }
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
    const { name, contactPerson, phone, email, address } = req.body;

    const collection = getUserCollection(req.userId, 'customers');
    const doc = await collection.findOne({ 
      _id: new ObjectId(req.params.id),
      userId: req.userId 
    });

    if (!doc) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到該客戶' 
      });
    }

    // 如果名稱有變更，檢查新名稱是否重複
    if (name && name !== doc.name) {
      const existingCustomer = await collection.findOne({ 
        name, 
        userId: req.userId 
      });

      if (existingCustomer) {
        return res.status(400).json({ 
          success: false, 
          message: '此客戶名稱已存在' 
        });
      }
    }

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (name) updateData.name = name;
    if (contactPerson !== undefined) updateData.contactPerson = contactPerson;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (address !== undefined) updateData.address = address;

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
      message: '客戶更新成功',
      data: { id: updatedDoc._id.toString(), ...updatedDoc, _id: undefined }
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
    const collection = getUserCollection(req.userId, 'customers');
    
    const result = await collection.deleteOne({ 
      _id: new ObjectId(req.params.id),
      userId: req.userId 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: '找不到該客戶' 
      });
    }

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
