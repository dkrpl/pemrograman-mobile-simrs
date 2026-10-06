import { BASE_URL } from '../config/api';

async function request(url, options) {
  const res = await fetch(url, options);
  const json = await res.json();
  if (!res.ok || json.status !== 'success') {
    throw new Error(json.message || 'Terjadi kesalahan pada server');
  }
  return json;
}

// READ - semua jadwal praktik
export const getJadwal = async () =>
  (await request(`${BASE_URL}/jadwal_praktik/index.php`)).data;

// DELETE
export const deleteJadwal = (id) =>
  request(`${BASE_URL}/jadwal_praktik/delete.php?id=${id}`, { method: 'POST' });
