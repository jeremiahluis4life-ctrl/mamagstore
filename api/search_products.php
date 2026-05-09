<?php
include '../includes/db.php'; 
header('Content-Type: application/json');
// error_reporting(0); // Turn this off during debugging to see errors!

$query = isset($_GET['q']) ? mysqli_real_escape_string($conn, $_GET['q']) : '';

if ($query !== '') {
    $sql = "
        (SELECT id, name, price, main_image as image, video_path, stock, sizes, 'main' as item_source 
         FROM mamag_products 
         WHERE name LIKE '%$query%' OR product_type LIKE '%$query%')
        UNION
        (SELECT id, name, price, image, NULL as video_path, stock, sizes, 'sub' as item_source 
         FROM mamag_subs 
         WHERE name LIKE '%$query%')
        LIMIT 30";
    
    $result = mysqli_query($conn, $sql);
    $products = [];

    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $productId = $row['id'];
            $source = $row['item_source'];
            
            $size_stocks = [];
            $stock_sql = "SELECT size_name, stock_count 
                          FROM product_size_stock 
                          WHERE product_id = '$productId' 
                          AND item_type = '$source'";
            
            $stock_res = mysqli_query($conn, $stock_sql);
            while ($st = mysqli_fetch_assoc($stock_res)) {
                $size_stocks[$st['size_name']] = (int)$st['stock_count'];
            }

            $row['sizes'] = !empty($row['sizes']) ? array_map('trim', explode(',', $row['sizes'])) : [];
            $row['size_stocks'] = $size_stocks;
            
            $products[] = $row;
        }
        echo json_encode(['status' => 'success', 'results' => $products]);
    } else {
        echo json_encode(['status' => 'error', 'message' => mysqli_error($conn)]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'No query provided']);
}
?>