<?php
require_once '../config/database.php';
require_once '../helpers/response.php';
require_once '../helpers/request.php';
handleCors('POST, OPTIONS');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse('error', 'Method harus POST', null, 405);
}

$input    = getInput();
$nama     = trim($input['nama'] ?? '');
$email    = trim($input['email'] ?? '');
$password = trim($input['password'] ?? '');
$role     = trim($input['role'] ?? 'pasien');

if ($nama === '') {
    sendResponse('error', 'Nama wajib diisi', null, 400);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse('error', 'Format email tidak valid', null, 400);
}
if (strlen($password) < 6) {
    sendResponse('error', 'Password minimal 6 karakter', null, 400);
}
if (!in_array($role, ['admin', 'dokter', 'pasien'], true)) {
    sendResponse('error', 'Role tidak valid. Gunakan: admin, dokter, atau pasien', null, 400);
}

try {
    $pdo  = getConnection();
    $stmt = $pdo->prepare("INSERT INTO users (nama, email, password_hash, role, api_token) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$nama, $email, password_hash($password, PASSWORD_BCRYPT), $role, bin2hex(random_bytes(32))]);

    sendResponse('success', 'Data User Berhasil Ditambahkan', [
        'id'    => $pdo->lastInsertId(),
        'nama'  => $nama,
        'email' => $email,
        'role'  => $role
    ], 201);
} catch (PDOException $e) {
    sendDbError($e, 'menyimpan data user');
}
