<?php
$email = $_GET['email'] ?? '';
$token = $_GET['token'] ?? '';

if (!$email || !$token) {
    die("Invalid reset link. Please request a new one.");
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password | MAMAG</title>
    <link href="https://fonts.googleapis.com/css2?family=Lobster+Two&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
     <link href="https://fonts.googleapis.com/css2?family=Acme&display=swap" rel="stylesheet">
    <style>
     :root { --primary: #fff; --bg: #000; --card: #111; --border: #222; --text-muted: #888; }
        body { background: var(--bg); color: #fff; font-family: "Acme", sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; overflow: hidden; }
        
        .reset-box { background: var(--card); padding: 40px; border-radius: 16px; width: 90%; max-width: 400px; border: 1px solid var(--border); text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
        b{font-weight: 500;}
        h1 { font-family: 'Lobster Two', cursive; font-size: 45px; margin: 0; color: var(--primary); letter-spacing: 2px; }
        h2 { font-size: 18px; font-weight: 400; margin-top: 10px; text-transform: uppercase; letter-spacing: 2px; color: var(--text-muted); }
        .user-email { color: #fff; font-weight: 600; background: #1a1a1a; padding: 4px 10px; border-radius: 4px; font-size: 13px; }
        
        .form-group { text-align: left; margin-bottom: 20px; position: relative; }
        label { display: block; font-size: 11px; text-transform: uppercase; color: #555; margin-bottom: 8px; letter-spacing: 1.5px; font-weight: 600; }
        
        input { width: 100%; padding: 14px; background: #080808; border: 1px solid var(--border); color: #fff; border-radius: 100px; box-sizing: border-box; font-size: 15px; transition: 0.3s; }
        input:focus { border-color: #555; outline: none; background: #0a0a0a; }

        .toggle-btn { position: absolute; right: 12px; top: 33px; cursor: pointer; color: #444; border: none; background: none; display: flex; align-items: center; }

        .btn { width: 100%; padding: 16px; background: var(--primary); color: #000; font-family: "Acme", sans-serif; border: none; border-radius: 100px; font-weight: 700; cursor: pointer; transition: 0.3s; margin-top: 10px; letter-spacing: 1px; }
        .btn:hover { background: #ddd; transform: translateY(-1px); }
        .btn:disabled { background: #333; color: #666; cursor: not-allowed; }

        /* Sleek Toast Notification */
        #toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(100px); background: #fff; color: #000; padding: 12px 25px; border-radius: 50px; font-weight: 600; font-size: 14px; transition: 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 1000; box-shadow: 0 10px 30px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 10px; }
        #toast.show { transform: translateX(-50%) translateY(0); }
         
        @media (max-width: 768px){
            .reset-box {
                width: 80%;
                padding: 20px;
            }
        }
        </style>
        <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body>

<div class="reset-box">
    <h1>MAMAG</h1>
    <h2>New Password</h2>
    <p>Account: <b><?php echo htmlspecialchars($email); ?></b></p>

    <form id="resetForm">
        <input type="hidden" id="email" value="<?php echo htmlspecialchars($email); ?>">
        <input type="hidden" id="token" value="<?php echo htmlspecialchars($token); ?>">
        
        <div class="form-group">
            <label>New Password</label>
            <input type="password" id="password" placeholder="••••••••" required>
            <span class="toggle-btn" onclick="togglePass('password', this)"><i data-lucide="eye"></i></span>
        </div>
        
        <div class="form-group">
            <label>Confirm Password</label>
            <input type="password" id="confirm" placeholder="••••••••" required>
            <span class="toggle-btn" onclick="togglePass('confirm', this)"><i data-lucide="eye"></i></span>
        </div>

        <button type="submit" class="btn" id="submitBtn">UPDATE PASSWORD</button>
    </form>
</div>

<div id="toast"></div>

<script>
    // Initialize icons immediately
    lucide.createIcons();

    function showToast(msg, isSuccess = true) {
        const toast = document.getElementById('toast');
        if (!toast) return; // Safety check
        toast.innerText = msg;
        toast.style.background = isSuccess ? '#fff' : '#ff4444';
        toast.style.color = isSuccess ? '#000' : '#fff';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    function togglePass(id, el) {
        const input = document.getElementById(id);
        if (input.type === 'password') {
            input.type = 'text';
            el.innerHTML = '<i data-lucide="eye-off"></i>';
        } else {
            input.type = 'password';
            el.innerHTML = '<i data-lucide="eye"></i>';
        }
        lucide.createIcons(); // Re-render icon after changing innerHTML
    }

    document.getElementById('resetForm').onsubmit = async (e) => {
        e.preventDefault();
        const btn = document.getElementById('submitBtn');
        const pass = document.getElementById('password').value;
        const conf = document.getElementById('confirm').value;

        if(pass.length < 8) return showToast("Password too short! ⚠️", false);
        if(pass !== conf) return showToast("Passwords do not match! ❌", false);

        btn.innerText = "UPDATING...";
        btn.disabled = true;

        // FIXED: Added missing 'try' bracket below
        try {
            const response = await fetch('includes/auth.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'reset_password',
                    email: document.getElementById('email').value,
                    token: document.getElementById('token').value,
                    password: pass
                })
            });

            const result = await response.json();
            if(result.status === 'success') {
                showToast("Password updated! Redirecting... ✨");
                setTimeout(() => window.location.href = 'index.php', 2000);
            } else {
                showToast(result.message, false);
                btn.innerText = "UPDATE PASSWORD";
                btn.disabled = false;
            }
        } catch (err) {
            showToast("Server error! ❌", false);
            btn.innerText = "UPDATE PASSWORD";
            btn.disabled = false;
        }
    };
</script>

</body>
</html>