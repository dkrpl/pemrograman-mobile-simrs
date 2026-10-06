import { Platform } from 'react-native';

// Ganti LAN_IP dengan IP LAN komputer Anda jika memakai Expo Go di ponsel fisik (cek: ipconfig)
const LAN_IP = '192.168.110.160';
const USE_REAL_DEVICE = false; // true bila memakai Expo Go di ponsel fisik

// Port Apache (default XAMPP adalah port 80 tanpa tanda titik dua).
// Jika Apache memakai port khusus (misal 8080), isi ':8080'.
const APACHE_PORT = '';

const HOST = USE_REAL_DEVICE
  ? LAN_IP
  : Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const BASE_URL = `http://${HOST}${APACHE_PORT}/api-simrs`;
