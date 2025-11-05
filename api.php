<?php
header("Content-Type: application/json; charset=utf-8");
require_once 'db.php';
require_once 'jwt.php';

// --- ROUTING ---
$pathInfo = $_SERVER['PATH_INFO'] ?? '';
$pathParts = array_values(array_filter(explode('/', trim($pathInfo, '/'))));

$table = $pathParts[0] ?? null;
$id = $pathParts[1] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

// --- AUTORYZACJA JWT ---
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

if ($table !== 'auth') { // /auth jest publiczne
    if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        http_response_code(401);
        echo json_encode(['error' => 'Missing or invalid Authorization header']);
        exit;
    }
    $token = $matches[1];
    $user = verifyJWT($token, $JWT_SECRET);
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        exit;
    }
}

// --- BRAK ZASOBU ---
if (!$table) {
    http_response_code(400);
    echo json_encode(['error' => 'No resource specified']);
    exit;
}

// --- WCZYTANIE MODUŁU ---
$modulePath = __DIR__ . '/modules/' . $table . '.php';
if (file_exists($modulePath)) {
    require_once $modulePath;
    $functionName = 'handle' . ucfirst($table);
    if (function_exists($functionName)) {
        $functionName($pdo, $method, $id, $user ?? null);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Module function not found']);
    }
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Unknown resource']);
}
