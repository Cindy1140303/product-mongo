# Vercel 部署指南

## 概述

本專案已配置為可在 Vercel 平台上部署，前端和後端都會正確運作。

## 專案結構

```
product-mongo/
├── public/              # 前端靜態文件（Vercel 會從這裡提供服務）
│   ├── index.html      # 主頁（重定向到 dashboard.html）
│   ├── dashboard.html  # 儀表板頁面
│   ├── products.html   # 產品管理頁面
│   ├── orders.html     # 訂單管理頁面
│   ├── customers.html  # 客戶管理頁面
│   ├── contacts.html   # 聯絡人管理頁面
│   └── sidebar.js      # 共用側邊欄組件
├── api/                # 後端 API（Vercel Serverless Functions）
│   ├── index.js        # API 主入口
│   └── [...path].js    # 通配符路由處理器
├── routes/             # Express 路由定義
├── config/             # 配置文件
│   └── mongodb.js      # MongoDB 連接配置
├── server.js           # Express 應用程式
└── vercel.json         # Vercel 部署配置
```

## Vercel 配置說明

### vercel.json 關鍵設定

```json
{
  "outputDirectory": "public",  // 前端文件從 public 目錄提供服務
  "functions": {
    "api/index.js": {            // API 設定為 serverless function
      "maxDuration": 10          // 最大執行時間 10 秒
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",     // 所有 /api/* 請求
      "destination": "/api/index.js"  // 路由到 serverless function
    }
  ]
}
```

## 部署步驟

### 1. 連接 GitHub 倉庫到 Vercel

1. 登入 [Vercel](https://vercel.com)
2. 點擊 "New Project"
3. 選擇 GitHub 倉庫 `Cindy1140303/product-mongo`
4. Vercel 會自動檢測配置

### 2. 設定環境變數

在 Vercel 專案設定中添加以下環境變數：

**必需的環境變數：**

| 變數名 | 說明 | 範例 |
|--------|------|------|
| `DB_USERNAME` | MongoDB Atlas 使用者名稱 | `admin` |
| `DB_PASSWORD` | MongoDB Atlas 密碼 | `your-password-here` |
| `NODE_ENV` | 環境模式 | `production` |

**設定步驟：**

1. 進入 Vercel 專案
2. 點擊 "Settings" → "Environment Variables"
3. 添加上述三個環境變數
4. 確保選擇 "Production"、"Preview" 和 "Development" 環境

### 3. MongoDB Atlas 設定

確保 MongoDB Atlas 已正確配置：

1. **網路存取設定：**
   - 登入 [MongoDB Atlas](https://cloud.mongodb.com)
   - 進入 Network Access
   - 添加 IP 地址 `0.0.0.0/0`（允許所有 IP，適用於 Vercel）
   - 或者添加 Vercel 的 IP 範圍

2. **資料庫使用者：**
   - 確保資料庫使用者已創建
   - 使用者需要有讀寫權限
   - 記下使用者名稱和密碼（用於環境變數）

3. **連接字串：**
   - 系統使用的連接字串格式：
   ```
   mongodb+srv://<DB_USERNAME>:<DB_PASSWORD>@cluster0.rvu2bwc.mongodb.net/?appName=Cluster0
   ```
   - 資料庫名稱：`product_management`

### 4. 部署

1. 在 Vercel 設定好環境變數後
2. 點擊 "Deploy" 或推送代碼到 GitHub
3. Vercel 會自動構建和部署

## 驗證部署

部署完成後，可以通過以下方式驗證：

### 1. 檢查前端

訪問 Vercel 提供的 URL（例如：`https://your-project.vercel.app`）

- 應該會自動重定向到儀表板頁面
- 可以導航到不同的頁面（產品、訂單、客戶、聯絡人）

### 2. 檢查後端 API

訪問 API 健康檢查端點：

```
https://your-project.vercel.app/api/test-connection
```

**成功的回應示例：**

```json
{
  "success": true,
  "message": "MongoDB 連線成功!",
  "database": "product_management",
  "collections": ["products", "orders", "customers", "contacts"],
  "timestamp": "2025-12-20T15:49:20.581Z"
}
```

### 3. 測試 CRUD 操作

在前端頁面嘗試：

- 新增產品、訂單、客戶或聯絡人
- 編輯現有記錄
- 刪除記錄
- 查看儀表板統計數據

## 常見問題

### Q: 前端無法連接到 API

**解決方案：**

1. 檢查環境變數是否正確設定
2. 查看 Vercel 部署日誌
3. 訪問 `/api/test-connection` 檢查後端狀態

### Q: 資料庫連接失敗

**可能原因：**

1. MongoDB Atlas IP 白名單未設定為 `0.0.0.0/0`
2. 資料庫使用者名稱或密碼錯誤
3. 資料庫使用者權限不足

**解決方案：**

1. 檢查 MongoDB Atlas 網路存取設定
2. 驗證環境變數中的使用者名稱和密碼
3. 確保資料庫使用者有讀寫權限

### Q: API 超時

**解決方案：**

1. 檢查 MongoDB 連接字串是否正確
2. 確認資料庫集群是否正常運行
3. 可以在 `vercel.json` 中增加 `maxDuration`（Vercel Pro 計劃支援更長時間）

## 前端 API 配置

所有前端頁面使用相對路徑來調用 API：

```javascript
const API_BASE_URL = '/api';

async function apiRequest(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            'x-user-id': USER_ID
        }
    });
    return await response.json();
}
```

這種配置在 Vercel 上運作正常，因為：

- 前端從 `https://your-project.vercel.app` 提供服務
- API 請求到 `https://your-project.vercel.app/api/*`
- Vercel 的 rewrites 規則會將 API 請求路由到 serverless function

## 本地開發

本地開發時，可以使用 Express 伺服器：

```bash
# 安裝依賴
npm install

# 設定 .env 文件
cp .env.example .env
# 編輯 .env 並填入 MongoDB 憑證

# 啟動開發伺服器
npm run dev
```

訪問 `http://localhost:3000`

## 更新部署

要更新部署，只需將更改推送到 GitHub：

```bash
git add .
git commit -m "更新描述"
git push origin main
```

Vercel 會自動檢測更改並重新部署。

## 監控和日誌

- **Vercel 儀表板：** 查看部署狀態、日誌和分析
- **Runtime Logs：** 在 Vercel 專案中查看 serverless function 的執行日誌
- **MongoDB Atlas：** 查看資料庫連接和查詢日誌

## 安全建議

1. **不要在代碼中硬編碼敏感信息**
2. **定期更新 MongoDB 密碼**
3. **使用 Vercel 的環境變數功能**
4. **考慮添加身份驗證層**（例如 JWT）
5. **限制 MongoDB Atlas 的 IP 存取**（如果可能）

## 支援

如有問題，請查看：

- [Vercel 文檔](https://vercel.com/docs)
- [MongoDB Atlas 文檔](https://docs.atlas.mongodb.com/)
- 專案 GitHub Issues
