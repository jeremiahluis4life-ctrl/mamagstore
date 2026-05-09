<?php
// 1. Prevent any potential output before JSON
ob_start();
error_reporting(0); // Hide warnings that break JSON

// 2. Database Connection
require_once '../../includes/db.php';

// 3. Clear any buffer captured so far
ob_clean();
header('Content-Type: application/json');

// Get JSON Input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['status' => 'error', 'message' => 'No data received']);
    exit;
}

// Extract and Sanitize Inputs
$id           = !empty($input['id']) ? (int)$input['id'] : null;
$code         = mysqli_real_escape_string($conn, strtoupper(trim($input['code'])));
$type         = mysqli_real_escape_string($conn, $input['type']);
$value        = (float)$input['value'];
$min_spend    = (float)$input['min_spend'];
$usage_limit  = isset($input['usage_limit']) ? (int)$input['usage_limit'] : 0; // Added usage_limit

if (empty($code)) {
    echo json_encode(['status' => 'error', 'message' => 'Coupon code is required']);
    exit;
}

if ($id) {
    // UPDATE existing discount
    $sql = "UPDATE mamag_discounts 
            SET code = '$code', 
                discount_type = '$type', 
                discount_value = '$value', 
                min_spend = '$min_spend',
                usage_limit = $usage_limit 
            WHERE id = $id";
} else {
    // Check if code already exists for NEW records
    $check = mysqli_query($conn, "SELECT id FROM mamag_discounts WHERE code = '$code'");
    if (mysqli_num_rows($check) > 0) {
        echo json_encode(['status' => 'error', 'message' => 'This code already exists']);
        exit;
    }
    
    // INSERT new discount (times_used defaults to 0 via DB schema)
    $sql = "INSERT INTO mamag_discounts (code, discount_type, discount_value, min_spend, usage_limit, is_active) 
            VALUES ('$code', '$type', '$value', '$min_spend', $usage_limit, 1)";
}

if (mysqli_query($conn, $sql)) {
    // 4. Force a clean exit with ONLY the JSON string
    echo json_encode(['status' => 'success']);
    ob_end_flush();
    die(); 
} else {
    echo json_encode(['status' => 'error', 'message' => mysqli_error($conn)]);
    ob_end_flush();
    die();
}