<?php
include 'db.php'; 
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if ($data) {
    mysqli_begin_transaction($conn);

    try {
        $type = mysqli_real_escape_string($conn, $data['type']);
        $name = mysqli_real_escape_string($conn, $data['name']);
        $price = $data['price'];
        $image = $data['image'];
        
        // 1. Calculate and Prepare Main Product
        $size_stocks = $data['size_stocks']; // Format: {"M": 10, "L": 5}
        $totalStock = array_sum($size_stocks);
        $sizeList = implode(',', array_keys($size_stocks));

        $sql = "INSERT INTO mamag_products (product_type, name, price, stock, sizes, main_image) 
                VALUES ('$type', '$name', '$price', '$totalStock', '$sizeList', '$image')";
        
        if (!mysqli_query($conn, $sql)) throw new Exception("Main Product Insert Failed");
        
        $parent_id = mysqli_insert_id($conn);

        // 2. Insert Main Product SIZES into product_size_stock
        foreach ($size_stocks as $sizeName => $qty) {
            $sizeName = mysqli_real_escape_string($conn, $sizeName);
            $sqlSize = "INSERT INTO product_size_stock (product_id, size_name, stock_count) 
                        VALUES ('$parent_id', '$sizeName', '$qty')";
            mysqli_query($conn, $sqlSize);
        }

        // 3. Handle Sub Products
        if (!empty($data['subs'])) {
            foreach ($data['subs'] as $sub) {
                $sName = mysqli_real_escape_string($conn, $sub['name']);
                $sPrice = $sub['price'];
                $sImg = $sub['image'];
                $sSizeStocks = $sub['size_stocks']; // The breakdown for the sub
                $sTotalStock = array_sum($sSizeStocks);
                $sSizeList = implode(',', array_keys($sSizeStocks));

                $sqlSub = "INSERT INTO mamag_subs (parent_id, name, price, stock, sizes, image) 
                           VALUES ('$parent_id', '$sName', '$sPrice', '$sTotalStock', '$sSizeList', '$sImg')";
                
                if (!mysqli_query($conn, $sqlSub)) throw new Exception("Sub Product Insert Failed");
                
                $sub_id = mysqli_insert_id($conn);

                // 4. Insert Sub Product SIZES into product_size_stock
                foreach ($sSizeStocks as $sizeName => $qty) {
                    $sizeName = mysqli_real_escape_string($conn, $sizeName);
                    $sqlSubSize = "INSERT INTO product_size_stock (product_id, size_name, stock_count) 
                                   VALUES ('$sub_id', '$sizeName', '$qty')";
                    mysqli_query($conn, $sqlSubSize);
                }
            }
        }

        mysqli_commit($conn);
        echo json_encode(["status" => "success"]);

    } catch (Exception $e) {
        mysqli_rollback($conn);
        echo json_encode(["status" => "error", "message" => $e->getMessage()]);
    }
}
?>