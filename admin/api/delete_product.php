<?php
require_once '../../includes/db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['admin_auth'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

if (isset($_GET['id'])) {
    $id = mysqli_real_escape_string($conn, $_GET['id']);
    $type = $_GET['type'] ?? 'product'; // 'product' or 'addon'

    if ($type === 'addon') {
        // --- DELETE ADDON ---
        $res = mysqli_query($conn, "SELECT image FROM mamag_addons WHERE id = '$id'");
        $addon = mysqli_fetch_assoc($res);
        
        if ($addon && !empty($addon['image'])) {
            $path = "../" . $addon['image'];
            if (file_exists($path)) unlink($path);
        }

        if (mysqli_query($conn, "DELETE FROM mamag_addons WHERE id = '$id'")) {
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "error", "message" => mysqli_error($conn)]);
        }
    } else {
        // --- DELETE PRODUCT & SUBS ---

        // 1. Delete Sub-product Files & Stock
        $subQuery = mysqli_query($conn, "SELECT id, image FROM mamag_subs WHERE parent_id = '$id'");
        while ($sub = mysqli_fetch_assoc($subQuery)) {
            $subId = $sub['id'];
            // Delete sub image
            if (!empty($sub['image'])) {
                $path = "../" . $sub['image'];
                if (file_exists($path)) unlink($path);
            }
            // Delete sub size stock entries
            mysqli_query($conn, "DELETE FROM product_size_stock WHERE product_id = '$subId' AND item_type = 'sub'");
        }
        mysqli_query($conn, "DELETE FROM mamag_subs WHERE parent_id = '$id'");

        // 2. Delete Main Product Files
        $mainFile = mysqli_query($conn, "SELECT main_image, video_path FROM mamag_products WHERE id = '$id'");
        $product = mysqli_fetch_assoc($mainFile);

        if ($product) {
            if (!empty($product['main_image'])) {
                $path = "../" . $product['main_image'];
                if (file_exists($path)) unlink($path);
            }
            if (!empty($product['video_path'])) {
                $path = "../" . $product['video_path'];
                if (file_exists($path)) unlink($path);
            }
        }

        // 3. Delete Main Stock breakdown
        mysqli_query($conn, "DELETE FROM product_size_stock WHERE product_id = '$id' AND item_type = 'main'");

        // 4. Delete Main Product entry
        if (mysqli_query($conn, "DELETE FROM mamag_products WHERE id = '$id'")) {
            echo json_encode(["status" => "success"]);
        } else {
            echo json_encode(["status" => "error", "message" => mysqli_error($conn)]);
        }
    }
}
?>