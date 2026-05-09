<?php
// admin/admin.php

// 1. Correct path to db.php (it is one level up from admin/)
require_once __DIR__ . '/../includes/db.php'; 


// 3. Security Check
if (!isset($_SESSION['admin_auth']) || $_SESSION['admin_auth'] !== true) {
    header("Location: adminlogin.php");
    exit();
}

// 4. Correct path to cleanup (it is inside the admin/api/ folder)
include __DIR__ . '/../api/cleanup_latest.php';
?>
<!doctype html>
<html lang="en" class="h-full">
 <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MAMAG Admin Dashboard</title>
  <link rel="stylesheet" href="assets/admin_dist.css?v=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&amp;display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Lobster+Two:ital,wght@0,400;0,700;1,400;1,700&family=Tomorrow:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">  
    <link href="https://fonts.googleapis.com/css2?family=Acme&display=swap" rel="stylesheet">

  <!-- <style>@view-transition { navigation: auto; }</style> -->
   <script src="https://unpkg.com/lucide@latest"></script>
  <script src="/_sdk/data_sdk.js" type="text/javascript"></script>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<link rel="icon" type="image/png" sizes="32x32" href="../assets/img/logo3.png">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" rel="stylesheet"/>
 </head>
 <body class="h-full" onload="initApp()">

<div class="h-full w-full flex">

    <!-- Sidebar -->
    <div id="sidebar" class="mamag-sidebar">
        <div class="sidebar-overlay"></div>
        
        <div class="sidebar-header" style="display: flex; align-items: center; justify-content: space-between;">
            <p class="sidebar-title">Admin Dashboard</p>
            <button class="collapse-toggle" onclick="toggleSidebar()">
                <svg id="toggle-icon" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
            </button>
        </div>

        <nav class="sidebar-nav">
            
            <a href="#" class="nav-link" data-page="orders">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                <span>Orders</span> 
            </a>

            <a href="#" class="nav-link active" data-page="overview">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                <span>Overview</span> 
            </a> 

            <a href="#" class="nav-link" data-page="products">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                <span>Products</span> 
            </a> 

            <a href="#" class="nav-link" data-page="feedback">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <span>Feedbacks</span> 
            </a>

            <a href="#" class="nav-link" data-page="requests">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
                </svg>
                <span>Requests</span> 
            </a>

            <a href="#" class="nav-link" data-page="discounts">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M13.414 2.086a2 2 0 011.414.586L22 10l-9 9-9.414-9.414a2 2 0 01-.586-1.414V4a2 2 0 012-2h4.586z"></path>
                </svg>
                <span>Discounts</span> 
            </a>

            <a href="#" class="nav-link" data-page="delivery">
                <i class="fa-solid fa-motorcycle"></i>
                <span>Delivery</span> 
            </a>

        </nav>
    </div>
   
    <!-- Main Content -->
    <div class="flex-1 overflow-auto w-full">    

        <div id="main-content" class="main-wrapper h-full">

            <!-- Overview Page -->
            <div id="overview-page" class="page-content  p-4 sm:p-6 relative lg:p-8">
            <div class="cont">
                <div class="max-w-7xl mx-auto">
                    
            <div class="mb-6 sm:mb-8 tophead">
                <div class="mb-6 sm:mb-8 tophead">
                    <h1 id="brand-name" class="logomob text-2xl font-bold text-black tracking-tight font-mamag ">MAMAG</h1>
                    <p class="text-black text-sm  font-medium tracking-wide pb-4">Luxury Fashion Dashboard</p>

                
                    <a href="#" class="nav-link discount_btn deli" data-page="delivery" style="position: absolute; top: 30px; right: 15px; background: black; border-radius: 100px; padding: 10px 20px;">
                        <span style="color: white;">Delivery</span>
                        <i class="fa-solid fa-motorcycle"></i>
                    </a>
                </div>
            </div>
            
            <!-- Stat Cards -->
            <div class="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8 site-content">
                <div class="stat-card rounded-xl shadow-lg p-6 bg-white" id="revenue-card">
                    <div class="flex items-center justify-between mb-4">
                        <div class="p-3 rounded-lg bg-blue-50" id="revenue-icon-bg">
                            <svg class="w-6 h-6 text-blue-600" id="revenue-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                    </div>
                    <p class="text-sm font-medium text-gray-500 mb-1" id="revenue-label">Total Revenue</p>
                    <p class="text-[20px] font-bold text-gray-900" id="revenue-value">₦0</p>
                </div>

                <div class="stat-card rounded-xl shadow-lg p-6 bg-white" id="income-card">
                    <div class="flex items-center justify-between mb-4">
                        <div class="p-3 rounded-lg bg-green-50" id="income-icon-bg">
                            <svg class="w-6 h-6 text-green-600" id="income-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                        </div>
                    </div>
                    <p class="text-sm font-medium text-gray-500 mb-1" id="income-label">Income Today</p>
                    <p class="text-[20px] font-bold text-gray-900" id="income-value">₦0</p>
                </div>

                <div class="stat-card footer-nav-link rounded-xl shadow-lg p-6 bg-white"  data-page="orders" id="orders-card">
                    <div class="flex items-center justify-between mb-4">
                        <div class="p-3 rounded-lg bg-purple-50" id="orders-icon-bg">
                            <svg class="w-6 h-6 text-purple-600" id="orders-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                            </svg>
                        </div>
                    </div>
                    <p class="text-sm font-medium text-gray-500 mb-1" id="orders-label">Orders Today</p>
                    <p class="text-[20px] font-bold text-gray-900" id="orders-value">0</p>
                </div>

                <div class="stat-card footer-nav-link rounded-xl shadow-lg p-6 bg-white"  data-page="orders" id="new-orders-card">
                    <div class="flex items-center justify-between mb-4">
                        <div class="p-3 rounded-lg bg-orange-50" id="new-orders-icon-bg">
                            <svg class="w-6 h-6 text-orange-600" id="new-orders-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                            </svg>
                        </div>
                    </div>
                    <p class="text-sm font-medium text-gray-500 mb-1" id="new-orders-label">New Orders Today</p>
                    <p class="text-[20px] font-bold text-gray-900" id="new-orders-value">0</p>
                </div>
            </div>
            
            <!-- Analytics Board -->
            <div class=" p-0 sm:p-8 relative overflow-hidden" id="analytics-board">
                <div class="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full -mr-32 -mt-32"></div>
                <div class="relative z-10">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <h3 class="text-xl sm:text-2xl font-bold tracking-tight" id="analytics-title">Sales Analytics</h3>
                <div class="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                    <button class="period-btn px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shadow-sm" data-period="week">Week</button> 
                    <button class="period-btn px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shadow-sm" data-period="month">Month</button> 
                    <button class="period-btn px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shadow-sm" data-period="year">Year</button>
                </div>
                </div><!-- Combined Summary Cards -->
                <div class="grid grid-cols-2 gap-4 sm:gap-6 mb-8">
                <div class="text-center p-5 rounded-xl border-1 border-dashed statbox" id="orders-summary">
                <p class="text-xs uppercase tracking-wider mb-2 opacity-60 " id="orders-chart-title">Orders </p>
                <span class="statval font-bold block" id="orders-progress-value">-</span>
                </div>
                <div class="text-center p-5 rounded-xl border-1 border-dashed statbox" id="revenue-summary">
                <p class="text-xs uppercase tracking-wider mb-2 opacity-60 " id="revenue-chart-title">Revenue </p>
                <span class="statval font-bold block" id="revenue-progress-value">-</span>
                </div>
                </div><!-- Combined Dual Bar Chart -->
                <div id="combinedChart" class="space-y-2"></div>
                </div>
            </div>
            </div>
            </div>
            </div>

            <!-- Products Page --> 
            <div id="products-page" class="page-content p-4 sm:p-6 lg:p-8 relative">
            <div class="max-w-7xl mx-auto">
                <div class="mb-6 sm:mb-8 tophead">
                    <h1 id="brand-name" class="logomob text-2xl font-bold text-black tracking-tight font-mamag ">MAMAG</h1>
                    <p class="text-black text-sm  font-medium tracking-wide pb-4">Luxury Fashion Dashboard</p>

                
                    <a href="#" class="nav-link discount_btn" data-page="discounts" style="position: absolute; top: 30px; right: 15px; background: black; border-radius: 100px; padding: 10px 20px;">
                        <span style="color: white;">Discounts</span>
                        <i class="fa-solid fa-tags"></i>
                    </a>
                </div>


            <div id="toast">Saved Successfully</div>

                <div class="app-shell site-content">
                <div id="refresh-indicator" class="pull-indicator">
                    <div class="sync-wrapper">
                        <div class="loader-circle" id="loaderCircle"></div>
                        <div class="checkmark-stem" id="checkmark"></div>
                    </div>
                </div>
                    <!-- <div class="main-nav">
                        <div id="nav-upload" class="nav-card active" onclick="switchView('upload')"><h3>Hub</h3></div>
                        <div id="nav-gallery" class="nav-card" onclick="switchView('gallery')"><h3>Gallery</h3></div>
                    </div> -->

                    <div id="view-upload" class="view-container ">
                        <div class="huboption" style="gap:15px;">
                            <div class="action-card" style="background:var(--surface); padding:35px 25px; border-radius:30px; cursor:pointer;" onclick="startFlow('latest')">
                                <span style="font-size:35px">✨</span>
                                <h2>Latest Updates</h2>
                                <p>Daily Updates</p>
                            </div>
                            <div class="action-card" style="background:var(--surface); padding:35px 25px; border-radius:30px; cursor:pointer;" onclick="startFlow('arrival')">
                                <span style="font-size:35px">📦</span>
                                <h2>New Arrivals</h2>
                                <p>New Goods</p>
                            </div>
                            <div class="action-card" style="background:var(--surface); padding:35px 25px; border-radius:30px; cursor:pointer;" onclick="startFlow('stock')">
                                <span style="font-size:35px">✅</span>
                                <h2>In Stock</h2>
                                <p>Available Stock</p>
                            </div>  
                            <div class="action-card" style="background:var(--surface); padding:35px 25px; border-radius:30px; cursor:pointer;" onclick="startAddonFlow()" >
                                <span style="font-size:35px">🧩</span>
                                <h2>Add On</h2>
                                <p>Other Products</p>
                            </div>                  
                        </div>
                    </div>

                    <div id="view-gallery" class="view-container active">
                        <div id="filterContainer" style="padding: 10px 20px; display: none; justify-content: flex-end;">
                            <button id="outOfStockFilter" class="btn btn-outline" onclick="toggleStockFilter()" style="font-size: 12px; border-radius: 50px; color: #ef4444; border-color: #ef4444;">
                                ⚠️ Show Out of Stock Only
                            </button>
                        </div>
                        <div class="section-header">
                            <div class="proname">
                                <h2>Latest Updates</h2>
                                <span id="latestCount">0 Items</span>    
                            </div>
                            
                            <button class="adpro" onclick="startFlow('latest')">+ Add</button>
                        </div>
                        <div class="latest-scroll" id="latestContainer"></div>

                        <div class="section-header" style="margin-top:40px;">
                            <div class="proname">
                                <h2>New Arrivals</h2>
                                <span id="arrivalCount">0 Bundles</span>
                            </div>
                            <button class="adpro" onclick="startFlow('arrival')">+ Add</button>
                            
                        </div>
                        <div class="arrivals-grid" id="arrivalsContainer"></div>

                        <div class="section-header" style="margin-top:40px;">
                            <div class="proname">
                                <h2>In Stock</h2>
                                <span id="stockCount">0 Bundles</span>
                            </div>
                            
                            <button class="adpro" onclick="startFlow('stock')">+ Add</button>
                        </div>
                        <div class="arrivals-grid" id="stockContainer"></div>
                        <div class="section-header" style="margin-top:40px;">
                            <div class="proname">
                                <h2>Add Ons</h2>
                                <span id="addonCount">0 Bundles</span>
                            </div>
                            <button class="adpro" onclick="startAddonFlow()">+ Add</button>
                            
                        </div>
                        <div class="arrivals-grid" id="addonContainer"></div>
                    </div>
                </div>

                <div class="full-modal" id="modal">
                    <div class="modal-nav">
                        <button onclick="closeModal()" style="border:none; background:none; font-weight:500;">Cancel</button>
                        <span id="modalTitle">Add Product</span>
                        <div style="width:40px"></div>
                    </div>
                    <div class="content-area" id="modalForm"></div>
                    <div style="padding:20px; border-top:1px solid #eee;" class="publish-product">
                        <button class="btn btn-black" onclick="finalPublish()">Publish to Store</button>
                    </div>
                </div>

                <div class="sheet-back" id="overlayb" onclick="closeSheetb()"></div>
                <div class="sheetb" id="sheetb">
                    <div class="panel-handle"></div> <div class="sheet-content"></div>
                    <div id="sheetViewMode"></div>
                    <div id="sheetEditMode" class="hidden"></div>
                </div>

            </div>
            </div>

            <!-- Orders Page -->
            <div id="orders-page" class="page-content active p-4 sm:p-6 lg:p-8">
                <div class="max-w-7xl mx-auto">
                <div class="mb-6 sm:mb-8 tophead">
                    <h1 id="brand-name" class="logomob text-2xl font-bold text-black tracking-tight font-mamag ">MAMAG</h1>
                    <p class="text-black text-sm  font-medium tracking-wide pb-4">Luxury Fashion Dashboard</p>
                    <div class="admin-logout-section">
                        <a href="logout.php" class="logout-btn">
                            <i data-lucide="log-out"></i>
                            <span>Sign Out</span>
                        </a>
                    </div>
                    <!-- <h2 class="text-3xl sm:text-4xl font-bold mb-2 tracking-tight" id="page-title">Overview</h2> -->
                </div>
                <div class="dashboard site-content">

                    <div class="order-top">
                        <h2 style="font-size: 22px; font-weight: 800;">Orders</h2>
                        <button onclick="copyAllNewOrdersSummary(this)" class="admin-copy-btn">
                            COPY ALL NEW ORDERS
                        </button>
                    </div>
                    <input type="text" id="orderSearchInput" onkeyup="renderData()" placeholder="Search name, ref, region or type..." class="orders_search shadow-lg" style="width:100%; padding:12px; border-radius:10px; border:1px solid #ddd; margin-bottom:15px;">


                    <div class="method-toggle-container" style="display: flex; gap: 8px; margin-bottom: 20px; padding: 0 5px;">
                        <button id="btn-filter-all" onclick="setMethodFilter('all')" 
                            style="flex: 1; padding: 10px; border-radius: 12px; border: 1px solid #ddd; background: #000; color: #fff; font-weight: 700; cursor: pointer; transition: 0.3s; font-size: 11px;">
                            ALL ORDERS
                        </button>
                        <button id="btn-filter-delivery" onclick="setMethodFilter('delivery')" 
                            style="flex: 1; padding: 10px; border-radius: 12px; border: 1px solid #ddd; background: #fff; color: #000; font-weight: 700; cursor: pointer; transition: 0.3s; font-size: 11px;">
                            DELIVERY
                        </button>
                        <button id="btn-filter-pickup" onclick="setMethodFilter('pickup')" 
                            style="flex: 1; padding: 10px; border-radius: 12px; border: 1px solid #ddd; background: #fff; color: #000; font-weight: 700; cursor: pointer; transition: 0.3s; font-size: 11px;">
                            PICKUP
                        </button>
                    </div>

                    <div class="grid-layout" id="order-cards"></div>


                    <div class="masledger" style="display: flex; align-items: baseline; justify-content: space-between; width: 100%;">
                        <h2 style="font-size: 22px; font-weight: 800; margin-bottom: 20px; margin-top: 40px;">Master Ledger</h2>  

                        <div class="table-controls" style="display: flex; gap: 15px; margin-bottom: 20px;">
                    </div>

                        <div class="custom-dropdown" id="statusDropdown" style="position: relative; font-family: inherit;">
                            <div class="dropdown-selected" onclick="toggleDropdown(this, event)" style="padding: 12px 20px; border-radius: 12px; border: 1px solid #ddd; background: #fff; gap: 10px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: 500; color: #333;">
                                <span id="selectedDisplay">All Processed</span>
                                <span style="font-size: 10px; transition: 0.3s;" id="dropdownArrow">▼</span>
                            </div>
                            
                            <div class="dropdown-options" id="dropdownOptions" style="display: none; position: absolute; top: calc(100% + 5px); left: -70px; width:200px; right: 0; background: #fff; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); z-index: 1000; overflow: hidden;">
                                <div class="option" onclick="selectOption('all', 'All Processed')" style="padding: 12px 20px; cursor: pointer; font-size: 14px; transition: 0.2s; border-bottom: 1px solid #f9f9f9;">All Processed</div>
                                <div class="option" onclick="selectOption('mailed', 'Dispatched & Mailed')" style="padding: 12px 20px; cursor: pointer; font-size: 14px; transition: 0.2s; border-bottom: 1px solid #f9f9f9;">Dispatched & Mailed</div>
                                <div class="option" onclick="selectOption('not_mailed', 'Dispatched & Not Mailed')" style="padding: 12px 20px; cursor: pointer; font-size: 14px; transition: 0.2s; border-bottom: 1px solid #f9f9f9;">Dispatched & Not Mailed</div>
                                <div class="option" onclick="selectOption('pickup', 'Collected (Pickup)')" style="padding: 12px 20px; cursor: pointer; font-size: 14px; transition: 0.2s;">Collected (Pickup)</div>
                            </div>
                            
                            <input type="hidden" id="orderStatusFilter" value="all">
                        </div>

                        <style>
                            .option:hover { background: #f4f4f4; color: #000; padding-left: 25px !important; }
                            .custom-dropdown.active #dropdownArrow { transform: rotate(180deg); }
                        </style>
                    </div>

                    <div class="table-wrap">
                        <table class="processed-table">
                            <thead>
                                <tr>
                                    <th style="padding:15px;">Ref</th>
                                    <th style="padding:15px;">Customer & Address</th>
                                    <th style="padding:15px;">Date</th><th style="padding:15px;">Amount</th>
                                    <th style="padding:15px;">Status</th>
                                    <th style="padding:15px;">Action</th>
                                </tr>
                            </thead>
                            <tbody id="processed-table-body"></tbody>
                        </table>
                    </div>
                </div>

                <div class="overlay" id="overlay" onclick="closeSheet()"></div>
                <div class="sheet" id="order-sheet">
                    <div id="manifest-content"></div>
                    <button onclick="closeSheet()" style="width:100%; padding:20px; border-radius:18px; border:none; background:var(--primary); color:white; font-weight:500; margin-top:20px; cursor:pointer;">Close Manifest</button>
                </div>
                </div>
            </div>

            <!-- Feedback Page -->
            <div id="feedback-page" class="page-content  p-4 sm:p-6 lg:p-8" >
                <div class="max-w-7xl mx-auto">
                    <div class="mb-6 sm:mb-8 tophead">
                            <h1 id="brand-name" class="logomob text-2xl font-bold text-black tracking-tight font-mamag ">MAMAG</h1>
                            <p class="text-black text-sm  font-medium tracking-wide pb-4">Luxury Fashion Dashboard</p>
                    </div>

                <div class="site-content">
                    <div class="feedback-header">
                        <h2 style="font-size: 24px; font-weight: 800;">Customer Reviews</h2>
                        <span style="color: #888; font-size: 13px;">Manage brand reputation</span>
                    </div>

                    <div class="feedback-table-container">
                        <table class="mamag-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Rating</th>
                                </tr>
                            </thead>
                            <tbody id="feedback-list">
                                </tbody>
                        </table>
                    </div>
                </div>

                <div id="admin-feedback-panel">
                    <div class="panel-overlay" onclick="closeFeedbackPanel()"></div>
                    <div class="panel-drawer">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;">
                            <h3 style="font-size: 20px; font-weight: 700;">Review Details</h3>
                            <button onclick="closeFeedbackPanel()" style="background:none; border:none; cursor:pointer;">
                                <i data-lucide="x" style="color: #000;"></i>
                            </button>
                        </div>
                        <div id="feedback-detail-body"></div>
                    </div>
                </div>
                
                </div>



                <div id="delete-modal" class="custom-modal-overlay">
                    <div class="custom-modal">
                        <h3 style="margin-bottom: 10px;">Remove Review?</h3>
                        <p style="font-size: 14px; color: #666;">This action cannot be undone.</p>
                        <div class="modal-btn-row">
                            <button class="modal-btn" onclick="hideDeleteModal()" style="background: #f5f5f5;">Cancel</button>
                            <button id="confirm-delete-btn" class="modal-btn" style="background: #000; color: #fff;">Delete</button>
                        </div>
                    </div>
                </div>
            
            </div>

            <!-- Requests Page -->
            <div id="requests-page" class="page-content  p-4 sm:p-6 lg:p-8" >
                <div class="max-w-7xl mx-auto">
                    <div class="mb-6 sm:mb-8 tophead">
                            <h1 id="brand-name" class="logomob text-2xl font-bold text-black tracking-tight font-mamag ">MAMAG</h1>
                            <p class="text-black text-sm  font-medium tracking-wide pb-4">Luxury Fashion Dashboard</p>
                    </div>
                </div>
                <div class="site-content">
                    <div class="requests-grid-container">
                        <div class="flex justify-between items-center mb-6">
                            <h2 class="text-lg font-bold uppercase tracking-widest">Requests</h2>
                        </div>

                        <div class="flex gap-2 mb-6 pb-2" id="requestFilterContainer">
                            <button onclick="filterRequests('all', this)" class="req-filter-btn active">ALL REQUESTS</button>
                            <button onclick="filterRequests('Pending', this)" class="req-filter-btn">NEW</button>
                            <button onclick="filterRequests('Accepted', this)" class="req-filter-btn">ACCEPTED</button>
                            <button onclick="filterRequests('Purchased', this)" class="req-filter-btn">PURCHASED</button>
                        </div>

                        <div id="adminRequestsList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <p class="text-gray-400 italic">Scanning for new requests...</p>
                        </div>
                    </div>
                    <div id="imagePopup" class="image-popup-overlay" onclick="closeImagePopup()">
                        <span class="close-popup">&times;</span>
                        <img id="popupImg" src="" alt="Full View">
                    </div>

                </div>
            </div>

            <!-- Discounts Page -->
            <div id="discounts-page" class="page-content  p-4 sm:p-6 lg:p-8" >
                <div class="max-w-7xl mx-auto">
                    <div class="mb-6 sm:mb-8 tophead">
                            <h1 id="brand-name" class="logomob text-2xl font-bold text-black tracking-tight font-mamag ">MAMAG</h1>
                            <p class="text-black text-sm  font-medium tracking-wide pb-4">Luxury Fashion Dashboard</p>
                    </div>

                    <div class="site-content">
                        <div class="discount-admin-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                            <h3 style="font-weight: 800; font-size: 24px;">Manage Discounts</h3>
                            <button onclick="openDiscountPanel()" class="mamag-btn-black" style="padding: 12px; border-radius: 12px; background: #000; color: #fff; border: none; font-weight: 700; cursor: pointer;">
                                + Create New Code
                            </button>
                        </div>

                        <div id="discountList" class="discount-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;"></div>
                    </div>

                    <div id="panelOverlay" onclick="closeDiscountPanel()" style="display:none; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 999; backdrop-filter: blur(4px);"></div>

                    <div id="discountPanel" class="action-panel">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                            <h3 id="panelTitle" style="margin: 0; font-weight: 800; font-size: 20px;">Add Discount Code</h3>
                            <button onclick="closeDiscountPanel()" class="close_discount">&times;</button>
                        </div>

                        <form id="discountForm">
                            <input type="hidden" id="discountId">
                            
                            <label class="field-label">COUPON CODE</label>
                            <input type="text" id="couponCode" placeholder="MAMAGBLESS" class="mamag-input" required>

                            <label class="field-label">SELECT TYPE</label>
                            <div class="custom-dropdown-container">
                                <div class="type-option active" data-value="flat" onclick="selectType(this)">
                                    <span>Fixed Amount (₦)</span>
                                </div>
                                <div class="type-option" data-value="percentage" onclick="selectType(this)">
                                    <span>Percentage (%)</span>
                                </div>
                                <div class="type-option" data-value="free_delivery" onclick="selectType(this)">
                                    <span>Free Delivery</span>
                                </div>
                                <input type="hidden" id="discountType" value="flat">
                            </div>

                            <div id="valueWrapper">
                                <label class="field-label">DEDUCTION VALUE</label>
                                <div style="position: relative; display: flex; align-items: center; margin-bottom: 20px;">
                                    <span id="unitSymbol" style="position: absolute; left: 15px; font-weight: 800; color: #000; font-size: 16px;">₦</span>
                                    <input type="text" id="discountValue" placeholder="5,000" class="mamag-input" style="padding-left: 35px; margin-bottom: 0;">
                                </div>
                            </div>

                            <label class="field-label">MINIMUM SPEND REQUIREMENT (₦)</label>
                            <input type="text" id="minSpend" placeholder="0" class="mamag-input">

                            <label class="field-label">USAGE LIMIT</label>
                            <input type="number" id="usageLimit" placeholder="0 for Unlimited" class="mamag-input">

                            <div class="panel-actions" style="margin-top: 40px;">
                                <button type="submit" style="width: 100%; padding: 16px; border-radius: 14px; border: none; background: #000; color: #fff; font-weight: 700; cursor: pointer; font-size: 16px;">Save Discount</button>
                            </div>
                        </form>
                    </div>

            
                </div>
            </div>

            <!-- Delivery Rates Page -->
            <div id="delivery-page" class="page-content  p-4 sm:p-6 lg:p-8" >

                <div class="max-w-7xl mx-auto">
                    <div class="mb-6 sm:mb-8 tophead">
                            <h1 id="brand-name" class="logomob text-2xl font-bold text-black tracking-tight font-mamag ">MAMAG</h1>
                            <p class="text-black text-sm  font-medium tracking-wide pb-4">Luxury Fashion Dashboard</p>
                    </div>
                </div>    

                <div class="site-content">
                    <div class="feedback-header">
                        <h2 style="font-size: 24px; font-weight: 800;">Delivery Rates</h2>
                        <span style="color: #888; font-size: 13px;">Delivery region and rates</span>
                    </div>

                    <div class="mamag-settings-card">
                        <div class="settings-header">
                            <h2 class="settings-title">Logistics & Delivery</h2>
                            <p class="settings-subtitle">Manage regional shipping rates by state</p>
                        </div>

                        <div class="delivery-management-grid">
                            <div class="mamag-dropdown-container">
                                <label class="dropdown-label">1. Select State</label>
                                <div class="custom-dropdown" id="regionDropdown">
                                    <div class="dropdown-selected" onclick="toggleDropdown('stateList', event)">
                                        <span id="selectedStateText">Choose State...</span>
                                        <i class="chevron-icon"></i>
                                    </div>
                                    <div class="dropdown-options" id="stateList" style="display: none;">
                                        <div class="option" onclick="selectState('Lagos')">Lagos</div>
                                        <div class="option" onclick="selectState('FCT - Abuja')">FCT - Abuja</div>
                                        <div class="option" onclick="selectState('Abia')">Abia</div>
                                        <div class="option" onclick="selectState('Adamawa')">Adamawa</div>
                                        <div class="option" onclick="selectState('Akwa Ibom')">Akwa Ibom</div>
                                        <div class="option" onclick="selectState('Anambra')">Anambra</div>
                                        <div class="option" onclick="selectState('Bauchi')">Bauchi</div>
                                        <div class="option" onclick="selectState('Bayelsa')">Bayelsa</div>
                                        <div class="option" onclick="selectState('Benue')">Benue</div>
                                        <div class="option" onclick="selectState('Borno')">Borno</div>
                                        <div class="option" onclick="selectState('Cross River')">Cross River</div>
                                        <div class="option" onclick="selectState('Delta')">Delta</div>
                                        <div class="option" onclick="selectState('Ebonyi')">Ebonyi</div>
                                        <div class="option" onclick="selectState('Edo')">Edo</div>
                                        <div class="option" onclick="selectState('Ekiti')">Ekiti</div>
                                        <div class="option" onclick="selectState('Enugu')">Enugu</div>
                                        <div class="option" onclick="selectState('Gombe')">Gombe</div>
                                        <div class="option" onclick="selectState('Imo')">Imo</div>
                                        <div class="option" onclick="selectState('Jigawa')">Jigawa</div>
                                        <div class="option" onclick="selectState('Kaduna')">Kaduna</div>
                                        <div class="option" onclick="selectState('Kano')">Kano</div>
                                        <div class="option" onclick="selectState('Katsina')">Katsina</div>
                                        <div class="option" onclick="selectState('Kebbi')">Kebbi</div>
                                        <div class="option" onclick="selectState('Kogi')">Kogi</div>
                                        <div class="option" onclick="selectState('Kwara')">Kwara</div>
                                        <div class="option" onclick="selectState('Nasarawa')">Nasarawa</div>
                                        <div class="option" onclick="selectState('Niger')">Niger</div>
                                        <div class="option" onclick="selectState('Ogun')">Ogun</div>
                                        <div class="option" onclick="selectState('Ondo')">Ondo</div>
                                        <div class="option" onclick="selectState('Osun')">Osun</div>
                                        <div class="option" onclick="selectState('Oyo')">Oyo</div>
                                        <div class="option" onclick="selectState('Plateau')">Plateau</div>
                                        <div class="option" onclick="selectState('Rivers')">Rivers</div>
                                        <div class="option" onclick="selectState('Sokoto')">Sokoto</div>
                                        <div class="option" onclick="selectState('Taraba')">Taraba</div>
                                        <div class="option" onclick="selectState('Yobe')">Yobe</div>
                                        <div class="option" onclick="selectState('Zamfara')">Zamfara</div>
                                    </div>
                                </div>
                            </div>

                            <div id="regionAddForm" class="region-add-panel disabled">
                                <label class="dropdown-label">2. Add Region to <span id="targetStateName">...</span></label>
                                <div class="mamag-inline-form">
                                    <input type="text" id="shipRegion" placeholder="Region Name (e.g. Lekki)" required>
                                    <input type="number" id="shipPrice" placeholder="Price (₦)" required>
                                    <button type="button" onclick="saveNewRegion()" class="mamag-btn-black">Add</button>
                                </div>
                            </div>
                        </div>

                        <div class="table-responsive" style="margin-top: 30px; overflow: auto; border-radius: 24px;">
                            <table class="mamag-admin-table">
                                <thead>
                                    <tr>
                                        <th>Location Details</th>
                                        <th>Rate</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody id="deliveryRateTable"></tbody>
                            </table>
                        </div>
                    </div>
                    
                </div>

            
            </div>

        </div>

        <div id="toast-container" class="toast-msg"></div>

    </div>
    
    <!-- Mobile Footer Navigation -->
    <nav id="mobile-footer" class="fixed bottom-0 left-0 right-0 lg:hidden z-50 " style="color: white;">
        <div class="grid grid-cols-5 h-16 mobilefooter">

            <a href="#" class="footer-nav-link active flex flex-col items-center justify-center" data-page="overview">
                <svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewbox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
                <span class="text-xs font-medium">Overview</span> 
            </a> 

            <a href="#" class="footer-nav-link flex flex-col items-center justify-center" data-page="feedback">
                <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                </svg>
                <span class="text-xs font-medium">Feedbacks</span> 
            </a>

            <a href="#" class="footer-nav-link flex flex-col items-center justify-center relative" data-page="requests">
                    <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path>
                    </svg>
                    <span class="request-badge hidden absolute top-1 right-4 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                        0
                    </span>
                <span class="text-xs font-medium">Requests</span> 
            </a>

            <a href="#" class="footer-nav-link flex flex-col items-center justify-center" data-page="products">
                <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewbox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                </svg>
                <span class="text-xs font-medium">Products</span> 
            </a>

            <a href="#" class="footer-nav-link flex flex-col items-center justify-center relative" data-page="orders">
                <svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewbox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <span class="text-xs font-medium">Orders</span>
                <span id="order-badge" class="hidden absolute top-1 right-4 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                    0
                </span>
            </a>

        </div>
    </nav>
</div>

<script src="assets/admin.js?v=1.0"></script>
<script>lucide.createIcons();</script>
</body>
</html>