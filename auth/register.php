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

$nama     = trim($input['nama'] ?? '');
$email    = trim($input['email'] ?? '');
$password = trim($input['password'] ?? '');
$role     = trim($input['role'] ?? 'pasien');

if (empty($nama) || empty($email) || empty($password)) {
    sendResponse('error', 'Nama, email, dan password wajib diisi', null, 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse('error', 'Format email tidak valid', null, 400);
}

try {
    $pdo  = getConnection();
    $cek  = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $cek->execute([$email]);
    if ($cek->fetch()) {
        sendResponse('error', 'Email sudah terdaftar', null, 409);
    }

    $passwordHash = password_hash($password, PASSWORD_BCRYPT);
    $apiToken     = bin2hex(random_bytes(32));

    $stmt = $pdo->prepare("INSERT INTO users (nama, email, password_hash, role, api_token) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$nama, $email, $passwordHash, $role, $apiToken]);

    $userId = $pdo->lastInsertId();

    sendResponse('success', 'Registrasi berhasil', [
        'id'        => $userId,
        'nama'      => $nama,
        'email'     => $email,
        'role'      => $role,
        'api_token' => $apiToken
    ], 201);
} catch (PDOException $e) {
    sendResponse('error', 'Gagal mendaftar: ' . $e->getMessage(), null, 500);
}
