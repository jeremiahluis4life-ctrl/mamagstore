<?php
header('Content-Type: application/json');
include '../includes/db.php'; // Your DB config file

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? '';

if (empty($email)) {
    echo json_encode(['status' => 'error', 'message' => 'Email is required']);
    exit;
}

// 1. Delete user from users table
$query = "DELETE FROM mamag_users WHERE email = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("s", $email);

if ($stmt->execute()) {
    // Optional: Delete user's specific cart or addresses if in separate tables
    // $conn->query("DELETE FROM addresses WHERE user_email = '$email'");

    echo json_encode(['status' => 'success', 'message' => 'Account deleted']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Database error']);
}
?>