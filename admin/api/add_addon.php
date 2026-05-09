<?php
require_once '../../includes/db.php';
header('Content-Type: application/json');

// Check auth (assuming your session logic is in db.php)
if (!isset($_SESSION['admin_auth'])) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = mysqli_real_escape_string($conn, $_POST['name']);
    $price = mysqli_real_escape_string($conn, $_POST['price']);
    $stock = (int)$_POST['stock'];
    
    $imagePath = "";
    if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
        $fileName = time() . "_" . preg_replace("/[^A-Za-z0-9.]/", "_", $_FILES['image']['name']);
        if (move_uploaded_file($_FILES['image']['tmp_name'], '../uploads/addons/' . $fileName)) {
            $imagePath = 'uploads/addons/' . $fileName;
        }
    }

    $sql = "INSERT INTO mamag_addons (name, price, image, stock) VALUES ('$name', '$price', '$imagePath', '$stock')";

    if (mysqli_query($conn, $sql)) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error", "message" => mysqli_error($conn)]);
    }
}
?>