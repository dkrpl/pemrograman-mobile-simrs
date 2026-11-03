<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

require_once '../config/database.php';
require_once '../helpers/response.php';
require_once '../helpers/request.php';

// Preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Tolak semua method selain POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse('error', 'Method harus POST', null, 405);
}

// Ambil input: JSON body dulu, fallback ke form-data
$raw   = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!is_array($input)) {
    $input = $_POST;
}

$user_id     = trim($input['user_id'] ?? '');
$judul       = trim($input['judul'] ?? '');
$pesan       = trim($input['pesan'] ?? '');
$status_baca = isset($input['status_baca']) ? (int)$input['status_baca'] : 0;

if ($user_id === '' || $judul === '' || $pesan === '') {
    sendResponse('error', 'User ID, judul, dan pesan notifikasi wajib diisi', null, 400);
}

try {
    $pdo  = getConnection();
    $stmt = $pdo->prepare("INSERT INTO notifikasi (user_id, judul, pesan, status_baca) VALUES (?, ?, ?, ?)");
    $stmt->execute([$user_id, $judul, $pesan, $status_baca]);

    sendResponse('success', 'Data Notifikasi Berhasil Ditambahkan', [
        'id'          => $pdo->lastInsertId(),
        'user_id'     => $user_id,
        'judul'       => $judul,
        'pesan'       => $pesan,
        'status_baca' => $status_baca
    ], 201);
} catch (PDOException $e) {
    sendDbError($e, 'menyimpan data notifikasi');
}
