<?php
header("Content-Type: application/json");
require_once '../../includes/db.php';

$query = "SELECT * FROM delivery_regions ORDER BY state ASC, region_name ASC";
$result = mysqli_query($conn, $query);

$rates = [];

if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        // Ensure price is returned as a number
        $row['price'] = (float)$row['price'];
        $rates[] = $row;
    }
}

echo json_encode($rates);
?>