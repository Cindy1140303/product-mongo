// 動態生成側邊欄導航
function generateSidebar(currentPage) {
    const sidebarHTML = `
    <div class="w-64 bg-gray-50 h-screen sticky top-0 overflow-y-auto p-4">
        <div class="mb-6">
            <h1 class="text-xl font-bold text-gray-800">管理系統</h1>
        </div>
        <nav class="flex flex-col gap-3">
            <a href="dashboard.html" class="nav-btn ${currentPage === 'dashboard' ? 'active' : ''} flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200">
                <i data-lucide="layout-grid" class="w-5 h-5"></i>
                <span>儀表板</span>
            </a>
            <a href="orders.html" class="nav-btn ${currentPage === 'orders' ? 'active' : ''} flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200">
                <i data-lucide="clipboard-list" class="w-5 h-5"></i>
                <span>產品訂單管理</span>
            </a>
            <a href="products.html" class="nav-btn ${currentPage === 'products' ? 'active' : ''} flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200">
                <i data-lucide="package" class="w-5 h-5"></i>
                <span>產品規格登錄</span>
            </a>
            <a href="customers.html" class="nav-btn ${currentPage === 'customers' ? 'active' : ''} flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200">
                <i data-lucide="users" class="w-5 h-5"></i>
                <span>客戶管理</span>
            </a>
            <a href="contacts.html" class="nav-btn ${currentPage === 'contacts' ? 'active' : ''} flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200">
                <i data-lucide="contact" class="w-5 h-5"></i>
                <span>內部聯絡人建立</span>
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
