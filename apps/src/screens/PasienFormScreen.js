import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView,
} from 'react-native';
import { createPasien, updatePasien } from '../services/pasienService';
import { usersApi } from '../services/apis';
import { isDate } from '../utils/validators';
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
  const [userId, setUserId] = useState(pasien?.user_id ?? '');
  const [userOptions, setUserOptions] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Setiap pasien wajib terhubung ke 1 akun user ber-role pasien yang belum dipakai pasien lain
  useEffect(() => {
    usersApi.list({ role: 'pasien' })
      .then((users) => setUserOptions(users.filter((u) => !u.pasien_id || u.pasien_id === pasien?.id)))
      .catch((e) => {
        setUserOptions([]);
        showAlert('Gagal memuat akun user', e.message);
      });
  }, []);

  const handleSave = async () => {
    if (!userId) {
      setError('Pilih akun user untuk pasien ini');
      return;
    }
    if (nama.trim() === '') {
      setError('Nama pasien wajib diisi');
      return;
    }
    if (!/^\d{16}$/.test(nik.trim())) {
      setError('NIK harus 16 digit angka');
      return;
    }
    if (isDate('Tanggal lahir')(tglLahir.trim())) {
      setError(isDate('Tanggal lahir')(tglLahir.trim()));
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
        user_id: userId,
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
    <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
      <Text style={s.label}>Akun User Pasien *</Text>
      {userOptions === null ? (
        <ActivityIndicator color="#2563eb" style={{ alignSelf: 'flex-start' }} />
      ) : userOptions.length === 0 ? (
        <Text style={s.hint}>
          Belum ada akun user ber-role pasien yang tersedia. Buat dulu di menu Data User.
        </Text>
      ) : (
        <View style={s.chipRow}>
          {userOptions.map((u) => (
            <TouchableOpacity
              key={u.id}
              style={[s.chip, userId === u.id && s.radioActive]}
              onPress={() => { setUserId(u.id); setError(''); }}>
              <Text style={[s.radioText, userId === u.id && s.radioTextActive]}>{u.nama} ({u.email})</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

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
  hint: { color: '#6b7280', fontSize: 12 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 16,
    paddingVertical: 6, paddingHorizontal: 12, marginRight: 6, marginBottom: 6,
  },
  radioRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  radioBtn: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, alignItems: 'center' },
  radioActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  radioText: { color: '#4b5563', fontWeight: '500' },
  radioTextActive: { color: '#2563eb', fontWeight: 'bold' },
  btn: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, marginTop: 24, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
