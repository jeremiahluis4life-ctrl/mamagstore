<?php
// includes/create_pending_order.php
header('Content-Type: application/json');
require_once 'db_connection.php'; // Ensure this points to your actual connection file

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['reference'])) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid data']);
    exit;
}

$ref = $data['reference'];
$email = $data['email'];
$amount = $data['amount'];
$items = $data['items'];
$address = $data['address'];
$phone = $data['phone'];
$status = 'pending';

try {
    // Check if order already exists to avoid duplicates on retry
    $check = $conn->prepare("SELECT id FROM orders WHERE reference = ?");
    $check->bind_param("s", $ref);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
        echo json_encode(['status' => 'exists']);
        exit;
    }

    $stmt = $conn->prepare("INSERT INTO orders (reference, email, total_amount, items_json, delivery_address, phone, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())");
    $stmt->bind_param("ssdssss", $ref, $email, $amount, $items, $address, $phone, $status);
    
    if ($stmt->execute()) {
        echo json_encode(['status' => 'success']);
    } else {
        throw new Exception($stmt->error);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}