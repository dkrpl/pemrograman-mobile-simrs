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
import JadwalListScreen from './src/screens/JadwalListScreen';
import PendaftaranListScreen from './src/screens/PendaftaranListScreen';
import PendaftaranFormScreen from './src/screens/PendaftaranFormScreen';

const Stack = createNativeStackNavigator();

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
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'SIMRS Dashboard' }}
        />
        <Stack.Screen
          name="PoliList"
          component={PoliListScreen}
          options={{ title: 'Master Data Poliklinik' }}
        />
        <Stack.Screen
          name="PoliForm"
          component={PoliFormScreen}
          options={({ route }) => ({
            title: route.params?.poli ? 'Ubah Data Poli' : 'Tambah Poli Baru',
          })}
        />
        <Stack.Screen
          name="DokterList"
          component={DokterListScreen}
          options={{ title: 'Master Data Dokter' }}
        />
        <Stack.Screen
          name="DokterForm"
          component={DokterFormScreen}
          options={({ route }) => ({
            title: route.params?.dokter ? 'Ubah Data Dokter' : 'Tambah Dokter Baru',
          })}
        />
        <Stack.Screen
          name="PasienList"
          component={PasienListScreen}
          options={{ title: 'Data Rekam Pasien' }}
        />
        <Stack.Screen
          name="PasienForm"
          component={PasienFormScreen}
          options={({ route }) => ({
            title: route.params?.pasien ? 'Ubah Data Pasien' : 'Registrasi Pasien Baru',
          })}
        />
        <Stack.Screen
          name="JadwalList"
          component={JadwalListScreen}
          options={{ title: 'Jadwal Praktik Dokter' }}
        />
        <Stack.Screen
          name="PendaftaranList"
          component={PendaftaranListScreen}
          options={{ title: 'Daftar Antrean Pendaftaran' }}
        />
        <Stack.Screen
          name="PendaftaranForm"
          component={PendaftaranFormScreen}
          options={{ title: 'Pendaftaran Antrean Baru' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
