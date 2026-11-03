<?php
require_once '../config/database.php';
require_once '../helpers/response.php';
require_once '../helpers/request.php';
handleCors('POST, OPTIONS');

// Tolak semua method selain POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse('error', 'Method harus POST', null, 405);
}

$input          = getInput();
$rekam_medis_id = trim($input['rekam_medis_id'] ?? '');
$nama_obat      = trim($input['nama_obat'] ?? '');
$dosis          = trim($input['dosis'] ?? '');
$jumlah         = trim($input['jumlah'] ?? '1');

if ($rekam_medis_id === '') {
    sendResponse('error', 'Rekam medis wajib dipilih', null, 400);
}
if ($nama_obat === '') {
    sendResponse('error', 'Nama obat wajib diisi', null, 400);
}
if (!ctype_digit($jumlah) || (int)$jumlah < 1) {
    sendResponse('error', 'Jumlah obat harus bilangan bulat lebih dari 0', null, 400);
}

try {
    $pdo  = getConnection();
    $stmt = $pdo->prepare("INSERT INTO resep_obat (rekam_medis_id, nama_obat, dosis, jumlah) VALUES (?, ?, ?, ?)");
    $stmt->execute([$rekam_medis_id, $nama_obat, $dosis, (int)$jumlah]);

    sendResponse('success', 'Data Resep Obat Berhasil Ditambahkan', [
        'id'             => $pdo->lastInsertId(),
        'rekam_medis_id' => $rekam_medis_id,
        'nama_obat'      => $nama_obat,
        'dosis'          => $dosis,
        'jumlah'         => (int)$jumlah
    ], 201);
} catch (PDOException $e) {
    sendDbError($e, 'menyimpan resep obat');
}
