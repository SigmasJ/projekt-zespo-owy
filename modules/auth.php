<?php
function handleAuth($pdo, $method, $id = null) {
    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $name = $data['name'] ?? '';
    $password = $data['password'] ?? '';

    $stmt = $pdo->prepare("SELECT * FROM users WHERE name = ?");
    $stmt->execute([$name]);
    $user = $stmt->fetch();

    if (!$user || $user['password'] !== $password) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        return;
    }

    global $JWT_SECRET;
    $token = generateJWT([
        'id' => $user['id'],
        'name' => $user['name'],
        'role' => $user['role']
    ], $JWT_SECRET);

    echo json_encode(['token' => $token]);
}
