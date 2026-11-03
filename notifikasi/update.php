<?php
require_once '../config/database.php';
require_once '../helpers/response.php';
require_once '../helpers/request.php';
handleCors('POST, PUT, OPTIONS');

// Menerima parameter lewat query string maupun JSON body.
// Field yang tidak dikirim tetap memakai nilai lama, sehingga cukup kirim
// ?id=1&status_baca=1 untuk menandai notifikasi sudah dibaca.
$input = getInput();
$id    = $input['id'] ?? null;

if (empty($id)) {
    sendResponse('error', 'Id notifikasi wajib diisi', null, 400);
}

try {
    $pdo = getConnection();
    $cek = $pdo->prepare("SELECT * FROM notifikasi WHERE id = ?");
    $cek->execute([$id]);
    $current = $cek->fetch(PDO::FETCH_ASSOC);
    if (!$current) {
        sendResponse('error', 'Data notifikasi tidak ditemukan', null, 404);
    }

    $user_id     = trim($input['user_id'] ?? '') ?: $current['user_id'];
    $judul       = trim($input['judul'] ?? '') ?: $current['judul'];
    $pesan       = trim($input['pesan'] ?? '') ?: $current['pesan'];
    $status_baca = isset($input['status_baca']) && $input['status_baca'] !== ''
        ? ((int)$input['status_baca'] ? 1 : 0)
        : (int)$current['status_baca'];

    $stmt = $pdo->prepare("UPDATE notifikasi SET user_id = ?, judul = ?, pesan = ?, status_baca = ? WHERE id = ?");
    $stmt->execute([$user_id, $judul, $pesan, $status_baca, $id]);

    sendResponse('success', 'Data Notifikasi Berhasil Diperbarui', [
        'id'          => $id,
        'user_id'     => $user_id,
        'judul'       => $judul,
        'pesan'       => $pesan,
        'status_baca' => $status_baca
    ], 200);
} catch (PDOException $e) {
    sendDbError($e, 'memperbarui notifikasi');
}
