<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

require_once '../config/database.php';
require_once '../helpers/response.php';

// Preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse('error', 'Method harus POST', null, 405);
}

$raw   = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!is_array($input)) {
    $input = $_POST;
}

$email    = trim($input['email'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($email) || empty($password)) {
    sendResponse('error', 'Email dan password wajib diisi', null, 400);
}

try {
    $pdo  = getConnection();
    $stmt = $pdo->prepare("SELECT id, nama, email, password_hash, role, api_token FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || !password_verify($password, $user['password_hash'])) {
        sendResponse('error', 'Email atau password salah', null, 401);
    }

    // Generate token baru bila belum ada
    $token = $user['api_token'] ?: bin2hex(random_bytes(32));
    $upd   = $pdo->prepare("UPDATE users SET api_token = ? WHERE id = ?");
    $upd->execute([$token, $user['id']]);

    sendResponse('success', 'Login berhasil', [
        'id'        => $user['id'],
        'nama'      => $user['nama'],
        'email'     => $user['email'],
        'role'      => $user['role'],
        'api_token' => $token
    ], 200);
} catch (PDOException $e) {
    sendResponse('error', 'Terjadi kesalahan sistem: ' . $e->getMessage(), null, 500);
}
