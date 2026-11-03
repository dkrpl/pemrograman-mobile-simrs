import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { showAlert, confirmDialog } from '../utils/dialog';

/**
 * Membuat layar daftar (list) generik.
 *
 * Opsi:
 *  - api          : service dari createCrudService (list/remove)
 *  - formRoute    : nama route form tambah/ubah
 *  - titleOf/subOf: teks judul & keterangan tiap kartu
 *  - renderBody   : (item) => elemen kustom, menggantikan titleOf/subOf
 *  - badgeOf      : (item) => { label, color, bg } badge kecil di samping judul
 *  - searchText   : (item) => string yang dicari; mengaktifkan kotak pencarian
 *  - filterBy     : nama parameter route yang dipakai memfilter data di server
 *                   (mis. 'rekam_medis_id'); nilainya juga diisikan ke form tambah
 *  - actions      : (item, { reload, navigation }) => [{ label, color, onPress }]
 *  - canEdit      : (item) => boolean, default true
 *  - emptyText    : teks saat data kosong
 */
export default function makeListScreen({
  api, formRoute, titleOf, subOf, renderBody, badgeOf, searchText,
  searchPlaceholder = 'Cari...', filterBy, actions, canEdit, emptyText = 'Belum ada data',
}) {
  return function ListScreen({ navigation, route }) {
    const filterValue = filterBy ? route.params?.[filterBy] : undefined;
    const defaults = filterValue !== undefined ? { [filterBy]: String(filterValue) } : undefined;
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState('');

    // Judul layar bisa dioper lewat params, mis. "Resep - Joko Susanto"
    useLayoutEffect(() => {
      if (route.params?.title) navigation.setOptions({ title: route.params.title });
    }, [navigation, route.params?.title]);

    const loadData = async () => {
      setLoading(true);
      try {
        setData(await api.list(defaults));
      } catch (e) {
        showAlert('Gagal memuat', e.message);
      } finally {
        setLoading(false);
      }
    };

    useFocusEffect(useCallback(() => { loadData(); }, [filterValue]));

    const shown = useMemo(() => {
      const kw = keyword.trim().toLowerCase();
      if (!searchText || kw === '') return data;
      return data.filter((item) => searchText(item).toLowerCase().includes(kw));
    }, [data, keyword]);

    const label = (item) => (titleOf ? titleOf(item) : `#${item.id}`);

    const handleDelete = (item) =>
      confirmDialog('Hapus Data', `Yakin menghapus "${label(item)}"?`, async () => {
        try {
          await api.remove(item.id);
          loadData();
        } catch (e) {
          showAlert('Gagal menghapus', e.message); // mis. ditolak karena masih dipakai data lain
        }
      });

    const renderItem = ({ item }) => {
      const extra = actions ? actions(item, { reload: loadData, navigation }) : [];
      const buttons = [
        ...(!canEdit || canEdit(item)
          ? [{ label: 'Edit', color: '#f59e0b', onPress: () => navigation.navigate(formRoute, { item, defaults }) }]
          : []),
        ...extra,
        { label: 'Hapus', color: '#ef4444', onPress: () => handleDelete(item) },
      ];
      const badge = badgeOf ? badgeOf(item) : null;
      return (
        <View style={s.card}>
          {renderBody ? renderBody(item) : (
            <>
              <View style={s.titleRow}>
                <Text style={s.title}>{titleOf(item)}</Text>
                {badge && (
                  <View style={[s.badge, { backgroundColor: badge.bg }]}>
                    <Text style={[s.badgeText, { color: badge.color }]}>{badge.label}</Text>
                  </View>
                )}
              </View>
              {!!subOf && <Text style={s.sub}>{subOf(item)}</Text>}
            </>
          )}
          <View style={s.btnRow}>
            {buttons.map((b) => (
              <TouchableOpacity key={b.label} style={[s.btn, { backgroundColor: b.color }]} onPress={b.onPress}>
                <Text style={s.btnText}>{b.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    };

    return (
      <View style={s.container}>
        {!!searchText && (
          <TextInput
            style={s.search}
            placeholder={searchPlaceholder}
            value={keyword}
            onChangeText={setKeyword}
            clearButtonMode="while-editing"
          />
        )}
        {loading && data.length === 0 && <ActivityIndicator size="large" color="#2563eb" />}
        <FlatList
          data={shown}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          refreshing={loading}
          onRefresh={loadData}
          contentContainerStyle={{ paddingBottom: 90 }}
          ListEmptyComponent={!loading && (
            <Text style={s.empty}>{keyword ? 'Data tidak ditemukan' : emptyText}</Text>
          )}
        />
        <TouchableOpacity style={s.fab} onPress={() => navigation.navigate(formRoute, { defaults })}>
          <Text style={s.fabText}>＋</Text>
        </TouchableOpacity>
      </View>
    );
  };
}

const s = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#f3f4f6' },
  search: {
    backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: '#d1d5db', marginBottom: 10,
  },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 10, marginBottom: 10, elevation: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  title: { fontSize: 16, fontWeight: 'bold', marginRight: 8, color: '#111827' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  sub: { color: '#6b7280', marginTop: 3 },
  btnRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  btn: { paddingVertical: 7, paddingHorizontal: 12, borderRadius: 6, marginRight: 6, marginBottom: 4 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  empty: { textAlign: 'center', marginTop: 30, color: '#6b7280' },
  fab: {
    position: 'absolute', right: 20, bottom: 24, width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#16a34a', alignItems: 'center', justifyContent: 'center', elevation: 5,
  },
  fabText: { color: '#fff', fontSize: 28, marginTop: -2 },
});
