<?php
chmod 644 isrc-tracking.php
chown www-data:www-data isrc-tracking.php

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    die(json_encode(['error' => 'Method not allowed']));
}

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['song'])) {
    http_response_code(400);
    die(json_encode(['error' => 'Song title required']));
}

$song = trim($data['song']);

// 1. Log to database (if you have one)
try {
    $pdo = new PDO('mysql:host=localhost;dbname=your_db', 'username', 'password');
    $stmt = $pdo->prepare("INSERT INTO play_counts (song, plays) VALUES (?, 1) ON DUPLICATE KEY UPDATE plays = plays + 1");
    $stmt->execute([$song]);
} catch (PDOException $e) {
    // Database failed, fall back to JSON
    updateJsonCount($song);
}

// 2. Fallback to JSON tracking
function updateJsonCount($song) {
    $filePath = __DIR__ . '/data/play_counts.json';
    
    if (!file_exists($filePath)) {
        file_put_contents($filePath, '{}');
    }
    
    $counts = json_decode(file_get_contents($filePath), true);
    $counts[$song] = ($counts[$song] ?? 0) + 1;
    file_put_contents($filePath, json_encode($counts, JSON_PRETTY_PRINT));
}

echo json_encode(['success' => true]);
?>