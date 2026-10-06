<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

require_once '../config/database.php';
require_once '../helpers/response.php';

// Preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$raw   = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!is_array($input)) {
    $input = array_merge($_GET, $_POST);
} else {
    $input = array_merge($_GET, $input);
}

$id = $input['id'] ?? null;

if (empty($id)) {
    sendResponse('error', 'ID resep obat wajib diisi', null, 400);
}

try {
    $pdo = getConnection();
    $cek = $pdo->prepare("SELECT id FROM resep_obat WHERE id = ?");
    $cek->execute([$id]);
    if (!$cek->fetch()) {
        sendResponse('error', 'Data resep obat tidak ditemukan', null, 404);
    }

    $stmt = $pdo->prepare("DELETE FROM resep_obat WHERE id = ?");
    $stmt->execute([$id]);

    sendResponse('success', 'Data Resep Obat Berhasil Dihapus', [
        'id' => $id
    ], 200);
} catch (PDOException $e) {
    sendResponse('error', 'Gagal menghapus data resep obat: ' . $e->getMessage(), null, 500);
}
