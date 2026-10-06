<?php
header('Access-Control-Allow-Origin: *'); // XML
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

require_once '../config/database.php';
require_once '../helpers/response.php';


$id         = $_GET['id'] ?? null;
$nama_poli  = $_GET['nama_poli'] ?? null;
$lokasi     = $_GET['lokasi'] ?? null;
if (empty($id) || empty($nama_poli)) {
    sendResponse('error', 'Id dan Nama poli wajib diisi', null, 400);
}

$pdo    = getConnection();
$cek    = $pdo->prepare("SELECT id FROM poli WHERE id = ?");
$cek->execute([$id]);
if (!$cek->fetch()) {
    sendResponse('error', 'Data poli tidak ditemukan', null, 404);
}


$stmt   = $pdo->prepare("UPDATE poli SET nama_poli=?,lokasi=? WHERE id=?");
$stmt->execute([$nama_poli, $lokasi, $id]);

sendResponse('success', 'Data Poli Berhasil diperbaruii', [
    'id'        => $id,
    'nama_poli' => $nama_poli,
    'lokasi'    => $lokasi
], 201);
