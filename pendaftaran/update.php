<?php
require_once '../config/database.php';
require_once '../helpers/response.php';
require_once '../helpers/request.php';
handleCors('POST, PUT, OPTIONS');

// Menerima parameter lewat query string maupun JSON body.
// Field yang tidak dikirim tetap memakai nilai lama, sehingga cukup kirim
// ?id=1&status=dipanggil untuk mengubah status antrean saja.
$input = getInput();
$id    = $input['id'] ?? null;

if (empty($id)) {
    sendResponse('error', 'ID Pendaftaran wajib diisi', null, 400);
}

try {
    $pdo = getConnection();
    $cek = $pdo->prepare("SELECT * FROM pendaftaran WHERE id = ?");
    $cek->execute([$id]);
    $current = $cek->fetch(PDO::FETCH_ASSOC);
    if (!$current) {
        sendResponse('error', 'Data pendaftaran tidak ditemukan', null, 404);
    }

    $pasien_id         = trim($input['pasien_id'] ?? '') ?: $current['pasien_id'];
    $jadwal_id         = trim($input['jadwal_id'] ?? '') ?: $current['jadwal_id'];
    $tanggal_kunjungan = trim($input['tanggal_kunjungan'] ?? '') ?: $current['tanggal_kunjungan'];
    $no_antrian        = trim($input['no_antrian'] ?? '') ?: $current['no_antrian'];
    $status            = trim($input['status'] ?? '') ?: $current['status'];

    if (!in_array($status, ['menunggu', 'dipanggil', 'selesai', 'batal'], true)) {
        sendResponse('error', 'Status tidak valid. Gunakan: menunggu, dipanggil, selesai, batal', null, 400);
    }
    $tgl = DateTime::createFromFormat('Y-m-d', $tanggal_kunjungan);
    if (!$tgl || $tgl->format('Y-m-d') !== $tanggal_kunjungan) {
        sendResponse('error', 'Tanggal kunjungan harus berformat YYYY-MM-DD', null, 400);
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
    sendDbError($e, 'memperbarui data pendaftaran');
}
