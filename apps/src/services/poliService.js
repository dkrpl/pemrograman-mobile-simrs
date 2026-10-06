import { BASE_URL } from '../config/api';

async function request(url, options) {
  const res = await fetch(url, options);
  const json = await res.json();
  if (!res.ok || json.status !== 'success') {
    throw new Error(json.message || 'Terjadi kesalahan pada server');
  }
  return json;
}

const q = encodeURIComponent;

// READ - semua poli
export const getPoli = async () =>
  (await request(`${BASE_URL}/poli/index.php`)).data;

// READ - cari berdasarkan nama (API mengembalikan 1 objek)
export const searchPoli = async (kata) =>
  (await request(`${BASE_URL}/poli/index.php?id=${q('%' + kata + '%')}`)).data;

// CREATE - body JSON
export const createPoli = (nama_poli, lokasi) =>
  request(`${BASE_URL}/poli/create.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nama_poli, lokasi }),
  });

// UPDATE - parameter lewat query string
export const updatePoli = (id, nama_poli, lokasi) =>
  request(
    `${BASE_URL}/poli/update.php?id=${id}&nama_poli=${q(nama_poli)}&lokasi=${q(lokasi)}`,
    { method: 'POST' }
  );

// DELETE - parameter lewat query string
export const deletePoli = (id) =>
  request(`${BASE_URL}/poli/delete.php?id=${id}`, { method: 'POST' });
