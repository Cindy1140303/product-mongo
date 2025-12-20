# 系統架構說明

## 🏗️ 整體架構圖

```
┌─────────────────────────────────────────────────────────────────┐
│                         使用者瀏覽器                              │
│                    (https://your-app.vercel.app)                │
└───────────────┬─────────────────────────────────────────────────┘
                │
                │ 1. 訪問 /dashboard.html
                ↓
┌─────────────────────────────────────────────────────────────────┐
│                        Vercel Platform                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                     Static Files                           │  │
│  │              (outputDirectory: "public")                   │  │
│  │  ┌─────────────────────────────────────────────────────┐   │  │
│  │  │  index.html                                         │   │  │
│  │  │  dashboard.html                                     │   │  │
│  │  │  products.html                                      │   │  │
│  │  │  orders.html                                        │   │  │
│  │  │  customers.html                                     │   │  │
│  │  │  contacts.html                                      │   │  │
│  │  │  sidebar.js                                         │   │  │
│  │  └─────────────────────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Serverless Functions (API)                   │  │
│  │                                                            │  │
│  │  api/index.js  ← 處理所有 /api/* 請求                      │  │
│  │      ↓                                                     │  │
│  │  server.js (Express App)                                  │  │
│  │      ↓                                                     │  │
│  │  ┌──────────────────────────────────────┐                 │  │
│  │  │  routes/                             │                 │  │
│  │  │    - products.js                     │                 │  │
│  │  │    - orders.js                       │                 │  │
│  │  │    - customers.js                    │                 │  │
│  │  │    - contacts.js                     │                 │  │
│  │  │    - dashboard.js                    │                 │  │
│  │  └──────────────────────────────────────┘                 │  │
│  │      ↓                                                     │  │
│  │  config/mongodb.js                                        │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ 3. 連接資料庫
                         ↓
         ┌───────────────────────────────────┐
         │     MongoDB Atlas (Cloud)         │
         │                                   │
         │  Database: product_management     │
         │  ┌─────────────────────────────┐  │
         │  │  Collections:               │  │
         │  │    - products               │  │
         │  │    - orders                 │  │
         │  │    - customers              │  │
         │  │    - contacts               │  │
         │  └─────────────────────────────┘  │
         └───────────────────────────────────┘
```

## 📊 請求流程圖

### 前端頁面請求

```
使用者輸入 URL
    ↓
https://your-app.vercel.app/
    ↓
Vercel 查找 public/index.html
    ↓
index.html 執行重定向
    ↓
https://your-app.vercel.app/dashboard.html
    ↓
Vercel 提供 public/dashboard.html
    ↓
瀏覽器渲染頁面
    ↓
載入 sidebar.js 和其他資源
```

### API 資料請求

```
前端 JavaScript 調用
fetch('/api/products')
    ↓
請求發送到 Vercel
https://your-app.vercel.app/api/products
    ↓
Vercel 的 rewrite 規則匹配
/api/(.*) → /api/index.js
    ↓
執行 api/index.js serverless function
    ↓
載入 server.js (Express App)
    ↓
匹配路由：/api/products → routes/products.js
    ↓
routes/products.js 處理請求
    ↓
config/mongodb.js 連接 MongoDB
    ↓
執行資料庫查詢
    ↓
MongoDB Atlas 返回資料
    ↓
Express 格式化為 JSON
    ↓
返回給前端
{
  "success": true,
  "data": [...]
}
    ↓
前端 JavaScript 更新 UI
```

## 🔑 關鍵配置文件

### 1. vercel.json

```json
{
  "outputDirectory": "public",
  "functions": {
    "api/index.js": {
      "maxDuration": 10
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.js"
    }
  ]
}
```

**作用：**
- `outputDirectory`: 告訴 Vercel 靜態文件在 `public/` 目錄
- `functions`: 配置 serverless function 的參數
- `rewrites`: 將 API 請求路由到 serverless function

### 2. api/index.js

```javascript
const app = require('../server');

module.exports = async (req, res) => {
  // 設定 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // 確保 URL 包含 /api
  if (!req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  
  // 轉發到 Express
  return app(req, res);
};
```

**作用：**
- Vercel serverless function 的入口
- 設定 CORS 標頭允許跨域請求
- 將請求轉發給 Express 應用程式

### 3. server.js

```javascript
// Express 路由配置
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/dashboard', require('./routes/dashboard'));
```

**作用：**
- 定義所有 API 路由
- 每個路由對應一個檔案處理不同的資源

### 4. config/mongodb.js

```javascript
const uri = `mongodb+srv://${username}:${password}@cluster0.rvu2bwc.mongodb.net/?appName=Cluster0`;
const client = new MongoClient(uri);
```

**作用：**
- 建立與 MongoDB Atlas 的連接
- 使用環境變數中的憑證
- 提供資料庫存取接口

## 🔐 環境變數

### Vercel 環境變數配置

| 變數名 | 說明 | 範例 |
|--------|------|------|
| `DB_USERNAME` | MongoDB 使用者名稱 | `admin` |
| `DB_PASSWORD` | MongoDB 密碼 | `SecurePass123!` |
| `NODE_ENV` | 環境模式 | `production` |

### 如何設定

1. Vercel Dashboard → 選擇專案
2. Settings → Environment Variables
3. 添加每個變數
4. 選擇環境：Production, Preview, Development

## 📁 目錄結構詳解

```
product-mongo/
│
├── public/                  # 前端靜態文件（部署到 Vercel）
│   ├── index.html          # 入口頁面（重定向）
│   ├── dashboard.html      # 儀表板
│   ├── products.html       # 產品管理
│   ├── orders.html         # 訂單管理
│   ├── customers.html      # 客戶管理
│   ├── contacts.html       # 聯絡人管理
│   └── sidebar.js          # 共用組件
│
├── api/                     # Serverless Functions
│   ├── index.js            # 主要的 API 入口
│   └── [...path].js        # 通配符處理器（備用）
│
├── routes/                  # Express 路由定義
│   ├── products.js         # GET/POST/PUT/DELETE /api/products
│   ├── orders.js           # GET/POST/PUT/DELETE /api/orders
│   ├── customers.js        # GET/POST/PUT/DELETE /api/customers
│   ├── contacts.js         # GET/POST/PUT/DELETE /api/contacts
│   └── dashboard.js        # GET /api/dashboard/*
│
├── config/                  # 配置文件
│   └── mongodb.js          # MongoDB 連接管理
│
├── server.js               # Express 應用程式主檔
├── vercel.json             # Vercel 部署配置
└── package.json            # 依賴和腳本
```

## 🌐 URL 結構

### 前端 URLs

| URL | 對應文件 | 說明 |
|-----|---------|------|
| `/` | `public/index.html` | 重定向到 `/dashboard.html` |
| `/dashboard.html` | `public/dashboard.html` | 儀表板頁面 |
| `/products.html` | `public/products.html` | 產品管理 |
| `/orders.html` | `public/orders.html` | 訂單管理 |
| `/customers.html` | `public/customers.html` | 客戶管理 |
| `/contacts.html` | `public/contacts.html` | 聯絡人管理 |

### API URLs

| URL | 處理器 | 說明 |
|-----|-------|------|
| `/api/products` | `routes/products.js` | 產品 CRUD |
| `/api/orders` | `routes/orders.js` | 訂單 CRUD |
| `/api/customers` | `routes/customers.js` | 客戶 CRUD |
| `/api/contacts` | `routes/contacts.js` | 聯絡人 CRUD |
| `/api/dashboard` | `routes/dashboard.js` | 儀表板統計 |
| `/api/test-connection` | `server.js` | 測試 MongoDB 連接 |
| `/health` | `server.js` | 健康檢查 |

## 🔄 資料流動

### 新增產品流程範例

```
1. 使用者在 products.html 填寫表單
   ↓
2. 點擊「新增」按鈕
   ↓
3. JavaScript 調用 apiRequest('/products')
   ↓
4. fetch POST 請求到 /api/products
   {
     "name": "新產品",
     "costPrice": 100,
     "sellingPrice": 150,
     ...
   }
   ↓
5. Vercel 路由到 api/index.js
   ↓
6. Express 路由到 routes/products.js
   ↓
7. 驗證資料格式
   ↓
8. 連接 MongoDB (config/mongodb.js)
   ↓
9. 插入文件到 products collection
   ↓
10. MongoDB 返回插入的文件
    ↓
11. Express 返回 JSON
    {
      "success": true,
      "data": { "_id": "...", ... }
    }
    ↓
12. 前端接收回應
    ↓
13. 更新 UI 顯示新產品
    ↓
14. 關閉模態視窗
    ↓
15. 重新載入產品列表
```

## 🛠️ 技術堆疊

### 前端
- **HTML5** - 頁面結構
- **Tailwind CSS** - 樣式框架
- **Vanilla JavaScript** - 互動邏輯
- **Lucide Icons** - 圖標庫
- **Chart.js** - 圖表

### 後端
- **Node.js** - 執行環境
- **Express.js** - Web 框架
- **MongoDB Driver** - 資料庫驅動
- **CORS** - 跨域支援
- **dotenv** - 環境變數

### 基礎設施
- **Vercel** - 部署平台
- **MongoDB Atlas** - 雲端資料庫
- **GitHub** - 版本控制

## 🚀 部署流程

```
1. 開發者推送代碼到 GitHub
   git push origin main
   ↓
2. Vercel 偵測到變更
   ↓
3. Vercel 開始建置
   npm install
   ↓
4. Vercel 複製 public/ 目錄作為靜態資產
   ↓
5. Vercel 將 api/index.js 打包為 serverless function
   ↓
6. 部署完成
   ↓
7. 分配 URL
   https://your-project.vercel.app
   ↓
8. 使用者可以訪問
```

## 🔍 除錯指南

### 檢查前端

```
訪問: https://your-app.vercel.app/dashboard.html
預期: 看到儀表板頁面
問題: 404 錯誤
    → 檢查 vercel.json 的 outputDirectory 設定
    → 確認 public/ 目錄已推送到 GitHub
```

### 檢查 API

```
訪問: https://your-app.vercel.app/api/test-connection
預期: { "success": true, "message": "MongoDB 連線成功!" }
問題: 500 錯誤或資料庫連接失敗
    → 檢查 Vercel 環境變數
    → 確認 MongoDB Atlas IP 白名單
    → 查看 Vercel Function Logs
```

### 檢查日誌

1. Vercel Dashboard → 選擇專案
2. Deployments → 選擇最新部署
3. Functions → 查看 api/index.js 日誌
4. 查找錯誤訊息

## 📊 效能考量

### Serverless Function 限制

- **執行時間**: 10 秒（maxDuration 設定）
- **記憶體**: Vercel 預設配額
- **冷啟動**: 首次請求可能較慢

### 優化建議

1. **資料庫連接池**: 已實作連接重用
2. **快取**: 可考慮添加 Redis
3. **CDN**: Vercel 自動提供全球 CDN

## 🎯 總結

這個架構提供了：
- ✅ **簡單部署**: 推送代碼即可部署
- ✅ **自動擴展**: Vercel 自動處理流量
- ✅ **全球 CDN**: 快速載入靜態文件
- ✅ **安全**: 環境變數保護敏感資訊
- ✅ **成本效益**: Serverless 按使用付費

完美適合中小型應用！🚀
