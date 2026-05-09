<?php
// 1. Setup CORS so the browser allows cookies to be sent
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
}

header('Content-Type: application/json');

// 2. Include DB which MUST have session_start() at the very top
include '../includes/db.php'; 

// DEBUG: Uncomment the line below to see what is actually in your session if it fails
// file_put_contents('session_debug.txt', print_r($_SESSION, true));

if (isset($_SESSION['user_id']) && (int)$_SESSION['user_id'] > 0) {
    $userId = (int)$_SESSION['user_id'];
    
    // Use prepared statements to prevent SQL injection and errors
    $stmt = $conn->prepare("SELECT id, full_name, email, phone FROM mamag_users WHERE id = ? LIMIT 1");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($user = $result->fetch_assoc()) {
        echo json_encode([
            'status' => 'valid', 
            'user' => [
                'id' => (int)$user['id'],
                'name' => $user['full_name'],
                'email' => $user['email'],
                'phone' => $user['phone']
            ]
        ]);
        exit;
    }
}

// If we reach here, either no session or user not found
echo json_encode(['status' => 'invalid']);
exit;