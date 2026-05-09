<?php
include '../includes/db.php';
header('Content-Type: application/json');

$email = isset($_SESSION['user_email']) ? $_SESSION['user_email'] : '';
if (empty($email) && isset($_GET['email'])) {
    $email = mysqli_real_escape_string($conn, $_GET['email']);
}

if (empty($email)) {
    echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
    exit;
}

$sql = "SELECT reference, DATE_FORMAT(created_at, '%d %b %Y') as date, items, total_amount, total_paid, status 
        FROM mamag_orders 
        WHERE user_email = '$email' 
        ORDER BY id DESC";

$result = mysqli_query($conn, $sql);
$orders = [];

if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        // Decode JSON items
        $decodedItems = json_decode($row['items'], true);
        $row['items'] = is_array($decodedItems) ? $decodedItems : [];
        
        // Ensure total_paid is a number
        $row['total_paid'] = (float)($row['total_paid'] ?? $row['total_amount']);
        
        $orders[] = $row;
    }
    echo json_encode(['status' => 'success', 'orders' => $orders]);
} else {
    echo json_encode(['status' => 'error', 'message' => mysqli_error($conn)]);
}
?>