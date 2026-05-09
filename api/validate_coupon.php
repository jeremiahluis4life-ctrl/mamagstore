<?php
require_once '../includes/db.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['code']) || !isset($input['subtotal'])) {
    echo json_encode(['status' => 'error', 'message' => 'Missing required data']);
    exit;
}

$code = mysqli_real_escape_string($conn, strtoupper(trim($input['code'])));
$subtotal = (float)$input['subtotal'];

$sql = "SELECT * FROM mamag_discounts WHERE code = '$code' AND is_active = 1 LIMIT 1";
$result = mysqli_query($conn, $sql);
$coupon = mysqli_fetch_assoc($result);

// 1. Check if coupon exists
if (!$coupon) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid or expired coupon code']);
    exit;
}

// Check if code has hit the limit
if ($coupon['usage_limit'] > 0 && $coupon['times_used'] >= $coupon['usage_limit']) {
    echo json_encode(["status" => "error", "message" => "This code has reached its maximum usage limit."]);
    exit;
}

// 2. Check Minimum Spend Condition
if ($subtotal < (float)$coupon['min_spend']) {
    $formattedMin = number_format($coupon['min_spend'], 0, '.', ',');
    echo json_encode([
        'status' => 'error', 
        'message' => "Minimum spend not met. Spend ₦$formattedMin to use this."
    ]);
    exit;
}

// 3. Calculate Discount Amount
$discountAmount = 0;
$type = $coupon['discount_type'];
$val = (float)$coupon['discount_value'];

if ($type === 'percentage') {
    $discountAmount = ($val / 100) * $subtotal;
} else if ($type === 'flat') {
    $discountAmount = $val;
} else if ($type === 'free_delivery') {
    // If val is 0, it's total free delivery. If val > 0, it's a delivery discount cap.
    $discountAmount = ($val == 0) ? 0 : $val;
}

echo json_encode([
    'status' => 'success',
    'type' => $type,
    'amount' => (float)$discountAmount, // Ensure this is a number for JS Math
    'val' => (float)$val,
    'message' => 'Coupon applied successfully!',
    'min_order' => (float)($coupon['min_spend'] ?? 0) // Defaults to 0 if not set
]);
?>