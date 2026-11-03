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
    sendResponse('error', 'Id pasien wajib diisi', null, 400);
}

$p = validatePasien($input);

try {
    $pdo = getConnection();
    $cek = $pdo->prepare("SELECT id FROM pasien WHERE id = ?");
    $cek->execute([$id]);
    if (!$cek->fetch()) {
        sendResponse('error', 'Data pasien tidak ditemukan', null, 404);
    }

    $stmt = $pdo->prepare("UPDATE pasien SET user_id=?, nik=?, no_rm=?, nama=?, tgl_lahir=?, jenis_kelamin=?, alamat=? WHERE id=?");
    $stmt->execute([$p['user_id'], $p['nik'], $p['no_rm'], $p['nama'], $p['tgl_lahir'], $p['jenis_kelamin'], $p['alamat'], $id]);

    sendResponse('success', 'Data Pasien Berhasil Diperbarui', ['id' => $id] + $p, 200);
} catch (PDOException $e) {
    sendDbError($e, 'memperbarui data pasien');
}
