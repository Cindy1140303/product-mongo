"""
MongoDB 資料庫初始化程式
用於建立產品訂單管理系統的資料庫和集合
"""

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# 載入環境變數
load_dotenv()

# MongoDB 連接設定
DB_USERNAME = os.getenv('DB_USERNAME', 'your_username')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'your_password')
MONGO_URI = f"mongodb+srv://{DB_USERNAME}:{DB_PASSWORD}@cluster0.rvu2bwc.mongodb.net/?appName=Cluster0"

# 資料庫名稱
DATABASE_NAME = "product_order_management"

def connect_to_mongodb():
    """連接到 MongoDB"""
    try:
        print("🔄 正在連接到 MongoDB...")
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        
        # 測試連接
        client.admin.command('ping')
        print("✅ MongoDB 連接成功！")
        return client
    except ConnectionFailure:
        print("❌ MongoDB 連接失敗：無法連接到伺服器")
        return None
    except ServerSelectionTimeoutError:
        print("❌ MongoDB 連接超時：請檢查網路連接和認證資訊")
        return None
    except Exception as e:
        print(f"❌ 連接錯誤：{e}")
        return None

def create_database_and_collections(client):
    """建立資料庫和集合"""
    try:
        # 選擇或建立資料庫
        db = client[DATABASE_NAME]
        print(f"\n📁 資料庫 '{DATABASE_NAME}' 已準備就緒")
        
        # 定義集合名稱
        collections = {
            'products': '產品規格',
            'orders': '訂單',
            'customers': '客戶',
            'contacts': '內部聯絡人'
        }
        
        # 建立集合
        print("\n🔧 建立集合...")
        existing_collections = db.list_collection_names()
        
        for collection_name, description in collections.items():
            if collection_name not in existing_collections:
                db.create_collection(collection_name)
                print(f"  ✅ 已建立集合: {collection_name} ({description})")
            else:
                print(f"  ℹ️  集合已存在: {collection_name} ({description})")
        
        return db
    except Exception as e:
        print(f"❌ 建立資料庫錯誤：{e}")
        return None

def create_indexes(db):
    """建立索引以提升查詢效能"""
    try:
        print("\n🔍 建立索引...")
        
        # 產品規格索引
        db.products.create_index("name", unique=True)
        db.products.create_index("expirationDate")
        print("  ✅ 產品規格索引已建立")
        
        # 訂單索引
        db.orders.create_index("serialNumber", unique=True)
        db.orders.create_index("customerName")
        db.orders.create_index("productName")
        db.orders.create_index([("startDate", 1), ("endDate", 1)])
        print("  ✅ 訂單索引已建立")
        
        # 客戶索引
        db.customers.create_index("name", unique=True)
        db.customers.create_index("email")
        print("  ✅ 客戶索引已建立")
        
        # 聯絡人索引
        db.contacts.create_index("email")
        db.contacts.create_index("department")
        print("  ✅ 聯絡人索引已建立")
        
    except Exception as e:
        print(f"⚠️  建立索引警告：{e}")

def insert_sample_data(db):
    """插入範例資料"""
    try:
        print("\n📝 插入範例資料...")
        
        # 檢查是否已有資料
        if db.products.count_documents({}) > 0:
            print("  ℹ️  資料庫已有資料，跳過範例資料插入")
            return
        
        # 範例產品資料
        sample_products = [
            {
                "name": "產品 A",
                "content": "這是產品 A 的描述",
                "costPrice": 100.00,
                "sellingPrice": 150.00,
                "quantity": 50,
                "serialPrefix": "PROD-A",
                "expirationDate": (datetime.now() + timedelta(days=45)).strftime("%Y-%m-%d"),
                "createdAt": datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat()
            },
            {
                "name": "產品 B",
                "content": "這是產品 B 的描述",
                "costPrice": 200.00,
                "sellingPrice": 300.00,
                "quantity": 30,
                "serialPrefix": "PROD-B",
                "expirationDate": (datetime.now() + timedelta(days=15)).strftime("%Y-%m-%d"),
                "createdAt": datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat()
            }
        ]
        
        # 範例客戶資料
        sample_customers = [
            {
                "name": "測試客戶公司",
                "contactPerson": "張三",
                "phone": "02-12345678",
                "email": "zhangsan@example.com",
                "createdAt": datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat()
            },
            {
                "name": "ABC 企業",
                "contactPerson": "李四",
                "phone": "02-87654321",
                "email": "lisi@abc.com",
                "createdAt": datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat()
            }
        ]
        
        # 範例聯絡人資料
        sample_contacts = [
            {
                "name": "王五",
                "department": "業務部",
                "phone": "分機 1001",
                "email": "wangwu@company.com",
                "createdAt": datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat()
            },
            {
                "name": "趙六",
                "department": "技術部",
                "phone": "分機 1002",
                "email": "zhaoliu@company.com",
                "createdAt": datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat()
            }
        ]
        
        # 插入資料
        db.products.insert_many(sample_products)
        print(f"  ✅ 已插入 {len(sample_products)} 筆產品資料")
        
        db.customers.insert_many(sample_customers)
        print(f"  ✅ 已插入 {len(sample_customers)} 筆客戶資料")
        
        db.contacts.insert_many(sample_contacts)
        print(f"  ✅ 已插入 {len(sample_contacts)} 筆聯絡人資料")
        
        # 範例訂單資料（使用已插入的客戶和產品）
        sample_orders = [
            {
                "productName": "產品 A",
                "serialNumber": "PROD-A-001",
                "unitPrice": 150.00,
                "quantity": 10,
                "startDate": datetime.now().strftime("%Y-%m-%d"),
                "endDate": (datetime.now() + timedelta(days=365)).strftime("%Y-%m-%d"),
                "customerName": "測試客戶公司",
                "createdAt": datetime.now().isoformat(),
                "updatedAt": datetime.now().isoformat()
            }
        ]
        
        db.orders.insert_many(sample_orders)
        print(f"  ✅ 已插入 {len(sample_orders)} 筆訂單資料")
        
    except Exception as e:
        print(f"⚠️  插入範例資料警告：{e}")

def display_database_info(client, db):
    """顯示資料庫資訊"""
    try:
        print("\n" + "="*60)
        print("📊 資料庫資訊")
        print("="*60)
        
        # 資料庫列表
        db_list = client.list_database_names()
        print(f"\n所有資料庫: {', '.join(db_list)}")
        
        # 集合統計
        print(f"\n'{DATABASE_NAME}' 集合統計:")
        collections = db.list_collection_names()
        
        collection_names = {
            'products': '產品規格',
            'orders': '訂單',
            'customers': '客戶',
            'contacts': '內部聯絡人'
        }
        
        for collection_name in collections:
            count = db[collection_name].count_documents({})
            cn_name = collection_names.get(collection_name, collection_name)
            print(f"  • {collection_name} ({cn_name}): {count} 筆資料")
        
        print("\n" + "="*60)
        
    except Exception as e:
        print(f"❌ 顯示資訊錯誤：{e}")

def main():
    """主程式"""
    print("="*60)
    print("🚀 MongoDB 資料庫初始化程式")
    print("   產品訂單管理系統")
    print("="*60)
    
    # 連接到 MongoDB
    client = connect_to_mongodb()
    if not client:
        print("\n❌ 程式終止：無法連接到 MongoDB")
        return
    
    try:
        # 建立資料庫和集合
        db = create_database_and_collections(client)
        if not db:
            print("\n❌ 程式終止：無法建立資料庫")
            return
        
        # 建立索引
        create_indexes(db)
        
        # 詢問是否插入範例資料
        print("\n")
        insert_sample = input("是否要插入範例資料？(y/n): ").lower().strip()
        if insert_sample == 'y':
            insert_sample_data(db)
        
        # 顯示資料庫資訊
        display_database_info(client, db)
        
        print("\n✅ 資料庫初始化完成！")
        print(f"\n💡 連接字串: {MONGO_URI.replace(DB_PASSWORD, '***')}")
        print(f"💡 資料庫名稱: {DATABASE_NAME}")
        
    except Exception as e:
        print(f"\n❌ 執行錯誤：{e}")
    finally:
        # 關閉連接
        client.close()
        print("\n👋 已關閉 MongoDB 連接")

if __name__ == "__main__":
    main()
