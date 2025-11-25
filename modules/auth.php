<?php

function handleAuth($pdo, $method, $id = null) {
    if ($method !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        return;
    }

    // rozróżnienie endpointu
    $action = $_GET['action'] ?? 'login';

    if ($action === 'register') {
        registerUser($pdo);
        return;
    }

    // oryginalne logowanie (nie zmieniam!)
    loginUser($pdo);
}

function registerUser($pdo) {
    $data = json_decode(file_get_contents("php://input"), true);

    $name = $data['name'] ?? '';
    $password = $data['password'] ?? '';
    $role = $data['role'] ?? '';

    if (!$name || !$password || !$role) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        return;
    }

    if (!in_array($role, ['nauczyciel', 'uczen'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid role']);
        return;
    }

    // sprawdzanie czy istnieje
    $stmt = $pdo->prepare("SELECT id FROM users WHERE name = ?");
    $stmt->execute([$name]);

    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'User already exists']);
        return;
    }

    // zapis bez hashowania — tak jak chciałeś
    $stmt = $pdo->prepare("INSERT INTO users (name, role, password) VALUES (?, ?, ?)");
    $stmt->execute([$name, $role, $password]);

    echo json_encode(['success' => true, 'message' => 'User registered']);
}

function loginUser($pdo) {
    global $JWT_SECRET;

    $data = json_decode(file_get_contents('php://input'), true);
    $name = $data['name'] ?? '';
    $password = $data['password'] ?? '';

    if (!$name || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing name or password']);
        return;
    }

    $stmt = $pdo->prepare("SELECT * FROM users WHERE name = ?");
    $stmt->execute([$name]);
    $user = $stmt->fetch();

    // oryginalne porównanie — zostawione tak jak było
    if (!$user || $user['password'] !== $password) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        return;
    }

    // oryginalne tokenowanie
    $token = generateJWT([
        'id' => $user['id'],
        'name' => $user['name'],
        'role' => $user['role']
    ], $JWT_SECRET);

    echo json_encode(['token' => $token]);
}
