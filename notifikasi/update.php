<?php
header('Access-Control-Allow-Origin: *'); // XML
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

require_once '../config/database.php';
require_once '../helpers/response.php';


$id         = $_GET['id'] ?? null;
$user_id    = $_GET['user_id'] ?? null;
$judul      = $_GET['judul'] ?? null;
$pesan      = $_GET['pesan'] ?? null;
$status_baca = $_GET['status_baca'] ?? null;
if (empty($id) || empty($user_id)) {
    sendResponse('error', 'Id dan User ID  wajib diisi', null, 400);
}

$pdo    = getConnection();
$cek    = $pdo->prepare("SELECT id FROM notifikasi WHERE id = ?");
$cek->execute([$id]);
if (!$cek->fetch()) {
    sendResponse('error', 'Data notifikasi tidak ditemukan', null, 404);
}


$stmt   = $pdo->prepare("UPDATE notifikasi SET user_id=?, judul=?, pesan=?, status_baca=? WHERE id=?");
$stmt->execute([$user_id, $judul, $pesan, $status_baca, $id]);

sendResponse('success', 'Data Notifikasi Berhasil diperbaruii', [
    'id'        => $id,
    'user_id' => $user_id,
    'judul'   => $judul,
    'pesan'   => $pesan,
    'status_baca' => $status_baca
], 201);
