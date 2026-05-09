<?php
ob_start();
require_once '../../includes/db.php';
header('Content-Type: application/json');

// Get JSON Input
$input = json_decode(file_get_contents('php://input'), true);

if (isset($input['id'])) {
    $id = (int)$input['id'];

    // Delete query
    $sql = "DELETE FROM mamag_discounts WHERE id = $id";

    if (mysqli_query($conn, $sql)) {
        ob_clean();
        echo json_encode(['status' => 'success']);
        exit;
    } else {
        ob_clean();
        echo json_encode(['status' => 'error', 'message' => mysqli_error($conn)]);
        exit;
    }
} else {
    ob_clean();
    echo json_encode(['status' => 'error', 'message' => 'Invalid ID']);
}
ob_end_flush();
?>