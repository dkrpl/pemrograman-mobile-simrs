<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
require_once '../config/database.php';
require_once '../helpers/response.php';

$id      = $_GET['id'] ?? null;
$userId  = $_GET['user_id'] ?? null;
$pdo     = getConnection();

if ($id) {
    $stmt = $pdo->prepare("SELECT n.*, u.nama as nama_user FROM notifikasi n LEFT JOIN users u ON n.user_id = u.id WHERE n.id = ? OR n.judul LIKE ?");
    $stmt->execute([$id, "%$id%"]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$data) {
        sendResponse('error', 'Data notifikasi tidak ditemukan', null, 404);
    }
    sendResponse('success', 'Data notifikasi ditemukan', $data);
} elseif ($userId) {
    $stmt = $pdo->prepare("SELECT n.*, u.nama as nama_user FROM notifikasi n LEFT JOIN users u ON n.user_id = u.id WHERE n.user_id = ? ORDER BY n.id DESC");
    $stmt->execute([$userId]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendResponse('success', 'Daftar notifikasi pengguna berhasil diambil', $data);
} else {
    $stmt = $pdo->query("SELECT n.*, u.nama as nama_user FROM notifikasi n LEFT JOIN users u ON n.user_id = u.id ORDER BY n.id DESC");
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendResponse('success', 'Daftar notifikasi berhasil diambil', $data);
}
