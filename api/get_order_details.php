<?php
// api/get_order_details.php
include '../includes/db.php';

$ref = $_GET['ref'] ?? '';

if (empty($ref)) {
    echo json_encode(["status" => "error", "message" => "No reference provided"]);
    exit;
}

// Fetch the specific order. Adjust table/column names if they differ in your DB.
$sql = "SELECT total_paid, status, coupon_used, created_at FROM mamag_orders WHERE reference = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "s", $ref);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$order = mysqli_fetch_assoc($result);

if ($order) {
    echo json_encode([
        "status" => "success",
        "order" => [
            "total_paid" => $order['total_paid'],
            'coupon_used' => $order['coupon_used'],
            "status" => $order['status']
        ]
    ]);
} else {
    echo json_encode(["status" => "error", "message" => "Order not found"]);
}
?>