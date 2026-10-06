<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
require_once '../config/database.php';
require_once '../helpers/response.php';

$id             = $_GET['id'] ?? null;
$pendaftaranId  = $_GET['pendaftaran_id'] ?? null;
$pasienId       = $_GET['pasien_id'] ?? null;
$pdo            = getConnection();

$baseSelect = "SELECT 
    rm.id,
    rm.pendaftaran_id,
    rm.dokter_id,
    rm.diagnosa,
    rm.catatan,
    rm.tanggal,
    d.nama as nama_dokter,
    d.spesialisasi,
    pas.nama as nama_pasien,
    pas.no_rm,
    pd.tanggal_kunjungan,
    pd.no_antrian
FROM rekam_medis rm
LEFT JOIN dokter d ON rm.dokter_id = d.id
LEFT JOIN pendaftaran pd ON rm.pendaftaran_id = pd.id
LEFT JOIN pasien pas ON pd.pasien_id = pas.id";

if ($id) {
    $stmt = $pdo->prepare("$baseSelect WHERE rm.id = ? OR rm.pendaftaran_id = ?");
    $stmt->execute([$id, $id]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$data) {
        sendResponse('error', 'Data rekam medis tidak ditemukan', null, 404);
    }
    sendResponse('success', 'Data rekam medis ditemukan', $data);
} elseif ($pendaftaranId) {
    $stmt = $pdo->prepare("$baseSelect WHERE rm.pendaftaran_id = ?");
    $stmt->execute([$pendaftaranId]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);
    sendResponse('success', 'Data rekam medis pendaftaran ditemukan', $data);
} elseif ($pasienId) {
    $stmt = $pdo->prepare("$baseSelect WHERE pd.pasien_id = ? ORDER BY rm.tanggal DESC");
    $stmt->execute([$pasienId]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendResponse('success', 'Daftar rekam medis pasien berhasil diambil', $data);
} else {
    $stmt = $pdo->query("$baseSelect ORDER BY rm.tanggal DESC");
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendResponse('success', 'Daftar rekam medis berhasil diambil', $data);
}
