// src/app/(tabs)/index.tsx
import { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import { useDebounce } from "../../hooks/use-debounce";
import { cariKota } from "../../services/geocodingService";
import { HasilGeocoding } from "../../types/geocoding";

export default function HalamanUtama() {
  const [teksCari, setTeksCari] = useState("");
  const [hasil, setHasil] = useState<HasilGeocoding[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);

  // 1. Ubah delay debounce menjadi 800 ms
  const teksTertunda = useDebounce(teksCari, 800);

  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasil([]);
      setPesanError(null);
      return;
    }
    ambilData(teksTertunda);
  }, [teksTertunda]);

  async function ambilData(nama: string) {
    setSedangMemuat(true);
    setPesanError(null);
    try {
      const data = await cariKota(nama);
      setHasil(data);
    } catch (err) {
      setPesanError("Gagal mengambil data. Periksa koneksi internet Anda.");
    } finally {
      setSedangMemuat(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 16 }}>
      <SearchBox onCari={setTeksCari} />

      {sedangMemuat && <ActivityIndicator />}

      {/* 2. Tambahkan accessibilityLabel pada pesan error */}
      {pesanError && (
        <View>
          <Text accessibilityLabel={`Pesan galat: ${pesanError}`}>{pesanError}</Text>
          <Button title="Coba Lagi" onPress={() => ambilData(teksTertunda)} />
        </View>
      )}

      {/* 3. Tambahkan accessibilityLabel pada kondisi kosong */}
      {!sedangMemuat && !pesanError && teksTertunda.length > 0 && hasil.length === 0 && (
        <Text accessibilityLabel="Pencarian selesai, kota tidak ditemukan">
          Kota tidak ditemukan
        </Text>
      )}

      {/* 4. Tampilkan indikator jumlah hasil pencarian */}
      {!sedangMemuat && !pesanError && hasil.length > 0 && (
        <Text style={{ fontWeight: "bold" }}>
          Ditemukan {hasil.length} kota
        </Text>
      )}

      {hasil.map((kota) => (
        <WeatherCard key={kota.id} kota={kota.name} suhu={29} tingkatAQI="Baik" />
      ))}
    </SafeAreaView>
  );
}