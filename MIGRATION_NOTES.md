# 遷移至 MongoDB

## 主要變更

### 後端 (Backend)
✅ 創建 `config/mongodb.js` - MongoDB 連線管理
✅ 更新所有路由檔案使用 MongoDB 驅動程式
  - routes/products.js
  - routes/orders.js
  - routes/customers.js
  - routes/contacts.js
  - routes/dashboard.js
✅ 更新 `server.js` 使用 MongoDB 初始化
✅ 更新 `package.json` 依賴 (mongodb 取代 firebase-admin)

### 前端 (Frontend)
✅ 移除 Firebase SDK 導入
✅ 實作 API 請求函數 (apiRequest)
✅ 更新所有 CRUD 操作使用 REST API
✅ CSV 匯出改用後端 API endpoint
✅ 確保 closeModal() 和所有按鈕功能正常

### 環境變數 (Environment Variables)
需要設定:
- DB_USERNAME=<your_mongodb_username>
- DB_PASSWORD=<your_mongodb_password>
- NODE_ENV=production

### Vercel 部署設定
在 Vercel 專案中設定環境變數:
1. 進入專案 Settings → Environment Variables
2. 添加 DB_USERNAME
3. 添加 DB_PASSWORD
4. 添加 NODE_ENV=production

## Git 提交

```bash
git add .
git commit -m "遷移至 MongoDB: 移除 Firebase 依賴，實作完整 REST API 架構"
git push origin main
```

## 測試清單

### 本地測試 (需先安裝 mongodb 套件)
- [ ] npm install
- [ ] 設定 .env 檔案
- [ ] npm start
- [ ] 測試 /health endpoint
- [ ] 測試所有 CRUD 操作

### 前端功能測試
- [ ] 所有頁面正常載入
- [ ] 新增功能正常
- [ ] 編輯功能正常
- [ ] 刪除功能正常
- [ ] 取消按鈕關閉視窗
- [ ] CSV 匯出功能
- [ ] 搜尋功能

### Vercel 部署測試
- [ ] 環境變數已設定
- [ ] 部署成功
- [ ] /health endpoint 顯示 MongoDB connected
- [ ] API 端點正常運作

## 後續改進建議

1. 添加使用者認證系統
2. 實作 JWT token 驗證
3. 添加 API 速率限制
4. 實作資料驗證層
5. 添加單元測試和整合測試

## MongoDB 連線字串格式

```
mongodb+srv://<DB_USERNAME>:<DB_PASSWORD>@cluster0.rvu2bwc.mongodb.net/?appName=Cluster0
```

確保在 MongoDB Atlas 中:
- 建立資料庫使用者
- 將 Vercel IP 加入白名單 (或允許所有 IP: 0.0.0.0/0)
- 資料庫名稱: product_management
