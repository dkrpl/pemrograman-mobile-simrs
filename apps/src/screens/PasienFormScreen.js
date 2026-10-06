import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView,
} from 'react-native';
import { createPasien, updatePasien } from '../services/pasienService';
import { showAlert } from '../utils/dialog';

export default function PasienFormScreen({ route, navigation }) {
  const pasien = route.params?.pasien;
  const isEdit = !!pasien;

  const [nama, setNama] = useState(pasien?.nama ?? '');
  const [nik, setNik] = useState(pasien?.nik ?? '');
  const [noRm, setNoRm] = useState(pasien?.no_rm ?? '');
  const [tglLahir, setTglLahir] = useState(pasien?.tgl_lahir ?? '2000-01-01');
  const [jenisKelamin, setJenisKelamin] = useState(pasien?.jenis_kelamin ?? 'L');
  const [alamat, setAlamat] = useState(pasien?.alamat ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (nama.trim() === '') {
      setError('Nama pasien wajib diisi');
      return;
    }
    if (nik.trim().length !== 16) {
      setError('NIK harus 16 digit');
      return;
    }
    if (noRm.trim() === '') {
      setError('Nomor RM wajib diisi');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const payload = {
        id: pasien?.id,
        user_id: pasien?.user_id || 1,
        nama: nama.trim(),
        nik: nik.trim(),
        no_rm: noRm.trim(),
        tgl_lahir: tglLahir.trim(),
        jenis_kelamin: jenisKelamin,
        alamat: alamat.trim(),
      };
      const res = isEdit
        ? await updatePasien(payload)
        : await createPasien(payload);
      showAlert('Berhasil', res.message, () => navigation.goBack());
    } catch (e) {
      showAlert('Gagal menyimpan', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={s.container}>
      <Text style={s.label}>Nama Pasien *</Text>
      <TextInput
        style={[s.input, error && s.inputError]}
        placeholder="Nama Lengkap Pasien"
        value={nama}
        onChangeText={(t) => { setNama(t); setError(''); }}
      />
      {!!error && <Text style={s.error}>{error}</Text>}

      <Text style={s.label}>Nomor RM *</Text>
      <TextInput
        style={s.input}
        placeholder="Contoh: RM-2026-0002"
        value={noRm}
        onChangeText={setNoRm}
      />

      <Text style={s.label}>NIK (16 Digit) *</Text>
      <TextInput
        style={s.input}
        placeholder="351508xxxxxxxxxx"
        keyboardType="numeric"
        maxLength={16}
        value={nik}
        onChangeText={setNik}
      />

      <Text style={s.label}>Tanggal Lahir (YYYY-MM-DD)</Text>
      <TextInput
        style={s.input}
        placeholder="Contoh: 1998-05-20"
        value={tglLahir}
        onChangeText={setTglLahir}
      />

      <Text style={s.label}>Jenis Kelamin</Text>
      <View style={s.radioRow}>
        <TouchableOpacity
          style={[s.radioBtn, jenisKelamin === 'L' && s.radioActive]}
          onPress={() => setJenisKelamin('L')}>
          <Text style={[s.radioText, jenisKelamin === 'L' && s.radioTextActive]}>👨 Laki-laki</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.radioBtn, jenisKelamin === 'P' && s.radioActive]}
          onPress={() => setJenisKelamin('P')}>
          <Text style={[s.radioText, jenisKelamin === 'P' && s.radioTextActive]}>👩 Perempuan</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.label}>Alamat Lengkap</Text>
      <TextInput
        style={[s.input, { height: 70 }]}
        placeholder="Alamat domisili pasien"
        multiline
        value={alamat}
        onChangeText={setAlamat}
      />

      <TouchableOpacity style={s.btn} onPress={handleSave} disabled={saving}>
        {saving
          ? <ActivityIndicator color="#fff" />
          : <Text style={s.btnText}>{isEdit ? 'Perbarui Data Pasien' : 'Simpan Data Pasien'}</Text>}
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  label: { fontWeight: '600', marginTop: 12, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, backgroundColor: '#f9fafb' },
  inputError: { borderColor: '#ef4444' },
  error: { color: '#ef4444', marginTop: 4 },
  radioRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  radioBtn: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, alignItems: 'center' },
  radioActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  radioText: { color: '#4b5563', fontWeight: '500' },
  radioTextActive: { color: '#2563eb', fontWeight: 'bold' },
  btn: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, marginTop: 24, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
