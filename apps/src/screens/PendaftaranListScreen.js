import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getPendaftaran, deletePendaftaran } from '../services/pendaftaranService';
import { showAlert, confirmDialog } from '../utils/dialog';

export default function PendaftaranListScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getPendaftaran();
      setData(Array.isArray(res) ? res : []);
    } catch (e) {
      showAlert('Gagal memuat antrean', e.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleDelete = (item) => {
    confirmDialog('Batalkan Pendaftaran', `Yakin membatalkan antrean nomor ${item.no_antrian} (${item.nama_pasien})?`, async () => {
      try {
        await deletePendaftaran(item.id);
        loadData();
      } catch (e) {
        showAlert('Gagal menghapus', e.message);
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'selesai': return { bg: '#dcfce7', text: '#15803d' };
      case 'dipanggil': return { bg: '#fef3c7', text: '#b45309' };
      case 'batal': return { bg: '#fee2e2', text: '#b91c1c' };
      default: return { bg: '#e0e7ff', text: '#4338ca' };
    }
  };

  const renderItem = ({ item }) => {
    const sc = getStatusColor(item.status);
    return (
      <View style={s.card}>
        <View style={s.queueBox}>
          <Text style={s.queueLabel}>Antrean</Text>
          <Text style={s.queueNum}>#{item.no_antrian}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.pasien}>{item.nama_pasien || 'Pasien #' + item.pasien_id}</Text>
          <Text style={s.sub}>🏥 {item.nama_poli || 'Poli'} | 👨‍⚕️ {item.nama_dokter || 'Dokter'}</Text>
          <Text style={s.date}>📅 {item.tanggal_kunjungan} • RM: {item.no_rm || '-'}</Text>
          <View style={[s.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[s.statusText, { color: sc.text }]}>
              {(item.status || 'menunggu').toUpperCase()}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[s.btn, { backgroundColor: '#ef4444' }]}
          onPress={() => handleDelete(item)}>
          <Text style={s.btnText}>Batal</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={s.container}>
      {loading && <ActivityIndicator size="large" color="#2563eb" />}

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={loadData}
        ListEmptyComponent={
          !loading && (
            <View style={{ alignItems: 'center', marginTop: 40, padding: 20 }}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>📋</Text>
              <Text style={s.empty}>Belum ada data pendaftaran antrean.</Text>
              <Text style={s.emptySub}>Tekan tombol ＋ di bawah untuk mendaftarkan pasien.</Text>
            </View>
          )
        }
      />

      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate('PendaftaranForm')}>
        <Text style={s.fabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#f3f4f6' },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 14, borderRadius: 10, marginBottom: 10, elevation: 2,
  },
  queueBox: {
    backgroundColor: '#eff6ff', paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center', minWidth: 65,
  },
  queueLabel: { fontSize: 10, color: '#3b82f6', fontWeight: 'bold' },
  queueNum: { fontSize: 20, color: '#1d4ed8', fontWeight: 'bold' },
  pasien: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  sub: { fontSize: 12, color: '#4b5563', marginTop: 3 },
  date: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  statusBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 4, marginTop: 5,
  },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  btn: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 6, marginLeft: 8 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  empty: { textAlign: 'center', color: '#374151', fontWeight: 'bold', fontSize: 15 },
  emptySub: { textAlign: 'center', color: '#6b7280', fontSize: 12, marginTop: 4 },
  fab: {
    position: 'absolute', right: 20, bottom: 24, width: 56, height: 56,
    borderRadius: 28, backgroundColor: '#16a34a', alignItems: 'center',
    justifyContent: 'center', elevation: 5,
  },
  fabText: { color: '#fff', fontSize: 28, marginTop: -2 },
});
