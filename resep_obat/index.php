<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
require_once '../config/database.php';
require_once '../helpers/response.php';

$id            = $_GET['id'] ?? null;
$rekamMedisId  = $_GET['rekam_medis_id'] ?? null;
$pdo           = getConnection();

if ($id) {
    $stmt = $pdo->prepare("SELECT r.*, rm.diagnosa FROM resep_obat r LEFT JOIN rekam_medis rm ON r.rekam_medis_id = rm.id WHERE r.id = ?");
    $stmt->execute([$id]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$data) {
        sendResponse('error', 'Data resep obat tidak ditemukan', null, 404);
    }
    sendResponse('success', 'Data resep obat ditemukan', $data);
} elseif ($rekamMedisId) {
    $stmt = $pdo->prepare("SELECT r.*, rm.diagnosa FROM resep_obat r LEFT JOIN rekam_medis rm ON r.rekam_medis_id = rm.id WHERE r.rekam_medis_id = ? ORDER BY r.id ASC");
    $stmt->execute([$rekamMedisId]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendResponse('success', 'Daftar resep obat berhasil diambil', $data);
} else {
    $stmt = $pdo->query("SELECT r.*, rm.diagnosa FROM resep_obat r LEFT JOIN rekam_medis rm ON r.rekam_medis_id = rm.id ORDER BY r.id ASC");
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendResponse('success', 'Daftar resep obat berhasil diambil', $data);
}
