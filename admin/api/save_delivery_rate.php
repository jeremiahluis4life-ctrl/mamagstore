<?php
header("Content-Type: application/json");
require_once '../../includes/db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['state'], $data['region_name'], $data['price'])) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid data provided']);
    exit;
}

$state = mysqli_real_escape_string($conn, $data['state']);
$region = mysqli_real_escape_string($conn, $data['region_name']);
$price = (float)$data['price'];

$query = "INSERT INTO delivery_regions (state, region_name, price) VALUES ('$state', '$region', '$price')";

if (mysqli_query($conn, $query)) {
    echo json_encode(['status' => 'success', 'message' => 'Region added successfully']);
} else {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => mysqli_error($conn)]);
}
?>