<?php
session_start();

// Unset all admin session variables
unset($_SESSION['admin_auth']);
unset($_SESSION['admin_id']);
unset($_SESSION['admin_name']);

// Destroy the session entirely
header("Location: adminlogin.php");

session_destroy();
?>