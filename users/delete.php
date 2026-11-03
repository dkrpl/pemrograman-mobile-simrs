<?php
require_once '../config/database.php';
require_once '../helpers/response.php';
require_once '../helpers/request.php';
handleCors('POST, DELETE, OPTIONS');

$id = getInput()['id'] ?? null;

if (empty($id)) {
    sendResponse('error', 'Id wajib diisi', null, 400);
}

try {
    $pdo = getConnection();
    $cek = $pdo->prepare("SELECT u.id, p.id AS pasien_id FROM users u LEFT JOIN pasien p ON p.user_id = u.id WHERE u.id = ?");
    $cek->execute([$id]);
    $user = $cek->fetch(PDO::FETCH_ASSOC);
    if (!$user) {
        sendResponse('error', 'Data user tidak ditemukan', null, 404);
    }
    // FK pasien -> users memakai CASCADE, jadi cegah data pasien ikut terhapus diam-diam
    if ($user['pasien_id']) {
        sendResponse('error', 'User masih terhubung dengan data pasien. Hapus data pasien terlebih dahulu.', null, 409);
    }

    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$id]);

    sendResponse('success', 'Data User Berhasil Dihapus', ['id' => $id], 200);
} catch (PDOException $e) {
    sendDbError($e, 'menghapus data user');
}
