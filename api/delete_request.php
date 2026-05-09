<?php
// 1. Start session to verify the owner of the request
include_once '../includes/db.php';
header('Content-Type: application/json');

// 2. Security: Ensure user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized access. Please log in.']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 3. Get IDs - Use the Session for User ID for security
    $id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
    $userId = (int)$_SESSION['user_id'];

    if ($id <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid Request ID']);
        exit;
    }

    // 4. Fetch the image path BEFORE deleting the record
    $query = "SELECT image_path FROM mamag_requests WHERE id = ? AND user_id = ?";
    $stmt = mysqli_prepare($conn, $query);
    mysqli_stmt_bind_param($stmt, "ii", $id, $userId);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($row = mysqli_fetch_assoc($result)) {
        $relative_path = $row['image_path']; 
        
        // 5. Build the Physical Path
        // We go up one level (../) because this script is inside the /api/ folder
        $full_path = "../" . $relative_path;

        // 6. Delete the physical file if it exists on the server
        if (!empty($relative_path) && file_exists($full_path)) {
            unlink($full_path);
        }

        // 7. Delete the row from the database
        $sql = "DELETE FROM mamag_requests WHERE id = ? AND user_id = ?";
        $deleteStmt = mysqli_prepare($conn, $sql);
        mysqli_stmt_bind_param($deleteStmt, "ii", $id, $userId);

        if (mysqli_stmt_execute($deleteStmt)) {
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Database deletion failed']);
        }
        mysqli_stmt_close($deleteStmt);
        
    } else {
        // Triggers if ID is wrong or belongs to another user
        echo json_encode(['status' => 'error', 'message' => 'Request not found or access denied']);
    }
    
    mysqli_stmt_close($stmt);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}
?>