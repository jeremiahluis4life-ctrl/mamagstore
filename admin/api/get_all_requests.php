<?php
include_once '../../includes/db.php';
header('Content-Type: application/json');

/**
 * Fetches all special sourcing requests for the Admin Dashboard
 * Sorted by latest first
 */

$sql = "SELECT * FROM mamag_requests ORDER BY created_at DESC";
$result = mysqli_query($conn, $sql);

$requests = [];

if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        // Ensure the path is clean for the frontend
        // If your images are stored in uploads/, this ensures the admin can see them
        $requests[] = $row;
    }
    
    echo json_encode($requests);
} else {
    // Return an error object if the query fails so the JS doesn't hang
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to fetch requests: ' . mysqli_error($conn)
    ]);
}

mysqli_close($conn);
?>