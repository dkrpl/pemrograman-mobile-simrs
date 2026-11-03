# 🏥 SIMRS Mobile & REST API

Sistem Informasi Manajemen Rumah Sakit (SIMRS) berbasis **RESTful API (PHP Native & MySQL/MariaDB)** dan **Frontend Mobile (React Native dengan Expo SDK 57)**.

---

## 📋 Daftar Fitur

- 📊 **Dashboard Utama:** Ringkasan statistik data (Poli, Dokter, Pasien, Jadwal) dan indikator status koneksi API secara *real-time*.
- 🏥 **Master Data Poliklinik:** Operasi CRUD, pencarian poli, validasi nama minimal 3 karakter.
- 👨‍⚕️ **Master Data Dokter:** Operasi CRUD data dokter, spesialisasi, dan nomor SIP.
- 👥 **Master Data Pasien:** Pendaftaran pasien, pencarian nomor RM, validasi NIK 16 digit, dan identitas lengkap.
- 📅 **Jadwal Praktik Dokter:** Informasi jadwal dokter per poliklinik, jam operasional, dan kuota pasien.
- 📋 **Pendaftaran & Antrean:** Manajemen antrean per tanggal kunjungan beserta status (*menunggu, dipanggil, selesai, batal*).
- 🩺 **Rekam Medis & Resep Obat:** Pencatatan diagnosa klinis dan pengelolaan resep obat pasien.
- 🔐 **Sistem Autentikasi:** Endpoint registrasi dan login dengan enkripsi password (Bcrypt) dan API token.
- 🔔 **Notifikasi & FCM Token:** Pengelolaan pesan notifikasi dan penyimpanan token perangkat.

---

## 🛠️ Prasyarat Sistem (Prerequisites)

Sebelum melakukan instalasi, pastikan perangkat Anda telah terpasang:
1. **Git**
2. **PHP 8.0+** (bawaan XAMPP)
3. **MySQL atau MariaDB** (bawaan XAMPP)
4. **Node.js** (rekomendasi LTS v18 atau v20+) dan **npm**
5. **Web Browser** (Chrome / Edge / Firefox)
6. **Aplikasi Expo Go** di smartphone Android/iOS *(opsional, jika ingin menguji di HP fisik)*

---

## 🚀 Panduan Setup & Instalasi Cepat

### Langkah 1: Clone Repository ke Folder `htdocs` (Sangat Direkomendasikan)

Web server Apache pada XAMPP secara default membaca dan melayani file dari folder `htdocs`. Oleh karena itu, **sangat disarankan** untuk meng-clone project ini langsung ke dalam direktori `htdocs` XAMPP Anda agar API langsung siap diakses tanpa konfigurasi tambahan:

```bash
# 1. Buka terminal dan masuk ke folder htdocs XAMPP Anda
cd C:\xampp\htdocs

# 2. Clone repository ke dalam folder api-simrs
git clone <URL_REPOSITORY_ANDA> api-simrs

# 3. Masuk ke folder project
cd api-simrs
```

> [!TIP]
> **Alternatif: Jika Ingin Meletakkan Project di Luar `htdocs` (Misal Drive D:)**  
> Jika Anda lebih suka menyimpan file proyek di drive lain (misalnya `D:\Kuliah\project-mobile\api-simrs`), Anda tetap bisa melakukannya. Cukup hubungkan folder tersebut ke `htdocs` menggunakan *Directory Junction* (pintu masuk virtual) sekali saja:
> - **Windows PowerShell:**
>   ```powershell
>   New-Item -ItemType Junction -Path "C:\xampp\htdocs\api-simrs" -Target (Get-Location)
>   ```
> - **Command Prompt (CMD):**
>   ```cmd
>   mklink /J "C:\xampp\htdocs\api-simrs" "%cd%"
>   ```
> *(Sesuaikan `C:\xampp` dengan lokasi instalasi XAMPP Anda jika berbeda, misal `C:\xampp2`).*

---

### Langkah 2: Setup & Migrasi Database

1. Buka **XAMPP Control Panel**, lalu klik **Start** pada modul **Apache** dan **MySQL**.
2. Buka terminal di folder utama `api-simrs`, lalu jalankan migrasi database otomatis:
   ```bash
   php migrate.php
   ```
   *Atau bisa juga dibuka langsung melalui browser:*
   ```
   http://localhost/api-simrs/migrate.php
   ```

**Apa yang dilakukan script `migrate.php`?**
- Otomatis mendeteksi koneksi MySQL (port 3306 bawaan XAMPP maupun port 3307).
- Membuat database `api_rs` jika belum ada.
- Mengeksekusi seluruh skema tabel dari `db/api_rs.sql` (10 tabel).
- Mengisi data awal (*seeder*) untuk poli, dokter, user, pasien, dan jadwal praktik agar siap langsung diuji.

---

### Langkah 3: Setup & Menjalankan Frontend Mobile (Expo)

1. Masuk ke direktori `apps`:
   ```bash
   cd apps
   ```
2. Install seluruh dependensi proyek:
   ```bash
   npm install
   ```

3. **Pengaturan Alamat API (`apps/src/config/api.js`):**
   - **Mode Web Browser (Default):** Sudah siap pakai `http://localhost/api-simrs`.
   - **Mode Emulator Android:** Otomatis mengarah ke `10.0.2.2`.
   - **Mode Ponsel Fisik (Expo Go):**
     1. Buka file `apps/src/config/api.js`.
     2. Ubah `const USE_REAL_DEVICE = true;`.
     3. Masukkan IP Wi-Fi laptop/komputer Anda pada `LAN_IP` (cek via perintah `ipconfig` di CMD).

4. **Jalankan Aplikasi:**
   - **Di Web Browser (Direkomendasikan untuk Praktikum):**
     ```bash
     npm run web
     ```
     Aplikasi akan otomatis terbuka di browser pada alamat `http://localhost:8081`.
   
   - **Di Ponsel Smartphone (Expo Go):**
     ```bash
     npm start
     ```
     Pindai (scan) QR Code yang muncul di terminal menggunakan aplikasi **Expo Go** pada ponsel Anda (pastikan ponsel dan PC berada dalam satu jaringan Wi-Fi yang sama).

---

## 📡 Dokumentasi Endpoint RESTful API

Seluruh respon API berformat JSON standar:
```json
{
  "status": "success",
  "message": "Pesan deskriptif",
  "data": { ... }
}
```

### 1. Autentikasi (`auth/`)
| Method | Endpoint | Keterangan |
| :---: | :--- | :--- |
| `POST` | `/auth/login.php` | Login akun (`email`, `password`) |
| `POST` | `/auth/register.php` | Registrasi user baru (`nama`, `email`, `password`, `role`) |

### 2. Poliklinik (`poli/`)
| Method | Endpoint | Parameter / Body | Keterangan |
| :---: | :--- | :--- | :--- |
| `GET` | `/poli/index.php` | - | Ambil semua poli |
| `GET` | `/poli/index.php?id={nama}` | `id` | Cari poli berdasarkan nama |
| `POST` | `/poli/create.php` | `{"nama_poli": "...", "lokasi": "..."}` | Tambah poli baru |
| `POST` | `/poli/update.php?id={id}&nama_poli={...}&lokasi={...}` | Query / Form | Ubah data poli |
| `POST` | `/poli/delete.php?id={id}` | `id` | Hapus poli |

### 3. Dokter (`dokter/`)
| Method | Endpoint | Parameter / Body | Keterangan |
| :---: | :--- | :--- | :--- |
| `GET` | `/dokter/index.php` | - | Ambil semua dokter |
| `GET` | `/dokter/index.php?id={nama}` | `id` | Cari dokter berdasarkan nama |
| `POST` | `/dokter/create.php` | `{"nama": "...", "spesialisasi": "...", "no_sip": "..."}` | Tambah dokter baru |
| `POST` | `/dokter/update.php` | Query / Form | Ubah data dokter |
| `POST` | `/dokter/delete.php?id={id}` | `id` | Hapus dokter |

### 4. Pasien (`pasien/`)
| Method | Endpoint | Parameter / Body | Keterangan |
| :---: | :--- | :--- | :--- |
| `GET` | `/pasien/index.php` | - | Ambil semua pasien |
| `GET` | `/pasien/index.php?id={no_rm}` | `id` | Cari pasien berdasarkan Nomor RM |
| `POST` | `/pasien/create.php` | `{"nama": "...", "nik": "...", "no_rm": "...", ...}` | Tambah data pasien |
| `POST` | `/pasien/update.php` | Query / Form | Ubah data pasien |
| `POST` | `/pasien/delete.php?id={id}` | `id` | Hapus pasien |

### 5. Jadwal Praktik (`jadwal_praktik/`)
| Method | Endpoint | Keterangan |
| :---: | :--- | :--- |
| `GET` | `/jadwal_praktik/index.php` | Ambil seluruh jadwal (JOIN dokter & poli) |
| `POST` | `/jadwal_praktik/create.php` | Tambah jadwal (`dokter_id`, `poli_id`, `hari`, dll) |
| `POST` | `/jadwal_praktik/update.php` | Ubah jadwal praktik |
| `POST` | `/jadwal_praktik/delete.php?id={id}` | Hapus jadwal praktik |

### 6. Pendaftaran Antrean (`pendaftaran/`)
| Method | Endpoint | Keterangan |
| :---: | :--- | :--- |
| `GET` | `/pendaftaran/index.php` | Ambil seluruh antrean pendaftaran |
| `POST` | `/pendaftaran/create.php` | Buat pendaftaran antrean baru |
| `POST` | `/pendaftaran/update.php` | Ubah pendaftaran / status antrean |
| `POST` | `/pendaftaran/delete.php?id={id}` | Batalkan pendaftaran |

### 7. Rekam Medis & Resep Obat
| Method | Endpoint | Keterangan |
| :---: | :--- | :--- |
| `GET` | `/rekam_medis/index.php` | Daftar rekam medis pasien |
| `POST` | `/rekam_medis/create.php` | Tambah rekam medis |
| `GET` | `/resep_obat/index.php` | Daftar resep obat |
| `POST` | `/resep_obat/create.php` | Tambah resep obat |

---

## 📂 Struktur Direktori

```plaintext
api-simrs/
├── apps/                          # Frontend React Native (Expo)
│   ├── src/
│   │   ├── config/api.js          # Pengaturan URL Host & IP backend
│   │   ├── screens/               # Layar aplikasi (Home, Poli, Dokter, Pasien, dll)
│   │   ├── services/              # Modul fetch HTTP API
│   │   └── utils/dialog.js        # Helper dialog lintas platform (Web & Mobile)
│   ├── App.js                     # Root navigator aplikasi
│   └── package.json               # Dependensi Expo & React Native
├── auth/                          # Endpoint Login & Register
├── config/
│   └── database.php               # Koneksi PDO multi-environment (auto fallback)
├── db/
│   └── api_rs.sql                 # Skema basis data SQL (MariaDB & MySQL)
├── dokter/                        # REST API modul Dokter
├── helpers/
│   └── response.php               # Helper format respon JSON
├── jadwal_praktik/                # REST API modul Jadwal Praktik
├── notifikasi/                    # REST API modul Notifikasi
├── pasien/                        # REST API modul Pasien
├── pendaftaran/                   # REST API modul Pendaftaran Antrean
├── poli/                          # REST API modul Poliklinik
├── rekam_medis/                   # REST API modul Rekam Medis
├── resep_obat/                    # REST API modul Resep Obat
├── token_device/                  # REST API modul Token Perangkat (FCM)
├── migrate.php                    # Script migrasi & seeder otomatis
└── README.md                      # Dokumentasi proyek
```

---

## ❓ Pemecahan Masalah (Troubleshooting)

1. **Error PowerShell: `npm.ps1 cannot be loaded because running scripts is disabled on this system (PSSecurityException)`:**
   - **Penyebab:** Windows PowerShell secara default membatasi eksekusi script.
   - **Solusi Cepat:** Buka PowerShell dan jalankan perintah berikut (tidak memerlukan hak Administrator):
     ```powershell
     Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
     ```
     Pilih `Y` (Yes) saat konfirmasi, lalu jalankan kembali `npm install`.
   - **Solusi Alternatif:** Gunakan **Command Prompt (CMD)** biasa atau panggil `npm.cmd install`.

2. **Error Browser: `net::ERR_FAILED 404 (Not Found)` & `blocked by CORS policy`:**
   - **Penyebab:** Frontend mencoba mengakses `http://localhost/api-simrs/...`, namun folder proyek di dalam `C:\xampp\htdocs\` tidak bernama `api-simrs` (misalnya folder dinamai `pemrograman-mobile`). Karena folder tidak ditemukan, Apache mengirim error 404 tanpa header CORS.
   - **Solusi Opsi A (Direkomendasikan):** Ubah nama folder di dalam `C:\xampp\htdocs\` menjadi persis `api-simrs`.
   - **Solusi Opsi B:** Jika ingin tetap memakai nama folder lain (misal `pemrograman-mobile`), buka file `apps/src/config/api.js` lalu ubah URL path-nya:
     ```javascript
     export const BASE_URL = `http://${HOST}${APACHE_PORT}/pemrograman-mobile`;
     ```
   - **Verifikasi:** Buka browser dan kunjungi `http://localhost/api-simrs/poli/index.php`. Jika muncul respon JSON, maka API sudah terhubung dengan benar.

3. **`Network request failed` / `Failed to fetch` saat membuka aplikasi mobile:**
   - Pastikan modul **Apache** dan **MySQL** di XAMPP berstatus **Running** (indikator berwarna hijau).
   - Jika menggunakan smartphone fisik dengan Expo Go, pastikan `USE_REAL_DEVICE = true` di `apps/src/config/api.js` dan PC serta smartphone berada pada satu jaringan Wi-Fi yang sama.

4. **Koneksi Database Gagal:**
   - Pastikan modul **MySQL** di XAMPP berstatus **Running**.
   - Jika MySQL memakai port non-standar (misal 3307) atau memiliki password root, konfigurasi di `config/database.php` otomatis mencoba menghubungkan ke port 3306 dan 3307. Anda juga dapat mengatur Environment Variable `DB_PORT`, `DB_USER`, dan `DB_PASS`.

5. **Dependensi npm Error:**
   - Jalankan `npx expo-doctor` di dalam folder `apps/` untuk memverifikasi keselarasan paket.
   - Jalankan `npx expo install --fix` bila terdapat versi paket yang tidak sesuai.
