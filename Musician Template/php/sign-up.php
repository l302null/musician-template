<?php
chmod 640 sign-up.php
chown www-data:www-data sign-up.php

// Database configuration
$db_host = 'localhost'; // or your PostgreSQL server address
$db_name = 'your_database_name';
$db_user = 'your_username';
$db_pass = 'your_password';

// Connect to PostgreSQL
try {
    $db_conn = new PDO("pgsql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $db_conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

// Process form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Validate email
    $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
    
    if ($email) {
        try {
            // Prepare SQL statement
            $stmt = $db_conn->prepare("INSERT INTO subscribers (email, subscription_date) VALUES (:email, NOW())");
            
            // Bind parameters and execute
            $stmt->bindParam(':email', $email);
            $stmt->execute();
            
            // Success message
            echo "Thank you for subscribing!";
        } catch (PDOException $e) {
            // Handle duplicate entries or other SQL errors
            if ($e->getCode() == '23505') { // Unique violation
                echo "This email is already subscribed.";
            } else {
                echo "Error: " . $e->getMessage();
            }
        }
    } else {
        echo "Please enter a valid email address.";
    }
}

// Close connection
$db_conn = null;
?>