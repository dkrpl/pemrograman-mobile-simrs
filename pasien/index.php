<?php
header('Access-Control-Allow-Origin: *');
require_once '../config/database.php';
require_once '../helpers/response.php';

$id     = $_GET['id'] ?? null;
$pdo    = getConnection();

if ($id) {
    //$stmt   = $pdo->prepare("SELECT * FROM poli WHERE id = ?");
    $stmt   = $pdo->prepare("SELECT * FROM pasien WHERE no_rm LIKE ?");
    $stmt->execute([$id]);
    $data   = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$data) {
        sendResponse('error', 'Data pasien tidak ditemukan', null, 404);
    }
    sendResponse('success', 'Data pasien ditemukan', $data);
} else {
    $stmt   = $pdo->query("SELECT * FROM pasien ORDER BY no_rm ASC");
    $data   = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendResponse('success', 'Daftar pasien berhasil diambil', $data);
}
