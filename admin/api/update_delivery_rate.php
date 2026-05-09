<?php
header("Content-Type: application/json");
require_once '../../includes/db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['id'], $data['state'], $data['region_name'], $data['price'])) {
    echo json_encode(['status' => 'error', 'message' => 'Missing data']);
    exit;
}

$id = (int)$data['id'];
$state = mysqli_real_escape_string($conn, $data['state']);
$region = mysqli_real_escape_string($conn, $data['region_name']);
$price = (float)$data['price'];

$query = "UPDATE delivery_regions SET state='$state', region_name='$region', price='$price' WHERE id=$id";

if (mysqli_query($conn, $query)) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => mysqli_error($conn)]);
}
?>