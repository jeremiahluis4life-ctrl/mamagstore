<?php
include '../includes/db.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$requestId = mysqli_real_escape_string($conn, $data['id']);

// IMPORTANT: We update 'created_at' to NOW() so it jumps to the top of the Admin list
$sql = "UPDATE mamag_requests 
        SET status = 'Pending', 
            vendor_price = 0, 
            created_at = NOW() 
        WHERE id = '$requestId'";

if (mysqli_query($conn, $sql)) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => mysqli_error($conn)]);
}
?>