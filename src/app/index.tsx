import { View } from 'react-native';
import { useState, useEffect } from 'react';
import WeatherCard from '../components/WeatherCard';
import SearchBox from '../components/SearchBox';
import RiwayatList from '../components/RiwayatList';
import IndikatorAQI from "../components/IndikatorAQI"; // Latihan Mandiri - Pertemuan 2

export default function HalamanUtama() {
  const [kotaAktif, setKotaAktif] = useState("Pekalongan");
  const [riwayat, setRiwayat] = useState<string[]>(["Pekalongan"]);

  useEffect(() => {
    console.log("Kota aktif berubah menjadi:", kotaAktif);
  }, [kotaAktif]);

  function handleCari(kota: string) {
    setKotaAktif(kota);
    if (!riwayat.includes(kota)) {
      setRiwayat([...riwayat, kota]);
    }
  }

  return (
    <View style={{ padding: 16, gap: 16, marginTop: 80}}>
      <SearchBox onCari={handleCari} />
      <WeatherCard kota={kotaAktif} suhu={30} tingkatAQI="Baik" />

      {/* Latihan Mandiri - Pertemuan 2 */}
      <IndikatorAQI 
        kota={kotaAktif} 
        indeksAQI={50} 
        tingkat="Baik" 
        diperbaruiPada="2023-10-01 10:00:00"
      />
      
      <RiwayatList daftarKota={riwayat} />
    </View>
  )
}