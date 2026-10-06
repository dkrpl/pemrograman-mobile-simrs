import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { createPendaftaran } from '../services/pendaftaranService';
import { getPasien } from '../services/pasienService';
import { getJadwal } from '../services/jadwalService';
import { showAlert } from '../utils/dialog';

export default function PendaftaranFormScreen({ navigation }) {
  const [pasienList, setPasienList] = useState([]);
  const [jadwalList, setJadwalList] = useState([]);
  const [selectedPasienId, setSelectedPasienId] = useState('');
  const [selectedJadwalId, setSelectedJadwalId] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOptions() {
      try {
        const [pasiens, jadwals] = await Promise.all([
          getPasien().catch(() => []),
          getJadwal().catch(() => []),
        ]);
        setPasienList(Array.isArray(pasiens) ? pasiens : []);
        setJadwalList(Array.isArray(jadwals) ? jadwals : []);
        if (pasiens.length > 0) setSelectedPasienId(pasiens[0].id);
        if (jadwals.length > 0) setSelectedJadwalId(jadwals[0].id);
      } catch (e) {
        setError('Gagal memuat opsi pasien dan jadwal');
      } finally {
        setLoading(false);
      }
    }
    loadOptions();
  }, []);

  const handleSave = async () => {
    if (!selectedPasienId) {
      setError('Silakan pilih pasien');
      return;
    }
    if (!selectedJadwalId) {
      setError('Silakan pilih jadwal praktik dokter');
      return;
    }
    if (!tanggal) {
      setError('Tanggal kunjungan wajib diisi');
      return;
    }

    setError('');
    setSaving(true);
    try {
      const res = await createPendaftaran({
        pasien_id: selectedPasienId,
        jadwal_id: selectedJadwalId,
        tanggal_kunjungan: tanggal,
        status: 'menunggu',
      });
      showAlert('Berhasil', res.message || 'Antrean berhasil didaftarkan!', () => navigation.goBack());
    } catch (e) {
      showAlert('Gagal Mendaftar', e.message);
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

  return (
    <ScrollView style={s.container}>
      <Text style={s.sectionHeader}>1. Pilih Pasien *</Text>
      {pasienList.length === 0 ? (
        <Text style={s.warnText}>⚠️ Belum ada data pasien. Silakan buat data pasien terlebih dahulu.</Text>
      ) : (
        pasienList.map((p) => (
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
        ))
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
              <Text style={s.optionTime}>🗓️ {j.hari} ({j.jam_mulai} - {j.jam_selesai})</Text>
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
        value={tanggal}
        onChangeText={setTanggal}
      />

      {!!error && <Text style={s.error}>{error}</Text>}

      <TouchableOpacity
        style={s.btn}
        onPress={handleSave}
        disabled={saving || pasienList.length === 0 || jadwalList.length === 0}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={s.btnText}>Daftarkan Antrean Pasien</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
  sectionHeader: { fontSize: 14, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  warnText: { color: '#d97706', fontSize: 12, marginBottom: 10, fontStyle: 'italic' },
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
  error: { color: '#ef4444', marginTop: 8, fontWeight: '500' },
  btn: {
    backgroundColor: '#2563eb', padding: 14, borderRadius: 8,
    marginTop: 24, alignItems: 'center', elevation: 2,
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
