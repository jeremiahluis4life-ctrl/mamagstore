<?php
// Location: /api/cleanup_latest.php

if (!isset($conn)) {
    include __DIR__ . '/../includes/db.php'; 
}

function runAutoCleanup($conn) {
    // 1. Setup the Absolute Path to the Admin folder
    // Since this script is in /api/, we go up one level to root, then into admin
    $adminBase = realpath(__DIR__ . '/../admin/') . DIRECTORY_SEPARATOR;

    // 2. Fetch products older than 36 hours
    $sql = "SELECT id, main_image, video_path FROM mamag_products 
            WHERE product_type = 'latest' 
            AND created_at < NOW() - INTERVAL 36 HOUR";

    $result = mysqli_query($conn, $sql);
    if (!$result) return;

    while ($row = mysqli_fetch_assoc($result)) {
        $id = intval($row['id']);

        // --- FILE CLEANUP LOGIC ---
        $filesToDelete = [$row['main_image'], $row['video_path']];

        foreach ($filesToDelete as $rawPath) {
            if (empty($rawPath)) continue;

            // CLEAN THE PATH: 
            // Remove leading slashes, replace / with the system separator
            $cleanPath = ltrim($rawPath, '/\\');
            $cleanPath = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $cleanPath);
            
            $fullPath = $adminBase . $cleanPath;

            if (file_exists($fullPath)) {
                unlink($fullPath);
            } else {
                // DEBUG: If deletion fails, log exactly where it looked
                error_log("Cleanup failed to find file: " . $fullPath);
            }
        }

        // --- DATABASE REMOVAL ---
        // We delete the row AFTER attempting to delete the files
        mysqli_query($conn, "DELETE FROM mamag_products WHERE id = $id");
    }
}

// Execution logic
if (basename($_SERVER['PHP_SELF']) == 'cleanup_latest.php') {
    runAutoCleanup($conn);
    header('Content-Type: application/json');
    echo json_encode(["status" => "success", "message" => "Cleanup completed."]);
} else {
    runAutoCleanup($conn);
}