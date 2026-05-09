<?php
// Load environment variables
require_once __DIR__ . '/../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// Connection details
$host = $_ENV['DB_HOST'] ?? 'localhost';
$user = $_ENV['DB_USER'] ?? 'root';
$pass = $_ENV['DB_PASS'] ?? '';
$name = 'mamag_db'; // Hardcoded as requested
$table = 'mamag_orders';

$conn = new mysqli($host, $user, $pass, $name);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// 1. Get the table structure
$res = $conn->query("SHOW CREATE TABLE `$table`");
$row = $res->fetch_row();
$sql_dump = "-- MAMAG DB BACKUP\n";
$sql_dump .= "-- Date: " . date('Y-m-d H:i:s') . "\n\n";
$sql_dump .= "DROP TABLE IF EXISTS `$table`;\n\n" . $row[1] . ";\n\n";

// 2. Get the table data
$res = $conn->query("SELECT * FROM `$table`");
while ($row = $res->fetch_assoc()) {
    $keys = array_keys($row);
    $values = array_values($row);
    
    // Escape values safely
    $escaped_values = array_map(function($val) use ($conn) {
        if ($val === null) return "NULL";
        return "'" . $conn->real_escape_string($val) . "'";
    }, $values);

    $sql_dump .= "INSERT INTO `$table` (`" . implode("`, `", $keys) . "`) VALUES (" . implode(", ", $escaped_values) . ");\n";
}

// 3. Force the download
$filename = "mamag_orders_backup_" . date("Ymd_His") . ".sql";
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . $filename . '"');
echo $sql_dump;

$conn->close();
exit;