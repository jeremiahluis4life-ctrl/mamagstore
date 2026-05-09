<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

// 1. Completely silence warnings that break JSON
error_reporting(0); 
ini_set('display_errors', 0); 

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../includes/db.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

// Start output buffering to catch any stray text
ob_start();

header('Content-Type: application/json');

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (isset($data['reference']) && isset($data['status'])) {
    $ref = mysqli_real_escape_string($conn, $data['reference']);
    $status = mysqli_real_escape_string($conn, $data['status']);

    // Standard status update
    $sql = "UPDATE mamag_orders SET status = '$status' WHERE reference = '$ref'";

    if (mysqli_query($conn, $sql)) {
        $mailLog = "No email required";
        
        // Trigger email only if status is Dispatched
        if ($status === 'Dispatched') {
            $mailLog = sendDispatchEmail($conn, $ref);
        }

        // Clean any stray echo/warnings before sending JSON
        if (ob_get_length()) ob_clean(); 
        echo json_encode([
            'status' => 'success',
            'email_status' => $mailLog
        ]);
    } else {
        if (ob_get_length()) ob_clean();
        echo json_encode(['status' => 'error', 'message' => mysqli_error($conn)]);
    }
} else {
    if (ob_get_length()) ob_clean();
    echo json_encode(['status' => 'error', 'message' => 'Invalid Input']);
}
exit;

/**
 * Helper function to handle PHPMailer logic
 */
function sendDispatchEmail($conn, $ref) {
    // 1. Fetch full order details
    $query = "SELECT * FROM mamag_orders WHERE reference = '$ref' LIMIT 1";
    $result = mysqli_query($conn, $query);
    $order = mysqli_fetch_assoc($result);

    $targetEmail = $order['user_email'] ?? $order['email'] ?? '';

    if (!$order || empty($targetEmail)) {
        return "Mail Failed: Customer email not found.";
    }

    // 2. Build Item List HTML
    $itemsArray = json_decode($order['items'], true);
    $calculatedSubtotal = 0;
    $itemsHtml = "";

if (is_array($itemsArray)) {
        foreach ($itemsArray as $item) {
            $qty = $item['quantity'] ?? 1;
            $size = $item['size'] ?? 'N/A';
            
            // 1. Construct the Path
            $rawPath = $item['image'] ?? '';
            $fullPath = !empty($rawPath) 
                ? "https://overite.co/mamag/" . ltrim($rawPath, '/') 
                : "";

            // 2. Identify Media Type (Video vs Image)
            $extension = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));
            $isVideo = in_array($extension, ['mp4', 'webm', 'mov', 'avi']);
            
            // 3. Media Display Logic
            $mediaHtml = "";
            if (empty($fullPath)) {
                // Case: Broken or Deleted Media
                $mediaHtml = "<div style='width: 50px; height: 50px; background: #f9f9f9; border: 1px dashed #ccc; border-radius: 8px; color: #999; font-size: 12px; display: table-cell; vertical-align: middle; text-align: center; line-height: 1.1; padding: 5px;'>MEDIA<br>DELETED</div>";
            } elseif ($isVideo) {
                // Case: Video (Emails can't play video, so show a placeholder)
                $mediaHtml = "<div style='width: 50px; height: 50px; background: #000; border-radius: 8px; color: #fff; font-size: 12px; display: table-cell; vertical-align: middle; text-align: center; line-height: 1.1; padding: 5px;'>VIDEO<br>UPDATE</div>";
            } else {
                // Case: Standard Image
                $mediaHtml = "<img src='{$fullPath}' alt='Product' style='width: 55px; height: 55px; object-fit: cover; border-radius: 8px; border: 1px solid #eee; display: block;'>";
            }
            
            // Clean price string
            $price = (float)str_replace(',', '', ($item['price'] ?? 0));
            
            // Special Order Logic
            $isSpecial = (stripos($item['name'], 'special order') !== false);
            $lineTotal = $isSpecial ? $price : ($price * $qty);
            $calculatedSubtotal += $lineTotal;
            
            // 4. Premium Layout
            $itemsHtml .= "
            <div style='border-bottom: 1px solid #f0f0f0; padding: 15px 0; display: table; width: 100%;'>
                <div style='display: table-cell; width: 80px; vertical-align: middle;'>
                    {$mediaHtml}
                </div>
                
                <div style='display: table-cell; vertical-align: middle; padding-left: 15px;'>
                    <p style='margin: 0; font-weight: bold; color: #1a1a1a; font-size: 14px; line-height: 1.2;'>{$item['name']}</p>
                    <p style='margin: 4px 0 0 0; font-size: 12px; color: #888;'>Size: $size • Qty: $qty</p>
                </div>
                
                <div style='display: table-cell; vertical-align: middle; text-align: right; width: 100px;'>
                    <p style='margin: 0; font-weight: bold; color: #000; font-size: 14px;'>₦" . number_format($lineTotal, 2) . "</p>
                </div>
            </div>";
        }
    }

    // 3. Financial fallbacks
    // 1. Base Figures
    $subtotal = (float)($order['subtotal'] ?? $calculatedSubtotal);
    $totalPaid = (float)($order['total_paid'] ?? $order['total_amount']);
    $serviceCharge = $subtotal * 0.039;

    // 2. Extract Discount from the Coupon String
    // Example string: "SAVE500 - ₦500.00 Fixed Discount" 
    $discountAmount = 0;
    $couponString = $order['coupon_used'] ?? '';

    if (!empty($couponString) && $couponString !== 'NONE') {
        // This regex looks for any number after a '₦' or '-' in your coupon string
        if (preg_match('/(?:₦|N)\s*([0-9,.]+)/', $couponString, $matches)) {
            $discountAmount = (float)str_replace(',', '', $matches[1]);
        }
    }

    // 3. CORRECT DELIVERY MATH
    // Total Paid is what they actually gave you. 
    // To find the real delivery, we look at the "Price before discount"
    // Real Delivery = (Final Paid + Discount) - Subtotal - Service Charge
    $delivery = ($totalPaid + $discountAmount) - $subtotal - $serviceCharge;

    // 4. Final Safety check
    if ($delivery < 0) $delivery = 0;

    // Coupon Logic for Email
    $couponUsed = $order['coupon_used'] ?? 'NONE';
    $couponHtml = "";
    if ($couponUsed !== 'NONE' && !empty($couponUsed)) {
        $couponHtml = "
        <p style='margin: 10px 0; font-size: 13px; color: #004cff; font-weight: bold; padding: 8px 0; border: 1px dashed #004cff; border-right: 0; border-left: 0; background-color: transparent;'>
            Coupon Applied: <span style='float:right;'>$couponUsed</span>
        </p>";
    }

    $mail = new PHPMailer(true);
    try {
        // Server Settings
        $mail->SMTPDebug = 0; // Keep at 0 to prevent JSON breaking
        $mail->isSMTP();
        $mail->Host       = $_ENV['SMTP_HOST'];
        $mail->SMTPAuth   = true;
        $mail->Username   = $_ENV['SMTP_USER']; 
        $mail->Password   = $_ENV['SMTP_PASS']; 
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = $_ENV['SMTP_PORT'] ?? 587;
        
        $mail->SMTPOptions = array(
            'ssl' => array('verify_peer' => false, 'verify_peer_name' => false, 'allow_self_signed' => true)
        );

        // Recipients
        $mail->setFrom('mamagclothingstore@gmail.com', 'MAMAG OFFICIAL');
        $mail->addAddress($targetEmail, $order['full_name']);
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = "Your MAMAG Order #$ref is on its way!";

        $mail->Body = "
        <div style='background-color: #f9f9f9; color: #1a1a1a; font-family: Arial, sans-serif; margin: 0; padding: 20px;'>
            <table width='100%' border='0' cellspacing='0' cellpadding='0'>
                <tr>
                    <td align='center'>
                        <table width='600' border='0' cellspacing='0' cellpadding='0' style='max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);'>
                            <tr>
                                <td align='center' style='padding: 40px 0; background-color: #000000;'>
                                    <h1 style='color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 4px; font-weight: 700; margin-bottom: 4px;'>M A M A G</h1>
                                    <h3 style='color: #ffffff; margin: 0; font-size: 14px; letter-spacing: 1px; font-weight: 300;'>AUTHENTIC STYLE DELIVERED</h3>
                                </td>
                            </tr>
                            <tr>
                                <td style='padding: 30px;'>
                                    <h2 style='margin: 0 0 10px 0; font-size: 22px; font-weight: bold;'>Order Dispatched!</h2>
                                    <p style='color: #555; font-size: 15px;'>Hi {$order['full_name']}, your order #$ref has been officially been dispatched and is now on its way to you.</p>
                                    <p style='color: #555; font-size: 15px;'>The delivery courier will contact you soon to coordinate dropoff, please ensure someone is available to receive the package.</p>
                                    
                                    <div style='margin-top: 35px; border-top: 2px solid #000; padding-top: 10px;'>
                                        <h3 style='font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #999; margin-bottom: 15px;'>Package Summary</h3>
                                        $itemsHtml
                                        <div style='margin-top: 20px; padding: 15px; background-color: #fafafa; border-radius: 8px;'>
                                            <p style='margin: 5px 0; font-size: 14px;'>Subtotal: <span style='float:right;'>₦" . number_format($subtotal, 2) . "</span></p>
                                            <p style='margin: 5px 0; font-size: 14px;'>Service Charge: <span style='float:right;'>₦" . number_format($serviceCharge, 2) . "</span></p>
                                            <p style='margin: 5px 0; font-size: 14px;'>Delivery: <span style='float:right;'>₦" . number_format($delivery, 2) . "</span></p>
                                            $couponHtml
                                            <p style='margin: 10px 0 0 0; font-weight:bold; border-top:1px solid #eee; padding-top:10px; font-size: 16px;'>Total Paid: <span style='float:right;'>₦" . number_format($totalPaid, 2) . "</span></p>
                                        </div>
                                    </div>

                                    <div style='text-align: center; margin-top: 40px;'>
                                        <p style='font-size: 12px; color: #aaa;'>&copy; " . date('Y') . " MAMAG OFFICIAL. All Rights Reserved.</p>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </div>";

        $mail->send();

        mysqli_query($conn, "UPDATE mamag_orders SET email_sent = 1 WHERE reference = '$ref'");
        return "Success: Email Sent";

    } catch (Exception $e) {
        mysqli_query($conn, "UPDATE mamag_orders SET email_sent = 0 WHERE reference = '$ref'");
        return "Mail Error: " . $mail->ErrorInfo;
    }
}