<?php
header('Content-Type: application/json');
require_once '../../includes/db.php';

$data = json_decode(file_get_contents("php://input"), true);
$id = (int)$data['id'];

if ($id > 0) {
    $stmt = $conn->prepare("DELETE FROM feedback WHERE id = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error']);
    }
}
?>