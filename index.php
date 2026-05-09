<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <title>MAMAG OFFICIAL | Premium Nigerian  & Modern Aesthetics</title>
    <meta name="description" content="MAMAG Official - Redefining African  with bold silhouettes and premium quality. Shop our latest collection of boxy tees, hoodies, and accessories.">
    <meta name="keywords" content="MAMAG, MAMAG Clothing, Nigerian , Lagos Fashion, Premium Apparel, Oversized Tees, African Modernism">
    <meta name="author" content="MAMAG OFFICIAL">
    <meta name="robots" content="index, follow">

    <meta property="og:type" content="website">
    <meta property="og:url" content="https://mamagstore.com/">
    <meta property="og:title" content="MAMAG OFFICIAL | Premium Wears">
    <meta property="og:description" content="Redefining African . Bold silhouettes. Premium quality. Crafting the armor for the modern creative.">
    <meta property="og:image" content="https://mamagstore.com/assets/img/logo.png">

    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://mamagstore.com/">
    <meta property="twitter:title" content="MAMAG OFFICIAL | Premium ">
    <meta property="twitter:description" content="Redefining African . Crafting the armor for the modern creative.">
    <meta property="twitter:image" content="https://mamagstore.com/assets/img/logo.png">

    <script type="application/ld+json">
    {
    "@context": "https://schema.org/",
    "@type": "ClothingStore",
    "name": "MAMAG OFFICIAL",
    "image": "https://mamagstore.com/assets/img/logo3.png",
    "description": "Premium Nigerian  and Modern Aesthetics.",
    "address": {
        "@type": "PostalAddress",
        "addressLocality": "Lagos",
        "addressCountry": "NG"
    },
    "openingHours": "Mo,Tu,We,Th,Fr 07:30-19:30",
    "url": "https://mamagstore.com"
    }
    </script>

    <link rel="icon" type="image/png" sizes="32x32" href="assets/img/logo3.png">
    <link rel="icon" type="image/png" sizes="16x16" href="assets/img/logo.png">
    <link rel="apple-touch-icon" sizes="180x180" href="assets/img/logo.png">
    <link rel="shortcut icon" href="favicon.ico">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Acme&family=Lobster+Two:ital,wght@0,400;0,700;1,400;1,700&family=Tomorrow:ital,wght@0,100;0,900;1,100;1,900&display=swap" rel="stylesheet"> 
    
    <link rel="stylesheet" href="assets/dist.css?v=2">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css">
    
    
    <script src="https://unpkg.com/lucide@latest"></script>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            let scrollRequest;
            let isAutoScrolling = false;
            const SCROLL_SPEED = 5; 

            function step() {
                window.scrollBy(0, SCROLL_SPEED);
                if ((window.innerHeight + window.scrollY) < document.body.scrollHeight - 2) {
                    scrollRequest = requestAnimationFrame(step);
                } else {
                    stopAutoScroll();
                }
            }

            function stopAutoScroll() {
                if (!isAutoScrolling) return;
                cancelAnimationFrame(scrollRequest);
                isAutoScrolling = false;
                window.removeEventListener('wheel', stopAutoScroll);
                window.removeEventListener('touchmove', stopAutoScroll);
                window.removeEventListener('keydown', stopAutoScroll);
            }

            const startBtn = document.getElementById('startScroll');
            if (startBtn) {
                startBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (isAutoScrolling) {
                        stopAutoScroll();
                        return;
                    }
                    isAutoScrolling = true;
                    scrollRequest = requestAnimationFrame(step);
                    window.addEventListener('wheel', stopAutoScroll, { passive: true });
                    window.addEventListener('touchmove', stopAutoScroll, { passive: true });
                    window.addEventListener('keydown', stopAutoScroll);
                });
            }
        });
    </script>
</head>
 <body>

    <!-- Loading Screen -->
    <div class="loading-screen" id="loadingScreen">
        <div class="loading-content">
            <div class="loading-spinner"></div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="main-content" id="mainContent">

    <!-- Header Navigation -->
    <header id="navbar">

            <div class="contc nav-left" >
                <i class="fa-solid fa-location-dot"></i> Reach Us
            </div>

            <div class="logo-container">
                <div class="logo" id="headerLogo"><a href="#mainContent">MAMAG!</a></div>
            </div>
            
            <div class="nav-right">

                <button class="icon-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewbox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="5" y="8" width="14" height="11" rx="2" /> 
                        <path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                    </svg>
                </button> 

                <button class="icon-btn">
                    <i class="fa-regular fa-circle-user"></i>
                </button> 

                <button class="icon-btn">
                    <svg viewbox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="11" cy="11" r="8" />
                        <path d="M21 21l-4.35-4.35" />
                    </svg>
                </button>

            </div>
    
    </header>

    <!-- Hero section -->
    <section class="hero">
            <div class="hero-content">
                <div class="btn-group">
                    <button class="gucci-btn" id="startScroll">EXPLORE</button>
                </div>
            </div>
    </section>


        <!-- Latest Updates -->
        <div class="updates-section">
            <h2 class="section-title">Latest Updates</h2>

            <div class="status-container">
                <p style="padding:20px; color:#888;">Loading updates...</p>
            </div>
        </div>

        <!-- Full Screen Latest Updates Viewer -->
        <div class="status-viewer" id="statusViewer">
            <button class="close-btn" id="closeBtn" onclick="closeStatus()">
                <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18" /> 
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>

            <div class="status-fullscreen" id="statusFullscreen">
                <div class="progress-container"></div>

                <img src="" alt="Status" id="fullscreenImage" class="fullscreen-image" style="display:none;">
                
                <div class="status-header">
                    <div class="status-avatar-ring">
                        <div class="status-avatar">MG</div>
                    </div>
                    <span class="status-username" id="fullscreenName">Loading...</span>
                </div>

                <div class="interaction-sidebar status-actions">
                    <button class="interaction-btn" id="likeBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="width:24px; height:24px;">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        <span class="interaction-label">Like</span> 
                    </button> 
                    
                    <button class="interaction-btn" id="shareBtn">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="width:24px; height:24px;">
                            <circle cx="18" cy="5" r="3" /> <circle cx="6" cy="12" r="3" /> 
                            <circle cx="18" cy="19" r="3" /> 
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /> 
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                        </svg>
                        <span class="interaction-label">Share</span> 
                    </button> 
                </div>

                <button class="order-btn" id="orderBtn">
                    <span class="order-label">Order Now</span> 
                </button>
            </div>
        </div>


    <!-- New Arrivals Section -->
        <div class="arrivals-section">
            <h2 class="arrivals-title">New Arrivals</h2>
           <div class="layout-controls">
                <button id="layoutToggleBtn" class="layout-btn" onclick="handleLayoutToggle()">
                    <i id="layoutIcon" data-lucide="grid-3x3"></i>
                    <span style="display: none;" id="layoutText">Uniform View</span>
                </button>
            </div>
            <div class="arrivals-grid" id="arrivalsGrid">
                
            </div>
        </div>
    
    <!-- Products In Stock Section -->
        <div class="stock-section">
            <h2 class="stock-title">In Stock Now</h2>
             <button id="stockViewToggle" class="layout-btn" onclick="toggleStockLayout()">
                <i data-lucide="layout-grid"></i>
                <span style="display: none;" id="stockToggleText">Carousel View</span>
            </button>
            <div class="stock-carousel">
                <div class="stock-track" id="stockTrack">
                    <div class="stock-item-placeholder"></div>
                </div>
            </div>
        </div>
    
    
    <!-- Product Panel Overlay -->
    <div class="panel-overlay" id="panelOverlay"></div>
    
    <!-- Product Panel -->
        <div class="product-panel" id="productPanel">
            <div class="panelholder">
                <div class="panel-handle" id="panelHandle"></div>
            </div>

            <div class="panel-content" id="panelContent">
            <!-- Dynamic content will be loaded here -->
            
            </div>
        </div>
    
    <!-- Success Message -->
    <div class="success-message" id="successMessage">
            <div class="success-message-title"></div>
            <div class="success-message-text"></div>
    </div>
    
    <!-- Footer -->
        <footer class="footer">

            <div class="footer-content">

                <div class="footer-section">
                    <h4 class="footer-heading">Customer Service</h4>
                    <ul class="footer-links">
                        <li><a href="javascript:void(0)" onclick="openInfoPanel('shipping')">Shipping & Returns</a></li>
                        <li><a href="javascript:void(0)" onclick="openInfoPanel('size-guide')">Size Guide</a></li>
                        <li><a href="javascript:void(0)" onclick="openInfoPanel('contact')">Contact Us</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h4 class="footer-heading">About Us</h4>
                    <ul class="footer-links">
                        <li><a href="javascript:void(0)" onclick="openInfoPanel('story')">Our Story</a></li>    
                        <li><a href="javascript:void(0)" onclick="openInfoPanel('sustainability')">Sustainability</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h4 class="footer-heading">Legal</h4>
                    <ul class="footer-links">
                        <li><a href="javascript:void(0)" onclick="openInfoPanel('privacy')">Privacy Policy</a></li>
                        <li><a href="javascript:void(0)" onclick="openInfoPanel('terms')">Terms of Service</a></li>
                    </ul>
                </div>

                <div class="footer-section">
                    <h4 class="footer-heading">Follow Us</h4>
                    <div class="social-links">
                        <!-- <a href="#" target="_blank" rel="noopener noreferrer" class="social-icon">
                            <svg viewbox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                        </a>  -->
                        <a href="https://www.instagram.com/clothingbymamag?igsh=aXgzYW1rZjZkbzli" target="" rel="noopener noreferrer" class="social-icon">
                            <svg viewbox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                            </svg>
                        </a> 
                        <a href="https://www.tiktok.com/@mamagclothing?lang=en&is_from_webapp=1&sender_device=mobile&sender_web_id=7539945428277724678" target="" rel="noopener noreferrer" class="social-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.6-4.12-1.31a8.13 8.13 0 01-1.89-1.45v6.07c.04 2.22-.52 4.49-1.95 6.2a7.1 7.1 0 01-5.1 2.8c-2.43.26-4.91-.56-6.6-2.33a7.03 7.03 0 01-2.11-4.7c-.12-2.14.73-4.3 2.3-5.78 1.52-1.43 3.65-2.09 5.71-1.84.05 1.34.01 2.68.01 4.02-.91-.25-1.94-.13-2.73.4-.95.64-1.38 1.83-1.12 2.94.19 1.13 1.15 2.11 2.28 2.29a3.02 3.02 0 003.22-2.26c.11-.41.11-.84.1-1.27V.02z"/>
                            </svg>
                        </a>
                    </div>
                </div>

            </div>

            <div class="footer-bottom">
                <p class="footer-copyright">© 2026 All Rights Reserved</p>
                <div class="footer-brand" id="footerBrand">MAMAG!</div>
            </div>

        </footer>


        <!-- Footer Info-Panel Overlay -->
        <div id="infoPanelOverlay" class="info-overlay" onclick="closeInfoPanel()"></div>

        <!-- Footer Info-Panel -->
        <div id="infoPanel" class="info-panel">
            <div class="panel-header">
                <div class="panel-handle"></div>
                <button class="close-panel-btn" onclick="closeInfoPanel()">&times;</button>
            </div>
            <div class="panel-body" id="infopanelContent"></div>
        </div>

    </div>

    <script src="assets/script.js?v=2"></script>
    <script src="https://js.paystack.co/v1/inline.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
</body>
</html>

