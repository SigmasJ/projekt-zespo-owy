<?php
function handleActive($pdo, $method, $id, $user) {

    // user musi być zalogowany
    $userId = $user['id'];

    // aktualizuj jego last_seen (lub dodaj jeśli nie istnieje)
    $stmt = $pdo->prepare("
        INSERT INTO active_users (user_id, last_seen)
        VALUES (?, NOW())
        ON DUPLICATE KEY UPDATE last_seen = NOW()
    ");
    $stmt->execute([$userId]);

    
    // GET -> zwróć listę aktywnych
    if ($method === "GET") {

        // usuwanie nieaktywnych > 20 sek
        $pdo->query("DELETE FROM active_users WHERE last_seen < NOW() - INTERVAL 20 SECOND");

        $stmt = $pdo->query("
            SELECT users.name, users.role
            FROM active_users 
            JOIN users ON users.id = active_users.user_id
            ORDER BY users.role DESC, users.name ASC
        ");
        
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        return;
    }

    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
