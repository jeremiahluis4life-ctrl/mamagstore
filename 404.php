<?php
// Set the correct 404 status header
header("HTTP/1.1 404 Not Found");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 | ACCESS DENIED - MAMAG OFFICIAL</title>
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Acme&family=Tomorrow:wght@400;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>

    <style>
        :root {
            --mamag-black: #0a0a0a;
            --mamag-white: #f5f5f5;
            --mamag-accent: #ff003c; /* Cyber-red accent */
        }

        body {
            background-color: var(--mamag-black);
            color: var(--mamag-white);
            font-family: 'acme' ;
            margin: 0;
            overflow: hidden; /* Keep the vibe contained */
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
        }

        .error-container {
            text-align: center;
            z-index: 10;
        }

        .glitch {
            font-size: 8rem;
            font-weight: 900;
            text-transform: uppercase;
            position: relative;
            display: inline-block;
            line-height: 1;
            font-family: 'Acme', sans-serif;
        }

        /* Glitch Animation Logic */
        .glitch::before, .glitch::after {
            content: "404";
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--mamag-black);
        }

        .glitch::before {
            left: 2px;
            text-shadow: -2px 0 var(--mamag-accent);
            clip: rect(44px, 450px, 56px, 0);
            animation: glitch-anim 5s infinite linear alternate-reverse;
        }

        .glitch::after {
            left: -2px;
            text-shadow: -2px 0 #00fff9;
            clip: rect(44px, 450px, 56px, 0);
            animation: glitch-anim2 5s infinite linear alternate-reverse;
        }

        @keyframes glitch-anim {
            0% { clip: rect(10px, 9999px, 20px, 0); }
            20% { clip: rect(80px, 9999px, 90px, 0); }
            100% { clip: rect(40px, 9999px, 50px, 0); }
        }

        @keyframes glitch-anim2 {
            0% { clip: rect(30px, 9999px, 40px, 0); }
            50% { clip: rect(60px, 9999px, 70px, 0); }
            100% { clip: rect(15px, 9999px, 25px, 0); }
        }

        .status-msg {
            font-size: 1.2rem;
            letter-spacing: 5px;
            text-transform: uppercase;
            margin-bottom: 2rem;
            opacity: 0.8;
        }

        .back-btn {
            padding: 15px 40px;
            border: 1px solid var(--mamag-white);
            background: transparent;
            color: var(--mamag-white);
            text-transform: uppercase;
            font-weight: bold;
            letter-spacing: 2px;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-block;
        }

        .back-btn:hover {
            background: var(--mamag-white);
            color: var(--mamag-black);
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(255, 0, 60, 0.2);
        }

        /* Background scanning lines effect */
        .scanline {
            width: 100%;
            height: 100px;
            z-index: 5;
            background: linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.02) 50%, rgba(0, 0, 0, 0) 100%);
            opacity: 0.1;
            position: absolute;
            bottom: 100%;
            animation: scanline 10s linear infinite;
        }

        @keyframes scanline {
            0% { bottom: 100%; }
            100% { bottom: -100%; }
        }
    </style>
</head>
<body>

    <div class="scanline"></div>

    <div class="error-container">
        <div class="glitch" data-text="404">404</div>
        <p class="status-msg">Lost in the System</p>
        <p class="mb-8 opacity-60 max-w-xs mx-auto text-sm">
            The page you are looking for has been archived, moved, or never existed in this dimension.
        </p>
        <a href="index.php" class="back-btn">Return Home</a>
    </div>

</body>
</html>