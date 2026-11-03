<?php
require_once '../config/database.php';
require_once '../helpers/response.php';
require_once '../helpers/request.php';
require_once 'validate.php';
handleCors('POST, PUT, OPTIONS');

// Menerima parameter lewat query string maupun JSON body
$input = getInput();
$id    = $input['id'] ?? null;

if (empty($id)) {
    sendResponse('error', 'Id jadwal wajib diisi', null, 400);
}

$jadwal = validateJadwal($input);

try {
    $pdo = getConnection();
    $cek = $pdo->prepare("SELECT id FROM jadwal_praktik WHERE id = ?");
    $cek->execute([$id]);
    if (!$cek->fetch()) {
        sendResponse('error', 'Data jadwal praktik tidak ditemukan', null, 404);
    }

    $stmt = $pdo->prepare("UPDATE jadwal_praktik SET dokter_id = ?, poli_id = ?, hari = ?, jam_mulai = ?, jam_selesai = ?, kuota = ? WHERE id = ?");
    $stmt->execute([
        $jadwal['dokter_id'], $jadwal['poli_id'], $jadwal['hari'],
        $jadwal['jam_mulai'], $jadwal['jam_selesai'], $jadwal['kuota'], $id,
    ]);

    sendResponse('success', 'Data Jadwal Praktik Berhasil Diperbarui', ['id' => $id] + $jadwal, 200);
} catch (PDOException $e) {
    sendDbError($e, 'memperbarui jadwal praktik');
}
