<?php
// Validasi bersama untuk create.php & update.php pasien
function validatePasien(array $input)
{
    $data = [
        'user_id'       => trim($input['user_id'] ?? ''),
        'nik'           => trim($input['nik'] ?? ''),
        'no_rm'         => trim($input['no_rm'] ?? ''),
        'nama'          => trim($input['nama'] ?? ''),
        'tgl_lahir'     => trim($input['tgl_lahir'] ?? ''),
        'jenis_kelamin' => trim($input['jenis_kelamin'] ?? ''),
        'alamat'        => trim($input['alamat'] ?? ''),
    ];

    if ($data['user_id'] === '' || !ctype_digit($data['user_id'])) {
        sendResponse('error', 'Akun user pasien wajib dipilih', null, 400);
    }
    if (!preg_match('/^\d{16}$/', $data['nik'])) {
        sendResponse('error', 'NIK harus 16 digit angka', null, 400);
    }
    if ($data['no_rm'] === '') {
        sendResponse('error', 'Nomor RM wajib diisi', null, 400);
    }
    if ($data['nama'] === '') {
        sendResponse('error', 'Nama pasien wajib diisi', null, 400);
    }
    $tgl = DateTime::createFromFormat('Y-m-d', $data['tgl_lahir']);
    if (!$tgl || $tgl->format('Y-m-d') !== $data['tgl_lahir']) {
        sendResponse('error', 'Tanggal lahir harus berformat YYYY-MM-DD', null, 400);
    }
    if (!in_array($data['jenis_kelamin'], ['L', 'P'], true)) {
        sendResponse('error', 'Jenis kelamin harus L atau P', null, 400);
    }

    return $data;
}
