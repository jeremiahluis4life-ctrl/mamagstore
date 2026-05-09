<?php
include '../includes/db.php';
header('Content-Type: application/json');

// Query the dedicated add-ons table
$sql = "SELECT id, name, price, stock, image FROM mamag_addons WHERE stock > 0 LIMIT 10";

$res = mysqli_query($conn, $sql);
$addons = [];

if ($res) {
    while ($row = mysqli_fetch_assoc($res)) {
        // Clean image path and format price for JS
        $row['price'] = (float)$row['price'];
        $row['image'] = 'admin/' . ltrim($row['image'], '/');
        $addons[] = $row;
    }
}

// Fallback: If mamag_addons is empty, pull from products as a backup
if (empty($addons)) {
    $fallbackSql = "SELECT id, name, price, stock, image FROM mamag_products WHERE stock > 0 LIMIT 5";
    $fallbackRes = mysqli_query($conn, $fallbackSql);
    while ($row = mysqli_fetch_assoc($fallbackRes)) {
        $row['price'] = (float)$row['price'];
        $row['image'] = 'admin/' . ltrim($row['image'], '/');
        $addons[] = $row;
    }
}

echo json_encode($addons);