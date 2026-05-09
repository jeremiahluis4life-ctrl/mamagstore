<?php
// 1. CORS Handshake - MUST be at the very top
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
    header('Access-Control-Allow-Credentials: true');
}

// 2. Session Configuration 
// We use the standard path first to ensure it works before getting fancy
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_path', '/');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 3. Connection
$host   = $_ENV['DB_HOST'] ?? "localhost";
$user   = $_ENV['DB_USER'] ?? "root";
$pass   = $_ENV['DB_PASS'] ?? "";
$dbname = $_ENV['DB_NAME'] ?? "mamag_db";

$conn = @mysqli_connect($host, $user, $pass, $dbname);

?>