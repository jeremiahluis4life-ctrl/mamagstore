<?php
// api/paystack_webhook.php
include '../includes/db.php'; // Using your requested DB connection

if ($_SERVER['REQUEST_METHOD'] !== 'POST') exit;

// 1. Security check: Verify the request is actually from Paystack
define('PAYSTACK_SECRET_KEY', 'sk_live_e87a2984a4256f096cd1d5210f8056d4906087fe');
$input = @file_get_contents("php://input");
$sig = $_SERVER['HTTP_X_PAYSTACK_SIGNATURE'];

if (!$sig || ($sig !== hash_hmac('sha512', $input, PAYSTACK_SECRET_KEY))) {
    exit; // Stop if the signature is invalid
}

http_response_code(200); // Acknowledge receipt immediately to avoid timeouts
$event = json_decode($input);

// 2. Handle the successful payment
if ($event->event === 'charge.success') {
    $orderRef = $event->data->reference;

    // Use $conn from your included db.php
    $stmt = $conn->prepare("UPDATE orders SET status = 'Paid', payment_date = NOW() WHERE reference = ?");
    $stmt->bind_param("s", $orderRef);
    $stmt->execute();
    $stmt->close();
}

$conn->close();
exit;