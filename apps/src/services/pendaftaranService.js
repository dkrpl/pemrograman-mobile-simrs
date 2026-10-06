import { BASE_URL } from '../config/api';

async function request(url, options) {
  const res = await fetch(url, options);
  const json = await res.json();
  if (!res.ok || json.status !== 'success') {
    throw new Error(json.message || 'Terjadi kesalahan pada server');
  }
  return json;
}

// READ - semua pendaftaran
export const getPendaftaran = async () =>
  (await request(`${BASE_URL}/pendaftaran/index.php`)).data;

// CREATE pendaftaran baru
export const createPendaftaran = (data) =>
  request(`${BASE_URL}/pendaftaran/create.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

// DELETE
export const deletePendaftaran = (id) =>
  request(`${BASE_URL}/pendaftaran/delete.php?id=${id}`, { method: 'POST' });
