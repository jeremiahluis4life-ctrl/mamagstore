<?php
// 1. Start the session to identify the user
include_once '../includes/db.php';
header('Content-Type: application/json');

// 2. Security Check: Must be logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Please log in to submit requests.']);
    exit;
}

// 3. Collect Identity Info
$userId = (int)$_SESSION['user_id'];

/**
 * IDENTITY FALLBACK:
 * Try the secure Session first. 
 * If the session is empty, use the data sent from JS via FormData.
 */
$userName = $_SESSION['full_name'] ?? $_SESSION['name'] ?? $_POST['user_name'] ?? 'Unknown User';
$email = $_SESSION['email'] ?? $_POST['email'] ?? ''; 

// 4. File Upload Configuration
$targetDir = "../uploads/requests/";
if (!file_exists($targetDir)) {
    mkdir($targetDir, 0777, true);
}

// 5. Process Upload and Insert to Database
if (isset($_FILES["image"]) && $_FILES["image"]["error"] == 0) {
    $fileName = time() . '_' . basename($_FILES["image"]["name"]);
    $targetFilePath = $targetDir . $fileName;
    $dbPath = "uploads/requests/" . $fileName;

    if (move_uploaded_file($_FILES["image"]["tmp_name"], $targetFilePath)) {
        
        // Sanitize other POST data
        $name = mysqli_real_escape_string($conn, $_POST['product_name']);
        $size = mysqli_real_escape_string($conn, $_POST['size']);
        $qty = (int)$_POST['quantity'];

        // 6. Prepared Statement to handle user_name, user_email and other data
        // Count: 1.user_id, 2.user_name, 3.user_email, 4.product_name, 5.required_size, 6.quantity, 7.image_path
        $sql = "INSERT INTO mamag_requests (user_id, user_name, user_email, product_name, required_size, quantity, image_path, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending')";
        
        $stmt = mysqli_prepare($conn, $sql);
        
        if ($stmt) {
            // Bind parameters: 
            // i = integer (user_id, quantity)
            // s = string (user_name, user_email, product_name, required_size, image_path)
            // The string "issssis" represents: int, string, string, string, string, int, string
            mysqli_stmt_bind_param($stmt, "issssis", $userId, $userName, $email, $name, $size, $qty, $dbPath);

            if (mysqli_stmt_execute($stmt)) {
                echo json_encode(['status' => 'success']);
            } else {
                echo json_encode(['status' => 'error', 'message' => 'DB Error: ' . mysqli_stmt_error($stmt)]);
            }
            
            mysqli_stmt_close($stmt);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Statement Preparation Failed: ' . mysqli_error($conn)]);
        }

    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to save the image to server.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Valid image file is required.']);
}
?>