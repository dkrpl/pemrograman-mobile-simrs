<?php
require_once '../config/database.php';
require_once '../helpers/response.php';
require_once '../helpers/request.php';
handleCors('GET, OPTIONS');

$pdo   = getConnection();
$today = date('Y-m-d');

$count = fn($table) => (int)$pdo->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();

// Rekap status antrean hari ini
$stmt = $pdo->prepare("SELECT status, COUNT(*) AS jumlah FROM pendaftaran WHERE tanggal_kunjungan = ? GROUP BY status");
$stmt->execute([$today]);
$antreanHariIni = ['menunggu' => 0, 'dipanggil' => 0, 'selesai' => 0, 'batal' => 0];
foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
    $antreanHariIni[$row['status']] = (int)$row['jumlah'];
}

sendResponse('success', 'Ringkasan dashboard berhasil diambil', [
    'tanggal'          => $today,
    'poli'             => $count('poli'),
    'dokter'           => $count('dokter'),
    'pasien'           => $count('pasien'),
    'jadwal'           => $count('jadwal_praktik'),
    'pendaftaran'      => $count('pendaftaran'),
    'rekam_medis'      => $count('rekam_medis'),
    'resep_obat'       => $count('resep_obat'),
    'users'            => $count('users'),
    'notifikasi_baru'  => (int)$pdo->query("SELECT COUNT(*) FROM notifikasi WHERE status_baca = 0")->fetchColumn(),
    'antrean_hari_ini' => $antreanHariIni,
]);
