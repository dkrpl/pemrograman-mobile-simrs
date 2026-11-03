<?php
require_once '../config/database.php';
require_once '../helpers/response.php';
require_once '../helpers/request.php';
handleCors('GET, OPTIONS');

$userId = $_GET['user_id'] ?? null;
$pdo    = getConnection();

$select = "SELECT t.id, t.user_id, t.fcm_token, u.nama AS nama_user
           FROM token_device t LEFT JOIN users u ON t.user_id = u.id";

if ($userId) {
    $stmt = $pdo->prepare("$select WHERE t.user_id = ?");
    $stmt->execute([$userId]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$data) {
        sendResponse('error', 'Token device untuk user ini belum ada', null, 404);
    }
    sendResponse('success', 'Data token device ditemukan', $data);
} else {
    $stmt = $pdo->query("$select ORDER BY t.id ASC");
    sendResponse('success', 'Daftar token device berhasil diambil', $stmt->fetchAll(PDO::FETCH_ASSOC));
}
