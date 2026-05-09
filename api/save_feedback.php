<?php
header('Content-Type: application/json');
include '../includes/db.php';

$data = json_decode(file_get_contents("php://input"), true);

$name = $data['name'] ?? 'Anonymous';
$email = $data['email'] ?? '';
$rating = (int)($data['rating'] ?? 0);
$comment = $data['comment'] ?? '';

if ($rating < 1 || empty($email)) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid data']);
    exit;
}

$stmt = $conn->prepare("INSERT INTO feedback (name, email, rating, comment) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssis", $name, $email, $rating, $comment);

if ($stmt->execute()) {
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => $conn->error]);
}
?>