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

// READ - semua dokter
export const getDokter = async () =>
  (await request(`${BASE_URL}/dokter/index.php`)).data;

// READ - cari berdasarkan nama dokter
export const searchDokter = async (kata) =>
  (await request(`${BASE_URL}/dokter/index.php?id=${q('%' + kata + '%')}`)).data;

// CREATE
export const createDokter = (nama, spesialisasi, no_sip) =>
  request(`${BASE_URL}/dokter/create.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nama, spesialisasi, no_sip }),
  });

// UPDATE
export const updateDokter = (id, nama, spesialisasi, no_sip) =>
  request(
    `${BASE_URL}/dokter/update.php?id=${id}&nama=${q(nama)}&spesialisasi=${q(spesialisasi)}&no_sip=${q(no_sip)}`,
    { method: 'POST' }
  );

// DELETE
export const deleteDokter = (id) =>
  request(`${BASE_URL}/dokter/delete.php?id=${id}`, { method: 'POST' });
