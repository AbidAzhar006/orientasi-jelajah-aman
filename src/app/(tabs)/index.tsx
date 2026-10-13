// src/app/(tabs)/index.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Button,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";

// Komponen Tampilan
import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import StatusData from "../../components/StatusData";

// Hooks & Services
import { useDebounce } from "../../hooks/use-debounce";
import { cariKota } from "../../services/geocodingService";
import {
  ambilCuacaOfflineFirst,
  BATAS_CACHE_MS,
} from "../../services/cuacaRepository";
import {
  bersihkanCacheLama,
  daftarKotaTersimpan,
} from "../../services/cacheRepository";
import {
  mintaIzinLokasi,
  ambilKoordinatSaatIni,
} from "../../services/locationService";
import { ambilSemuaFavorit } from "../../services/favoritStorage";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { labelKodeCuaca } from "../../constants/weatherCodes";

// Types
import { HasilGeocoding } from "../../types/geocoding";
import { HasilCuacaOffline, RingkasanKotaTersimpan } from "../../types/cache";

export default function HalamanUtama() {
  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  
  // Data cuaca offline-first (gabungan cuaca, AQI, sumber data, dan timestamp)
  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null);
  const [kotaTersimpan, setKotaTersimpan] = useState<RingkasanKotaTersimpan[]>([]);

  // Loading & status states
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [sedangMencariKota, setSedangMencariKota] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);
  const [sudahFavorit, setSudahFavorit] = useState(false);

  const teksTertunda = useDebounce(teksCari, 800);
  const requestIdRef = useRef(0);

  // Ambil 5 daftar riwayat kota terakhir yang tersimpan di SQLite
  async function muatKotaTersimpan() {
    try {
      const daftar = await daftarKotaTersimpan();
      setKotaTersimpan(daftar);
    } catch {
      // Abaikan jika database awal belum siap
    }
  }

  // Bersihkan cache > 7 hari saat pertama kali buka aplikasi
  useEffect(() => {
    bersihkanCacheLama(BATAS_CACHE_MS)
      .then(muatKotaTersimpan)
      .catch(() => {});
  }, []);

  // Sinkronisasi status favorit setiap kali halaman difokuskan ulang
  useFocusEffect(
    useCallback(() => {
      if (kotaTerpilih) {
        ambilSemuaFavorit()
          .then((daftar) => {
            const ada = daftar.some((k) => k.id === kotaTerpilih.id);
            setSudahFavorit(ada);
          })
          .catch(() => {});
      }
    }, [kotaTerpilih])
  );

  // Pencarian kota otomatis via Debounce
  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
      setPesanError(null);
      return;
    }

    setSedangMencariKota(true);
    setPesanError(null);

    cariKota(teksTertunda)
      .then((data) => {
        setHasilPencarian(data);
        setPesanError(null);
      })
      .catch(() => {
        setHasilPencarian([]);
        setPesanError("Gagal mencari kota. Periksa koneksi internet Anda.");
      })
      .finally(() => {
        setSedangMencariKota(false);
      });
  }, [teksTertunda]);

  // Eksekusi pemilihan kota dengan arsitektur Offline-First
  async function pilihKota(kota: HasilGeocoding, paksaPerbarui = false) {
    setKotaTerpilih(kota);
    const idSaatIni = ++requestIdRef.current;
    setSedangMemuat(true);
    setPesanError(null);

    try {
      const [dataOffline, daftarFav] = await Promise.all([
        ambilCuacaOfflineFirst(
          {
            id: kota.id,
            nama: kota.name,
            latitude: kota.latitude,
            longitude: kota.longitude,
          },
          { paksaPerbarui }
        ),
        ambilSemuaFavorit().catch(() => []),
      ]);

      if (idSaatIni !== requestIdRef.current) return;

      setHasil(dataOffline);
      setSudahFavorit(daftarFav.some((k) => k.id === kota.id));
      muatKotaTersimpan();
    } catch {
      if (idSaatIni !== requestIdRef.current) return;
      setHasil(null);
      setPesanError(
        "Belum ada data tersimpan dan tidak ada koneksi internet. Sambungkan internet lalu coba lagi."
      );
    } finally {
      if (idSaatIni === requestIdRef.current) setSedangMemuat(false);
    }
  }

  // Fitur GPS Perangkat
  async function gunakanLokasiSaatIni() {
    const status = await mintaIzinLokasi();
    if (status === "denied") {
      setPesanLokasi("Izin lokasi ditolak. Silakan cari kota secara manual di atas.");
      return;
    }
    if (status === "unavailable") {
      setPesanLokasi("Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secara manual.");
      return;
    }

    setPesanLokasi(null);
    const koordinat = await ambilKoordinatSaatIni();
    pilihKota({
      id: -1,
      name: "Lokasi Saat Ini",
      latitude: koordinat.latitude,
      longitude: koordinat.longitude,
      country: "",
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Kolom Pencarian */}
        <SearchBox onCari={setTeksCari} />

        {/* Tombol Lokasi GPS */}
        <Button title="Gunakan Lokasi Saat Ini" onPress={gunakanLokasiSaatIni} />
        {pesanLokasi && <Text>{pesanLokasi}</Text>}

        {/* Loading Pencarian Kota */}
        {sedangMencariKota && <ActivityIndicator color="#0284C7" />}

        {/* Pesan Error & Tombol Coba Lagi */}
        {pesanError && (
          <View
            style={{
              padding: 12,
              borderRadius: 8,
              backgroundColor: "#FEE2E2",
              borderWidth: 1,
              borderColor: "#FCA5A5",
              gap: 8,
            }}
          >
            <Text
              accessibilityLabel={`Pesan galat: ${pesanError}`}
              style={{ color: "#B91C1C", fontSize: 13 }}
            >
              {pesanError}
            </Text>
            <Button
              title="Coba Lagi"
              color="#B91C1C"
              onPress={() => {
                if (kotaTerpilih) {
                  pilihKota(kotaTerpilih, true);
                }
              }}
            />
          </View>
        )}

        {/* Hasil Pencarian Kosong */}
        {!sedangMencariKota &&
          !pesanError &&
          teksTertunda.trim().length > 0 &&
          hasilPencarian.length === 0 && (
            <Text
              accessibilityLabel="Pencarian selesai, kota tidak ditemukan"
              style={{ color: "#64748B", fontStyle: "italic" }}
            >
              Kota tidak ditemukan
            </Text>
          )}

        {/* Daftar Hasil Pencarian API */}
        {!sedangMencariKota && hasilPencarian.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "700", color: "#334155", fontSize: 13 }}>
              Ditemukan {hasilPencarian.length} kota (Pilih salah satu):
            </Text>

            {hasilPencarian.map((kota) => {
              const aktif = kotaTerpilih?.id === kota.id;
              return (
                <TouchableOpacity
                  key={kota.id}
                  onPress={() => pilihKota(kota)}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: aktif ? "#0284C7" : "#E2E8F0",
                    backgroundColor: aktif ? "#F0F9FF" : "#F8FAFC",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View>
                    <Text
                      style={{
                        fontWeight: "600",
                        fontSize: 15,
                        color: aktif ? "#0369A1" : "#0F172A",
                      }}
                    >
                      {kota.name}
                    </Text>
                    {kota.admin1 && (
                      <Text style={{ fontSize: 12, color: "#64748B" }}>
                        {kota.admin1}, {kota.country}
                      </Text>
                    )}
                  </View>
                  <Text style={{ color: "#0284C7", fontWeight: "600", fontSize: 13 }}>
                    {aktif ? "Terpilih ✓" : "Lihat →"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Daftar Cache SQLite: Tersimpan di Perangkat (Bisa Dibuka Offline) */}
        {kotaTersimpan.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "700", color: "#334155", fontSize: 13 }}>
              Tersimpan di perangkat (bisa dibuka offline):
            </Text>
            {kotaTersimpan.map((k) => (
              <TouchableOpacity
                key={k.kunci}
                onPress={() =>
                  pilihKota({
                    id: k.id,
                    name: k.nama,
                    latitude: k.latitude,
                    longitude: k.longitude,
                    country: "",
                  })
                }
                style={{
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  backgroundColor: "#F8FAFC",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontWeight: "600", fontSize: 14, color: "#0F172A" }}>
                  {k.nama}
                </Text>
                <Text style={{ color: "#0284C7", fontSize: 12 }}>
                  Buka Cache →
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Loading Ambil Cuaca */}
        {sedangMemuat && (
          <View style={{ padding: 20, alignItems: "center", gap: 8 }}>
            <ActivityIndicator size="large" color="#0284C7" />
            <Text style={{ fontSize: 12, color: "#64748B" }}>
              Memuat data cuaca & kualitas udara...
            </Text>
          </View>
        )}

        {/* Tampilan Data Cuaca Lengkap */}
        {hasil && kotaTerpilih && !sedangMemuat && (
          <View style={{ gap: 10 }}>
            {/* Indikator Status Asal Data (Jaringan / Cache Segar / Cache Basi) */}
            <StatusData
              sumber={hasil.sumber}
              disimpanPada={hasil.disimpanPada}
            />

            {/* Kartu Cuaca Utama */}
            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)}
              indeksAQI={hasil.kualitasUdara.indeksAQI}
            />

            {/* Tombol Paksa Ambil Data Baru */}
            <Button
              title="Perbarui Sekarang"
              onPress={() => pilihKota(kotaTerpilih, true)}
            />

            {/* Tombol Favorit / Status Terdaftar */}
            {!sudahFavorit ? (
              <Button
                title="Tambahkan ke Favorit"
                onPress={() =>
                  router.push({
                    pathname: "/tambah-favorit",
                    params: {
                      id: String(kotaTerpilih.id),
                      nama: kotaTerpilih.name,
                      lat: String(kotaTerpilih.latitude),
                      lon: String(kotaTerpilih.longitude),
                    },
                  })
                }
              />
            ) : (
              <View
                style={{
                  padding: 10,
                  backgroundColor: "#DCFCE7",
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#166534", fontWeight: "600", fontSize: 13 }}>
                  ✓ Kota ini sudah ada di daftar favorit
                </Text>
              </View>
            )}

            {/* Suhu Harian Maksimal & Minimal */}
            {hasil.cuaca.harian?.suhuMaksimal?.[0] !== undefined && (
              <View
                style={{
                  padding: 10,
                  backgroundColor: "#F1F5F9",
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 13, color: "#475569" }}>
                  Suhu Hari Ini - Maks:{" "}
                  <Text style={{ fontWeight: "600", color: "#1E293B" }}>
                    {hasil.cuaca.harian.suhuMaksimal[0]}°C
                  </Text>{" "}
                  • Min:{" "}
                  <Text style={{ fontWeight: "600", color: "#1E293B" }}>
                    {hasil.cuaca.harian.suhuMinimal[0]}°C
                  </Text>
                </Text>
              </View>
            )}

            {/* Ringkasan Kondisi & Kecepatan Angin */}
            <View
              style={{
                padding: 10,
                backgroundColor: "#F1F5F9",
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 13, color: "#475569" }}>
                Kondisi:{" "}
                <Text style={{ fontWeight: "600", color: "#1E293B" }}>
                  {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)}
                </Text>{" "}
                • Angin:{" "}
                <Text style={{ fontWeight: "600", color: "#1E293B" }}>
                  {hasil.cuaca.saatIni.kecepatanAngin} km/j
                </Text>
              </Text>
            </View>
          </View>
        )}

        {/* Nilai Rinci PM2.5 & PM10 dan Atribusi Sumber Data */}
        <View style={{ marginTop: 16, alignItems: "center", gap: 4 }}>
          {hasil?.kualitasUdara && (
            <Text style={{ fontSize: 11, color: "#64748B" }}>
              PM2.5: {hasil.kualitasUdara.pm25} µg/m³ • PM10:{" "}
              {hasil.kualitasUdara.pm10} µg/m³
            </Text>
          )}
          <AtribusiCuaca />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}