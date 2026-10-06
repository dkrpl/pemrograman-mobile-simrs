<?php
header('Access-Control-Allow-Origin: *'); // XML
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

require_once '../config/database.php';
require_once '../helpers/response.php';


$id         = $_GET['id'] ?? null;

if (empty($id)) {
    sendResponse('error', 'Id wajib diisi', null, 400);
}

$pdo    = getConnection();
$cek    = $pdo->prepare("SELECT id FROM jadwal_praktik WHERE id = ?");
$cek->execute([$id]);
if (!$cek->fetch()) {
    sendResponse('error', 'Data jadwal praktik tidak ditemukan', null, 404);
}


$stmt   = $pdo->prepare("DELETE FROM jadwal_praktik WHERE id=?");
$stmt->execute([$id]);

sendResponse('success', 'Data Jadwal Praktik Berhasil dihapus', [
    'id'        => $id
], 201);
