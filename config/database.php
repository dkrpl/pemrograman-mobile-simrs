<?php
function getConnection()
{
    $envHost = getenv('DB_HOST') ?: '127.0.0.1';
    $envPort = getenv('DB_PORT') ?: '3306';
    $envDb   = getenv('DB_NAME') ?: 'api_rs';
    $envUser = getenv('DB_USER') ?: 'root';
    $envPass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';

    $candidates = [
        ['host' => $envHost, 'port' => $envPort, 'dbname' => $envDb, 'user' => $envUser, 'pass' => $envPass],
        ['host' => '127.0.0.1', 'port' => '3306', 'dbname' => $envDb, 'user' => 'root', 'pass' => ''],
        ['host' => '127.0.0.1', 'port' => '3307', 'dbname' => $envDb, 'user' => 'root', 'pass' => '1986'],
        ['host' => 'localhost', 'port' => '3306', 'dbname' => $envDb, 'user' => 'root', 'pass' => ''],
    ];

    foreach ($candidates as $c) {
        try {
            $pdo = new PDO("mysql:host={$c['host']};port={$c['port']};dbname={$c['dbname']};charset=utf8mb4", $c['user'], $c['pass']);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $pdo;
        } catch (PDOException $e) {
            continue;
        }
    }

    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Koneksi database gagal']);
    exit;
}
