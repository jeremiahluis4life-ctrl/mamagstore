<?php
error_reporting(0); 
ini_set('display_errors', 0);
require_once '../../includes/db.php';
header('Content-Type: application/json');

try {
    if (!$conn) { throw new Exception("Database connection failed"); }

    // Using user_email as per your database structure
    $query = "SELECT id, full_name, user_email, email_sent, phone, reference, items, total_amount, total_paid, delivery_fee, coupon_used, method, address, region, status, created_at FROM mamag_orders ORDER BY created_at DESC";
    
    $result = mysqli_query($conn, $query);

    if (!$result) { throw new Exception(mysqli_error($conn)); }

    $orders = [];
    while($row = mysqli_fetch_assoc($result)) {
        // Decode the JSON items column
        $row['items'] = json_decode($row['items'], true);

        // Ensure email_sent is treated as a number
        $row['email_sent'] = isset($row['email_sent']) ? (int)$row['email_sent'] : 0;
        
        // Map user_email to email so the JavaScript remains simple
        $row['email'] = isset($row['user_email']) ? trim($row['user_email']) : 'No Email Provided';
        
        $orders[] = $row;
    }

    echo json_encode($orders);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>