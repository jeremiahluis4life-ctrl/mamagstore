<?php
include '../includes/db.php'; 
header('Content-Type: application/json');

include 'cleanup_latest.php';

/**
 * 1. PERMANENT CLEANUP LOGIC
 * Automatically deletes files and database records older than 36 hours.
 * This runs every time the latest updates are fetched.
 */
$cleanup_sql = "SELECT id, main_image, video_path FROM mamag_products 
                WHERE product_type = 'latest' 
                AND created_at < NOW() - INTERVAL 36 HOUR";

$cleanup_res = mysqli_query($conn, $cleanup_sql);

if ($cleanup_res) {
    while ($old_item = mysqli_fetch_assoc($cleanup_res)) {
        $item_id = $old_item['id'];
        
        // Base path to the admin folder where media is stored
        $admin_base = "../../admin/";

        // Delete physical image
        if (!empty($old_item['main_image'])) {
            $image_path = $admin_base . $old_item['main_image'];
            if (file_exists($image_path)) {
                unlink($image_path);
            }
        }
        
        // Delete physical video
        if (!empty($old_item['video_path'])) {
            $video_path = $admin_base . $old_item['video_path'];
            if (file_exists($video_path)) {
                unlink($video_path);
            }
        }
        
        // Remove from Database
        $stmt = mysqli_prepare($conn, "DELETE FROM mamag_products WHERE id = ?");
        mysqli_stmt_bind_param($stmt, "i", $item_id);
        mysqli_stmt_execute($stmt);
    }
}

/**
 * 2. FETCH ACTIVE UPDATES
 * Fetch items created within the last 36 hours.
 * Note: We MUST include created_at for the frontend JS timer.
 */
$sql = "SELECT id, name, price, main_image, video_path, created_at FROM mamag_products 
        WHERE product_type = 'latest' 
        ORDER BY id DESC LIMIT 15";

$result = mysqli_query($conn, $sql);
$arrivals = [];

if ($result) {
    while($row = mysqli_fetch_assoc($result)) {
        $type = !empty($row['video_path']) ? 'video' : 'image';
        $media = !empty($row['video_path']) ? $row['video_path'] : $row['main_image'];
        
        $arrivals[] = [
            'id'         => $row['id'],
            'type'       => $type,
            'url'        => 'admin/' . $media, 
            'name'       => $row['name'],
            'price'      => "₦" . number_format($row['price']),
            // CRITICAL: Send the creation time to JS
            'created_at' => $row['created_at'] 
        ];
    }
}

echo json_encode($arrivals);
?>