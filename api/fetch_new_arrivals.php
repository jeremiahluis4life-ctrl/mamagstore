<?php
include '../includes/db.php'; 
header('Content-Type: application/json');
ob_clean(); // Ensure no extra HTML leaks out

// 1. Get the primary product info from mamag_products
$query = "SELECT id, name, price, main_image FROM mamag_products WHERE product_type = 'arrival' ORDER BY id DESC LIMIT 200";
$result = mysqli_query($conn, $query);

$arrivals = [];

if ($result) {
    while($row = mysqli_fetch_assoc($result)) {
        $arrivals[] = [
            'id'    => $row['id'],
            'url'   => 'admin/' . $row['main_image'], // Using the main_image column
            'name'  => $row['name'],
            'price' => "₦" . number_format($row['price'])
        ];
    }
}

echo json_encode($arrivals);
exit;
?>