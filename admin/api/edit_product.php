<?php
require_once '../../includes/db.php';
header('Content-Type: application/json');

// Start session if not started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['admin_auth'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

// 1. PATH CONFIGURATION
$srvImgDir   = '../uploads/images/';
$srvSubDir   = '../uploads/subs/';
$srvVidDir   = '../uploads/videos/';
$srvAddonDir = '../uploads/addons/'; 

$dbImgDir   = 'uploads/images/';
$dbSubDir   = 'uploads/subs/';
$dbVidDir   = 'uploads/videos/';
$dbAddonDir = 'uploads/addons/';

if (!file_exists($srvAddonDir)) mkdir($srvAddonDir, 0777, true);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    // CLEAN UP REMOVED SUB-IMAGES
    if (isset($_POST['delete_files'])) {
        $filesToRemove = json_decode($_POST['delete_files'], true);
        if (is_array($filesToRemove)) {
            foreach ($filesToRemove as $filePath) {
                if (strpos($filePath, 'uploads/') !== false) {
                    $fullPath = "../" . $filePath;
                    if (file_exists($fullPath)) {
                        unlink($fullPath);
                    }
                }
            }
        }
    }

    $id       = mysqli_real_escape_string($conn, $_POST['id']);
    $name     = mysqli_real_escape_string($conn, $_POST['name']);
    $category = mysqli_real_escape_string($conn, $_POST['category']); // CAPTURE CATEGORY
    $price    = mysqli_real_escape_string($conn, $_POST['price']);
    $stock    = mysqli_real_escape_string($conn, $_POST['stock']); 
    $type     = $_POST['type'] ?? 'product';

    // ==========================================
    // BRANCH A: UPDATE ADD-ON (ACCESSORIES)
    // ==========================================
    if ($type === 'addon') {
        $updateImg = "";
        
        if (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === 0) {
            $aName = time() . "_addon_" . preg_replace("/[^A-Za-z0-9.]/", "_", $_FILES['image_file']['name']);
            if (move_uploaded_file($_FILES['image_file']['tmp_name'], $srvAddonDir . $aName)) {
                
                $oldRes = mysqli_query($conn, "SELECT image FROM mamag_addons WHERE id='$id'");
                $old = mysqli_fetch_assoc($oldRes);
                if (!empty($old['image']) && file_exists("../" . $old['image'])) {
                    unlink("../" . $old['image']);
                }
                
                $pathForDb = $dbAddonDir . $aName;
                $updateImg = ", image='$pathForDb'";
            }
        }

        // Added category to the update statement
        $sql = "UPDATE mamag_addons SET name='$name', category='$category', price='$price', stock='$stock' $updateImg WHERE id='$id'";
        if (mysqli_query($conn, $sql)) {
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "error", "message" => mysqli_error($conn)]);
        }
        exit();
    }

    // ==========================================
    // BRANCH B: UPDATE MAIN PRODUCT
    // ==========================================
    $sizes = mysqli_real_escape_string($conn, $_POST['sizes']);
    $size_stocks = isset($_POST['size_stocks']) ? json_decode($_POST['size_stocks'], true) : [];
    
    $oldMediaRes = mysqli_query($conn, "SELECT main_image, video_path FROM mamag_products WHERE id='$id'");
    $oldMedia = mysqli_fetch_assoc($oldMediaRes);
    $updateMedia = "";

    if (isset($_FILES['video_file']) && $_FILES['video_file']['error'] === 0) {
        $vName = time() . "_" . preg_replace("/[^A-Za-z0-9.]/", "_", $_FILES['video_file']['name']);
        if(move_uploaded_file($_FILES['video_file']['tmp_name'], $srvVidDir . $vName)) {
            $pathForDb = $dbVidDir . $vName;
            $updateMedia = ", video_path='$pathForDb', main_image=NULL ";

            if (!empty($oldMedia['video_path']) && file_exists("../" . $oldMedia['video_path'])) unlink("../" . $oldMedia['video_path']);
            if (!empty($oldMedia['main_image']) && file_exists("../" . $oldMedia['main_image'])) unlink("../" . $oldMedia['main_image']);
        }
    } elseif (isset($_FILES['image_file']) && $_FILES['image_file']['error'] === 0) {
        $iName = time() . "_" . preg_replace("/[^A-Za-z0-9.]/", "_", $_FILES['image_file']['name']);
        if(move_uploaded_file($_FILES['image_file']['tmp_name'], $srvImgDir . $iName)) {
            $pathForDb = $dbImgDir . $iName;
            $updateMedia = ", main_image='$pathForDb', video_path=NULL ";

            if (!empty($oldMedia['main_image']) && file_exists("../" . $oldMedia['main_image'])) unlink("../" . $oldMedia['main_image']);
            if (!empty($oldMedia['video_path']) && file_exists("../" . $oldMedia['video_path'])) unlink("../" . $oldMedia['video_path']);
        }
    }

    // Added category to the update statement
    $sql = "UPDATE mamag_products SET name='$name', category='$category', price='$price', stock='$stock', sizes='$sizes' $updateMedia WHERE id='$id'";

    if (mysqli_query($conn, $sql)) {
        
        // SYNC MAIN PRODUCT SIZE STOCKS
        mysqli_query($conn, "DELETE FROM product_size_stock WHERE product_id = '$id' AND item_type = 'main'");
        if (!empty($size_stocks)) {
            foreach ($size_stocks as $size_name => $qty) {
                $size_name = mysqli_real_escape_string($conn, $size_name);
                $qty = (int)$qty;
                mysqli_query($conn, "INSERT INTO product_size_stock (product_id, item_type, size_name, stock_count) 
                                     VALUES ('$id', 'main', '$size_name', '$qty')");
            }
        }

        // SYNC SUB-PRODUCTS
        if (isset($_POST['subs'])) {
            $oldSubsRes = mysqli_query($conn, "SELECT id FROM mamag_subs WHERE parent_id = '$id'");
            while($subRow = mysqli_fetch_assoc($oldSubsRes)) {
                $oldSubId = $subRow['id'];
                mysqli_query($conn, "DELETE FROM product_size_stock WHERE product_id = '$oldSubId' AND item_type = 'sub'");
            }
            
            mysqli_query($conn, "DELETE FROM mamag_subs WHERE parent_id = '$id'");
            
            $subs = json_decode($_POST['subs'], true);
            foreach ($subs as $index => $s) {
                $subName = mysqli_real_escape_string($conn, $s['name']);
                $subPrice = mysqli_real_escape_string($conn, $s['price']);
                $subTotalStock = mysqli_real_escape_string($conn, $s['stock']);
                $szStr = is_array($s['sizes']) ? implode(',', $s['sizes']) : $s['sizes'];
                $imagePath = mysqli_real_escape_string($conn, $s['image']);
                
                $fileKey = "sub_file_" . $index;
                if (isset($_FILES[$fileKey]) && $_FILES[$fileKey]['error'] === 0) {
                    $sFileName = time() . "_sub_" . preg_replace("/[^A-Za-z0-9.]/", "_", $_FILES[$fileKey]['name']);
                    if (move_uploaded_file($_FILES[$fileKey]['tmp_name'], $srvSubDir . $sFileName)) {
                        if(!empty($s['image']) && strpos($s['image'], 'uploads/') !== false && file_exists("../" . $s['image'])) {
                            unlink("../" . $s['image']);
                        }
                        $imagePath = $dbSubDir . $sFileName;
                    }
                }

                mysqli_query($conn, "INSERT INTO mamag_subs (parent_id, name, price, stock, sizes, image) 
                                     VALUES ('$id', '$subName', '$subPrice', '$subTotalStock', '$szStr', '$imagePath')");
                $newSubId = mysqli_insert_id($conn);

                if (isset($s['size_stocks']) && !empty($s['size_stocks'])) {
                    foreach ($s['size_stocks'] as $size_name => $qty) {
                        $size_name = mysqli_real_escape_string($conn, $size_name);
                        $qty = (int)$qty;
                        mysqli_query($conn, "INSERT INTO product_size_stock (product_id, item_type, size_name, stock_count) 
                                             VALUES ('$newSubId', 'sub', '$size_name', '$qty')");
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