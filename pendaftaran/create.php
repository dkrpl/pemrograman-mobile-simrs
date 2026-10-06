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

$pasien_id         = trim($input['pasien_id'] ?? '');
$jadwal_id         = trim($input['jadwal_id'] ?? '');
$tanggal_kunjungan = trim($input['tanggal_kunjungan'] ?? date('Y-m-d'));
$status            = trim($input['status'] ?? 'menunggu');

if ($pasien_id === '' || $jadwal_id === '') {
    sendResponse('error', 'Data Pasien dan Jadwal Praktik wajib dipilih', null, 400);
}

try {
    $pdo = getConnection();

    // Otomatis hitung no antrean berikutnya jika belum ditentukan
    $no_antrian = $input['no_antrian'] ?? null;
    if (empty($no_antrian)) {
        $qAntri = $pdo->prepare("SELECT COALESCE(MAX(no_antrian), 0) + 1 FROM pendaftaran WHERE jadwal_id = ? AND tanggal_kunjungan = ?");
        $qAntri->execute([$jadwal_id, $tanggal_kunjungan]);
        $no_antrian = (int)$qAntri->fetchColumn();
    }

    $stmt = $pdo->prepare("INSERT INTO pendaftaran (pasien_id, jadwal_id, tanggal_kunjungan, no_antrian, status) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$pasien_id, $jadwal_id, $tanggal_kunjungan, $no_antrian, $status]);

    sendResponse('success', 'Pendaftaran antrean berhasil ditambahkan', [
        'id'                => $pdo->lastInsertId(),
        'pasien_id'         => $pasien_id,
        'jadwal_id'         => $jadwal_id,
        'tanggal_kunjungan' => $tanggal_kunjungan,
        'no_antrian'        => $no_antrian,
        'status'            => $status
    ], 201);
} catch (PDOException $e) {
    sendResponse('error', 'Gagal menyimpan pendaftaran: ' . $e->getMessage(), null, 500);
}
