<?php
require_once '../config/database.php';
require_once '../helpers/response.php';
require_once '../helpers/request.php';
handleCors('POST, DELETE, OPTIONS');

$userId = getInput()['user_id'] ?? null;

if (empty($userId)) {
    sendResponse('error', 'User ID wajib diisi', null, 400);
}

try {
    $pdo  = getConnection();
    $stmt = $pdo->prepare("DELETE FROM token_device WHERE user_id = ?");
    $stmt->execute([$userId]);

    if ($stmt->rowCount() === 0) {
        sendResponse('error', 'Token device untuk user ini tidak ditemukan', null, 404);
    }
    sendResponse('success', 'Token device berhasil dihapus', ['user_id' => $userId], 200);
} catch (PDOException $e) {
    sendDbError($e, 'menghapus token device');
}
