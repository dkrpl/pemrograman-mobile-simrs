<?php
// Validasi bersama untuk create.php & update.php jadwal praktik
function validateJadwal(array $input)
{
    $hariValid = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

    $data = [
        'dokter_id'   => trim($input['dokter_id'] ?? ''),
        'poli_id'     => trim($input['poli_id'] ?? ''),
        'hari'        => trim($input['hari'] ?? ''),
        'jam_mulai'   => trim($input['jam_mulai'] ?? ''),
        'jam_selesai' => trim($input['jam_selesai'] ?? ''),
        'kuota'       => trim($input['kuota'] ?? '0'),
    ];

    if ($data['dokter_id'] === '' || $data['poli_id'] === '') {
        sendResponse('error', 'Dokter dan Poli wajib dipilih', null, 400);
    }
    if (!in_array($data['hari'], $hariValid, true)) {
        sendResponse('error', 'Hari tidak valid. Gunakan: ' . implode(', ', $hariValid), null, 400);
    }
    foreach (['jam_mulai' => 'Jam mulai', 'jam_selesai' => 'Jam selesai'] as $key => $label) {
        if (!preg_match('/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/', $data[$key])) {
            sendResponse('error', "$label harus berformat HH:MM", null, 400);
        }
    }
    if (strlen($data['jam_mulai']) === 5)   $data['jam_mulai']   .= ':00';
    if (strlen($data['jam_selesai']) === 5) $data['jam_selesai'] .= ':00';
    if ($data['jam_selesai'] <= $data['jam_mulai']) {
        sendResponse('error', 'Jam selesai harus lebih besar dari jam mulai', null, 400);
    }
    if ($data['kuota'] === '' || !ctype_digit($data['kuota'])) {
        sendResponse('error', 'Kuota harus berupa angka 0 atau lebih', null, 400);
    }
    $data['kuota'] = (int)$data['kuota'];

    return $data;
}
