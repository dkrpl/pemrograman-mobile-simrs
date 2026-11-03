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

// READ - semua pasien
export const getPasien = async () =>
  (await request(`${BASE_URL}/pasien/index.php`)).data;

// READ - cari berdasarkan No RM
export const searchPasien = async (kata) =>
  (await request(`${BASE_URL}/pasien/index.php?id=${q('%' + kata + '%')}`)).data;

// CREATE
export const createPasien = (data) =>
  request(`${BASE_URL}/pasien/create.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

// UPDATE
export const updatePasien = (data) =>
  request(
    `${BASE_URL}/pasien/update.php?id=${data.id}&user_id=${data.user_id}&nik=${q(data.nik)}&no_rm=${q(data.no_rm)}&nama=${q(data.nama)}&tgl_lahir=${q(data.tgl_lahir)}&jenis_kelamin=${q(data.jenis_kelamin)}&alamat=${q(data.alamat || '')}`,
    { method: 'POST' }
  );

// DELETE
export const deletePasien = (id) =>
  request(`${BASE_URL}/pasien/delete.php?id=${id}`, { method: 'POST' });
