<?php
require_once '../config/database.php';
require_once '../helpers/response.php';
require_once '../helpers/request.php';
require_once 'validate.php';
handleCors('POST, OPTIONS');

// Tolak semua method selain POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse('error', 'Method harus POST', null, 405);
}

$jadwal = validateJadwal(getInput());

try {
    $pdo  = getConnection();
    $stmt = $pdo->prepare("INSERT INTO jadwal_praktik (dokter_id, poli_id, hari, jam_mulai, jam_selesai, kuota) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $jadwal['dokter_id'], $jadwal['poli_id'], $jadwal['hari'],
        $jadwal['jam_mulai'], $jadwal['jam_selesai'], $jadwal['kuota'],
    ]);

    sendResponse('success', 'Data Jadwal Praktik Berhasil Ditambahkan', ['id' => $pdo->lastInsertId()] + $jadwal, 201);
} catch (PDOException $e) {
    sendDbError($e, 'menyimpan jadwal praktik');
}
