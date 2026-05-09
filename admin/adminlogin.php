<?php
// 1. Use the shared session and DB config
// This ensures we use the /sessions folder for the login
require_once __DIR__ . '/../includes/db.php'; 

$error = "";
$success = "";

// Check if cookie exists to pre-fill email
$remembered_email = isset($_COOKIE['admin_user']) ? $_COOKIE['admin_user'] : "";

// Use the $conn created in db.php
$check = $conn->query("SELECT id FROM admin_login LIMIT 1");
$registrationLocked = ($check->num_rows > 0);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    if (isset($_POST['login'])) {
        $email = mysqli_real_escape_string($conn, $_POST['email']);
        $pass = $_POST['password'];

        $result = $conn->query("SELECT * FROM admin_login WHERE email='$email'");
        if ($result && $result->num_rows > 0) {
            $user = $result->fetch_assoc();
            
            if (password_verify($pass, $user['password'])) {
                
                // Set the exact variables index.php is looking for
                $_SESSION['admin_auth'] = true;
                $_SESSION['admin_id'] = $user['id'];
                $_SESSION['admin_name'] = $user['fullname'];
                
                // IMPORTANT: Ensure the session is saved before redirecting
                session_write_close();
                header("Location: index.php");
                exit();
            } else { $error = "Invalid Password."; }
        } else { $error = "No Admin account found."; }
    }
}



// Database Connection
$conn = new mysqli("localhost", "root", "", "mamag_db");

if ($conn->connect_error) { die("Connection failed: " . $conn->connect_error); }

$error = "";
$success = "";

// Check if cookie exists to pre-fill email
$remembered_email = isset($_COOKIE['admin_user']) ? $_COOKIE['admin_user'] : "";

// Lock registration if at least one admin exists
$check = $conn->query("SELECT id FROM admin_login LIMIT 1");
$registrationLocked = ($check->num_rows > 0);   

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // --- SIGNUP LOGIC ---
    if (isset($_POST['signup']) && !$registrationLocked) {
        $fullname = mysqli_real_escape_string($conn, $_POST['fullname']);
        $email = mysqli_real_escape_string($conn, $_POST['email']);
        $password = password_hash($_POST['password'], PASSWORD_BCRYPT);

        $sql = "INSERT INTO admin_login (fullname, email, password) VALUES ('$fullname', '$email', '$password')";
        if ($conn->query($sql)) {
            $success = "Super Admin initialized! You can now sign in.";
            $registrationLocked = true;
        } else { $error = "Registration failed: " . $conn->error; }
    }

    // --- LOGIN LOGIC ---
    if (isset($_POST['login'])) {
        $email = mysqli_real_escape_string($conn, $_POST['email']);
        $pass = $_POST['password'];

        $result = $conn->query("SELECT * FROM admin_login WHERE email='$email'");
        if ($result && $result->num_rows > 0) {
            $user = $result->fetch_assoc();
            
            if (password_verify($pass, $user['password'])) {
                
                // Handle Remember Me Cookie
                if (isset($_POST['remember'])) {
                    setcookie("admin_user", $email, time() + (86400 * 30), "/");
                } else {
                    setcookie("admin_user", "", time() - 3600, "/");
                }

                // SET SESSION VARIABLES
                $_SESSION['admin_auth'] = true;
                $_SESSION['admin_id'] = $user['id'];
                $_SESSION['admin_name'] = $user['fullname'];
                
                // Redirect to the dashboard
                header("Location: index.php");
                exit();
            } else { $error = "Invalid Password."; }
        } else { $error = "No Admin account found with that email."; }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Auth | MamaG</title>
    <link href="https://fonts.googleapis.com/css2?family=Acme&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        :root { --primary: #ffffff; --bg: #ffffff; --bounce: cubic-bezier(0.68, -0.6, 0.32, 1.6); }
        body { margin: 0; background: var(--bg); display: flex; justify-content: center; align-items: center; height: 100vh; font-family: "Acme", sans-serif; color: white; overflow: hidden; }
        .auth-card { background: #000000; padding: 40px; border-radius: 24px; width: 380px; box-shadow: 0 25px 50px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.05); transition: var(--bounce) 0.6s; }
        h1 { font-size: 26px; text-align: center; margin-bottom: 10px; }
        p { color: #94a3b8; text-align: center; font-size: 14px; margin-bottom: 30px; }
        .password-wrapper { position: relative; width: 100%; }
        input { width: 100%; padding: 14px; margin: 10px 0; background: #1f2937; border: 1px solid #000000; border-radius: 12px; color: white; box-sizing: border-box; outline: none; transition: 0.3s ease; }
        input:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1); }
        .remember-container { display: flex; align-items: center; margin: 5px 0 15px 5px; font-size: 13px; color: #94a3b8; cursor: pointer; }
        .remember-container input { width: auto; margin: 0 10px 0 0; cursor: pointer; accent-color: var(--primary); }
        .eye-icon { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); cursor: pointer; color: #94a3b8; display: flex; align-items: center; }
        button { width: 100%; padding: 14px; background: var(--primary); color: black; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; margin-top: 5px; transition: var(--bounce) 0.4s; font-size: 15px; }
        button:hover { transform: translateY(-3px); box-shadow: 0 10px 20px rgba(255, 255, 255, 0.2); }
        .alert { padding: 12px; border-radius: 10px; font-size: 13px; margin-bottom: 20px; text-align: center; }
        .err { background: rgba(239, 68, 68, 0.15); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.2); }
        .success { background: rgba(34, 197, 94, 0.15); color: #86efac; border: 1px solid rgba(34, 197, 94, 0.2); }
        .toggle-link { display: block; text-align: center; margin-top: 25px; color: #fdfdfd; font-size: 13px; cursor: pointer; font-weight: 500; }
        .hidden { display: none; }
        @media (max-width: 768px){ .auth-card{ width: 70%; } }
    </style>
</head>
<body>

<div class="auth-card" id="card">
    <?php if($error) echo "<div class='alert err'>$error</div>"; ?>
    <?php if($success) echo "<div class='alert success'>$success</div>"; ?>

    <div id="login-view">
        <h1>Admin Login</h1>
        <p>Access the MamaG Admin Portal</p>
        <form method="POST">
            <input type="email" name="email" placeholder="Admin Email" value="<?php echo htmlspecialchars($remembered_email); ?>" required>
            <div class="password-wrapper">
                <input type="password" name="password" id="login-pass" placeholder="Password" required>
                <div class="eye-icon" onclick="togglePassword('login-pass', this)">
                    <i data-lucide="eye"></i>
                </div>
            </div>
            
            <label class="remember-container">
                <input type="checkbox" name="remember" <?php if($remembered_email != "") echo "checked"; ?>>
                Remember Me
            </label>

            <button type="submit" name="login">Sign In</button>
        </form>
        <?php if(!$registrationLocked): ?>
            <span class="toggle-link" onclick="toggleView()">Create Admin Account</span>
        <?php endif; ?>
    </div>

    <div id="signup-view" class="hidden">
        <h1>Initial Setup</h1>
        <p>Only one Super Admin can be initialized.</p>
        <form method="POST">
            <input type="text" name="fullname" placeholder="Full Name" required>
            <input type="email" name="email" placeholder="System Email" required>
            <div class="password-wrapper">
                <input type="password" name="password" id="signup-pass" placeholder="Master Password" required>
                <div class="eye-icon" onclick="togglePassword('signup-pass', this)">
                    <i data-lucide="eye"></i>
                </div>
            </div>
            <button type="submit" name="signup">Initialize Admin</button>
        </form>
        <span class="toggle-link" onclick="toggleView()">Back to Sign In</span>
    </div>
</div>

<script>
    lucide.createIcons();

    function togglePassword(inputId, iconContainer) {
        const input = document.getElementById(inputId);
        const icon = iconContainer.querySelector('i');
        if (input.type === "password") {
            input.type = "text";
            icon.setAttribute('data-lucide', 'eye-off');
        } else {
            input.type = "password";
            icon.setAttribute('data-lucide', 'eye');
        }
        lucide.createIcons();
    }

    function toggleView() {
        const login = document.getElementById('login-view');
        const signup = document.getElementById('signup-view');
        const card = document.getElementById('card');
        card.style.opacity = "0";
        setTimeout(() => {
            login.classList.toggle('hidden');
            signup.classList.toggle('hidden');
            card.style.opacity = "1";
        }, 300);
    }
</script>
</body>
</html>