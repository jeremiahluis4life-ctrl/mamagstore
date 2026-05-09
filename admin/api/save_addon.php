<?php
ob_start();
require_once '../../includes/db.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = mysqli_real_escape_string($conn, $_POST['name']);
    $price = mysqli_real_escape_string($conn, $_POST['price']);
    $stock = (int)$_POST['stock'];
    $desc = mysqli_real_escape_string($conn, $_POST['description'] ?? '');
    
    $imagePath = "";
    if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
        $fileName = time() . "_addon_" . preg_replace("/[^A-Za-z0-9.]/", "_", $_FILES['image']['name']);
        
        // IMPORTANT: Verify this folder exists at admin/uploads/addons/
        if (move_uploaded_file($_FILES['image']['tmp_name'], '../uploads/addons/' . $fileName)) {
            $imagePath = 'uploads/addons/' . $fileName;
        }
    }

    if (empty($imagePath)) {
        ob_clean();
        echo json_encode(["status" => "error", "message" => "Image upload failed. Check folder permissions."]);
        exit;
    }

    // Matching your DB screenshot exactly: id(auto), name, price, image, description, stock, status(default), created_at(default)
    $sql = "INSERT INTO mamag_addons (name, price, image, description, stock) 
            VALUES ('$name', '$price', '$imagePath', '$desc', '$stock')";

    if (mysqli_query($conn, $sql)) {
        ob_clean();
        echo json_encode(["status" => "success"]);
    } else {
        ob_clean();
        echo json_encode(["status" => "error", "message" => mysqli_error($conn)]);
    }
}
ob_end_flush();
?>