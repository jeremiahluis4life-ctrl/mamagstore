    <?php
header('Content-Type: application/json');
require_once '../../includes/db.php';

$query = "SELECT * FROM feedback ORDER BY created_at DESC";
$result = $conn->query($query);
$feedbacks = [];

while($row = $result->fetch_assoc()) {
    $feedbacks[] = $row;
}

echo json_encode($feedbacks);
?>