import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import makeListScreen from '../components/makeListScreen';
import makeFormScreen from '../components/makeFormScreen';
import {
  poliApi, dokterApi, jadwalApi, pendaftaranApi, rekamMedisApi, resepApi,
  usersApi, notifikasiApi,
} from '../services/apis';
import { isEmail, isTime, minLength, nonNegativeInt, positiveInt } from '../utils/validators';
import { showAlert } from '../utils/dialog';

const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

// ---------- Pemuat pilihan untuk field select ----------
const poliOptions = async () =>
  (await poliApi.list()).map((p) => ({ value: p.id, label: p.nama_poli }));
const dokterOptions = async () =>
  (await dokterApi.list()).map((d) => ({ value: d.id, label: `${d.nama} (${d.spesialisasi || 'Umum'})` }));
const userOptions = async () =>
  (await usersApi.list()).map((u) => ({ value: u.id, label: `${u.nama} (${u.role})` }));
const rekamMedisOptions = async () =>
  (await rekamMedisApi.list()).map((r) => ({
    value: r.id, label: `#${r.id} ${r.nama_pasien || '-'} - ${r.diagnosa}`.slice(0, 60),
  }));

// Hanya pendaftaran yang belum punya rekam medis & tidak batal (kecuali milik data yang sedang diubah)
const pendaftaranOptions = async ({ item }) =>
  (await pendaftaranApi.list())
    .filter((p) => p.status !== 'batal' && (!p.rekam_medis_id || p.id === item?.pendaftaran_id))
    .map((p) => ({
      value: p.id,
      label: `${p.tanggal_kunjungan} #${p.no_antrian} ${p.nama_pasien} - ${p.nama_poli}`,
    }));

// ---------- JADWAL PRAKTIK ----------
export const JadwalList = makeListScreen({
  api: jadwalApi, formRoute: 'JadwalForm',
  titleOf: (j) => `${j.hari} - ${j.nama_poli}`,
  searchText: (j) => `${j.hari} ${j.nama_poli} ${j.nama_dokter}`,
  searchPlaceholder: 'Cari hari, poli, atau dokter...',
  emptyText: 'Belum ada jadwal praktik',
  renderBody: (j) => (
    <View>
      <View style={s.row}>
        <View style={[s.pill, { backgroundColor: '#dbeafe' }]}>
          <Text style={[s.pillText, { color: '#1d4ed8' }]}>{j.hari}</Text>
        </View>
        <Text style={s.title}>{j.nama_poli}</Text>
      </View>
      <Text style={s.line}>👨‍⚕️ {j.nama_dokter}</Text>
      <Text style={s.muted}>⏰ {j.jam_mulai} - {j.jam_selesai}   📍 {j.lokasi || '-'}</Text>
      <Text style={[s.muted, { color: '#059669', fontWeight: '600' }]}>
        👥 Kuota: {Number(j.kuota) > 0 ? `${j.kuota} pasien` : 'tidak dibatasi'}
      </Text>
    </View>
  ),
});
export const JadwalForm = makeFormScreen({
  api: jadwalApi,
  fields: [
    { name: 'dokter_id', label: 'Dokter', type: 'select', required: true, loadOptions: dokterOptions },
    { name: 'poli_id', label: 'Poliklinik', type: 'select', required: true, loadOptions: poliOptions },
    {
      name: 'hari', label: 'Hari Praktik', type: 'select', required: true,
      options: HARI.map((h) => ({ value: h, label: h })),
    },
    { name: 'jam_mulai', label: 'Jam Mulai', type: 'time', required: true, default: '08:00', validate: [isTime('Jam mulai')] },
    { name: 'jam_selesai', label: 'Jam Selesai', type: 'time', required: true, default: '12:00', validate: [isTime('Jam selesai')] },
    {
      name: 'kuota', label: 'Kuota Pasien', type: 'number', required: true, default: '20',
      validate: [nonNegativeInt('Kuota')], hint: 'Isi 0 bila kuota tidak dibatasi',
    },
  ],
});

// ---------- PENDAFTARAN & ANTREAN ----------
const STATUS_STYLE = {
  menunggu: { bg: '#e0e7ff', color: '#4338ca' },
  dipanggil: { bg: '#fef3c7', color: '#b45309' },
  selesai: { bg: '#dcfce7', color: '#15803d' },
  batal: { bg: '#fee2e2', color: '#b91c1c' },
};
// Alur status: menunggu -> dipanggil -> selesai, atau batal
const NEXT_STATUS = {
  menunggu: [{ status: 'dipanggil', label: 'Panggil', color: '#2563eb' }, { status: 'batal', label: 'Batalkan', color: '#6b7280' }],
  dipanggil: [{ status: 'selesai', label: 'Selesai', color: '#16a34a' }, { status: 'batal', label: 'Batalkan', color: '#6b7280' }],
  selesai: [],
  batal: [{ status: 'menunggu', label: 'Aktifkan', color: '#2563eb' }],
};

export const PendaftaranList = makeListScreen({
  api: pendaftaranApi, formRoute: 'PendaftaranForm',
  titleOf: (p) => `Antrean #${p.no_antrian} ${p.nama_pasien}`,
  searchText: (p) => `${p.nama_pasien} ${p.no_rm} ${p.nama_poli} ${p.nama_dokter} ${p.tanggal_kunjungan} ${p.status}`,
  searchPlaceholder: 'Cari pasien, RM, poli, tanggal, status...',
  emptyText: 'Belum ada pendaftaran. Tekan ＋ untuk mendaftarkan pasien.',
  renderBody: (p) => {
    const st = STATUS_STYLE[p.status] || STATUS_STYLE.menunggu;
    return (
      <View style={s.row}>
        <View style={s.queueBox}>
          <Text style={s.queueLabel}>Antrean</Text>
          <Text style={s.queueNum}>#{p.no_antrian}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.title}>{p.nama_pasien || `Pasien #${p.pasien_id}`}</Text>
          <Text style={s.line}>🏥 {p.nama_poli || '-'} | 👨‍⚕️ {p.nama_dokter || '-'}</Text>
          <Text style={s.muted}>📅 {p.tanggal_kunjungan} • RM: {p.no_rm || '-'}</Text>
          <View style={s.row}>
            <View style={[s.pill, { backgroundColor: st.bg, marginTop: 5 }]}>
              <Text style={[s.pillText, { color: st.color }]}>{(p.status || 'menunggu').toUpperCase()}</Text>
            </View>
            {!!p.rekam_medis_id && (
              <View style={[s.pill, { backgroundColor: '#ede9fe', marginTop: 5 }]}>
                <Text style={[s.pillText, { color: '#6d28d9' }]}>SUDAH DIPERIKSA</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  },
  actions: (item, { reload, navigation }) => [
    ...(NEXT_STATUS[item.status] || []).map((n) => ({
      label: n.label, color: n.color,
      onPress: async () => {
        try {
          await pendaftaranApi.update(item.id, { status: n.status });
          reload();
        } catch (e) {
          showAlert('Gagal ubah status', e.message);
        }
      },
    })),
    item.rekam_medis_id
      ? {
        label: 'Resep', color: '#7c3aed',
        onPress: () => navigation.navigate('ResepList', {
          rekam_medis_id: item.rekam_medis_id, title: `Resep - ${item.nama_pasien}`,
        }),
      }
      : item.status !== 'batal' && {
        label: 'Periksa', color: '#7c3aed',
        onPress: () => navigation.navigate('RekamMedisForm', {
          defaults: { pendaftaran_id: String(item.id), dokter_id: String(item.dokter_id ?? '') },
        }),
      },
  ].filter(Boolean),
});

// ---------- REKAM MEDIS ----------
export const RekamMedisList = makeListScreen({
  api: rekamMedisApi, formRoute: 'RekamMedisForm',
  titleOf: (r) => `${r.nama_pasien || 'Pasien'} (${r.no_rm || '-'})`,
  searchText: (r) => `${r.nama_pasien} ${r.no_rm} ${r.diagnosa} ${r.nama_dokter}`,
  searchPlaceholder: 'Cari pasien, RM, diagnosa, dokter...',
  emptyText: 'Belum ada rekam medis. Periksa pasien dari menu Pendaftaran.',
  renderBody: (r) => (
    <View>
      <Text style={s.title}>{r.nama_pasien || 'Pasien'} <Text style={s.muted}>({r.no_rm || '-'})</Text></Text>
      <Text style={s.line}>🩺 {r.diagnosa}</Text>
      {!!r.catatan && <Text style={s.muted}>📝 {r.catatan}</Text>}
      <Text style={s.muted}>👨‍⚕️ {r.nama_dokter} • 📅 {String(r.tanggal).slice(0, 16)}</Text>
    </View>
  ),
  actions: (item, { navigation }) => [{
    label: 'Resep', color: '#7c3aed',
    onPress: () => navigation.navigate('ResepList', {
      rekam_medis_id: item.id, title: `Resep - ${item.nama_pasien || 'Pasien'}`,
    }),
  }],
});
export const RekamMedisForm = makeFormScreen({
  api: rekamMedisApi,
  fields: [
    {
      name: 'pendaftaran_id', label: 'Pendaftaran (Antrean)', type: 'select', required: true,
      loadOptions: pendaftaranOptions, hint: 'Antrean otomatis ditandai selesai setelah rekam medis disimpan',
    },
    { name: 'dokter_id', label: 'Dokter Pemeriksa', type: 'select', required: true, loadOptions: dokterOptions },
    { name: 'diagnosa', label: 'Diagnosa', type: 'multiline', required: true },
    { name: 'catatan', label: 'Catatan / Anjuran', type: 'multiline' },
  ],
});

// ---------- RESEP OBAT ----------
// Dibuka dari Rekam Medis (terfilter) atau dari menu utama (semua resep)
export const ResepList = makeListScreen({
  api: resepApi, formRoute: 'ResepForm', filterBy: 'rekam_medis_id',
  titleOf: (r) => r.nama_obat,
  badgeOf: (r) => ({ label: `x${r.jumlah}`, bg: '#ede9fe', color: '#6d28d9' }),
  subOf: (r) => `💊 ${r.dosis || 'Dosis belum diisi'}\n👤 ${r.nama_pasien || '-'} • ${r.diagnosa || '-'}`,
  searchText: (r) => `${r.nama_obat} ${r.nama_pasien} ${r.diagnosa}`,
  searchPlaceholder: 'Cari obat atau pasien...',
  emptyText: 'Belum ada resep obat',
});
export const ResepForm = makeFormScreen({
  api: resepApi,
  fields: [
    { name: 'rekam_medis_id', label: 'Rekam Medis', type: 'select', required: true, loadOptions: rekamMedisOptions },
    { name: 'nama_obat', label: 'Nama Obat', required: true, maxLength: 150, placeholder: 'Contoh: Paracetamol 500mg' },
    { name: 'dosis', label: 'Dosis / Aturan Pakai', maxLength: 100, placeholder: 'Contoh: 3 x 1 sesudah makan' },
    { name: 'jumlah', label: 'Jumlah', type: 'number', required: true, default: '1', validate: [positiveInt('Jumlah')] },
  ],
});

// ---------- USERS ----------
const ROLE_STYLE = {
  admin: { bg: '#fee2e2', color: '#b91c1c' },
  dokter: { bg: '#dbeafe', color: '#1d4ed8' },
  pasien: { bg: '#dcfce7', color: '#15803d' },
};
export const UsersList = makeListScreen({
  api: usersApi, formRoute: 'UsersForm',
  titleOf: (u) => u.nama,
  badgeOf: (u) => ({ label: u.role.toUpperCase(), ...ROLE_STYLE[u.role] }),
  subOf: (u) => `✉️ ${u.email}${u.pasien_id ? '\n🔗 Terhubung dengan data pasien' : ''}`,
  searchText: (u) => `${u.nama} ${u.email} ${u.role}`,
  searchPlaceholder: 'Cari nama, email, atau role...',
});
export const UsersForm = makeFormScreen({
  api: usersApi,
  fields: [
    { name: 'nama', label: 'Nama Lengkap', required: true, maxLength: 100 },
    { name: 'email', label: 'E-mail', type: 'email', required: true, maxLength: 150, validate: [isEmail('E-mail')] },
    {
      name: 'password', label: 'Password', type: 'password', requiredOnCreate: true,
      validate: [minLength('Password', 6)], hintOnEdit: 'Kosongkan bila password tidak diubah',
    },
    {
      name: 'role', label: 'Role', type: 'select', required: true, default: 'pasien',
      options: [
        { value: 'pasien', label: 'Pasien' },
        { value: 'dokter', label: 'Dokter' },
        { value: 'admin', label: 'Admin' },
      ],
    },
  ],
});

// ---------- NOTIFIKASI ----------
export const NotifikasiList = makeListScreen({
  api: notifikasiApi, formRoute: 'NotifikasiForm',
  titleOf: (n) => n.judul,
  badgeOf: (n) => (Number(n.status_baca)
    ? { label: 'DIBACA', bg: '#f3f4f6', color: '#6b7280' }
    : { label: 'BARU', bg: '#fef3c7', color: '#b45309' }),
  subOf: (n) => `${n.pesan}\n👤 Untuk: ${n.nama_user || `User #${n.user_id}`}`,
  searchText: (n) => `${n.judul} ${n.pesan} ${n.nama_user}`,
  searchPlaceholder: 'Cari judul, pesan, atau penerima...',
  emptyText: 'Belum ada notifikasi',
  actions: (item, { reload }) => [{
    label: Number(item.status_baca) ? 'Tandai Belum Dibaca' : 'Tandai Dibaca',
    color: '#0891b2',
    onPress: async () => {
      try {
        await notifikasiApi.update(item.id, { status_baca: Number(item.status_baca) ? 0 : 1 });
        reload();
      } catch (e) {
        showAlert('Gagal memperbarui', e.message);
      }
    },
  }],
});
export const NotifikasiForm = makeFormScreen({
  api: notifikasiApi,
  fields: [
    { name: 'user_id', label: 'Penerima', type: 'select', required: true, loadOptions: userOptions },
    { name: 'judul', label: 'Judul', required: true, maxLength: 150 },
    { name: 'pesan', label: 'Pesan', type: 'multiline', required: true },
    {
      name: 'status_baca', label: 'Status', type: 'select', default: '0',
      options: [{ value: '0', label: 'Belum dibaca' }, { value: '1', label: 'Sudah dibaca' }],
    },
  ],
});

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  title: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  line: { color: '#374151', marginTop: 4 },
  muted: { color: '#6b7280', fontSize: 12, marginTop: 3, fontWeight: 'normal' },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginRight: 8 },
  pillText: { fontWeight: 'bold', fontSize: 11 },
  queueBox: {
    backgroundColor: '#eff6ff', paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center', minWidth: 65,
  },
  queueLabel: { fontSize: 10, color: '#3b82f6', fontWeight: 'bold' },
  queueNum: { fontSize: 20, color: '#1d4ed8', fontWeight: 'bold' },
});
