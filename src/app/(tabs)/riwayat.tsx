// src/app/(tabs)/riwayat.tsx
import { useState, useCallback } from "react";
import { View, Text, Button, Alert, Platform } from "react-native"; // Tahap 10: Tambah Platform
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import { KotaFavorit } from "../../types/favorit";

export default function TabRiwayat() {
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);

  useFocusEffect(
    useCallback(() => {
      ambilSemuaFavorit().then(setDaftarFavorit);
    }, [])
  );

  // Tahap 10: Latihan Mandiri - Eksekusi hapus data
  async function eksekusiHapus(id: number) {
    await hapusFavorit(id);
    // Pastikan filter membandingkan Number agar kebal beda tipe data
    setDaftarFavorit((prev) => prev.filter((k) => Number(k.id) !== Number(id)));
  }

  // Tahap 10: Latihan Mandiri - Konfirmasi hapus (kompatibel Web & Mobile)
  function hapus(id: number, nama: string) {
    if (Platform.OS === "web") {
      const setuju = window.confirm(`Yakin hapus ${nama}?`);
      if (setuju) {
        eksekusiHapus(id);
      }
      return;
    }

    Alert.alert(
      "Konfirmasi Hapus",
      `Yakin hapus ${nama}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: () => eksekusiHapus(id),
        },
      ]
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>Kota Favorit</Text>
      
      {/* Tahap 10: Latihan Mandiri - Tampilkan jumlah favorit */}
      <Text style={{ fontSize: 13, color: "#64748B" }}>
        Tersimpan {daftarFavorit.length} kota
      </Text>

      {daftarFavorit.length === 0 && <Text>Belum ada kota favorit</Text>}
      {daftarFavorit.map((kota) => (
        <View
          key={kota.id}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text>{kota.nama}</Text>
          {/* Tahap 10: Kirim id dan nama kota */}
          <Button title="Hapus" onPress={() => hapus(kota.id, kota.nama)} />
        </View>
      ))}
    </SafeAreaView>
  );
}