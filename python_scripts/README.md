# Python 資料庫初始化腳本

此資料夾包含用於初始化 MongoDB 資料庫的 Python 腳本。

## 檔案說明

- **setup_mongodb.py** - MongoDB 資料庫初始化程式
- **requirements.txt** - Python 套件依賴
- **.env.mongodb** - MongoDB 環境變數範例
- **MONGODB_SETUP.md** - 完整設定說明文件

## 使用方式

1. 安裝依賴：
   ```bash
   pip install -r requirements.txt
   ```

2. 設定環境變數（編輯 `.env` 或使用 `.env.mongodb` 範例）

3. 執行初始化：
   ```bash
   python setup_mongodb.py
   ```

詳細說明請參考 `MONGODB_SETUP.md`
