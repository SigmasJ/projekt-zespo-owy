<?php
function handleBoard($pdo, $method, $id = null, $user = null)
{
    if ($method === 'GET') {
        // Pobranie zawartości tablicy (dla wszystkich)
        $stmt = $pdo->query("SELECT id, content, updated_at FROM board WHERE id = 1");
        $board = $stmt->fetch();
        echo json_encode($board ?: ['content' => '', 'updated_at' => null]);
        return;
    }

    if ($method === 'POST') {
        // Tylko nauczyciel może edytować tablicę
        if ($user['role'] !== 'nauczyciel') {
            http_response_code(403);
            echo json_encode(['error' => 'Only teacher can edit the board']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['content'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing content']);
            return;
        }

        // Upewnij się, że istnieje rekord z id=1
        $pdo->exec("INSERT IGNORE INTO board (id, content) VALUES (1, '')");

        $stmt = $pdo->prepare("UPDATE board SET content = ?, updated_at = NOW() WHERE id = 1");
        $stmt->execute([$data['content']]);
        echo json_encode(['ok' => true, 'message' => 'Board updated']);
        return;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
