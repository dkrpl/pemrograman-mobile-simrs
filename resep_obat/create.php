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

$rekam_medis_id = trim($input['rekam_medis_id'] ?? '');
$nama_obat    = trim($input['nama_obat'] ?? '');
$dosis   =  trim($input['dosis'] ?? '');
$jumlah    =  trim($input['jumlah'] ?? '');

if ($nama_obat === '') {
    sendResponse('error', 'Nama obat wajib diisi', null, 400);
}

try {
    $pdo  = getConnection();
    $stmt = $pdo->prepare("INSERT INTO resep_obat (rekam_medis_id, nama_obat,dosis,jumlah) VALUES (?,?,?,?)");
    $stmt->execute([$rekam_medis_id, $nama_obat, $dosis, $jumlah]);

    sendResponse('success', 'Data resep obat Berhasil Ditambahkan', [
        'id'        => $pdo->lastInsertId(),
        'nama_obat' => $nama_obat,
        'dosis'    => $dosis
    ], 201);
} catch (PDOException $e) {
    sendResponse('error', 'Gagal menyimpan data', null, 500);
}
