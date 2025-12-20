// 動態生成側邊欄導航
function generateSidebar(currentPage) {
    const sidebarHTML = `
    <div class="w-64 bg-white shadow-xl h-screen sticky top-0">
        <div class="p-6 border-b">
            <h1 class="text-2xl font-bold text-gray-800">管理儀表板</h1>
            <p class="text-sm text-gray-500 mt-1">導航</p>
        </div>
        <nav class="flex flex-col p-4 space-y-2">
            <a href="dashboard.html" class="nav-btn flex items-center p-3 rounded-lg ${currentPage === 'dashboard' ? 'active' : ''}">
                <i data-lucide="layout-grid" class="w-5 h-5 mr-3"></i>儀表板
            </a>
            <a href="orders.html" class="nav-btn flex items-center p-3 rounded-lg ${currentPage === 'orders' ? 'active' : ''}">
                <i data-lucide="clipboard-list" class="w-5 h-5 mr-3"></i>產品訂單管理
            </a>
            <a href="products.html" class="nav-btn flex items-center p-3 rounded-lg ${currentPage === 'products' ? 'active' : ''}">
                <i data-lucide="package" class="w-5 h-5 mr-3"></i>產品規格登錄
            </a>
            <a href="customers.html" class="nav-btn flex items-center p-3 rounded-lg ${currentPage === 'customers' ? 'active' : ''}">
                <i data-lucide="users" class="w-5 h-5 mr-3"></i>客戶管理
            </a>
            <a href="contacts.html" class="nav-btn flex items-center p-3 rounded-lg ${currentPage === 'contacts' ? 'active' : ''}">
                <i data-lucide="contact" class="w-5 h-5 mr-3"></i>內部聯絡人建立
            </a>
        </nav>
    </div>
    `;
    
    // 插入到 body 開頭
    const container = document.createElement('div');
    container.innerHTML = sidebarHTML;
    document.body.insertBefore(container.firstElementChild, document.body.firstChild);
    
    // 重新渲染 Lucide 圖標
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}
