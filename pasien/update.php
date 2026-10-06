<?php
header('Access-Control-Allow-Origin: *'); // XML
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

require_once '../config/database.php';
require_once '../helpers/response.php';


$id         = $_GET['id'] ?? null;
$user_id  = $_GET['user_id'] ?? null;
$nik   = $_GET['nik'] ?? null;
$no_rm   = $_GET['no_rm'] ?? null;
$nama   = $_GET['nama'] ?? null;
$tgl_lahir = $_GET['tgl_lahir'] ?? null;
$jenis_kelamin = $_GET['jenis_kelamin'] ?? null;
$alamat = $_GET['alamat'] ?? null;
if (empty($id) || empty($user_id)) {
    sendResponse('error', 'Id dan User ID wajib diisi', null, 400);
}

$pdo    = getConnection();
$cek    = $pdo->prepare("SELECT id FROM pasien WHERE id = ?");
$cek->execute([$id]);
if (!$cek->fetch()) {
    sendResponse('error', 'Data pasien tidak ditemukan', null, 404);
}


$stmt   = $pdo->prepare("UPDATE pasien SET user_id=?, nik=?, no_rm=?, nama=?, tgl_lahir=?, jenis_kelamin=?, alamat=? WHERE id=?");
$stmt->execute([$user_id, $nik, $no_rm, $nama, $tgl_lahir, $jenis_kelamin, $alamat, $id]);

sendResponse('success', 'Data Pasien Berhasil diperbaruii', [
    'id'        => $id,
    'no_rm'     => $no_rm,
    'nama'      => $nama
], 201);
