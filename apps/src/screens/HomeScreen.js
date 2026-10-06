import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { getPoli } from '../services/poliService';
import { getDokter } from '../services/dokterService';
import { getPasien } from '../services/pasienService';
import { getJadwal } from '../services/jadwalService';
import { getPendaftaran } from '../services/pendaftaranService';
import { BASE_URL } from '../config/api';

export default function HomeScreen({ navigation }) {
  const [stats, setStats] = useState({ poli: 0, dokter: 0, pasien: 0, jadwal: 0, antrean: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [serverOnline, setServerOnline] = useState(true);

  const fetchStats = async () => {
    try {
      const [poliData, dokterData, pasienData, jadwalData, antreanData] = await Promise.all([
        getPoli().catch(() => []),
        getDokter().catch(() => []),
        getPasien().catch(() => []),
        getJadwal().catch(() => []),
        getPendaftaran().catch(() => []),
      ]);
      setStats({
        poli: Array.isArray(poliData) ? poliData.length : 0,
        dokter: Array.isArray(dokterData) ? dokterData.length : 0,
        pasien: Array.isArray(pasienData) ? pasienData.length : 0,
        jadwal: Array.isArray(jadwalData) ? jadwalData.length : 0,
        antrean: Array.isArray(antreanData) ? antreanData.length : 0,
      });
      setServerOnline(true);
    } catch (e) {
      setServerOnline(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const menus = [
    {
      title: 'Data Poliklinik',
      desc: 'Kelola master data poli dan lokasi klinik',
      icon: '🏥',
      color: '#2563eb',
      screen: 'PoliList',
    },
    {
      title: 'Data Dokter',
      desc: 'Kelola nama dokter, spesialisasi, dan nomor SIP',
      icon: '👨‍⚕️',
      color: '#0891b2',
      screen: 'DokterList',
    },
    {
      title: 'Data Pasien',
      desc: 'Kelola identitas pasien, NIK, dan nomor RM',
      icon: '👥',
      color: '#059669',
      screen: 'PasienList',
    },
    {
      title: 'Jadwal Praktik',
      desc: 'Jadwal praktik dokter per poli dan kuota harian',
      icon: '📅',
      color: '#d97706',
      screen: 'JadwalList',
    },
    {
      title: 'Pendaftaran & Antrean',
      desc: 'Daftar antrean pasien dan status kunjungan',
      icon: '📋',
      color: '#7c3aed',
      screen: 'PendaftaranList',
    },
  ];

  return (
    <ScrollView
      style={s.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Header Banner */}
      <View style={s.banner}>
        <Text style={s.bannerTitle}>🏥 SIMRS Mobile</Text>
        <Text style={s.bannerSubtitle}>Sistem Informasi Manajemen Rumah Sakit</Text>
        <View style={s.statusRow}>
          <View style={[s.statusDot, { backgroundColor: serverOnline ? '#22c55e' : '#ef4444' }]} />
          <Text style={s.statusText}>
            {serverOnline ? `API Terhubung: ${BASE_URL}` : 'Tidak Ada Koneksi Server'}
          </Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={s.statsContainer}>
        {loading ? (
          <ActivityIndicator color="#2563eb" style={{ marginVertical: 20 }} />
        ) : (
          <View style={s.statsGrid}>
            <View style={s.statBox}>
              <Text style={s.statNum}>{stats.poli}</Text>
              <Text style={s.statLabel}>Poli</Text>
            </View>
            <View style={s.statBox}>
              <Text style={s.statNum}>{stats.dokter}</Text>
              <Text style={s.statLabel}>Dokter</Text>
            </View>
            <View style={s.statBox}>
              <Text style={s.statNum}>{stats.pasien}</Text>
              <Text style={s.statLabel}>Pasien</Text>
            </View>
            <View style={s.statBox}>
              <Text style={s.statNum}>{stats.jadwal}</Text>
              <Text style={s.statLabel}>Jadwal</Text>
            </View>
            <View style={s.statBox}>
              <Text style={[s.statNum, { color: '#7c3aed' }]}>{stats.antrean}</Text>
              <Text style={s.statLabel}>Antrean</Text>
            </View>
          </View>
        )}
      </View>

      {/* Menu Cards */}
      <View style={s.menuSection}>
        <Text style={s.sectionTitle}>Modul Utama</Text>
        {menus.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={s.menuCard}
            onPress={() => navigation.navigate(item.screen)}>
            <View style={[s.iconBox, { backgroundColor: item.color + '18' }]}>
              <Text style={s.iconText}>{item.icon}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={s.menuTitle}>{item.title}</Text>
              <Text style={s.menuDesc}>{item.desc}</Text>
            </View>
            <Text style={s.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.footer}>
        <Text style={s.footerText}>SIMRS Mobile v1.0.0 • Praktikum Pengembangan Aplikasi Mobile</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  banner: {
    backgroundColor: '#1e40af', padding: 22, paddingTop: 24,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  bannerTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  bannerSubtitle: { fontSize: 13, color: '#bfdbfe', marginTop: 4 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { color: '#e2e8f0', fontSize: 11 },
  statsContainer: { marginTop: -15, paddingHorizontal: 16 },
  statsGrid: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14,
    padding: 12, elevation: 3, shadowColor: '#000',
    shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: 'bold', color: '#1e293b' },
  statLabel: { fontSize: 10, color: '#64748b', marginTop: 2 },
  menuSection: { padding: 16, marginTop: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155', marginBottom: 12 },
  menuCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 16, borderRadius: 12, marginBottom: 10, elevation: 1,
    borderWidth: 1, borderColor: '#f1f5f9',
  },
  iconBox: {
    width: 48, height: 48, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  iconText: { fontSize: 24 },
  menuTitle: { fontSize: 15, fontWeight: 'bold', color: '#1e293b' },
  menuDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  arrow: { fontSize: 24, color: '#cbd5e1', fontWeight: 'bold' },
  footer: { padding: 20, alignItems: 'center', marginTop: 10 },
  footerText: { fontSize: 11, color: '#94a3b8', textAlign: 'center' },
});
