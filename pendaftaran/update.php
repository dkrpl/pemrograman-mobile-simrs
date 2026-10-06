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

// Ambil input: JSON body dulu, fallback ke POST / GET
$raw   = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!is_array($input)) {
    $input = array_merge($_GET, $_POST);
} else {
    $input = array_merge($_GET, $input);
}

$id                = $input['id'] ?? null;
$pasien_id         = $input['pasien_id'] ?? null;
$jadwal_id         = $input['jadwal_id'] ?? null;
$tanggal_kunjungan = $input['tanggal_kunjungan'] ?? null;
$no_antrian        = $input['no_antrian'] ?? null;
$status            = $input['status'] ?? 'menunggu';

if (empty($id) || empty($pasien_id)) {
    sendResponse('error', 'ID Pendaftaran dan Pasien wajib diisi', null, 400);
}

try {
    $pdo = getConnection();
    $cek = $pdo->prepare("SELECT id FROM pendaftaran WHERE id = ?");
    $cek->execute([$id]);
    if (!$cek->fetch()) {
        sendResponse('error', 'Data pendaftaran tidak ditemukan', null, 404);
    }

    $stmt = $pdo->prepare("UPDATE pendaftaran SET pasien_id = ?, jadwal_id = ?, tanggal_kunjungan = ?, no_antrian = ?, status = ? WHERE id = ?");
    $stmt->execute([$pasien_id, $jadwal_id, $tanggal_kunjungan, $no_antrian, $status, $id]);

    sendResponse('success', 'Data Pendaftaran Berhasil Diperbarui', [
        'id'                => $id,
        'pasien_id'         => $pasien_id,
        'jadwal_id'         => $jadwal_id,
        'tanggal_kunjungan' => $tanggal_kunjungan,
        'no_antrian'        => $no_antrian,
        'status'            => $status
    ], 200);
} catch (PDOException $e) {
    sendResponse('error', 'Gagal memperbarui data pendaftaran: ' . $e->getMessage(), null, 500);
}
