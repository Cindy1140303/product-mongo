# MongoDB 資料庫設定指南

本指南說明如何使用 Python 建立和設定 MongoDB 資料庫。

## 📋 前置需求

1. Python 3.7 或更新版本
2. MongoDB Atlas 帳號（或本地 MongoDB 伺服器）
3. 資料庫使用者名稱和密碼

## 🚀 快速開始

### 1. 安裝 Python 套件

在 PowerShell 中執行：

```powershell
pip install -r requirements.txt
```

或個別安裝：

```powershell
pip install pymongo python-dotenv dnspython
```

### 2. 設定環境變數

複製 `.env.mongodb` 為 `.env`（如果還沒有 .env 檔案）：

```powershell
copy .env.mongodb .env
```

或將以下內容新增到現有的 `.env` 檔案：

```env
# MongoDB 設定
DB_USERNAME=your_username_here
DB_PASSWORD=your_password_here
DATABASE_NAME=product_order_management
```

**重要：** 請將 `your_username_here` 和 `your_password_here` 替換為您的 MongoDB Atlas 實際認證資訊。

### 3. 執行初始化程式

```powershell
python setup_mongodb.py
```

## 📊 程式功能

`setup_mongodb.py` 會自動執行以下操作：

1. ✅ 連接到 MongoDB Atlas
2. ✅ 建立資料庫 `product_order_management`
3. ✅ 建立四個集合（Collection）：
   - `products` - 產品規格
   - `orders` - 訂單
   - `customers` - 客戶
   - `contacts` - 內部聯絡人
4. ✅ 建立索引以提升查詢效能
5. ✅ （可選）插入範例資料

## 🗂️ 資料庫結構

### Products（產品規格）集合

```json
{
  "name": "產品名稱",
  "content": "產品描述",
  "costPrice": 100.00,
  "sellingPrice": 150.00,
  "quantity": 50,
  "serialPrefix": "PROD-A",
  "expirationDate": "2025-12-31",
  "createdAt": "2025-01-01T00:00:00",
  "updatedAt": "2025-01-01T00:00:00"
}
```

**索引：**
- `name` (unique)
- `expirationDate`

### Orders（訂單）集合

```json
{
  "productName": "產品名稱",
  "serialNumber": "PROD-A-001",
  "unitPrice": 150.00,
  "quantity": 10,
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "customerName": "客戶名稱",
  "createdAt": "2025-01-01T00:00:00",
  "updatedAt": "2025-01-01T00:00:00"
}
```

**索引：**
- `serialNumber` (unique)
- `customerName`
- `productName`
- `startDate` + `endDate`

### Customers（客戶）集合

```json
{
  "name": "客戶公司名稱",
  "contactPerson": "聯絡人姓名",
  "phone": "02-12345678",
  "email": "contact@example.com",
  "createdAt": "2025-01-01T00:00:00",
  "updatedAt": "2025-01-01T00:00:00"
}
```

**索引：**
- `name` (unique)
- `email`

### Contacts（內部聯絡人）集合

```json
{
  "name": "員工姓名",
  "department": "部門名稱",
  "phone": "分機 1001",
  "email": "employee@company.com",
  "createdAt": "2025-01-01T00:00:00",
  "updatedAt": "2025-01-01T00:00:00"
}
```

**索引：**
- `email`
- `department`

## 🔧 使用 MongoDB Compass（GUI 工具）

如果您想使用圖形介面管理資料庫：

1. 下載並安裝 [MongoDB Compass](https://www.mongodb.com/products/compass)
2. 使用以下連接字串連接：
   ```
   mongodb+srv://<username>:<password>@cluster0.rvu2bwc.mongodb.net/
   ```
3. 選擇 `product_order_management` 資料庫查看資料

## 🐍 Python 連接範例

在其他 Python 程式中連接資料庫：

```python
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

DB_USERNAME = os.getenv('DB_USERNAME')
DB_PASSWORD = os.getenv('DB_PASSWORD')
MONGO_URI = f"mongodb+srv://{DB_USERNAME}:{DB_PASSWORD}@cluster0.rvu2bwc.mongodb.net/?appName=Cluster0"

client = MongoClient(MONGO_URI)
db = client['product_order_management']

# 查詢產品
products = db.products.find()
for product in products:
    print(product)

# 新增客戶
new_customer = {
    "name": "新客戶",
    "contactPerson": "張三",
    "phone": "02-12345678",
    "email": "zhang@example.com"
}
db.customers.insert_one(new_customer)
```

## ⚠️ 常見問題

### 1. 連接超時

**錯誤訊息：** `ServerSelectionTimeoutError`

**解決方法：**
- 檢查網路連接
- 確認 MongoDB Atlas IP 白名單設定
- 驗證使用者名稱和密碼是否正確

### 2. 認證失敗

**錯誤訊息：** `Authentication failed`

**解決方法：**
- 確認 `.env` 檔案中的使用者名稱和密碼正確
- 檢查密碼中的特殊字符是否需要 URL 編碼
- 確認使用者有權限訪問該資料庫

### 3. 模組找不到

**錯誤訊息：** `ModuleNotFoundError: No module named 'pymongo'`

**解決方法：**
```powershell
pip install pymongo python-dotenv dnspython
```

## 🔐 安全建議

1. ❌ 不要將 `.env` 檔案提交到 Git
2. ✅ 使用強密碼
3. ✅ 設定 MongoDB Atlas IP 白名單
4. ✅ 定期更換資料庫密碼
5. ✅ 使用最小權限原則

## 📚 相關資源

- [MongoDB Python 驅動文件](https://pymongo.readthedocs.io/)
- [MongoDB Atlas 文件](https://docs.atlas.mongodb.com/)
- [PyMongo 教學](https://www.mongodb.com/languages/python)

## 💬 支援

如有問題，請參考：
- MongoDB Atlas 支援中心
- PyMongo 官方文件
- 開發團隊內部文件
