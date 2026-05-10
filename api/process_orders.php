<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

include '../includes/db.php'; 
require_once __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

ob_clean(); 
header('Content-Type: application/json');

$paystack_secret_key = $_ENV['PAYSTACK_SECRET_KEY']; 

if (empty($paystack_secret_key)) {
    echo json_encode(['status' => 'error', 'message' => 'System Error: Secret Key not loaded']);
    exit;
}

$input = file_get_contents('php://input');
$raw_data = json_decode($input, true);

if (!$raw_data) {
    echo json_encode(['status' => 'error', 'message' => 'No data received']);
    exit;
}

/**
 * 1. UNIFIED DATA PARSING
 */
$isWebhook = isset($_SERVER['HTTP_X_PAYSTACK_SIGNATURE']);

if ($isWebhook) {
    $sig = $_SERVER['HTTP_X_PAYSTACK_SIGNATURE'];
    if ($sig !== hash_hmac('sha512', $input, $paystack_secret_key)) {
        exit; 
    }

    if ($raw_data['event'] !== 'charge.success') exit;

    $reference = mysqli_real_escape_string($conn, $raw_data['data']['reference']);
    $metadata = $raw_data['data']['metadata']['custom_fields'] ?? [];
    
    $metaMap = [];
    foreach ($metadata as $field) {
        $metaMap[$field['variable_name']] = $field['value'];
    }

    $processed_data = [
        'reference'     => $reference,
        'email'         => mysqli_real_escape_string($conn, $raw_data['data']['customer']['email']),
        'fullName'      => mysqli_real_escape_string($conn, $metaMap['customer_name'] ?? 'Guest'),
        'phone'         => mysqli_real_escape_string($conn, $metaMap['phone_number'] ?? 'N/A'),
        'amount'        => (float)($raw_data['data']['amount'] / 100),
        'total_paid'    => (float)($raw_data['data']['amount'] / 100),
        'items'         => json_decode($metaMap['order_details_json'] ?? '[]', true),
        'delivery_fee'  => (float)($metaMap['delivery_fee'] ?? 0),
        'coupon_code'   => mysqli_real_escape_string($conn, $metaMap['coupon_code'] ?? 'NONE'),
        'method'        => mysqli_real_escape_string($conn, $metaMap['delivery_method'] ?? 'delivery'),
        'address'       => mysqli_real_escape_string($conn, $metaMap['delivery_address'] ?? ''),
        'region'        => mysqli_real_escape_string($conn, $metaMap['region'] ?? '')
    ];
} else {
    $processed_data = $raw_data;
    $reference = mysqli_real_escape_string($conn, $processed_data['reference']);
}

/**
 * 2. IDEMPOTENCY CHECK
 */
$checkDuplicate = mysqli_query($conn, "SELECT status FROM mamag_orders WHERE reference = '$reference'");
if ($row = mysqli_fetch_assoc($checkDuplicate)) {
    if ($row['status'] === 'Paid') {
        echo json_encode(['status' => 'success', 'message' => 'Already processed']);
        exit;
    }
}

/**
 * 3. VERIFY WITH PAYSTACK (The Truth Source)
 */
$url = "https://api.paystack.co/transaction/verify/" . rawurlencode($reference);
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $paystack_secret_key"]);
$response = curl_exec($ch);
curl_close($ch);
$result = json_decode($response);

if ($result && $result->status && $result->data->status === 'success') {
    mysqli_begin_transaction($conn);

    try {
        $user_id     = isset($processed_data['user_id']) ? (int)$processed_data['user_id'] : 0;
        $email       = mysqli_real_escape_string($conn, $processed_data['email'] ?? '');
        $fullName    = mysqli_real_escape_string($conn, $processed_data['fullName'] ?? '');
        $phone       = mysqli_real_escape_string($conn, $processed_data['phone'] ?? '');
        $items_json  = mysqli_real_escape_string($conn, json_encode($processed_data['items']));
        $total_amount= (float)($processed_data['amount'] ?? 0);
        $total_paid  = (float)($processed_data['total_paid'] ?? 0);
        $delivery_fee= (float)($processed_data['delivery_fee'] ?? 0);
        $coupon      = mysqli_real_escape_string($conn, $processed_data['coupon_code'] ?? 'NONE');
        $method      = mysqli_real_escape_string($conn, $processed_data['method'] ?? 'delivery');
        $address     = mysqli_real_escape_string($conn, $processed_data['address'] ?? '');
        $region      = mysqli_real_escape_string($conn, $processed_data['region'] ?? '');

        // --- UPSERT LOGIC ---
        // Try to update existing pending order first
        $updateSql = "UPDATE mamag_orders SET 
            status = 'Paid', 
            total_paid = '$total_paid', 
            payment_date = NOW() 
            WHERE reference = '$reference'";
        
        mysqli_query($conn, $updateSql);

        if (mysqli_affected_rows($conn) == 0) {
            // If no rows were updated, it means the order doesn't exist yet (Webhook hit first)
            $sqlOrder = "INSERT INTO mamag_orders 
                (user_id, user_email, full_name, phone, reference, items, total_amount, total_paid, delivery_fee, coupon_used, method, address, region, status) 
                VALUES 
                ('$user_id', '$email', '$fullName', '$phone', '$reference', '$items_json', '$total_amount', '$total_paid', '$delivery_fee', '$coupon', '$method', '$address', '$region', 'Paid')";
            
            if (!mysqli_query($conn, $sqlOrder)) {
                throw new Exception("Insert Error: " . mysqli_error($conn));
            }
        }

        // --- UPDATE COUPON USAGE ---
        $cleanCouponCode = trim(explode('-', $coupon)[0]);
        if ($coupon !== 'NONE' && !empty($cleanCouponCode)) {
            $safeCleanCode = mysqli_real_escape_string($conn, $cleanCouponCode);
            mysqli_query($conn, "UPDATE mamag_discounts SET times_used = times_used + 1 WHERE code = '$safeCleanCode'");
        }

        // --- STOCK UPDATE ---
        if (!empty($processed_data['items']) && is_array($processed_data['items'])) {
            foreach ($processed_data['items'] as $item) {
                $sent_id    = mysqli_real_escape_string($conn, $item['id']);
                $name       = mysqli_real_escape_string($conn, $item['name'] ?? '');
                $qty        = (int)($item['quantity'] ?? 1);
                $size_name  = mysqli_real_escape_string($conn, trim($item['size'] ?? 'Standard'));
                $isSpecial  = (isset($item['isSpecial']) && ($item['isSpecial'] == true || $item['isSpecial'] == 'true')); 
                $isAddon    = (isset($item['isAddon']) && ($item['isAddon'] === true || $item['isAddon'] === 'true'));

                if ($isSpecial) {
                    mysqli_query($conn, "UPDATE mamag_requests SET status = 'Purchased' WHERE id = '$sent_id'");
                } 
                else if ($isAddon) {
                    mysqli_query($conn, "UPDATE mamag_addons SET stock = GREATEST(0, stock - $qty) WHERE id = '$sent_id'");
                } 
                else {
                    $lookup = mysqli_query($conn, "SELECT id FROM mamag_subs WHERE (id = '$sent_id' OR (parent_id = '$sent_id' AND name = '$name')) LIMIT 1");
                    
                    if (mysqli_num_rows($lookup) > 0) {
                        $row = mysqli_fetch_assoc($lookup);
                        $real_id = $row['id'];
                        $item_type = 'sub';
                        $target_table = 'mamag_subs';
                    } else {
                        $real_id = $sent_id;
                        $item_type = 'main';
                        $target_table = 'mamag_products';
                    }

                    mysqli_query($conn, "UPDATE product_size_stock 
                                   SET stock_count = GREATEST(0, stock_count - $qty) 
                                   WHERE product_id = '$real_id' 
                                   AND LOWER(TRIM(size_name)) = LOWER('$size_name') 
                                   AND item_type = '$item_type'");

                    $sumRes = mysqli_query($conn, "SELECT SUM(stock_count) as total FROM product_size_stock WHERE product_id = '$real_id' AND item_type = '$item_type'");
                    $sumRow = mysqli_fetch_assoc($sumRes);
                    $newTotal = ($sumRow['total'] !== null) ? (int)$sumRow['total'] : 0;
                    mysqli_query($conn, "UPDATE $target_table SET stock = '$newTotal' WHERE id = '$real_id'");
                }
            }
        }

        mysqli_commit($conn);
        echo json_encode(['status' => 'success']);

    } catch (Exception $e) {
        mysqli_rollback($conn);
        file_put_contents('error_log.txt', date('Y-m-d H:i:s') . " - " . $e->getMessage() . PHP_EOL, FILE_APPEND);
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Payment verification failed']);
}
?>
