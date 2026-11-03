import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { pasienApi, jadwalApi, pendaftaranApi } from '../services/apis';
import { isDate, positiveInt, today } from '../utils/validators';
import { showAlert } from '../utils/dialog';

const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const STATUS = ['menunggu', 'dipanggil', 'selesai', 'batal'];

const hariDari = (tgl) => (isDate('')(tgl) ? null : HARI[new Date(`${tgl}T00:00:00`).getDay()]);

export default function PendaftaranFormScreen({ route, navigation }) {
  const item = route.params?.item; // ada = mode ubah
  const isEdit = !!item;

  const [pasienList, setPasienList] = useState([]);
  const [jadwalList, setJadwalList] = useState([]);
  const [selectedPasienId, setSelectedPasienId] = useState(item?.pasien_id ?? '');
  const [selectedJadwalId, setSelectedJadwalId] = useState(item?.jadwal_id ?? '');
  const [tanggal, setTanggal] = useState(item?.tanggal_kunjungan ?? today());
  const [noAntrian, setNoAntrian] = useState(String(item?.no_antrian ?? ''));
  const [status, setStatus] = useState(item?.status ?? 'menunggu');
  const [cariPasien, setCariPasien] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOptions() {
      try {
        const [pasiens, jadwals] = await Promise.all([pasienApi.list(), jadwalApi.list()]);
        setPasienList(pasiens);
        setJadwalList(jadwals);
        if (!isEdit) {
          if (pasiens.length > 0) setSelectedPasienId(pasiens[0].id);
          if (jadwals.length > 0) setSelectedJadwalId(jadwals[0].id);
        }
      } catch (e) {
        setError(`Gagal memuat data pasien & jadwal: ${e.message}`);
      } finally {
        setLoading(false);
      }
    }
    loadOptions();
  }, []);

  const handleSave = async () => {
    if (!selectedPasienId) return setError('Silakan pilih pasien');
    if (!selectedJadwalId) return setError('Silakan pilih jadwal praktik dokter');
    const errTanggal = isDate('Tanggal kunjungan')(tanggal.trim());
    if (errTanggal) return setError(errTanggal);
    if (isEdit) {
      const errAntri = positiveInt('No. antrean')(noAntrian.trim());
      if (errAntri) return setError(errAntri);
    }

    setError('');
    setSaving(true);
    try {
      const body = {
        pasien_id: selectedPasienId,
        jadwal_id: selectedJadwalId,
        tanggal_kunjungan: tanggal.trim(),
        status,
      };
      const res = isEdit
        ? await pendaftaranApi.update(item.id, { ...body, no_antrian: noAntrian.trim() })
        : await pendaftaranApi.create(body); // no. antrean dihitung otomatis oleh server
      showAlert('Berhasil', res.message, () => navigation.goBack());
    } catch (e) {
      showAlert('Gagal Menyimpan', e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10, color: '#6b7280' }}>Memuat data formulir...</Text>
      </View>
    );
  }

  const kw = cariPasien.trim().toLowerCase();
  const pasienTampil = kw
    ? pasienList.filter((p) => p.id === selectedPasienId || `${p.nama} ${p.no_rm} ${p.nik}`.toLowerCase().includes(kw))
    : pasienList;
  const jadwalTerpilih = jadwalList.find((j) => j.id === selectedJadwalId);
  const hariTanggal = hariDari(tanggal.trim());
  const hariBeda = jadwalTerpilih && hariTanggal && jadwalTerpilih.hari !== hariTanggal;

  return (
    <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
      <Text style={s.sectionHeader}>1. Pilih Pasien *</Text>
      {pasienList.length === 0 ? (
        <Text style={s.warnText}>⚠️ Belum ada data pasien. Silakan buat data pasien terlebih dahulu.</Text>
      ) : (
        <>
          {pasienList.length > 5 && (
            <TextInput
              style={[s.input, { marginBottom: 8 }]}
              placeholder="Cari nama, No. RM, atau NIK..."
              value={cariPasien}
              onChangeText={setCariPasien}
            />
          )}
          {pasienTampil.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[s.optionCard, selectedPasienId === p.id && s.optionCardActive]}
              onPress={() => setSelectedPasienId(p.id)}>
              <View style={{ flex: 1 }}>
                <Text style={[s.optionTitle, selectedPasienId === p.id && s.optionTextActive]}>
                  {p.nama}
                </Text>
                <Text style={s.optionSub}>RM: {p.no_rm} | NIK: {p.nik}</Text>
              </View>
              <View style={[s.radioCircle, selectedPasienId === p.id && s.radioCircleActive]}>
                {selectedPasienId === p.id && <View style={s.radioDot} />}
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}

      <Text style={[s.sectionHeader, { marginTop: 18 }]}>2. Pilih Poliklinik & Dokter *</Text>
      {jadwalList.length === 0 ? (
        <Text style={s.warnText}>⚠️ Belum ada jadwal praktik dokter yang tersedia.</Text>
      ) : (
        jadwalList.map((j) => (
          <TouchableOpacity
            key={j.id}
            style={[s.optionCard, selectedJadwalId === j.id && s.optionCardActive]}
            onPress={() => setSelectedJadwalId(j.id)}>
            <View style={{ flex: 1 }}>
              <Text style={[s.optionTitle, selectedJadwalId === j.id && s.optionTextActive]}>
                {j.nama_poli}
              </Text>
              <Text style={s.optionSub}>👨‍⚕️ {j.nama_dokter}</Text>
              <Text style={s.optionTime}>
                🗓️ {j.hari} ({j.jam_mulai} - {j.jam_selesai}) • Kuota {Number(j.kuota) > 0 ? j.kuota : '∞'}
              </Text>
            </View>
            <View style={[s.radioCircle, selectedJadwalId === j.id && s.radioCircleActive]}>
              {selectedJadwalId === j.id && <View style={s.radioDot} />}
            </View>
          </TouchableOpacity>
        ))
      )}

      <Text style={[s.sectionHeader, { marginTop: 18 }]}>3. Tanggal Kunjungan (YYYY-MM-DD) *</Text>
      <TextInput
        style={s.input}
        placeholder="YYYY-MM-DD"
        maxLength={10}
        value={tanggal}
        onChangeText={setTanggal}
      />
      {hariBeda && (
        <Text style={s.warnText}>
          ⚠️ Tanggal tersebut hari {hariTanggal}, sedangkan jadwal dokter hari {jadwalTerpilih.hari}.
        </Text>
      )}

      {isEdit && (
        <>
          <Text style={[s.sectionHeader, { marginTop: 18 }]}>4. No. Antrean *</Text>
          <TextInput
            style={s.input}
            keyboardType="numeric"
            value={noAntrian}
            onChangeText={setNoAntrian}
          />

          <Text style={[s.sectionHeader, { marginTop: 18 }]}>5. Status Antrean</Text>
          <View style={s.chipRow}>
            {STATUS.map((st) => (
              <TouchableOpacity
                key={st}
                style={[s.chip, status === st && s.chipActive]}
                onPress={() => setStatus(st)}>
                <Text style={status === st ? s.chipTextActive : s.chipText}>{st}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {!!error && <Text style={s.error}>{error}</Text>}

      <TouchableOpacity
        style={[s.btn, saving && { opacity: 0.7 }]}
        onPress={handleSave}
        disabled={saving || pasienList.length === 0 || jadwalList.length === 0}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={s.btnText}>{isEdit ? 'Perbarui Pendaftaran' : 'Daftarkan Antrean Pasien'}</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  sectionHeader: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  warnText: { color: '#d97706', fontSize: 12, marginTop: 6, marginBottom: 6, fontStyle: 'italic' },
  optionCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 12, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#e2e8f0',
  },
  optionCardActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  optionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
  optionTextActive: { color: '#1d4ed8' },
  optionSub: { fontSize: 12, color: '#4b5563', marginTop: 2 },
  optionTime: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  radioCircle: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center', marginLeft: 8,
  },
  radioCircleActive: { borderColor: '#2563eb' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2563eb' },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db',
    borderRadius: 8, padding: 12, fontSize: 15,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 16, backgroundColor: '#fff',
    paddingVertical: 6, paddingHorizontal: 12, marginRight: 6, marginBottom: 6,
  },
  chipActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  chipText: { color: '#111827' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  error: { color: '#ef4444', marginTop: 8, fontWeight: '500' },
  btn: {
    backgroundColor: '#2563eb', padding: 14, borderRadius: 8,
    marginTop: 24, alignItems: 'center', elevation: 2,
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
