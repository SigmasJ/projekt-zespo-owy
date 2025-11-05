<?php
$JWT_SECRET = 'super_tajne_haslo_jwt'; // zmień na własne!

function generateJWT(array $payload, string $secret, int $expSeconds = 3600): string {
    $header = ['alg' => 'HS256', 'typ' => 'JWT'];
    $payload['exp'] = time() + $expSeconds;

    $h = base64_encode(json_encode($header));
    $p = base64_encode(json_encode($payload));
    $s = hash_hmac('sha256', "$h.$p", $secret, true);
    $b64s = base64_encode($s);

    return "$h.$p.$b64s";
}

function verifyJWT(string $token, string $secret): ?array {
    [$h, $p, $s] = explode('.', $token);
    $valid = hash_hmac('sha256', "$h.$p", $secret, true);
    if (!hash_equals($valid, base64_decode($s))) return null;

    $payload = json_decode(base64_decode($p), true);
    if (!$payload || ($payload['exp'] ?? 0) < time()) return null;

    return $payload;
}
