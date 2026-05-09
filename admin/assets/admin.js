// CONFIGURATION & STATE
const config = {
    sidebar_bg: "#0f172a",
    card_bg: "#ffffff",
    card_text: "#111827",
    primary_action: "#000000",
    font_family: "Acme"
};

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('collapsed');
    
    // Optional: Save the preference to local storage so it stays collapsed on refresh
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('sidebar-collapsed', isCollapsed);
}

// On Page Load: Check if it was previously collapsed
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    if (localStorage.getItem('sidebar-collapsed') === 'true') {
        sidebar.classList.add('collapsed');
    }
});

let currentPeriod = 'week'; 
let orders = []; 

//  DYNAMIC DATA PROCESSING
function getDynamicChartData(period) {
    const now = new Date();
    let labels = [];
    let ordersCount = [];
    let revenueSum = [];

    if (period === 'week') {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); 
        const monday = new Date(new Date().setDate(diff));
        
        for (let i = 0; i < 7; i++) {
            let d = new Date(monday);
            d.setDate(monday.getDate() + i);
            const dateKey = d.toDateString();
            labels.push(d.toLocaleDateString([], { weekday: 'short' }));
            
            const dayOrders = orders.filter(o => new Date(o.created_at).toDateString() === dateKey);
            ordersCount.push(dayOrders.length);
            revenueSum.push(dayOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0));
        }
    } 
    else if (period === 'month') {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        let currentIter = new Date(firstDay);
        let weekNum = 1;

        while (currentIter <= lastDay) {
            labels.push(`Week ${weekNum}`);
            let weekEnd = new Date(currentIter);
            weekEnd.setDate(currentIter.getDate() + 6);
            if (weekEnd > lastDay) weekEnd = lastDay;

            const weekOrders = orders.filter(o => {
                const d = new Date(o.created_at);
                return d >= currentIter && d <= weekEnd;
            });
            ordersCount.push(weekOrders.length);
            revenueSum.push(weekOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0));
            currentIter.setDate(currentIter.getDate() + 7);
            weekNum++;
        }
    } 
    else if (period === 'year') {
        for (let i = 0; i < 12; i++) {
            let d = new Date(now.getFullYear(), i, 1);
            labels.push(d.toLocaleDateString([], { month: 'short' }));
            const monthOrders = orders.filter(o => {
                const date = new Date(o.created_at);
                return date.getMonth() === i && date.getFullYear() === now.getFullYear();
            });
            ordersCount.push(monthOrders.length);
            revenueSum.push(monthOrders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0));
        }
    }
    return { labels, orders: ordersCount, revenue: revenueSum };
}

// UI FOR CHARTS RENDERING
function createCombinedChart(containerId, ordersData, revenueData, labels) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    
    const maxOrders = Math.max(...ordersData, 1);
    const maxRevenue = Math.max(...revenueData, 1);
    
    labels.forEach((label, index) => {
        const oVal = ordersData[index];
        const rVal = revenueData[index];
        const barItem = document.createElement('div');
        barItem.className = 'p-4 rounded-xl mb-2 bg-black shadow-sm border border-gray-100';
        
        barItem.innerHTML = `
            <div class="mb-2">
                <span class="text-sm block mb-3" style="color: white">${label}</span>
                <div class="mb-4">
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-[14px] uppercase opacity-100" style="color: white;">Orders</span>
                        <span class="text-[14px] opacity-100" style="color: white;">${oVal}</span>
                    </div>
                    <div class="w-full bg-black rounded-full h-[10px] " style="border: 1px solid #ffffff2e;">
                        <div class="h-full rounded-full transition-all duration-700" style="width: ${(oVal/maxOrders)*100}%; background: #fff;"></div>
                    </div>
                </div>
                <div>
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-[14px] uppercase opacity-100" style="color: white;">Revenue</span>
                        <span class="text-[14px] opacity-100" style="color: white;">₦${rVal.toLocaleString()}</span>
                    </div>
                    <div class="w-full bg-black-100 rounded-full h-[10px]" style="border: 1px solid #ffffff2e;">
                        <div class="h-full rounded-full transition-all duration-700" style="width: ${(rVal/maxRevenue)*100}%;  background: #fff;"></div>
                    </div>
                </div>
            </div>`;
        container.appendChild(barItem);
    });
}

function initCharts() {
    if (!orders || orders.length === 0) return;

    const data = getDynamicChartData(currentPeriod);
    createCombinedChart('combinedChart', data.orders, data.revenue, data.labels);
    
    const totalPeriodOrders = data.orders.reduce((a, b) => a + b, 0);
    const totalPeriodRevenue = data.revenue.reduce((a, b) => a + b, 0);

    const ordersProgressVal = document.getElementById('orders-progress-value');
    const revenueProgressVal = document.getElementById('revenue-progress-value');
    if (ordersProgressVal) ordersProgressVal.textContent = totalPeriodOrders;
    if (revenueProgressVal) revenueProgressVal.textContent = '₦' + totalPeriodRevenue.toLocaleString();

    const todayStr = new Date().toDateString();
    
    const totalOverallRev = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const incomeToday = orders
        .filter(o => new Date(o.created_at).toDateString() === todayStr)
        .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    const ordersTodayCount = orders.filter(o => new Date(o.created_at).toDateString() === todayStr).length;

    const newOrdersCount = orders.filter(o => {
        const isToday = new Date(o.created_at).toDateString() === todayStr;
        const status = o.status ? o.status.toLowerCase() : '';
        return isToday && status !== 'dispatched' && status !== 'delivered';
    }).length;

    const elRev = document.getElementById('revenue-value');
    const elInc = document.getElementById('income-value');
    const elOrd = document.getElementById('orders-value');
    const elNew = document.getElementById('new-orders-value');

    if(elRev) elRev.textContent = '₦' + totalOverallRev.toLocaleString();
    if(elInc) elInc.textContent = '₦' + incomeToday.toLocaleString();
    if(elOrd) elOrd.textContent = ordersTodayCount.toLocaleString();
    if(elNew) elNew.textContent = newOrdersCount; 

    updatePeriodButtonStyles();
}

 // DATABASE SYNC (No Cache)
async function fetchOrdersFromDB() {
    try {
        const response = await fetch(`api/fetch_orders.php?t=${Date.now()}`, {
            cache: "no-store" 
        });
        
        if (!response.ok) throw new Error('Fetch failed');
        const data = await response.json();
        
        orders = data; 
        
        // Update both pages immediately on fetch
        initCharts();
        if (typeof renderOrdersList === 'function') renderOrdersList();
        
    } catch (err) { 
        console.error("Sync Error:", err); 
    }
}

 //. NAVIGATION FOR PAGES
function switchPage(pageName) {
    document.querySelectorAll('.page-content').forEach(p => {
        p.style.display = 'none';
        p.classList.remove('active');
    });

    const target = document.getElementById(pageName + '-page');
    if (target) {
        target.style.display = 'block';
        target.classList.add('active');
        
        // Force immediate render based on the page name
        if (pageName === 'overview') {
            initCharts();
        } else if (pageName === 'orders' && typeof renderOrdersList === 'function') {
            renderOrdersList();
        } 
        // ADD THIS PART BELOW:
        else if (pageName === 'feedback' && typeof loadAdminFeedback === 'function') {
            loadAdminFeedback(); 
        }
    }

    // Handle Navigation active classes
    document.querySelectorAll('.nav-link, .footer-nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === pageName);
    });
}

function updatePeriodButtonStyles() {
    document.querySelectorAll('.period-btn').forEach(btn => {
        if (btn.dataset.period === currentPeriod) {
            btn.style.backgroundColor = config.primary_action;
            btn.style.color = '#ffffff';
        } else {
            btn.style.backgroundColor = '#f3f4f6';
            btn.style.color = config.card_text;
        }
    });
}

//. INITIALIZATION (The Instant Load fix)
function startApp() {

    // 1. Immediately Sync Data (populates orders array)
    fetchOrdersFromDB(); 

    // 2. Set the initial page view
    switchPage('orders');

    // 3. Setup Navigation Click Listeners
    document.querySelectorAll('.nav-link, .footer-nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            switchPage(link.dataset.page);
        });
    });

    // 4. Setup Period Button Listeners
    document.querySelectorAll('.period-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentPeriod = e.currentTarget.dataset.period;
            initCharts();
        });
    });

    // 5. Background Refresh
    setInterval(fetchOrdersFromDB, 2000);
}

// Ensure it runs as fast as possible on reload
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}




















const DB_KEY = '';
let products = [];
let showOnlyOutOfStock = false;
let currentFlow = '';
let currentOpenId = null;
let deletedImages = []; 
let addons = [];
const sizes = ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL", "6", "8", "10", "12", "14", "16", "18", "20", "22", "24", "26", "28", "30", "32", "34", "36", "38", "40", "42", "44", "46", "48", "50"];
const naira = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 });


let touchStart = 0;
let touchEnd = 0;
const pullThreshold = 80; 
const gallery = document.body;
const indicator = document.getElementById('refresh-indicator');

// <div id="loaderCircle" class="loader-circle"></div>
// <div id="checkmark" class="checkmark-stem"></div>
// inside the refresh-indicator

gallery.addEventListener('touchstart', e => {
    if (window.scrollY === 0) {
        touchStart = e.touches[0].screenY;
        indicator.classList.remove('success'); // Reset state
    } else {
        touchStart = 0; 
    }
}, { passive: true });

gallery.addEventListener('touchmove', e => {
    if (touchStart === 0) return;

    touchEnd = e.touches[0].screenY;
    const distance = touchEnd - touchStart;

    if (distance > 0 && distance < 180) {
        indicator.style.height = `${distance / 1.5}px`; // Resistance
        
        if (distance > pullThreshold) {
            indicator.classList.add('pulling');
        } else {
            indicator.classList.remove('pulling');
        }
    }
}, { passive: true });

gallery.addEventListener('touchend', async () => {
    const distance = touchEnd - touchStart;
    
    if (distance > pullThreshold) {
        indicator.classList.add('pulling');
        indicator.style.height = '60px'; // Hold open while loading

        try {
            // Run both stock update and full app re-init for safety
            await refreshStockDisplay();
            
            // Trigger Haptic Feedback (Vibrate 50ms)
            if (window.navigator.vibrate) window.navigator.vibrate(50);

            // Switch to Success Animation
            indicator.classList.remove('pulling');
            indicator.classList.add('success');

        } catch (err) {
            console.error(err);
        }
    }

    // Smoothly close after seeing the tick mark
    setTimeout(() => {
        indicator.style.height = '0px';
        setTimeout(() => {
            indicator.classList.remove('pulling', 'success');
            touchStart = 0;
            touchEnd = 0;
        }, 300);
    }, 1000);
});


// 1. INITIALIZE APP
async function initApp() {
    try {
        const response = await fetch('api/fetch_products.php');
        const data = await response.json();
        products = Array.isArray(data) ? data : [];
        renderGallery();
    } catch (err) {
        console.error("Fetch error:", err);
        showPopup("Connection error. Check database.");
        renderGallery();
    }
}
window.onload = initApp;

// 2. UI NAVIGATION
function switchView(v) {
    document.querySelectorAll('.nav-card, .view-container').forEach(el => el.classList.remove('active'));
    document.getElementById('nav-' + v)?.classList.add('active');
    document.getElementById('view-' + v)?.classList.add('active');
    if(v === 'gallery') renderGallery();
}

// CUSTOM MESSAGE SYSTEM (Replaces Alerts)
function showPopup(m) {
    const t = document.getElementById('toast');
    if(t) { 
        t.innerText = m; 
        t.classList.add('show'); 
        setTimeout(() => t.classList.remove('show'), 3000); 
    }
}

// 3. MASTER MEDIA HANDLER
function handleMediaUI(input, imgId, vidId, statusId) {
    const file = input.files[0];
    if (!file) return;
    const imgP = document.getElementById(imgId);
    const vidP = document.getElementById(vidId);
    const status = document.getElementById(statusId);

    if (imgP) imgP.classList.add('hidden'); 
    if (vidP) vidP.classList.add('hidden');

    if (file.type.startsWith('video/')) {
        if (vidP) {
            vidP.src = URL.createObjectURL(file);
            vidP.classList.remove('hidden');
        }
        if(status) status.innerText = "🎥 Video Ready";
    } else {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (imgP) {
                imgP.src = e.target.result;
                imgP.classList.remove('hidden');
            }
            if(status) status.innerText = "📸 Image Ready";
        };
        reader.readAsDataURL(file);
    }
}

// Define your low stock threshold here (e.g., 5 or less)
const LOW_STOCK_THRESHOLD = 5;

function updateFilterVisibility() {
    const filterBtn = document.getElementById('filterContainer');
    // Now checks for items that are out of stock OR low on stock
    const needsAttention = products.some(p => needsRestockCheck(p));

    if (needsAttention) {
        filterBtn.style.display = 'flex';
    } else {
        filterBtn.style.display = 'none';
        showOnlyOutOfStock = false;
    }
}

function hasAnyOutOfStockPart(p) {
    // 1. Check main product total stock
    if (parseInt(p.stock) <= 0) return true;

    // 2. Check main product size breakdown
    if (p.size_stocks) {
        const sizes = Object.values(p.size_stocks);
        if (sizes.length > 0 && sizes.some(qty => parseInt(qty) <= 0)) {
            return true;
        }
    }

    // 3. Check all sub-products (variants)
    if (p.subs && p.subs.length > 0) {
        return p.subs.some(sub => {
            // Check sub-product main stock
            if (parseInt(sub.stock) <= 0) return true;
            
            // Check sub-product size breakdown
            if (sub.size_stocks) {
                const subSizes = Object.values(sub.size_stocks);
                return subSizes.length > 0 && subSizes.some(qty => parseInt(qty) <= 0);
            }
            return false;
        });
    }

    return false;
}

/**
 * Enhanced check to see if a product is Out of Stock OR Low Stock
 */
function needsRestockCheck(p) {
    // 1. Check main product total stock
    if (parseInt(p.stock) <= LOW_STOCK_THRESHOLD) return true;

    // 2. Check main product size breakdown
    if (p.size_stocks) {
        const sizes = Object.values(p.size_stocks);
        // If any specific size is low or out
        if (sizes.length > 0 && sizes.some(qty => parseInt(qty) <= LOW_STOCK_THRESHOLD)) {
            return true;
        }
    }

    // 3. Check all sub-products (variants/colors)
    if (p.subs && p.subs.length > 0) {
        return p.subs.some(sub => {
            // Check sub-product main stock
            if (parseInt(sub.stock) <= LOW_STOCK_THRESHOLD) return true;
            
            // Check sub-product size breakdown
            if (sub.size_stocks) {
                const subSizes = Object.values(sub.size_stocks);
                return subSizes.length > 0 && subSizes.some(qty => parseInt(qty) <= LOW_STOCK_THRESHOLD);
            }
            return false;
        });
    }

    return false;
}

function toggleStockFilter() {
    showOnlyOutOfStock = !showOnlyOutOfStock;
    const btn = document.getElementById('outOfStockFilter');
    
    if(showOnlyOutOfStock) {
        btn.innerText = "✅ Show All Items";
        btn.style.background = "#f59e0b"; // Amber color for "Attention"
        btn.style.color = "white";
    } else {
        // Updated text to reflect both Out and Low stock
        btn.innerText = "⚠️ Show Low / Out of Stock";
        btn.style.background = "black";
        btn.style.color = "#f59e0b";
    }
    renderGallery();
}

function renderStockInputs(containerId, sizeGridId, existingData = null) {
    const container = document.getElementById(containerId);
    const activeSizes = Array.from(document.querySelectorAll(`#${sizeGridId} .size-chip.active`)).map(c => c.innerText);
    
    container.innerHTML = activeSizes.map(size => {
        // If we have existing data for this size, use it. Otherwise, default to 1.
        const val = (existingData && existingData[size] !== undefined) ? existingData[size] : 1;
        
        return `
            <div class="input-box" style="margin-bottom: 5px;">
                <label style="font-size: 13px;">Stock for Size <span style="font-size: 15px; color: red;">${size}</span></label>
                <input type="number" class="size-stock-input" data-size="${size}" value="${val}" min="0">
            </div>
        `;
    }).join('');
}

// 4. RENDER GALLERY (WITH STOCK ALERTS)
function renderGallery() {
    // A. DYNAMIC FILTER VISIBILITY CHECK
    const filterContainer = document.getElementById('filterContainer');
    if (filterContainer) {
        // Only show the filter bar if something is actually Low or Out of stock
        const needsAttention = products.some(p => needsRestockCheck(p));
        
        if (needsAttention) {
            filterContainer.style.display = 'flex';
        } else {
            filterContainer.style.display = 'none';
            showOnlyOutOfStock = false; 
        }
    }

    // B. LOOP THROUGH CATEGORIES
    ['latest', 'stock', 'arrival', 'addon'].forEach(type => {
        const cont = document.getElementById(type + 'Container') || document.getElementById(type + 'sContainer');
        if(!cont) return;

        // Combine products and addons for the total pool
        let allItems = [...products, ...(typeof addons !== 'undefined' ? addons : [])];
        
        // 1. Initial Category Filter
        let items = allItems.filter(p => (p.product_type || p.type) === type);

        // 2. APPLY STOCK FILTER IF ACTIVE
        if (showOnlyOutOfStock) {
            items = items.filter(p => needsRestockCheck(p));
        }

        const countEl = document.getElementById(type + 'Count');
        if(countEl) countEl.innerText = `${items.length} Items`;

        cont.innerHTML = items.map(p => {
            // --- UPDATED STOCK BADGE LOGIC ---
            // We ask needsRestockCheck if it's low or empty
            const isCritical = needsRestockCheck(p);
            const isZero = hasAnyOutOfStockPart(p); // 0 units
            
            let badgeHTML = '';
            if (isZero) {
                badgeHTML = `<div class="stock-badge badge-out">Out of Stock</div>`;
            } else if (isCritical) {
                // If it needs restock but isn't zero, it's Low Stock
                badgeHTML = `<div class="stock-badge badge-low">Low Stock</div>`;
            }

            // --- MEDIA PATHS ---
            const videoSrc = p.video_path; 
            const imageSrc = p.image || p.main_image; 

            // --- DISPLAY LOGIC ---
            const displayName = (type === 'stock' && p.category) ? p.category : p.name;
            const displayPrice = (type === 'stock') ? '' : `<span style="color:var(--accent); font-weight:bold;">${naira.format(p.price)}</span>`;

            return `
            <div class="${type === 'latest' ? 'latest-item' : 'arrival-card'}" onclick="openDetails(${p.id}, '${type}')">
                <div class="media-holder" style="height:200px; width:150px; background:#000; border-radius:12px; overflow:hidden; position:relative;">
                    <div id="badge-layer-${p.id}">${badgeHTML}</div> 
                    
                    ${p.video_path ? 
                        `<video src="${videoSrc}" muted loop autoplay playsinline style="width:100%; height:100%; object-fit:cover;"></video>` : 
                        `<img src="${imageSrc}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='placeholder.jpg'">`
                    }
                </div>
                <div class="arrival-info">
                    <b style="display:block; margin-bottom:2px; text-transform: uppercase; font-size: 13px;">${displayName}</b>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        ${displayPrice}
                    </div>
                </div>
            </div>`;
        }).join('') || `<div class="empty-state" style="padding:20px; color:#94a3b8; text-align:center; grid-column: 1 / -1; width: 100%;">
                            ${showOnlyOutOfStock ? 'Everything is fully stocked! ✅' : 'No items found.'}
                         </div>`;
    });
}   

// 5. ADD PRODUCT FLOW
function startFlow(type) {
    currentFlow = type;
    const form = document.getElementById('modalForm');
    
    // Title logic
    document.getElementById('modalTitle').innerText = (type === 'latest') ? 'Add Latest Update' : 'Create New Bundle';
    
    const isLatest = (type === 'latest');
    
    // Updated Category Logic:
    // latest -> 'Latest'
    // instock -> 'In-Stock' (or leave empty if you prefer to type it every time)
    // anything else -> 'New Arrivals'
    let defaultCategory = 'New Arrivals';
    if (type === 'latest') {
        defaultCategory = 'Latest';
    } else if (type === 'stock') {
        defaultCategory = 'In-Stock';
    }

    form.innerHTML = `
        <div class="media-drop" onclick="this.querySelector('.main-input').click()">
            <img id="main_p_img" class="hidden" style="width:100%;height:100%;object-fit:cover;">
            <video id="main_p_vid" class="hidden" style="width:100%;height:100%;object-fit:cover;" autoplay muted loop></video>
            <span id="media_status">📸/🎥 Click to Upload Media</span>
            <input type="file" id="media_input" class="main-input hidden" accept="image/*,video/mp4" onchange="handleMediaUI(this, 'main_p_img', 'main_p_vid', 'media_status')">
        </div>
        
        <div class="input-box">
            <label>Category Name</label>
            <input type="text" id="main_category" 
                   placeholder="Enter Category Name" 
                   value="${defaultCategory}" 
                   style="text-transform: capitalize;">
        </div>

        <div class="input-box">
            <label>Product Name</label>
            <input type="text" id="main_name" placeholder="Item Name">
        </div>

        <div class="input-box">
            <label>Price (₦)</label>
            <input type="text" id="main_price_display" placeholder="0" oninput="formatPriceInput(this, 'main_price')">
            <input type="hidden" id="main_price" value="0">
        </div>

        <div class="input-box">
            <label>Sizes (Select to set stock)</label>
            <div class="size-grid" id="main_sizes">
                ${sizes.map(s => `
                    <div class="size-chip" onclick="this.classList.toggle('active'); renderStockInputs('main_stock_container', 'main_sizes')">${s}</div>
                `).join('')}
            </div>
        </div>

        <div id="main_stock_container" class="stock-input-wrapper"></div>
        <div id="subContainer"></div>
        
        ${!isLatest ? `<button class="btn btn-outline" type="button" onclick="addSubItemForm('subContainer')">+ Add Sub Product</button>` : ''}
    `;
    
    document.getElementById('modal').style.display = 'flex';
}

/**
 * Formats the price input with commas as the user types
 * @param {HTMLInputElement} displayInput - The visible text input
 * @param {string} hiddenId - The ID of the hidden input to store the raw number
 */
function formatPriceInput(displayInput, hiddenId) {
    // 1. Get value and remove everything that isn't a digit
    let value = displayInput.value.replace(/\D/g, '');
    
    // 2. If empty, reset both inputs
    if (!value) {
        displayInput.value = '';
        document.getElementById(hiddenId).value = '0';
        return;
    }

    // 3. Store the raw number in the hidden field for DB submission
    document.getElementById(hiddenId).value = value;

    // 4. Update the display field with commas
    displayInput.value = parseInt(value).toLocaleString();
}

// NEW: FLOW FOR ADDONS
function startAddonFlow() {
    currentFlow = 'addon';
    const form = document.getElementById('modalForm');
    document.getElementById('modalTitle').innerText = 'Add New Accessory (Shoes/Bags/Etc)';
    
    form.innerHTML = `
        <div class="media-drop" onclick="this.querySelector('.addon-input').click()">
            <img id="addon_p_img" class="hidden" style="width:100%;height:100%;object-fit:cover;">
            <span id="addon_media_status">📸 Click to Upload Image</span>
            <input type="file" id="addon_input" class="addon-input hidden" accept="image/*" 
                   onchange="handleMediaUI(this, 'addon_p_img', null, 'addon_media_status')">
        </div>
        <div class="input-box"><label>Accessory Name</label><input type="text" id="addon_name" placeholder="e.g. Gold Clutch"></div>
        <div class="input-box"><label>Price (₦)</label><input type="number" id="addon_price" placeholder="0.00"></div>
        <div class="input-box"><label>Stock Quantity</label><input type="number" id="addon_stock" value="1" min="0"></div>
        
        <p style="font-size:12px; color:#64748b; margin-top:10px;">
            *Note: These items will appear as suggestions in the product stylist panel.
        </p>
    `;
    document.getElementById('modal').style.display = 'flex';
}


/**
 * Compresses an image file using Canvas with High-Quality settings for MAMAG Luxury
 * @param {File} file - The original image file
 * @param {number} quality - 0 to 1 (0.92 is the new high-fidelity balance)
 * @returns {Promise<Blob|File>} - Returns high-quality compressed Blob or original File
 */
async function compressImage(file, quality = 0.92) {
    // 1. LIGHT THRESHOLD: If file is already under 500KB, keep it as is for maximum quality
    if (file.size < 500 * 1024) {
        return file;
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onerror = (error) => reject(error);
        
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            
            img.onerror = (error) => reject(error);

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // 2. LUXURY RESOLUTION: Boosted to 2400px for sharper display on large screens
                const MAX_WIDTH = 2400;
                let width = img.width;
                let height = img.height;

                // Calculate aspect ratio without losing quality
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_WIDTH) {
                        width *= MAX_WIDTH / height;
                        height = MAX_WIDTH;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                // 3. ENHANCED SMOOTHING: Ensuring micro-textures in clothing remain visible
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                
                ctx.drawImage(img, 0, 0, width, height);

                // 4. SMART FIDELITY EXPORT
                canvas.toBlob((blob) => {
                    if (blob) {
                        // Only use the compressed version if it saves at least 15% space
                        // Otherwise, the original is better for the user
                        const isWorthIt = blob.size < (file.size * 0.85);
                        resolve(isWorthIt ? blob : file);
                    } else {
                        resolve(file); 
                    }
                }, 'image/jpeg', quality);
            };
        };
    });
}

// 6. SAVE PRODUCT (FOLDER-READY)
async function finalPublish() {
    const formData = new FormData();

    // --- 1. ACCESSORY / ADDON BRANCH ---
    if (currentFlow === 'addon') {
        const nameEl = document.getElementById('addon_name');
        const priceEl = document.getElementById('addon_price');
        const stockEl = document.getElementById('addon_stock');
        const mediaInput = document.getElementById('addon_input');

        if (!nameEl.value || !priceEl.value || !mediaInput.files[0]) {
            return showPopup("Required: Name, Price, and Image!");
        }

        formData.append('name', nameEl.value);
        formData.append('price', priceEl.value);
        formData.append('instock', stockEl.value);
        formData.append('category', 'Accessories'); // For grouping

        showPopup("⚡ Optimizing Accessory...");
        const compressed = await compressImage(mediaInput.files[0]);
        formData.append('image', compressed, 'addon.jpg');

        try {
            const res = await fetch('api/save_addon.php', { method: 'POST', body: formData });
            const result = await res.json();
            if (result.status === 'success') { 
                closeModal(); initApp(); showPopup("Accessory Live!"); 
            } else { showPopup(result.message); }
        } catch(e) { showPopup("Accessory upload failed."); }
        return; // Stop here for addons
    }

    // --- 2. MAIN PRODUCT BRANCH (Latest, New Arrivals, In-Stock) ---
    const mainNameInput = document.getElementById('main_name');
    if (!mainNameInput || !mainNameInput.value) return showPopup("Product Name required!");

    const categoryInput = document.getElementById('main_category');
    const mediaInput = document.getElementById('media_input');
    const priceInput = document.getElementById('main_price');

    // Use values if they exist, otherwise use defaults
    const categoryValue = categoryInput ? categoryInput.value : 'General';
    const priceValue = priceInput ? priceInput.value : '0';

    formData.append('type', currentFlow);
    formData.append('name', mainNameInput.value);
    formData.append('category', categoryValue);
    formData.append('price', priceValue);

    // Handle Stocks
    const mainStocks = {};
    let totalMainStock = 0;
    document.querySelectorAll('#main_stock_container .size-stock-input').forEach(input => {
        const qty = parseInt(input.value) || 0;
        mainStocks[input.dataset.size] = qty;
        totalMainStock += qty;
    });
    
    formData.append('stock', totalMainStock);
    formData.append('size_stocks', JSON.stringify(mainStocks)); 
    formData.append('sizes', Object.keys(mainStocks).join(','));

    // Handle Media
    if (mediaInput && mediaInput.files[0]) {
        if (mediaInput.files[0].type.startsWith('video/')) {
            formData.append('video_file', mediaInput.files[0]);
        } else {
            showPopup("⚡ Optimizing Main Image...");
            const compMain = await compressImage(mediaInput.files[0]);
            formData.append('image_file', compMain, 'main.jpg');
        }
    }

    // Handle Sub-Products (Bundles)
    const subBlocks = document.querySelectorAll('#subContainer .sub-form-block');
    const subsData = [];

    for (let i = 0; i < subBlocks.length; i++) {
        const block = subBlocks[i];
        const subFile = block.querySelector('.sub-file').files[0];
        const subSizeStocks = {};
        let subTotal = 0;
        
        block.querySelectorAll('.size-stock-input').forEach(input => {
            const qty = parseInt(input.value) || 0;
            subSizeStocks[input.dataset.size] = qty;
            subTotal += qty;
        });

        const subInfo = {
            name: block.querySelector('.s-name').value,
            price: block.querySelector('.s-price').value,
            category: categoryValue,
            stock: subTotal,
            size_stocks: subSizeStocks,
            sizes: Object.keys(subSizeStocks).join(',')
        };

        if (subFile) {
            showPopup(`⚡ Optimizing Sub-Product ${i + 1}...`);
            const compSub = await compressImage(subFile);
            formData.append(`sub_file_${i}`, compSub, `sub_${i}.jpg`);
        } else {
            const subImg = block.querySelector('img');
            subInfo.image = subImg ? subImg.src : '';
        }
        subsData.push(subInfo);
    }

    formData.append('subs', JSON.stringify(subsData));

    showPopup("🚀 Uploading Product...");
    try {
        const res = await fetch('api/save_product.php', { method: 'POST', body: formData });
        const text = await res.text(); // Use text first to see if PHP crashed
        const result = JSON.parse(text);
        
        if (result.status === 'success') { 
            closeModal(); initApp(); showPopup("Product Live!"); 
        } else { showPopup(result.message); }
    } catch(e) { 
        console.error("Upload Error:", e);
        showPopup("Upload failed. Check console."); 
    }
}

// 7. VIEW DETAILS
function openDetails(id) {
    currentOpenId = id; // Store ID so refreshStockDisplay() knows what to update
    
    // Call the generator to fill the HTML
    renderOpenDetailsUI(id);

    // Show the panel
    const view = document.getElementById('sheetViewMode');
    const edit = document.getElementById('sheetEditMode');
    view.classList.remove('hidden'); 
    edit.classList.add('hidden');
    document.getElementById('overlayb').style.display = 'block';
    document.getElementById('sheetb').classList.add('open');
}

// 3. The Generator: Updated to show Category
function renderOpenDetailsUI(id) {
    let p = products.find(x => x.id == id) || (typeof addons !== 'undefined' ? addons.find(x => x.id == id) : null);
    if (!p) return;
    
    currentOpenId = id; 
    const view = document.getElementById('sheetViewMode');
    const isAddon = !p.subs && (!p.size_stocks || Object.keys(p.size_stocks).length === 0);

    // --- Stock Logic ---
    let stockHTML = '';
    if (p.size_stocks && Object.keys(p.size_stocks).length > 0) {
        stockHTML = `
            <div style="margin: 10px 0; padding: 8px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                <p style="font-size: 11px; color: #64748b; margin-bottom: 4px; font-weight: bold; text-transform: uppercase;">Availability by Size</p>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    ${Object.entries(p.size_stocks).map(([size, qty]) => `
                        <div style="font-size: 15px; background: #fff; padding: 4px 8px; border-radius: 6px; border: 1px solid #f1f5f9;">
                            <span style="color: #64748b;">Size ${size}: </span> 
                            <span id="live-size-${p.id}-${size}" style="font-weight: bold; color: ${qty <= 2 ? '#ef4444' : '#1e293b'}">${qty}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    } else {
        const stockCount = p.stock !== undefined ? p.stock : 0;
        stockHTML = `
            <div style="margin: 10px 0; padding: 12px; background: ${stockCount <= 3 ? '#fff1f2' : '#f0f9ff'}; border-radius: 8px; border: 1px solid ${stockCount <= 3 ? '#fecdd3' : '#bae6fd'};">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 13px; font-weight: bold; color: ${stockCount <= 3 ? '#be123c' : '#0369a1'};">CURRENT STOCK LEVEL</span>
                    <span style="font-size: 18px; font-weight: 800; color: ${stockCount <= 3 ? '#e11d48' : '#0ea5e9'};">${stockCount} units</span>
                </div>
            </div>
        `;
    }

    view.innerHTML = `
        <div class="media-holder" style="height:350px; background:#000; border-radius:15px; overflow:hidden; position: relative;">
            ${p.video_path ? `<video src="${p.video_path}" controls autoplay playsinline style="width:100%;height:100%;object-fit:contain;"></video>` : `<img src="${p.main_image || p.image}" style="width:100%;height:100%;object-fit:cover;">`}
        </div>
        
        <div style="margin-top:15px;">
            <span style="background: #f1f5f9; color: #475569; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: bold; text-transform: uppercase; border: 1px solid #e2e8f0;">
                Category: ${p.category || 'General'}
            </span>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between; margin: 10px 0 5px 0;">
            <h2 style="margin:0; text-transform: capitalize;">${p.name}</h2>
            ${isAddon ? `<span style="background:#eff6ff; color:#3b82f6; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:800; border: 1px solid #dbeafe;">ADD-ON</span>` : ''}
        </div>

        <p style="font-size:24px; color:var(--accent); font-weight:bold; margin-bottom:10px;">${naira.format(p.price)}</p>
        
        ${stockHTML}

        ${p.subs && p.subs.length ? `
            <div style="margin-top:20px;">
                <p style="font-size: 11px; color: #64748b; margin-bottom: 8px; font-weight: bold; text-transform: uppercase;">Product Variations</p>
                <div class="sub-preview-row" style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 10px;">
                    ${p.subs.map(s => `
                        <div class="sub-preview-card" style="min-width: 160px; border: 1px solid #eee; padding: 10px; border-radius: 12px; background:#fff;">
                            <img src="${s.image}" style="width:100%; height:110px; object-fit:cover; border-radius:8px;">
                            <b style="font-size: 15px; display:block; margin:5px 0; text-transform: capitalize;">${s.name}</b>
                            <p style="font-size: 14px; color: var(--accent); font-weight: bold; margin-bottom:8px;">${naira.format(s.price)}</p>
                            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                                ${Object.entries(s.size_stocks || {}).map(([sz, q]) => `
                                    <span style="font-size: 14px; padding: 2px 4px; background: #f1f5f9; border-radius: 4px;">
                                        <span>Size ${sz}: ${q}</span>
                                    </span>
                                `).join('')}
                            </div>
                        </div>`).join('')}  
                </div>
            </div>` : ''}

        <div class="btn-group" style="margin-top:20px; display: flex; gap: 10px;">
            <button class="btn btn-black" style="flex: 1;" onclick="openEdit(${p.id})">Edit Product</button>
            <button class="btn btn-outline" style="color:red; border-color:red; flex: 1;" onclick="deleteProd(${p.id})">Delete</button>
        </div>
    `;
}

// 8. OPEN EDIT SHEET: Updated to include Category Input
function openEdit(id) {
    const p = products.find(x => x.id == id) || (typeof addons !== 'undefined' ? addons.find(x => x.id == id) : null);
    const edit = document.getElementById('sheetEditMode');
    const view = document.getElementById('sheetViewMode');
    
    if (!p) return;

    const isAddon = (p.product_type === 'addon' || p.type === 'addon');
    const curSizes = p.sizes ? (Array.isArray(p.sizes) ? p.sizes : p.sizes.split(',')) : [];
    const stockDataStr = JSON.stringify(p.size_stocks || {}).replace(/"/g, '&quot;');
    const initialPriceFormatted = parseInt(p.price || 0).toLocaleString();

    edit.innerHTML = `
        <span class="section-label">Replace Media</span>
        <div class="media-drop" style="height:fit-content; max-height: 300px;" onclick="this.querySelector('.edit-main-input').click()">
            <img src="${p.video_path ? '' : (p.main_image || p.image)}" id="edit_img" class="${p.video_path ? 'hidden' : ''}" style="width:100%;height:100%;object-fit:cover;">
            <video src="${p.video_path || ''}" id="edit_vid" class="${p.video_path ? '' : 'hidden'}" style="width:100%;height:100%;object-fit:cover;" autoplay muted loop></video>
            <input type="file" class="edit-main-input hidden" accept="image/*,video/mp4" onchange="handleMediaUI(this, 'edit_img', 'edit_vid', 'edit_media_status')">
        </div>
        
        <div class="input-box"><label>Category</label><input type="text" id="edit_category" value="${p.category || ''}" placeholder="e.g. Jackets, Shoes"></div>
        <div class="input-box"><label>Name</label><input type="text" id="edit_name" value="${p.name}"></div>
        
        <div class="input-box">
            <label>Price (₦)</label>
            <input type="text" id="edit_price_display" value="${initialPriceFormatted}" oninput="formatPriceInput(this, 'edit_price')">
            <input type="hidden" id="edit_price" value="${p.price}">
        </div>
        
        ${isAddon ? `
            <div class="input-box">
                <label>Total Stock</label>
                <input type="number" id="edit_stock_simple" value="${p.stock}">
            </div>
        ` : `
            <div class="input-box"><label>Sizes (Select to set stock)</label>
                <div class="size-grid" id="edit_sizes">
                    ${sizes.map(s => `
                        <div class="size-chip ${curSizes.includes(s) ? 'active' : ''}" 
                             onclick="this.classList.toggle('active'); renderStockInputs('edit_stock_container', 'edit_sizes', ${stockDataStr})">${s}</div>
                    `).join('')}
                </div>
            </div>
            <div id="edit_stock_container"></div>
            <div id="editSubContainer"></div>
            ${(p.product_type !== 'latest') ? `<button class="btn btn-outline" type="button" onclick="addSubItemForm('editSubContainer')">+ Add New Sub Item</button>` : ''}
        `}
        
        <div class="btn-group" style="margin-top:20px">
            <button class="btn btn-black" onclick="saveFullEdit(${p.id}, '${isAddon ? 'addon' : 'product'}')">Save All Changes</button>
            <button class="btn btn-outline" onclick="exitEdit()">Cancel</button>
        </div>
    `;

    if(!isAddon) {
        if(p.subs && p.subs.length) {
            p.subs.forEach(sub => addSubItemForm('editSubContainer', sub));
        }
        renderStockInputs('edit_stock_container', 'edit_sizes', p.size_stocks);
    }

    view.classList.add('hidden'); 
    edit.classList.remove('hidden');
}

// 9. SAVE FULL EDIT: Updated to append Category
async function saveFullEdit(id, type) {
    const formData = new FormData();
    const mediaInput = document.querySelector('.edit-main-input');
    const trashBin = (typeof deletedImages !== 'undefined') ? deletedImages : [];

    formData.append('id', id);
    formData.append('type', type);
    formData.append('name', document.getElementById('edit_name').value);
    formData.append('category', document.getElementById('edit_category').value); // SAVE CATEGORY
    formData.append('price', document.getElementById('edit_price').value);
    formData.append('delete_files', JSON.stringify(trashBin));

    if (type === 'addon') {
        formData.append('stock', document.getElementById('edit_stock_simple').value);
        if (mediaInput.files[0]) {
            const file = mediaInput.files[0];
            if (file.type.startsWith('video/')) {
                formData.append('video_file', file);
            } else {
                showPopup("⚡ Optimizing Addon Image...");
                const compressed = await compressImage(file);
                formData.append('image_file', compressed, 'addon_edit.jpg');
            }
        }
    } 
    else {
        const mainStocks = {};
        let totalMainStock = 0;
        document.querySelectorAll('#edit_stock_container .size-stock-input').forEach(input => {
            const qty = parseInt(input.value) || 0;
            mainStocks[input.dataset.size] = qty;
            totalMainStock += qty;
        });
        
        formData.append('stock', totalMainStock);
        formData.append('size_stocks', JSON.stringify(mainStocks));
        formData.append('sizes', Object.keys(mainStocks).join(','));

        const subBlocks = document.querySelectorAll('#editSubContainer .sub-form-block');
        const subsData = [];
        
        for (let i = 0; i < subBlocks.length; i++) {
            const block = subBlocks[i];
            const subFile = block.querySelector('.sub-file').files[0];
            const subSizeStocks = {};
            let totalSubStock = 0;
            
            block.querySelectorAll('.size-stock-input').forEach(input => {
                const qty = parseInt(input.value) || 0;
                subSizeStocks[input.dataset.size] = qty;
                totalSubStock += qty;
            });

            const subInfo = {
                name: block.querySelector('.s-name').value,
                price: block.querySelector('.s-price').value,
                stock: totalSubStock,
                size_stocks: subSizeStocks,
                sizes: Object.keys(subSizeStocks).join(',')
            };

            if (subFile) {
                showPopup(`⚡ Optimizing Sub-Item ${i + 1}...`);
                const compressedSub = await compressImage(subFile);
                formData.append(`sub_file_${i}`, compressedSub, `edit_sub_${i}.jpg`);
                subInfo.image = ""; 
            } else {
                let imgElement = block.querySelector('img');
                subInfo.image = imgElement.src.replace(/^.*uploads\//, "uploads/");
            }
            subsData.push(subInfo);
        }
        formData.append('subs', JSON.stringify(subsData));

        if (mediaInput.files[0]) {
            const file = mediaInput.files[0];
            if (file.type.startsWith('video/')) {
                formData.append('video_file', file);
            } else {
                showPopup("⚡ Optimizing Main Media...");
                const compressedMain = await compressImage(file);
                formData.append('image_file', compressedMain, 'edit_main.jpg');
            }
        }
    }

    showPopup("🔄 Syncing Changes...");
    try {
        const res = await fetch('api/edit_product.php', { method: 'POST', body: formData });
        const result = await res.json();
        
        if (result.status === 'success') { 
            if (typeof deletedImages !== 'undefined') deletedImages = []; 
            exitEdit(); 
            initApp(); 
            showPopup("Update Successful!"); 
        } else {
            showPopup("Server error: " + result.message);
        }
    } catch (e) { 
        showPopup("Connection error."); 
    }
}

function refreshStockDisplay() { 
    return fetch('api/get_latest_stock.php?t=' + Date.now())
        .then(res => {
            if (!res.ok) throw new Error("Network response was not ok");
            return res.json();
        })
        .then(data => {
            let hasChanged = false;

            data.forEach(item => {
                // 1. Memory Sync
                updateMemoryArrays(item);

                // 2. UI Sync: Gallery Counter
                let targetId = item.id;
                let targetType = (item.type === 'addon') ? 'addon' : 'main';

                if (item.type === 'sub') {
                    const parent = products.find(p => p.subs && p.subs.some(s => s.id == item.id));
                    if (parent) targetId = parent.id;
                }

                // Primary Search: Look for exact Match
                let galleryCell = document.querySelector(`.stock-count[data-id="${targetId}"][data-type="${targetType}"]`);
                
                // Fallback Search: If primary fails, find ANY stock-count with this ID
                if (!galleryCell) {
                    galleryCell = document.querySelector(`.stock-count[data-id="${targetId}"]`);
                }

                if (galleryCell) {
                    // Get correct value: if it's a sub, we show the parent total stock
                    let newVal;
                    if (item.type === 'sub') {
                        const parentProd = products.find(p => p.id == targetId);
                        newVal = parentProd ? parentProd.stock : item.stock;
                    } else if (item.type === 'addon') {
                        // Ensure we use the stock from the addons array
                        const actualAddon = addons.find(a => a.id == targetId);
                        newVal = actualAddon ? actualAddon.stock : item.stock;
                    } else {
                        newVal = item.stock;
                    }
                    
                    if (galleryCell.innerText !== String(newVal)) {
                        galleryCell.innerText = newVal;
                        galleryCell.style.color = '#22c55e'; // Green flash
                        galleryCell.style.fontWeight = '900';
                        setTimeout(() => {
                            galleryCell.style.color = '';
                            galleryCell.style.fontWeight = '';
                        }, 1000);
                        hasChanged = true; 
                    }
                }

                // 3. Detail Panel Sync
                if (typeof currentOpenId !== 'undefined' && currentOpenId !== null) {
                    const isOpen = (currentOpenId == item.id);
                    const isParentOpen = (item.type === 'sub' && products.some(p => p.id == currentOpenId && p.subs.some(s => s.id == item.id)));
                    
                    if (isOpen || isParentOpen) {
                        renderOpenDetailsUI(currentOpenId); 
                    }
                }
            });

            // Re-render gallery only if structural changes happened (like filtering)
            // If only numbers changed, the galleryCell update above handles it smoothly.
        })
        .catch(err => {
            console.error("Critical Refresh Error:", err);
            throw err; 
        });
}

function updateMemoryArrays(item) {
    const type = item.type.toLowerCase();

    if (item.type === 'addon') {
        if (!addons) addons = [];
        let a = addons.find(x => x.id == item.id);
        if (a) a.stock = item.stock;
    } else if (item.type === 'main') {
        let p = products.find(x => x.id == item.id);
        if (p) {
            p.stock = item.stock;
            p.size_stocks = item.size_stocks;
        }
    } else if (item.type === 'sub') {
        products.forEach(p => {
            if (p.subs) {
                let s = p.subs.find(sub => sub.id == item.id);
                if (s) {
                    s.stock = item.stock;
                    s.size_stocks = item.size_stocks;
                    
                    // CRITICAL: Recalculate parent total stock
                    p.stock = p.subs.reduce((sum, sub) => sum + (parseInt(sub.stock) || 0), 0);
                }
            }
        });
    }
}

function getStockStatus(item) {
    const total = parseInt(item.stock) || 0;
    if (total <= 0) return { label: 'Out of Stock', class: 'badge-out' };

    // Check if main item is low
    let isLow = (total > 0 && total <= 5);

    // Check main item sizes
    if (!isLow && item.size_stocks) {
        isLow = Object.values(item.size_stocks).some(q => parseInt(q) > 0 && parseInt(q) <= 5);
    }

    // Check ALL sub-products for low stock
    if (!isLow && item.subs && item.subs.length > 0) {
        isLow = item.subs.some(sub => {
            const subTotal = parseInt(sub.stock) || 0;
            if (subTotal > 0 && subTotal <= 5) return true;
            if (sub.size_stocks) {
                return Object.values(sub.size_stocks).some(sq => parseInt(sq) > 0 && parseInt(sq) <= 5);
            }
            return false;
        });
    }

    if (isLow) return { label: 'Low Stock', class: 'badge-low' };
    return null; // Fully stocked
}


// Start immediately and repeat every 5 seconds
refreshStockDisplay();
setInterval(refreshStockDisplay, 5000);

// UPDATED addSubItemForm 

function addSubItemForm(containerId, data = null) {
    // Generate a clean ID for DOM elements
    const id = data ? (data.id || Math.random()).toString().replace('.', '') : Date.now();
    const div = document.createElement('div');
    // Matches the removal function requirement
    div.className = 'sub-form-block'; 
    
    const activeSizes = data && data.sizes ? (Array.isArray(data.sizes) ? data.sizes : data.sizes.split(',')) : [];
    const stockDataStr = JSON.stringify(data && data.size_stocks ? data.size_stocks : {}).replace(/"/g, '&quot;');

    // Handle initial price formatting
    const rawPrice = data ? data.price : '0';
    const formattedPrice = data ? parseInt(data.price).toLocaleString() : '';

    // Pass 'this' and the image path to the removal function
    const imagePathArg = data && data.image ? `'${data.image}'` : 'null';

    div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <label style="font-weight:bold; color:var(--accent);">Sub Product / Variation</label>
            <span class="remove-sub" style="cursor:pointer; color:red; font-weight:bold; font-size:12px;" 
                  onclick="removeSubForm(this, ${imagePathArg})">REMOVE</span>
        </div>
              
        <div class="media-drop" style="height:fit-content; max-height:300px; margin-bottom:15px;" onclick="this.querySelector('.sub-file').click()">
            <img id="img_${id}" src="${data && data.image ? data.image : ''}" 
                 class="${data && data.image ? '' : 'hidden'}" 
                 style="width:100%;height:100%;object-fit:cover; border-radius:8px;">
            <span class="${data && data.image ? 'hidden' : ''}">📸 Click to Upload Sub Image</span>
            <input type="file" class="sub-file hidden" onchange="handleMediaUI(this, 'img_${id}', null, null)">
        </div>
        
        <div class="input-box">
            <label>Sub Name</label>
            <input type="text" class="s-name" placeholder="Variation Name" value="${data ? data.name : ''}">
        </div>

        <div class="input-box">
            <label>Sub Price (₦)</label>
            <input type="text" 
                   class="s-price-display" 
                   placeholder="0" 
                   value="${formattedPrice}" 
                   oninput="formatPriceInput(this, 'raw_price_${id}')">
            <input type="hidden" class="s-price" id="raw_price_${id}" value="${rawPrice}">
        </div>
        
        <div class="input-box">
            <label>Sizes (Select to set stock)</label>
            <div class="size-grid s-sizes" id="sizes_${id}">
                ${sizes.map(s => `
                    <div class="size-chip ${activeSizes.includes(s) ? 'active' : ''}" 
                        onclick="this.classList.toggle('active'); renderStockInputs('stock_cont_${id}', 'sizes_${id}', ${stockDataStr})">${s}</div>
                `).join('')}
            </div>
        </div>
        
        <div id="stock_cont_${id}" class="sub-stock-inputs"></div>
    `;

    document.getElementById(containerId).appendChild(div);

    // Initial render of stock inputs if editing an existing item
    if (activeSizes.length > 0) {
        renderStockInputs(`stock_cont_${id}`, `sizes_${id}`, data ? data.size_stocks : null);
    }
}

// Shared Formatter Function
function formatPriceInput(displayInput, hiddenId) {
    let value = displayInput.value.replace(/\D/g, '');
    if (!value) {
        displayInput.value = '';
        document.getElementById(hiddenId).value = '0';
        return;
    }
    document.getElementById(hiddenId).value = value;
    displayInput.value = parseInt(value).toLocaleString();
}

async function removeSubForm(element, imagePath = null) {
    // 1. Record the path if it exists on the server
    if (imagePath && imagePath.includes('uploads/')) {
        deletedImages.push(imagePath);
    }
    
    // 2. Find the container block and remove it from UI
    const row = element.closest('.sub-form-block');
    if (row) {
        row.remove();
    }
}

async function deleteProd(id) {
    // Find the product to determine its type
    const p = products.find(x => x.id == id);
    if (!p) return;

    const type = (p.product_type === 'addon' || p.type === 'addon') ? 'addon' : 'product';

    // Visual feedback for the user
    showPopup("🗑️ Deleting item...");

    try {
        const res = await fetch(`api/delete_product.php?id=${id}&type=${type}`);
        const result = await res.json();

        if (result.status === 'success') {
            // Remove from local array if necessary (optional depending on how initApp works)
            products = products.filter(item => item.id != id);
            
            closeSheetb(); // Close the edit/view sheet
            initApp();     // Refresh the list UI
            showPopup("Item Deleted Permanently.");
        } else {
            showPopup("Error: " + result.message);
        }
    } catch (e) {
        showPopup("Connection error. Could not delete.");
    }
}



const sheet = document.getElementById('sheetb');
const overlay = document.getElementById('overlayb'); // your .sheet-back
const scrollContent = document.querySelector('.sheet-content');


// --- SHEETS Functions ---
function openSheetb() {
    overlay.style.display = 'block';
    overlay.style.opacity = '1';
    document.body.style.overflow = 'hidden'; // Stop background scroll
    
    // Small timeout ensures display:block is applied before animation
    setTimeout(() => {
        sheet.classList.add('open');
        sheet.style.transform = 'translateY(0)';
    }, 10);
}

function closeSheetb() {
    sheet.classList.remove('open');
    sheet.style.transform = 'translateY(100%)';
    overlay.style.opacity = '0';

    // Wait for the CSS transition (0.4s) to finish
    setTimeout(() => {
        overlay.style.display = 'none';
        document.body.style.overflow = ''; 

        // CRITICAL: Reset all inline styles so they don't interfere with the next touch
        sheet.style.transform = '';
        sheet.style.transition = '';
        overlay.style.opacity = '';
        
        // Reset coordinates
        isDragging = false;
        startY = 0;
        currentY = 0;
    }, 400);
}

// Keep your existing Modal/Edit functions
function closeModal() { document.getElementById('modal').style.display = 'none'; }
function exitEdit() { 
    document.getElementById('sheetEditMode').classList.add('hidden'); 
    document.getElementById('sheetViewMode').classList.remove('hidden'); 
}





// Inside your function that switches between admin pages
function showFeedbackPage() {
    // ... code to show the div ...
    loadAdminFeedback(); // This triggers the fetch
}

async function loadAdminFeedback() {
    const list = document.getElementById('feedback-list');
    if (!list) return;

    try {
        const response = await fetch('api/get_all_feedback.php');
        const data = await response.json();
        list.innerHTML = '';

        data.forEach(item => {
            const row = document.createElement('tr');
            row.className = "feedback-row";
            row.onclick = () => openFeedbackDetails(item);

            row.innerHTML = `
                <td>
                    <div style="font-weight: 700;">${item.name}</div>
                    <div style="font-size: 11px; color: #999;">${item.email}</div>
                </td>
                <td style="font-weight: 800; font-size: 13px;">${item.rating} ★</td>
            `;
            list.appendChild(row);
        });
        if (window.lucide) lucide.createIcons();
    } catch (err) { console.error(err); }
}

function openFeedbackDetails(item) {
    const body = document.getElementById('feedback-detail-body');
    body.innerHTML = `
        <div style="margin-bottom: 20px;">
            <p style="font-size: 11px; color: #aaa; text-transform: uppercase;">Review Message</p>
            <p style="font-size: 18px; line-height: 1.4; font-weight: 500; margin-top: 8px;">"${item.comment}"</p>
        </div>
        <button class="btn-delete" onclick="deleteFeedback(${item.id})">
            Delete Permanently
        </button>
    `;
    document.getElementById('admin-feedback-panel').classList.add('active');
    if (window.lucide) lucide.createIcons();
}

// Helper for Toast Notifications
function showToast(message) {
    const toast = document.getElementById('toast-container');
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// Modern Delete Flow
let feedbackToDelete = null;

function deleteFeedback(id) {
    feedbackToDelete = id;
    document.getElementById('delete-modal').style.display = 'flex';
}

function hideDeleteModal() {
    document.getElementById('delete-modal').style.display = 'none';
    feedbackToDelete = null;
}

// Handle the actual deletion when clicking the Modal's delete button
document.getElementById('confirm-delete-btn').addEventListener('click', async () => {
    if (!feedbackToDelete) return;

    try {
        const response = await fetch('api/delete_feedback.php', {
            method: 'POST',
            body: JSON.stringify({ id: feedbackToDelete }),
            headers: { 'Content-Type': 'application/json' }
        });
        
        const res = await response.json();
        
        if (res.status === 'success') {
            hideDeleteModal();
            closeFeedbackPanel();
            loadAdminFeedback();
            showToast("Review deleted successfully");
        } else {
            showToast("Error deleting review");
        }
    } catch (err) {
        showToast("Connection error");
    }
});

function renderFeedbackRow(item) {
    const statusClass = `badge badge-${item.status}`;
    return `
        <tr class="feedback-row cursor-pointer" onclick='openFeedbackDetails(${JSON.stringify(item)})'>
            <td class="p-4">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                        ${item.name.charAt(0)}
                    </div>
                    <div>
                        <div class="font-bold text-gray-900">${item.name}</div>
                        <div class="text-xs text-gray-400">${item.email}</div>
                    </div>
                </div>
            </td>
            <td class="p-4">
                <div class="flex text-yellow-400">
                    ${Array(parseInt(item.rating)).fill('<i data-lucide="star" class="w-3 h-3 fill-current"></i>').join('')}
                </div>
            </td>
            <td class="p-4">
                <span class="${statusClass}">${item.status}</span>
            </td>
            <td class="p-4 text-right">
                <button class="text-gray-300 hover:text-black transition-colors">
                    <i data-lucide="more-horizontal"></i>
                </button>
            </td>
        </tr>
    `;
}


function getStatusClass(status) {
    switch(status) {
        case 'approved': return 'bg-green-100 text-green-700';
        case 'pending': return 'bg-orange-100 text-orange-700';
        case 'hidden': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
    }
}

function getStatusClass(status) {
    if (status === 'approved') return 'bg-green-100 text-green-700';
    if (status === 'pending') return 'bg-orange-100 text-orange-700';
    return 'bg-red-100 text-red-700';
}



function closeFeedbackPanel() {
    document.getElementById('admin-feedback-panel').classList.remove('active');
}




let lastCount = 0; 

// DATA FETCHING (Polling)
async function fetchOrdersFromDB() {
    try {
        const response = await fetch('api/fetch_orders.php');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const newBatch = await response.json();
        
        // Update notification badge count (Paid status)
        const newOrderCount = newBatch.filter(o => o.status === 'Paid').length;
        updateOrderBadge(newOrderCount);

        // Only update UI if the data has actually changed
        if (JSON.stringify(newBatch) !== JSON.stringify(orders)) {
            console.log("New data sync completed.");
            orders = newBatch;
            
            renderData(); // Refresh Grid and Table
        }
    } catch (err) { 
        console.error("Fetch Error:", err);
    }
}
async function copyAllNewOrdersSummary(btn) {
    const newOrders = orders.filter(o => o.status === 'Paid');

    if (newOrders.length === 0) {
        if(typeof showMamagNotify === 'function') showMamagNotify("No new paid orders to copy");
        return;
    }

    let copyText = `📦 NEW ORDERS BATCH - ${new Date().toLocaleString()}\n`;
    copyText += `==========================================\n\n`;

    let runningGrandTotal = 0;

    newOrders.forEach((o, index) => {
        const itemsText = Array.isArray(o.items) 
            ? o.items.map(i => `- ${i.name} (${i.size}) x${i.quantity || 1}`).join('\n')
            : `- ${o.order_details}`;

        const orderTotal = Number(o.total_amount) || 0;
        runningGrandTotal += orderTotal;

        // Use your specific key: coupon_used
        const couponDisplay = (o.coupon_used && o.coupon_used !== 'NONE' && o.coupon_used !== '') 
            ? o.coupon_used 
            : 'None';

        copyText += `ORDER #${index + 1}\n`;
        copyText += `CUSTOMER: ${o.full_name}\n`;
        copyText += `PHONE: ${o.phone}\n`;
        copyText += `EMAIL: ${o.user_email}\n`;
        copyText += `REGION: ${o.region || 'N/A'}\n`;
        copyText += `ADDRESS: ${o.address}\n\n`;
        copyText += `ITEMS:\n${itemsText}\n\n`;
        copyText += `TOTAL: ₦${orderTotal.toLocaleString()}\n`;
        copyText += `COUPON: ${couponDisplay}\n`; // Corrected line
        copyText += `REF: ${o.reference}\n`;
        copyText += `------------------------------------------\n\n`;
    });

    copyText += `💰 BATCH SUMMARY\n`;
    copyText += `TOTAL ORDERS: ${newOrders.length}\n`;
    copyText += `GRAND TOTAL RECEIVED: ₦${runningGrandTotal.toLocaleString()}\n`;
    copyText += `==========================================`;

    try {
        await navigator.clipboard.writeText(copyText);
        if (btn) {
            const originalText = btn.innerText;
            const originalBg = btn.style.background;
            btn.innerText = "All Copied!";
            btn.style.background = "#2e7d32";
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.background = originalBg;
            }, 2000);
        }
    } catch (err) {
        console.error("Batch copy failed", err);
    }
}

// NOTIFICATION BADGE & SOUND
function updateOrderBadge(count) {
    const badge = document.getElementById('order-badge');
    if (!badge) return;

    if (count > 0) {
        badge.innerText = count;
        badge.classList.remove('hidden'); 
        
        // Play sound silently on new arrivals
        if (count > lastCount) {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(() => console.log("Audio playback waiting for user interaction."));
        }
    } else {
        badge.classList.add('hidden');    
    }
    lastCount = count;
}

// RENDER DATA ON LOAD (NEW & PROCESSED TABLES)
let currentMethodFilter = 'all'; 

// --- TOGGLE FUNCTION ---
function setMethodFilter(method) {
    currentMethodFilter = method;
    
    // UI Update: Reset all buttons, then highlight the active one
    const buttons = {
        all: document.getElementById('btn-filter-all'),
        delivery: document.getElementById('btn-filter-delivery'),
        pickup: document.getElementById('btn-filter-pickup')
    };
    
    Object.keys(buttons).forEach(key => {
        if (buttons[key]) {
            buttons[key].style.background = (key === method) ? '#000' : '#fff';
            buttons[key].style.color = (key === method) ? '#fff' : '#000';
        }
    });
    
    renderData(); 
}

// --- RENDER FUNCTION ---
function renderData() {
    const liveGrid = document.getElementById('order-cards'); 
    const processedTable = document.getElementById('processed-table-body'); 
    
    const searchQuery = document.getElementById('orderSearchInput') ? document.getElementById('orderSearchInput').value.toLowerCase().trim() : '';
    const filterValue = document.getElementById('orderStatusFilter') ? document.getElementById('orderStatusFilter').value : 'all';

    const matchesSearchLogic = (o) => {
        if (!searchQuery) return true;
        const isPickup = (o.address && o.address.toLowerCase().includes('pickup'));
        const orderType = isPickup ? 'pickup' : 'delivery';
        
        return (
            o.full_name.toLowerCase().includes(searchQuery) || 
            o.reference.toLowerCase().includes(searchQuery) || 
            (o.region && o.region.toLowerCase().includes(searchQuery)) ||
            (o.address && o.address.toLowerCase().includes(searchQuery)) ||
            orderType.includes(searchQuery)
        );
    };

    // 1. Filter New Orders (Paid)
    const newOrders = orders
        .filter(o => {
            if (o.status !== 'Paid') return false;
            const isPickupOrder = (o.address && o.address.toLowerCase().includes('pickup'));
            let matchesMethod = true;
            if (currentMethodFilter === 'pickup') matchesMethod = isPickupOrder;
            if (currentMethodFilter === 'delivery') matchesMethod = !isPickupOrder;
            return matchesMethod && matchesSearchLogic(o);
        })
        .sort((a, b) => Number(b.id) - Number(a.id));

    // 2. Filter Processed Orders
    const processedOrders = orders
        .filter(o => {
            const isProcessed = (o.status === 'Dispatched' || o.status === 'Received');
            if (!isProcessed) return false;
            const isSent = String(o.email_sent) === "1" || o.email_sent === 1;
            const isPickup = (o.address && o.address.toLowerCase().includes('pickup')) || o.status === 'Received';
            
            let matchesDropdown = true;
            if (filterValue === 'mailed') matchesDropdown = (isSent && !isPickup);
            if (filterValue === 'not_mailed') matchesDropdown = (!isSent && !isPickup);
            if (filterValue === 'pickup') matchesDropdown = isPickup;

            return matchesDropdown && matchesSearchLogic(o);
        })
        .sort((a, b) => Number(b.id) - Number(a.id));

    // RENDER NEW ORDERS GRID
    if (liveGrid) {
        liveGrid.innerHTML = newOrders.length ? newOrders.map(o => {
            const isP = (o.address && o.address.toLowerCase().includes('pickup'));
            // Added simple date for the card as well
            const dateStr = o.created_at ? new Date(o.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '';

            return `
            <div class="card shadow-lg" onclick="openManifest('${o.reference}')" style="cursor:pointer; background:#fff; padding:20px; border-radius:20px; margin-bottom:15px; border:1px solid #eee; position: relative;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div class="tag" style="background: ${isP ? '#e2f9ff' : '#ffe2e2'}; color: ${isP ? '#1990d2' : '#d21919'}; padding:4px 10px; border-radius:8px; font-size:10px; font-weight:800; display:inline-block; margin-bottom:10px;">
                        ${isP ? 'PICKUP REQUEST' : 'NEW DELIVERY ORDER'}
                    </div>
                    
                </div>
                <h3 style="margin:0; font-size:14px; font-weight:800; color:#000;">${o.full_name}</h3>
                <p style="margin:5px 0; color:#888; font-size:13px;">${o.region || 'Lagos'}</p>
                <p style="font-weight:800; font-size:18px; color:#000; margin-top:10px;">₦${Number(o.total_amount).toLocaleString()}</p>
            </div>`;
        }).join('') : `<p style="padding:20px; color:#888;">No new orders found.</p>`;
    }

    // RENDER PROCESSED TABLE
    if (processedTable) {
        processedTable.innerHTML = processedOrders.length ? processedOrders.map(o => {
            const isSent = String(o.email_sent) === "1" || o.email_sent === 1;
            const isPickup = (o.address && o.address.toLowerCase().includes('pickup')) || o.status === 'Received';
            
            // Format Date (Example: 14 Apr, 2026)
            const formattedDate = o.created_at 
                ? new Date(o.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) 
                : 'N/A';

            return `
            <tr style="border-bottom:1px solid #eee;">
                <td style="padding:15px; font-size:11px; color:#666;">
                    ${o.reference}<br>
                    <small style="color:#999">${isPickup ? 'PICKUP' : 'DELIVERY'}</small>
                </td>
                <td style="padding:15px;">
                    <b>${o.full_name}</b><br>
                    <small style="font-size:10px; color:#888;">${o.address || ''}</small>
                </td>
                <td style="padding:15px; font-size:12px; color:#444; white-space:nowrap;">
                    ${formattedDate}
                </td>
                <td style="padding:15px; font-weight:600;">₦${Number(o.total_amount).toLocaleString()}</td>
                <td style="padding:15px;">
                    ${isPickup ? 
                        `<span style="color:#27ae60; font-weight:800; font-size:12px;">✓ COLLECTED (PICKUP)</span>` :
                        (isSent ? 
                            `<span style="color:#2e7d32; font-weight:800; font-size:12px;">✓ DISPATCHED & MAILED</span>` : 
                            `<span style="color:#f54100; font-weight:800; font-size:12px;">✓ DISPATCHED, MAIL NOT SENT</span>`
                        )
                    }
                </td>
                <td style="padding:15px;">
                    <button onclick="openManifest('${o.reference}')" style="background:#f0f0f0; border:none; padding:8px 15px; border-radius:10px; cursor:pointer; font-weight:600;">View</button>
                </td>
            </tr>`;
        }).join('') : '<tr><td colspan="6" class="empty_table" style="padding:20px; color:#888;">No matching processed orders found.</td></tr>';
    }
}




// DISPATCH/COLLECT ACTION
async function dispatchOrder(ref, btn) {
    const o = orders.find(x => x.reference === ref);
    if (!o) return;

    const isPickup = o.address.toLowerCase().includes('pickup');
    const targetStatus = isPickup ? 'Received' : 'Dispatched';

    // Update Local State for instant transfer to Processed table
    const idx = orders.findIndex(x => x.reference === ref);
    if (idx !== -1) {
        orders[idx].status = targetStatus;
    }

    renderData(); 
    
    if (isPickup) {
        if(typeof closeSheet === 'function') closeSheet();
    } else if (btn) {
        btn.innerText = "Sending Mail...";
        btn.style.opacity = "0.7";
        btn.style.pointerEvents = "none";
    }

    try {
        const response = await fetch('api/update_status.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ reference: ref, status: targetStatus })
        });

        const result = await response.json();

        if(result.status === 'success') {
            const emailSent = isPickup ? false : (result.email_status === "Success: Email Sent");
            if (idx !== -1) orders[idx].email_sent = emailSent ? 1 : 0;
            
            renderData();

            if (!isPickup && btn) {
                btn.innerText = emailSent ? "✓ EMAILED" : "✓ (MAIL FAIL)";
                btn.style.background = emailSent ? "#2e7d32" : "#f54100";
                setTimeout(() => { if(typeof closeSheet === 'function') closeSheet(); }, 1200);
            }
        }
    } catch (err) { 
        console.error("Action Failed:", err);
    }
}

//  ORDER MANIFEST (Sliding Sheet)
function openManifest(ref) {
    const o = orders.find(x => x.reference === ref);
    if (!o) return;

    const isVideoFile = src => /\.(mp4|webm|ogg|mov)$/i.test(src);
    const items = o.items || [];
    let calculatedSubtotal = 0;
    
    // 1. Updated Calculation Logic to respect Special Orders
    items.forEach(i => {
        const cleanPrice = Number(String(i.price).replace(/[^0-9.]/g, '')) || 0;
        const qty = Number(i.quantity) || 1;
        const isSpecial = i.name.toLowerCase().includes('special order');
        const lineTotal = isSpecial ? cleanPrice : (cleanPrice * qty);
        calculatedSubtotal += lineTotal;
        i._displayLineTotal = lineTotal;
    });

    const deliveryFee = Number(o.delivery_fee) || 0;
    const totalAmount = Number(o.total_amount) || (calculatedSubtotal + deliveryFee);
    const totalPaid = Number(o.total_paid) || totalAmount;
    
    const isPickup = o.address.toLowerCase().includes('pickup');
    const isReceived = o.status === 'Received'; 
    const isDispatched = o.status === 'Dispatched'; 
    const emailSent = String(o.email_sent) === "1" || o.email_sent === 1;
    
    const customerEmail = o.user_email || o.email || o.customer_email || 'N/A';
    const customerPhone = o.phone || 'N/A';
    const deliveryRegion = o.region || 'Not Specified';

    let formattedDate = 'N/A';
    if (o.created_at || o.order_date) {
        const dateObj = new Date(o.created_at || o.order_date);
        formattedDate = dateObj.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric', 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
        });
    }

    // CHECK FOR COUPON DATA
    const couponUsed = o.coupon_used && o.coupon_used !== 'NONE' ? o.coupon_used : null;

    document.getElementById('manifest-content').innerHTML = `
        <div style="text-align:center;">
            <div style="width:40px; height:5px; background:#e5e5e5; border-radius:10px; margin: 0 auto 20px;"></div>
            <h2 style="font-size:26px; font-weight:800; margin:0;">${o.full_name}</h2>
            <div style="font-size:13px; font-weight:800; color:#000; margin: 10px 0;">📍 ORDER MANIFEST</div>
            <div style="font-size:12px; color:#888; margin-bottom: 25px; font-weight:500;">${formattedDate}</div>
            
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:20px;">
                <button onclick="copyDetails('${o.reference}', this)" style="background:#a1887f; color:#fff; border:none; padding:12px 20px; border-radius:12px; font-weight:600; cursor:pointer;">Copy Details</button>
                
                ${isPickup && !isReceived ? `
                    <button onclick="dispatchOrder('${o.reference}', this)" style="background:#27ae60; color:#fff; font-size: 13px; border:none; padding:12px 20px; border-radius:12px; font-weight:600; cursor:pointer;">Mark as Collected</button>
                ` : ''}
                ${isReceived ? `
                    <div style="background:#f0f0f0; color:#888; padding:12px 20px; border-radius:12px; font-weight:800; font-size:13px; display: flex; align-items: center;"> PROCESSED</div>
                ` : ''}

                ${!isPickup && (!isDispatched || !emailSent) ? `
                    <button onclick="dispatchOrder('${o.reference}', this)" style="background:#000; display: flex; align-items: center; color:#fff; border:none; padding:12px 20px; border-radius:12px; font-size:13px; font-weight:600; cursor:pointer;">
                        ${isDispatched && !emailSent ? 'Re-Dispatch Email' : 'Dispatch Order'}
                    </button>
                ` : ''}
                ${!isPickup && isDispatched && emailSent ? `
                    <div style="background:#f0f0f0; display: flex; align-items: center; color:#2e7d32; padding:12px 20px; border-radius:12px; font-weight:800; font-size:13px;">✓ DISPATCHED & MAILED</div>
                ` : ''}
            </div>
        </div>

        <div style="background:#f9f9fb; padding:20px; border-radius:20px;">
            <div style="display: flex; flex-direction: column; gap: 10px; align-items: flex-start;">
                <div>
                    <small style="color:#868686; font-size:10px; text-transform:uppercase; font-weight:700;">Contact Info</small>
                    <div style="font-weight:300; font-size:13px; color:#000; margin-top:2px;">${customerPhone}</div>
                    <div style="font-weight:500; font-size:13px; color:#000;">${customerEmail}</div>
                </div>
                <div>
                    <small style="color:#868686; font-size:10px; text-transform:uppercase; font-weight:700;">Region</small>
                    <div style="font-weight:500; font-size:13px; color:#000; margin-top:2px;">${deliveryRegion}</div>
                </div>
            </div>
            <hr style="border:0; border-top:1px solid #eee; margin: 10px 0;">
            <small style="color:#868686; font-size:10px; text-transform:uppercase; font-weight:700;">Shipping Address</small>
            <div style="font-weight:500; font-size:14px; margin-top:5px; line-height:1.4;">
                ${isPickup ? `<b style="color:#27ae60;">[PICKUP STORE]</b><br>${o.address}` : o.address}
            </div>
        </div>

        <h4 style="font-size:11px; color:#aaa; text-transform:uppercase; margin:20px 0 15px; font-weight:700;">Order Items</h4>
        ${items.map(i => {
            const mediaSrc = i.image.startsWith('../') ? i.image : `../${i.image}`;
            return `
            <div style="display:flex; align-items:center; gap:15px; margin-bottom:15px;">
                <div style="width:50px; height:50px; border-radius:10px; overflow:hidden; flex-shrink:0; background:#f4f4f4; position:relative; display:flex; align-items:center; justify-content:center;">
                    
                    <div class="deleted-msg" style="display:none; position:absolute; font-size:10px; color:#ff4444; font-weight:bold; text-align:center; line-height:1; text-transform:uppercase;">Deleted Media</div>

                    ${isVideoFile(mediaSrc)
                        ? `<video src="${mediaSrc}" style="width:100%; height:100%; object-fit:cover;" muted onerror="this.style.display='none'; this.previousElementSibling.style.display='block';"></video>`
                        : `<img src="${mediaSrc}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'; this.previousElementSibling.style.display='block';">`
                    }
                </div>
                <div style="flex:1">
                    <b style="font-size:14px; font-weight: 500;">${i.name}</b><br>
                    <small style="color:#888;">Size: ${i.size || 'N/A'} • Qty: x${i.quantity || 1}</small>
                </div>
                <b style="font-size:14px; font-weight: 500;">₦${i._displayLineTotal.toLocaleString()}</b>
            </div>`;
        }).join('')}

        <div style="background:#f9f9fb; padding:20px; border-radius:20px; margin-top:20px; border:1px solid #f0f0f5;">
            <div style="display:flex; justify-content:space-between; margin-bottom:8px; color:#888; font-size:13px; font-weight:600;">
                <span>Subtotal</span><span>₦${calculatedSubtotal.toLocaleString()}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:8px; color:#888; font-size:13px; font-weight:600;">
                <span>Shipping</span><span>₦${deliveryFee.toLocaleString()}</span>
            </div>

            ${couponUsed ? `
            <div style=" display: flex; justify-content: space-between; margin-bottom: 15px; color: #004cff; font-size: 13px;font-weight: 700; padding: 8px 0; border: 1px dashed #004cff; border-left: 0; border-right: 0;">
                <span>Coupon Applied</span><span>${couponUsed}</span>
            </div>
            ` : ''}

            <div style="display:flex; justify-content:space-between; font-size:18px; font-weight:700; color:#444; border-top:1px dashed #ddd; padding-top:10px;">
                <span>Total Received</span><span>₦${totalAmount.toLocaleString()}</span>
            </div>
            <div style="display:flex; justify-content:space-between; font-size:18px; font-weight:700; color:#444; margin-top:5px;">
                <span>Total Paid</span><span>₦${totalPaid.toLocaleString()}</span>
            </div>
        </div>
    `;

    document.getElementById('overlay').style.display = 'block';
    setTimeout(() => document.getElementById('order-sheet').classList.add('open'), 10);
}

// COPY ACTION (Updates Button Text)
function copyDetails(ref, btn) {
    const o = orders.find(x => x.reference === ref);
    if (!o) return;

    const itemsText = o.items.map(i => `${i.name} (${i.size}) x${i.quantity || 1}`).join('\n');
    
    // Check both potential keys and handle 'NONE' string from DB
    const couponVal = o.coupon_used || o.coupon_code;
    const couponText = (couponVal && couponVal.trim() !== "" && couponVal.toUpperCase() !== "NONE") 
        ? couponVal 
        : "None";

    const text = `CUSTOMER: ${o.full_name}
PHONE: ${o.phone}
EMAIL: ${o.user_email}
REGION: ${o.region || 'N/A'}
ADDRESS: ${o.address}

ITEMS:
${itemsText}

TOTAL: ₦${Number(o.total_amount).toLocaleString()}
COUPON: ${couponText}
REF: ${o.reference}`;

    navigator.clipboard.writeText(text).then(() => {
        if (btn) {
            const originalText = btn.innerText;
            const originalBg = btn.style.background; // Store exact original color
            
            btn.innerText = "Copied!";
            btn.style.background = "#2e7d32";
            
            setTimeout(() => {
                btn.innerText = originalText;
                btn.style.background = originalBg || "#a1887f";
            }, 2000);
        }
    }).catch(err => console.error("Copy failed", err));
}

// SHEET CLOSE
function closeSheet() {
    const sheet = document.getElementById('order-sheet');
    if (sheet) sheet.classList.remove('open');
    setTimeout(() => {
        const overlay = document.getElementById('overlay');
        if (overlay) overlay.style.display = 'none';
    }, 400);
}


/*** MAMAG ADMIN REQUEST MANAGEMENT */
let currentRequestFilter = 'all'; // Global state
let lastFetchedRequests = []; // Store data for re-filtering

async function fetchAdminRequests() {
    try {
        const response = await fetch('api/get_all_requests.php');
        lastFetchedRequests = await response.json();
        renderAdminRequests(lastFetchedRequests);
    } catch (err) {
        console.error("Fetch failed", err);
    }
}

// Function to handle button clicks
function filterRequests(status, btn) {
    currentRequestFilter = status;
    
    // Update UI active state
    document.querySelectorAll('.req-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Re-render using stored data
    renderAdminRequests(lastFetchedRequests);
}

function renderAdminRequests(requests) {
    const container = document.getElementById('adminRequestsList');
    if (!container) return;

    // 1. Filter out Declined (per your original logic)
    let filtered = requests.filter(req => req.status !== 'Declined');

    // 2. Apply the Pill Filter
    if (currentRequestFilter !== 'all') {
        filtered = filtered.filter(req => req.status === currentRequestFilter);
    }

    if (filtered.length === 0) {
        container.innerHTML = `<p class='text-gray-400 italic p-4'>No ${currentRequestFilter} requests found.</p>`;
        return;
    }

    // 3. Render the grid (Keep your existing .map logic here)
    container.innerHTML = filtered.map(req => `
        <div class="admin-request-card" id="admin-req-${req.id}">
            <div class="req-image-wrapper">
                <img src="../${req.image_path}" alt="Reference" onclick="openImagePopup(this.src)">
                <span class="status-pill ${req.status.toLowerCase()}">${req.status}</span>
            </div>
            
            <div class="p-4">
                <div class="mb-3">
                    <h4 class="font-bold text-black uppercase text-sm">${req.product_name}</h4>
                    <div style="margin-top: 5px;">
                        <p style="font-size: 12px; font-weight: 500; color: #000; margin: 0;">${req.user_name || 'Anonymous'}</p>
                        <p style="font-size: 11px; color: #888; margin: 0;">${req.user_email || req.email}</p>
                    </div>
                </div>
                
                <div class="flex justify-between text-sm mb-4">
                    <span>SIZE: <b>${req.required_size}</b></span>
                    <span>QTY: <b>${req.quantity}</b></span>
                </div>

                ${req.status === 'Pending' ? `
                    <div class="price-action-area">
                        <input type="number" id="price-${req.id}" placeholder="Set Price (₦)" class="admin-price-input">
                        <div class="flex gap-2 mt-2">
                            <button onclick="updateRequestStatus(${req.id}, 'Accepted')" class="btn-accept">Accept</button>
                            <button onclick="updateRequestStatus(${req.id}, 'Declined')" class="btn-decline">Decline</button>
                        </div>
                    </div>
                ` : `
                    <div class="finalized-price font-bold text-sm">
                        ${req.status === 'Purchased' ? '✅ PAID' : '🏷️ PRICE SET'}: ₦${Number(req.vendor_price).toLocaleString()}
                    </div>
                `}
            </div>
        </div>
    `).join('');
}

let lastRequestDataString = null; // Change from "" to null

async function silentFetchAdminRequests() {
    try {
        const response = await fetch('api/get_all_requests.php');
        const requests = await response.json();

        const activeRequests = requests.filter(req => req.status !== 'Declined');
        const currentDataString = JSON.stringify(activeRequests.map(r => ({id: r.id, status: r.status})));

        // 1. If this is the very first time we fetch data (on page load)
        if (lastRequestDataString === null) {
            lastFetchedRequests = requests;
            lastRequestDataString = currentDataString;
            renderAdminRequests(lastFetchedRequests);
            // We DO NOT show the toast here.
            return; 
        }

        // 2. If it's NOT the first run, check if the data actually changed
        if (currentDataString !== lastRequestDataString) {
            console.log("New data detected, refreshing...");
            
            lastFetchedRequests = requests; 
            lastRequestDataString = currentDataString; 
            
            renderAdminRequests(lastFetchedRequests);
            
            // Now we show the toast because it's a genuine update
            showToast("Requests Updated");
        }
        
    } catch (err) {
        console.error("Silent sync failed", err);
    }
}

// 3. Status Updates (Accept / Decline)
async function updateRequestStatus(requestId, newStatus) {
    const priceInput = document.getElementById(`price-${requestId}`);
    const price = priceInput ? priceInput.value : 0;

    if (newStatus === 'Accepted' && !price) {
        showToast("Please enter a price first", "error");
        return;
    }

    try {
        const response = await fetch('api/update_request_admin.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `id=${requestId}&status=${newStatus}&price=${price}`
        });
        
        const result = await response.json();
        if (result.status === 'success') {
            const card = document.getElementById(`admin-req-${requestId}`);
            
            if (newStatus === 'Declined') {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9)';
                setTimeout(() => card.remove(), 300);
                showToast("Request Declined & Removed");
            } else {
                showToast(`Request Accepted at ₦${price}`);
                fetchAdminRequests(); 
            }
        }
    } catch (err) {
        showToast("Update failed", "error");
    }
}

// 4. Image Popup Helpers
function openImagePopup(src) {
    const popup = document.getElementById('imagePopup');
    const img = document.getElementById('popupImg');
    img.src = src;
    popup.style.display = 'flex';
}

function closeImagePopup() {
    document.getElementById('imagePopup').style.display = 'none';
}

// 5. Initializer & Polling
document.addEventListener('DOMContentLoaded', () => {
    console.log("MAMAG Admin Sync Initialized...");
    fetchAdminRequests(); // Load immediately

    setInterval(() => {
        silentFetchAdminRequests();
        // We look for the request page. If it exists, we sync.
        const requestPage = document.getElementById('request-page');
        
        // If you are using a Single Page App style where you toggle 'active',
        // make sure this ID is correct. If it still doesn't work, 
        // remove the '.active' check entirely to force it to sync.
        if (requestPage && (requestPage.classList.contains('active') || !requestPage.classList.contains('hidden'))) {
            silentFetchAdminRequests();
        } else {
            // If you're on a different tab, we skip to save server power
            console.log("On a different tab, skipping sync...");
        }
    }, 5000);
});


/**
 * Synchronizes the request badges across the UI
 * @param {number} count - Total number of active requests
 */
function updateRequestBadge(count) {
    const badges = document.querySelectorAll('.request-badge');
    
    badges.forEach(badge => {
        if (count > 0) {
            // Update text (e.g., "1", "5", or "9+")
            badge.innerText = count > 9 ? '9+' : count;
            badge.style.display = 'flex';
            badge.classList.remove('hidden');
            syncRequestCount();
        } else {
            badge.style.display = 'none';
            badge.classList.add('hidden');
        }
    });
}

// Periodically fetches request count from the API
async function syncRequestCount() {
    try {
        // We don't need currentUser.id here because admin fetches ALL requests
        const response = await fetch('api/get_all_requests.php');
        const requests = await response.json();
        
        if (Array.isArray(requests)) {
            // Filter for 'Pending' status (unattended requests)
            const unattended = requests.filter(req => 
                req.status && req.status.toLowerCase() === 'pending'
            );
            
            // This updates the red badge you added
            updateRequestBadge(unattended.length);
        }
    } catch (err) {
        console.error("Badge Sync Error:", err);
    }
}


// 1. Check immediately on load
document.addEventListener('DOMContentLoaded', () => {
    // Only sync if user is actually logged in
    if (window.currentUser) {
        syncRequestCount();
    }
    
    setInterval(syncRequestCount, 3000); 
});


// This runs the fetch function every 30 seconds so the admin sees new requests automatically
setInterval(() => {
    // We use the SILENT fetch so the UI only refreshes IF there is a new request
    if (typeof silentFetchAdminRequests === 'function') {
        silentFetchAdminRequests(); 
    }
}, 15000); // 15 seconds is a good balance for "live" feel without lag



// --- FORMATTING HELPERS ---

function formatNumber(n) {
    // 1. Remove everything that isn't a digit
    let value = n.toString().replace(/\D/g, "");
    
    // 2. If nothing is left, return empty so the user can clear the field
    if (!value) return "";

    // 3. Add commas every 3 digits
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function handleAmountInput(e) {
    const input = e.target;
    const originalValue = input.value;
    
    // Get the formatted version
    const formatted = formatNumber(originalValue);
    
    // Only update if it's actually different
    if (formatted !== originalValue) {
        // Save cursor position
        const cursorP = input.selectionStart;
        
        input.value = formatted;
        
        // Basic cursor fix: if we added a comma, move cursor forward
        const newPosition = cursorP + (formatted.length - originalValue.length);
        input.setSelectionRange(newPosition, newPosition);
    }
}

// --- CONFIG & UI ---

function selectType(element) {
    const val = element.getAttribute('data-value');
    
    document.querySelectorAll('.type-option').forEach(opt => opt.classList.remove('active'));
    element.classList.add('active');
    
    document.getElementById('discountType').value = val;
    
    const symbol = document.getElementById('unitSymbol');
    const input = document.getElementById('discountValue');
    const label = document.querySelector('#valueWrapper .field-label');

    if (val === 'percentage') {
        label.innerText = "PERCENTAGE OFF (%)";
        symbol.innerText = '%';
        symbol.style.left = 'auto';
        symbol.style.right = '15px';
        input.style.paddingLeft = '15px';
        input.style.paddingRight = '35px';
        input.placeholder = "10";
    } else {
        label.innerText = val === 'flat' ? "DEDUCTION AMOUNT (₦)" : "MAX DELIVERY DISCOUNT (₦)";
        symbol.innerText = '₦';
        symbol.style.right = 'auto';
        symbol.style.left = '15px';
        input.style.paddingLeft = '35px';
        input.style.paddingRight = '15px';
        input.placeholder = val === 'flat' ? "5,000" : "Leave 0 for Unlimited";
    }
}

// --- PANEL CONTROLS ---

function openDiscountPanel() {
    document.getElementById('discountForm').reset();
    document.getElementById('discountId').value = "";
    document.getElementById('panelTitle').innerText = "Add Discount Code";
    
    const defaultOpt = document.querySelector('.type-option[data-value="flat"]');
    selectType(defaultOpt);

    document.getElementById('panelOverlay').style.display = 'block';
    document.getElementById('discountPanel').classList.add('show');
}

function closeDiscountPanel() {
    document.getElementById('panelOverlay').style.display = 'none';
    document.getElementById('discountPanel').classList.remove('show');
}

function editDiscount(data) {
    document.getElementById('panelTitle').innerText = "Modify Discount Code";
    document.getElementById('discountId').value = data.id;
    document.getElementById('couponCode').value = data.code;
    document.getElementById('usageLimit').value = data.usage_limit || 0;
    
    const typeBtn = document.querySelector(`.type-option[data-value="${data.discount_type}"]`);
    if(typeBtn) selectType(typeBtn);

    // FIX: Math.round ensures we don't have .00 causing extra zeros
    // then toString() ensures formatNumber has a clean string to work with
    const cleanValue = Math.round(data.discount_value).toString();
    const cleanMinSpend = Math.round(data.min_spend).toString();

    document.getElementById('discountValue').value = formatNumber(cleanValue);
    document.getElementById('minSpend').value = formatNumber(cleanMinSpend);
    
    document.getElementById('panelOverlay').style.display = 'block';
    document.getElementById('discountPanel').classList.add('show');
}

// --- DATA ACTIONS ---

document.getElementById('discountForm').onsubmit = async function(e) {
    e.preventDefault();
    
    const saveBtn = e.target.querySelector('button[type="submit"]');
    const originalBtnText = saveBtn.innerText;
    
    saveBtn.innerText = "Saving...";
    saveBtn.disabled = true;
    
    const formData = {
        id: document.getElementById('discountId').value,
        code: document.getElementById('couponCode').value.toUpperCase().trim(),
        type: document.getElementById('discountType').value,
        // Strip commas before sending to PHP
        value: document.getElementById('discountValue').value.replace(/,/g, '') || 0,
        min_spend: document.getElementById('minSpend').value.replace(/,/g, '') || 0,
        usage_limit: document.getElementById('usageLimit').value || 0
    };

    try {
        const response = await fetch('api/save_discount.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.status === 'success') {
            closeDiscountPanel(); 
            fetchDiscounts(); 
            showMamagNotify("✓ Discount saved successfully");
        } else {
            showMamagNotify("✕ Error: " + result.message);
        }
    } catch (err) {
        showMamagNotify("✕ System error: Connection failed.");
    } finally {
        saveBtn.innerText = originalBtnText;
        saveBtn.disabled = false;
    }
};

async function toggleCode(id, status) {
    const isActive = status ? 1 : 0;
    try {
        const response = await fetch('api/update_discount_status.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, is_active: isActive })
        });
        const result = await response.json();
        if (result.status === 'success') {
            showMamagNotify(status ? "✓ Code Activated" : "○ Code Deactivated");
        }
    } catch (e) {
        showMamagNotify("✕ Failed to update status");
    }
}

async function deleteDiscount(id) {
    const btn = event.currentTarget;
    const originalContent = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
        const response = await fetch('api/delete_discount.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });

        const result = await response.json();
        if (result.status === 'success') {
            showMamagNotify("🗑️ Discount deleted");
            fetchDiscounts();
        } else {
            btn.disabled = false;
            btn.innerHTML = originalContent;
            showMamagNotify("✕ Error: " + result.message);
        }
    } catch (err) {
        btn.disabled = false;
        btn.innerHTML = originalContent;
        showMamagNotify("✕ System error");
    }
}

async function fetchDiscounts() {
    console.log("Check 1: fetchDiscounts function started"); // Should see this
    
    const container = document.getElementById('discountList');
    if (!container) {
        console.error("Check 2: Container 'discountList' NOT found in DOM");
        return;
    }
    console.log("Check 3: Container found, preparing fetch...");

    try {
        const response = await fetch('api/get_discounts.php');
        console.log("Check 4: Network request sent, status:", response.status);
        
        const codes = await response.json();
        console.log("Check 5: Data received:", codes);
        
        renderDiscounts(codes);
    } catch (err) {
        console.error("Check 6: Fetch failed completely:", err);
    }
}

// FORCE RUN: Add this directly below the function
fetchDiscounts();

function renderDiscounts(codes) {
    const container = document.getElementById('discountList');
    if (!container) return;

    if (codes.length === 0) {
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px; color: #888;">No discount codes created yet.</div>`;
        return;
    }

    container.innerHTML = codes.map(c => {
        // 1. Determine the Benefit Text
        let benefit = "";
        if (c.discount_type === 'percentage') {
            benefit = `${parseFloat(c.discount_value)}% OFF`;
        } else if (c.discount_type === 'flat') {
            benefit = `₦${Number(c.discount_value).toLocaleString()} OFF`;
        } else if (c.discount_type === 'free_delivery') {
            benefit = Number(c.discount_value) > 0 
                ? `Free Delivery (Up to ₦${Number(c.discount_value).toLocaleString()})` 
                : "Free Delivery";
        }

        // 2. Minimum Spend Text
        const minSpendText = Number(c.min_spend) > 0 
            ? `Min. Spend: ₦${Number(c.min_spend).toLocaleString()}` 
            : "No Minimum Spend";

        // 3. NEW: Usage Limit Logic
        const limit = Number(c.usage_limit) || 0;
        const used = Number(c.times_used) || 0;
        const isExhausted = limit > 0 && used >= limit;

        // Display text for usage
        let usageStatusText = "";
        if (limit > 0) {
            usageStatusText = isExhausted 
                ? `<span style="color: #ff4d4d; font-weight: 800;">EXHAUSTED (${used}/${limit})</span>` 
                : `Used ${used} of ${limit} times`;
        } else {
            usageStatusText = `Used ${used} times (Unlimited)`;
        }

        return `
            <div class="discount-card shadow-lg" style="background: #fff; border: 1px solid #eee; padding: 25px; border-radius: 20px; position: relative; transition: all 0.3s ease; ${isExhausted ? 'border-color: #ffeded;' : ''}">
                
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <div>
                        <span style="font-weight: 900; font-size: 20px; letter-spacing: 1px; color: ${isExhausted ? '#999' : '#000'};">${c.code}</span>
                        <div style="color: #27ae60; font-weight: 700; font-size: 16px; margin-top: 4px;">${benefit}</div>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" ${c.is_active == 1 && !isExhausted ? 'checked' : ''} onchange="toggleCode(${c.id}, this.checked)" ${isExhausted ? 'disabled' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>

                <div style="margin-top: 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #888; font-weight: 700;">
                    ${usageStatusText}
                </div>
                ${limit > 0 ? `
                <div style="width: 100%; height: 6px; background: #f0f0f0; border-radius: 10px; margin-top: 6px; overflow: hidden;">
                    <div style="width: ${Math.min((used / limit) * 100, 100)}%; height: 100%; background: ${isExhausted ? '#ff4d4d' : '#27ae60'}; border-radius: 10px;"></div>
                </div>
                ` : ''}

                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px dashed #eee; font-size: 12px; color: #666;">
                    ${minSpendText}
                </div>

                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button onclick='editDiscount(${JSON.stringify(c)})' style="flex: 1; padding: 10px; background: #f5f5f5; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; color: #333;">Modify</button>
                    <button onclick="deleteDiscount(${c.id})" style="padding: 10px; background: #fff; border: 1px solid #ffeded; color: #ff4d4d; border-radius: 10px; cursor: pointer; transition: all 0.2s;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                
                ${isExhausted ? `
                <div style="position: absolute; top: 25px; right: 20px; background: #ff4d4d; color: #fff; font-size: 9px; padding: 2px 8px; border-radius: 20px; font-weight: 800;">MAXED OUT</div>
                ` : ''}
            </div>`;
    }).join('');
}

function showMamagNotify(message) {
    let container = document.getElementById('mamag-notify-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'mamag-notify-container';
        container.style.cssText = "position:fixed; top:40px; left:50%; transform:translateX(-50%); z-index:999999; display:flex; flex-direction:column; align-items:center; pointer-events:none;";
        document.body.appendChild(container);
    }
    const msgBox = document.createElement('div');
    msgBox.innerText = message;
    msgBox.style.cssText = "background:#000; color:#fff; padding:16px 28px; border-radius:14px; font-weight:700; font-size:14px; margin-top:10px; box-shadow:0 15px 35px rgba(0,0,0,0.4); min-width:200px; text-align:center; opacity:0; transition: all 0.3s ease-out; transform:translateY(-20px);";
    container.appendChild(msgBox);
    setTimeout(() => { msgBox.style.opacity = "1"; msgBox.style.transform = "translateY(0)"; }, 10);
    setTimeout(() => { 
        msgBox.style.opacity = "0"; 
        msgBox.style.transform = "translateY(-20px)";
        setTimeout(() => msgBox.remove(), 300);
    }, 3000);
}


let selectedState = "";
let editingRateId = null; // Track if we are editing
let allRatesCache = []; // Store fetched rates for easy lookup



function selectState(state) {
    selectedState = state;
    document.getElementById('selectedStateText').innerText = state;
    document.getElementById('targetStateName').innerText = state;
    
    // Enable the form
    document.getElementById('regionAddForm').classList.remove('disabled');
    
    // Close dropdown
    toggleDropdown('stateList');
    
    // Optional: Filter table to show only this state's regions
    fetchDeliveryRates(state); 
}

async function saveNewRegion() {
    const region = document.getElementById('shipRegion').value;
    const price = document.getElementById('shipPrice').value;

    if (!region || !price) return showToast("Please fill all fields");

    const formData = {
        state: selectedState,
        region_name: region,
        price: price
    };

    try {
        const response = await fetch('api/save_delivery_rate.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const res = await response.json();
        if (res.status === 'success') {
            showToast(`Added to ${selectedState}`);
            document.getElementById('shipRegion').value = "";
            document.getElementById('shipPrice').value = "";
            fetchDeliveryRates(); // Refresh Table
        }
    } catch (err) {
        console.error("Save failed", err);
    }
}

// Close dropdowns if clicking outside
function toggleDropdown(target, event) {
    if (event) event.stopPropagation();

    let container;
    let options;

    if (typeof target === 'string') {
        const el = document.getElementById(target);
        if (!el) return;

        // If you passed the 'stateList' (the options), find its parent container
        if (el.classList.contains('dropdown-options')) {
            options = el;
            container = el.closest('.custom-dropdown');
        } else {
            // If you passed 'regionDropdown' (the container), find the options inside
            container = el;
            options = container.querySelector('.dropdown-options');
        }
    } else {
        // Handling the 'this' keyword from the Ledger dropdown
        container = target.closest('.custom-dropdown');
        options = container ? container.querySelector('.dropdown-options') : null;
    }

    if (!container || !options) return;

    // Close all other dropdowns for a clean UI
    document.querySelectorAll('.dropdown-options').forEach(el => {
        if (el !== options) el.style.display = 'none';
    });
    document.querySelectorAll('.custom-dropdown').forEach(el => {
        if (el !== container) el.classList.remove('active');
    });

    // Toggle current
    const isHidden = options.style.display === 'none' || options.style.display === '';
    options.style.display = isHidden ? 'block' : 'none';
    container.classList.toggle('active', isHidden);
}

// 2. UNIVERSAL CLOSE: Handles all "clicks outside"
window.addEventListener('click', function(event) {
    if (!event.target.closest('.custom-dropdown')) {
        document.querySelectorAll('.dropdown-options').forEach(d => {
            d.style.display = 'none';
        });
        document.querySelectorAll('.custom-dropdown').forEach(d => {
            d.classList.remove('active');
        });
    }
});

// 3. STATUS SELECT: Specifically for your Ledger
function selectOption(value, label) {
    const filterInput = document.getElementById('orderStatusFilter');
    const display = document.getElementById('selectedDisplay');
    
    if (filterInput) filterInput.value = value;
    if (display) display.innerText = label;
    
    // Hide the options
    const options = document.getElementById('dropdownOptions');
    const container = document.getElementById('statusDropdown');
    if (options) options.style.display = 'none';
    if (container) container.classList.remove('active');
    
    renderData(); // Refresh your table
}



// Load rates on page load
// Call this once when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchDeliveryRates(); 
});

async function fetchDeliveryRates(filterState = null) {
    try {
        const response = await fetch('api/get_delivery_rates.php');
        const allRates = await response.json();
        
        // If a state is selected, filter the list; otherwise, show everything
        const displayRates = filterState 
            ? allRates.filter(r => r.state === filterState) 
            : allRates;

        renderDeliveryRates(displayRates);
    } catch (err) {
        console.error("Failed to load delivery rates:", err);
    }
}

function renderDeliveryRates(rates) {
    const tbody = document.getElementById('deliveryRateTable');
    if (!tbody) return;
    
    allRatesCache = rates; // Update cache

    if (rates.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:#999; padding:20px;">No regions added yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = rates.map(r => `
        <tr>
            <td>
                <div class="location-meta">
                    <b>${r.state} - ${r.region_name}</b>
                    <span></span>
                </div>
            </td>
            <td>
                <span style="font-weight: 500;">₦${Number(r.price).toLocaleString()}</span>
            </td>
            <td>
                <button onclick="startEdit(${r.id})" class="edit-zone-btn">EDIT</button>
                <button onclick="deleteRate(${r.id})" class="delete-zone-btn">REMOVE</button>
            </td>
        </tr>
    `).join('');
}

function startEdit(id) {
    const rate = allRatesCache.find(r => r.id == id);
    if (!rate) return;

    editingRateId = id; // Set the edit mode

    // 1. Populate State
    selectedState = rate.state;
    document.getElementById('selectedStateText').innerText = rate.state;
    document.getElementById('targetStateName').innerText = rate.state;
    document.getElementById('regionAddForm').classList.remove('disabled');

    // 2. Populate Form Inputs
    document.getElementById('shipRegion').value = rate.region_name;
    document.getElementById('shipPrice').value = rate.price;

    // 3. Update Button Text
    const submitBtn = document.querySelector('#regionAddForm .mamag-btn-black');
    submitBtn.innerText = "Update Zone";
    submitBtn.style.background = "#2e7d32"; // Change to green during edit mode

    // Scroll smoothly to form
    document.getElementById('regionAddForm').scrollIntoView({ behavior: 'smooth' });
}

async function saveNewRegion() {
    const region = document.getElementById('shipRegion').value;
    const price = document.getElementById('shipPrice').value;

    if (!region || !price || !selectedState) return showToast("Please fill all fields");

    const formData = {
        id: editingRateId, // Will be null for new items
        state: selectedState,
        region_name: region,
        price: price
    };

    // Determine which endpoint to use
    const endpoint = editingRateId ? 'api/update_delivery_rate.php' : 'api/save_delivery_rate.php';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const res = await response.json();
        if (res.status === 'success') {
            showToast(editingRateId ? "Zone Updated" : "Zone Added");
            resetForm(); // Clean up
            fetchDeliveryRates(); 
        }
    } catch (err) {
        console.error("Save failed", err);
    }
}

function resetForm() {
    editingRateId = null;
    document.getElementById('shipRegion').value = "";
    document.getElementById('shipPrice').value = "";
    
    const submitBtn = document.querySelector('#regionAddForm .mamag-btn-black');
    submitBtn.innerText = "Add Zone";
    submitBtn.style.background = "#000"; // Back to black
}

// Save a new rate
// Function to delete a rate
async function deleteRate(id) {
    if (!confirm("Are you sure you want to remove this delivery zone?")) return;

    try {
        const response = await fetch('api/delete_delivery_rate.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        
        const res = await response.json();
        if (res.status === 'success') {
            showToast("Zone Removed");
            fetchDeliveryRates(); // Refresh table
        }
    } catch (err) {
        console.error("Delete failed", err);
    }
}

// Updated Submit Logic
document.getElementById('deliveryPriceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        state: document.getElementById('shipState').value,
        region_name: document.getElementById('shipRegion').value,
        price: document.getElementById('shipPrice').value
    };

    try {
        const response = await fetch('api/save_delivery_rate.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const res = await response.json();
        if (res.status === 'success') {
            showToast("Zone Added Successfully");
            e.target.reset();
            fetchDeliveryRates(); // Refresh table
        }
    } catch (err) {
        console.error("Save failed", err);
    }
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    fetchDiscounts();
    
    const valueInput = document.getElementById('discountValue');
    const minSpendInput = document.getElementById('minSpend');
    
    if(valueInput) valueInput.addEventListener('input', handleAmountInput);
    if(minSpendInput) minSpendInput.addEventListener('input', handleAmountInput);
});


// If you are using a Single Page App (SPA) style where you click a "Discounts" tab:
function openDiscountTab() {
    // ... logic to show the tab ...
    fetchDiscounts(); // Always refresh data when opening the tab
}