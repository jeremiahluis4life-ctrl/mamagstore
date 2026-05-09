<?php
require_once '../../includes/db.php';
header('Content-Type: application/json');

// Optional: Remove auth check if you want the customer site to use this same file
if (!isset($_SESSION['admin_auth'])) {
    // If this is used by the public site, you might want to remove this block
}

$sql = "SELECT * FROM mamag_products ORDER BY id DESC";

$result = mysqli_query($conn, $sql);
$products = [];

while($row = mysqli_fetch_assoc($result)) {
    $pid = $row['id'];
    
    // 1. Fetch Size-Specific Stock for Main Product
    $size_stock_sql = "SELECT size_name, stock_count FROM product_size_stock WHERE product_id = '$pid' AND item_type = 'main'";
    $size_res = mysqli_query($conn, $size_stock_sql);
    $main_size_stocks = [];
    while($sz = mysqli_fetch_assoc($size_res)) {
        $main_size_stocks[$sz['size_name']] = (int)$sz['stock_count'];
    }
    $row['size_stocks'] = $main_size_stocks;

    // 2. Fetch Sub Products
    $sub_sql = "SELECT * FROM mamag_subs WHERE parent_id = '$pid'";
    $sub_res = mysqli_query($conn, $sub_sql);
    $subs = [];
    while($s = mysqli_fetch_assoc($sub_res)) {
        $sid = $s['id'];
        
        // 3. Fetch Size-Specific Stock for each Sub Product
        $sub_size_sql = "SELECT size_name, stock_count FROM product_size_stock WHERE product_id = '$sid' AND item_type = 'sub'";
        $sub_size_res = mysqli_query($conn, $sub_size_sql);
        $sub_size_stocks = [];
        while($ssz = mysqli_fetch_assoc($sub_size_res)) {
            $sub_size_stocks[$ssz['size_name']] = (int)$ssz['stock_count'];
        }
        $s['size_stocks'] = $sub_size_stocks;
        $subs[] = $s;
    }

    $row['subs'] = $subs;
    
    // Map database names to JS expectations
    $row['type'] = $row['product_type']; 
    $row['image'] = $row['main_image'];
    
    $products[] = $row;
}

// --- 2. FETCH ADD-ONS ---
$addon_sql = "SELECT * FROM mamag_addons ORDER BY id DESC";
$addon_result = mysqli_query($conn, $addon_sql);

while($addon = mysqli_fetch_assoc($addon_result)) {
    // We force these values so the JavaScript gallery recognizes them
    $addon['type'] = 'addon'; 
    $addon['product_type'] = 'addon';
    
    // Addons usually don't have subs or size stocks, so we provide defaults to prevent JS crashes
    $addon['subs'] = [];
    $addon['size_stocks'] = null;
    
    // Ensure the image field matches what the gallery expects (p.image)
    // Based on your DB, the column is already called 'image'
    
    $products[] = $addon;
}

echo json_encode($products);
?>