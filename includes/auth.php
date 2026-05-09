<?php
session_start();

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// This precisely locates the vendor folder based on the XAMPP path
require __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();
include_once 'db.php'; 

// Force clean JSON output
if (ob_get_length()) ob_clean();
header('Content-Type: application/json');

// Check if database connection exists
if (!$conn) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);
$action = $data['action'] ?? '';


// --- Inside includes/auth.php ---

if ($action === 'reset_password') {
    // 1. Get and sanitize data
    $email = mysqli_real_escape_string($conn, $data['email']);
    $token = mysqli_real_escape_string($conn, $data['token']);
    $password = $data['password'];

    // 2. Hash the new password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // 3. Update the user ONLY if the token matches
    $query = "UPDATE mamag_users SET 
              password = '$hashed_password', 
              reset_token = NULL 
              WHERE email = '$email' AND reset_token = '$token'";

    if (mysqli_query($conn, $query)) {
        if (mysqli_affected_rows($conn) > 0) {
            echo json_encode(['status' => 'success', 'message' => 'Password updated!']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid or expired token.']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Database error: ' . mysqli_error($conn)]);
    }
    exit; // Crucial: Stop execution here so no extra HTML is sent
}

if ($action === 'send_otp') {
    $name = mysqli_real_escape_string($conn, $data['name']);
    $email = mysqli_real_escape_string($conn, $data['email']);
    $phone = mysqli_real_escape_string($conn, $data['phone']);
    $pass = password_hash($data['password'], PASSWORD_DEFAULT);
    $otp = rand(1000, 9999);

    $sql = "INSERT INTO mamag_users (full_name, email, phone, password, otp_code, is_verified) 
            VALUES ('$name', '$email', '$phone', '$pass', '$otp', 0)
            ON DUPLICATE KEY UPDATE otp_code = '$otp'"; 
    
    if (mysqli_query($conn, $sql)) {
        $mail = new PHPMailer(true);
       try {
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'mamagclothingstore@gmail.com'; 
            $mail->Password   = 'nuij exka fhcv idly'; 
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;
            $mail->SMTPOptions = array(
                'ssl' => array(
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                )
            );

            $mail->setFrom('mamagclothingstore@gmail.com', 'MAMAG OFFICIAL');
            $mail->addAddress($email, $name);
            $mail->isHTML(true);
            $mail->Subject = "$otp is your MAMAG verification code";

            // Professional HTML Template
            $mail->Body = "
            <div style='background-color: #f9f9f9; padding: 20px; font-family: \"Segoe UI\", Tahoma, Geneva, Verdana, sans-serif;'>
                <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);'>
                    <div style='background-color: #000000; padding: 30px; text-align: center;'>
                        <h1 style='color: #ffffff; margin: 0; letter-spacing: 2px; font-size: 35px; font-family: \"Lobster Two\", sans-serif;'>M A M A G</h1>
                        <p style='color: #888; margin-top: 5px; font-size: 12px; text-transform: uppercase;'>Authentic Style. Delivered.</p>
                    </div>
                    <div style='padding: 40px; text-align: center;'>
                        <h2 style='color: #333; font-size: 24px;'>Verify Your Account</h2>
                        <p style='color: #666; line-height: 1.6;'>Hello <strong>$name</strong>, use the code below to complete your registration and start shopping.</p>
                        
                        <div style='margin: 30px 0;'>
                            <span style='display: inline-block; background-color: #f4f4f4; border: 1px solid #ddd; padding: 15px 30px; font-size: 34px; font-weight: bold; letter-spacing: 10px; color: #000; border-radius: 4px;'>
                                $otp
                            </span>
                        </div>
                        
                        <p style='color: #999; font-size: 13px;'>This code is valid for 10 minutes. If you didn't request this, please ignore this email.</p>
                    </div>
                    <div style='background-color: #fafafa; padding: 20px; text-align: center; border-top: 1px solid #eee;'>
                        <p style='color: #bbb; font-size: 11px;'>&copy; 2026 MAMAG Clothing Store. All Rights Reserved.</p>
                    </div>
                </div>
            </div>";

            $mail->send();
            echo json_encode(['status' => 'success']);
        } catch (Exception $e) {
            echo json_encode(['status' => 'error', 'message' => "Mail failed: {$mail->ErrorInfo}"]);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'DB Error: ' . mysqli_error($conn)]);
    }
}

// --- 2. VERIFY OTP ---
if ($action === 'verify_otp') {
    $email = mysqli_real_escape_string($conn, $data['email']);
    $user_otp = mysqli_real_escape_string($conn, $data['otp']);

    $result = mysqli_query($conn, "SELECT * FROM mamag_users WHERE email = '$email' AND otp_code = '$user_otp'");
    
    if (mysqli_fetch_assoc($result)) {
        mysqli_query($conn, "UPDATE mamag_users SET is_verified = 1, otp_code = NULL WHERE email = '$email'");
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Incorrect code ❌']);
    }
}


// --- RESEND OTP ACTION ---
if ($action === 'resend_otp') {
    $email = mysqli_real_escape_string($conn, $data['email']);
    $otp = rand(1000, 9999);

    // Update the existing user with the new code
    $update = mysqli_query($conn, "UPDATE mamag_users SET otp_code = '$otp' WHERE email = '$email' AND is_verified = 0");

    if (mysqli_affected_rows($conn) > 0) {
        // Fetch user name for the email
        $res = mysqli_query($conn, "SELECT full_name FROM mamag_users WHERE email = '$email'");
        $user = mysqli_fetch_assoc($res);
        $name = $user['full_name'];

        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';
            $mail->SMTPAuth = true;
            $mail->Username = 'mamagclothingstore@gmail.com';
            $mail->Password = 'nuij exka fhcv idly';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;
            $mail->SMTPOptions = array('ssl' => array('verify_peer' => false, 'verify_peer_name' => false, 'allow_self_signed' => true));

            $mail->setFrom('mamagclothingstore@gmail.com', 'MAMAG OFFICIAL');
            $mail->addAddress($email, $name);
            $mail->isHTML(true);
            $mail->Subject = "Your NEW Verification Code";

            // Use the same "fine" design here
            $mail->Body = "
            <link href='https://fonts.googleapis.com/css2?family=Lobster+Two&display=swap' rel='stylesheet'>
            <div style='background-color: #f9f9f9; padding: 20px; font-family: sans-serif;'>
                <div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;'>
                    <div style='background-color: #000; padding: 30px; text-align: center;'>
                        <h1 style='color: #fff; margin: 0; font-family: \"Lobster Two\", cursive; font-size: 35px;'>M A M A G</h1>
                    </div>
                    <div style='padding: 40px; text-align: center;'>
                        <h2>New Code Requested</h2>
                        <p>Here is your new verification code:</p>
                        <div style='margin: 30px 0;'>
                            <span style='background: #f4f4f4; padding: 15px 30px; font-size: 34px; font-weight: bold; letter-spacing: 10px; border: 1px solid #ddd;'>$otp</span>
                        </div>
                    </div>
                </div>
            </div>";

            $mail->send();
            echo json_encode(['status' => 'success']);
        } catch (Exception $e) {
            echo json_encode(['status' => 'error', 'message' => "Mail failed"]);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => "User not found or already verified"]);
    }
}

// --- 3. LOGIN LOGIC ---

$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? '';

if ($action === 'login') {
    $email = mysqli_real_escape_string($conn, $data['email']);
    $password = $data['password'];

    $result = mysqli_query($conn, "SELECT * FROM mamag_users WHERE email = '$email'");
    $user = mysqli_fetch_assoc($result);

    if ($user && password_verify($password, $user['password'])) {
        if ($user['is_verified'] == 1) {
            
            // Generate fresh ID and save to server memory
            session_regenerate_id(true); 
            $_SESSION['user_id'] = $user['id']; 
            $_SESSION['email'] = $user['email'];
            $_SESSION['full_name'] = $user['full_name'];
            $_SESSION['phone'] = $user['phone'];

            echo json_encode([
                'status' => 'success', 
                'user' => [
                    'id' => $user['id'], 
                    'name' => $user['full_name'], 
                    'email' => $user['email']
                ]
            ]);
        } else {
            echo json_encode(['status' => 'unverified', 'message' => 'Please verify your email']);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid email or password']);
    }
    exit;
}




if ($action === 'forgot_password') {
    $email = mysqli_real_escape_string($conn, $data['email']);
    
    // 1. Verify user exists before trying to send
    $user_res = mysqli_query($conn, "SELECT full_name FROM mamag_users WHERE email = '$email'");
    $user = mysqli_fetch_assoc($user_res);

    if ($user) {
        $name = $user['full_name'];
        $token = bin2hex(random_bytes(16));
        mysqli_query($conn, "UPDATE mamag_users SET reset_token = '$token' WHERE email = '$email'");

        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'mamagclothingstore@gmail.com'; 
            $mail->Password   = 'nuij exka fhcv idly'; 
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;

            // --- CRUCIAL: SSL BYPASS FOR XAMPP ---
            $mail->SMTPOptions = array(
                'ssl' => array(
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                )
            );

            $mail->setFrom('mamagclothingstore@gmail.com', 'MAMAG Official');
            $mail->addAddress($email, $name);
            $mail->isHTML(true);
            $mail->Subject = "Reset Your MAMAG Password";

            $resetLink = "http://localhost/mamag/reset-password.php?email=" . urlencode($email) . "&token=$token";

            $mail->Body = "
            <link href='https://fonts.googleapis.com/css2?family=Lobster+Two&display=swap' rel='stylesheet'>
            <div style='background-color: #f4f4f4; padding: 20px; font-family: sans-serif;'>
                <div style='max-width: 600px; margin: 0 auto; background-color: #fff; padding: 40px; text-align: center; border-radius: 10px;'>
                    <h1 style='font-family: \"Lobster Two\", cursive; font-size: 35px; color: #000;'>M A M A G</h1>
                    <h2 style='color: #333;'>Password Reset Request</h2>
                    <p style='color: #666;'>Click the button below to set a new password for your account.</p>
                    <a href='$resetLink' style='display:inline-block; background:#000; color:#fff; padding:15px 30px; text-decoration:none; border-radius:5px; margin:20px 0; font-weight: bold;'>Reset Password</a>
                    <p style='color: #999; font-size: 11px;'>If you didn't request this, you can safely ignore this email.</p>
                </div>
            </div>";

            $mail->send();
            echo json_encode(['status' => 'success', 'message' => 'Reset link sent! 📩']);
        } catch (Exception $e) {
            // This will show the ACTUAL Gmail error in the toast
            echo json_encode(['status' => 'error', 'message' => "Mail Error: {$mail->ErrorInfo}"]);
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Email not found in our system.']);
    }
    exit;
}
?>