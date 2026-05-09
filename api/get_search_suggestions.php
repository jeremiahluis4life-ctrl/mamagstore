<?php
header('Content-Type: application/json');
include '../includes/db.php';

$results = [
    "trending" => [],
    "quick" => [
        ["text" => "latest", "label" => "Latest Updates", "emoji" => "🔥"],
        ["text" => "arrival", "label" => "New Arrivals", "emoji" => "✨"],
        ["text" => "stock", "label" => "In Stock", "emoji" => "✅"]
    ]
];

try {
    // Combined unique names from both main and sub tables
    $trendingSql = "
        SELECT DISTINCT name FROM (
            SELECT name FROM mamag_products
            UNION 
            SELECT name FROM mamag_subs
        ) as combined
        ORDER BY RAND() 
        LIMIT 6";

    $trending = mysqli_query($conn, $trendingSql);

    if ($trending) {
        while($row = mysqli_fetch_assoc($trending)) {
            $results['trending'][] = $row['name'];
        }
    }
} catch (Exception $e) {
    // Fallback handled by JS
}

echo json_encode($results);
exit;