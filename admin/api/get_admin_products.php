<?php
require_once '../../includes/db.php';
header('Content-Type: application/json');

$sql = "
    (SELECT id, name, price, main_image as image, stock, 'main' as item_type, created_at 
     FROM mamag_products)
    UNION
    (SELECT id, name, price, image, stock, 'addon' as item_type, created_at 
     FROM mamag_addons)
    ORDER BY created_at DESC";

$result = mysqli_query($conn, $sql);
$all_items = [];

while ($row = mysqli_fetch_assoc($result)) {
    $all_items[] = $row;
}

echo json_encode(["status" => "success", "items" => $all_items]);
?>