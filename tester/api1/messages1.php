<?php
header("Content-Type: application/json");
require_once "db1.php";

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $lastId = isset($_GET['last_id']) ? intval($_GET['last_id']) : 0;
    $stmt = $pdo->prepare("SELECT * FROM messages WHERE id > ? ORDER BY id ASC");
    $stmt->execute([$lastId]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    if (!isset($data['username']) || !isset($data['text']) || trim($data['text']) === '') {
        http_response_code(400);
        echo json_encode(["error" => "Missing data"]);
        exit;
    }
    $stmt = $pdo->prepare("INSERT INTO messages (username, text) VALUES (?, ?)");
    $stmt->execute([$data['username'], $data['text']]);
    echo json_encode(["status" => "ok", "id" => $pdo->lastInsertId()]);
    exit;
}

http_response_code(405);