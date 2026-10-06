import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { createDokter, updateDokter } from '../services/dokterService';
import { showAlert } from '../utils/dialog';

export default function DokterFormScreen({ route, navigation }) {
  const dokter = route.params?.dokter;
  const isEdit = !!dokter;

  const [nama, setNama] = useState(dokter?.nama ?? '');
  const [spesialisasi, setSpesialisasi] = useState(dokter?.spesialisasi ?? '');
  const [noSip, setNoSip] = useState(dokter?.no_sip ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (nama.trim() === '') {
      setError('Nama dokter wajib diisi');
      return;
    }
    if (nama.trim().length < 3) {
      setError('Nama dokter minimal 3 karakter');
      return;
    }
    setError('');
    setSaving(true);
    try {
      const res = isEdit
        ? await updateDokter(dokter.id, nama.trim(), spesialisasi.trim(), noSip.trim())
        : await createDokter(nama.trim(), spesialisasi.trim(), noSip.trim());
      showAlert('Berhasil', res.message, () => navigation.goBack());
    } catch (e) {
      showAlert('Gagal menyimpan', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.label}>Nama Dokter *</Text>
      <TextInput
        style={[s.input, error && s.inputError]}
        placeholder="Contoh: dr. Budi Santoso, Sp.PD"
        value={nama}
        onChangeText={(text) => {
          setNama(text);
          if (error) setError('');
        }}
      />
      {!!error && <Text style={s.error}>{error}</Text>}

      <Text style={s.label}>Spesialisasi</Text>
      <TextInput
        style={s.input}
        placeholder="Contoh: Spesialis Penyakit Dalam"
        value={spesialisasi}
        onChangeText={setSpesialisasi}
      />

      <Text style={s.label}>Nomor SIP</Text>
      <TextInput
        style={s.input}
        placeholder="Contoh: SIP.445/001/IDI/2023"
        value={noSip}
        onChangeText={setNoSip}
      />

      <TouchableOpacity style={s.btn} onPress={handleSave} disabled={saving}>
        {saving
          ? <ActivityIndicator color="#fff" />
          : <Text style={s.btnText}>{isEdit ? 'Perbarui Data Dokter' : 'Simpan Data Dokter'}</Text>}
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  label: { fontWeight: '600', marginTop: 14, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10 },
  inputError: { borderColor: '#ef4444' },
  error: { color: '#ef4444', marginTop: 4 },
  btn: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, marginTop: 24, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
