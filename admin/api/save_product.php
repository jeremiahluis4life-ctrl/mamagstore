<?php
require_once '../../includes/db.php';

// Ensure the session is started to check auth
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['admin_auth'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

// 1. DIRECTORY CONFIGURATION
$srvImgDir = '../uploads/images/';
$srvSubDir = '../uploads/subs/';
$srvVidDir = '../uploads/videos/';

$dbImgDir = 'uploads/images/';
$dbSubDir = 'uploads/subs/';
$dbVidDir = 'uploads/videos/';

if (!file_exists($srvImgDir)) mkdir($srvImgDir, 0777, true);
if (!file_exists($srvSubDir)) mkdir($srvSubDir, 0777, true);
if (!file_exists($srvVidDir)) mkdir($srvVidDir, 0777, true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // CAPTURE NEW CATEGORY FIELD
    $type = mysqli_real_escape_string($conn, $_POST['type']);
    $name = mysqli_real_escape_string($conn, $_POST['name']);
    $category = mysqli_real_escape_string($conn, $_POST['category']); // Grab the label (e.g., 'Jackets')
    $price = mysqli_real_escape_string($conn, $_POST['price']);
    $stock = (int)$_POST['stock']; 
    $sizes = mysqli_real_escape_string($conn, $_POST['sizes']);
    
    // Decode the size-specific stock breakdown
    $size_stocks = isset($_POST['size_stocks']) ? json_decode($_POST['size_stocks'], true) : [];
    
    $final_image_path = "";
    $final_video_path = "";

    // 2. HANDLE MAIN VIDEO
    if (isset($_FILES['video_file']) && $_FILES['video_file']['error'] === 0) {
        $vName = time() . "_" . preg_replace("/[^A-Za-z0-9.]/", "_", $_FILES['video_file']['name']);
        if (move_uploaded_file($_FILES['video_file']['tmp_name'], $srvVidDir . $vName)) {
            $final_video_path = $dbVidDir . $vName;
        }
    } 
    
    // 3. HANDLE MAIN IMAGE
    if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === 0) {
        $iName = time() . "_" . preg_replace("/[^A-Za-z0-9.]/", "_", $_FILES['image_file']['name']);
        if (move_uploaded_file($_FILES['image_file']['tmp_name'], $srvImgDir . $iName)) {
            $final_image_path = $dbImgDir . $iName;
        }
    }

    // Insert Main Product (Including the new 'category' column)
    $sql = "INSERT INTO mamag_products (product_type, name, category, price, stock, sizes, main_image, video_path) 
            VALUES ('$type', '$name', '$category', '$price', '$stock', '$sizes', '$final_image_path', '$final_video_path')";
    
    if (mysqli_query($conn, $sql)) {
        $parent_id = mysqli_insert_id($conn);
        
        // --- SAVE SIZE-SPECIFIC STOCK FOR MAIN PRODUCT ---
        if (!empty($size_stocks)) {
            foreach ($size_stocks as $size_name => $qty) {
                $size_name = mysqli_real_escape_string($conn, $size_name);
                $qty = (int)$qty;
                mysqli_query($conn, "INSERT INTO product_size_stock (product_id, item_type, size_name, stock_count) 
                                     VALUES ('$parent_id', 'main', '$size_name', '$qty')");
            }
        }
        
        // 4. HANDLE SUB PRODUCTS
        if (isset($_POST['subs'])) {
            $subs = json_decode($_POST['subs'], true);
            foreach ($subs as $index => $s) {
                $sub_img_path = isset($s['image']) ? $s['image'] : "";
                
                if (isset($_FILES["sub_file_$index"]) && $_FILES["sub_file_$index"]['error'] === 0) {
                    $sName = time() . "_sub_" . preg_replace("/[^A-Za-z0-9.]/", "_", $_FILES["sub_file_$index"]['name']);
                    move_uploaded_file($_FILES["sub_file_$index"]['tmp_name'], $srvSubDir . $sName);
                    $sub_img_path = $dbSubDir . $sName;
                }

                $sub_name = mysqli_real_escape_string($conn, $s['name']);
                $sub_price = mysqli_real_escape_string($conn, $s['price']);
                $sub_total_stock = (int)$s['stock'];
                $sub_sizes_str = is_array($s['sizes']) ? implode(',', $s['sizes']) : $s['sizes'];
                // Sub products inherit the same category as the parent
                $sub_category = $category; 
                
                // Insert Sub Product (Adding category here as well for consistency)
                mysqli_query($conn, "INSERT INTO mamag_subs (parent_id, name, price, stock, sizes, image) 
                                     VALUES ('$parent_id', '$sub_name', '$sub_price', '$sub_total_stock', '$sub_sizes_str', '$sub_img_path')");
                $sub_id = mysqli_insert_id($conn);

                // --- SAVE SIZE-SPECIFIC STOCK FOR SUB PRODUCT ---
                if (isset($s['size_stocks']) && !empty($s['size_stocks'])) {
                    foreach ($s['size_stocks'] as $size_name => $qty) {
                        $size_name = mysqli_real_escape_string($conn, $size_name);
                        $qty = (int)$qty;
                        mysqli_query($conn, "INSERT INTO product_size_stock (product_id, item_type, size_name, stock_count) 
                                             VALUES ('$sub_id', 'sub', '$size_name', '$qty')");
                    }
                }
            }
        }
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => mysqli_error($conn)]);
    }
}
?>