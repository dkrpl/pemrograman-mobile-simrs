<?php
function sendResponse($status, $message, $data = null, $httpCode = 200)
{
    http_response_code($httpCode);
    header('Content-Type: application/json; charset=UTF-8');

    $json = json_encode([
        'status'  => $status,
        'message' => $message,
        'data'    => $data
    ], JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);

    echo $json !== false
        ? $json
        : '{"status":"error","message":"Gagal membuat respons JSON","data":null}';
    exit;
}
