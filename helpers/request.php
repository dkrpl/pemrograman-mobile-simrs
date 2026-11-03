<?php
// Header CORS standar + balas preflight OPTIONS lalu hentikan eksekusi
function handleCors($methods = 'GET, POST, OPTIONS')
{
    header('Access-Control-Allow-Origin: *');
    header("Access-Control-Allow-Methods: $methods");
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Content-Type: application/json; charset=UTF-8');

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

// Ambil input gabungan: query string ($_GET) + JSON body / form-data.
// Nilai dari body menimpa nilai query string bila namanya sama.
function getInput()
{
    $raw  = file_get_contents('php://input');
    $body = json_decode($raw, true);
    if (!is_array($body)) {
        $body = $_POST;
    }
    return array_merge($_GET, $body);
}

// Ubah PDOException menjadi respons yang mudah dipahami pengguna
function sendDbError(PDOException $e, $action = 'memproses data')
{
    $msg = $e->getMessage();
    if ($e->getCode() === '23000') {
        if (stripos($msg, 'foreign key') !== false) {
            if (stripos($msg, 'Cannot delete') !== false) {
                sendResponse('error', 'Data tidak bisa dihapus karena masih dipakai oleh data lain', null, 409);
            }
            sendResponse('error', 'Data relasi yang dipilih tidak ditemukan', null, 409);
        }
        if (stripos($msg, 'Duplicate') !== false) {
            sendResponse('error', 'Data sudah ada (duplikat): ' . duplicateKeyLabel($msg), null, 409);
        }
    }
    sendResponse('error', "Gagal $action: $msg", null, 500);
}

function duplicateKeyLabel($msg)
{
    $labels = [
        'uq_users_email'             => 'email sudah terdaftar',
        'uq_pasien_user_id'          => 'akun user sudah terhubung dengan pasien lain',
        'uq_pasien_nik'              => 'NIK sudah terdaftar',
        'uq_pasien_no_rm'            => 'No. RM sudah dipakai',
        'uq_dokter_no_sip'           => 'No. SIP sudah dipakai',
        'uq_pendaftaran_antrian'     => 'nomor antrean sudah dipakai pada jadwal & tanggal tersebut',
        'uq_rekam_medis_pendaftaran' => 'pendaftaran ini sudah memiliki rekam medis',
    ];
    foreach ($labels as $key => $label) {
        if (strpos($msg, $key) !== false) return $label;
    }
    return 'nilai unik sudah dipakai';
}
