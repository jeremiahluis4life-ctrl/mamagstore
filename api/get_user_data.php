<?php
// Path: MAMAG/api/get_user_data.php
include_once '../includes/db.php'; 
header('Content-Type: application/json');

$email = isset($_GET['email']) ? mysqli_real_escape_string($conn, trim($_GET['email'])) : '';

if (!$email) {
    echo json_encode(['status' => 'error', 'message' => 'No email provided']);
    exit;
}

$baseEmail = str_replace('www.', '', $email);

// Selection now includes total_paid
$query = "SELECT reference, items, total_amount, total_paid, status, created_at 
          FROM mamag_orders 
          WHERE user_email = '$baseEmail' 
          OR user_email = 'www.$baseEmail' 
          ORDER BY id DESC";

$result = mysqli_query($conn, $query);
$orders = [];

if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $decodedItems = json_decode($row['items'], true);
        $orders[] = [
            'reference' => $row['reference'],
            'date' => date("d M Y", strtotime($row['created_at'])), 
            'status' => $row['status'] ?? 'Pending', 
            'total_amount' => $row['total_amount'],
            'total_paid' => $row['total_paid'], // Sent to JS for the order list
            'items' => is_array($decodedItems) ? $decodedItems : [] 
        ];
    }
}

echo json_encode(['status' => 'success', 'orders' => $orders]);
?>