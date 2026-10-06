import React, { useCallback, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getJadwal, deleteJadwal } from '../services/jadwalService';
import { showAlert, confirmDialog } from '../utils/dialog';

export default function JadwalListScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      setData(await getJadwal());
    } catch (e) {
      showAlert('Gagal memuat jadwal', e.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { loadData(); }, []));

  const handleDelete = (item) => {
    confirmDialog('Hapus Jadwal', `Yakin menghapus jadwal hari ${item.hari} untuk ${item.nama_dokter}?`, async () => {
      try {
        await deleteJadwal(item.id);
        loadData();
      } catch (e) {
        showAlert('Gagal menghapus', e.message);
      }
    });
  };

  const renderItem = ({ item }) => (
    <View style={s.card}>
      <View style={{ flex: 1 }}>
        <View style={s.headerRow}>
          <View style={s.dayBadge}>
            <Text style={s.dayText}>{item.hari}</Text>
          </View>
          <Text style={s.poli}>{item.nama_poli}</Text>
        </View>
        <Text style={s.dokter}>👨‍⚕️ {item.nama_dokter}</Text>
        <Text style={s.time}>⏰ {item.jam_mulai} - {item.jam_selesai}</Text>
        <Text style={s.kuota}>👥 Kuota: {item.kuota ?? '-'} pasien</Text>
      </View>
      <TouchableOpacity
        style={[s.btn, { backgroundColor: '#ef4444' }]}
        onPress={() => handleDelete(item)}>
        <Text style={s.btnText}>Hapus</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={s.container}>
      {loading && <ActivityIndicator size="large" color="#2563eb" />}

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={loadData}
        ListEmptyComponent={!loading && <Text style={s.empty}>Belum ada jadwal praktik</Text>}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#f3f4f6' },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 14, borderRadius: 10, marginBottom: 10, elevation: 2,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  dayBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginRight: 8 },
  dayText: { color: '#1d4ed8', fontWeight: 'bold', fontSize: 12 },
  poli: { fontSize: 15, fontWeight: 'bold', color: '#111827' },
  dokter: { color: '#374151', fontSize: 14, marginTop: 2, fontWeight: '500' },
  time: { color: '#6b7280', fontSize: 13, marginTop: 3 },
  kuota: { color: '#059669', fontSize: 12, marginTop: 2, fontWeight: '600' },
  btn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginLeft: 8 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 12 },
  empty: { textAlign: 'center', marginTop: 30, color: '#6b7280' },
});
