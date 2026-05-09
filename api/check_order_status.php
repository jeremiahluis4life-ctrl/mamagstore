<?php
header('Content-Type: application/json');
include '../includes/db.php';

$ref = mysqli_real_escape_string($conn, $_GET['ref'] ?? '');

if (empty($ref)) {
    echo json_encode(['status' => 'error']);
    exit;
}

$result = mysqli_query($conn, "SELECT status FROM mamag_orders WHERE reference = '$ref' LIMIT 1");
$order = mysqli_fetch_assoc($result);

if ($order) {
    echo json_encode(['status' => $order['status']]);
} else {
    echo json_encode(['status' => 'pending']);
}
?>
