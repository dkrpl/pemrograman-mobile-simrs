<?php
header('Access-Control-Allow-Origin: *'); // XML
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

require_once '../config/database.php';
require_once '../helpers/response.php';


$id     = $_GET['id'] ?? null;
$nama   = $_GET['nama'] ?? null;
$spesialisasi  = $_GET['spesialisasi'] ?? null;
$no_sip     = $_GET['no_sip'] ?? null;
if (empty($id) || empty($nama)) {
    sendResponse('error', 'Id dan Nama dokter wajib diisi', null, 400);
}

$pdo    = getConnection();
$cek    = $pdo->prepare("SELECT id FROM dokter WHERE id = ?");
$cek->execute([$id]);
if (!$cek->fetch()) {
    sendResponse('error', 'Data dokter tidak ditemukan', null, 404);
}


$stmt   = $pdo->prepare("UPDATE dokter SET nama=?,spesialisasi=?,no_sip=? WHERE id=?");
$stmt->execute([$nama, $spesialisasi, $no_sip, $id]);

sendResponse('success', 'Data Dokter Berhasil diperbarui', [
    'id'            => $id,
    'nama'          => $nama,
    'spesialisasi'   => $spesialisasi,
    'no_sip'        => $no_sip
], 201);
