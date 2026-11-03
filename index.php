<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
require_once __DIR__ . '/helpers/response.php';

sendResponse('success', 'API SIMRS Backend Berjalan dengan Baik', [
    'app'       => 'SIMRS Mobile & REST API',
    'version'   => '1.0.0',
    'status'    => 'online',
    'timestamp' => date('Y-m-d H:i:s'),
    'modules'   => [
        'auth'           => '/auth/login.php, /auth/register.php',
        'poli'           => '/poli/index.php',
        'dokter'         => '/dokter/index.php',
        'pasien'         => '/pasien/index.php',
        'jadwal_praktik' => '/jadwal_praktik/index.php',
        'pendaftaran'    => '/pendaftaran/index.php',
        'rekam_medis'    => '/rekam_medis/index.php',
        'resep_obat'     => '/resep_obat/index.php',
        'notifikasi'     => '/notifikasi/index.php',
        'users'          => '/users/index.php',
        'token_device'   => '/token_device/index.php, /token_device/save.php',
        'dashboard'      => '/dashboard/index.php',
        'migration'      => '/migrate.php'
    ]
]);
