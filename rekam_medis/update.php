<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, PUT, OPTIONS');
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

// Ambil input: JSON body, POST, atau GET
$raw   = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!is_array($input)) {
    $input = array_merge($_GET, $_POST);
} else {
    $input = array_merge($_GET, $input);
}

$id             = $input['id'] ?? null;
$pendaftaran_id = $input['pendaftaran_id'] ?? null;
$dokter_id      = $input['dokter_id'] ?? null;
$diagnosa       = $input['diagnosa'] ?? null;
$catatan        = $input['catatan'] ?? null;
$tanggal        = $input['tanggal'] ?? null;

if (empty($id) || empty($diagnosa)) {
    sendResponse('error', 'ID dan Diagnosa rekam medis wajib diisi', null, 400);
}

try {
    $pdo = getConnection();
    $cek = $pdo->prepare("SELECT id, pendaftaran_id, dokter_id, tanggal FROM rekam_medis WHERE id = ?");
    $cek->execute([$id]);
    $current = $cek->fetch(PDO::FETCH_ASSOC);

    if (!$current) {
        sendResponse('error', 'Data rekam medis tidak ditemukan', null, 404);
    }

    $pendaftaran_id = $pendaftaran_id ?: $current['pendaftaran_id'];
    $dokter_id      = $dokter_id ?: $current['dokter_id'];
    $tanggal        = $tanggal ?: $current['tanggal'];

    $stmt = $pdo->prepare("UPDATE rekam_medis SET pendaftaran_id = ?, dokter_id = ?, diagnosa = ?, catatan = ?, tanggal = ? WHERE id = ?");
    $stmt->execute([$pendaftaran_id, $dokter_id, $diagnosa, $catatan, $tanggal, $id]);

    sendResponse('success', 'Data Rekam Medis Berhasil Diperbarui', [
        'id'             => $id,
        'pendaftaran_id' => $pendaftaran_id,
        'dokter_id'      => $dokter_id,
        'diagnosa'       => $diagnosa,
        'catatan'        => $catatan,
        'tanggal'        => $tanggal
    ], 200);
} catch (PDOException $e) {
    sendDbError($e, 'memperbarui data rekam medis');
}
