<?php
require_once '../config/database.php';
require_once '../helpers/response.php';
require_once '../helpers/request.php';
handleCors('GET, OPTIONS');

$id       = $_GET['id'] ?? null;
$poliId   = $_GET['poli_id'] ?? null;
$dokterId = $_GET['dokter_id'] ?? null;
$hari     = $_GET['hari'] ?? null;
$pdo      = getConnection();

$baseSelect = "SELECT
    a.id,
    a.dokter_id,
    a.poli_id,
    a.hari,
    TIME_FORMAT(a.jam_mulai, '%H:%i')   AS jam_mulai,
    TIME_FORMAT(a.jam_selesai, '%H:%i') AS jam_selesai,
    a.kuota,
    b.nama_poli,
    b.lokasi,
    c.nama AS nama_dokter,
    c.spesialisasi
FROM jadwal_praktik a
LEFT JOIN poli b ON a.poli_id = b.id
LEFT JOIN dokter c ON a.dokter_id = c.id";

$orderBy = "ORDER BY FIELD(a.hari, 'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'), a.jam_mulai";

if ($id) {
    // Cari berdasarkan id jadwal atau nama poli
    $stmt = $pdo->prepare("$baseSelect WHERE a.id = ? OR b.nama_poli LIKE ? $orderBy");
    $stmt->execute([$id, "%$id%"]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$data) {
        sendResponse('error', 'Data jadwal praktik tidak ditemukan', null, 404);
    }
    sendResponse('success', 'Data jadwal praktik ditemukan', $data);
}

// Filter opsional: ?poli_id= &dokter_id= &hari=
$where  = [];
$params = [];
if ($poliId)   { $where[] = 'a.poli_id = ?';   $params[] = $poliId; }
if ($dokterId) { $where[] = 'a.dokter_id = ?'; $params[] = $dokterId; }
if ($hari)     { $where[] = 'a.hari = ?';      $params[] = $hari; }

$sql  = $baseSelect . ($where ? ' WHERE ' . implode(' AND ', $where) : '') . " $orderBy";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
sendResponse('success', 'Daftar jadwal praktik berhasil diambil', $stmt->fetchAll(PDO::FETCH_ASSOC));
