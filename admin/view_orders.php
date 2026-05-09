<?php
include 'admin/db.php';
session_start();

// Fetch all orders, newest first
$query = "SELECT * FROM mamag_orders ORDER BY created_at DESC";
$result = mysqli_query($conn, $query);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Admin - Order Management</title>
    <style>
        body { font-family: sans-serif; background: #f4f4f4; padding: 20px; }
        .order-card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .order-header { display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px; }
        .status-paid { background: #27ae60; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .method-badge { background: #3498db; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th { text-align: left; color: #666; font-size: 13px; }
        td { padding: 8px 0; border-bottom: 1px solid #fafafa; font-size: 14px; }
        .item-img { width: 50px; height: 50px; object-fit: cover; border-radius: 4px; margin-right: 10px; }
    </style>
</head>
<body>

    <h2>Customer Orders</h2>

    <?php while($order = mysqli_fetch_assoc($result)): ?>
        <div class="order-card">
            <div class="order-header">
                <div>
                    <strong>Order Ref: <?php echo $order['reference']; ?></strong><br>
                    <small>Customer: <?php echo $order['user_email']; ?></small>
                </div>
                <div>
                    <span class="method-badge"><?php echo strtoupper($order['method']); ?></span>
                    <span class="status-paid"><?php echo $order['status']; ?></span>
                </div>
            </div>

            <div class="order-details">
                <p><strong>Address:</strong> <?php echo $order['address']; ?></p>
                
                <table>
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Size</th>
                            <th>Qty</th>
                            <th>Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php 
                        // DECODE THE JSON ITEMS
                        $items = json_decode($order['items'], true); 
                        if(is_array($items)):
                            foreach($items as $item): 
                        ?>
                        <tr>
                            <td style="display:flex; align-items:center;">
                                <img src="<?php echo $item['image']; ?>" class="item-img">
                                <?php echo $item['name']; ?>
                            </td>
                            <td><?php echo $item['size']; ?></td>
                            <td><?php echo $item['quantity']; ?></td>
                            <td><?php echo $item['price']; ?></td>
                        </tr>
                        <?php endforeach; endif; ?>
                    </tbody>
                </table>

                <div style="text-align: right; margin-top: 15px; font-size: 18px;">
                    <strong>Total Paid: ₦<?php echo number_format((float)str_replace(['₦', ','], '', $order['total_amount']), 2); ?></strong>
                </div>
            </div>
        </div>
    <?php endwhile; ?>

</body>
</html>