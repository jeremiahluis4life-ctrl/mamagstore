<?php
// includes/create_pending_order.php
header('Content-Type: application/json');

// Ensure this path is correct. If create_pending_order is in 'includes', 
// and db_connection is also in 'includes', this is correct.
include 'db_connection.php'; 

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['reference'])) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid data']);
    exit;
}

$ref = $data['reference'];
$email = $data['email'] ?? 'guest';
$amount = $data['amount'];
$items = $data['items'];
$address = $data['address'];
$phone = $data['phone'];
$status = 'pending';

try {
    // 1. Check for duplicate reference
    $check = $conn->prepare("SELECT id FROM mamag_orders WHERE reference = ?");
    $check->bind_param("s", $ref);
    $check->execute();
    if ($check->get_result()->num_rows > 0) {
        echo json_encode(['status' => 'exists']);
        exit;
    }

    // 2. Prepare Items
    $items_json = is_array($items) ? json_encode($items) : $items;

    // 3. SQL Statement (7 Placeholders)
    $stmt = $conn->prepare("INSERT INTO mamag_orders 
        (reference, user_email, total_amount, items, address, phone, status, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())");

    // 4. BIND_PARAM FIX: Added an extra 's' for the status variable.
    // Total 7 characters: ssdssss (s=ref, s=email, d=amount, s=items, s=address, s=phone, s=status)
    $stmt->bind_param("ssdssss", $ref, $email, $amount, $items_json, $address, $phone, $status);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success']);
    } else {
        throw new Exception($stmt->error);
    }
} catch (Exception $e) {
    // This sends the actual error back to your console so you can see why it failed
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
