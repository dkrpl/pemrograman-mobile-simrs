// Setiap validator menerima nilai (string) dan mengembalikan pesan error, atau '' bila valid.

export const required = (label) => (v) =>
  String(v ?? '').trim() === '' ? `${label} wajib diisi` : '';

export const minLength = (label, n) => (v) =>
  String(v).length >= n ? '' : `${label} minimal ${n} karakter`;

export const exactDigits = (label, n) => (v) =>
  /^\d+$/.test(v) && v.length === n ? '' : `${label} harus ${n} digit angka`;

export const positiveInt = (label) => (v) =>
  /^\d+$/.test(String(v)) && Number(v) > 0 ? '' : `${label} harus bilangan bulat lebih dari 0`;

export const nonNegativeInt = (label) => (v) =>
  /^\d+$/.test(String(v)) ? '' : `${label} harus bilangan bulat 0 atau lebih`;

export const isEmail = (label) => (v) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : `${label} tidak valid`;

export const isDate = (label) => (v) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return `${label} berformat YYYY-MM-DD`;
  const d = new Date(v);
  return isNaN(d) || d.toISOString().slice(0, 10) !== v ? `${label} bukan tanggal yang valid` : '';
};

export const isTime = (label) => (v) =>
  /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? '' : `${label} berformat HH:MM (mis. 08:00)`;

// Tanggal hari ini dalam format YYYY-MM-DD (zona waktu lokal perangkat)
export const today = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
