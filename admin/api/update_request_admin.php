<?php
include_once '../../includes/db.php';
header('Content-Type: application/json');

$id = (int)$_POST['id'];
$status = mysqli_real_escape_string($conn, $_POST['status']);
$price = (float)$_POST['price'];

$sql = "UPDATE mamag_requests SET status = '$status', vendor_price = $price WHERE id = $id";

if (mysqli_query($conn, $sql)) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => mysqli_error($conn)]);
}
?>