<?php
// Turn off error reporting to the screen so it doesn't break JSON
error_reporting(0); 
include_once '../includes/db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401); // Set proper error code
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

$userId = (int)$_SESSION['user_id'];

// Check if table exists to avoid SQL crash
$checkTable = mysqli_query($conn, "SHOW TABLES LIKE 'mamag_requests'");
if(mysqli_num_rows($checkTable) == 0) {
    echo json_encode([]); // Return empty if table doesn't exist yet
    exit;
}

$sql = "SELECT * FROM mamag_requests WHERE user_id = ? ORDER BY id DESC";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, "i", $userId);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$requests = [];
while ($row = mysqli_fetch_assoc($result)) {
    // Ensure numbers are sent as numbers, not strings
    $row['id'] = (int)$row['id'];
    $row['vendor_price'] = (float)$row['vendor_price'];
    $requests[] = $row;
}

echo json_encode($requests);