<?php
include '../includes/db.php';
header('Content-Type: application/json');

if (!isset($_GET['id'])) {
    echo json_encode(['status' => 'error', 'message' => 'No ID provided']);
    exit;
}

$id = mysqli_real_escape_string($conn, $_GET['id']);

/**
 * Helper function to fetch size-specific stocks
 */
function getSizeStocks($conn, $itemId, $type) {
    $sql = "SELECT size_name, stock_count FROM product_size_stock WHERE product_id = '$itemId' AND item_type = '$type'";
    $res = mysqli_query($conn, $sql);
    $stocks = [];
    if ($res) {
        while($row = mysqli_fetch_assoc($res)) {
            $stocks[$row['size_name']] = (int)$row['stock_count'];
        }
    }
    return $stocks;
}

// 1. Try to find the product in the MAIN table
$product_query = mysqli_query($conn, "SELECT * FROM mamag_products WHERE id = '$id' LIMIT 1");
$product = mysqli_fetch_assoc($product_query);

// 2. If NOT found in main, it might be a SUB product ID. Find the Parent.
if (!$product) {
    $sub_lookup = mysqli_query($conn, "SELECT parent_id FROM mamag_subs WHERE id = '$id' LIMIT 1");
    $sub_data = mysqli_fetch_assoc($sub_lookup);
    
    if ($sub_data) {
        $parent_id = $sub_data['parent_id'];
        $product_query = mysqli_query($conn, "SELECT * FROM mamag_products WHERE id = '$parent_id' LIMIT 1");
        $product = mysqli_fetch_assoc($product_query);
    }
}

// 3. Final Check
if (!$product) {
    echo json_encode(['status' => 'error', 'message' => 'Product not found']);
    exit;
}

$main_id = $product['id'];

// 4. Fetch all SUB-PRODUCTS for this parent
$sub_query = mysqli_query($conn, "SELECT id, name, price, stock, sizes, image FROM mamag_subs WHERE parent_id = '$main_id'");
$subs = [];
while ($row = mysqli_fetch_assoc($sub_query)) {
    $subs[] = [
        'id'          => $row['id'],
        'name'        => $row['name'],
        'price'       => (float)$row['price'], 
        'stock'       => (int)$row['stock'],
        'sizes'       => !empty($row['sizes']) ? array_map('trim', explode(',', $row['sizes'])) : [],
        'image'       => 'admin/' . ltrim($row['image'], '/'),
        'size_stocks' => getSizeStocks($conn, $row['id'], 'sub')
    ];
}


// 5. Fetch ADD-ONS
$addon_query = mysqli_query($conn, "SELECT id, name, price, image, stock FROM mamag_addons WHERE stock > 0 LIMIT 10");
$addons = [];
while ($aRow = mysqli_fetch_assoc($addon_query)) {
    $addons[] = [
        'id'    => $aRow['id'],
        'name'  => $aRow['name'],
        'price' => (float)$aRow['price'],
        'image' => 'admin/' . ltrim($aRow['image'], '/'),
        'stock' => (int)$aRow['stock']
    ];
}

$mainMedia = !empty($product['video_path']) ? 'admin/' . ltrim($product['video_path'], '/') : 'admin/' . ltrim($product['main_image'], '/');

echo json_encode([
    'status'      => 'success',
    'id'          => $product['id'],
    'name'        => $product['name'],
    'category'    => $product['category'] ?? '',
    'price'       => (float)$product['price'],
    'stock'       => (int)$product['stock'],
    'sizes'       => !empty($product['sizes']) ? array_map('trim', explode(',', $product['sizes'])) : [],
    'size_stocks' => getSizeStocks($conn, $product['id'], 'main'),
    'main_media'  => $mainMedia,
    'subs'        => $subs,
    'addons'      => $addons
]);