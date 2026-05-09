<?php
require_once '../../includes/db.php';
header('Content-Type: application/json');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

$updates = [];

/**
 * Fetches the size-specific stock breakdown for a given item.
 */
function getSizeStocks($conn, $id, $type) {
    $sizes = [];
    $query = "SELECT size_name, stock_count FROM product_size_stock WHERE product_id = ? AND item_type = ?";
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, "is", $id, $type);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    while ($row = mysqli_fetch_assoc($result)) {
        $sizes[$row['size_name']] = (int)$row['stock_count'];
    }
    return $sizes;
}

// 1. Main Products
$res1 = mysqli_query($conn, "SELECT id, stock FROM mamag_products");
while($row = mysqli_fetch_assoc($res1)) {
    $id = (int)$row['id'];
    $updates[] = [
        'id' => $id, 
        'uid' => "main-$id", 
        'stock' => (int)$row['stock'], 
        'type' => 'main',
        'size_stocks' => getSizeStocks($conn, $id, 'main')
    ];
}

// 2. Add-ons (Accessories)
// We explicitly set 'type' => 'addon' here to match your JS logic
$res3 = mysqli_query($conn, "SELECT id, stock FROM mamag_addons");
while($row = mysqli_fetch_assoc($res3)) {
    $id = (int)$row['id'];
    $updates[] = [
        'id' => $id, 
        'uid' => "addon-$id", 
        'stock' => (int)$row['stock'], 
        'type' => 'addon', // This bridges the gap with your JS filter
        'size_stocks' => null 
    ];
}

// 3. Sub Products
$res2 = mysqli_query($conn, "SELECT id, stock FROM mamag_subs");
while($row = mysqli_fetch_assoc($res2)) {
    $id = (int)$row['id'];
    $updates[] = [
        'id' => $id, 
        'uid' => "sub-$id", 
        'stock' => (int)$row['stock'], 
        'type' => 'sub',
        'size_stocks' => getSizeStocks($conn, $id, 'sub')
    ];
}

echo json_encode($updates);
exit;