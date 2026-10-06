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

$user_id   = trim($input['user_id'] ?? '');
$fcm_token = trim($input['fcm_token'] ?? '');

if (empty($user_id) || empty($fcm_token)) {
    sendResponse('error', 'User ID dan FCM Token wajib diisi', null, 400);
}

try {
    $pdo  = getConnection();
    $cek  = $pdo->prepare("SELECT id FROM token_device WHERE user_id = ?");
    $cek->execute([$user_id]);
    $exist = $cek->fetch();

    if ($exist) {
        $stmt = $pdo->prepare("UPDATE token_device SET fcm_token = ? WHERE user_id = ?");
        $stmt->execute([$fcm_token, $user_id]);
    } else {
        $stmt = $pdo->prepare("INSERT INTO token_device (user_id, fcm_token) VALUES (?, ?)");
        $stmt->execute([$user_id, $fcm_token]);
    }

    sendResponse('success', 'Token device berhasil disimpan', [
        'user_id'   => $user_id,
        'fcm_token' => $fcm_token
    ], 200);
} catch (PDOException $e) {
    sendResponse('error', 'Gagal menyimpan token device: ' . $e->getMessage(), null, 500);
}
