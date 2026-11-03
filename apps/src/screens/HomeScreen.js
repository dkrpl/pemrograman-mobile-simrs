import React, { useCallback, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDashboard } from '../services/crudService';
import { BASE_URL } from '../config/api';

const MENU_GROUPS = [
  {
    title: 'Pelayanan Pasien',
    items: [
      { title: 'Pendaftaran & Antrean', desc: 'Daftarkan pasien, panggil antrean, ubah status', icon: '📋', color: '#7c3aed', screen: 'PendaftaranList', stat: 'pendaftaran' },
      { title: 'Rekam Medis', desc: 'Diagnosa & catatan hasil pemeriksaan', icon: '🩺', color: '#db2777', screen: 'RekamMedisList', stat: 'rekam_medis' },
      { title: 'Resep Obat', desc: 'Daftar obat yang diresepkan ke pasien', icon: '💊', color: '#9333ea', screen: 'ResepList', stat: 'resep_obat' },
    ],
  },
  {
    title: 'Master Data',
    items: [
      { title: 'Data Poliklinik', desc: 'Kelola poli dan lokasi klinik', icon: '🏥', color: '#2563eb', screen: 'PoliList', stat: 'poli' },
      { title: 'Data Dokter', desc: 'Nama dokter, spesialisasi, dan nomor SIP', icon: '👨‍⚕️', color: '#0891b2', screen: 'DokterList', stat: 'dokter' },
      { title: 'Data Pasien', desc: 'Identitas pasien, NIK, dan nomor RM', icon: '👥', color: '#059669', screen: 'PasienList', stat: 'pasien' },
      { title: 'Jadwal Praktik', desc: 'Jadwal dokter per poli, jam & kuota', icon: '📅', color: '#d97706', screen: 'JadwalList', stat: 'jadwal' },
    ],
  },
  {
    title: 'Sistem',
    items: [
      { title: 'Data User', desc: 'Akun login admin, dokter, dan pasien', icon: '🔐', color: '#475569', screen: 'UsersList', stat: 'users' },
      { title: 'Notifikasi', desc: 'Kirim & kelola pesan untuk pengguna', icon: '🔔', color: '#ea580c', screen: 'NotifikasiList', stat: 'notifikasi_baru', statLabel: 'baru' },
    ],
  },
];

const ANTREAN = [
  { key: 'menunggu', label: 'Menunggu', color: '#4338ca' },
  { key: 'dipanggil', label: 'Dipanggil', color: '#b45309' },
  { key: 'selesai', label: 'Selesai', color: '#15803d' },
  { key: 'batal', label: 'Batal', color: '#b91c1c' },
];

export default function HomeScreen({ navigation }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [serverError, setServerError] = useState('');

  const fetchStats = async () => {
    try {
      setStats(await getDashboard());
      setServerError('');
    } catch (e) {
      setServerError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Muat ulang ringkasan setiap kembali ke dashboard
  useFocusEffect(useCallback(() => { fetchStats(); }, []));

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  return (
    <ScrollView
      style={s.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={s.banner}>
        <Text style={s.bannerTitle}>🏥 SIMRS Mobile</Text>
        <Text style={s.bannerSubtitle}>Sistem Informasi Manajemen Rumah Sakit</Text>
        <View style={s.statusRow}>
          <View style={[s.statusDot, { backgroundColor: serverError ? '#ef4444' : '#22c55e' }]} />
          <Text style={s.statusText} numberOfLines={2}>
            {serverError ? `Server tidak terhubung: ${BASE_URL}` : `API Terhubung: ${BASE_URL}`}
          </Text>
        </View>
      </View>

      <View style={s.statsContainer}>
        <View style={s.statsCard}>
          <Text style={s.statsTitle}>
            Antrean Hari Ini {stats ? `(${stats.tanggal})` : ''}
          </Text>
          {loading ? (
            <ActivityIndicator color="#2563eb" style={{ marginVertical: 12 }} />
          ) : serverError ? (
            <Text style={s.errorText}>{serverError}{'\n'}Tarik layar ke bawah untuk mencoba lagi.</Text>
          ) : (
            <View style={s.statsGrid}>
              {ANTREAN.map((a) => (
                <TouchableOpacity key={a.key} style={s.statBox} onPress={() => navigation.navigate('PendaftaranList')}>
                  <Text style={[s.statNum, { color: a.color }]}>{stats.antrean_hari_ini[a.key]}</Text>
                  <Text style={s.statLabel}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {MENU_GROUPS.map((group) => (
        <View key={group.title} style={s.menuSection}>
          <Text style={s.sectionTitle}>{group.title}</Text>
          {group.items.map((item) => (
            <TouchableOpacity
              key={item.screen}
              style={s.menuCard}
              onPress={() => navigation.navigate(item.screen)}>
              <View style={[s.iconBox, { backgroundColor: item.color + '18' }]}>
                <Text style={s.iconText}>{item.icon}</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={s.menuTitle}>{item.title}</Text>
                <Text style={s.menuDesc}>{item.desc}</Text>
              </View>
              {stats && (
                <View style={[s.countBadge, { backgroundColor: item.color + '18' }]}>
                  <Text style={[s.countText, { color: item.color }]}>
                    {stats[item.stat]}{item.statLabel ? ` ${item.statLabel}` : ''}
                  </Text>
                </View>
              )}
              <Text style={s.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <View style={s.footer}>
        <Text style={s.footerText}>SIMRS Mobile v1.1.0 • Praktikum Pengembangan Aplikasi Mobile</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  banner: {
    backgroundColor: '#1e40af', padding: 22, paddingTop: 24, paddingBottom: 34,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  bannerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  bannerSubtitle: { fontSize: 13, color: '#bfdbfe', marginTop: 4 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { color: '#e2e8f0', fontSize: 11, flex: 1 },
  statsContainer: { marginTop: -20, paddingHorizontal: 16 },
  statsCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, elevation: 3,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
  statsTitle: { fontSize: 13, fontWeight: 'bold', color: '#334155', marginBottom: 8 },
  statsGrid: { flexDirection: 'row' },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { fontSize: 11, color: '#64748b', marginTop: 2 },
  errorText: { color: '#b91c1c', fontSize: 12 },
  menuSection: { paddingHorizontal: 16, marginTop: 18 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#334155', marginBottom: 10 },
  menuCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 14, borderRadius: 12, marginBottom: 10, elevation: 1,
    borderWidth: 1, borderColor: '#f1f5f9',
  },
  iconBox: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 22 },
  menuTitle: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
  menuDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  countBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginLeft: 8 },
  countText: { fontSize: 12, fontWeight: 'bold' },
  arrow: { fontSize: 24, color: '#cbd5e1', fontWeight: 'bold', marginLeft: 6 },
  footer: { padding: 20, alignItems: 'center', marginTop: 4 },
  footerText: { fontSize: 11, color: '#94a3b8', textAlign: 'center' },
});
