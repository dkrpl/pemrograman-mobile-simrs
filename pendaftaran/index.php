<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
require_once '../config/database.php';
require_once '../helpers/response.php';

$id        = $_GET['id'] ?? null;
$pasienId  = $_GET['pasien_id'] ?? null;
$tanggal   = $_GET['tanggal'] ?? null;
$pdo       = getConnection();

$baseSelect = "SELECT 
    pd.id,
    pd.pasien_id,
    pd.jadwal_id,
    pd.tanggal_kunjungan,
    pd.no_antrian,
    pd.status,
    pd.created_at,
    pas.nama as nama_pasien,
    pas.no_rm,
    pas.nik,
    d.nama as nama_dokter,
    d.spesialisasi,
    pol.nama_poli,
    pol.lokasi,
    jp.hari,
    jp.jam_mulai,
    jp.jam_selesai
FROM pendaftaran pd
LEFT JOIN pasien pas ON pd.pasien_id = pas.id
LEFT JOIN jadwal_praktik jp ON pd.jadwal_id = jp.id
LEFT JOIN dokter d ON jp.dokter_id = d.id
LEFT JOIN poli pol ON jp.poli_id = pol.id";

if ($id) {
    $stmt = $pdo->prepare("$baseSelect WHERE pd.id = ?");
    $stmt->execute([$id]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$data) {
        sendResponse('error', 'Data pendaftaran tidak ditemukan', null, 404);
    }
    sendResponse('success', 'Data pendaftaran ditemukan', $data);
} elseif ($pasienId) {
    $stmt = $pdo->prepare("$baseSelect WHERE pd.pasien_id = ? ORDER BY pd.tanggal_kunjungan DESC, pd.no_antrian ASC");
    $stmt->execute([$pasienId]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendResponse('success', 'Daftar pendaftaran pasien berhasil diambil', $data);
} else {
    $sql = "$baseSelect";
    $params = [];
    if ($tanggal) {
        $sql .= " WHERE pd.tanggal_kunjungan = ?";
        $params[] = $tanggal;
    }
    $sql .= " ORDER BY pd.tanggal_kunjungan DESC, pd.no_antrian ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    sendResponse('success', 'Daftar pendaftaran berhasil diambil', $data);
}
