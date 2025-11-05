<?php
function handleNotes($pdo, $method, $id = null, $user = null)
{
    if ($method === 'GET') {
        // Pobranie notatki tylko dla zalogowanego użytkownika
        $stmt = $pdo->prepare("SELECT id, content, updated_at FROM notes WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        $note = $stmt->fetch();
        echo json_encode($note ?: ['content' => '', 'updated_at' => null]);
        return;
    }

    if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!isset($data['content'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing content']);
            return;
        }

        // Sprawdź, czy notatka istnieje
        $stmt = $pdo->prepare("SELECT id FROM notes WHERE user_id = ?");
        $stmt->execute([$user['id']]);
        $existing = $stmt->fetch();

        if ($existing) {
            $stmt = $pdo->prepare("UPDATE notes SET content = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$data['content'], $existing['id']]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO notes (user_id, content) VALUES (?, ?)");
            $stmt->execute([$user['id'], $data['content']]);
        }

        echo json_encode(['ok' => true, 'message' => 'Note saved']);
        return;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
