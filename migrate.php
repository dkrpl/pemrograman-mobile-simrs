<?php
/**
 * Script Migrasi Database API-SIMRS
 * Menjalankan migrasi struktur database dari db/api_rs.sql
 * Dapat dijalankan via CLI (php migrate.php) atau browser.
 */

$isCli = (php_sapi_name() === 'cli');

function output($msg, $type = 'info') {
    global $isCli;
    if ($isCli) {
        $colors = [
            'success' => "\033[32m[OK]\033[0m ",
            'error'   => "\033[31m[ERROR]\033[0m ",
            'info'    => "\033[34m[INFO]\033[0m ",
            'warn'    => "\033[33m[WARN]\033[0m "
        ];
        echo ($colors[$type] ?? '') . $msg . "\n";
    } else {
        $styles = [
            'success' => 'color: #16a34a; font-weight: bold;',
            'error'   => 'color: #dc2626; font-weight: bold;',
            'info'    => 'color: #2563eb;',
            'warn'    => 'color: #d97706;'
        ];
        echo "<div style='margin: 4px 0; font-family: monospace; " . ($styles[$type] ?? '') . "'>" . htmlspecialchars($msg) . "</div>";
    }
}

if (!$isCli) {
    echo "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Migrasi Database SIMRS</title></head><body style='background:#f9fafb; padding:20px; font-family:sans-serif;'>";
    echo "<h2>Proses Migrasi Database API-SIMRS</h2><pre style='background:#fff; border:1px solid #e5e7eb; padding:15px; border-radius:8px;'>";
}

output("Memulai proses migrasi database SIMRS...", "info");

// 1. Tentukan koneksi MySQL server
$envHost = getenv('DB_HOST') ?: '127.0.0.1';
$envPort = getenv('DB_PORT') ?: '3306';
$envUser = getenv('DB_USER') ?: 'root';
$envPass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';
$dbname  = getenv('DB_NAME') ?: 'api_rs';

$candidates = [
    ['host' => $envHost, 'port' => $envPort, 'user' => $envUser, 'pass' => $envPass],
    ['host' => '127.0.0.1', 'port' => '3306', 'user' => 'root', 'pass' => ''],
    ['host' => '127.0.0.1', 'port' => '3307', 'user' => 'root', 'pass' => '1986'],
    ['host' => 'localhost', 'port' => '3306', 'user' => 'root', 'pass' => ''],
];

$serverPdo = null;
$activeConfig = null;

foreach ($candidates as $c) {
    try {
        $dsn = "mysql:host={$c['host']};port={$c['port']};charset=utf8mb4";
        $serverPdo = new PDO($dsn, $c['user'], $c['pass']);
        $serverPdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $activeConfig = $c;
        output("Berhasil terhubung ke MySQL Server di {$c['host']}:{$c['port']} (user: {$c['user']})", "success");
        break;
    } catch (PDOException $e) {
        continue;
    }
}

if (!$serverPdo) {
    output("Gagal terhubung ke MySQL Server. Pastikan MySQL di XAMPP / MariaDB sudah berjalan.", "error");
    if (!$isCli) echo "</pre></body></html>";
    exit(1);
}

// 2. Buat database jika belum ada
try {
    $serverPdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    output("Database `$dbname` siap digunakan.", "success");
} catch (PDOException $e) {
    output("Gagal membuat database `$dbname`: " . $e->getMessage(), "error");
    if (!$isCli) echo "</pre></body></html>";
    exit(1);
}

// 3. Sambungkan PDO langsung ke database target
try {
    $dbPdo = new PDO(
        "mysql:host={$activeConfig['host']};port={$activeConfig['port']};dbname=$dbname;charset=utf8mb4",
        $activeConfig['user'],
        $activeConfig['pass']
    );
    $dbPdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    output("Gagal membuka database `$dbname`: " . $e->getMessage(), "error");
    if (!$isCli) echo "</pre></body></html>";
    exit(1);
}

// 4. Baca file SQL
$sqlFile = __DIR__ . '/db/api_rs.sql';
if (!file_exists($sqlFile)) {
    output("File SQL tidak ditemukan di $sqlFile", "error");
    if (!$isCli) echo "</pre></body></html>";
    exit(1);
}

output("Membaca file skema dari db/api_rs.sql...", "info");
$sqlContent = file_get_contents($sqlFile);

// Hapus komentar multi-line dan single-line
$cleanSql = preg_replace('/--.*$/m', '', $sqlContent);
$cleanSql = preg_replace('/\/\*.*?\*\//s', '', $cleanSql);

// Jalankan perintah demi perintah
$statements = array_filter(array_map('trim', explode(';', $cleanSql)));

$dbPdo->exec("SET FOREIGN_KEY_CHECKS = 0");

$successCount = 0;
$failCount = 0;

foreach ($statements as $stmt) {
    if (empty($stmt)) continue;
    try {
        $dbPdo->exec($stmt);
        $successCount++;
    } catch (PDOException $e) {
        output("Gagal eksekusi: " . substr($stmt, 0, 60) . "... | Pesan: " . $e->getMessage(), "warn");
        $failCount++;
    }
}

$dbPdo->exec("SET FOREIGN_KEY_CHECKS = 1");
output("Eksekusi query skema selesai: $successCount berhasil, $failCount dilewati/gagal.", "success");

// 5. Cek tabel-tabel yang berhasil dibuat
$tablesStmt = $dbPdo->query("SHOW TABLES");
$tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);

output("Tabel yang terdaftar di database `$dbname` (" . count($tables) . " tabel):", "info");
foreach ($tables as $t) {
    $cntStmt = $dbPdo->query("SELECT COUNT(*) FROM `$t`");
    $rowCount = $cntStmt->fetchColumn();
    output(" - Tabel `$t` (Jumlah baris: $rowCount)", "success");
}

// 6. Isi data awal (seed) jika tabel masih kosong
$seedPoli = $dbPdo->query("SELECT COUNT(*) FROM `poli`")->fetchColumn();
if ($seedPoli == 0) {
    output("Mengisi sample data awal (seeder)...", "info");
    
    // Seed Poli
    $dbPdo->exec("
        INSERT INTO `poli` (`id`, `nama_poli`, `lokasi`) VALUES
        (1, 'Poli Umum', 'Gedung A Lantai 1'),
        (2, 'Poli Gigi & Mulut', 'Gedung A Lantai 2'),
        (3, 'Poli Anak', 'Gedung B Lantai 1'),
        (4, 'Poli Penyakit Dalam', 'Gedung B Lantai 2'),
        (5, 'Poli Mata', 'Gedung C Lantai 1')
    ");
    output("Sample data `poli` berhasil ditambahkan (5 data).", "success");

    // Seed Dokter
    $dbPdo->exec("
        INSERT INTO `dokter` (`id`, `nama`, `spesialisasi`, `no_sip`) VALUES
        (1, 'dr. Budi Santoso, Sp.PD', 'Spesialis Penyakit Dalam', 'SIP.445/001/IDI/2022'),
        (2, 'dr. Siti Rahma, Sp.A', 'Spesialis Anak', 'SIP.445/002/IDI/2023'),
        (3, 'drg. Maya Lestari', 'Dokter Gigi', 'SIP.445/003/PDGI/2021'),
        (4, 'dr. Ahmad Fauzi', 'Dokter Umum', 'SIP.445/004/IDI/2024')
    ");
    output("Sample data `dokter` berhasil ditambahkan (4 data).", "success");

    // Seed Users
    $passwordHash = password_hash('password123', PASSWORD_BCRYPT);
    $dbPdo->exec("
        INSERT INTO `users` (`id`, `nama`, `email`, `password_hash`, `role`, `api_token`) VALUES
        (1, 'Administrator', 'admin@simrs.com', '$passwordHash', 'admin', 'token_admin_123'),
        (2, 'dr. Budi Santoso', 'budi@simrs.com', '$passwordHash', 'dokter', 'token_dokter_123'),
        (3, 'Joko Susanto', 'joko@gmail.com', '$passwordHash', 'pasien', 'token_pasien_123')
    ");
    output("Sample data `users` berhasil ditambahkan (3 data).", "success");

    // Seed Pasien
    $dbPdo->exec("
        INSERT INTO `pasien` (`id`, `user_id`, `nik`, `no_rm`, `nama`, `tgl_lahir`, `jenis_kelamin`, `alamat`) VALUES
        (1, 3, '3515081234560001', 'RM-2026-0001', 'Joko Susanto', '1995-08-15', 'L', 'Jl. Merdeka No. 45, Surabaya')
    ");
    output("Sample data `pasien` berhasil ditambahkan (1 data).", "success");

    // Seed Jadwal Praktik
    $dbPdo->exec("
        INSERT INTO `jadwal_praktik` (`id`, `dokter_id`, `poli_id`, `hari`, `jam_mulai`, `jam_selesai`, `kuota`) VALUES
        (1, 1, 4, 'Senin', '08:00:00', '12:00:00', 20),
        (2, 2, 3, 'Selasa', '09:00:00', '13:00:00', 15),
        (3, 3, 2, 'Rabu', '08:30:00', '11:30:00', 10),
        (4, 4, 1, 'Kamis', '08:00:00', '14:00:00', 25)
    ");
    output("Sample data `jadwal_praktik` berhasil ditambahkan (4 data).", "success");

    // Seed Pendaftaran Antrean
    $today = date('Y-m-d');
    $dbPdo->exec("
        INSERT INTO `pendaftaran` (`id`, `pasien_id`, `jadwal_id`, `tanggal_kunjungan`, `no_antrian`, `status`) VALUES
        (1, 1, 4, '$today', 1, 'dipanggil'),
        (2, 1, 2, '$today', 2, 'menunggu'),
        (3, 1, 1, '$today', 3, 'selesai')
    ");
    output("Sample data `pendaftaran` berhasil ditambahkan (3 data).", "success");

    // Seed Rekam Medis
    $dbPdo->exec("
        INSERT INTO `rekam_medis` (`id`, `pendaftaran_id`, `dokter_id`, `diagnosa`, `catatan`, `tanggal`) VALUES
        (1, 3, 4, 'Febris (Demam Akut) dan Pharyngitis', 'Pasien istirahat cukup, hindari makanan berminyak', '$today 09:30:00')
    ");
    output("Sample data `rekam_medis` berhasil ditambahkan (1 data).", "success");

    // Seed Resep Obat
    $dbPdo->exec("
        INSERT INTO `resep_obat` (`id`, `rekam_medis_id`, `nama_obat`, `dosis`, `jumlah`) VALUES
        (1, 1, 'Paracetamol 500mg', '3x1 tablet sesudah makan', 10),
        (2, 1, 'Amoxicillin 500mg', '3x1 tablet sesudah makan (habiskan)', 15),
        (3, 1, 'Vitamin C 500mg', '1x1 tablet sesudah makan', 10)
    ");
    output("Sample data `resep_obat` berhasil ditambahkan (3 data).", "success");
}

output("Migrasi database berhasil diselesaikan dengan sukses!", "success");

if (!$isCli) {
    echo "</pre>";
    echo "<p><a href='poli/index.php' style='display:inline-block; padding:10px 16px; background:#2563eb; color:#fff; text-decoration:none; border-radius:6px;'>Uji Endpoint API Poli</a></p>";
    echo "</body></html>";
}
