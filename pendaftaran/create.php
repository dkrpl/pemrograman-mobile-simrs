<?php
require_once '../config/database.php';
require_once '../helpers/response.php';
require_once '../helpers/request.php';
handleCors('POST, OPTIONS');

// Tolak semua method selain POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse('error', 'Method harus POST', null, 405);
}

$input             = getInput();
$pasien_id         = trim($input['pasien_id'] ?? '');
$jadwal_id         = trim($input['jadwal_id'] ?? '');
$tanggal_kunjungan = trim($input['tanggal_kunjungan'] ?? '') ?: date('Y-m-d');
$status            = trim($input['status'] ?? '') ?: 'menunggu';

if ($pasien_id === '' || $jadwal_id === '') {
    sendResponse('error', 'Data Pasien dan Jadwal Praktik wajib dipilih', null, 400);
}
$tgl = DateTime::createFromFormat('Y-m-d', $tanggal_kunjungan);
if (!$tgl || $tgl->format('Y-m-d') !== $tanggal_kunjungan) {
    sendResponse('error', 'Tanggal kunjungan harus berformat YYYY-MM-DD', null, 400);
}
if (!in_array($status, ['menunggu', 'dipanggil', 'selesai', 'batal'], true)) {
    sendResponse('error', 'Status tidak valid', null, 400);
}

try {
    $pdo = getConnection();

    $qJadwal = $pdo->prepare("SELECT kuota FROM jadwal_praktik WHERE id = ?");
    $qJadwal->execute([$jadwal_id]);
    $jadwal = $qJadwal->fetch(PDO::FETCH_ASSOC);
    if (!$jadwal) {
        sendResponse('error', 'Jadwal praktik tidak ditemukan', null, 404);
    }

    // Cek kuota (kuota 0 = tidak dibatasi); antrean yang batal tidak dihitung
    if ((int)$jadwal['kuota'] > 0) {
        $qTerisi = $pdo->prepare("SELECT COUNT(*) FROM pendaftaran WHERE jadwal_id = ? AND tanggal_kunjungan = ? AND status <> 'batal'");
        $qTerisi->execute([$jadwal_id, $tanggal_kunjungan]);
        if ((int)$qTerisi->fetchColumn() >= (int)$jadwal['kuota']) {
            sendResponse('error', "Kuota jadwal pada tanggal $tanggal_kunjungan sudah penuh ({$jadwal['kuota']} pasien)", null, 409);
        }
    }

    // Otomatis hitung no antrean berikutnya jika belum ditentukan
    $no_antrian = $input['no_antrian'] ?? null;
    if (empty($no_antrian)) {
        $qAntri = $pdo->prepare("SELECT COALESCE(MAX(no_antrian), 0) + 1 FROM pendaftaran WHERE jadwal_id = ? AND tanggal_kunjungan = ?");
        $qAntri->execute([$jadwal_id, $tanggal_kunjungan]);
        $no_antrian = (int)$qAntri->fetchColumn();
    }

    $stmt = $pdo->prepare("INSERT INTO pendaftaran (pasien_id, jadwal_id, tanggal_kunjungan, no_antrian, status) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$pasien_id, $jadwal_id, $tanggal_kunjungan, $no_antrian, $status]);

    sendResponse('success', "Pendaftaran berhasil. Nomor antrean Anda: $no_antrian", [
        'id'                => $pdo->lastInsertId(),
        'pasien_id'         => $pasien_id,
        'jadwal_id'         => $jadwal_id,
        'tanggal_kunjungan' => $tanggal_kunjungan,
        'no_antrian'        => $no_antrian,
        'status'            => $status
    ], 201);
} catch (PDOException $e) {
    sendDbError($e, 'menyimpan pendaftaran');
}
