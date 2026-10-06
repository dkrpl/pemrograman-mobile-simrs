<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

require_once '../config/database.php';
require_once '../helpers/response.php';

// Preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$raw   = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!is_array($input)) {
    $input = array_merge($_GET, $_POST);
} else {
    $input = array_merge($_GET, $input);
}

$id             = $input['id'] ?? null;
$rekam_medis_id = $input['rekam_medis_id'] ?? null;
$nama_obat      = $input['nama_obat'] ?? null;
$dosis          = $input['dosis'] ?? null;
$jumlah         = isset($input['jumlah']) ? (int)$input['jumlah'] : 1;

if (empty($id) || empty($nama_obat)) {
    sendResponse('error', 'ID dan Nama obat wajib diisi', null, 400);
}

try {
    $pdo = getConnection();
    $cek = $pdo->prepare("SELECT id, rekam_medis_id FROM resep_obat WHERE id = ?");
    $cek->execute([$id]);
    $current = $cek->fetch(PDO::FETCH_ASSOC);

    if (!$current) {
        sendResponse('error', 'Data resep obat tidak ditemukan', null, 404);
    }

    $rekam_medis_id = $rekam_medis_id ?: $current['rekam_medis_id'];

    $stmt = $pdo->prepare("UPDATE resep_obat SET rekam_medis_id = ?, nama_obat = ?, dosis = ?, jumlah = ? WHERE id = ?");
    $stmt->execute([$rekam_medis_id, $nama_obat, $dosis, $jumlah, $id]);

    sendResponse('success', 'Data Resep Obat Berhasil Diperbarui', [
        'id'             => $id,
        'rekam_medis_id' => $rekam_medis_id,
        'nama_obat'      => $nama_obat,
        'dosis'          => $dosis,
        'jumlah'         => $jumlah
    ], 200);
} catch (PDOException $e) {
    sendResponse('error', 'Gagal memperbarui data resep obat: ' . $e->getMessage(), null, 500);
}
