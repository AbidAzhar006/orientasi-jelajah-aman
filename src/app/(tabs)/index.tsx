// src/app/(tabs)/index.tsx

import { useState, useEffect, useRef, useCallback } from "react"; // Tahap 10: Tambah useCallback
import {
  View,
  Text,
  ActivityIndicator,
  Button,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router"; // Tahap 10: Tambah useFocusEffect
import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import { useDebounce } from "../../hooks/use-debounce";
import { cariKota } from "../../services/geocodingService";
import { ambilCuaca } from "../../services/weatherService";
import { ambilKualitasUdara } from "../../services/airQualityService";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { HasilGeocoding } from "../../types/geocoding";
import { DataCuacaLengkap, DataKualitasUdara } from "../../types/weather";
import { mintaIzinLokasi, ambilKoordinatSaatIni } from "../../services/locationService";
import { ambilSemuaFavorit } from "../../services/favoritStorage"; // Tahap 10: Import ambilSemuaFavorit

export default function HalamanUtama() {
  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [cuaca, setCuaca] = useState<DataCuacaLengkap | null>(null);
  const [kualitasUdara, setKualitasUdara] = useState<DataKualitasUdara | null>(null);
  const [sedangMemuatCuaca, setSedangMemuatCuaca] = useState(false);
  const [sedangMencariKota, setSedangMencariKota] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);
  
  // Tahap 10: Latihan Mandiri - State untuk mengecek apakah kota sudah ada di daftar favorit
  const [sudahFavorit, setSudahFavorit] = useState(false);

  const teksTertunda = useDebounce(teksCari, 800);
  const requestIdRef = useRef(0); // Mencegah race condition

  async function cariDataKota(keyword: string) {
    if (keyword.trim().length === 0) {
      setHasilPencarian([]);
      setPesanError(null);
      return;
    }

    setSedangMencariKota(true);
    setPesanError(null);

    try {
      const data = await cariKota(keyword);
      setHasilPencarian(data);
      setPesanError(null);
    } catch (err) {
      setHasilPencarian([]);
      setPesanError("Gagal mencari kota. Periksa koneksi internet Anda.");
    } finally {
      setSedangMencariKota(false);
    }
  }

  useEffect(() => {
    cariDataKota(teksTertunda);
  }, [teksTertunda]);

  // Tahap 10: Latihan Mandiri - Cek status favorit setiap kali halaman utama difokuskan
  useFocusEffect(
    useCallback(() => {
      if (kotaTerpilih) {
        ambilSemuaFavorit().then((daftar) => {
          const ada = daftar.some((k) => k.id === kotaTerpilih.id);
          setSudahFavorit(ada);
        });
      }
    }, [kotaTerpilih])
  );

  async function pilihKota(kota: HasilGeocoding) {
    setKotaTerpilih(kota);
    const idSaatIni = ++requestIdRef.current;
    setSedangMemuatCuaca(true);
    setPesanError(null);

    try {
      const [dataCuaca, dataAQI, daftarFav] = await Promise.all([
        ambilCuaca(kota.latitude, kota.longitude),
        ambilKualitasUdara(kota.latitude, kota.longitude),
        ambilSemuaFavorit(), // Tahap 10: Ambil data favorit untuk pemeriksaan langsung
      ]);

      if (idSaatIni !== requestIdRef.current) return;

      setCuaca(dataCuaca);
      setKualitasUdara(dataAQI);
      setSudahFavorit(daftarFav.some((k) => k.id === kota.id)); // Tahap 10: Set status duplikat
    } catch (err) {
      if (idSaatIni !== requestIdRef.current) return;
      setPesanError("Gagal memuat data cuaca. Periksa koneksi internet Anda.");
    } finally {
      if (idSaatIni === requestIdRef.current) setSedangMemuatCuaca(false);
    }
  }

  // Fungsi tambahan untuk Tahap 3
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
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* Kolom Pencarian */}
        <SearchBox onCari={setTeksCari} />

        {/* Tombol & Pesan Lokasi Saat Ini (Tahap 3) */}
        <Button title="Gunakan Lokasi Saat Ini" onPress={gunakanLokasiSaatIni} />
        {pesanLokasi && <Text>{pesanLokasi}</Text>}

        {/* Indikator Memuat Pencarian Kota */}
        {sedangMencariKota && <ActivityIndicator color="#0284C7" />}

        {/* Status Error */}
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
                  pilihKota(kotaTerpilih);
                } else if (teksTertunda) {
                  cariDataKota(teksTertunda);
                }
              }}
            />
          </View>
        )}

        {/* Status Tidak Ditemukan */}
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

        {/* Indikator Jumlah Hasil Pencarian */}
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

        {/* Indikator Memuat Data Cuaca & AQI */}
        {sedangMemuatCuaca && (
          <View style={{ padding: 20, alignItems: "center", gap: 8 }}>
            <ActivityIndicator size="large" color="#0284C7" />
            <Text style={{ fontSize: 12, color: "#64748B" }}>
              Mengambil cuaca & kualitas udara...
            </Text>
          </View>
        )}

        {/* Kartu Cuaca & Info Detail Kota Terpilih (Termasuk Tombol Favorit) */}
        {cuaca && kualitasUdara && kotaTerpilih && !sedangMemuatCuaca && (
          <View style={{ gap: 10 }}>
            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(kualitasUdara.indeksAQI)}
              indeksAQI={kualitasUdara.indeksAQI}
            />

            {/* Tahap 10: Latihan Mandiri - Nonaktifkan / sembunyikan tombol jika sudah favorit */}
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
                  {cuaca.harian.suhuMaksimal[0]}°C
                </Text>{" "}
                • Min:{" "}
                <Text style={{ fontWeight: "600", color: "#1E293B" }}>
                  {cuaca.harian.suhuMinimal[0]}°C
                </Text>
              </Text>
            </View>

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
                  {labelKodeCuaca(cuaca.saatIni.kodeCuaca)}
                </Text>{" "}
                • Angin:{" "}
                <Text style={{ fontWeight: "600", color: "#1E293B" }}>
                  {cuaca.saatIni.kecepatanAngin} km/j
                </Text>
              </Text>
            </View>
          </View>
        )}

        <View style={{ marginTop: 16, alignItems: "center", gap: 4 }}>
          {kualitasUdara && (
            <Text style={{ fontSize: 11, color: "#64748B" }}>
              PM2.5: {kualitasUdara.pm25} µg/m³ • PM10: {kualitasUdara.pm10} µg/m³
            </Text>
          )}
          <AtribusiCuaca />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}