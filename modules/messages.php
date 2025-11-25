<?php
function handleMessages($pdo, $method, $id = null, $user = null) {
    if ($method === 'GET') {
        $last_id = isset($_GET['last_id']) ? (int)$_GET['last_id'] : 0;
        $stmt = $pdo->prepare("
            SELECT m.id, u.name, u.role, m.text, m.created_at
            FROM messages m
            JOIN users u ON m.user_id = u.id
            WHERE m.id > ?
            ORDER BY m.id ASC
        ");
        $stmt->execute([$last_id]);
        echo json_encode($stmt->fetchAll());
        return;
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (empty($data['text'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing message text']);
            return;
        }
    
        // --- ROTACJA 40 rekordów ---
        $stmtCount = $pdo->query("SELECT COUNT(*) FROM messages");
        $count = (int)$stmtCount->fetchColumn();
    
        if ($count >= 40) {
            // usuwa najstarszą wiadomość
            $pdo->exec("DELETE FROM messages ORDER BY id ASC LIMIT 1");
        }
    
        // --- dodanie nowej wiadomości ---
        $stmt = $pdo->prepare("INSERT INTO messages (user_id, text) VALUES (?, ?)");
        $stmt->execute([$user['id'], $data['text']]);
    
        echo json_encode(['ok' => true]);
        return;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
