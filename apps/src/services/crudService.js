import { BASE_URL } from '../config/api';

async function request(url, options) {
  let res;
  try {
    res = await fetch(url, options);
  } catch (e) {
    throw new Error(`Tidak dapat terhubung ke server (${BASE_URL}). Pastikan Apache XAMPP berjalan.`);
  }
  let json;
  try {
    json = await res.json();
  } catch (e) {
    throw new Error('Respons server bukan JSON. Periksa error PHP.');
  }
  if (!res.ok || json.status !== 'success') {
    throw new Error(json.message || 'Terjadi kesalahan pada server');
  }
  return json;
}

const toQuery = (obj = {}) =>
  Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');

const jsonOpts = (body) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

// Service CRUD generik untuk endpoint <resource>/{index,create,update,delete}.php
export function createCrudService(resource) {
  const url = (file, params) => {
    const qs = toQuery(params);
    return `${BASE_URL}/${resource}/${file}.php${qs ? `?${qs}` : ''}`;
  };
  return {
    // params opsional untuk filter di server, mis. { rekam_medis_id: 3 }
    list: async (params) => {
      const data = (await request(url('index', params))).data;
      return Array.isArray(data) ? data : [];
    },
    create: (body) => request(url('create'), jsonOpts(body)),
    // id lewat query string, data lewat JSON body
    update: (id, body) => request(url('update', { id }), jsonOpts({ id, ...body })),
    remove: (id) => request(url('delete', { id }), { method: 'POST' }),
  };
}

export async function getDashboard() {
  return (await request(`${BASE_URL}/dashboard/index.php`)).data;
}
