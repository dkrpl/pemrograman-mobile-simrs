import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDokter, searchDokter, deleteDokter } from '../services/dokterService';
import { showAlert, confirmDialog } from '../utils/dialog';

export default function DokterListScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      setData(await getDokter());
    } catch (e) {
      showAlert('Gagal memuat data dokter', e.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleSearch = async () => {
    if (keyword.trim() === '') return loadData();
    setLoading(true);
    try {
      const hasil = await searchDokter(keyword.trim());
      setData(Array.isArray(hasil) ? hasil : (hasil ? [hasil] : []));
    } catch (e) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (item) => {
    confirmDialog('Hapus Dokter', `Yakin menghapus data dokter "${item.nama}"?`, async () => {
      try {
        await deleteDokter(item.id);
        loadData();
      } catch (e) {
        showAlert('Gagal menghapus', e.message);
      }
    });
  };

  const renderItem = ({ item }) => (
    <View style={s.card}>
      <View style={{ flex: 1 }}>
        <Text style={s.title}>{item.nama}</Text>
        <Text style={s.sub}>🩺 {item.spesialisasi || 'Dokter Umum'}</Text>
        <Text style={s.sip}>📜 SIP: {item.no_sip || '-'}</Text>
      </View>
      <TouchableOpacity
        style={[s.btn, { backgroundColor: '#f59e0b' }]}
        onPress={() => navigation.navigate('DokterForm', { dokter: item })}>
        <Text style={s.btnText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[s.btn, { backgroundColor: '#ef4444' }]}
        onPress={() => handleDelete(item)}>
        <Text style={s.btnText}>Hapus</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.searchRow}>
        <TextInput
          style={s.input}
          placeholder="Cari nama dokter..."
          value={keyword}
          onChangeText={setKeyword}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={[s.btn, { backgroundColor: '#2563eb' }]} onPress={handleSearch}>
          <Text style={s.btnText}>Cari</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#2563eb" />}

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={loadData}
        ListEmptyComponent={!loading && <Text style={s.empty}>Data dokter tidak ditemukan</Text>}
      />

      <TouchableOpacity style={s.fab} onPress={() => navigation.navigate('DokterForm')}>
        <Text style={s.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#f3f4f6' },
  searchRow: { flexDirection: 'row', marginBottom: 10 },
  input: {
    flex: 1, backgroundColor: '#fff', borderRadius: 8,
    paddingHorizontal: 12, marginRight: 8, borderWidth: 1, borderColor: '#d1d5db',
  },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 14, borderRadius: 10, marginBottom: 10, elevation: 2,
  },
  title: { fontSize: 16, fontWeight: 'bold' },
  sub: { color: '#2563eb', marginTop: 3, fontWeight: '500' },
  sip: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  btn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginLeft: 6 },
  btnText: { color: '#fff', fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 30, color: '#6b7280' },
  fab: {
    position: 'absolute', right: 20, bottom: 24, width: 56, height: 56,
    borderRadius: 28, backgroundColor: '#16a34a', alignItems: 'center',
    justifyContent: 'center', elevation: 5,
  },
  fabText: { color: '#fff', fontSize: 28, marginTop: -2 },
});
