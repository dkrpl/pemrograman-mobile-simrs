import { createCrudService } from './crudService';

export const poliApi = createCrudService('poli');
export const dokterApi = createCrudService('dokter');
export const pasienApi = createCrudService('pasien');
export const jadwalApi = createCrudService('jadwal_praktik');
export const pendaftaranApi = createCrudService('pendaftaran');
export const rekamMedisApi = createCrudService('rekam_medis');
export const resepApi = createCrudService('resep_obat');
export const usersApi = createCrudService('users');
export const notifikasiApi = createCrudService('notifikasi');
