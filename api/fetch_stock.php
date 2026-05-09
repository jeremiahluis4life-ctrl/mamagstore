<?php
include '../includes/db.php'; 
header('Content-Type: application/json');
ob_clean(); // Ensure no extra HTML leaks out

// 1. Updated query to include the 'category' column
$query = "SELECT id, name, category, price, main_image FROM mamag_products WHERE product_type = 'stock' ORDER BY id DESC LIMIT 15";
$result = mysqli_query($conn, $query);

$arrivals = [];

if ($result) {
    while($row = mysqli_fetch_assoc($result)) {
        $arrivals[] = [
            'id'       => $row['id'],
            'url'      => 'admin/' . $row['main_image'], // Path to the image
            'name'     => $row['name'],
            'category' => $row['category'] ?? 'General', // Include the category (defaults to General if null)
            'price'    => "₦" . number_format($row['price'])
        ];
    }
}

// Send the clean JSON response
echo json_encode($arrivals);
exit;
?>