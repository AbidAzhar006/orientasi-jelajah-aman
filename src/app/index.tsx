import { View } from 'react-native';
import { useState, useEffect } from 'react';
import WeatherCard from '../components/WeatherCard';
import SearchBox from '../components/SearchBox';
import RiwayatList from '../components/RiwayatList';

export default function HalamanUtama() {
  const [kotaAktif, setKotaAktif] = useState("Pekalongan");
  const [riwayat, setRiwayat] = useState<string[]>(["Pekalongan"]);

  function handleCari(kota: string) {
    setKotaAktif(kota);
    if (!riwayat.includes(kota)) {
      setRiwayat([...riwayat, kota]);
    }
  }

  return (
    <View style={{ padding: 16, gap: 16 }}>
      <SearchBox onCari={handleCari} />
      <WeatherCard kota={kotaAktif} suhu={30} tingkatAQI="Baik" />
      <RiwayatList daftarKota={riwayat} />
    </View>
  )
}