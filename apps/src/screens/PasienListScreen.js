import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getPasien, searchPasien, deletePasien } from '../services/pasienService';
import { showAlert, confirmDialog } from '../utils/dialog';

export default function PasienListScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      setData(await getPasien());
    } catch (e) {
      showAlert('Gagal memuat data pasien', e.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleSearch = async () => {
    if (keyword.trim() === '') return loadData();
    setLoading(true);
    try {
      const hasil = await searchPasien(keyword.trim());
      setData(Array.isArray(hasil) ? hasil : (hasil ? [hasil] : []));
    } catch (e) {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (item) => {
    confirmDialog('Hapus Pasien', `Yakin menghapus pasien "${item.nama}" (RM: ${item.no_rm})?`, async () => {
      try {
        await deletePasien(item.id);
        loadData();
      } catch (e) {
        showAlert('Gagal menghapus', e.message);
      }
    });
  };

  const renderItem = ({ item }) => (
    <View style={s.card}>
      <View style={{ flex: 1 }}>
        <View style={s.titleRow}>
          <Text style={s.title}>{item.nama}</Text>
          <View style={s.badge}>
            <Text style={s.badgeText}>{item.no_rm}</Text>
          </View>
        </View>
        <Text style={s.sub}>NIK: {item.nik}</Text>
        <Text style={s.detail}>
          {item.jenis_kelamin === 'L' ? '👨 Laki-laki' : '👩 Perempuan'} | Lahir: {item.tgl_lahir}
        </Text>
        {!!item.alamat && <Text style={s.address}>🏠 {item.alamat}</Text>}
      </View>
      <View style={s.btnCol}>
        <TouchableOpacity
          style={[s.btn, { backgroundColor: '#f59e0b' }]}
          onPress={() => navigation.navigate('PasienForm', { pasien: item })}>
          <Text style={s.btnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.btn, { backgroundColor: '#ef4444', marginTop: 6 }]}
          onPress={() => handleDelete(item)}>
          <Text style={s.btnText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.searchRow}>
        <TextInput
          style={s.input}
          placeholder="Cari Nomor RM..."
          value={keyword}
          onChangeText={setKeyword}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={[s.btnSearch, { backgroundColor: '#2563eb' }]} onPress={handleSearch}>
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
        ListEmptyComponent={!loading && <Text style={s.empty}>Data pasien tidak ditemukan</Text>}
      />

      <TouchableOpacity style={s.fab} onPress={() => navigation.navigate('PasienForm')}>
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
  btnSearch: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center' },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 14, borderRadius: 10, marginBottom: 10, elevation: 2,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  title: { fontSize: 16, fontWeight: 'bold', marginRight: 8 },
  badge: { backgroundColor: '#e0e7ff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgeText: { color: '#4338ca', fontSize: 11, fontWeight: 'bold' },
  sub: { color: '#4b5563', fontSize: 12, marginTop: 3 },
  detail: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  address: { color: '#6b7280', fontSize: 12, marginTop: 2, fontStyle: 'italic' },
  btnCol: { marginLeft: 8, justifyContent: 'center' },
  btn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  empty: { textAlign: 'center', marginTop: 30, color: '#6b7280' },
  fab: {
    position: 'absolute', right: 20, bottom: 24, width: 56, height: 56,
    borderRadius: 28, backgroundColor: '#16a34a', alignItems: 'center',
    justifyContent: 'center', elevation: 5,
  },
  fabText: { color: '#fff', fontSize: 28, marginTop: -2 },
});
