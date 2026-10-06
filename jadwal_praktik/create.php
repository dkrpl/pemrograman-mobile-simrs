<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

require_once '../config/database.php';
require_once '../helpers/response.php';

// Preflight CORS: balas lalu hentikan eksekusi
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

$dokter_id = trim($input['dokter_id'] ?? '');
$poli_id    = trim($input['poli_id'] ?? '');
$hari = trim($input['hari'] ?? '');
$jam_mulai = trim($input['jam_mulai'] ?? '');
$jam_selesai = trim($input['jam_selesai'] ?? '');
$kuota = trim($input['kuota'] ?? '');

if ($dokter_id === '') {
    sendResponse('error', 'Dokter  wajib diisi', null, 400);
}

try {
    $pdo  = getConnection();
    $stmt = $pdo->prepare("INSERT INTO jadwal_praktik (dokter_id, poli_id, hari, jam_mulai, jam_selesai, kuota) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$dokter_id, $poli_id, $hari, $jam_mulai, $jam_selesai, $kuota]);

    sendResponse('success', 'Data Jadwal Praktik Berhasil Ditambahkan', [
        'id'        => $pdo->lastInsertId(),
        'dokter_id' => $dokter_id,
        'poli_id'   => $poli_id,
        'hari'      => $hari,
        'jam_mulai' => $jam_mulai,
        'jam_selesai' => $jam_selesai,
        'kuota'     => $kuota
    ], 201);
} catch (PDOException $e) {
    sendResponse('error', 'Gagal menyimpan data', null, 500);
}
