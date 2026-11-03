<?php
require_once '../config/database.php';
require_once '../helpers/response.php';
require_once '../helpers/request.php';
handleCors('POST, PUT, OPTIONS');

$input    = getInput();
$id       = $input['id'] ?? null;
$nama     = trim($input['nama'] ?? '');
$email    = trim($input['email'] ?? '');
$role     = trim($input['role'] ?? '');
$password = trim($input['password'] ?? ''); // opsional: kosong = password tidak diubah

if (empty($id) || $nama === '' || $email === '' || $role === '') {
    sendResponse('error', 'Id, Nama, Email, dan Role wajib diisi', null, 400);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse('error', 'Format email tidak valid', null, 400);
}
if (!in_array($role, ['admin', 'dokter', 'pasien'], true)) {
    sendResponse('error', 'Role tidak valid. Gunakan: admin, dokter, atau pasien', null, 400);
}
if ($password !== '' && strlen($password) < 6) {
    sendResponse('error', 'Password minimal 6 karakter', null, 400);
}

try {
    $pdo = getConnection();
    $cek = $pdo->prepare("SELECT id FROM users WHERE id = ?");
    $cek->execute([$id]);
    if (!$cek->fetch()) {
        sendResponse('error', 'Data user tidak ditemukan', null, 404);
    }

    if ($password !== '') {
        $stmt = $pdo->prepare("UPDATE users SET nama = ?, email = ?, role = ?, password_hash = ? WHERE id = ?");
        $stmt->execute([$nama, $email, $role, password_hash($password, PASSWORD_BCRYPT), $id]);
    } else {
        $stmt = $pdo->prepare("UPDATE users SET nama = ?, email = ?, role = ? WHERE id = ?");
        $stmt->execute([$nama, $email, $role, $id]);
    }

    sendResponse('success', 'Data User Berhasil Diperbarui', [
        'id'    => $id,
        'nama'  => $nama,
        'email' => $email,
        'role'  => $role
    ], 200);
} catch (PDOException $e) {
    sendDbError($e, 'memperbarui data user');
}
