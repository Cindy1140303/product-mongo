# 產品訂單管理系統 - 後端 API

這是一個基於 Node.js + Express + Firebase 的後端 API 系統，用於管理產品規格、訂單、客戶和內部聯絡人。

## 功能特色

- ✅ 產品規格管理（CRUD）
- ✅ 訂單管理（CRUD + CSV 匯出）
- ✅ 客戶管理（CRUD）
- ✅ 內部聯絡人管理（CRUD）
- ✅ 儀表板統計與即將到期產品監控
- ✅ Firebase Firestore 資料持久化
- ✅ RESTful API 設計

## 技術堆疊

- **Node.js** (v14+)
- **Express.js** - Web 框架
- **Firebase Admin SDK** - 資料庫與身份驗證
- **CORS** - 跨域請求支援
- **dotenv** - 環境變數管理

## 專案結構

```
product/
├── config/
│   └── firebase.js          # Firebase Admin SDK 配置
├── routes/
│   ├── products.js          # 產品規格 API
│   ├── orders.js            # 訂單 API
│   ├── customers.js         # 客戶 API
│   ├── contacts.js          # 聯絡人 API
│   └── dashboard.js         # 儀表板 API
├── .env                     # 環境變數（需自行建立）
├── .env.example             # 環境變數範例
├── .gitignore               # Git 忽略檔案
├── package.json             # 專案依賴
├── server.js                # Express 伺服器主檔案
└── README.md                # 本文件
```

## 安裝步驟

### 1. 複製或下載專案

```bash
cd c:\Users\love3\Downloads\product
```

### 2. 安裝依賴套件

```bash
npm install
```

### 3. 設定 Firebase

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 建立或選擇一個專案
3. 前往「專案設定」→「服務帳戶」
4. 點擊「產生新的私密金鑰」，下載 JSON 檔案
5. 從 JSON 檔案中取得以下資訊：
   - `project_id`
   - `private_key`
   - `client_email`

### 4. 設定環境變數

複製 `.env.example` 為 `.env`：

```bash
copy .env.example .env
```

編輯 `.env` 檔案，填入您的 Firebase 配置：

```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project-id.iam.gserviceaccount.com

PORT=3000
NODE_ENV=development
APP_ID=default-app-id
```

⚠️ **注意**：`FIREBASE_PRIVATE_KEY` 必須包含完整的私鑰內容，包括 `\n` 換行符號。

### 5. 啟動伺服器

```bash
# 開發模式（使用 nodemon 自動重啟）
npm run dev

# 生產模式
npm start
```

伺服器預設運行於 `http://localhost:3000`

## API 端點

所有 API 請求都需要在 HTTP 標頭中提供 `x-user-id`：

```
x-user-id: <使用者ID>
```

### 健康檢查

```
GET /health
```

### 產品規格 API (`/api/products`)

| 方法 | 端點 | 說明 |
|------|------|------|
| GET | `/api/products` | 取得所有產品規格 |
| GET | `/api/products/:id` | 取得單一產品規格 |
| POST | `/api/products` | 新增產品規格 |
| PUT | `/api/products/:id` | 更新產品規格 |
| DELETE | `/api/products/:id` | 刪除產品規格 |

**POST/PUT 請求體範例：**
```json
{
  "name": "產品A",
  "content": "產品描述",
  "costPrice": 100.00,
  "sellingPrice": 150.00,
  "quantity": 50,
  "serialPrefix": "PROD-A",
  "expirationDate": "2025-12-31"
}
```

### 訂單 API (`/api/orders`)

| 方法 | 端點 | 說明 |
|------|------|------|
| GET | `/api/orders` | 取得所有訂單（支援 `?search=關鍵字`） |
| GET | `/api/orders/:id` | 取得單一訂單 |
| POST | `/api/orders` | 新增訂單 |
| PUT | `/api/orders/:id` | 更新訂單 |
| DELETE | `/api/orders/:id` | 刪除訂單 |
| GET | `/api/orders/export/csv` | 匯出訂單為 CSV 檔案 |

**POST/PUT 請求體範例：**
```json
{
  "productName": "產品A",
  "serialNumber": "PROD-A-001",
  "unitPrice": 150.00,
  "quantity": 10,
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "customerName": "客戶A"
}
```

### 客戶 API (`/api/customers`)

| 方法 | 端點 | 說明 |
|------|------|------|
| GET | `/api/customers` | 取得所有客戶（支援 `?search=關鍵字`） |
| GET | `/api/customers/:id` | 取得單一客戶 |
| POST | `/api/customers` | 新增客戶 |
| PUT | `/api/customers/:id` | 更新客戶 |
| DELETE | `/api/customers/:id` | 刪除客戶 |

**POST/PUT 請求體範例：**
```json
{
  "name": "客戶A公司",
  "contactPerson": "張三",
  "phone": "02-12345678",
  "email": "contact@example.com"
}
```

### 聯絡人 API (`/api/contacts`)

| 方法 | 端點 | 說明 |
|------|------|------|
| GET | `/api/contacts` | 取得所有聯絡人（支援 `?search=關鍵字`） |
| GET | `/api/contacts/:id` | 取得單一聯絡人 |
| POST | `/api/contacts` | 新增聯絡人 |
| PUT | `/api/contacts/:id` | 更新聯絡人 |
| DELETE | `/api/contacts/:id` | 刪除聯絡人 |

**POST/PUT 請求體範例：**
```json
{
  "name": "李四",
  "department": "業務部",
  "phone": "分機 1234",
  "email": "lisi@company.com"
}
```

### 儀表板 API (`/api/dashboard`)

| 方法 | 端點 | 說明 |
|------|------|------|
| GET | `/api/dashboard` | 取得儀表板統計資料與即將到期產品 |
| GET | `/api/dashboard/expiring-products` | 取得即將到期產品（支援 `?days=30`） |

## API 測試範例

使用 cURL 測試 API：

```bash
# 取得所有產品
curl -H "x-user-id: test-user-123" http://localhost:3000/api/products

# 新增產品
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user-123" \
  -d "{\"name\":\"測試產品\",\"costPrice\":100,\"sellingPrice\":150,\"quantity\":10,\"expirationDate\":\"2025-12-31\"}"

# 取得儀表板資料
curl -H "x-user-id: test-user-123" http://localhost:3000/api/dashboard
```

使用 PowerShell：

```powershell
# 取得所有產品
Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Headers @{"x-user-id"="test-user-123"}

# 新增產品
$body = @{
    name = "測試產品"
    costPrice = 100
    sellingPrice = 150
    quantity = 10
    expirationDate = "2025-12-31"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/products" -Method Post -Body $body -ContentType "application/json" -Headers @{"x-user-id"="test-user-123"}
```

## 錯誤處理

API 回應格式統一如下：

**成功回應：**
```json
{
  "success": true,
  "message": "操作成功",
  "data": { ... }
}
```

**錯誤回應：**
```json
{
  "success": false,
  "message": "錯誤訊息",
  "error": "詳細錯誤資訊（僅開發環境）"
}
```

## 開發說明

### 資料結構

所有資料存儲在 Firestore 中，路徑結構如下：

```
artifacts/{APP_ID}/users/{USER_ID}/{COLLECTION_NAME}/{DOC_ID}
```

- **APP_ID**：應用程式 ID（從環境變數取得）
- **USER_ID**：使用者 ID（從請求標頭取得）
- **COLLECTION_NAME**：集合名稱（products, orders, customers, contacts）

### 新增功能

若要新增新的 API 路由：

1. 在 `routes/` 資料夾中建立新的路由檔案
2. 在 `server.js` 中註冊新路由：
   ```javascript
   app.use('/api/your-route', require('./routes/your-route'));
   ```

## 注意事項

- 請勿將 `.env` 檔案提交到 Git
- 請勿將 Firebase 私鑰公開或分享
- 生產環境建議使用更完善的身份驗證機制
- 建議在前端實作 Firebase ID Token 驗證

## 授權

MIT License

## 聯絡方式

如有問題或建議，請聯絡開發團隊。
