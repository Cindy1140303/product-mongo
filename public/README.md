# Public 目錄說明

這個目錄包含所有前端靜態文件，會在 Vercel 部署時提供服務。

## 📁 文件說明

| 文件 | 說明 |
|------|------|
| `index.html` | 主頁，自動重定向到 dashboard.html |
| `dashboard.html` | 儀表板頁面（統計資料、圖表、即將到期產品） |
| `products.html` | 產品規格管理頁面（新增、編輯、刪除產品） |
| `orders.html` | 訂單管理頁面（新增、編輯、刪除訂單、CSV 匯出） |
| `customers.html` | 客戶管理頁面（新增、編輯、刪除客戶） |
| `contacts.html` | 內部聯絡人管理頁面（新增、編輯、刪除聯絡人） |
| `sidebar.js` | 共用側邊欄組件（導航功能） |

## 🌐 URL 對應

部署到 Vercel 後，這些文件可以通過以下 URL 訪問：

- `https://your-app.vercel.app/` → `index.html` → 重定向到 `/dashboard.html`
- `https://your-app.vercel.app/dashboard.html` → `dashboard.html`
- `https://your-app.vercel.app/products.html` → `products.html`
- `https://your-app.vercel.app/orders.html` → `orders.html`
- `https://your-app.vercel.app/customers.html` → `customers.html`
- `https://your-app.vercel.app/contacts.html` → `contacts.html`

## 🔧 技術細節

### 前端框架
- **樣式**: Tailwind CSS (CDN)
- **圖標**: Lucide Icons (CDN)
- **圖表**: Chart.js (CDN)
- **JavaScript**: Vanilla JS (無需建置步驟)

### API 調用
所有頁面使用統一的 API 調用模式：

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

### 導航
使用 `sidebar.js` 提供一致的側邊欄導航：

```javascript
// 在每個頁面中使用
<script src="sidebar.js"></script>
<script>generateSidebar('dashboard');</script>
```

## ⚙️ Vercel 配置

在 `vercel.json` 中，這個目錄被設定為 `outputDirectory`：

```json
{
  "outputDirectory": "public"
}
```

這告訴 Vercel 從這個目錄提供靜態文件服務。

## 🎨 自訂樣式

每個頁面都包含內嵌樣式來自訂：
- 按鈕樣式
- 表格樣式
- 導航按鈕狀態
- 懸停效果

## 📱 響應式設計

所有頁面使用 Tailwind CSS 的響應式類別：
- `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` - 自適應網格
- `flex-col md:flex-row` - 彈性布局
- `p-4 md:p-8` - 響應式間距

## 🔄 頁面互動流程

1. 使用者訪問頁面
2. 頁面載入並執行 `loadData()` 函數
3. 發送 API 請求到後端
4. 接收資料並渲染到表格
5. 使用者可以新增、編輯或刪除項目
6. 操作後重新載入資料

## 📝 修改指南

如果要修改前端：

1. 編輯 `public/` 目錄中的 HTML 文件
2. 測試本地變更（可以用 `python -m http.server 8000`）
3. 提交並推送到 GitHub
4. Vercel 會自動重新部署

## 🚫 注意事項

- ⚠️ 這個目錄中的文件會直接提供給使用者
- ⚠️ 不要在這裡放置敏感資訊
- ⚠️ 所有 API 密鑰應該在後端環境變數中
- ⚠️ 保持文件體積小以優化載入速度

## 📚 相關文檔

- 完整架構說明：`../ARCHITECTURE.md`
- 部署指南：`../VERCEL_DEPLOYMENT.md`
- 快速開始：`../QUICK_START.md`
