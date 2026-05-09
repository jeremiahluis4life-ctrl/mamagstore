<?php
require_once '../../includes/db.php';
header('Content-Type: application/json');

$sql = "SELECT * FROM mamag_discounts ORDER BY created_at DESC";
$result = mysqli_query($conn, $sql);

$discounts = [];
while ($row = mysqli_fetch_assoc($result)) {
    $discounts[] = $row;
}

echo json_encode($discounts);
?>