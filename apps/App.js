import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import PoliListScreen from './src/screens/PoliListScreen';
import PoliFormScreen from './src/screens/PoliFormScreen';
import DokterListScreen from './src/screens/DokterListScreen';
import DokterFormScreen from './src/screens/DokterFormScreen';
import PasienListScreen from './src/screens/PasienListScreen';
import PasienFormScreen from './src/screens/PasienFormScreen';
import PendaftaranFormScreen from './src/screens/PendaftaranFormScreen';
import {
  JadwalList, JadwalForm, PendaftaranList, RekamMedisList, RekamMedisForm,
  ResepList, ResepForm, UsersList, UsersForm, NotifikasiList, NotifikasiForm,
} from './src/screens/entityScreens';

const Stack = createNativeStackNavigator();

// Judul form generik: "Tambah X" / "Ubah X" tergantung ada params.item atau tidak
const formOpt = (nama) => ({ route }) => ({
  title: `${route.params?.item ? 'Ubah' : 'Tambah'} ${nama}`,
});

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#1e40af' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'SIMRS Dashboard' }} />

        {/* Master data */}
        <Stack.Screen name="PoliList" component={PoliListScreen} options={{ title: 'Master Data Poliklinik' }} />
        <Stack.Screen
          name="PoliForm"
          component={PoliFormScreen}
          options={({ route }) => ({ title: route.params?.poli ? 'Ubah Data Poli' : 'Tambah Poli Baru' })}
        />
        <Stack.Screen name="DokterList" component={DokterListScreen} options={{ title: 'Master Data Dokter' }} />
        <Stack.Screen
          name="DokterForm"
          component={DokterFormScreen}
          options={({ route }) => ({ title: route.params?.dokter ? 'Ubah Data Dokter' : 'Tambah Dokter Baru' })}
        />
        <Stack.Screen name="PasienList" component={PasienListScreen} options={{ title: 'Data Rekam Pasien' }} />
        <Stack.Screen
          name="PasienForm"
          component={PasienFormScreen}
          options={({ route }) => ({ title: route.params?.pasien ? 'Ubah Data Pasien' : 'Registrasi Pasien Baru' })}
        />
        <Stack.Screen name="JadwalList" component={JadwalList} options={{ title: 'Jadwal Praktik Dokter' }} />
        <Stack.Screen name="JadwalForm" component={JadwalForm} options={formOpt('Jadwal Praktik')} />

        {/* Pelayanan pasien */}
        <Stack.Screen name="PendaftaranList" component={PendaftaranList} options={{ title: 'Pendaftaran & Antrean' }} />
        <Stack.Screen
          name="PendaftaranForm"
          component={PendaftaranFormScreen}
          options={({ route }) => ({ title: route.params?.item ? 'Ubah Pendaftaran' : 'Pendaftaran Antrean Baru' })}
        />
        <Stack.Screen name="RekamMedisList" component={RekamMedisList} options={{ title: 'Rekam Medis' }} />
        <Stack.Screen name="RekamMedisForm" component={RekamMedisForm} options={formOpt('Rekam Medis')} />
        <Stack.Screen name="ResepList" component={ResepList} options={{ title: 'Resep Obat' }} />
        <Stack.Screen name="ResepForm" component={ResepForm} options={formOpt('Resep Obat')} />

        {/* Sistem */}
        <Stack.Screen name="UsersList" component={UsersList} options={{ title: 'Data User' }} />
        <Stack.Screen name="UsersForm" component={UsersForm} options={formOpt('User')} />
        <Stack.Screen name="NotifikasiList" component={NotifikasiList} options={{ title: 'Notifikasi' }} />
        <Stack.Screen name="NotifikasiForm" component={NotifikasiForm} options={formOpt('Notifikasi')} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
