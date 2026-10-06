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

$pendaftaran_id = trim($input['pendaftaran_id'] ?? '');
$dokter_id      = trim($input['dokter_id'] ?? '');
$diagnosa       = trim($input['diagnosa'] ?? '');
$catatan        = trim($input['catatan'] ?? '');
$tanggal        = trim($input['tanggal'] ?? date('Y-m-d H:i:s'));

if ($pendaftaran_id === '' || $dokter_id === '' || $diagnosa === '') {
    sendResponse('error', 'Pendaftaran ID, Dokter ID, dan diagnosa wajib diisi', null, 400);
}

try {
    $pdo  = getConnection();
    $stmt = $pdo->prepare("INSERT INTO rekam_medis (pendaftaran_id, dokter_id, diagnosa, catatan, tanggal) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$pendaftaran_id, $dokter_id, $diagnosa, $catatan, $tanggal]);

    sendResponse('success', 'Data Rekam Medis Berhasil Ditambahkan', [
        'id'             => $pdo->lastInsertId(),
        'pendaftaran_id' => $pendaftaran_id,
        'dokter_id'      => $dokter_id,
        'diagnosa'       => $diagnosa,
        'catatan'        => $catatan,
        'tanggal'        => $tanggal
    ], 201);
} catch (PDOException $e) {
    sendResponse('error', 'Gagal menyimpan data rekam medis: ' . $e->getMessage(), null, 500);
}
