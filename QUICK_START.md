# 快速部署指南 - 連接前端到 Vercel 後端

## 🎯 問題解決方案

已完成前端到 Vercel 後端的連接配置！現在您可以部署到 Vercel 並看到資料庫資料。

## ✅ 完成的更改

1. **建立 `public` 目錄** - 存放所有前端靜態文件
2. **更新 `vercel.json`** - 配置 Vercel 從 public 目錄提供服務
3. **配置 API 路由** - 確保 /api/* 請求正確路由到後端
4. **建立部署文檔** - 詳細的部署說明

## 🚀 接下來的步驟

### 1. 設定 MongoDB Atlas（如果還沒有）

1. 登入 [MongoDB Atlas](https://cloud.mongodb.com)
2. 建立資料庫叢集（或使用現有的）
3. 在 "Network Access" 中添加 IP：`0.0.0.0/0`（允許從任何地方連接）
4. 在 "Database Access" 中建立使用者並記下：
   - 使用者名稱（例如：`admin`）
   - 密碼（例如：`yourpassword123`）

### 2. 在 Vercel 設定環境變數

1. 登入 [Vercel](https://vercel.com)
2. 選擇您的專案（或連接 GitHub 倉庫）
3. 進入 **Settings** → **Environment Variables**
4. 添加以下三個環境變數：

   | 變數名 | 值 |
   |--------|-----|
   | `DB_USERNAME` | 您的 MongoDB 使用者名稱 |
   | `DB_PASSWORD` | 您的 MongoDB 密碼 |
   | `NODE_ENV` | `production` |

5. 確保選擇所有環境：Production, Preview, Development

### 3. 部署

推送代碼到 GitHub（或直接在 Vercel 部署）：

```bash
git push origin main
```

Vercel 會自動：
- 偵測到您的配置
- 建立專案
- 部署前端和後端

### 4. 驗證部署

部署完成後：

1. **訪問您的網站**：
   - Vercel 會提供一個 URL（例如：`https://your-project.vercel.app`）
   - 您應該會看到儀表板頁面

2. **測試 API 連接**：
   - 訪問：`https://your-project.vercel.app/api/test-connection`
   - 應該會看到類似這樣的回應：
     ```json
     {
       "success": true,
       "message": "MongoDB 連線成功!",
       "database": "product_management",
       "collections": ["products", "orders", "customers", "contacts"]
     }
     ```

3. **測試前端功能**：
   - 嘗試新增產品、訂單、客戶等
   - 確認資料可以正常保存和顯示

## 📂 專案結構說明

```
product-mongo/
├── public/              ← 前端文件（會部署到 Vercel）
│   ├── index.html      ← 主頁（自動重定向到儀表板）
│   ├── dashboard.html  ← 儀表板
│   ├── products.html   ← 產品管理
│   ├── orders.html     ← 訂單管理
│   ├── customers.html  ← 客戶管理
│   ├── contacts.html   ← 聯絡人管理
│   └── sidebar.js      ← 共用側邊欄
│
├── api/                 ← 後端 API（Vercel Serverless Functions）
│   └── index.js        ← API 主入口
│
├── routes/              ← Express 路由
│   ├── products.js
│   ├── orders.js
│   ├── customers.js
│   ├── contacts.js
│   └── dashboard.js
│
├── config/
│   └── mongodb.js      ← MongoDB 連接配置
│
├── server.js           ← Express 應用
└── vercel.json         ← Vercel 配置
```

## 🔧 工作原理

1. **前端請求**：用戶訪問 `https://your-app.vercel.app/dashboard.html`
   - Vercel 從 `public/dashboard.html` 提供服務

2. **API 請求**：前端 JavaScript 調用 `/api/products`
   - Vercel 攔截 `/api/*` 請求
   - 路由到 `api/index.js` serverless function
   - Express 處理請求並連接 MongoDB
   - 返回資料給前端

## ⚙️ 關鍵配置文件

### vercel.json
```json
{
  "outputDirectory": "public",  // 前端從這裡提供服務
  "functions": {
    "api/index.js": {
      "maxDuration": 10
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.js"  // API 請求路由到這裡
    }
  ]
}
```

## 📚 詳細文檔

- **完整部署指南**：[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- **MongoDB 說明**：[README_MONGODB.md](./README_MONGODB.md)
- **遷移筆記**：[MIGRATION_NOTES.md](./MIGRATION_NOTES.md)

## 🐛 常見問題

### 問題：API 返回 503 錯誤
**解決方案**：
- 檢查 Vercel 環境變數是否正確設定
- 確認 MongoDB Atlas IP 白名單包含 `0.0.0.0/0`

### 問題：前端無法載入
**解決方案**：
- 確認 `public` 目錄已正確推送到 GitHub
- 檢查 `vercel.json` 中的 `outputDirectory` 設定

### 問題：資料庫連接失敗
**解決方案**：
- 驗證 `DB_USERNAME` 和 `DB_PASSWORD` 環境變數
- 確認 MongoDB Atlas 使用者權限正確
- 檢查資料庫叢集是否正常運行

## 💡 提示

- 每次推送到 GitHub，Vercel 會自動重新部署
- 在 Vercel 儀表板可以查看部署日誌
- 使用 Vercel 的 Preview 功能測試變更

## 📞 需要協助？

查看詳細文檔或在 GitHub Issues 中提問。
