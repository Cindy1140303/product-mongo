# 產品訂單管理系統

## 🎯 專案概述

這是一個完整的產品訂單管理系統,使用 Node.js/Express 後端和 MongoDB 資料庫。

## 🏗️ 技術堆疊

- **後端**: Node.js 18.x, Express.js
- **資料庫**: MongoDB Atlas
- **前端**: HTML, Tailwind CSS, Vanilla JavaScript
- **部署**: Vercel

## 📁 專案結構

```
product/
├── server.js                 # Express 伺服器主檔
├── config/
│   └── mongodb.js           # MongoDB 連線配置
├── routes/
│   ├── products.js          # 產品規格 API
│   ├── orders.js            # 訂單管理 API
│   ├── customers.js         # 客戶管理 API
│   ├── contacts.js          # 聯絡人 API
│   └── dashboard.js         # 儀表板統計 API
├── index.html               # 前端應用程式
└── package.json
```

## 🚀 環境設定

### 1. 安裝依賴

```bash
npm install
```

### 2. 環境變數

創建 `.env` 檔案:

```env
# MongoDB 連線設定
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Node 環境
NODE_ENV=production
PORT=3000
```

### 3. 本地運行

```bash
npm start
```

或使用開發模式 (需要 nodemon):

```bash
npm run dev
```

## 📚 API 端點

所有 API 都需要在請求標頭中包含 `x-user-id`。

### 產品規格 (/api/products)
- `GET /api/products` - 取得所有產品
- `GET /api/products/:id` - 取得特定產品
- `POST /api/products` - 新增產品
- `PUT /api/products/:id` - 更新產品
- `DELETE /api/products/:id` - 刪除產品

### 訂單管理 (/api/orders)
- `GET /api/orders` - 取得所有訂單 (支援 ?search 參數)
- `GET /api/orders/:id` - 取得特定訂單
- `POST /api/orders` - 新增訂單
- `PUT /api/orders/:id` - 更新訂單
- `DELETE /api/orders/:id` - 刪除訂單
- `GET /api/orders/export/csv` - 匯出 CSV

### 客戶管理 (/api/customers)
- `GET /api/customers` - 取得所有客戶
- `GET /api/customers/:id` - 取得特定客戶
- `POST /api/customers` - 新增客戶
- `PUT /api/customers/:id` - 更新客戶
- `DELETE /api/customers/:id` - 刪除客戶

### 聯絡人 (/api/contacts)
- `GET /api/contacts` - 取得所有聯絡人
- `GET /api/contacts/:id` - 取得特定聯絡人
- `POST /api/contacts` - 新增聯絡人
- `PUT /api/contacts/:id` - 更新聯絡人
- `DELETE /api/contacts/:id` - 刪除聯絡人

### 儀表板 (/api/dashboard)
- `GET /api/dashboard/stats` - 取得統計資料
- `GET /api/dashboard/recent-orders` - 取得最近訂單
- `GET /api/dashboard/low-stock` - 取得低庫存產品

## 🔧 MongoDB 資料庫結構

### Collections:
- `products` - 產品規格
- `orders` - 訂單
- `customers` - 客戶
- `contacts` - 聯絡人

所有文件都包含 `userId` 欄位用於多租戶支援。

## 📝 Python 初始化腳本

使用 Python 腳本初始化 MongoDB 資料庫:

```bash
cd python_scripts
pip install -r python_requirements.txt
python setup_mongodb.py
```

## 🌐 Vercel 部署

### 環境變數設定

在 Vercel 專案設定中添加:
- `DB_USERNAME` - MongoDB 使用者名稱
- `DB_PASSWORD` - MongoDB 密碼
- `NODE_ENV` - `production`

### 部署命令

```bash
git add .
git commit -m "Update to MongoDB"
git push
```

Vercel 會自動部署。

## ✅ 功能特色

- ✨ 產品規格管理
- 📦 訂單追蹤
- 👥 客戶關係管理
- 📊 儀表板統計
- 📤 CSV 匯出
- 🔍 搜尋功能
- 🎨 響應式設計

## 🐛 錯誤排除

### MongoDB 連線失敗
檢查環境變數是否正確設定,以及 MongoDB Atlas IP 白名單。

### API 請求失敗
確認 `x-user-id` 標頭已包含在所有請求中。

### Vercel 部署錯誤
確保 `package.json` 中的 `engines` 設定為 Node 18.x。

## 📞 聯絡資訊

如有問題請聯絡開發團隊。

## 📄 授權

MIT License
