<?php
require_once '../config/database.php';
require_once '../helpers/response.php';
require_once '../helpers/request.php';
handleCors('GET, OPTIONS');

$id   = $_GET['id'] ?? null;
$role = $_GET['role'] ?? null;
$pdo  = getConnection();

// password_hash & api_token sengaja tidak pernah dikirim ke klien
$select = "SELECT u.id, u.nama, u.email, u.role, p.id AS pasien_id
           FROM users u LEFT JOIN pasien p ON p.user_id = u.id";

if ($id) {
    $stmt = $pdo->prepare("$select WHERE u.id = ? OR u.nama LIKE ? OR u.email LIKE ?");
    $stmt->execute([$id, "%$id%", "%$id%"]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$data) {
        sendResponse('error', 'Data user tidak ditemukan', null, 404);
    }
    sendResponse('success', 'Data user ditemukan', $data);
} elseif ($role) {
    $stmt = $pdo->prepare("$select WHERE u.role = ? ORDER BY u.nama ASC");
    $stmt->execute([$role]);
    sendResponse('success', 'Daftar user berhasil diambil', $stmt->fetchAll(PDO::FETCH_ASSOC));
} else {
    $stmt = $pdo->query("$select ORDER BY u.nama ASC");
    sendResponse('success', 'Daftar user berhasil diambil', $stmt->fetchAll(PDO::FETCH_ASSOC));
}
