<?php
// includes/verify_payment.php
header('Content-Type: application/json');
require_once 'db_connection.php';

$ref = $_GET['reference'] ?? '';
if (!$ref) {
    echo json_encode(['status' => 'error', 'message' => 'No reference']);
    exit;
}

// 1. Fetch current order details
// Note: Ensure your table name is 'orders' or 'pending_orders' based on your save logic
$stmt = $conn->prepare("SELECT status, email, total_amount, delivery_address FROM orders WHERE reference = ?");
$stmt->bind_param("s", $ref);
$stmt->execute();
$order = $stmt->get_result()->fetch_assoc();

if (!$order) {
    echo json_encode(['status' => 'error', 'message' => 'Order not found']);
    exit;
}

// 2. If DB already says success, return immediately
if ($order['status'] === 'success' || $order['status'] === 'completed') {
    echo json_encode([
        'status' => 'success', 
        'message' => 'Already processed',
        'email' => $order['email'],
        'amount' => $order['total_amount'],
        'address' => $order['delivery_address']
    ]);
    exit;
}

// 3. Verify with Paystack API
$url = "https://api.paystack.co/transaction/verify/" . rawurlencode($ref);
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer sk_live_24e268cd0cac1e62259d6e079368e80a2af68611", // Using your live key
    "Cache-Control: no-cache",
]);
$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);

if ($result && $result['status'] && $result['data']['status'] === 'success') {
    
    // --- CRITICAL SECURITY CHECK ---
    // Verify that the amount paid to Paystack matches your database amount exactly
    // Paystack returns amount in kobo, so we multiply your DB amount by 100
    $expectedAmount = round($order['total_amount'] * 100);
    $actualAmount = $result['data']['amount'];

    if ($actualAmount >= $expectedAmount) {
        // SUCCESS: Update DB status
        $update = $conn->prepare("UPDATE orders SET status = 'success' WHERE reference = ?");
        $update->bind_param("s", $ref);
        $update->execute();
        
        echo json_encode([
            'status' => 'success',
            'email' => $order['email'],
            'amount' => $order['total_amount'],
            'address' => $order['delivery_address']
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Amount mismatch']);
    }
} else {
    // Return pending so the frontend knows to keep the checkout form open
    echo json_encode(['status' => 'pending']);
}