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

$p = validatePasien(getInput());

try {
    $pdo  = getConnection();
    $stmt = $pdo->prepare("INSERT INTO pasien (user_id, nik, no_rm, nama, tgl_lahir, jenis_kelamin, alamat) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$p['user_id'], $p['nik'], $p['no_rm'], $p['nama'], $p['tgl_lahir'], $p['jenis_kelamin'], $p['alamat']]);

    sendResponse('success', 'Data Pasien Berhasil Ditambahkan', ['id' => $pdo->lastInsertId()] + $p, 201);
} catch (PDOException $e) {
    sendDbError($e, 'menyimpan data pasien');
}
