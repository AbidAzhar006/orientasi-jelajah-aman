import { useState, useEffect } from "react";
import { useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import WeatherCard from "../../components/WeatherCard";
import SearchBox from "../../components/SearchBox";
import RiwayatList from "../../components/RiwayatList";
import IndikatorAQI from "../../components/IndikatorAQI"; 

export default function HalamanUtama() {
  const [kotaAktif, setKotaAktif] = useState("Pekalongan");
  const [riwayat, setRiwayat] = useState<string[]>(["Pekalongan"]);
  const { width } = useWindowDimensions();
  const isTablet = width > 768;

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
    <SafeAreaView style={{ flex: 1, padding: isTablet ? 32 : 16, gap: 16 }}>
      <SearchBox onCari={handleCari} />
      <WeatherCard kota={kotaAktif} suhu={30} tingkatAQI="Baik" />

      {/* Latihan Mandiri - Pertemuan 2  */}
      <IndikatorAQI
        kota={kotaAktif}
        indeksAQI={50}
        tingkat="Baik"
        diperbaruiPada="2026-09-13 00:00:00"
      />

      <RiwayatList daftarKota={riwayat} />
    </SafeAreaView>
  );
}