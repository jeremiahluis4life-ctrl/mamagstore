window.onload = () => {
    console.log("Page loaded. Checking URL...");
    
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    const email = urlParams.get('email');
    const token = urlParams.get('token');
    const linkedProductId = urlParams.get('product');

    // --- 1. HANDLE PASSWORD RESET ---
    if (action === 'reset' && email && token) {
        console.log("Reset link detected!");
        setTimeout(() => {
            const overlay = document.getElementById('panelOverlay');
            const panel = document.getElementById('productPanel');
            
            if (overlay && panel) {
                overlay.classList.add('active');
                panel.classList.add('active');
                document.body.style.overflow = 'hidden';
                loadResetPasswordPanel(email, token);
            }
        }, 300);
    }

    // --- 2. HANDLE PRODUCT DEEP LINK (MOVED OUTSIDE) ---
    if (linkedProductId) {
        console.log("Product link detected: ID " + linkedProductId);
        // We add a slight delay to ensure the DOM and other scripts are fully ready
        setTimeout(() => {
            loadProductPanel(linkedProductId);
        }, 400);
    }

    // --- 3. CLEAN URL ---
    // Only clean the URL if there was actually an action or product present
    if (action || linkedProductId) {
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    }
};


 // 1. CONFIGURATION & ELEMENT SDK

const defaultConfig = {
    brand_name: 'MAMAG!',
    hero_title: 'New In',
    btn_her: 'For Her',
    btn_him: 'For Him',
    contact_text: '+ Contact Us',
    primary_bg: '#000000',
    secondary_surface: '#ffffff',
    text_color: '#ffffff',
    primary_action: '#1a1a1a',
    secondary_action: '#333333',
    font_family: 'Playfair Display',
    font_size: 16
};

// Global Global Variables
window.checkoutMethod = 'delivery'; 
window.isDropdownOpen = false;
window.isStateDropdownOpen = false; // New state for state dropdown



window.setCheckoutMethod = function(method, e) {
    if (e) e.stopPropagation(); 
    window.checkoutMethod = method;
    window.isDropdownOpen = false;
    window.isStateDropdownOpen = false;
    loadCheckoutPanel(); 
};




async function onConfigChange(config) {
    const brandName = config.brand_name || defaultConfig.brand_name;
    const heroTitle = config.hero_title || defaultConfig.hero_title;
    const primaryBg = config.primary_bg || defaultConfig.primary_bg;
    const secondarySurface = config.secondary_surface || defaultConfig.secondary_surface;
    const textColor = config.text_color || defaultConfig.text_color;
    const primaryAction = config.primary_action || defaultConfig.primary_action;
    const fontFamily = config.font_family || defaultConfig.font_family;
    const fontSize = config.font_size || defaultConfig.font_size;

    document.documentElement.style.setProperty('--primary-bg', primaryBg);
    document.documentElement.style.setProperty('--secondary-surface', secondarySurface);
    document.documentElement.style.setProperty('--text-color', textColor);
    document.documentElement.style.setProperty('--primary-action', primaryAction);
    document.body.style.fontFamily = `${fontFamily}, Georgia, serif`;
    document.body.style.fontSize = `${fontSize}px`;

    document.getElementById('loadingLogo').textContent = brandName;
    document.getElementById('headerLogo').textContent = brandName;
    document.getElementById('heroLogo').textContent = brandName;
    document.getElementById('heroTitle').textContent = heroTitle;
    document.getElementById('btnHer').textContent = config.btn_her || defaultConfig.btn_her;
    document.getElementById('btnHim').textContent = config.btn_him || defaultConfig.btn_him;
    document.getElementById('contactText').textContent = config.contact_text || defaultConfig.contact_text;
    document.getElementById('footerBrand').textContent = brandName;
}

if (window.elementSdk) {
    window.elementSdk.init({
        defaultConfig,
        onConfigChange,
        mapToCapabilities: (config) => ({
            recolorables: [
                { get: () => config.primary_bg || defaultConfig.primary_bg, set: (v) => { config.primary_bg = v; window.elementSdk.setConfig({ primary_bg: v }); } },
                { get: () => config.secondary_surface || defaultConfig.secondary_surface, set: (v) => { config.secondary_surface = v; window.elementSdk.setConfig({ secondary_surface: v }); } },
                { get: () => config.text_color || defaultConfig.text_color, set: (v) => { config.text_color = v; window.elementSdk.setConfig({ text_color: v }); } },
                { get: () => config.primary_action || defaultConfig.primary_action, set: (v) => { config.primary_action = v; window.elementSdk.setConfig({ primary_action: v }); } }
            ],
            fontEditable: { get: () => config.font_family || defaultConfig.font_family, set: (v) => { config.font_family = v; window.elementSdk.setConfig({ font_family: v }); } },
            fontSizeable: { get: () => config.font_size || defaultConfig.font_size, set: (v) => { config.font_size = v; window.elementSdk.setConfig({ font_size: v }); } }
        }),
        mapToEditPanelValues: (config) => new Map([
            ['brand_name', config.brand_name || defaultConfig.brand_name],
            ['hero_title', config.hero_title || defaultConfig.hero_title],
            ['btn_her', config.btn_her || defaultConfig.btn_her],
            ['btn_him', config.btn_him || defaultConfig.btn_him],
            ['contact_text', config.contact_text || defaultConfig.contact_text]
        ])
    });
}

/**
 * 2. INITIALIZATION & HEADER
 */
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
        document.getElementById('mainContent').classList.add('visible');
    }, 50);
});

window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    const heroLogo = document.getElementById('heroLogo');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
        if(heroLogo) heroLogo.classList.add('slide-up');
    } else {
        navbar.classList.remove('scrolled');
        if(heroLogo) heroLogo.classList.remove('slide-up');
    }
});


document.addEventListener('DOMContentLoaded', async () => {
    // Check if user session is still valid on the server
    const isSessionValid = await validateUserSession();
    
    if (!isSessionValid) {
        // DO NOT use window.location.href = 'login.php'
        // Instead, just clear the UI and show the Auth Panel
        if (typeof loadAuthPanel === 'function') {
            loadAuthPanel(); 
        }
    }
});



function initSkeletonLoaders() {
    const mediaContainers = document.querySelectorAll('.skeleton-loader');

    mediaContainers.forEach(container => {
        const img = container.querySelector('img');
        const video = container.querySelector('video');

        // Handle Images
        if (img) {
            if (img.complete) {
                container.classList.add('loaded');
            } else {
                img.addEventListener('load', () => container.classList.add('loaded'));
            }
        }

        // Handle Videos
        if (video) {
            // Check if video is already metadata-loaded
            if (video.readyState >= 2) {
                container.classList.add('loaded');
            } else {
                video.addEventListener('loadeddata', () => container.classList.add('loaded'));
            }
        }
    });
}

// Run this on page load
document.addEventListener('DOMContentLoaded', initSkeletonLoaders);




// --- Global Config ---
const FOLDER_PREFIX = 'admin/';
const IMAGE_DURATION = 5000;

// --- Story System Selectors ---
const statusViewer = document.getElementById('statusViewer'); 
const fullscreenImage = document.getElementById('fullscreenImage');
const progressContainer = document.querySelector('.progress-container');
const fullscreenName = document.getElementById('fullscreenName'); 

// --- Product Panel Selectors (The "Buy" Drawer) ---
const productPanel = document.getElementById('productPanel');
const panelOverlay = document.getElementById('panelOverlay');
const panelContent = document.getElementById('panelContent');
const orderBtn = document.getElementById('orderBtn'); // Trigger inside story

// --- State Tracking ---
let statusData = []; 
let currentIndex = 0;
let statusTimer = null;
let progressInterval = null;

// -------------------- STORY SYSTEM --------------------

let storyInterval;

// Global variable to manage the timer interval
async function loadLatestStories() {
    try {
        const response = await fetch('api/fetch_latest.php');
        const rawData = await response.json();
        
        const container = document.querySelector('.status-container');
        if (!container) return;

        // Handle case where all items have been deleted/expired
        if (rawData.length === 0) {
            container.innerHTML = `
                <div style="padding:20px; color:#94a3b8; font-size:13px; text-align:center; width:100%;">
                    No new updates. Check back later! ✨
                </div>`;
            return;
        }

        // Clear any existing interval before starting a new one
        if (storyInterval) clearInterval(storyInterval);

        // Process data and calculate expiry timestamp
        statusData = rawData.map(item => {
            // Calculate expiry: created_at + 36 hours
            // Using replace handles potential cross-browser date parsing issues
            const created = new Date(item.created_at.replace(/-/g, "/")).getTime();
            const expiry = created + (36 * 60 * 60 * 1000); 

            return {
                ...item,
                url: item.url.startsWith(FOLDER_PREFIX) ? item.url : FOLDER_PREFIX + item.url,
                formattedPrice: item.price.toString().includes('₦') ? item.price : '₦' + item.price,
                expiryTime: expiry
            };
        });
        
        container.innerHTML = statusData.map((data, index) => `
            <div class="status-card" data-index="${index}" style="position:relative;">
                <div class="story-timer" id="timer-${data.id}" 
                     style="position:absolute; top:0; right:0; background:white; color:#000; font-size:14px; padding:4px 8px; border-radius:0 0 0 20px; font-weight:700; z-index:10; border:1px solid rgba(255,255,255,0.2); font-family: 'Courier New', monospace;">
                    00:00:00
                </div>

                <div class="status-media-wrapper" style="width:100%; height:100%; background:#000; overflow:hidden; border-radius:inherit;">
                    ${data.type === 'video' 
                        ? `<video data-src="${data.url}#t=0.1" class="status-video" loading="lazy" muted playsinline preload="none" style="width:100%; height:100%; object-fit:contain;"></video>` 
                        : `<img src="${data.url}" class="status-image" loading="lazy" style="width:100%; height:100%; object-fit:cover;">`
                    }
                </div>
                <div class="status-avatar-ring">
                    <div class="status-avatar">MG</div>
                </div>
                <div class="status-name">${data.name.split(' - ')[0]}</div>
                <div class="status-price" style="font-size:15px; color:#fff; text-align:center; font-weight:bold;">${data.formattedPrice}</div>
            </div>
        `).join('');

        // Initialize the countdown ticker
        initVideoObserver();
        startStoryTimers();
        
        if (typeof attachStoryEvents === 'function') attachStoryEvents();
        
    } catch (err) { 
        console.error("Story load error:", err); 
    }
}

function startStoryTimers() {
    const update = () => {
        const now = new Date().getTime();
        let activeTimers = 0;
        
        statusData.forEach(data => {
            const timerEl = document.getElementById(`timer-${data.id}`);
            if (!timerEl) return;

            const distance = data.expiryTime - now;
            activeTimers++;

            if (distance < 0) {
                timerEl.innerText = "EXPIRED";
                timerEl.style.background = "rgba(255, 0, 0, 0.8)";
                return;
            }

            const hours = Math.floor(distance / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Format as HH:MM:SS
            timerEl.innerText = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Add urgency: turn red if less than 1 hour remains
            if (hours < 1) {
                timerEl.style.color = "#ff4d4d";
            }
        });

        // If no more items are being tracked, stop the interval
        if (activeTimers === 0 && storyInterval) {
            clearInterval(storyInterval);
        }
    };

    update(); // Run once immediately to avoid 1s delay
    storyInterval = setInterval(update, 1000);
}


function initVideoObserver() {
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            
            if (entry.isIntersecting) {
                // 1. Only set the source when the video is actually on screen
                if (!video.src) {
                    video.src = video.getAttribute('data-src');
                    video.load();
                }
                video.play().catch(() => {});
            } else {
                // 2. Pause when it leaves view to save CPU
                video.pause();
                
                // 3. OPTIONAL: If you have MANY videos, 
                // clear the src here to free up RAM, but data-src must remain.
            }
        });
    }, { 
        root: document.querySelector('.status-container'), 
        threshold: 0.6 // Only play when 60% of the video is visible
    });

    document.querySelectorAll('.status-video').forEach(vid => videoObserver.observe(vid));
}

function createProgressBars() {
    progressContainer.innerHTML = '';
    statusData.forEach((_, index) => {
        const bar = document.createElement('div');
        bar.className = 'progress-bar';
        const progress = document.createElement('div');
        progress.className = 'progress';
        if (index < currentIndex) progress.style.width = '100%';
        bar.appendChild(progress);
        progressContainer.appendChild(bar);
    });
}

function animateProgress(duration) {
    const bars = document.querySelectorAll('.progress');
    const currentBar = bars[currentIndex];
    let start = null;

    if (progressInterval) cancelAnimationFrame(progressInterval);

    function step(timestamp) {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min((elapsed / duration) * 100, 100);
        if(currentBar) currentBar.style.width = progress + '%';

        if (progress < 100) {
            progressInterval = requestAnimationFrame(step);
        }
    }
    progressInterval = requestAnimationFrame(step);
}

function showStatus(index) {
    if (index < 0 || index >= statusData.length) { closeStatus(); return; }

    currentIndex = index;
    const data = statusData[currentIndex];
    const fullscreenContainer = document.getElementById('statusFullscreen');
    
    if (!fullscreenContainer) return;

    // 1. Update Header Info
    const nameLabel = document.getElementById('fullscreenName');
    if (nameLabel) {
        nameLabel.innerHTML = `
            <div style="font-weight:bold;">${data.name.split(' - ')[0]}</div>
            <div style="font-size: 16px; width: fit-content; padding: 0 8px; opacity: 1; background: white; color: black; text-align: center; border-radius: 5px;">${data.formattedPrice}</div>
        `;
    }

    // 2. Prepare Progress Bars
    createProgressBars();
    clearTimeout(statusTimer);
    if (progressInterval) cancelAnimationFrame(progressInterval);

    // 3. Reset Media
    fullscreenImage.style.display = 'none';
    const existingVid = document.getElementById('statusVideo');
    if (existingVid) existingVid.remove();

    // 4. Render Media
    if (data.type === 'video') {
        const video = document.createElement('video');
        video.id = 'statusVideo';
        video.src = data.url;
        video.autoplay = true;
        video.playsInline = true;
        video.className = 'fullscreen-image';
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'contain';
        fullscreenContainer.appendChild(video);

        video.onloadedmetadata = () => {
            animateProgress(video.duration * 1000);
        };
        video.onended = () => showStatus(currentIndex + 1);
        video.play().catch(() => { video.muted = true; video.play(); });
    } else {
        fullscreenImage.style.display = 'block';
        fullscreenImage.src = data.url;
        animateProgress(IMAGE_DURATION);
        statusTimer = setTimeout(() => showStatus(currentIndex + 1), IMAGE_DURATION);
    }

    // 5. Setup Buttons
    updateInteractionButtons(data);
}

function updateInteractionButtons(data) {
    const likeBtn = document.getElementById('likeBtn');
    const shareBtn = document.getElementById('shareBtn');
    const orderBtn = document.getElementById('orderBtn');

    if (likeBtn) {
        const isLiked = localStorage.getItem(`liked_${data.id}`) === 'true';
        const svg = likeBtn.querySelector('svg');
        svg.setAttribute('fill', isLiked ? '#ff4b2b' : 'none');
        svg.setAttribute('stroke', isLiked ? '#ff4b2b' : 'white');
        likeBtn.onclick = (e) => { e.stopPropagation(); toggleLike(data.id, likeBtn); };
    }

    if (shareBtn) {
        shareBtn.onclick = (e) => { e.stopPropagation(); copyProductLink(data.id); };
    }

    if (orderBtn) {
        orderBtn.onclick = (e) => {
            e.stopPropagation();
            closeStatus();
            if(window.loadProductPanel) window.loadProductPanel(data.id);
        };
    }
}

// Global Click for Navigation
statusViewer.onclick = (e) => {
    if (e.target.closest('.interaction-btn') || e.target.closest('#orderBtn') || e.target.closest('.progress-container')) return;
    const width = window.innerWidth;
    const clickX = e.clientX;
    if (clickX < width / 3) showStatus(currentIndex - 1);
    else showStatus(currentIndex + 1);
};

function toggleLike(productId, btnElement) {
    const key = `liked_${productId}`;
    const isLiked = localStorage.getItem(key) === 'true';
    localStorage.setItem(key, !isLiked);
    
    const svg = btnElement.querySelector('svg');
    svg.setAttribute('fill', !isLiked ? '#ff4b2b' : 'none');
    svg.setAttribute('stroke', !isLiked ? '#ff4b2b' : 'white');
    
    btnElement.style.transform = 'scale(1.2)';
    setTimeout(() => btnElement.style.transform = 'scale(1)', 200);
}

function showToast(message) {
    // Remove any existing toast first
    const existingToast = document.querySelector('.mamag-toast');
    if (existingToast) existingToast.remove();

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'mamag-toast';
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

function copyProductLink(productId) {
    const shareUrl = `${window.location.origin}${window.location.pathname}?product=${productId}`;
    
    // Attempt to copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
        // THIS TRIGGERS THE VISUAL FEEDBACK
        showToast("Link copied to clipboard ✨");
    }).catch(err => {
        console.error('Copy failed', err);
        // Fallback for older mobile browsers
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast("Link copied ✨");
    });
}

function closeStatus() {
    statusViewer.classList.remove('active');
    document.body.style.overflow = 'auto';
    clearTimeout(statusTimer);
    if (progressInterval) cancelAnimationFrame(progressInterval);
    const video = document.getElementById('statusVideo');
    if (video) { video.pause(); video.remove(); }
}

function attachStoryEvents() {
    document.querySelectorAll('.status-card').forEach(card => {
        card.onclick = () => {
            statusViewer.classList.add('active');
            showStatus(parseInt(card.dataset.index));
        };
    });
}

// Start loading
loadLatestStories();






// Helper to ensure panel closes correctly
function closeProductPanel() {
    productPanel.style.transform = 'translateY(100%)';
    panelOverlay.classList.remove('active');
    setTimeout(() => {
        productPanel.classList.remove('active');
    }, 300);
}

// -------------------- PRODUCT PANEL --------------------

function setupPanelInteractions(product, productId) {
    const mediaContainer = document.getElementById('panelMediaContainer');
    const thumbnails = panelContent.querySelectorAll('.panel-thumbnail');

    thumbnails.forEach(thumb => {
        thumb.onclick = (e) => {
            e.stopPropagation();
            thumbnails.forEach(t => t.classList.remove('selected'));
            thumb.classList.add('selected');

            const src = thumb.dataset.src || thumb.src || thumb.getAttribute('src');
            const isVid = /\.(mp4|webm|ogg|mov)$/i.test(src);

            mediaContainer.innerHTML = isVid
                ? `<video src="${src}" muted paused style="width:100%; height:100%; object-fit:contain;"></video>`
                : `<img src="${src}" class="panel-main-image" alt="${product.name}">`;
        };
    });

    const sizeBtns = panelContent.querySelectorAll('.size-btn');
    sizeBtns.forEach(btn => {
        btn.onclick = () => {
            sizeBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedSize = btn.dataset.size;
            document.getElementById('sizeError').classList.remove('show');
        };
    });

    const addBtn = document.getElementById('addToCartBtn');
    if (addBtn) {
        addBtn.onclick = () => {
            if (!selectedSize) {
                document.getElementById('sizeError').classList.add('show');
                return;
            }

            addToCart({
                id: productId,
                name: product.name,
                price: product.price,
                images: product.images
            }, selectedSize);

            closePanel();
            showSuccessMessage('Added to Bag!', `${product.name} has been added to your order.`);
        };
    }
}

// -------------------- CORE PANEL UI --------------------
// --- PANEL DRAG LOGIC (ONLY VIA PANEL-HOLDER) ---
let startY = 0;
let currentY = 0;
let isDragging = false;
const dragThreshold = 80; // Slightly lower for a more responsive feel

// Target the handle and the panel
const panelHolder = document.querySelector('.panelholder'); // The drag handle

// 1. START DRAGGING (ONLY ON THE HOLDER)
panelHolder.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY;
    currentY = startY;
    isDragging = true;
    
    // Remove transitions while dragging for real-time response
    productPanel.style.transition = 'none';
    panelOverlay.style.transition = 'none';
}, { passive: true });

// 2. MOVE LOGIC
panelHolder.addEventListener('touchmove', (e) => {
    if (!isDragging) return;

    const touchY = e.touches[0].clientY;
    const diff = touchY - startY;

    // Only allow downward dragging (diff > 0)
    if (diff > 0) {
        currentY = touchY;
        
        // Apply transform to the whole panel
        productPanel.style.transform = `translateY(${diff}px)`;
        
        // Fade the overlay slightly as you drag down
        const progress = Math.min(diff / 400, 1);
        panelOverlay.style.opacity = (1 - progress * 0.5).toString();

        if (e.cancelable) e.preventDefault();
    }
}, { passive: false });

// 3. END DRAGGING
panelHolder.addEventListener('touchend', () => {
    if (!isDragging) return;
    
    const diff = currentY - startY;
    isDragging = false;
    
    // Re-apply smooth "bubble" transition
    productPanel.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    panelOverlay.style.transition = 'opacity 0.3s ease';

    if (diff > dragThreshold) {
        closePanel();
    } else {
        // Snap back to open position
        productPanel.style.transform = 'translateY(0)';
        panelOverlay.style.opacity = '1';
    }
});

// --- CORE PANEL FUNCTIONS ---

function openPanel() {
    panelOverlay.classList.add('active');
    productPanel.classList.add('active');
    
    // Reset styles for opening
    productPanel.style.transform = 'translateY(0)';
    panelOverlay.style.opacity = '1';
    
    document.body.style.overflow = 'hidden';
}

function closePanel() {
    // Blur any active inputs to hide mobile keyboard
    const activeInput = document.querySelector('input:focus');
    if (activeInput) activeInput.blur();

    // Smooth slide down animation
    productPanel.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
    productPanel.style.transform = 'translateY(100%)';
    panelOverlay.style.opacity = '0';

    // Remove classes
    setTimeout(() => {
        panelOverlay.classList.remove('active');
        productPanel.classList.remove('active');
        document.body.style.overflow = ''; 
        
        // Clean up inline styles for next use
        productPanel.style.transform = '';
        panelOverlay.style.opacity = '';
        isDragging = false;
    }, 400);
}

// Close when clicking the overlay (background)
panelOverlay.addEventListener('click', () => {
    closePanel();
});

// Prevent clicks inside the panel content from closing it
productPanel.addEventListener('click', (e) => {
    e.stopPropagation();
});




function showSuccessMessage(title, text) {
    successMessage.querySelector('.success-message-title').textContent = title;
    successMessage.querySelector('.success-message-text').textContent = text;
    successMessage.classList.add('show');
    setTimeout(() => { successMessage.classList.remove('show'); }, 1500);
}



// -------------------- EVENTS --------------------

orderBtn.onclick = (e) => {
    e.stopPropagation();
    const currentItem = statusData[currentIndex];
    if (currentItem) { closeStatus(); loadProductPanel(currentItem.id); }
};

document.getElementById('closeBtn').onclick = closeStatus;
panelOverlay.onclick = closePanel;

window.addEventListener('DOMContentLoaded', loadLatestStories);








 //6. CART & SHOPPING BAG

let cartItems = [];
let cartCount = 0;


// Use window. directly to ensure every function sees the same data
window.currentUser = JSON.parse(localStorage.getItem('mamag_users')) || {
    name: '', email: '', phone: '', orders: [] 
};
window.isLoggedIn = !!window.currentUser.email;

window.updateGlobalUser = function(userData) {
    window.currentUser = userData;
    window.isLoggedIn = !!(userData && userData.email);
    localStorage.setItem('mamag_users', JSON.stringify(userData));
};
window._isPollingPayment = false;


// Icons
const iconBtns = document.querySelectorAll('.icon-btn');
iconBtns[0].addEventListener('click', loadCartPanel); // Shopping Bag
iconBtns[1].addEventListener('click', () => isLoggedIn ? refreshAndOpenProfile() : loadAuthPanel()); // Account
iconBtns[2].addEventListener('click', loadSearchPanel); // Search



async function refreshAndOpenProfile() {
    try {
        const response = await fetch(`api/get_user_data.php?email=${encodeURIComponent(currentUser.email)}`);
        const data = await response.json();
        
        if (data.status === 'success') {
            // This is the most important line:
            currentUser.orders = data.orders; 
            
            // Optional: Update localStorage so it stays fixed if they refresh
            localStorage.setItem('mamag_users', JSON.stringify(currentUser));
            
            console.log("UI Sync Successful. New status:", currentUser.orders[0].status);
        }
    } catch (err) {
        console.error("Sync failed:", err);
    } finally {
        loadProfilePanel(); 
    }
}




/** 8. AUTH & ACCOUNT MANAGEMENT*/

// Contact
document.querySelector('.nav-left').addEventListener('click', () => {
    panelContent.innerHTML = `
    <div class="contact-modern-container">
        <h2 class="contact-title">Visit MAMAG</h2>
        
       <div class="map-wrapper" style="position: relative; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <iframe
                width="100%"
                height="450"
                style="border:0"
                loading="lazy"
                allowfullscreen
                referrerpolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBeAADepA4Ni_xCVdmGKNWLjinYdSc4dMU&q=Ajoa+Plaza,+11+Martins+St,+Lagos+Island,+Lagos">
            </iframe>

            <a href="https://www.google.com/maps/dir/?api=1&destination=Ajoa+Plaza+11+Martins+Street+Balogun+Market+Lagos+island" 
            target="_blank" 
            style="position: absolute; top: 15px; right: 10px; background: #000; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 50px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 8px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
                Get Directions
            </a>
        </div>

        <div class="contact-details-grid">
            <div class="contact-card">
                <i data-lucide="map-pin"></i>
                <p style="font-size: 12px;">GF 01 Ajoa Plaza, 11, Martins Street, Balogun Market</p>
            </div>
            
            <div class="contact-actions">
                <a href="tel:+2348033378712" class="contact-btn">
                    <i data-lucide="phone"></i> Call Us
                </a>
                <a href="https://wa.me/2348034056664" class="contact-btn whatsapp">
                    <i data-lucide="message-circle"></i> WhatsApp
                </a>
            </div>

            <div class="store-hours">
                <h3>Store Hours</h3>
                <div class="hour-row"><span>Mon - Fri</span> <span>7:30 AM - 7:45 PM</span></div>
                <div class="hour-row"><span>Sat - Sun</span> <span>9:00 AM - 7:00 PM</span></div>
                <div class="hour-row"><span>Sun</span> <span>Closed</span></div>
            </div>
        </div>
    </div>
    `;
    
    // Re-initialize icons if you use Lucide
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    openPanel();
});




function loadAuthPanel()    {
    panelContent.innerHTML = `
        <div class="contact-content">
            <h2 class="contact-title">Account</h2>
            <div style="display:flex; gap:10px; margin-bottom:30px;">
                <button class="panel-btn primary" style="flex:1" onclick="loadLoginForm()">Login</button>
                <button class="panel-btn secondary" style="flex:1" onclick="loadSignupForm()">Sign Up</button>
            </div>
        </div>
    `;
    openPanel();
}

/* --- 2. INITIALIZATION & AUTO-LOGIN --- */
function checkAuthState() {
    const savedUser = localStorage.getItem('mamag_users');
    if (savedUser) {
        isLoggedIn = true;
        currentUser = JSON.parse(savedUser);
        console.log("Auto-login: ", currentUser.name);
    }
}
checkAuthState(); // Run immediately on load

/* --- 3. PASSWORD VISIBILITY TOGGLE --- */
function togglePass(inputId, iconSpan) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === "password") {
        input.type = "text";
        iconSpan.innerHTML = '<i data-lucide="eye-off"></i>';
    } else {
        input.type = "password";
        iconSpan.innerHTML = '<i data-lucide="eye"></i>';
    }
    // Refresh icons to show the new eye/eye-off SVG
    if (window.lucide) lucide.createIcons();
}

/* --- 4. LOGIN FORM --- */
function loadLoginForm() {
    panelContent.innerHTML = `
        <div class="contact-content">
            <h2 class="contact-title">Login</h2>
            <form id="loginForm">
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" id="lEmail" class="form-input" required>
                </div>
                <div class="form-group">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <label class="form-label">Password</label>
                        <span onclick="loadForgotPanel()" style="font-size:13px; color:var(--text-primary); cursor:pointer; margin-bottom:5px;">Forgot Password?</span>
                    </div>
                    <div style="position: relative;">
                        <input type="password" id="lPass" class="form-input" required style="padding-right: 45px;">
                        <span onclick="togglePass('lPass', this)" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); cursor: pointer; color: var(--text-secondary); display: flex;">
                            <i data-lucide="eye"></i>
                        </span>
                    </div>
                </div>

                <div class="form-group" style="display:flex; align-items:center; gap:8px; margin-top:-5px; margin-bottom:20px;">
                    <input type="checkbox" id="rememberMe" style="width:16px; height:16px; cursor:pointer; accent-color:#fff;">
                    <label for="rememberMe" style="font-size:13px; color:#888; cursor:pointer; margin:0;">Remember Me</label>
                </div>

                <button type="submit" class="panel-btn primary" style="width:100%" id="loginSubmitBtn">Login</button>
                <p style="text-align:center; margin-top:15px; font-size:14px; color:#888;">
                    New? <span onclick="loadSignupForm()" style="color: var(--text-primary); padding-left: 5px; cursor:pointer;">Create Account</span>
                </p>
            </form>
        </div>`;

    if (window.lucide) lucide.createIcons();

    // Check if we have a saved email in localStorage
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
        document.getElementById('lEmail').value = savedEmail;
        document.getElementById('rememberMe').checked = true;
    }

    document.getElementById('loginForm').onsubmit = async (e) => {
        e.preventDefault();
        const btn = document.getElementById('loginSubmitBtn');
        const rememberMeChecked = document.getElementById('rememberMe').checked;
        
        btn.disabled = true;
        btn.innerText = "Connecting...";

        try {
            const response = await fetch('includes/auth.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'login',
                    email: document.getElementById('lEmail').value,
                    password: document.getElementById('lPass').value
                })
            });

            const result = await response.json();
           if (result.status === 'success') {   
            // 1. Update the local variables
            updateGlobalUser({
            name: result.user.name,
            email: result.user.email,
            phone: result.user.phone || ""
             }); // Ensure phone is captured for checkout

            // 2. IMPORTANT: Sync with the global window object
            // Your loadCheckoutPanel() looks at window.currentUser!
            window.currentUser = currentUser;

            // 3. Remember Me Logic
            if (rememberMeChecked) {
                localStorage.setItem('rememberedEmail', currentUser.email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }

            // 4. Persistence
            localStorage.setItem('mamag_users', JSON.stringify(currentUser));
            
            showToast(`Welcome back, ${currentUser.name} ✨`);

            // 5. Decision: Where to send the user?
            // If they were trying to pay, send them back to checkout, otherwise profile.
            if (document.querySelector('.contact-title')?.innerText === 'Checkout' || window.pendingCheckout) {
                loadCheckoutPanel();
                window.pendingCheckout = false; // Reset flag
                loadCheckoutPanel();
            } else {
                loadProfilePanel();
            }

        } else {
            showToast(result.message);
            btn.disabled = false;
            btn.innerText = "Login";
        }
        } catch (err) {
            showToast("Connection Failed ❌");
            btn.disabled = false;
            btn.innerText = "Login";
        }
    };
}


// Function to show the "Request Reset" panel
function loadForgotPanel() {
    panelContent.innerHTML = `
        <div class="auth-form-container">
            <h2 class="contact-title">Reset Password</h2>
            <p style="text-align:center; color:#ccc; margin-bottom:20px;">Enter your email to receive a reset link.</p>
            <div class="form-group">
                <input type="email" id="resetEmail" class="form-input" placeholder="email@example.com" required>
            </div>
            <button class="panel-btn primary" style="width:100%;" id="sendResetBtn">Send Reset Link</button>
            <button type="button" onclick="loadLoginForm()" style="width:100%; background:none; border:none; margin-top:15px; cursor:pointer; color:#888;">Back to Login</button>
        </div>`;

    // Inside loadForgotPanel()
    const sendBtn = document.getElementById('sendResetBtn');
    sendBtn.onclick = async () => {
        const emailInput = document.getElementById('resetEmail');
        const email = emailInput.value;

        if (!email) {
            showToast("Please enter your email! ⚠️");
            return;
        }

        sendBtn.innerText = "Sending...";
        sendBtn.disabled = true;

        try {
            const response = await fetch('includes/auth.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'forgot_password', email })
            });

            const result = await response.json();
            showToast(result.message);
            
            if (result.status === 'success') {
                sendBtn.innerText = "Check Email";
            } else {
                sendBtn.disabled = false;
                sendBtn.innerText = "Send Reset Link";
            }
        } catch (err) {
            showToast("Connection Failed ❌");
            sendBtn.disabled = false;
            sendBtn.innerText = "Send Reset Link";
        }
    };
}

// Function to show the "Change Password" panel
function loadResetPasswordPanel(email, token) {
    // We target the ID directly here for maximum reliability
    const targetContainer = document.getElementById('panelContent');
    
    if (!targetContainer) {
        console.error("Critical Error: 'panelContent' element not found in the DOM.");
        return;
    }

    targetContainer.innerHTML = `
        <div class="auth-form-container">
            <h2 class="contact-title" style="font-family: 'Lobster Two', cursive; font-size: 35px; text-align:center; color:#fff; margin-bottom:10px;">New Password</h2>
            <p style="text-align:center; color:#888; margin-bottom:30px; font-size: 14px; line-height:1.5;">
                Secure your MAMAG account for: <br>
                <span style="color:#fff; font-weight:500; border-bottom: 1px dashed #444;">${email}</span>
            </p>
            
            <div class="form-group" style="margin-bottom: 20px;">
                <label class="form-label" style="color:#ccc; font-size:12px; text-transform:uppercase; letter-spacing:1px;">New Password</label>
                <div style="position: relative;">
                    <input type="password" id="newPass" class="form-input" placeholder="Min. 8 characters" required style="width:100%; padding-right:40px;">
                    <span onclick="togglePass('newPass', this)" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #666;">
                        <i data-lucide="eye"></i>
                    </span>
                </div>
            </div>
            
            <div class="form-group" style="margin-bottom: 30px;">
                <label class="form-label" style="color:#ccc; font-size:12px; text-transform:uppercase; letter-spacing:1px;">Confirm New Password</label>
                <div style="position: relative;">
                    <input type="password" id="confirmNewPass" class="form-input" placeholder="Repeat new password" required style="width:100%; padding-right:40px;">
                    <span onclick="togglePass('confirmNewPass', this)" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #666;">
                        <i data-lucide="eye"></i>
                    </span>
                </div>
            </div>
            
            <button class="panel-btn primary" style="width:100%; padding: 15px; font-weight: bold; letter-spacing:1px;" id="updatePassBtn">
                UPDATE PASSWORD
            </button>
            
            <p style="text-align:center; margin-top:20px;">
                <span onclick="loadLoginForm()" style="color:#888; font-size:13px; cursor:pointer; text-decoration:underline;">Back to Login</span>
            </p>
        </div>`;

    // Re-initialize icons for the new HTML
    if (window.lucide) lucide.createIcons();

    document.getElementById('updatePassBtn').onclick = async () => {
        const password = document.getElementById('newPass').value;
        const confirm = document.getElementById('confirmNewPass').value;

        if (password.length < 8) return showToast("Password too short! ⚠️");
        if (password !== confirm) return showToast("Passwords do not match! ❌");

        const response = await fetch('includes/auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'reset_password', email, token, password })
        });

        const result = await response.json();
        if (result.status === 'success') {
            showToast("Password updated! Please login. ✨");
            loadLoginForm();
        } else {
            showToast(result.message);
        }
    };
}



/* --- 5. SIGNUP FORM --- */


function loadSignupForm() {
    // 1. First, render the HTML
    panelContent.innerHTML = `
        <div class="auth-form-container">
          <h2 class="contact-title">Create Account</h2>
          <form id="signupForm">
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" id="signupName" class="form-input" placeholder="Full Name" required>
            </div>
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" id="signupEmail" class="form-input" placeholder="email@example.com" required>
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input type="tel" id="signupPhone" class="form-input" placeholder="080..." required>
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <div style="position: relative;">
                <input type="password" id="signupPassword" class="form-input" placeholder="Min. 8 characters" required minlength="8" style="padding-right: 40px;">
                <span onclick="togglePass('signupPassword', this)" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); cursor: pointer; color: var(--text-primary); display: flex;">
                    <i data-lucide="eye"></i>
                </span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Confirm Password</label>
              <div style="position: relative;">
                <input type="password" id="signupConfirm" class="form-input" placeholder="Repeat password" required style="padding-right: 40px;">
                <span onclick="togglePass('signupConfirm', this)" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); cursor: pointer; color:  var(--text-primary); display: flex;">
                    <i data-lucide="eye"></i>
                </span>
              </div>
            </div>
            <button type="submit" class="panel-btn primary" style="width:100%; margin-top:10px;" id="signupSubmitBtn">Create Account</button>
            <button type="button" onclick="loadLoginForm()" style="width:100%; background:none; border:none; margin-top:15px; cursor:pointer; color:#888;">Back to Login</button>
          </form>
        </div>`;

    if (window.lucide) lucide.createIcons();
    
    // 2. Attach the logic ONLY after the HTML is set
    const signupForm = document.getElementById('signupForm');
    
    if (signupForm) {
        signupForm.onsubmit = async (e) => {
            e.preventDefault();
            const btn = document.getElementById('signupSubmitBtn');
            const email = document.getElementById('signupEmail').value;
            const pass = document.getElementById('signupPassword').value;
            const confirm = document.getElementById('signupConfirm').value;

            if (pass !== confirm) {
                showToast("Passwords do not match! ⚠️");
                return;
            }

            btn.disabled = true;
            btn.innerText = "Sending Code...";

            try {
                const response = await fetch('includes/auth.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'send_otp',
                        name: document.getElementById('signupName').value,
                        email: email,
                        phone: document.getElementById('signupPhone').value,
                        password: pass
                    })
                });

                const result = await response.json();
                if (result.status === 'success') {
                    showToast("Code sent to your email! 📩");
                    loadVerifyPanel(email); 
                } else {
                    showToast(result.message);
                    btn.disabled = false;
                    btn.innerText = "Create Account";
                }
            } catch (err) {
                showToast("Connection Failed ❌");
                btn.disabled = false;
                btn.innerText = "Create Account";
            }
        };
    }
}


// Step 2: New Verification Panel UI
function loadVerifyPanel(email) {
    panelContent.innerHTML = `
        <div class="auth-form-container">
          <h2 class="contact-title">Verify Email</h2>
          <p style="text-align:center; color:#ccc; margin-bottom:20px;">Enter the 4-digit code sent to <b style="font-weight: 500;">${email}</b></p>
          <div style="display:flex; gap:10px; justify-content:center; margin-bottom:20px;">
            <input type="text" maxlength="1" class="otp-input" id="otp1">
            <input type="text" maxlength="1" class="otp-input" id="otp2">
            <input type="text" maxlength="1" class="otp-input" id="otp3">
            <input type="text" maxlength="1" class="otp-input" id="otp4">
          </div>
          <button class="panel-btn primary" style="width:100%;" id="verifyBtn">Verify & Sign Up</button>
          
          <div style="text-align:center; margin-top:20px; display: flex; align-items: center; justify-content: center;">
             <p id="resendTimer" style="color:#888; font-size:14px;">Resend code in <span id="timerCount">30</span>s</p>
             <button id="resendBtn" style="display:none; background:none; border:none; color:#fff; cursor:pointer; text-decoration:underline; font-size:14px; width: 100%; padding: 10px;">Resend Code</button>
          </div>

          <button type="button" onclick="loadSignupForm()" style="width:100%; background:none; border:none; margin-top:15px; cursor:pointer; color:#888;">Change Email</button>
        </div>`;

    const inputs = document.querySelectorAll('.otp-input');
    const resendBtn = document.getElementById('resendBtn');
    const resendTimer = document.getElementById('resendTimer');
    const timerCount = document.getElementById('timerCount');

    // 1. Timer Logic
    let timeLeft = 30;
    const startTimer = () => {
        resendBtn.style.display = 'none';
        resendTimer.style.display = 'block';
        timeLeft = 30;
        const timer = setInterval(() => {
            timeLeft--;
            timerCount.innerText = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer);
                resendTimer.style.display = 'none';
                resendBtn.style.display = 'block';
            }
        }, 1000);
    };
    startTimer();

    // 2. Resend Click Logic
    resendBtn.onclick = async () => {
        showToast("Sending new code...");
        const response = await fetch('includes/auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'resend_otp', email })
        });
        const result = await response.json();
        if (result.status === 'success') {
            showToast("New code sent!");
            startTimer();
        } else {
            showToast(result.message);
        }
    };

    // Auto-focus logic
    inputs.forEach((input, index) => {
        input.oninput = () => {
            if (input.value && index < 3) inputs[index + 1].focus();
        };
        // Handle backspace
        input.onkeydown = (e) => {
            if (e.key === "Backspace" && !input.value && index > 0) inputs[index - 1].focus();
        };
    });

    // Verify Logic
    document.getElementById('verifyBtn').onclick = async () => {
        const otp = [...inputs].map(i => i.value).join('');
        if (otp.length < 4) return showToast("Enter full code");

        const response = await fetch('includes/auth.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'verify_otp', email, otp })
        });

        const result = await response.json();
        if (result.status === 'success') {
            showToast("Account Verified Successfully! ✅");
            setTimeout(() => { loadLoginForm(); }, 1500); 
        } else {
            showToast(result.message);
        }
    };
}





let orderStatusInterval;

function startStatusPolling(userEmail) {
    // Clear any existing interval first
    if (orderStatusInterval) clearInterval(orderStatusInterval);

    // Poll every 10 seconds
    orderStatusInterval = setInterval(async () => {
        try {
            const response = await fetch(`api/get_user_data.php?email=${encodeURIComponent(userEmail)}`);
            const data = await response.json();

            if (data.status === 'success') {
                // Call your existing function that renders the orders to the UI
                renderOrdersUI(data.orders); 
                
                // Optional: Stop polling if all recent orders are already "Delivered"
                checkIfPollingShouldStop(data.orders);
            }
        } catch (err) {
            console.error("Polling error:", err);
        }
    }, 10000); // 10000ms = 10 seconds
}
 
 
// 1. Global variable to manage the polling timer
let profileStatusInterval;
let selectedRating = 0;

async function fetchLatestOrders(email) {
    const container = document.getElementById('ordersContainer');
    try {
        // Ensure the path to api/ folder is correct from your root index.php
        const response = await fetch(`api/get_user_data.php?email=${encodeURIComponent(email)}`);
        
        if (!response.ok) {
            throw new Error("Server Error");
        }

        const data = await response.json();

        if (data.status === 'success') {
            currentUser.orders = data.orders;
            localStorage.setItem('mamag_users', JSON.stringify(currentUser));
            updateOrdersListUI(); // This will now find the decoded items and render them
        }
    } catch (err) {
        console.error("Sync error:", err);
        if (container) container.innerHTML = '<div class="error">Unable to load wardrobe.</div>';
    }
}


function loadFeedbackPanel() {
    panelContent.innerHTML = `
        <div class="contact-content">
            <h2 class="contact-title">Service Feedback</h2>
            <p style="text-align: center; color: var(--text-primary); margin-bottom: 30px; font-size: 14px;">
                How was your experience with MAMAG ? <br> Your thoughts help us refine our craft.
            </p>

            <form id="feedbackForm">
                <div class="form-group" style="text-align: center; margin-bottom: 30px;">
                    <label class="form-label" style="display: block; margin-bottom: 15px;">Your Rating</label>
                    <div class="star-rating" style="display: flex; justify-content: center; gap: 10px;">
                        ${[1, 2, 3, 4, 5].map(num => `
                            <span class="star" data-value="${num}" onclick="setRating(${num})" style="cursor: pointer; color: #333; transition: 0.3s;">
                                <i data-lucide="star" style="width: 32px; height: 32px;"></i>
                            </span>
                        `).join('')}
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Tell us more (Optional)</label>
                    <textarea id="feedbackText" class="form-input-textarea" placeholder="What did you love? What can we improve?" 
                        style="height: 120px; padding-top: 12px; resize: none; background:  var(--bg); border: 1px solid #222; color: var(--text-primary);"></textarea>
                </div>

                <button type="submit" class="panel-btn primary" style="width:100%; margin-top: 20px;" id="feedbackSubmitBtn">
                    Submit Review
                </button>
                
                <button type="button" onclick="loadProfilePanel()" style="width:100%; background:none; border:none; margin-top:15px; cursor:pointer; color:#888;">
                    Cancel
                </button>
            </form>
        </div>
    `;

    if (window.lucide) lucide.createIcons();
    attachFeedbackHandler();
}

// Logic to handle Star Highlighting
function setRating(val) {
    selectedRating = val;
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < val) {
            star.style.color = '#ffd700'; // Highlighted star
            star.innerHTML = '<i data-lucide="star" fill="white" style="width: 32px; height: 32px;"></i>';
        } else {
            star.style.color = '#333'; // Dimmed star
            star.innerHTML = '<i data-lucide="star" style="width: 32px; height: 32px;"></i>';
        }
    });
    if (window.lucide) lucide.createIcons();
}


function attachFeedbackHandler() {
    const fForm = document.getElementById('feedbackForm');
    if (!fForm) return;

    fForm.onsubmit = async (e) => {
        e.preventDefault();
        
        // Validation: Ensure a star was picked
        if (selectedRating === 0) {
            alert("Please select a star rating before submitting.");
            return;
        }

        const btn = document.getElementById('feedbackSubmitBtn');
        const commentText = document.getElementById('feedbackText').value;

        btn.innerText = "Processing...";
        btn.disabled = true;

        // GRABBING CURRENT USER DATA AUTOMATICALLY
        const feedbackData = {
            name: currentUser.name || "MAMAG Customer",
            email: currentUser.email,
            rating: selectedRating,
            comment: commentText
        };

        try {
            const response = await fetch('api/save_feedback.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(feedbackData)
            });

            const res = await response.json();
            
            if (res.status === 'success') {
                // Reset global rating for next time
                selectedRating = 0; 
                showSuccessMessage('Feedback Sent', 'Thank you for helping us improve!');
                loadProfilePanel(); // Send them back to profile
            } else {
                throw new Error(res.message);
            }
        } catch (err) {
            console.error("Feedback Error:", err);
            alert("Failed to send feedback. Please try again.");
            btn.innerText = "Submit Review";
            btn.disabled = false;
        }
    };
}

/**
 * Main function to open the profile and start live updates
 */
async function loadProfilePanel() {
    if (!currentUser || !currentUser.email) {
        showToast("Please login to view orders 🔐");
        loadLoginForm();
        return;
    }

    // 1. Show the layout with the loading spinner immediately
    renderBaseProfileLayout();
    
    // 2. Open the panel (ensure your panel-opening logic is called)
    if(window.openPanel) openPanel(); 

    // 3. Initial fetch to populate orders
    await fetchLatestOrders(currentUser.email);
    
    // 4. Start polling every 10s to catch status updates (e.g. "Dispatched")
    startPollingStatus(currentUser.email);
}

function startPollingStatus(email) {
    if (profileStatusInterval) clearInterval(profileStatusInterval);

    profileStatusInterval = setInterval(() => {
        // Only fetch if the profile panel is actually visible to the user
        const panel = document.getElementById('sidePanel'); // Use your actual panel ID
        if (panel && panel.classList.contains('active')) {
            fetchLatestOrders(email);
        } else {
            clearInterval(profileStatusInterval);
        }
    }, 10000); 
}

/**
 * Fetches data from get_user_data.php
 */

function toggleProfileView(view) {
    // 1. Get references
    const screens = {
        main: document.getElementById('profileMainView'),
        orders: document.getElementById('ordersView'),
        requests: document.getElementById('requestsView'),
        submit: document.getElementById('submitRequestView')
    };

    // 2. Check if the elements actually exist in the DOM
    if (!screens.main) {
        console.error("Profile HTML not rendered yet!");
        return;
    }

    // 3. Remove 'active' from all
    Object.values(screens).forEach(screen => {
        if (screen) screen.classList.remove('active');
    });

    // 4. Show the specific one
    if (view === 'orders') {
        screens.orders.classList.add('active');
        if (typeof updateOrdersListUI === 'function') updateOrdersListUI();
    } 
    else if (view === 'requests') {
        screens.requests.classList.add('active');
        fetchUserRequests();
    } 
    else if (view === 'submit') {
        screens.submit.classList.add('active');
    } 
    else {
        screens.main.classList.add('active');
    }
}

/*** Renders the static parts of the profile*/
function renderBaseProfileLayout() {
    const panelContent = document.getElementById('panelContent');
    
    panelContent.innerHTML = `
        <div class="profile-container">
          <div id="profileMainView" class="view-screen active">
            <div class="profile-header-premium">
                <div class="profile-avatar-wrapper">
                    <div class="profile-avatar-large">${currentUser.name.charAt(0).toUpperCase()}</div>
                    <div class="online-badge"></div>
                </div>
                <h2 class="profile-name">${currentUser.name || 'Guest User'}</h2>
                <p class="profile-email">${currentUser.email}</p>
            </div>

            <div class="profile-menu-container">
                <div class="menu-group-label">Account Activity</div>
                
                <button class="modern-menu-item" onclick="toggleProfileView('orders')">
                    <div class="menu-icon">🛍️</div>
                    <div class="menu-text">
                        <span class="menu-title">Order History</span>
                        <span class="menu-subtitle">Track, view and manage your orders</span>
                    </div>
                    <div class="menu-arrow">❯</div>
                </button>

                <button class="modern-menu-item" onclick="toggleProfileView('requests')">
                    <div class="menu-icon">✨</div>
                    <div class="menu-text">
                        <span class="menu-title">Special Requests</span>
                        <span class="menu-subtitle">View your custom product inquiries</span>
                    </div>
                    <div class="menu-arrow">❯</div>
                </button>

                <div class="menu-group-label">Preferences</div>

                <button class="modern-menu-item" onclick="toggleAppTheme()">
                    <div class="menu-icon" id="themeIcon">🌙</div>
                    <div class="menu-text">
                        <span class="menu-title">Display Mode</span>
                        <span class="menu-subtitle" id="themeStatus">Switch to Light Mode</span>
                    </div>
                    <div class="theme-toggle-switch">
                        <div class="switch-ball"></div>
                    </div>
                </button>

                <div class="menu-group-label" style="margin-top: 20px;">Support & Feedback</div>

                <button class="modern-menu-item" onclick="loadFeedbackPanel()">
                    <div class="menu-icon">💬</div>
                    <div class="menu-text">
                        <span class="menu-title">Share Feedback</span>
                        <span class="menu-subtitle">Tell us how we can improve</span>
                    </div>
                    <div class="menu-arrow">❯</div>
                </button>

            </div>

            <div class="profile-footer-minimal">
                <div class="profile-footer-buttons">
                    <button class="logout-link-btn" onclick="logoutUser()">
                        Sign Out
                    </button>
                    <button class="delete-link-btn" onclick="deleteAccount()">
                        Delete Account
                    </button>
                </div>    
                <div class="app-version">Version 2.0.4 • Mamag Luxury</div>
            </div>
        </div>

          <div id="ordersView" class="view-screen">
            <div class="view-header">
                <button class="back-btn" onclick="toggleProfileView('main')">Back</button>
                <h3 class="view-title">Order History</h3>
            </div>
            <div id="ordersContainer"></div>
          </div>

          <div id="requestsView" class="view-screen">
            <div class="view-header">
                <button class="back-btn" onclick="toggleProfileView('main')">Back</button>
                <h3 class="view-title">My Requests</h3>
                <button class="add-request-btn" onclick="toggleProfileView('submit')">+ New</button>
            </div>
            <div id="requestsListContainer" class="requests-list">
                </div>
          </div>

            <div id="submitRequestView" class="view-screen">
            <div class="view-header luxury-header">
                <button class="back-btn-minimal" onclick="toggleProfileView('requests')">
                    Back
                </button>
                <h3 class="view-title">Request Details</h3>
            </div>

            <div class="request-form-wrapper">
                <p class="form-instruction">
                    <strong>Still searching?</strong><br>
                   Request a restock or a similar style, and we’ll check our inventory for you.
                </p>
                
                <form id="specialRequestForm" class="premium-form" onsubmit="handleRequestSubmission(event)">
                    
                    <div class="image-upload-container">
                        <label class="field-label">Reference Image</label>
                        <div class="luxury-upload-box" onclick="document.getElementById('reqImage').click()">
                            <div id="uploadPlaceholder" class="upload-state">
                                <div class="upload-icon">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="1"><path d="M12 5v14M5 12h14"/></svg>
                                </div>
                                <span>Upload Picture</span>
                            </div>
                            <input type="file" id="reqImage" name="image" accept="image/*" hidden onchange="previewReqImage(this)">
                            <img id="reqPreview" class="preview-img" style="display:none;">
                            <div id="changeImageOverlay" class="change-overlay">Tap to change</div>
                        </div>
                    </div>

                    <div class="form-fields-grid">
                        <div class="form-group-premium">
                            <label class="field-label">Item Name And Details</label>
                            <input type="text" name="product_name" required placeholder="e.g. Vintage Oversized Blazer" class="luxury-input">
                        </div>

                        <div class="form-row-flex">
                            <div class="form-group-premium">
                                <label class="field-label">Size</label>
                                <input type="text" name="size" required placeholder="UK 10 / XL" class="luxury-input">
                            </div>
                            <div class="form-group-premium">
                                <label class="field-label">Quantity</label>
                                <input type="number" name="quantity" value="1" min="1" required class="luxury-input">
                            </div>
                        </div>
                    </div>

                    <button type="submit" class="mamag-btn-black">
                        <span>SUBMIT REQUEST</span>
                    </button>
                </form>
            </div>

        </div>
      `;
}

function toggleAppTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('themeIcon');
    const themeStatus = document.getElementById('themeStatus');
    
    // Toggle the class on body
    body.classList.toggle('light-mode');
    
    const isLight = body.classList.contains('light-mode');
    
    // Update UI elements
    themeIcon.innerText = isLight ? '☀️' : '🌙';
    themeStatus.innerText = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    
    // Save preference
    localStorage.setItem('mamag-theme', isLight ? 'light' : 'dark');
    
    // Optional: Add a little "bubble" scale effect on click
    event.currentTarget.style.transform = 'scale(0.95)';
    setTimeout(() => {
        event.currentTarget.style.transform = '';
    }, 150);
}

// Run this on page load to apply saved theme
(function initTheme() {
    if (localStorage.getItem('mamag-theme') === 'light') {
        document.body.classList.add('light-mode');
    }
})();

function previewReqImage(input) {
    const preview = document.getElementById('reqPreview');
    const placeholder = document.getElementById('uploadPlaceholder');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            placeholder.style.display = 'none';
            preview.src = e.target.result;
            preview.style.display = 'block';
            // Add a subtle fade-in effect via class
            preview.style.animation = "fadeIn 0.5s";
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function openRequestForm() {
    document.querySelectorAll('.view-screen').forEach(s => s.classList.remove('active'));
    document.getElementById('submitRequestView').classList.add('active');
}

// Image Preview logic
function previewReqImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('uploadPlaceholder').style.display = 'none';
            document.getElementById('reqPreview').src = e.target.result;
            document.getElementById('reqPreview').style.display = 'block';
        }
        reader.readAsDataURL(input.files[0]);
    }
}

// --- HELPER: CLIENT-SIDE IMAGE COMPRESSION ---
async function compressImage(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate aspect ratio to resize
                if (width > maxWidth) {
                    height = (maxWidth / width) * height;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert canvas to Blob (JPEG for best compression)
                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    }));
                }, 'image/jpeg', quality);
            };
        };
    });
}

async function handleRequestSubmission(e) {
    e.preventDefault();
    const btn = e.target.querySelector('.mamag-btn-black'); 
    
    if (btn) {
        btn.innerText = "Sending..."; // Feedback for the user
        btn.disabled = true;
    }

    const formData = new FormData(e.target);
    
    // --- COMPRESSION LOGIC ---
    const imageFile = formData.get('image');
    if (imageFile && imageFile.size > 0) {
        try {
            const compressedFile = await compressImage(imageFile, 1000, 0.6); // Max width 1000px, 60% quality
            formData.set('image', compressedFile); // Swap original for compressed
        } catch (compErr) {
            console.error("Compression failed, sending original.", compErr);
        }
    }

    // --- APPEND USER DATA ---
    if (typeof currentUser !== 'undefined') {
        formData.append('user_id', currentUser.id);
        formData.append('user_name', currentUser.full_name || currentUser.name || 'Unknown User');
        formData.append('email', currentUser.email);
    }

    try {
        const response = await fetch('api/submit_request.php', {
            method: 'POST',
            body: formData 
        });

        const result = await response.json();

        if (result.status === 'success') {
            showToast("Request sent successfully");
            e.target.reset();
            document.getElementById('reqPreview').style.display = 'none';
            document.getElementById('uploadPlaceholder').style.display = 'block';
            if (typeof toggleProfileView === 'function') toggleProfileView('requests'); 
        } else {
            showToast(result.message || "Submission failed", "error");
        }
    } catch (err) {
        console.error("Fetch Error:", err);
        showToast("Network error or server issue", "error");
    } finally {
        if (btn) {
            btn.innerText = "Send Request to MAMAG";
            btn.disabled = false;
        }
    }
}

async function confirmDeleteRequest(requestId) {
    // Optional: Add a confirmation if you want
    // if (!confirm("Are you sure you want to delete this request?")) return;

    try {
        const response = await fetch('api/delete_request.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            // We only need to send the request ID. 
            // The PHP script will get the user_id from the SESSION for security.
            body: `id=${requestId}` 
        });
        
        const result = await response.json();

        if (result.status === 'success') {
            const element = document.getElementById(`request-row-${requestId}`);
            if (element) {
                element.style.transition = '0.3s ease';
                element.style.opacity = '0';
                element.style.transform = 'translateX(20px)';
                setTimeout(() => {
                    element.remove();
                    // If list is empty after removal, refresh to show "No requests" UI
                    const container = document.getElementById('requestsListContainer');
                    if (container && container.children.length === 0) {
                        fetchUserRequests();
                    }
                }, 300);
            }
            showToast("Request removed ✨");
        } else {
            showToast(result.message, "error");
        }
    } catch (err) {
        console.error(err);
        showToast("Could not connect to server", "error");
    }
}

// THE NEW TOAST SYSTEM
function showToast(message, type = "success") {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `mamag-toast ${type}`;
    toast.innerText = message.toUpperCase();
    
    // Add to body
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}


async function fetchUserRequests() {
    const container = document.getElementById('requestsListContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div style="display:flex; justify-content:center; padding:40px;">
            <div class="loader"></div> 
        </div>`;

    try {
        const response = await fetch(`api/get_my_requests.php`);
        
        if (!response.ok) {
            throw new Error('Server error');
        }

        const requests = await response.json();

        if (!Array.isArray(requests) || requests.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:60px 20px; color:#666;">
                    <div style="font-size:40px; margin-bottom:15px;">🔍</div>
                    <p>No sourcing requests found.</p>
                    <small>Your custom requests will appear here once submitted.</small>
                </div>`;
            return;
        }

        container.innerHTML = requests.map(req => {
            const isAccepted = req.status === 'Accepted';
            const isDeclined = req.status === 'Declined';
            const isPurchased = req.status === 'Purchased';
            
            // Status Styling Logic
            let statusColor = "#f39c12"; 
            let statusBg = "rgba(243, 156, 18, 0.1)";
            let displayStatus = req.status.toUpperCase();

            if (isAccepted) {
                statusColor = "#2ecc71";
                statusBg = "rgba(46, 204, 113, 0.1)";
            } else if (isDeclined) {
                statusColor = "#e74c3c";
                statusBg = "rgba(231, 76, 60, 0.1)";
                displayStatus = "DECLINED - PLEASE DELETE";
            } else if (isPurchased) {
                statusColor = "#888"; 
                statusBg = "rgba(136, 136, 136, 0.1)";
                displayStatus = "PURCHASED";
            }

            const cleanImagePath = req.image_path.includes('uploads/') ? req.image_path : `uploads/requests/${req.image_path}`;

            // LOGIC PRIORITY: Handle button/text display based on status
            let bottomActionHTML = '';
            
            if (isAccepted) {
                // Show BUY Button
                bottomActionHTML = `
                    <span style="font-weight:700; color: var(--text-primary); font-size:16px;">₦${Number(req.vendor_price).toLocaleString()}</span>
                    <button class="mamag-btn-black" 
                        style="padding:5px 20px; width: fit-content; letter-spacing: normal; font-size: 15px; border-radius:15px; margin: 0; background:var(--color-black); color:var(--color-white); border:none; font-weight:500; cursor:pointer;"
                        onclick="addSpecialRequestToCart({
                            id: '${req.id}', 
                            name: '${req.product_name}', 
                            price: ${req.vendor_price}, 
                            image: '${cleanImagePath}', 
                            quantity: ${req.quantity},
                            size: '${req.required_size}', 
                            isSpecial: true
                        }); setTimeout(fetchUserRequests, 500);">
                        Buy
                    </button>`;
            } else if (isPurchased) {
                bottomActionHTML = `
                    <span style="font-weight:700; color: var(--text-primary); font-size:16px;">₦${Number(req.vendor_price).toLocaleString()}</span>
                    <button class="mamag-btn-black" 
                        style="padding:8px 18px; width: fit-content; font-size: 11px; border-radius:15px; background:#222; color:#fff; border:1px solid #444; font-weight:700; cursor:pointer; letter-spacing:1px;"
                        onclick="requestAgain(${req.id}, this)">
                        REQUEST AGAIN
                    </button>`;
            } else {
                // Show Awaiting or Declined text
                bottomActionHTML = `
                    <div style="font-size:13px; color:#696969; font-style:italic;">
                        ${isDeclined ? 'ORDER DECLINED' : 'Awaiting MAMAG response...'}
                    </div>`;
            }

            return `
                <div class="request-card-premium" id="request-row-${req.id}" 
                    style="background: var(--bg); border:1px solid var(--color-gray-300); border-radius:15px; padding:15px; margin-bottom:15px; display:flex; gap:15px; position:relative; overflow:hidden; ${isPurchased ? 'opacity: 0.85;' : ''}">
                    
                    <div class="req_img_card" style="width:100px;  border: 1px solid var(--color-black); height:120px; border-radius:10px; overflow:hidden; flex-shrink:0; background:#1a1a1a;">
                        <img src="${cleanImagePath}" loading="lazy" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='placeholder.jpg'">
                    </div>

                    <div style="flex:1; display:flex; flex-direction:column; justify-content:space-between;">
                        <div>
                            <h4 class="req-titles">${req.product_name}</h4>
                            <div style="font-size:12px; color: var(--text-primary); margin-bottom:8px;">
                                <span>SIZE: <b>${req.required_size}</b></span> | <span>QTY: <b>${req.quantity}</b></span>
                            </div>
                            <span style="${isDeclined ? 'animation: blinkDecline 1.5s infinite;' : ''} display:inline-block; padding:4px 10px; border-radius:50px; font-size:10px; font-weight:700; color:${statusColor}; background:${statusBg}; letter-spacing:1px;">
                                ${displayStatus}
                            </span>
                        </div>

                        <div style="display:flex; align-items:center; justify-content:space-between;">
                            ${bottomActionHTML}
                        </div>
                    </div>

                    <button onclick="confirmDeleteRequest(${req.id})" 
                        style="position:absolute; top:12px; right:12px; background:none; border:none; color: var(--text-primary); cursor:pointer; padding:5px;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            `;
        }).join('');
        
    } catch (err) {
        console.error(err);
        container.innerHTML = `<p style="color:#e74c3c; text-align:center; padding:20px;">Unable to sync requests. Please try again.</p>`;
    }
}


async function requestAgain(requestId, buttonElement) {
    // Immediate visual feedback so they know it's working
    const originalText = buttonElement.innerHTML;
    buttonElement.innerHTML = "SENDING...";
    buttonElement.disabled = true;

    try {
        const response = await fetch('api/request_again.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: requestId })
        });

        const result = await response.json();

        if (result.status === 'success') {
            showToast("Re-submitted to MAMAG"); 
            fetchUserRequests(); // Refresh the list
        } else {
            showToast("Error: " + result.message);
            buttonElement.innerHTML = originalText;
            buttonElement.disabled = false;
        }
    } catch (err) {
        console.error(err);
        showToast("Connection failed");
        buttonElement.innerHTML = originalText;
        buttonElement.disabled = false;
    }
}


function addSpecialRequestToCart(item) {
    // 1. Check if the special request is already in the cart
    const existing = cartItems.find(i => i.id === item.id);
    if (existing) {
        showToast("Already in bag");
        return;
    }

    // 2. Fix for NaN: ensure quantity is a valid number
    // We check both 'item.qty' and 'item.quantity' just in case
    let rawQty = item.quantity || item.qty || 1;
    let finalQty = parseInt(rawQty);
    
    // If it's still not a number, default to 1
    if (isNaN(finalQty)) {
        finalQty = 1;
    }

    // 3. Push to cart with the corrected quantity
    cartItems.push({ 
        id: item.id, 
        name: item.name + " (Special Order)", 
        price: parseFloat(item.price) || 0, 
        stock: finalQty, 
        size: item.size || 'N/A',
        image: item.image, 
        quantity: finalQty, 
        isSpecial: true 
    });
    
    saveCartToStorage();
    updateCartBadge();
    
    if (typeof loadCartPanel === 'function') {
        loadCartPanel(); 
    }
    
    showToast("Special Order added to bag");
}



/** * Renders the dynamic orders list  */

async function refreshUserWardrobe() {
    const ordersContainer = document.getElementById('ordersContainer');
    if (ordersContainer) {
        ordersContainer.innerHTML = '<div class="loader">...</div>';
    }

    try {
        const response = await fetch('api/get_orders.php');
        const data = await response.json();

        if (data.status === 'success') {
            // Update the global user object with the new data from DB
            currentUser.orders = data.orders;
            // Trigger your UI function
            updateOrdersListUI();
        } else {
            console.error("Wardrobe Sync Error:", data.message);
            if (ordersContainer) ordersContainer.innerHTML = `<p>Error loading orders: ${data.message}</p>`;
        }
    } catch (err) {
        console.error("Network Error:", err);
    }
}

function updateOrdersListUI() {
    const ordersContainer = document.getElementById('ordersContainer');
    if (!ordersContainer) return;

    if (!currentUser.orders || currentUser.orders.length === 0) {
        ordersContainer.innerHTML = `
            <div class="empty-state-luxury">
                <p style="margin: 50px 0; text-align:center;">Your wardrobe is waiting for its first MAMAG piece.</p>
                <button class="panel-btn primary" onclick="closePanel()">Shop Collection</button>
            </div>`;
        return;
    }

    const ordersHTML = currentUser.orders.map((order) => {
        const rawStatus = order.status ? order.status.toString().trim().toLowerCase() : 'pending';
        const displayStatus = (rawStatus === 'dispatched') ? 'Mamag: Order Dispatched' : order.status;

        return `
            <div class="detailed-order-card">
                <div class="order-card-header">
                    <span class="order-date">${order.date}</span>
                    <span class="status-badge-premium ${rawStatus}">${displayStatus}</span>
                </div>
                
                <div class="order-items-list">
                    ${order.items.map(item => {
                        const itemMedia = item.video_path || item.main_image || item.image || item.img || '';
                        
                        let cleanPath = '';
                        if (itemMedia && typeof itemMedia === 'string') {
                            if (
                                itemMedia.startsWith('data:') || 
                                itemMedia.startsWith('http') || 
                                itemMedia.includes('uploads/') || 
                                itemMedia.includes('requests/')
                            ) {
                                cleanPath = itemMedia;
                            } else {
                                cleanPath = itemMedia.startsWith('admin/') ? itemMedia : 'admin/' + itemMedia;
                            }
                        }

                        const isVideo = !!item.video_path || /\.(mp4|webm|ogg|mov)$/i.test(cleanPath);
                        const itemPrice = Number(item.price || 0);

                        return `
                            <div class="order-item-row" style="display: flex; align-items: center; margin-bottom: 12px;">
                                <div class="order-item-media-container" style="width: 80px; height: 80px; background: #111; overflow: hidden; border-radius: 8px; flex-shrink: 0; position: relative; display: flex; align-items: center; justify-content: center;">
                                    
                                    <div class="deleted-msg" style="display: none; font-size: 12px; color: #fff644; text-align: center; font-weight: normal; letter-spacing: 0.5px; position: absolute;">DELETED MEDIA</div>

                                    ${cleanPath ? (isVideo 
                                        ? `<video src="${cleanPath}" 
                                                  class="order-item-img" 
                                                  muted playsinline autoplay loop 
                                                  style="width:100%; height:100%; object-fit:cover;" 
                                                  onerror="this.style.display='none'; this.parentElement.querySelector('.deleted-msg').style.display='block';"></video>` 
                                        : `<img src="${cleanPath}" 
                                                loading="lazy" 
                                                class="order-item-img" 
                                                alt="${item.name}" 
                                                style="width:100%; height:100%; object-fit:cover;" 
                                                onerror="this.style.display='none'; this.parentElement.querySelector('.deleted-msg').style.display='block';">`)
                                        : `<div style="font-size: 9px; color: #ff4444; font-weight: bold;">DELETED MEDIA</div>`
                                    }
                                </div>
                                <div class="order-item-info" style="margin-left: 15px; flex-grow: 1;">
                                    <p class="order-item-name" style="margin: 0; font-size: 13px; text-transform: capitalize; font-weight: 500; color: var(--text-primary);">${item.name || 'MAMAG Item'}</p>
                                    <p class="order-item-meta" style="margin: 4px 0; font-size: 13px; color: var(--text-primary);">Size: ${item.size || 'N/A'} | Qty: ${item.quantity || 1}</p>
                                </div>
                                <p class="order-item-price" style="margin: 0; font-size: 13px; color: var(--text-primary); font-weight: 600;">₦${itemPrice.toLocaleString()}</p>
                            </div>`;
                    }).join('')}
                </div>

                <div class="order-card-footer" style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid #222; margin-top: 10px;">
                    <div class="order-footer-left">
                        <span class="order-ref" style="display: block; font-size: 10px; color: var(--text-primary);">REF: #${(order.reference || '').slice(-8).toUpperCase()}</span>
                        <div style="margin-top: 4px; display:flex; align-items:center; gap:10px;">
                             <span style="font-size: 13px; color: var(--text-primary); display: block; margin-bottom: 2px;">Total Paid:</span>
                             <span class="order-total-price" style="font-weight: bold; color: var(--text-primary); font-size: 16px;">₦${Number(order.total_paid || order.total_amount || 0).toLocaleString()}</span>
                        </div>
                    </div>
                    
                    <button class="view-receipt-btn" 
                            onclick="openReceiptPanel('${order.reference}')"
                            style="background: var(--color-black); color: var(--color-white); border: none; padding: 10px 20px; border-radius: 100px; font-size: 12px; font-weight: 500; cursor: pointer; transition: 0.2s;">
                        View Receipt
                    </button>
                </div>
            </div>`;
    }).join('');

    ordersContainer.innerHTML = ordersHTML;
}




/* --- 2. SESSION INITIALIZATION --- */
(function initUserSession() {
    const savedData = localStorage.getItem('mamag_users');
    if (savedData) {
        try {
            const parsedUser = JSON.parse(savedData);
            
            // Validate that the data has the required fields
            if (parsedUser && parsedUser.email) {
                isLoggedIn = true;
                currentUser = parsedUser;
                // Ensure orders array exists to prevent errors
                if (!currentUser.orders) currentUser.orders = [];
                
                console.log("Welcome back:", currentUser.name);
            }
        } catch (e) {
            console.error("Session restoration failed, clearing storage.");
            localStorage.removeItem('mamag_users');
        }
    }
})();

function calculateTotal() {
    return cartItems.reduce((acc, item) => {
        // Clean price string (e.g., "₦5,000" -> 5000) for calculation
        const price = typeof item.price === 'string' 
            ? parseFloat(item.price.replace(/[^0-9.]/g, '')) 
            : item.price;
        return acc + (price || 0) * (item.quantity || 1);
    }, 0);
}

function updateCartBadge() {
    const navBtn = document.querySelector('.nav-right .icon-btn:nth-child(1)');
    if (!navBtn) return;

    // Sum up quantities for the badge
    const count = cartItems.reduce((total, item) => total + (item.quantity || 1), 0);
    let cartBadge = navBtn.querySelector('.cart-badge');

    if (count > 0) {
        if (!cartBadge) {
            cartBadge = document.createElement('div');
            cartBadge.className = 'cart-badge';
            navBtn.style.position = 'relative';
            navBtn.appendChild(cartBadge);
        }
        cartBadge.textContent = count;
        cartBadge.classList.add('show');
    } else if (cartBadge) {
        cartBadge.classList.remove('show');
        setTimeout(() => cartBadge.remove(), 300); 
    }
}

// ==========================================
// 2. CORE ACTIONS (Add, Remove, Update)
// ==========================================

function addToCart(product, size) {
    // Find the current quantity in cart for this specific size
    const existing = cartItems.find(i => i.id === product.id && i.size === size);
    
    // Determine the actual stock limit for THIS size
    let specificLimit = product.stock; 
    if (product.size_stocks && product.size_stocks[size] !== undefined) {
        specificLimit = parseInt(product.size_stocks[size]);
    }

    if (existing) {
        if (existing.quantity >= specificLimit) {
            alert(`Sorry, only ${specificLimit} pieces available in Size ${size}`);
            return; 
        }
        existing.quantity++;
    } else {
        if (specificLimit <= 0) {
            alert("This size is currently out of stock");
            return;
        }
        
        cartItems.push({ 
            id: product.id, 
            name: product.name, 
            price: product.price, 
            stock: specificLimit, // Save the specific size limit to the cart item
            size: size || 'Standard', 
            image: product.image, 
            quantity: 1,
            size_stocks: product.size_stocks // Keep reference for further validation
        });
    }

    saveCartToStorage();
    updateCartBadge();
    loadCartPanel(); 
}


function removeFromCart(index) {
    if (!cartItems[index]) return;
    cartItems.splice(index, 1);

    saveCartToStorage();
    updateCartBadge();
    loadCartPanel(); // Refresh panel UI
}

function updateCartQty(index, delta) {
    if (!cartItems[index]) return;

    const item = cartItems[index];

    // NEW: Block quantity changes for special sourcing requests
    if (item.isSpecial) {
        // We use return to silently block, or you can call your showToast here
        return; 
    }

    const newQty = item.quantity + delta;

    // 1. If increasing, check if we have enough stock
    if (delta > 0) {
        if (item.stock !== undefined && newQty > item.stock) {
            return;
        }
    }

    // 2. Apply the new quantity
    item.quantity = newQty;

    // 3. If it hits 0, remove it from the bag
    if (item.quantity <= 0) {
        cartItems.splice(index, 1);
    }

    // 4. Refresh UI
    saveCartToStorage();
    updateCartBadge();
    loadCartPanel(); 
}

function clearCart() {
    cartItems = [];
    localStorage.removeItem('mamag_cart');
    updateCartBadge();
}


// Function to save current cart state to browser memory
function saveCartToStorage() {
    localStorage.setItem('mamag_cart', JSON.stringify(cartItems));
}

// Function to pull saved items back into the app on page load
function initCartFromStorage() {
    const savedCart = localStorage.getItem('mamag_cart');
    if (savedCart) {
        try {
            cartItems = JSON.parse(savedCart);
            updateCartBadge();
        } catch (e) {
            console.error("Cart recovery failed", e);
            cartItems = [];
        }
    }
}

// IMPORTANT: Run this immediately when the script loads
initCartFromStorage();

// 3. THE CART PANEL UI
function loadCartPanel() {
    
    // Helper function to calculate total based on item type
    const calculateTotal = () => {
        return cartItems.reduce((sum, item) => {
            const numericPrice = typeof item.price === 'string' 
                ? parseFloat(item.price.replace(/[^0-9.]/g, '')) 
                : item.price;
            
            // If it's a special request, it's a flat fee from admin
            // Otherwise, it's price * quantity
            if (item.isSpecial === true) {
                return sum + (numericPrice || 0);
            } else {
                return sum + ((numericPrice || 0) * (item.quantity || 1));
            }
        }, 0);
    };

    // 1. Check if empty
    if (cartItems.length === 0) {
        panelContent.innerHTML = `
            <div class="contact-content">
                <h2 class="contact-title">Shopping Bag</h2>
                <div class="cart-empty" style="text-align:center; padding: 50px 0;">
                    <div class="cart-empty-icon" style="font-size: 50px;">🛍️</div>
                    <p style="margin-top:15px; color:#666;">Your shopping bag is empty</p>
                    <button class="panel-btn primary" onclick="closePanel()" style="margin-top:20px;">Continue Shopping</button>
                </div>
            </div>
        `;
    } else {
        // 2. Build items list
        panelContent.innerHTML = `
            <div class="contact-content">
                <h2 class="contact-title">Shopping Bag</h2>
                <div class="cart-items-wrapper" style="max-height: calc(100vh - 250px); overflow-y: auto;">
                    ${cartItems.map((item, i) => {
                        // Media Detection (Video vs Image)
                        const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(item.image);
                        
                        // Price Parsing
                        const numericPrice = typeof item.price === 'string' 
                            ? parseFloat(item.price.replace(/[^0-9.]/g, '')) 
                            : item.price;

                        const mediaHTML = isVideo
                            ? `<video src="${item.image}" loading="lazy" muted autoplay loop style="width:90px; height:100px; object-fit:cover; border-radius:15px;"></video>`
                            : `<img src="${item.image}" loading="lazy" style="width:90px; height:100px; object-fit:cover; border-radius:15px;" onerror="this.src='placeholder.jpg'">`;

                        // --- DYNAMIC CONTROL LOGIC ---
                        const isSpecial = item.isSpecial === true;
                        const currentQty = parseInt(item.quantity);
                        const stockLimit = parseInt(item.stock);
                        
                        // Check if regular stock limit is reached
                        const isAtLimit = stockLimit > 0 && currentQty >= stockLimit;

                        // Lock buttons for Special Sourcing Orders
                        const disableMinus = isSpecial; 
                        const disablePlus = isSpecial || isAtLimit;

                        // Calculate display price for this line item
                        const linePrice = isSpecial ? numericPrice : (numericPrice * currentQty);

                        return `
                            <div class="cart-item" style="display:flex; gap:15px; padding-bottom:15px;">
                                ${mediaHTML}
                                <div style="flex:1">
                                    <div style="font-weight:500; color: var(--text-primary);">${item.name}</div>
                                    <div style="font-size:14px; color: var(--text-primary); margin-bottom:5px;">Size: ${item.size || 'Standard'}</div>
                                    <div style="font-weight:600; color: var(--text-primary);">₦${(linePrice || 0).toLocaleString()}</div>
                                    
                                    ${(isAtLimit && !isSpecial) ? `<div style="color: #4db7ff; font-size: 11px; font-weight: 800; margin-top: 5px; letter-spacing: 0.5px;">MAX STOCK REACHED</div>` : ''}
                                    ${isSpecial ? `<div style="color: #999; font-size: 11px; font-weight: 800; margin-top: 5px; letter-spacing: 0.5px;">SPECIAL REQUEST (FIXED PRICE)</div>` : ''}

                                    <div style="display:flex; align-items:center; gap:12px; margin-top:10px;">
                                        <div style="display:flex; align-items:center; border:1px solid #ddd; border-radius:20px; padding:2px 10px; background: var(--bg); color: var(--text-primary);">
                                            
                                            <button onclick="updateCartQty(${i},-1)" 
                                                style="border:none; background:none; width:40px; height:30px; font-size: 30px; 
                                                color: ${disableMinus ? '#444' : 'var(--text-primary)'}; 
                                                cursor:${disableMinus ? 'not-allowed' : 'pointer'}; 
                                                font-weight:bold; display: flex; align-items: center; justify-content: center;"
                                                ${disableMinus ? 'disabled' : ''}>-</button>
                                            
                                            <span style="min-width:25px; text-align:center; font-weight:bold;">${item.quantity}</span>
                                            
                                            <button onclick="updateCartQty(${i},1)" 
                                                style="border:none; background:none; width:40px; height:30px; font-size: 19px; display: flex; align-items: center; justify-content: center; font-weight:bold; 
                                                cursor:${disablePlus ? 'not-allowed' : 'pointer'}; 
                                                color: ${disablePlus ? '#444' : 'var(--text-primary)'};"
                                                ${disablePlus ? 'disabled' : ''}>+</button>
                                        </div>
                                        <button onclick="removeFromCart(${i})" style="margin-left:auto; color:#ff4d4d; border:none; background:none; font-size:12px; cursor:pointer;">Remove</button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <div style=" background: var(--bg); padding:15px; border-radius: 12px;">
                    <div style="display:flex; justify-content:space-between; font-weight:600; font-size:18px; color; var(--text-primary);">
                        <span>Subtotal:</span>
                        <span>₦${calculateTotal().toLocaleString()}</span>
                    </div>
                    <button class="panel-btn primary" style="width:100%; margin-top:15px;" onclick="loadCheckoutPanel()">Checkout Now</button>
                </div>
            </div>
        `;
    }

    openPanel(); 
}

// Start checking the database once the user clicks "I've sent the money"
function checkPaymentStatus(orderReference) {
    const interval = setInterval(async () => {
        try {
            // Create a small PHP API that returns { status: 'paid' } or { status: 'pending' }
            const response = await fetch(`api/check_order_status.php?ref=${orderReference}`);
            const data = await response.json();

            if (data.status === 'paid') {
                clearInterval(interval);
                // Trigger your custom success UI/animation
                showSuccessUI(); 
            }
        } catch (error) {
            console.error("Status check failed", error);
        }
    }, 3000); // Check every 3 seconds
}


// Save cart to local storage
function saveCartToStorage() {
    localStorage.setItem('mamag_cart', JSON.stringify(cartItems));
}

// Load cart from local storage on page start
function initCartFromStorage() {
    const savedCart = localStorage.getItem('mamag_cart');
    if (savedCart) {
        cartItems = JSON.parse(savedCart);
        updateCartBadge(); // Ensure your cart count bubble updates on reload
    }
}

// RUN THIS ONCE when the script loads
initCartFromStorage();


//FIXED CHECKOUT SYSTEM (Toggle + Region Dropdown)
window.toggleRegionList = function(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation(); 
    }
    window.isDropdownOpen = !window.isDropdownOpen;
    window.isStateDropdownOpen = false; // Close state if region opens
    loadCheckoutPanel();
};

// New toggle for the State dropdown
window.toggleStateList = function(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation(); 
    }
    window.isStateDropdownOpen = !window.isStateDropdownOpen;
    window.isDropdownOpen = false; // Close region if state opens
    loadCheckoutPanel();
};

window.pickStateValue = function(stateName, e) {
    if (e) e.stopPropagation();
    window.selectedState = stateName;
    window.deliveryRegions = window.stateData[stateName];
    window.selectedRegion = window.deliveryRegions[0]; // Default to first region in new state
    window.isStateDropdownOpen = false;
    loadCheckoutPanel();
};

window.pickRegionValue = function(name, price, e) {
    if (e) e.stopPropagation();
    window.selectedRegion = { name: name, price: price };
    window.isDropdownOpen = false;
    loadCheckoutPanel();
};

// Global click listener
window.addEventListener('click', (e) => {
    if ((window.isDropdownOpen || window.isStateDropdownOpen) && !e.target.closest('.custom-dropdown')) {
        window.isDropdownOpen = false;
        window.isStateDropdownOpen = false;
        loadCheckoutPanel();
    }
});


// SESSION VALIDATOR Checks if the PHP session is still alive before processing payments.
async function validateUserSession() {
    try {
        const response = await fetch('api/check_session.php', {
             method: 'GET', 
             credentials: 'include' ,
             headers: {
                    'Accept': 'application/json'
                }
            });
        const result = await response.json();

        if (result.status === 'invalid') {
            // ONLY redirect if the user is actually trying to PAY
            // This stops the loop from happening on page load
            const isCheckout = document.querySelector('.contact-title')?.innerText === 'Checkout';
            
            updateGlobalUser({ name: '', email: '', phone: '', orders: [] });

            if (isCheckout) {
                loadAuthPanel();
            }
            return false;
        }
        
        if (result.user) {
            updateGlobalUser(result.user);
        }
        return true;
    } catch (err) {
        console.error("Session check error:", err);
        return false;
    }
}

async function syncUserAndRefreshCheckout() {
    try {
        const response = await fetch('api/check_session.php', { credentials: 'include' });
        const result = await response.json();

        if (result.status === 'valid') {
            // Get the user data from localStorage or a separate fetch
            const savedUser = JSON.parse(localStorage.getItem('mamag_users'));
            if (savedUser) {
                window.currentUser = savedUser;
                loadCheckoutPanel(); // Re-render with the correct data
            }
        } else {
            loadAuthPanel();
        }
    } catch (err) {
        loadAuthPanel();
    }
}


window.applyCoupon = async () => {
    const btn = document.getElementById('applyCouponBtn');
    const input = document.getElementById('couponInput');
    
    if (!input || !btn) return;
    
    const code = input.value.trim().toUpperCase();
    if (!code) {
        if(typeof showMamagNotify === 'function') showMamagNotify("Enter a coupon code");
        return;
    }

    btn.innerText = "...";
    btn.disabled = true;

    // Calculate subtotal from current cart items
    const currentSubtotal = cartItems.reduce((sum, item) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.]/g, '')) : item.price;
        return sum + (item.isSpecial ? (price || 0) : ((price || 0) * (item.quantity || 1)));
    }, 0);

    try {
        const response = await fetch('api/validate_coupon.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code, subtotal: currentSubtotal })
        });
        
        const result = await response.json();

        if (result.status === 'success') {
            window.appliedDiscount = { 
                code: code, 
                amount: parseFloat(result.amount), 
                type: result.type,
                min_order: parseFloat(result.min_order || 0)
            };
            if(typeof showMamagNotify === 'function') showMamagNotify(result.message);
            
            // Re-render the panel to show updated prices
            loadCheckoutPanel(); 
        } else {
            // This displays the "Invalid" or "Min Spend" message from PHP
            if(typeof showMamagNotify === 'function') showMamagNotify(result.message);
            
            // Shake effect for feedback
            input.style.animation = "shake 0.4s ease-in-out";
            setTimeout(() => input.style.animation = "", 400);
            
            btn.innerText = "APPLY";
            btn.disabled = false;
        }
    } catch (err) {
        console.error("Coupon Error:", err);
        if(typeof showMamagNotify === 'function') showMamagNotify("✕ Connection error");
        btn.innerText = "APPLY";
        btn.disabled = false;
    }
};


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
    msgBox.style.cssText = "background:#000; color:#fff; padding:16px 28px; border-radius:14px; font-weight:500; font-size:14px; margin-top:10px; box-shadow:0 15px 35px rgba(0,0,0,0.4); min-width:200px; text-align:center; opacity:0; transition: all 0.3s ease-out; transform:translateY(-20px);";
    container.appendChild(msgBox);
    setTimeout(() => { msgBox.style.opacity = "1"; msgBox.style.transform = "translateY(0)"; }, 10);
    setTimeout(() => { 
        msgBox.style.opacity = "0"; 
        msgBox.style.transform = "translateY(-20px)";
        setTimeout(() => msgBox.remove(), 300);
    }, 5000);
}


document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        const checkoutDraft = {
            address: document.getElementById('checkoutAddress')?.value,
            phone: document.getElementById('checkoutPhone')?.value,
            selectedState: window.selectedState,
            selectedRegion: window.selectedRegion,
            lastSaved: Date.now()
        };
        // This acts as a "Bookmark" so the user returns exactly where they left off
        localStorage.setItem('mamag_checkout_draft', JSON.stringify(checkoutDraft));
    }
});

// L///////////////////////////////////////////////////OAD CHECKOUT PANEL ////////////////////////////////////////////////////////////////////////
let lastReference = '';

async function pollForOrderCompletion(reference) {
    window._isPollingPayment = true;
    lastReference = reference;
    let attempts = 0;
    const maxAttempts = 60; // Check for 60 seconds 
    
    console.log(`🔍 Starting poll for reference: ${reference}`);
    
    const pollInterval = setInterval(async () => {
        attempts++;
        
        try {
            const response = await fetch(`api/check_order_status.php?ref=${encodeURIComponent(reference)}`);
            const result = await response.json();
            
            console.log(`[Attempt ${attempts}/60] Order status: ${result.status}`);
            
            // Check for success states (case-insensitive)
            if (result.status && (result.status.toLowerCase() === 'paid' || result.status.toLowerCase() === 'success')) {
                clearInterval(pollInterval);
                const payBtn = document.getElementById('payBtn');
                if (payBtn) { payBtn.disabled = false; }
                console.log("✅ Order confirmed by webhook!");
                
                // Clear cart immediately
                cartItems = []; 
                window.appliedDiscount = { code: '', amount: 0, type: '', min_order: 0 };
                localStorage.removeItem('mamag_cart');
                updateCartBadge();
                localStorage.removeItem('mamag_checkout_draft');
                
                showSuccessMessage('Order Confirmed!', 'Redirecting to your orders...');
                
                // Redirect after brief delay
                setTimeout(async () => {
                    if (window.currentUser && window.currentUser.email) {
                        await refreshAndOpenProfile();
                    } else {
                        loadProfilePanel();
                    }
                }, 1500);
                
                return; // Exit the poll
            }
        } catch (err) {
            console.error("❌ Poll error:", err);
        }
        
        // Show waiting message at 30 seconds
        if (attempts === 30) {
            const statusBox = document.getElementById('checkoutStatus');
            if (statusBox) {
                statusBox.style.display = 'block';
                statusBox.style.background = '#333';
                statusBox.style.color = '#ffff4d';
                statusBox.innerText = "⏳ Still verifying... This may take another 30 seconds";
            }
        }
        
        // Stop polling after max attempts
        if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            console.log("⏱️ Polling timeout - stopping");
            
            const payBtn = document.getElementById('payBtn');
            if (payBtn) {
                payBtn.disabled = false;
                payBtn.innerText = "Pay Now";
            }
            
            const statusBox = document.getElementById('checkoutStatus');
            if (statusBox) {
                statusBox.style.display = 'block';
                statusBox.style.background = '#ff4d4d1a';
                statusBox.style.color = '#ff4d4d';
                statusBox.innerText = "⚠️ Verification timeout. Payment may still be processing. Check your email or refresh the page.";
            }

            // On success:
            window._isPollingPayment = false;
            
            // On timeout:
            window._isPollingPayment = false;

            
            // Final attempt to check
            console.log("📧 One final check in 5 seconds...");
            setTimeout(async () => {
                const finalCheck = await fetch(`api/check_order_status.php?ref=${encodeURIComponent(reference)}`);
                const finalResult = await finalCheck.json();
                if (finalResult.status && finalResult.status.toLowerCase() === 'paid') {
                    showSuccessMessage('Order Found!', 'Your payment was confirmed.');
                    setTimeout(() => loadProfilePanel(), 1000);
                }
            }, 5000);
        }
    }, 1000); // Check every 1 second
}
// Add this helper to your JS
async function pollOrderStatus(reference) {
    // Try to see if the order exists in the DB every 3 seconds
    const check = setInterval(async () => {
        const response = await fetch(`api/verify_reference.php?ref=${reference}`);
        const result = await response.json();
        
        if (result.status === 'Paid') {
            clearInterval(check);
            showSuccessScreen(); // Your modern UI success message
        }
    }, 3000);
    
    // Stop trying after 2 minutes
    setTimeout(() => clearInterval(check), 120000);
}


async function loadCheckoutPanel() {
    
    window._checkoutRendering = true;
    window.currentUser = window.currentUser || JSON.parse(localStorage.getItem('mamag_user_session'));
    if (window._isPollingPayment) return;
    
    // --- 2. THE SESSION RE-HYDRATION ---
    // Instead of just checking memory, we force a check against Storage
    if (!window.currentUser) {
        const savedSession = localStorage.getItem('mamag_users') || localStorage.getItem('mamag_user_session');
        if (savedSession) {
            window.currentUser = JSON.parse(savedSession);
        }
    }

    // --- 3. DRAFT RECOVERY ---
    const rawDraft = localStorage.getItem('mamag_checkout_draft');
    if (rawDraft) {
        const draft = JSON.parse(rawDraft);
        if (Date.now() - draft.lastSaved < 1800000) {
            if (!window.selectedState || window.selectedState === 'Select State') {
                window.selectedState = draft.selectedState || 'Select State';
            }
            if (!window.selectedRegion || window.selectedRegion.name === 'Select Region') {
                window.selectedRegion = draft.selectedRegion || { name: 'Select Region', price: 0 };
            }
        }
    }

    await fetchCheckoutDeliveryRates();

    // 1. Calculate fresh subtotal immediately (The "Fresh Data" you wanted)
    const currentSubtotal = cartItems.reduce((sum, item) => {
        const price = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.]/g, '')) : item.price;
        return sum + (item.isSpecial ? (price || 0) : ((price || 0) * (item.quantity || 1)));
    }, 0);

    // Persistent Discount State
    window.appliedDiscount = window.appliedDiscount || { code: '', amount: 0, type: '', min_order: 0 };

    // 3. VALIDATION: Check if current subtotal still qualifies
    let discountRemoved = false;
    if (window.appliedDiscount.code && window.appliedDiscount.min_order > 0) {
        if (currentSubtotal < window.appliedDiscount.min_order) {
            window.appliedDiscount = { code: '', amount: 0, type: '', min_order: 0 };
            discountRemoved = true;
        }
    }

    // 2. Refresh Subtotal immediately for validation
    const subtotalForValidation = cartItems.reduce((sum, item) => {
        const numericPrice = typeof item.price === 'string' 
            ? parseFloat(item.price.replace(/[^0-9.]/g, '')) 
            : item.price;
        return sum + (item.isSpecial ? (numericPrice || 0) : ((numericPrice || 0) * (item.quantity || 1)));
    }, 0);

    // 3. VALIDATION CHECK: If a code exists, check if subtotal still meets min_order
    if (window.appliedDiscount.code) {
        // If your appliedDiscount object stores the min_order requirement:
        if (subtotalForValidation < window.appliedDiscount.min_order) {
            // Auto-remove discount if requirement is no longer met
            window.appliedDiscount = { code: '', amount: 0, type: '', min_order: 0 };
            console.warn("Discount removed: Minimum requirement not met.");
            
            // Optional: Show a message to the user
            setTimeout(() => {
                showStatus?.("Items removed: Coupon requirement no longer met.", true);
            }, 500);
        }
    }

    if (discountRemoved) {
        setTimeout(() => {
            const statusBox = document.getElementById('checkoutStatus');
            if (statusBox) {
                statusBox.innerText = "Coupon removed: Cart no longer meets minimum requirement.";
                statusBox.style.display = 'block';
                statusBox.style.background = '#ff4d4d1a';
                statusBox.style.color = '#ff4d4d';
            }
        }, 100);
    }

    const calculateTotal = () => {
        return cartItems.reduce((sum, item) => {
            const numericPrice = typeof item.price === 'string' 
                ? parseFloat(item.price.replace(/[^0-9.]/g, '')) 
                : item.price;
            
            if (item.isSpecial === true) {
                return sum + (numericPrice || 0);
            } else {
                return sum + ((numericPrice || 0) * (item.quantity || 1));
            }
        }, 0);
    };


    const subtotal = calculateTotal();

    // FETCH DATA FROM DATABASE FIRST
    if (Object.keys(window.stateData || {}).length === 0) {
        await fetchCheckoutDeliveryRates();
    }
    
    window.checkoutMethod = window.checkoutMethod || 'delivery';
    window.selectedRegion = window.selectedRegion || { name: 'Select Region', price: 0 };
    window.selectedState = window.selectedState || 'Select State';

    window.deliveryRegions = window.stateData[window.selectedState] || [];

    window.deliveryRegions = window.deliveryRegions || [];

    const rawDeliveryFee = window.checkoutMethod === 'delivery' ? window.selectedRegion.price : 0;
    
    // --- DISCOUNT LOGIC ---
    let discountDeduction = window.appliedDiscount.amount || 0;
    let finalDeliveryFee = rawDeliveryFee;
    let finalSubtotal = subtotal;

    if (window.appliedDiscount.type === 'free_delivery') {
        // If discount_value is 0, it's unlimited free delivery, else it's capped
        const deliverySaved = (window.appliedDiscount.amount === 0) 
            ? rawDeliveryFee 
            : Math.min(window.appliedDiscount.amount, rawDeliveryFee);
        
        discountDeduction = deliverySaved;
        finalDeliveryFee = Math.max(0, rawDeliveryFee - deliverySaved);
    } else {
        // For flat or percentage, the discount applies to the subtotal
        finalSubtotal = Math.max(0, subtotal - discountDeduction);
    }

    const serviceCharge = subtotal * 0.039;
    // GRAND TOTAL: Subtotal + Delivery + Service - Discount
    const grandTotal = Math.max(0, (subtotal + rawDeliveryFee + serviceCharge) - discountDeduction);

   const activeUser = window.currentUser || {};
    const userEmail = activeUser.email || ""; 
    const userName = activeUser.name || "";
    const userPhone = activeUser.phone || "";
    const isLoggedIn = !!activeUser.email;

    

    // --- Filter Helpers ---
    window.filterStates = (e) => {
        const val = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.state-item');
        items.forEach(item => {
            const text = item.innerText.toLowerCase();
            item.style.display = text.includes(val) ? 'block' : 'none';
        });
    };

    window.filterRegions = (e) => {
        const val = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.region-item');
        items.forEach(item => {
            const text = item.innerText.toLowerCase();
            item.style.display = text.includes(val) ? 'block' : 'none';
        });
    };

    panelContent.innerHTML = `
        <style>
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            .search-input {
                width: 100%; padding: 10px; border: none; border-bottom: 1px solid #eee;
                outline: none; font-size: 13px; position: sticky; top: 0;
                background: #fff; z-index: 10; border-radius: 0;
            }
            .coupon-section {
                display: flex; gap: 8px; margin-bottom: 20px; background: #f9f9f9; 
                padding: 4px; border-radius: 100px; border: 1px dashed #ddd;
            }
            .coupon-input {
                flex: 1; background: transparent; border: none; outline: none; 
                padding: 5px 10px; color: #000; font-weight: 700;  font-size: 13px;
            }
            .apply-btn {
                background: #000; color: #fff; border: none; padding: 10px 30px; 
                border-radius: 100px; font-size: 11px; font-weight: 800; cursor: pointer;
            }
        </style>
        <div class="contact-content">
            <h2 class="contact-title">Checkout</h2>
            
            <div class="contact-subtitle">Order Summary</div>
            <div class="checkout-summary-box" style="background: var(--bg); padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #333;">
                <div class="checkout-items">
                ${cartItems.map(item => {
                    const isSpecial = item.isSpecial === true;
                    const numericPrice = typeof item.price === 'string' 
                        ? parseFloat(item.price.replace(/[^0-9.]/g, '')) 
                        : item.price;
                    const lineDisplayPrice = isSpecial ? numericPrice : (numericPrice * (item.quantity || 1));

                    return `
                        <div class="checkout-item" style="display:flex; justify-content:space-between; font-size:13px; color:  var(--text-primary); margin-bottom: 8px;">
                            <div style="flex:1;">
                                <div style="font-weight:500; font-size: 15px">${item.name}</div>
                                <div style="font-size:13px; color:#999;">
                                    Size: ${item.size || 'Standard'} | Qty: x${item.quantity || 1}
                                    ${isSpecial ? '<br><span style="color:#ffff4d; font-weight:500;">[SPECIAL REQUEST]</span>' : ''}
                                </div>
                            </div>
                            <span style="font-weight:600;">₦${(lineDisplayPrice || 0).toLocaleString()}</span>
                        </div>
                    `;
                }).join('')}
                </div>

                <div style="border-top: 1px solid #444; margin-top: 10px; padding-top: 10px; font-size: 14px; color:  var(--text-primary);">
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <span>Subtotal:</span><span>₦${subtotal.toLocaleString()}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <span>Delivery:</span>
                        <span>${window.checkoutMethod === 'delivery' ? `₦${rawDeliveryFee.toLocaleString()}` : '<span style="color:#27ae60; font-weight:bold;">FREE</span>'}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                        <span>Payment & Service Fee:</span><span>₦${serviceCharge.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    </div>
                     ${discountDeduction > 0 ? `
                    <div style="display:flex; justify-content:space-between; margin-bottom:4px; color: #27ae60; font-weight: 600;">
                        <span>Discount (${window.appliedDiscount.code}):</span><span>- ₦${discountDeduction.toLocaleString()}</span>
                    </div>` : ''}
                    <div style="display:flex; justify-content:space-between; border-top: 1px solid #444; padding-top: 10px; margin-top: 10px; font-weight: 700; font-size:18px; color:  var(--text-primary);">
                        <span>Total:</span>
                        <span>₦${grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                    </div>
                </div> 
            </div>    

            <div class="coupon-section" style="display: flex; gap: 8px; margin-bottom: 20px; background: var(--bg); padding: 5px 8px; padding-right: 4px; border: 3px dashed var(--text-primary);">
                <input type="text" id="couponInput" style="flex: 1; background: transparent; color:  var(--text-primary); border: none; outline: none; padding: 5px 10px; font-weight: 500; font-size: 17px;" placeholder="HAVE A COUPON?" value="${window.appliedDiscount.code}">
                <button type="button" id="applyCouponBtn" onclick="applyCoupon()" class="apply-btn" style="background: var(--color-black); padding: 13px 30px; color: var(--color-white); border: none; font-size: 11px; font-weight: 800; cursor: pointer;">APPLY</button>
            </div>

            <div class="method-toggle" style="display:flex; background: var(--bg); padding:4px; border-radius:50px; margin-bottom:25px; position:relative; cursor:pointer; height:45px; align-items:center;">
                <div style="position:absolute; top:1px; bottom:1px; width:calc(50% - 4px); background:var(--color-black); border-radius:50px; transition:0.3s; left:4px; transform:${window.checkoutMethod === 'pickup' ? 'translateX(100%)' : 'translateX(0)'}"></div>
                <div onclick="setCheckoutMethod('delivery', event)" style="flex:1; text-align:center; z-index:2; font-weight:600; font-size:12px; color:${window.checkoutMethod === 'delivery' ? 'var(--color-white)' : 'var(--color-black)'}">DELIVERY</div>
                <div onclick="setCheckoutMethod('pickup', event)" style="flex:1; text-align:center; z-index:2; font-weight:600; font-size:12px; color:${window.checkoutMethod === 'pickup' ? 'var(--color-white)' : 'var(--color-black)'}">PICKUP</div>
            </div>

            <form id="checkoutForm">
               ${window.checkoutMethod === 'delivery' ? `
                <div class="form-group" style="margin-bottom:15px;">
                    <label class="form-label">Delivery State</label>
                    <div class="custom-dropdown" style="border:1px solid #ddd; background:#fff; position:relative; border-radius:100px;">
                        <div onclick="toggleStateList(event)" style="padding:12px; display:flex; justify-content:space-between; cursor:pointer; font-size:16px; align-items: center; color:#000;">
                            <span>${window.selectedState}</span>
                            <span style="font-size:10px; opacity:0.6;">▼</span>
                        </div>
                        <div style="display:${window.isStateDropdownOpen ? 'block' : 'none'}; color: #000; position:absolute; top:110%; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); left:0; right:0; background:#fff; border:1px solid #ddd; z-index:2000; max-height:200px; overflow-y:auto;">
                            <input type="text" class="search-input" placeholder="Search State..." onkeyup="filterStates(event)" onclick="event.stopPropagation()">
                            ${Object.keys(window.stateData || {}).length > 0 ? 
                                Object.keys(window.stateData).map(state => `
                                    <div class="state-item" onclick="pickStateValue('${state}', event)" style="padding:12px; border-bottom:1px solid #eee; font-size:16px; cursor:pointer;">
                                        ${state}
                                    </div>
                                `).join('') : '<div style="padding:12px; font-size:12px; color:#999;">No states configured in admin.</div>'
                            }
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Delivery Region</label>
                    <div class="custom-dropdown" style="border:1px solid #ddd; background:#fff; position:relative; border-radius:100px; ${window.selectedState === 'Select State' ? 'opacity:0.6; cursor:not-allowed;' : ''}">
                        <div onclick="toggleRegionList(event)" style="padding:12px; display:flex; justify-content:space-between; cursor:pointer; font-size:16px; align-items: center; color:#000;">
                            <span>
                                ${window.selectedState === 'Select State' 
                                    ? 'Select State First' 
                                    : (window.selectedRegion.name === 'Select Region' 
                                        ? 'Select Region' 
                                        : `${window.selectedRegion.name} (₦${Number(window.selectedRegion.price).toLocaleString()})`
                                    )
                                }
                            </span>
                            <span style="font-size:10px; opacity:0.6;">▼</span>
                        </div>
                        <div style="display:${window.isDropdownOpen ? 'block' : 'none'}; color: #000; position:absolute; top:110%; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); left:0; right:0; background:#fff; border:1px solid #ddd; z-index:1000; max-height:200px; overflow-y:auto;">
                            <input type="text" class="search-input" placeholder="Search Region..." onkeyup="filterRegions(event)" onclick="event.stopPropagation()">
                            ${window.deliveryRegions && window.deliveryRegions.length > 0 ? 
                                window.deliveryRegions.map(r => `
                                    <div class="region-item" onclick="pickRegionValue('${r.name}', ${r.price}, event)" style="padding:12px; border-bottom:1px solid #eee; font-size:16px; cursor:pointer;">
                                        ${r.name} - ₦${Number(r.price).toLocaleString()}
                                    </div>
                                `).join('') : `<div style="padding:12px; font-size:12px; color:#999;">${window.selectedState === 'Select State' ? 'Select a state to see regions' : 'No regions found for this state'}</div>`
                            }
                        </div>
                    </div>
                </div>
                    <div class="form-group" style="margin-top:15px;"><label class="form-label">Detailed Address</label><input type="text" id="checkoutAddress" class="form-input" placeholder="House number and street name" required></div>
                ` : `
                    <div style="background:#000; padding:15px; border-radius:8px; margin-bottom:20px; font-size:13px; color:#ffff4d; border: 1px solid #333; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="display:block; margin-bottom:2px;">Pickup: GF 01 Ajoa Plaza, 11, Martins Street, Balogun Market</strong>
                            <span>08033378712</span>
                        </div>
                        <button type="button" onclick="copyPickupDetails(this)" style="background: #ffff4d; color: #000; border: none; padding: 8px 12px; border-radius: 6px; font-size: 11px; font-weight: 800; cursor: pointer; transition: 0.2s; white-space: nowrap; margin-left: 10px;">
                            COPY INFO
                        </button>
                    </div>
                `}
                
                <div class="form-group"><label class="form-label">Full Name</label><input type="text" readonly id="checkoutName" class="form-input" value="${userName}" required></div>
                
                <div class="form-group">
                    <label class="form-label">Email Address (Linked to Account)</label>
                    <div id="displayEmail" style="background: #fff; color: #000; padding: 12px 20px; border: 1px solid #333; border-radius: 50px; font-size: 15px; font-weight: 500; min-height: 48px; display: flex; align-items: center;">
                        ${userEmail || "Login to reveal email"}
                    </div>
                </div>

                <div class="form-group"><label class="form-label">Phone Number</label><input type="tel" id="checkoutPhone" class="form-input" value="${userPhone}" required></div>
                
                <div id="checkoutStatus" style="display:none; text-align:center; padding:12px; border-radius:8px; margin-top:15px; font-size:16px; font-weight:500;"></div>

                ${isLoggedIn ? 
                    `<button type="submit" id="payBtn" class="panel-btn primary" 
                    style="width:100%; margin-top:20px; font-weight:bold;"
                    ${window._isPollingPayment ? 'disabled' : ''}>
                    ${window._isPollingPayment ? 'Verifying payment...' : 'Pay Now'}
                    </button>` : 
                    `<button type="button" onclick="window.pendingCheckout=true; loadAuthPanel();" class="panel-btn primary">Login to Pay</button>`}
            </form>
        </div>
    `;

    const cForm = document.getElementById('checkoutForm');
    if (cForm) {
        cForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const statusBox = document.getElementById('checkoutStatus');
            const payBtn = document.getElementById('payBtn');

            const showStatus = (msg, isError = true) => {
                if (!statusBox) return;
                statusBox.innerText = msg;
                statusBox.style.display = 'block';
                statusBox.style.background = isError ? '#ff4d4d1a' : '#27ae601a';
                statusBox.style.color = isError ? '#ff4d4d' : '#27ae60';
                if (isError) {
                    statusBox.style.animation = 'shake 0.4s ease-in-out';
                    setTimeout(() => statusBox.style.animation = '', 400);
                }
            };


            // --- NEW VALIDATION START ---
            if (window.checkoutMethod === 'delivery') {
                // 1. Check if State is selected
                if (!window.selectedState || window.selectedState === 'Select State') {
                    showStatus("Please select a delivery state.");
                    return;
                }

                // 2. Check if Region is selected
                if (!window.selectedRegion || window.selectedRegion.name === 'Select Region') {
                    showStatus("Please select a delivery region.");
                    return;
                }

                // 3. Check if Street Address is filled
                const addressInput = document.getElementById('checkoutAddress');
                if (!addressInput || addressInput.value.trim().length < 5) {
                    showStatus("Please enter a valid street address.");
                    addressInput?.focus();
                    return;
                }
            }
            // --- NEW VALIDATION END --

            try {
                payBtn.innerText = "Verifying...";
                payBtn.disabled = true;

                const isSessionValid = await validateUserSession();
                if (!isSessionValid) {
                    payBtn.disabled = false;
                    payBtn.innerText = "Pay Now";
                    showStatus("Session expired. Please log in again.");
                    return;
                }

                const finalUser = window.currentUser || JSON.parse(localStorage.getItem('mamag_users')) || {};
                const finalEmail = finalUser.email;
                const customerPhone = document.getElementById('checkoutPhone')?.value || finalUser.phone || "";
                const finalName = finalUser.name || "MAMAG Customer";

                const paystackAmount = Math.round((parseFloat(grandTotal) || 0) * 100);
                const paystackCharge = Math.round((parseFloat(serviceCharge) || 0) * 100);
                const addressVal = window.checkoutMethod === 'delivery' 
                ? `${document.getElementById('checkoutAddress').value}, ${window.selectedRegion.name}, ${window.selectedState}`
                : 'Pickup at Store';

                if (paystackAmount <= 0) {
                    showStatus("Invalid total amount.");
                    payBtn.disabled = false;
                    payBtn.innerText = "Pay Now";
                    return;
                }

                if (!finalEmail) {
                    showStatus("User email not found. Please log in again.");
                    payBtn.disabled = false;
                    payBtn.innerText = "Pay Now";
                    loadAuthPanel();
                    return;
                }

                const itemsSummary = cartItems.map(item => {
                    const prefix = item.isSpecial ? '[SPECIAL] ' : '';
                    return `${prefix}${item.name} (${item.size || 'Standard'}) x${item.quantity}`;
                }).join(', ');
                

                payBtn.innerText = "Connecting Paystack...";

                const handler = PaystackPop.setup({
                    key: 'pk_live_24e268cd0cac1e62259d6e079368e80a2af68611', 
                    email: finalEmail,
                    amount: paystackAmount,
                    currency: 'NGN',
                    ref: 'MG-' + Date.now(),
                    subaccount: 'ACCT_53ewzgj6u6jt4zm',
                    bearer: 'account', 
                    transaction_charge: paystackCharge,
                    metadata: {
                        custom_fields: [
                            { display_name: "Phone Number", variable_name: "phone_number", value: customerPhone },
                            { display_name: "Customer Name", variable_name: "customer_name", value: finalName },
                            { display_name: "Items JSON", variable_name: "order_details_json", value: JSON.stringify(cartItems) },
                            { display_name: "Delivery Address", variable_name: "delivery_address", value: addressVal },
                            { display_name: "Account Email", variable_name: "account_email", value: finalEmail },
                            { display_name: "Coupon Used", variable_name: "coupon_code", value: window.appliedDiscount.code || "None" }
                        ]
                    },
                    // ✅ THIS IS THE KEY CHANGE
            callback: function(response) {
                console.log("💳 Payment callback received:", response.reference);
                
                const payBtn = document.getElementById('payBtn');
                if (payBtn) {
                    payBtn.innerText = "Verifying payment...";
                    payBtn.disabled = true;
                }
                
                const statusBox = document.getElementById('checkoutStatus');
                if (statusBox) {
                    statusBox.style.display = 'block';
                    statusBox.style.background = '#333';
                    statusBox.style.color = '#fff';
                    statusBox.innerText = "✓ Payment received. Verifying with Paystack...";
                }
                
                // Don't process order here - let webhook handle it
                // Just start polling
                pollForOrderCompletion(response.reference);
            },
            
            onClose: function() {
                const payBtn = document.getElementById('payBtn');
                if (payBtn) {
                    payBtn.disabled = false;
                    payBtn.innerText = "Pay Now";
                }
                
                const statusBox = document.getElementById('checkoutStatus');
                if (statusBox) {
                    statusBox.style.display = 'block';
                    statusBox.style.background = '#333';
                    statusBox.style.color = '#ffff4d';
                    statusBox.innerText = "Payment window closed. Your bag is still saved.";
                }
                // Don't auto-poll on close — remove the confirm() dialog which blocks UI
                // lastReference is already set if they got far enough
            }
            });

                handler.openIframe();

            } catch (error) {
                console.error("Payment Error:", error);
                showStatus("A system error occurred. Please try again.");
                payBtn.innerText = "Pay Now";
                payBtn.disabled = false;
            }
        });
    }

    if(typeof openPanel === 'function') openPanel();
}



async function initiatePayment() {
    // Check if delivery details are filled
    if (!isDeliveryValid()) return;

    // If valid, proceed to payment logic
    const amount = calculateTotalAmount(); // Your logic to get the final price
    
    // Trigger Paystack/Flutterwave here...
} 

// SUCCESS HANDLER Saves to DB and handles the local session update.
async function handleSuccessfulPayment(ref, email, dbAmount, address, fullAmountForUI) {
    // 1. Calculate delivery impact
    const rawDeliveryFee = window.checkoutMethod === 'delivery' ? (window.selectedRegion?.price || 0) : 0;
    let actualDeliveryFeePaid = rawDeliveryFee;
    let discountSaved = 0;
    let couponDetailForAdmin = "NONE";

    // 2. Determine Discount Impact
    if (window.appliedDiscount && window.appliedDiscount.code) {
        if (window.appliedDiscount.type === 'free_delivery') {
            const discountVal = window.appliedDiscount.amount || 0;
            discountSaved = (discountVal === 0) ? rawDeliveryFee : Math.min(discountVal, rawDeliveryFee);
            actualDeliveryFeePaid = Math.max(0, rawDeliveryFee - discountSaved);
        } else {
            discountSaved = window.appliedDiscount.amount || 0;
        }
        // Format for both DB and UI
        couponDetailForAdmin = `${window.appliedDiscount.code} - ₦${discountSaved.toLocaleString()} OFF`;
    }

    // 3. Prepare Local Storage entry (for immediate profile update)
    const newOrderEntry = {
        reference: ref,
        date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        items: cartItems.map(item => ({...item})), 
        total_paid: fullAmountForUI, 
        delivery_fee: actualDeliveryFeePaid,
        coupon_used: couponDetailForAdmin,
        status: 'Paid'
    };

    // 4. DB Sync
    const success = await saveOrderToDB(ref, email, dbAmount, address, fullAmountForUI, couponDetailForAdmin);
    
    if (success) {
        if (window.currentUser) {
            if (!window.currentUser.orders) window.currentUser.orders = [];
            window.currentUser.orders = [newOrderEntry, ...window.currentUser.orders];
            localStorage.setItem('mamag_users', JSON.stringify(window.currentUser));
        }

        // 5. High-end UI Cleanup (No Alerts)
        cartItems = []; 
        window.appliedDiscount = { code: '', amount: 0, type: '', min_order: 0 }; 
        localStorage.removeItem('mamag_cart');

        if (typeof updateCartBadge === 'function') updateCartBadge();
        
        showSuccessMessage('Order Confirmed!', 'Processing your delicious request.');
        setTimeout(() => { loadProfilePanel(); }, 2000);
    } else {
        // If DB fails, the Webhook is likely already handling it in the background
        showSuccessMessage('Payment Received', 'Updating your order history...');
        window.appliedDiscount = { code: '', amount: 0, type: '', min_order: 0 };
        setTimeout(() => { loadProfilePanel(); }, 2500);
    }
}

async function saveOrderToDB(ref, email, amount, address, fullGrandTotal, coupon) {
    const fullName = document.getElementById('checkoutName')?.value || 'Guest';
    const phone = document.getElementById('checkoutPhone')?.value || 'N/A';
    
    // Split the address if needed or send as prepared
    const regionName = window.checkoutMethod === 'delivery' ? (window.selectedRegion?.name || 'Unknown') : 'Pickup';
    const stateName = window.checkoutMethod === 'delivery' ? (window.selectedState || 'Lagos') : 'N/A';

    const itemsForDB = cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: Number(String(item.price).replace(/[^0-9.]/g, '')) || 0,
        quantity: item.quantity || 1,
        size: item.size || 'Standard',
        // Critical for your PHP stock logic
        isSpecial: item.isSpecial === true || false,
        isAddon: item.isAddon === true || false 
    }));

    try {
        const response = await fetch('api/process_orders.php', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                reference: ref,
                email: email,
                fullName: fullName,
                phone: phone,
                amount: amount,          
                total_paid: fullGrandTotal, 
                coupon_code: coupon || 'NONE',
                delivery_fee: window.checkoutMethod === 'delivery' ? (window.selectedRegion?.price || 0) : 0,
                method: window.checkoutMethod,
                items: itemsForDB,
                address: address, // This contains the detailed street info
                region: regionName,
                state: stateName,
                user_id: window.currentUser?.id || 0
            })
        });

        const result = await response.json();
        return result.status === 'success';
    } catch (err) {
        console.error("MAMAG Sync Error:", err);
        return false;
    }
}

// Run check when the page is loaded
document.addEventListener('DOMContentLoaded', validateUserSession);


async function fetchCheckoutDeliveryRates() {
    try {
        const response = await fetch('admin/api/get_delivery_rates.php');
        const allRates = await response.json();
        
        const freshData = {};
        
        allRates.forEach(r => {
            // 1. Normalize the name: Trim spaces and force Title Case (e.g., "lagos" -> "Lagos")
            const rawState = r.state.trim().toLowerCase();
            const stateName = rawState.charAt(0).toUpperCase() + rawState.slice(1);
            
            // 2. Group them under the same key
            if (!freshData[stateName]) {
                freshData[stateName] = [];
            }

            freshData[stateName].push({ 
                name: r.region_name, 
                price: parseFloat(r.price) 
            });
        });
        
        window.stateData = freshData;
        console.log("Cleaned State Data:", window.stateData);
        return freshData;
    } catch (err) {
        console.error("Fetch failed", err);
        return {};
    }
}


function copyPickupDetails(btn) {
    const info = "GF 01 Ajoa Plaza, 11, Martins Street, Balogun Market | 08033378712 ";
    
    navigator.clipboard.writeText(info).then(() => {
        const originalText = btn.innerText;
        btn.innerText = "COPIED!";
        btn.style.background = "#27ae60"; // Changes to green briefly
        btn.style.color = "#fff";
        
        setTimeout(() => {
            btn.innerText = originalText;
            btn.style.background = "#ffff4d";
            btn.style.color = "#000";
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}


// 1. OPEN RECEIPT PANEL* Fetches Delivery and Total Paid directly from the DB.
async function openReceiptPanel(orderRef) {
    const panelContent = document.getElementById('panelContent');
    const order = currentUser.orders.find(o => o.reference === orderRef);
    if (!order) return;

    // Loading State
    panelContent.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color:#fff;">
            <div class="loader"></div>
            <p style="margin-top:15px; font-size:14px; opacity:0.7;">Generating secure receipt...</p>
        </div>`;

    let dbTotalPaid = 0;
    let dbCoupon = order.coupon_used || 'NONE';
    let dbPaymentDetails = "Paystack - Card"; // Fallback
    
    try {
        const response = await fetch(`api/get_order_details.php?ref=${orderRef}`);
        const dbData = await response.json();
        if (dbData.status === 'success') {
            dbTotalPaid = Number(dbData.order.total_paid) || 0;
            if(dbData.order.coupon_used) dbCoupon = dbData.order.coupon_used;
            // Assuming your API returns payment info, otherwise we use the order ref
            dbPaymentDetails = dbData.order.payment_method || "Paystack - Mastercard ****1234";
        }
    } catch (err) {
        console.error("DB Fetch Error:", err);
        dbTotalPaid = Number(order.total_paid || order.total_amount) || 0;
        dbCoupon = order.coupon_used || 'NONE';
    }

    // --- MATH LOGIC ---
    const itemsSubtotal = order.items.reduce((sum, item) => {
        const price = Number(item.price) || 0;
        const qty = Number(item.quantity) || 1;
        const isSpecial = item.isSpecial === true || (item.name && item.name.toLowerCase().includes('special'));
        return sum + (isSpecial ? price : (price * qty));
    }, 0);

    const serviceCharge = itemsSubtotal * 0.039;

    let discountAmount = 0;
    if (dbCoupon && dbCoupon !== 'NONE') {
        const match = dbCoupon.match(/(?:₦|N)\s*([0-9,.]+)/);
        if (match) discountAmount = parseFloat(match[1].replace(/,/g, ''));
    }

    let finalDelivery = (dbTotalPaid + discountAmount) - itemsSubtotal - serviceCharge;
    if (finalDelivery < 0) finalDelivery = 0;

    panelContent.innerHTML = `
        <div class="receipt-panel-view">
            <div class="view-header">
                <button class="back-btn-minimal" onclick="loadProfilePanel(); toggleProfileView('orders');">Back</button>
            </div>

            <div class="receipt-container">
                <div class="scalloped-edge top"></div>
                <div class="receipt-card-main">
                    <div class="watermark-overlay">
                        ${Array(15).fill('<span class="watermark-item">MAMAG</span>').join('')}
                    </div>
                    <div class="receipt-logo-header">
                        <h2 class="brand-name">MAMAG</h2>
                        <p class="receipt-type">Transaction Receipt</p>
                    </div>

                    <div class="receipt-amount-section">
                        <h1 class="amount-display">₦${dbTotalPaid.toLocaleString()}</h1>
                        <p class="status-text">Successful</p>
                        <p class="timestamp">${order.date}</p>
                    </div>

                    <div class="receipt-divider-dash"></div>

                    <div class="receipt-details-group">
                        <div class="details-row"><span class="label">Client</span><span class="value">${currentUser.name}</span></div>
                        <div class="details-row"><span class="label">Transaction Ref</span><span class="value">${order.reference.toUpperCase()}</span></div>
                    </div>

                    <div class="receipt-divider-dash"></div>

                    <div class="receipt-breakdown">
                        <p class="sec-title">Order Summary</p>
                         <div class="receipt-divider-dash"></div>

                        ${order.items.map(item => {
                            const isSpecial = item.isSpecial === true || (item.name && item.name.toLowerCase().includes('special'));
                            const price = Number(item.price) || 0;
                            const qty = item.quantity || 1;
                            const lineTotal = isSpecial ? price : (price * qty);

                            return `
                                <div class="item-line" style="margin-bottom: 8px;">
                                    <div style="display:flex; text-align: left; flex-direction:column; max-width: 70%;">
                                        <span style="font-weight:600; text-transform: capitalize; font-size:13px;">${item.name}</span>
                                        <span style="font-size:12px; color:#666;">Size: ${item.size || 'N/A'} | Qty: x${qty}</span>
                                    </div>
                                    <span style="font-weight:700; color:#000;">₦${lineTotal.toLocaleString()}</span>
                                </div>`;
                        }).join('')}
                        
                        <div class="receipt-divider-dash" style="margin: 15px 0;"></div>

                        <div class="item-line" style="font-weight: 500; color: #666;"><span class="label">Subtotal</span><span>₦${itemsSubtotal.toLocaleString()}</span></div>
                        <div class="item-line" style="margin-top: 5px; color: #666; font-size: 13px;"><span class="label">Delivery Fee</span><span>${finalDelivery > 0 ? `₦${finalDelivery.toLocaleString()}` : 'FREE'}</span></div>
                        <div class="item-line" style="margin-top: 5px; color: #666; font-size: 13px;"><span class="label">Service Fee</span><span>₦${serviceCharge.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>

                        ${(dbCoupon && dbCoupon !== 'NONE') ? `
                        <div class="item-line" style="margin-top: 10px; padding: 8px 0; color: #00a85a; font-size: 13px; font-weight: 500; border-top: 1px dashed #c6c6c6;">
                            <span>Coupon Applied</span><span>${dbCoupon}</span>
                        </div>` : ''}

                        <div class="item-line total-paid-row" style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #000; font-weight: 900; font-size: 1.25em; color: #000;">
                            <span>TOTAL PAID</span><span>₦${dbTotalPaid.toLocaleString()}</span>
                        </div>
                    </div>

                    <div style="margin-top: 0px; text-align: center; border-top: 1px solid #eee; padding-top: 0px;">
                        <p style="font-size: 10px; display: none; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px;">Verify this receipt:</p>
                        <p style="font-size: 11px; display: none; color: #000; font-weight: 600; word-break: break-all;">mamagstore.com/verify/${order.reference.toUpperCase()}</p>
                        
                        <div style="margin-top: 10px; font-size: 12px; color: #666; line-height: 1.5;">
                            <p style="font-weight: 800; color: #000; letter-spacing: 2px; margin-bottom: 5px;">MAMAG OFFICIAL</p>
                            <p>mamagclothingstore@gmail.com | 08033378712</p>
                            <p>GF 01 Ajoa Plaza, 11, Martins Street, Balogun Market, Lagos</p>
                        </div>
                    </div>
                    
                    <div class="receipt-footer-msg" style="margin-top: 20px;">
                        <p>Thank you for choosing MAMAG.</p>
                    </div>
                </div>
                <div class="scalloped-edge bottom"></div>
            </div>

            <div class="receipt-actions">
                <button class="btn-print" onclick="downloadReceiptImage('${order.reference}')">Download Receipt</button>
                <button class="btn-share" onclick="shareReceipt('${order.reference}')">Share</button>
            </div>
        </div>`;
}


//. RECEIPT IMAGE GENERATION AND DOWNLOAD
async function captureReceiptImage() {
    const receiptElement = document.querySelector('.receipt-container');
    if (!receiptElement) return null;
    return await html2canvas(receiptElement, {
        scale: 3,
        backgroundColor: "#000000",
        useCORS: true
    }).then(canvas => canvas.toDataURL("image/png"));
}

async function downloadReceiptImage(ref) {
    const btn = document.querySelector('.btn-print');
    btn.innerText = "Processing...";
    const imageData = await captureReceiptImage();
    if (imageData) {
        const link = document.createElement('a');
        link.href = imageData;
        link.download = `MAMAG-Receipt-${ref.toUpperCase()}.png`;
        link.click();
        showNotification("Downloaded Successfully!");
    }
    btn.innerText = "Download Receipt";
}

async function shareReceipt(ref) {
    const imageData = await captureReceiptImage();
    if (!imageData) return;
    const response = await fetch(imageData);
    const blob = await response.blob();
    const file = new File([blob], `MAMAG-Receipt-${ref}.png`, { type: 'image/png' });

    if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'MAMAG Receipt' });
    } else {
        downloadReceiptImage(ref);
    }
}


// SUCCESS NOTIFICATION
function showNotification(message) {
    // 1. Create the element
    const toast = document.createElement('div');
    
    // 2. Use 'success-toast' to match your CSS below
    toast.className = 'success-toast'; 
    toast.innerText = message;
    document.body.appendChild(toast);
    
    // 3. Use 'reveal' to trigger the animation
    setTimeout(() => toast.classList.add('reveal'), 100);
    
    // 4. Cleanup
    setTimeout(() => {
        toast.classList.remove('reveal');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}


function isDeliveryValid() {
    if (window.checkoutMethod === 'delivery') {
        if (window.selectedState === 'Select State') {
            showErrorMessage('Missing Information', 'Please select a delivery state.');
            return false;
        }
        if (window.selectedRegion.name === 'Select Region') {
            showErrorMessage('Missing Information', 'Please select a delivery region.');
            return false;
        }
        const address = document.getElementById('checkoutAddress')?.value.trim();
        if (!address) {
            showErrorMessage('Missing Information', 'Please enter your street address.');
            return false;
        }
    }
    return true; // If pickup, it's always valid (or add phone check here)
}



// SEARCH & CATEGORIES
async function loadSearchPanel() {
    // 1. Loading UI
    panelContent.innerHTML = `
        <div class="search-container">
            <div class="search-input-wrapper">
                <input type="text" class="search-input" placeholder="Search for products..." id="searchInput" autocomplete="off">
            </div>
            <div style="display:flex; justify-content:center; padding:50px;">
                <div class="loader"></div>
            </div>
        </div>`;
    openPanel();

    // Default Fallbacks
    let suggestions = { 
        trending: ['Loading...'], 
        quick: [
            {text: 'latest', label: 'Latest Updates', emoji: '🔥'},
            {text: 'arrival', label: 'New Arrivals', emoji: '✨'},
            {text: 'stock', label: 'In Stock', emoji: '✅'}
        ] 
    };
    
    try {
        const resp = await fetch('api/get_search_suggestions.php');
        const data = await resp.json();
        if (data.trending && data.trending.length > 0) suggestions.trending = data.trending;
    } catch (e) { console.error("Suggestions fetch failed"); }

    // 2. Main UI
    panelContent.innerHTML = `
       <div class="search-container">
            <div class="search-input-wrapper">
                <input type="text" class="search-input" placeholder="Search for products..." id="searchInput" autocomplete="off">
                <button class="search-icon-btn" id="searchBtn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="M21 21l-4.35-4.35"></path>
                    </svg>
                </button>
            </div>

            <div class="search-section">
                <h3 class="section-label">Trending Searches</h3>
                <div class="trending-tags">
                    ${suggestions.trending.map(name => `
                        <span class="search-tag" onclick="fillSearch('${name.replace(/'/g, "\\'")}')">${name}</span>
                    `).join('')}
                </div>
            </div>

            <div class="search-section">
                <h3 class="section-label">Quick Categories</h3>
                <div class="quick-search-list">
                    ${suggestions.quick.map(item => `
                        <div class="quick-item" onclick="fillSearch('${item.text}')">
                            <span class="item-emoji">${item.emoji}</span>
                            <span class="item-text">${item.label}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>`;

    const searchInput = document.getElementById('searchInput');
    setTimeout(() => searchInput.focus(), 100);

    document.getElementById('searchBtn').onclick = () => performSearch(searchInput.value);
    searchInput.onkeypress = (e) => { if (e.key === 'Enter') performSearch(e.target.value); };
}

function fillSearch(val) {
    const input = document.getElementById('searchInput');
    if(input) {
        input.value = val;
        performSearch(val);
    }
}

async function performSearch(query) {
    if (!query) return;

    panelContent.innerHTML = `
        <div class="search-container" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 40px 0;">
            <div class="loader"></div>
            <p style="color:#ccc; margin-top:15px;">Finding results for "${query}"...</p>
        </div>`;

    try {
        const response = await fetch(`api/search_products.php?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.status === 'success' && data.results.length > 0) {
            displaySearchResults(query, data.results);
        } else {
            panelContent.innerHTML = `
                <div class="search-container">
                    <div class="contact-title">No results for "${query}"</div>
                    <p style="text-align:center; color:#999; margin: 20px 0;">Try searching for specific product names or categories.</p>
                    <button class="panel-btn secondary" onclick="loadSearchPanel()" style="width:100%;">Back to Search</button>
                </div>`;
        }
    } catch (err) {
        console.error(err);
    }
}

function displaySearchResults(query, results) {
    panelContent.innerHTML = `
        <div class="category-panel-header">
            <div class="category-panel-title">Results for "${query}"</div>
            <div class="category-panel-subtitle">${results.length} Pieces Found</div>
        </div>
        <div class="category-list">
            ${results.map((item, idx) => {
                const videoFile = (item.video_path && item.video_path.trim() !== "" && item.video_path !== "null") ? item.video_path : null;
                const imageFile = (item.image && item.image.trim() !== "" && item.image !== "null") ? item.image : null;
                
                let isVideo = false;
                let fullPath = "";

                if (videoFile) {
                    isVideo = /\.(mp4|webm|mov|ogg)$/i.test(videoFile);
                }

                if (isVideo) {
                    fullPath = `admin/${videoFile}`;
                } else {
                    fullPath = imageFile ? `admin/${imageFile}` : 'placeholder.jpg';
                }

                return `
                    <div class="category-item" data-idx="${idx}">
                        ${isVideo 
                            ? `<video class="category-item-image" loading="lazy" muted loop autoplay playsinline>
                                   <source src="${fullPath}" type="video/mp4">
                               </video>`
                            : `<img src="${fullPath}" class="category-item-image" loading="lazy" onerror="this.src='placeholder.jpg'">`
                        }
                        <div class="category-item-content">
                            <div class="category-item-info">
                                <div class="category-item-name">${item.name}</div>
                                <div class="category-item-price">₦${Number(item.price).toLocaleString()}</div>
                            </div>
                            <div class="category-item-arrow"><i class="fa-solid fa-caret-right"></i></div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        <button class="panel-btn secondary" style="width:100%; margin-top: 15px;" onclick="loadSearchPanel()">New Search</button>
    `;

    panelContent.querySelectorAll('.category-item').forEach(el => {
        el.onclick = () => {
            const selected = results[el.dataset.idx];
            loadProductPanelFromSearch(selected);
        };
    });
}

// 3. SEARCH PANEL PRODUCT PANEL
function loadProductPanelFromSearch(item) {
    // --- HELPERS ---
    const isVideoFile = src => /\.(mp4|webm|ogg|mov)$/i.test(src);
    const cleanPrice = (val) => typeof val === 'number' ? val : parseFloat(String(val).replace(/[^\d.]/g, '')) || 0;
    const formatPrice = (val) => `₦${cleanPrice(val).toLocaleString()}`;

    // Determine initial media path
    let activeMedia = (item.video_path && item.video_path.trim() !== "") ? item.video_path : (item.image || item.main_media);
    const fullMediaPath = activeMedia.startsWith('admin/') ? activeMedia : `admin/${activeMedia}`;

    // --- RENDER SIZES HELPER ---
    const renderSizes = (item) => {
    const sizeArray = Array.isArray(item.sizes) ? item.sizes : (item.sizes ? item.sizes.split(',') : []);
    
    if (sizeArray.length === 0 || (sizeArray.length === 1 && sizeArray[0] === "")) {
        return '<p style="color:#999; font-size:13px;">Standard Size</p>';
    }

    return sizeArray.map(s => {
        const trimmedSize = s.trim();
        if (!trimmedSize) return '';

        const stockQty = (item.size_stocks && item.size_stocks[trimmedSize] !== undefined)
            ? parseInt(item.size_stocks[trimmedSize])
            : parseInt(item.stock || 0);

        const isOut = stockQty <= 0;

        return `
            <button class="size-btn ${isOut ? 'out-of-stock' : ''}" 
                    data-size="${trimmedSize}" 
                    data-stock="${stockQty}"
                    ${isOut ? 'disabled' : ''}
                    style="position: relative; ${isOut ? 'opacity: 0.8; cursor: not-allowed;' : ''}">
                
                <span style="${isOut ? 'text-decoration: line-through; color: #888;' : ''}">
                    ${trimmedSize}
                </span>

                ${isOut 
                    ? `<span style="font-size: 8px !important; font-weight: 800; position: absolute; color: #ff4d4d; bottom: 2px; left: 50%; transform: translateX(-50%); text-decoration: none; white-space: nowrap; line-height: 1;">SOLD OUT</span>` 
                    : ''
                }
            </button>
        `;
    }).join('');

    };

    // --- INITIAL STATE ---
    let selectedSize = null;
    let currentShareId = item.id || item.product_id;
    const stockCount = parseInt(item.stock || 0);
    const isOutOfStock = stockCount <= 0;
    

    // --- UI CONSTRUCTION ---
    panelContent.innerHTML = `
        <div style="position:relative; margin-bottom:10px;">
            <div id="panelMediaContainer">
                ${isVideoFile(fullMediaPath) 
                    ? `<video src="${fullMediaPath}" loading="lazy" class="panel-main-image" muted playsinline controls autoplay loop></video>`
                    : `<img src="${fullMediaPath}" loading="lazy" class="panel-main-image" onerror="this.src='placeholder.jpg'">`}
            </div>

            <button id="panelShareBtn" 
                    style="position:absolute; top:15px; right:15px; background:rgba(255,255,255,0.9); color: #000; border:none; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.1); z-index:10;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            </button>

            <button id="fullScreenBtn" style="position:absolute; bottom:15px; left:15px; background:#fff; color:#000; border:none; width:35px; height:35px; border-radius:100px; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:10; backdrop-filter:blur(4px); box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
            </button>
        </div>

        <h3 class="panel-product-name">${item.name}</h3>
        <p class="panel-product-price">${formatPrice(item.price)}</p>

        <div class="panel-section-title">Select Size</div>
        <div id="sizeBox" class="size-options">${renderSizes(item)}</div>
        <div class="size-error" id="sizeError">Please select a size</div>

        <div class="panel-section-title">Availability</div>
        <p id="pStock" class="panel-description">
            ${isOutOfStock ? 'Sold Out' : (item.sizes && item.sizes.length > 0 ? 'Select a size to check availability' : stockCount + ' pieces left')}
        </p>

        <button class="panel-btn primary ${isOutOfStock ? 'disabled-btn' : ''}" id="addToCartBtn" ${isOutOfStock ? 'disabled' : ''}>
            ${isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
        </button>
        
        <button class="panel-btn secondary" style="margin-top:10px; border:none;" onclick="loadSearchPanel()">Back to Search</button>
    `;

    // --- ATTACH EVENTS ---

    // Full Screen Logic
    const fullScreenBtn = document.getElementById('fullScreenBtn');
    const mediaContainer = document.getElementById('panelMediaContainer');

    const toggleFullScreen = () => {
        const element = mediaContainer.querySelector('.panel-main-image');
        if (!document.fullscreenElement) {
            if (element.requestFullscreen) element.requestFullscreen();
            else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
            else if (element.msRequestFullscreen) element.msRequestFullscreen();
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    };

    if (fullScreenBtn) fullScreenBtn.onclick = toggleFullScreen;
    if (mediaContainer) mediaContainer.onclick = toggleFullScreen;

    // Share Button Logic
    document.getElementById('panelShareBtn').onclick = (e) => {
        e.stopPropagation();
        const shareBtn = e.currentTarget;
        if (typeof copyProductLink === 'function') {
            copyProductLink(currentShareId);
            shareBtn.style.background = "#22c55e";
            shareBtn.querySelector('svg').style.stroke = "#fff";
            setTimeout(() => {
                shareBtn.style.background = "rgba(255,255,255,0.9)";
                shareBtn.querySelector('svg').style.stroke = "#000";
            }, 1000);
        }
    };

    // Size Selection Logic
    panelContent.querySelectorAll('.size-btn').forEach(btn => {
        btn.onclick = () => {
            panelContent.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedSize = btn.dataset.size;
            document.getElementById('sizeError').classList.remove('show');

            const stockEl = document.getElementById('pStock');
            const specificStock = btn.dataset.stock;
            stockEl.innerHTML = `Size ${selectedSize}: <strong>${specificStock} pieces left</strong>`;
            stockEl.style.color = specificStock <= 3 ? '#ff4d4d' : '#666';
        };
    });

    // Add to Cart Logic
    document.getElementById('addToCartBtn').onclick = () => {
        const sizeBox = document.getElementById('sizeBox');
        const hasSizes = sizeBox.querySelectorAll('.size-btn').length > 0;
        
        if (hasSizes && !selectedSize) {
            document.getElementById('sizeError').classList.add('show');
            return;
        }

        addToCart({ 
            id: currentShareId, 
            name: item.name, 
            price: cleanPrice(item.price), 
            stock: stockCount,
            size_stocks: item.size_stocks, 
            image: fullMediaPath 
        }, selectedSize || 'Standard');

        if (typeof showSuccessMessage === 'function') {
            showSuccessMessage('Added!', `${item.name} added.`);
        }
        if (typeof loadCartPanel === 'function') loadCartPanel(); 
    };

    if (typeof openPanel === 'function') openPanel();
}



// -------------------- IN STOCK SYSTEM --------------------
async function loadStockCarousel() {
    try {
        const response = await fetch('api/fetch_stock.php');
        const stockItems = await response.json();
        
        const track = document.getElementById('stockTrack');
        if (!track) return;

        track.innerHTML = stockItems.map(item => {
            // Priority: Show Category name. If Category is missing, fallback to Product Name.
            const displayName = (item.category && item.category.trim() !== "") ? item.category : item.name;

            return `
                <div class="stock-item skeleton-loader" onclick="loadCategoryPanel('${item.id}')">
                    <img src="${item.url}" 
                         loading="lazy" 
                         alt="${displayName}" 
                         class="stock-img" 
                         onload="this.parentElement.classList.add('loaded')"
                         onerror="this.src='placeholder.jpg'">
                    <div class="stock-details">
                        <h3 class="stock-product-name" style="text-transform: uppercase; font-size: 18px; letter-spacing: 0.5px;">
                            ${displayName}
                        </h3>
                        <p class="stock-price" style="display:none;">${item.price}</p>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) { 
        console.error("Stock load error:", err); 
    }
    lucide.createIcons();
    // Inside loadStockCarousel after setting innerHTML:
if (isStockCarousel) track.classList.add('carousel-mode');
}

let isStockCarousel = false;

function toggleStockLayout() {
    const track = document.getElementById('stockTrack');
    const btnText = document.getElementById('stockToggleText');
    const btnIcon = document.getElementById('stockViewToggle').querySelector('i');
    
    isStockCarousel = !isStockCarousel;
    
    if (isStockCarousel) {
        track.classList.add('carousel-mode');
        btnText.innerText = "Grid View";
        btnIcon.setAttribute('data-lucide', 'layout-grid');
    } else {
        track.classList.remove('carousel-mode');
        btnText.innerText = "Carousel View";
        btnIcon.setAttribute('data-lucide', 'columns-2');
    }
    
    lucide.createIcons(); // Refresh icons

    // Add a quick entrance animation to items
    const items = track.querySelectorAll('.stock-item');
    items.forEach((item, i) => {
        item.style.animation = 'none';
        item.offsetHeight; 
        item.style.animation = `popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards ${i * 0.03}s`;
    });
}

// STAGE 1: The Category Panel (List of Main + Subs)
async function loadCategoryPanel(productId) {
    try {
        const response = await fetch(`api/get_product_details.php?id=${productId}`);
        const data = await response.json();
        if (data.status === 'error') return;

        // HELPER: Clean price of any non-numeric characters
        const cleanVal = (val) => {
            if (!val) return 0;
            return parseFloat(String(val).replace(/[^\d.]/g, '')) || 0;
        };

        // HELPER: Ensure image has admin/ prefix
        const fixImg = (src) => {
            if (!src) return 'placeholder.jpg';
            return src.startsWith('admin/') ? src : `admin/${src}`;
        };

        // --- 1. CONSTRUCT THE LIST ---
        let allItemsInCat = [
            { 
                id: data.id, // The Main Product ID
                product_id: data.id,
                name: data.name, 
                price: cleanVal(data.price), 
                image: fixImg(data.main_media), 
                stock: data.stock, 
                sizes: data.sizes,
                size_stocks: data.size_stocks 
            }
        ];
        
        if (data.subs && data.subs.length > 0) {
            data.subs.forEach(s => {
                allItemsInCat.push({ 
                    id: s.id, // FIXED: Use the specific SUB ID
                    product_id: data.id, 
                    name: s.name, 
                    price: cleanVal(s.price), 
                    image: fixImg(s.image), 
                    stock: s.stock, 
                    sizes: (s.sizes && s.sizes.length > 0) ? s.sizes : data.sizes, 
                    size_stocks: s.size_stocks 
                });
            });
        }

        // --- 2. UI CONSTRUCTION ---
        // Changed Title to data.category and Subtitle to show data.name
        panelContent.innerHTML = `
            <div class="category-panel-header">
                <div class="category-panel-title" style="text-transform: uppercase;">${data.category || 'Collection'}</div>
                <div class="category-panel-subtitle">${allItemsInCat.length} Variations</div>
            </div>
            <div class="category-list">
                ${allItemsInCat.map((item, idx) => `
                    <div class="category-item" data-idx="${idx}">
                        <img src="${item.image}" loading="lazy" class="category-item-image" onerror="this.src='placeholder.jpg'">
                        <div class="category-item-content">
                            <div class="category-item-info">
                                <div class="category-item-name">${item.name}</div>
                                <div class="category-item-price">₦${item.price.toLocaleString()}</div>
                            </div>
                            <div class="category-item-arrow"><i class="fa-solid fa-caret-right"></i></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // --- 3. EVENT LISTENERS ---
        panelContent.querySelectorAll('.category-item').forEach(el => {
            el.onclick = () => {
                const selected = allItemsInCat[el.dataset.idx];
                // Pass the specific variation to the product panel
                loadProductPanelFromCategory(selected, allItemsInCat);
            };
        });

        openPanel();

    } catch (err) { 
        console.error("Category Panel Error:", err); 
    }
}

// 2. CATEGORY product PANEL
async function loadProductPanelFromCategory(selectedItem, thumbnails) {
    try {
        // --- 0. DATA FETCHING (To get Addons/Subs not present in Category object) ---
        const prodId = selectedItem.product_id || selectedItem.id;
        const response = await fetch(`api/get_product_details.php?id=${prodId}`);
        const productData = await response.json();
        
        // --- 1. HELPERS ---
        const isVideo = src => /\.(mp4|webm|ogg|mov)$/i.test(src);
        const cleanPrice = (val) => (typeof val === 'number' ? val : parseFloat(String(val).replace(/[^\d.]/g, '')) || 0);
        const formatPrice = (val) => `₦${cleanPrice(val).toLocaleString()}`;
        const fixPath = (src) => (!src) ? 'placeholder.jpg' : (src.startsWith('admin/') ? src : `admin/${src}`);

        const renderMedia = (src) => {
            const path = fixPath(src);
            return isVideo(src)
                ? `<video src="${path}" class="panel-main-image" loading="lazy" muted playsinline controls autoplay loop></video>`
                : `<img src="${path}" class="panel-main-image" loading="lazy" onerror="this.src='placeholder.jpg'">`;
        };

        const renderThumbnail = (src, isSelected, index) => {
            const path = fixPath(src);
            const activeClass = isSelected ? 'selected' : '';
            return isVideo(src)
                ? `<div class="panel-thumbnail ${activeClass}" data-index="${index}"><video src="${path}#t=0.1" class="panel-thumbnail" muted></video></div>`
                : `<img src="${path}" loading="lazy" class="panel-thumbnail ${activeClass}" data-index="${index}" onerror="this.src='placeholder.jpg'">`;
        };

        function renderSizes(item) {
        if (!item.sizes || item.sizes.length === 0 || (item.sizes.length === 1 && item.sizes[0] === "")) {
            return '<p style="color:#999; font-size:13px;">Standard Size</p>';
        }

        const sizeList = Array.isArray(item.sizes) ? item.sizes : item.sizes.split(',');

        return sizeList.map(size => {
            const trimmedSize = size.trim();
            
            // Check specific size stock, fallback to total item stock
            const stockQty = (item.size_stocks && item.size_stocks[trimmedSize] !== undefined)
                ? parseInt(item.size_stocks[trimmedSize]) : parseInt(item.stock);
            
            const isOut = stockQty <= 0;

            return `
                <button class="size-btn ${isOut ? 'out-of-stock' : ''}" 
                        data-size="${trimmedSize}" 
                        data-stock="${stockQty}" 
                        ${isOut ? 'disabled' : ''}
                        style="position: relative;">
                    
                    <span class="size-label">${trimmedSize}</span>
                    
                    ${isOut 
                        ? `<span style="font-size: 8px !important; font-weight: 800; position: absolute; color: #ff4d4d; bottom: 2px; left: 50%; transform: translateX(-50%); text-decoration: none; white-space: nowrap;">SOLD OUT</span>` 
                        : ''
                    }
                </button>`;
        }).join('');
    }

        // --- 2. INITIAL STATE ---
        let currentItem = { ...selectedItem };
        let currentShareId = currentItem.id || currentItem.product_id; 
        let selectedSize = null;
        let selectedSizeStock = parseInt(currentItem.stock);
        let selectedAddOns = window.currentSelectedAddOns || [];

        // --- 3. UI CONSTRUCTION ---
        let html = `
            <div id="panelTopAnchor"></div>
            <div style="position:relative;">
                <div id="panelMediaContainer" style="margin-bottom:10px;">${renderMedia(currentItem.image || currentItem.url)}</div>
                
                <button id="panelShareBtn" class="panel-share-btn" style="position:absolute; top:15px; right:15px; background:rgba(255,255,255,0.9); color: #000; border:none; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:10;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                </button>

                <button id="fullScreenBtn" style="position:absolute; bottom:15px; left:15px; background:#fff; color:#000; border:none; width:35px; height:35px; border-radius:100px; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:10; backdrop-filter:blur(4px);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                </button>
            </div>
            
            <div class="panel-thumbnails">
                ${thumbnails.map((t, i) => renderThumbnail(t.image || t.url, (t.image || t.url) === (currentItem.image || currentItem.url), i)).join('')}
            </div>

            <h3 id="pName" class="panel-product-name">${currentItem.name}</h3>
            <p id="pPrice" class="panel-product-price">${formatPrice(currentItem.price)}</p>

            <div id="sizeSection">
                <div class="panel-section-title">Select Size</div>
                <div id="sizeBox" class="size-options">${renderSizes(currentItem)}</div>
                <div id="sizeError" class="size-error">Please select a size</div>
            </div>

            <div class="panel-section-title" style="margin-top:20px;">Stock Status</div>
            <p id="pStock" class="panel-description">
                ${parseInt(currentItem.stock) <= 0 ? 'Sold Out' : 'Select a size to check availability'}
            </p>
        `;

        if (productData.addons && productData.addons.length > 0) {
            html += `
            <div style="display:flex; justify-content:space-between; align-items:center; margin: 25px 0 10px;">
                <span class="panel-section-title" style="margin:0;">Complete Your Look</span>
                <span id="viewAllAddOns" style="color:#ff4d4d; font-size:13px; cursor:pointer; font-weight:500;">View All</span>
            </div>
            <div id="addonListContainer">
                ${productData.addons.slice(0, 3).map(item => `
                   <div class="addon-item-card" data-id="${item.id}" style="display:flex; align-items:center; background:var(--bg); border-radius:12px; padding:10px; margin-bottom:8px; cursor:pointer;">
                        <img src="${fixPath(item.image)}" loading="lazy" style="width:70px; height:95px; border-radius:8px; object-fit:cover; margin-right:12px;">
                        <div style="flex:1;">
                            <h4 style="margin:0; font-size:14px; color: var(--text-primary);">${item.name}</h4>
                            <p style="margin:2px 0; font-size:15px; var(--text-primary);">+ ${formatPrice(item.price)}</p>
                            <p style="margin:0; font-size:15px; var(--text-primary);">Stock: ${item.stock}</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" class="addon-toggle" data-id="${item.id}" ${selectedAddOns.some(s => s.id == item.id) ? 'checked' : ''} ${item.stock <= 0 ? 'disabled' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                `).join('')}
            </div>`;
        }

        html += `
            <div class="proceed-btn">
                <button class="panel-btn primary ${parseInt(currentItem.stock) <= 0 ? 'disabled-btn' : ''}" id="addToCartBtn" style="margin-top:20px;" ${parseInt(currentItem.stock) <= 0 ? 'disabled' : ''}>
                    ${parseInt(currentItem.stock) <= 0 ? 'Out of Stock' : 'Add to Bag'}
                </button>
            </div>
        `;

        panelContent.innerHTML = html;

        // --- 4. LOGIC & EVENT ATTACHMENT ---
        const shareBtn = document.getElementById('panelShareBtn');
        const fullScreenBtn = document.getElementById('fullScreenBtn');
        const mediaContainer = document.getElementById('panelMediaContainer');

        const toggleFullScreen = () => {
            const element = mediaContainer.querySelector('.panel-main-image');
            if (!document.fullscreenElement) {
                if (element.requestFullscreen) element.requestFullscreen();
                else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
                else if (element.msRequestFullscreen) element.msRequestFullscreen();
            } else {
                if (document.exitFullscreen) document.exitFullscreen();
            }
        };

        if (fullScreenBtn) fullScreenBtn.onclick = toggleFullScreen;
        if (mediaContainer) mediaContainer.onclick = toggleFullScreen;

        const attachSizeEvents = () => {
            panelContent.querySelectorAll('.size-btn').forEach(btn => {
                btn.onclick = () => {
                    panelContent.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    selectedSize = btn.dataset.size;
                    selectedSizeStock = parseInt(btn.dataset.stock);
                    const stockEl = document.getElementById('pStock');
                    stockEl.innerHTML = `Size ${selectedSize}: <strong>${selectedSizeStock} pieces left</strong>`;
                    stockEl.style.color = selectedSizeStock <= 3 ? '#ff4d4d' : '#666';
                    document.getElementById('sizeError').classList.remove('show');
                };
            });
        };

        const syncAddonToggles = () => {
            if (!productData.addons) return;
            panelContent.querySelectorAll('.addon-toggle').forEach(toggle => {
                const id = toggle.dataset.id;
                const card = toggle.closest('.addon-item-card');
                const data = productData.addons.find(a => a.id == id);

                card.onclick = (e) => {
                    if (e.target.closest('.toggle-switch')) return;
                    if(shareBtn) shareBtn.style.display = 'none';
                    document.getElementById('sizeSection').style.display = 'none';
                    selectedSize = null;
                    selectedSizeStock = data.stock;
                    panelContent.querySelectorAll('.addon-item-card').forEach(c => c.classList.remove('active-addon'));
                    card.classList.add('active-addon');
                    document.getElementById('panelMediaContainer').innerHTML = renderMedia(data.image);
                    document.getElementById('pName').innerText = data.name;
                    document.getElementById('pPrice').innerText = formatPrice(data.price);
                    document.getElementById('pStock').innerHTML = data.stock > 0 ? `<strong>In Stock</strong> (${data.stock} available)` : 'Out of Stock';
                    document.getElementById('panelTopAnchor').scrollIntoView({ behavior: 'smooth' });
                    // Re-attach events for new media
                    document.getElementById('panelMediaContainer').onclick = toggleFullScreen;
                };

                toggle.onchange = () => {
                    if (toggle.checked) {
                        if (!selectedAddOns.some(s => s.id == id)) selectedAddOns.push(data);
                    } else {
                        selectedAddOns = selectedAddOns.filter(a => a.id != id);
                    }
                    window.currentSelectedAddOns = selectedAddOns;
                };
            });
        };

        panelContent.querySelectorAll('.panel-thumbnail').forEach(thumb => {
            thumb.onclick = () => {
                if(shareBtn) shareBtn.style.display = 'flex';
                document.getElementById('sizeSection').style.display = 'block';
                panelContent.querySelectorAll('.panel-thumbnail').forEach(t => t.classList.remove('selected'));
                thumb.classList.add('selected');
                panelContent.querySelectorAll('.addon-item-card').forEach(c => c.classList.remove('active-addon'));

                const index = thumb.dataset.index;
                currentItem = { ...thumbnails[index] };
                currentShareId = currentItem.id || currentItem.product_id;

                selectedSize = null;
                selectedSizeStock = parseInt(currentItem.stock);
                document.getElementById('sizeBox').innerHTML = renderSizes(currentItem);
                attachSizeEvents();

                document.getElementById('panelMediaContainer').innerHTML = renderMedia(currentItem.image || currentItem.url);
                document.getElementById('pName').innerText = currentItem.name;
                document.getElementById('pPrice').innerText = formatPrice(currentItem.price);
                
                const oos = parseInt(currentItem.stock) <= 0;
                document.getElementById('pStock').innerText = oos ? 'Sold Out' : (currentItem.sizes ? 'Select a size to check availability' : `${currentItem.stock} pieces left`);
                const cartBtn = document.getElementById('addToCartBtn');
                cartBtn.className = `panel-btn primary ${oos ? 'disabled-btn' : ''}`;
                cartBtn.disabled = oos;
                cartBtn.innerText = oos ? 'Out of Stock' : 'Add to Bag';
                
                // Re-attach events for new media
                document.getElementById('panelMediaContainer').onclick = toggleFullScreen;
            };
        });

        const viewAllBtn = document.getElementById('viewAllAddOns');
        if (viewAllBtn) viewAllBtn.onclick = () => renderFullAddonView(productData, prodId);

        document.getElementById('addToCartBtn').onclick = () => {
            const sizeVisible = document.getElementById('sizeSection').style.display !== 'none';
            if (sizeVisible && (panelContent.querySelectorAll('.size-btn').length > 0) && !selectedSize) {
                document.getElementById('sizeError').classList.add('show');
                return;
            }

            addToCart({
                id: currentShareId,
                name: currentItem.name,
                price: cleanPrice(currentItem.price),
                stock: selectedSizeStock,
                image: fixPath(currentItem.image || currentItem.url)
            }, selectedSize || 'Standard', false);

            selectedAddOns.forEach(addon => {
                addToCart({
                    id: addon.id,
                    name: addon.name,
                    price: addon.price,
                    stock: addon.stock,
                    image: fixPath(addon.image)
                }, 'Standard', false);
            });

            window.currentSelectedAddOns = [];
            showSuccessMessage('Added!', `${currentItem.name} added to bag.`);
            loadCartPanel();
        };

        if (shareBtn) {
            shareBtn.onclick = (e) => {
                e.stopPropagation();
                if (typeof copyProductLink === 'function') {
                    copyProductLink(currentShareId);
                    shareBtn.style.background = "#22c55e";
                    shareBtn.querySelector('svg').style.stroke = "#fff";
                    setTimeout(() => {
                        shareBtn.style.background = "rgba(255,255,255,0.9)";
                        shareBtn.querySelector('svg').style.stroke = "#000";
                    }, 1000);
                }
            };
        }

        attachSizeEvents();
        syncAddonToggles();
        if (typeof openPanel === 'function') openPanel();

    } catch (err) { console.error("Error loading panel:", err); }
}


// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    loadStockCarousel();
});




// ==========================================
// 1. MAIN PRODUCT DETAIL PANEL
// ==========================================
async function loadProductPanel(productId) {
    try {
        const response = await fetch(`api/get_product_details.php?id=${productId}`);
        const product = await response.json();
        
        if (product.status === 'error') return;

        // --- 1. STATE & INITIAL DETECTION ---
        let currentActiveId = productId; 
        let selectedItem = null;
        let isSubProductFound = false;
        let selectedAddOns = window.currentSelectedAddOns || []; 

        if (product.subs && product.subs.length > 0) {
            const matchingSub = product.subs.find(s => s.id == productId);
            if (matchingSub) {
                isSubProductFound = true;
                selectedItem = { 
                    ...matchingSub, 
                    id: matchingSub.id, 
                    stock: parseInt(matchingSub.stock || 0),
                    sizes: matchingSub.sizes || product.sizes,
                    size_stocks: matchingSub.size_stocks || product.size_stocks,
                    image: matchingSub.image 
                };
            }
        }

        if (!isSubProductFound) {
            selectedItem = {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.main_media,
                stock: parseInt(product.stock),
                sizes: product.sizes,
                size_stocks: product.size_stocks 
            };
            currentActiveId = product.id;
        }

        // --- 2. HELPERS ---
        const isVideo = src => /\.(mp4|webm|ogg|mov)$/i.test(src);
        const formatPrice = (val) => `₦${(typeof val === 'number' ? val : parseFloat(String(val).replace(/[^\d.]/g, '')) || 0).toLocaleString()}`;
        const fixPath = (src) => (!src) ? 'placeholder.jpg' : (src.startsWith('admin/') ? src : `admin/${src}`);

        const renderMedia = (src) => {
            const path = fixPath(src);
            return isVideo(src)
                ? `<video src="${path}" class="panel-main-image" loading="lazy" muted playsinline controls autoplay loop></video>`
                : `<img src="${path}" class="panel-main-image" loading="lazy" onerror="this.src='placeholder.jpg'">`;
        };

        const renderThumbnail = (src, isSelected, type, index = '') => {
            const path = fixPath(src);
            const className = `panel-thumbnail ${isSelected ? 'selected' : ''}`;
            const attr = `data-type="${type}" ${index !== '' ? `data-index="${index}"` : ''}`;
            return isVideo(src)
                ? `<video src="${path}#t=0.1" class="${className}" loading="lazy" ${attr} preload="metadata" muted playsinline></video>`
                : `<img src="${path}" class="${className}" loading="lazy" ${attr} onerror="this.src='placeholder.jpg'">`;
        };

        const renderSizeButtons = (item) => {
        // 1. Check if sizes exist
        if (!item.sizes || item.sizes.length === 0 || (item.sizes.length === 1 && item.sizes[0] === "")) {
            return '<p style="color:#999; font-size:13px;">Standard Size</p>';
        }

        // 2. Ensure we have an array (handles both JSON arrays and comma-strings)
        const sizeList = Array.isArray(item.sizes) 
            ? item.sizes 
            : item.sizes.split(',').map(s => s.trim());

        // 3. Render the chips
        return sizeList.map(size => {
            const trimmed = size.trim();
            if(!trimmed) return ''; // Skip empty strings

            // Check stock for this specific size
            const qty = (item.size_stocks && item.size_stocks[trimmed] !== undefined) 
                ? parseInt(item.size_stocks[trimmed]) 
                : parseInt(item.stock);

            const isOut = qty <= 0;

            return `
                <button 
                    class="size-btn ${isOut ? 'out-of-stock' : ''}" 
                    data-size="${trimmed}" 
                    data-stock="${qty}" 
                    ${isOut ? 'disabled' : ''}
                    style="${isOut ? 'opacity: 0.8; text-decoration: line-through; cursor: not-allowed; position: relative;' : ''}"
                >
                    ${trimmed}
                    ${isOut ? '<span style="font-size: 8px !important; font-weight: 700; position: absolute; color: red; bottom: 2px; left: 50%; transform: translateX(-50%); text-decoration: none;">SOLD OUT</span>' : ''}
                </button>`;
        }).join('');
    };
        

        // --- 3. UI CONSTRUCTION ---
        let html = `
            <div id="panelTopAnchor"></div>
            <div style="position:relative;">
                <div id="panelMediaContainer" style="margin-bottom:10px;">${renderMedia(selectedItem.image)}</div>
                <button id="panelShareBtn" class="panel-share-btn" style="position:absolute; top:15px; right:15px; background:rgba(255,255,255,0.9); color: #000; border:none; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:10;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                </button>
                <button id="fullScreenBtn" style="position:absolute; bottom:15px; left:15px; background:#fff; color:#000; border:none; width:35px; height:35px; border-radius:100px; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:10; backdrop-filter:blur(4px);">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                </button>
            </div>
            
            <div class="panel-thumbnails">
                ${renderThumbnail(product.main_media, !isSubProductFound, 'main')}
                ${product.subs.map((s, i) => renderThumbnail(s.image, s.id == currentActiveId, 'sub', i)).join('')}
            </div>

            <h3 id="pName" class="panel-product-name">${selectedItem.name}</h3>
            <p id="pPrice" class="panel-product-price">${formatPrice(selectedItem.price)}</p>

            <div id="sizeSection">
                <div class="panel-section-title">Select Size</div>
                <div id="sizeBox" class="size-options">
                    ${renderSizeButtons(selectedItem)}
                </div>
                <div class="size-error" id="sizeError">Please select a size</div>
            </div>

            <div class="panel-section-title" style="margin-top:20px;">Stock Status</div>
            <p id="pStock" class="panel-description">${selectedItem.stock <= 0 ? 'Sold Out' : 'Select a size to check availability'}</p>
        `;

        if (product.addons && product.addons.length > 0) {
            html += `
            <div style="display:flex; justify-content:space-between; align-items:center; margin: 25px 0 10px;">
                <span class="panel-section-title" style="margin:0;">Complete Your Look</span>
                <span id="viewAllAddOns" style="color:#ff4d4d; font-size:13px; cursor:pointer; font-weight:500;">View All</span>
            </div>
            <div id="addonListContainer">
                ${product.addons.slice(0, 3).map(item => `
                    <div class="addon-item-card" data-id="${item.id}" style="display:flex; align-items:center; background:var(--bg); border-radius:12px; padding:10px; margin-bottom:8px; cursor:pointer;">
                        <img src="${fixPath(item.image)}" loading="lazy" style="width:70px; height:95px; border-radius:8px; object-fit:cover; margin-right:12px;">
                        <div style="flex:1;">
                            <h4 style="margin:0; font-size:14px; color: var(--text-primary);">${item.name}</h4>
                            <p style="margin:2px 0; font-size:15px; var(--text-primary);">+ ${formatPrice(item.price)}</p>
                            <p style="margin:0; font-size:15px; var(--text-primary);">Stock: ${item.stock}</p>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" class="addon-toggle" data-id="${item.id}" ${selectedAddOns.some(s => s.id == item.id) ? 'checked' : ''} ${item.stock <= 0 ? 'disabled' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                `).join('')}
            </div>`;
        }

        html += `
           <div class="proceed-btn">
            <button class="panel-btn primary ${selectedItem.stock <= 0 ? 'disabled-btn' : ''}" id="addToCartBtn" style="margin-top:20px;" ${selectedItem.stock <= 0 ? 'disabled' : ''}>
                ${selectedItem.stock <= 0 ? 'Out of Stock' : 'Add to Bag'}
            </button>
           </div>
        `;

        panelContent.innerHTML = html;

        // --- 4. LOGIC & EVENT ATTACHMENT ---
        const shareBtn = document.getElementById('panelShareBtn');
        let selectedSize = null;
        let selectedSizeStock = selectedItem.stock;

        const attachSizeEvents = () => {
            panelContent.querySelectorAll('.size-btn').forEach(btn => {
                btn.onclick = () => {
                    panelContent.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    selectedSize = btn.dataset.size;
                    selectedSizeStock = parseInt(btn.dataset.stock); 
                    document.getElementById('pStock').innerHTML = `Size ${selectedSize}: <strong>${selectedSizeStock} pieces left</strong>`;
                    document.getElementById('sizeError').classList.remove('show');
                };
            });
        };

        const mediaContainer = document.getElementById('panelMediaContainer');
        const fullScreenBtn = document.getElementById('fullScreenBtn');

        const toggleFullScreen = () => {
            // We target the actual image/video inside the container
            const element = mediaContainer.querySelector('.panel-main-image');
            
            if (!document.fullscreenElement) {
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.webkitRequestFullscreen) { /* Safari */
                    element.webkitRequestFullscreen();
                } else if (element.msRequestFullscreen) { /* IE11 */
                    element.msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        };

        // Trigger on button click OR clicking the image itself
        if (fullScreenBtn) fullScreenBtn.onclick = toggleFullScreen;
        if (mediaContainer) mediaContainer.onclick = toggleFullScreen;

        const wrapper = document.getElementById('zoomWrapper');
        const img = document.getElementById('mainProductImg');

        if (wrapper && img) {
            wrapper.onmousemove = (e) => {
                const x = e.clientX - wrapper.offsetLeft;
                const y = e.clientY - wrapper.offsetTop;
                
                // Calculate percentage position
                const xPercent = (x / wrapper.offsetWidth) * 100;
                const yPercent = (y / wrapper.offsetHeight) * 100;
                
                img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
            };

            wrapper.onmouseleave = () => {
                img.style.transformOrigin = 'center';
                img.style.transform = 'scale(1)';
            };
        }

        if (wrapper) {
        wrapper.onclick = () => {
            wrapper.classList.toggle('is-zoomed');
            if (wrapper.classList.contains('is-zoomed')) {
                img.style.transform = 'scale(2)';
            } else {
                img.style.transform = 'scale(1)';
            }
        };
    }

        if (shareBtn) {
            shareBtn.onclick = (e) => {
                e.stopPropagation();
                copyProductLink(currentActiveId);
                shareBtn.style.background = "#22c55e";
                shareBtn.querySelector('svg').style.stroke = "#fff";
                setTimeout(() => {
                    shareBtn.style.background = "rgba(255,255,255,0.9)";
                    shareBtn.querySelector('svg').style.stroke = "#000";
                }, 1000);
            };
        }

        const syncAddonToggles = () => {
            if (!product.addons || product.addons.length === 0) return;
            panelContent.querySelectorAll('.addon-toggle').forEach(toggle => {
                const id = toggle.dataset.id;
                const card = toggle.closest('.addon-item-card');
                const data = product.addons.find(a => a.id == id);

                card.onclick = (e) => {
                    if (e.target.closest('.toggle-switch')) return;
                    
                    // HIDE SHARE BUTTON ON ADD-ON CLICK
                    if(shareBtn) shareBtn.style.display = 'none';

                    document.getElementById('sizeSection').style.display = 'none';
                    selectedSize = null;
                    selectedSizeStock = data.stock; 
                    panelContent.querySelectorAll('.addon-item-card').forEach(c => c.classList.remove('active-addon'));
                    card.classList.add('active-addon');
                    document.getElementById('panelMediaContainer').innerHTML = renderMedia(data.image);
                    document.getElementById('pName').innerText = data.name;
                    document.getElementById('pPrice').innerText = formatPrice(data.price);
                    document.getElementById('pStock').innerHTML = data.stock > 0 ? `<strong>In Stock</strong> (${data.stock} available)` : 'Out of Stock';
                    document.getElementById('panelTopAnchor').scrollIntoView({ behavior: 'smooth' });
                };

                toggle.onchange = () => {
                    if (toggle.checked) {
                        if (!selectedAddOns.some(s => s.id == id)) selectedAddOns.push(data);
                    } else {
                        selectedAddOns = selectedAddOns.filter(a => a.id != id);
                    }
                    window.currentSelectedAddOns = selectedAddOns;
                };
            });
        };

        panelContent.querySelectorAll('.panel-thumbnail').forEach(thumb => {
            thumb.onclick = () => {
                // SHOW SHARE BUTTON AGAIN ON PRODUCT THUMBNAIL CLICK
                if(shareBtn) shareBtn.style.display = 'flex';

                panelContent.querySelectorAll('.panel-thumbnail').forEach(t => t.classList.remove('selected'));
                thumb.classList.add('selected');
                document.getElementById('sizeSection').style.display = 'block';
                panelContent.querySelectorAll('.addon-item-card').forEach(c => c.classList.remove('active-addon'));

                if (thumb.dataset.type === 'sub') {
                    const sub = product.subs[thumb.dataset.index];
                    selectedItem = { ...sub, id: sub.id, sizes: sub.sizes || product.sizes, size_stocks: sub.size_stocks || product.size_stocks };
                    currentActiveId = sub.id; 
                } else {
                    selectedItem = { ...product, id: product.id, image: product.main_media };
                    currentActiveId = product.id; 
                }

                selectedSize = null;
                selectedSizeStock = selectedItem.stock;
                document.getElementById('sizeBox').innerHTML = renderSizeButtons(selectedItem);
                attachSizeEvents(); 

                document.getElementById('panelMediaContainer').innerHTML = renderMedia(selectedItem.image);
                document.getElementById('pName').innerText = selectedItem.name;
                document.getElementById('pPrice').innerText = formatPrice(selectedItem.price);
                document.getElementById('pStock').innerHTML = selectedItem.stock <= 0 ? 'Sold Out' : 'Select a size to check availability';
            };
        });

        const viewAllBtn = document.getElementById('viewAllAddOns');
        if (viewAllBtn) viewAllBtn.onclick = () => renderFullAddonView(product, productId);

        document.getElementById('addToCartBtn').onclick = () => {
            const sizeSectionVisible = document.getElementById('sizeSection').style.display !== 'none';
            if (sizeSectionVisible && (panelContent.querySelectorAll('.size-btn').length > 0) && !selectedSize) {
                document.getElementById('sizeError').classList.add('show');
                return;
            }

            addToCart({ 
                id: selectedItem.id, 
                name: selectedItem.name, 
                price: parseFloat(String(selectedItem.price).replace(/[^\d.]/g, '')), 
                stock: parseInt(selectedSizeStock), 
                image: fixPath(selectedItem.image)
            }, selectedSize || 'Standard', false);

            selectedAddOns.forEach(addon => {
                addToCart({
                    id: addon.id, 
                    name: addon.name, 
                    price: addon.price,
                    stock: addon.stock, 
                    image: fixPath(addon.image)
                }, 'Standard', false);
            });

            window.currentSelectedAddOns = []; 
            showSuccessMessage('Success', 'Items added to bag.');
            loadCartPanel(); 
        };

        attachSizeEvents();
        syncAddonToggles();
        openPanel();

    } catch (err) { console.error("Error:", err); }
}

// ADD ON PRODUCTS FULL VIEW
function renderFullAddonView(product, originalId) {
    const selectedAddOns = window.currentSelectedAddOns || [];
    const fixPath = (src) => (!src) ? 'placeholder.jpg' : (src.startsWith('admin/') ? src : `admin/${src}`);
    const firstAddon = product.addons[0] || { name: 'Add-ons', price: 0, image: '', stock: 0 };

    panelContent.innerHTML = `
        <div id="addonTopAnchor"></div>
        <div class="panel-header-simple" style="display:flex; align-items:center; gap:15px; margin-bottom:15px; justify-content: space-between;">
            <button id="backToProduct" style="background:none; border:none; color:white; font-size:22px; cursor:pointer; padding:0;">Back</button>
            <h3 style="margin:0; font-size:18px;">All Add-ons</h3>
        </div>

        <div id="addonDisplayArea" style="margin-bottom:20px;">
            <div id="addonMediaContainer" style="width:100%; height:300px; border-radius:15px; overflow:hidden; background:#111; margin-bottom:15px;">
                <img src="${fixPath(firstAddon.image)}" id="addonLargeImg" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='placeholder.jpg'">
            </div>
            <h3 id="addonLargeName" style="margin:0; font-size:20px; color: var(--text-primary);">${firstAddon.name}</h3>
            <p id="addonLargePrice" style="margin:5px 0 5px; font-size:18px; color:#ff4d4d; font-weight:700;">₦${firstAddon.price.toLocaleString()}</p>
            <p id="addonLargeStock" style="margin:0 0 20px; font-size:16px; color: var(--text-primary);">In Stock: ${firstAddon.stock}</p>
        </div>
        
        <div id="fullAddonList" style="padding-bottom:80px;">
            ${product.addons.map((item, idx) => `
                <div class="addon-item-card-full" data-id="${item.id}" data-index="${idx}" style="display:flex; align-items:center; background: var(--bg); border-radius:12px; padding:12px; margin-bottom:12px; cursor:pointer; border:1px solid ${idx === 0 ? '#ff4d4d' : 'transparent'};">
                    <img src="${fixPath(item.image)}" style="width:50px; height:50px; border-radius:8px; object-fit:cover; margin-right:15px;">
                    <div style="flex:1;">
                        <h4 style="margin:0; font-size:14px; color: var(--text-primary);">${item.name}</h4>
                        <p style="margin:2px 0; font-size:12px; color: var(--text-primary);">+ ₦${item.price.toLocaleString()}</p>
                        <p style="margin:0; font-size:15px; color: var(--text-primary);">Stock: ${item.stock}</p>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" class="addon-toggle" data-id="${item.id}" ${selectedAddOns.some(s => s.id == item.id) ? 'checked' : ''} ${item.stock <= 0 ? 'disabled' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>
            `).join('')}
        </div>
        
        <div style="position:sticky; bottom:0; left:0; width:100%; padding:15px 0;">
            <button class="panel-btn primary" id="confirmAddons" style="width:100%; margin:0;">Confirm & Back</button>
        </div>
    `;

    panelContent.querySelectorAll('.addon-item-card-full').forEach(card => {
        const id = card.dataset.id;
        const data = product.addons.find(a => a.id == id);
        const toggle = card.querySelector('.addon-toggle');

        card.onclick = (e) => {
            if (e.target.closest('.toggle-switch')) return;

            panelContent.querySelectorAll('.addon-item-card-full').forEach(c => c.style.borderColor = 'transparent');
            card.style.borderColor = '#ff4d4d';

            document.getElementById('addonLargeImg').src = fixPath(data.image);
            document.getElementById('addonLargeName').innerText = data.name;
            document.getElementById('addonLargePrice').innerText = `₦${data.price.toLocaleString()}`;
            document.getElementById('addonLargeStock').innerText = `In Stock: ${data.stock}`;
            
            document.getElementById('addonTopAnchor').scrollIntoView({ behavior: 'smooth' });
        };

        toggle.onchange = () => {
            if (toggle.checked) {
                if (!window.currentSelectedAddOns) window.currentSelectedAddOns = [];
                if (!window.currentSelectedAddOns.some(s => s.id == id)) window.currentSelectedAddOns.push(data);
            } else {
                window.currentSelectedAddOns = window.currentSelectedAddOns.filter(a => a.id != id);
            }
        };
    });

    const goBack = () => loadProductPanel(originalId);
    document.getElementById('backToProduct').onclick = goBack;
    document.getElementById('confirmAddons').onclick = goBack;
}

// Utility to keep both panels in sync
function syncAllToggles(id, isChecked) {
    document.querySelectorAll(`.addon-toggle[data-id="${id}"], .addon-toggle-full[data-id="${id}"]`).forEach(t => {
        t.checked = isChecked;
    });
}


function editProfile() {
    // Save current email in case the user changes it
    const oldEmail = currentUser.email;

    panelContent.innerHTML = `
        <div class="profile-container">
          <h2 class="contact-title">Update Profile</h2>
          <form id="editProfileForm">
            <div class="form-group">
              <label class="form-label" for="profileName">Full Name</label>
              <input type="text" id="profileName" class="form-input" value="${currentUser.name}" required>
            </div>
            
            <div class="form-group">
              <label class="form-label" for="profileEmail">Email Address</label>
              <input type="email" id="profileEmail" class="form-input" value="${currentUser.email}" required>
            </div>

            <button type="submit" id="saveProfileBtn" class="panel-btn primary" style="width:100%">Save Changes</button>
            <button type="button" class="panel-btn secondary" style="width:100%; margin-top:10px;" onclick="loadProfilePanel()">Cancel</button>
          </form>
        </div>
      `;

    document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const saveBtn = document.getElementById('saveProfileBtn');
        const newName = document.getElementById('profileName').value;
        const newEmail = document.getElementById('profileEmail').value;

        saveBtn.innerText = "Saving...";
        saveBtn.disabled = true;

        try {
            // 1. Send data to Database
            const response = await fetch('update_profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newName,
                    email: newEmail,
                    oldEmail: oldEmail
                })
            });

            const result = await response.json();

            if (result.status === 'success') {
                // 2. Update live variables if DB update was successful
                currentUser.name = newName;
                currentUser.email = newEmail;
                
                // 3. Update LocalStorage for persistence
                localStorage.setItem('mamag_users', JSON.stringify(currentUser));

                showSuccessMessage('Profile Updated!', 'Your information has been synced to your account.');
                loadProfilePanel();
            } else {
                alert("Error updating database: " + result.message);
                saveBtn.innerText = "Save Changes";
                saveBtn.disabled = false;
            }
        } catch (error) {
            console.error("Fetch error:", error);
            alert("Connection error. Could not save to database.");
            saveBtn.disabled = false;
        }
    });
}

function logoutUser() {
    // Show custom confirmation UI in the side panel
    panelContent.innerHTML = `
        <div class="profile-container" style="text-align: center; padding: 40px 20px;">
            <div class="profile-avatar-large" style="margin-bottom: 20px; background: #f5f5f5; color: #000; font-size: 40px; line-height: 80px;">!</div>
            <h2 class="contact-title">Sign Out</h2>
            <p style="color: var(--text-primary); margin-bottom: 30px;">Are you sure you want to log out of your MAMAG account?</p>
            
            <button class="panel-btn primary" style="width:100%; padding: 15px; margin-bottom: 10px;" onclick="confirmLogout()">Yes, Sign Out</button>
            <button class="panel-btn secondary" style="width:100%; padding: 15px; border: 1px solid #ddd; color: var(--color-black); background: transparent; cursor: pointer;" onclick="loadProfilePanel()">Cancel</button>
        </div>
    `;
    openPanel();
}

function confirmLogout() {
    // 1. Visual Feedback
    const btn = document.querySelector('.panel-btn.primary');
    if(btn) {
        btn.innerHTML = '<span class="spinner"></span> Signing Out...';
        btn.disabled = true;
    }

    // 2. Wipe Browser Memory (JavaScript Globals & LocalStorage)
    isLoggedIn = false;
    currentUser = { name: '', email: '', orders: [] };
    localStorage.clear(); // Clears ALL local data to be safe
    sessionStorage.clear();

    // 3. Optional: Show success message before redirecting
    if (typeof showSuccessMessage === 'function') {
        showSuccessMessage('Signed Out', 'You have been logged out successfully.');
    }

    // 4. THE MOST IMPORTANT STEP: Redirect to the PHP logout script
    // This kills the server-side session so the next user gets a clean slate.
    setTimeout(() => {
        window.location.href = 'logout.php';
    }, 1000); 
}

function deleteAccount() {
    panelContent.innerHTML = `
    <div class="profile-container">
        <h2 class="contact-title">Delete Account</h2>
        <p style="text-align: center; color: #ff4444; margin-bottom: 30px; font-weight: 600;">
        This action cannot be undone!
        </p>
        <p style="text-align: center; color: #666; margin-bottom: 30px;">
        Are you sure you want to delete your account? All your orders, data, wallet balance, and saved information will be permanently removed. 
        </p>
        <div style="display: flex; flex-direction: column; gap: 10px;">
        <button class="profile-action-btn danger" onclick="confirmDeleteAccount()">Yes, Delete My Account</button>
        <button class="profile-action-btn secondary" onclick="loadProfilePanel()">Cancel</button>
        </div>
    </div>
    `;
}

async function confirmDeleteAccount() {
    // Show a loading state on the button so the user knows something is happening
    const deleteBtn = document.querySelector('.profile-action-btn.danger');
    if (deleteBtn) {
        deleteBtn.innerText = "Deleting...";
        deleteBtn.disabled = true;
    }

    try {
        // 1. Tell the Database to delete this user
        const response = await fetch('api/delete_account.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentUser.email })
        });

        const result = await response.json();

        if (result.status === 'success') {
            // 2. Clear local data only AFTER successful DB deletion
            isLoggedIn = false;
            currentUser = null;
            localStorage.removeItem('mamag_users'); // Clear saved session
            
            closePanel();
            
            // Your custom success notification
            showNotification("Account Permanently Deleted"); 
        } else {
            alert("Error: " + (result.message || "Could not delete account."));
            if (deleteBtn) {
                deleteBtn.innerText = "Yes, Delete My Account";
                deleteBtn.disabled = false;
            }
        }
    } catch (err) {
        console.error("Deletion Error:", err);
        alert("Server error. Please check your internet connection.");
    }
}


// 1. NEW ARRIVALS
// ==========================================
let currentArrivalsPage = 1;
let allArrivalsProducts = [];
const itemsPerPage = 9;

    async function loadNewArrivals() {
        const grid = document.getElementById('arrivalsGrid');
        if (!grid) return;

        try {
            const response = await fetch('api/fetch_new_arrivals.php');
            allArrivalsProducts = await response.json();
            
            if (!allArrivalsProducts || allArrivalsProducts.length === 0) {
                grid.innerHTML = "<p style='color:white; text-align:center; width:100%;'>No Products Yet.</p>";
                return;
            }

            renderArrivalsPage(1);

        } catch (err) {
            console.error("Error loading arrivals:", err);
        }
    }

    function renderArrivalsPage(page) {
        const grid = document.getElementById('arrivalsGrid');
        currentArrivalsPage = page;
    
        // --- NEW PRECISE SCROLL ---
        // Increase the 'offset' number if it still isn't high enough (e.g., change -120 to -150)
        const offset = -250; 
        const elementPosition = grid.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset + offset;
    
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
        // ---------------------------
    
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageProducts = allArrivalsProducts.slice(start, end);
        const totalPages = Math.ceil(allArrivalsProducts.length / itemsPerPage);
    
        // ... rest of your mapping code remains the same ...
        grid.innerHTML = pageProducts.map((product, index) => {
            // your existing pattern logic
            let cardClass = "";
            const patternIndex = index % 9; 
            if (patternIndex === 0 || patternIndex === 9) cardClass = "tall";
            else if (patternIndex === 3) cardClass = "wide";
    
            return `
                <div class="product-card ${cardClass}" data-id="${product.id}" onclick="openProductPanel(${product.id})">
                    <div class="product-image-wrapper skeleton-loader">
                        <img src="${product.url}" loading="lazy" alt="${product.name}" class="product-img" onload="this.parentElement.classList.remove('skeleton-loader')">
                        <div class="product-overlay quick-view-btn"></div>
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-price">${product.price}</p>
                    </div>
                </div>`;
        }).join('');
    
        renderPaginationControls(totalPages);
    }
    
    function renderPaginationControls(totalPages) {
        // Check if a controls container exists, or create one after the grid
        let controls = document.getElementById('arrivalsPagination');
        if (!controls) {
            controls = document.createElement('div');
            controls.id = 'arrivalsPagination';
            controls.className = 'pagination-container';
            document.getElementById('arrivalsGrid').after(controls);
        }
    
        controls.innerHTML = `
            <button class="pag-btn" ${currentArrivalsPage === 1 ? 'disabled' : ''} onclick="renderArrivalsPage(${currentArrivalsPage - 1})">PREV</button>
            <span class="pag-info">${currentArrivalsPage} OF ${totalPages}</span>
            <button class="pag-btn" ${currentArrivalsPage === totalPages ? 'disabled' : ''} onclick="renderArrivalsPage(${currentArrivalsPage + 1})">NEXT</button>
        `;
    }

    let isUniform = false; // Track state globally
    
    function handleLayoutToggle() {
        const grid = document.getElementById('arrivalsGrid');
        const btnText = document.getElementById('layoutText');
        const btnIcon = document.getElementById('layoutIcon');
        
        isUniform = !isUniform; // Flip the state
    
        if (isUniform) {
            grid.classList.add('uniform-view');
            btnText.innerText = "Mixed View";
            btnIcon.setAttribute('data-lucide', 'layout-grid');
        } else {
            grid.classList.remove('uniform-view');
            btnText.innerText = "Uniform View";
            btnIcon.setAttribute('data-lucide', 'grid-3x3');
        }
    
        // Refresh Lucide icons to show the new one
        lucide.createIcons();
    
        // Staggered "Bubble" Animation for products
        const cards = grid.querySelectorAll('.product-card');
        cards.forEach((card, i) => {
            card.style.animation = 'none';
            card.offsetHeight; // Trigger reflow
            card.style.animation = `popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards ${i * 0.02}s`;
        });
    }
    
    // 5. Ensure it runs when the page loads
    window.addEventListener('DOMContentLoaded', () => {
        loadNewArrivals();
        lucide.createIcons();
    });
    
    
    
    
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('quick-view-btn')) {
            const card = e.target.closest('.product-card');
            const productId = card.dataset.id; // Correctly gets the ID from data-id attribute
            if (productId) {
                loadProductPanel(productId);
            }
        }
    });

// Auto Scroll
let scrollRequest;
let isAutoScrolling = false;

  function step() {
    window.scrollBy(0, 4); // Adjust this number for speed

    // Continue if not at the bottom
    if ((window.innerHeight + window.scrollY) < document.body.scrollHeight) {
      scrollRequest = requestAnimationFrame(step);
    } else {
      stopAutoScroll();
    }
  }

  function stopAutoScroll() {
    cancelAnimationFrame(scrollRequest);
    isAutoScrolling = false;
    // Remove listeners once stopped to save resources
    window.removeEventListener('wheel', stopAutoScroll);
    window.removeEventListener('touchmove', stopAutoScroll);
    window.removeEventListener('keydown', stopAutoScroll);
  }

  document.getElementById('startScroll').addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent the click itself from triggering a 'stop'
    if (isAutoScrolling) return;

    isAutoScrolling = true;
    scrollRequest = requestAnimationFrame(step);

    // Listen for manual intervention
    window.addEventListener('wheel', stopAutoScroll);
    window.addEventListener('touchmove', stopAutoScroll);
    window.addEventListener('keydown', stopAutoScroll);
  });


  function showToast(message) {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'mamag-toast';
    toast.innerText = message;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

// Update your copy function to use the toast
function copyProductLink(productId) {
    const shareUrl = `${window.location.origin}${window.location.pathname}?product=${productId}`;
    
    // Modern approach
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(() => {
            showToast("Link copied to clipboard ✨");
        }).catch(() => {
            // Fallback if clipboard fails
            fallbackCopy(shareUrl);
        });
    } else {
        fallbackCopy(shareUrl);
    }
}

// Fallback for older mobile browsers or non-HTTPS sites
function fallbackCopy(text) {
    const dummy = document.createElement("input");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
    showToast("Link copied ✨");
}

// Export functions for HTML usage
window.updateCartQty = updateCartQty;
window.removeFromCart = removeFromCart;
window.loadCheckoutPanel = loadCheckoutPanel;
window.loadCategoryPanel = loadCategoryPanel;
window.loadProductPanel = loadProductPanel;
window.loadLoginForm = loadLoginForm;
window.loadSignupForm = loadSignupForm;
// New Story/Product Interaction Exports
window.toggleLike = toggleLike;
window.copyProductLink = copyProductLink;


window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');

    if (productId) {
        setTimeout(() => {
            // Updated check to match your exported name 'loadProductPanel'
            if (typeof window.loadProductPanel === 'function') {
                window.loadProductPanel(productId);
            } else {
                // Fallback for stories
                const storyIndex = statusData.findIndex(p => p.id == productId);
                if (storyIndex !== -1) {
                    statusViewer.classList.add('active');
                    showStatus(storyIndex);
                }
            }
        }, 800);
    }
});
  




const infoData = {
    'shipping': `
        <h2>Shipping & Returns</h2>
        <div class="content-block">
            <h3>Domestic Shipping (Nigeria)</h3>
            <p><b>Lagos:</b> 2-3 Business Days<br>
               <b>Other States:</b> 3-4 plus Business Days<br>
               Delivery would not occur on weekends</p>
        </div>
        <div class="highlight-box">
            <h3>Returns Policy</h3>
            <p>We accept returns within <b>7 days</b> of delivery. Items must be unworn, unwashed, and in original packaging with all MAMAG tags attached. Sale items are final and non-refundable.</p>
        </div>
        <div class="content-block">
            <h3>International Shipping</h3>
            <p>We ship nationwide within Nigeria. Delivery typically takes an average 3-5 business days. Customs duties and taxes are the responsibility of the customer.</p>
        </div>
    `,
    'size-guide': `
        <h2>Size Guide</h2>
        <p>Our pieces are designed for all available sizes, Boxy, Oversized Fit included. <br> Browse to find your fit</p>
        <div class="highlight-box" style="display: none;">
            <table style="width:100%; text-align:left; border-collapse:collapse;">
                <tr style="border-bottom:1px solid #ddd;"> <th style="padding:10px;">Size</th> <th style="padding:10px;">Chest (Inches)</th> </tr>
                <tr style="border-bottom:1px solid #eee;"> <td style="padding:10px;">Small</td> <td style="padding:10px;">36 - 38</td> </tr>
                <tr style="border-bottom:1px solid #eee;"> <td style="padding:10px;">Medium</td> <td style="padding:10px;">39 - 41</td> </tr>
                <tr style="border-bottom:1px solid #eee;"> <td style="padding:10px;">Large</td> <td style="padding:10px;">42 - 44</td> </tr>
                <tr> <td style="padding:10px;">X-Large</td> <td style="padding:10px;">45 - 48</td> </tr>
            </table>
        </div>
    `,
    'privacy': `
        <h2>Privacy Policy</h2>
        <div class="content-block">
            <h3>Data Collection</h3>
            <p>MAMAG collects personal information (Name, Email, Address) solely for order fulfillment and personalized marketing via Paystack secure checkout.</p>
        </div>
        <div class="content-block">
            <h3>Security</h3>
            <p>We do not store credit card details. All payments are processed through <b>Paystack's PCI-DSS compliant servers</b>. Your data is encrypted and never sold to third parties.</p>
        </div>
    `,
    'terms': `
        <h2>Terms of Service</h2>
        <div class="content-block">
            <h3>Ownership</h3>
            <p>All content, designs, and logos on this site are the intellectual property of <b>MAMAG</b>.</p>
        </div>
        <div class="content-block">
            <h3>Order Cancellation</h3>
            <p>Orders can only be cancelled within 2 hours of placement, contact MamaG via WhatsApp. Once processed for shipping, the standard return policy applies.</p>
        </div>
    `,
    'contact': `
        <h2>Contact Us</h2>
        <div class="highlight-box">
            <h3>General Inquiries</h3>
            <p>Email: <b>mamagclothingstore@gmail.com</b></p>
            <p>WhatsApp: <b>+234 803 405 6664 </b></p>
        </div>
        <div class="content-block">
            <h3>Office Hours</h3>
            <p>Monday — Friday: 7:30 AM - 7:45 PM<br>
               Saturday: 9:00 AM - 7:00 PM<br>
               Sunday: Closed (Emails monitored)</p>
        </div>
    `,
    'story': `
        <h2>Our Story</h2>
        <p>MAMAG is more than a brand; it’s a narrative of resilience and African modernism. Founded by MamaG, we bridge the gap between high-fashion silhouettes and raw streetwear energy.</p>
        <div class="highlight-box">
            <p><i>"Crafting the armor for the modern creative."</i></p>
        </div>
        <p>Every piece is sourced and produced with a commitment to quality that rivals global standards, ensuring that when you wear MAMAG, you wear excellence.</p>
    `
};

function openInfoPanel(slug) {
    const content = infoData[slug] || "<h2>Details coming soon</h2>";
    const panel = document.getElementById('infoPanel');
    const overlay = document.getElementById('infoPanelOverlay');
    
    document.getElementById('infopanelContent').innerHTML = content;
    
    overlay.style.display = 'block';
    // Reset scroll position to top
    panel.scrollTop = 0;

    setTimeout(() => {
        panel.classList.add('active');
        overlay.style.opacity = "1";
    }, 10);
    
    document.body.style.overflow = 'hidden'; 
}

function closeInfoPanel() {
    document.getElementById('infoPanel').classList.remove('active');
    setTimeout(() => {
        document.getElementById('infoPanelOverlay').style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 500);
}


