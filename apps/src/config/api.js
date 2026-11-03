import { Platform } from 'react-native';

// Ganti LAN_IP dengan IP LAN komputer Anda jika memakai Expo Go di ponsel fisik (cek: ipconfig)
const LAN_IP = '192.168.110.160';
const USE_REAL_DEVICE = false; // true bila memakai Expo Go di ponsel fisik

// Port Apache:
// - Di komputer Anda: Apache XAMPP berjalan di port 8080 (karena port 80 dipakai Laravel Herd/Nginx).
// - Jika di komputer lain Apache di port default 80, ubah ke ''.
const APACHE_PORT = ':8080';

const HOST = USE_REAL_DEVICE
  ? LAN_IP
  : Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const BASE_URL = `http://${HOST}${APACHE_PORT}/api-simrs`;
