// src/app/(tabs)/index.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Komponen Tampilan
import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import StatusData from "../../components/StatusData";

// Hooks & Services
import { useDebounce } from "../../hooks/use-debounce";
import { useTheme } from "../../hooks/use-theme";
import { cariKota } from "../../services/geocodingService";
import {
  ambilCuacaOfflineFirst,
  BATAS_CACHE_MS,
} from "../../services/cuacaRepository";
import { bersihkanCacheLama } from "../../services/cacheRepository";
import {
  mintaIzinLokasi,
  ambilKoordinatSaatIni,
  ambilNamaKotaDariKoordinat,
} from "../../services/locationService";
import { ambilSemuaFavorit } from "../../services/favoritStorage";
import { tambahRiwayatPencarian } from "../../services/riwayatStorage";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { labelKodeCuaca } from "../../constants/weatherCodes";

// Types
import { HasilGeocoding } from "../../types/geocoding";
import { HasilCuacaOffline } from "../../types/cache";

export default function HalamanUtama() {
  const colors = useTheme();
  const params = useLocalSearchParams<{ q?: string }>();

  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null);

  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [sedangMencariKota, setSedangMencariKota] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);
  const [sudahFavorit, setSudahFavorit] = useState(false);

  const teksTertunda = useDebounce(teksCari, 800);
  const requestIdRef = useRef(0);

  // Bersihkan cache lama saat pertama kali aplikasi dibuka
  useEffect(() => {
    bersihkanCacheLama(BATAS_CACHE_MS).catch(() => {});
  }, []);

  // Refresh status favorit setiap kali tab difokuskan
  useFocusEffect(
    useCallback(() => {
      if (kotaTerpilih) {
        ambilSemuaFavorit()
          .then((daftar) => {
            setSudahFavorit(daftar.some((k) => k.id === kotaTerpilih.id));
          })
          .catch(() => {});
      }
    }, [kotaTerpilih])
  );

  // FITUR 2 UTS: Saat kota diklik dari tab Riwayat, otomatis jalankan pencarian di Beranda
  useEffect(() => {
    if (params.q && params.q.trim().length > 0) {
      const queryKota = params.q.trim();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTeksCari(queryKota);
      setSedangMencariKota(true);
      setPesanError(null);

      cariKota(queryKota)
        .then((data) => {
          setHasilPencarian(data);
          if (data.length > 0) pilihKota(data[0]);
        })
        .catch(() => {
          setPesanError("Gagal mencari kota. Periksa koneksi internet Anda.");
        })
        .finally(() => {
          setSedangMencariKota(false);
        });
    }
  }, [params.q]);

  // Pencarian kota otomatis via Debounce
  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

    // Simpan nama kota asli ke riwayat pencarian
    if (kota.name && kota.name !== "Lokasi GPS") {
      await tambahRiwayatPencarian(kota.name);
    }

    try {
      const [dataOffline, daftarFav] = await Promise.all([
        ambilCuacaOfflineFirst(
          { id: kota.id, nama: kota.name, latitude: kota.latitude, longitude: kota.longitude },
          { paksaPerbarui }
        ),
        ambilSemuaFavorit().catch(() => []),
      ]);

      if (idSaatIni !== requestIdRef.current) return;

      setHasil(dataOffline);
      setSudahFavorit(daftarFav.some((k) => k.id === kota.id));
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

  // Fitur GPS Perangkat dengan Reverse Geocoding
  async function gunakanLokasiSaatIni() {
    const status = await mintaIzinLokasi();

    if (status === "denied") {
      setPesanLokasi("Izin lokasi ditolak. Buka pengaturan perangkat untuk mengaktifkan.");

      const judul = "Izin Lokasi Ditolak";
      const pesan =
        "Aplikasi Jelajah Aman memerlukan izin lokasi untuk mendeteksi cuaca setempat secara otomatis. Apakah Anda ingin membuka pengaturan perangkat sekarang untuk mengaktifkan izin GPS?";

      if (Platform.OS === "web") {
        if (typeof window !== "undefined" && window.confirm(`${judul}\n\n${pesan}`)) {
          // Pada browser web
        }
        return;
      }

      Alert.alert(judul, pesan, [
        { text: "Batal", style: "cancel" },
        {
          text: "Buka Pengaturan",
          onPress: () => {
            Linking.openSettings().catch(() => {});
          },
        },
      ]);
      return;
    }

    if (status === "unavailable") {
      setPesanLokasi("Layanan lokasi (GPS) tidak aktif di perangkat ini.");
      return;
    }

    setPesanLokasi(null);
    setSedangMemuat(true);

    try {
      const koordinat = await ambilKoordinatSaatIni();

      // Reverse geocoding: cari nama kota dari koordinat GPS
      let namaKota = "Lokasi GPS";
      let admin1 = "";
      let country = "";

      try {
        const infoTempat = await ambilNamaKotaDariKoordinat(
          koordinat.latitude,
          koordinat.longitude
        );
        if (infoTempat?.nama) {
          namaKota = infoTempat.nama;
          admin1 = infoTempat.wilayah ?? "";
          country = infoTempat.negara ?? "";
        }
      } catch {
        // Fallback tetap ke "Lokasi GPS"
      }

      pilihKota({
        id: -1,
        name: namaKota,
        latitude: koordinat.latitude,
        longitude: koordinat.longitude,
        country: country,
        admin1: admin1,
      });
    } catch {
      setPesanLokasi("Gagal mendeteksi lokasi GPS. Silakan coba lagi atau cari kota secara manual.");
      setSedangMemuat(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Kolom Pencarian */}
        <SearchBox onCari={setTeksCari} />

        {/* Tombol Lokasi GPS Kustom */}
        <TouchableOpacity
          onPress={gunakanLokasiSaatIni}
          activeOpacity={0.8}
          style={[
            styles.gpsButton,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.backgroundSelected,
            },
          ]}
        >
          <Ionicons name="location-outline" size={18} color="#0284C7" />
          <Text style={[styles.gpsButtonText, { color: colors.text }]}>
            Gunakan Lokasi GPS Saat Ini
          </Text>
        </TouchableOpacity>

        {/* Pesan status/error GPS */}
        {pesanLokasi && (
          <Text style={[styles.pesanLokasi, { color: colors.textSecondary }]}>
            {pesanLokasi}
          </Text>
        )}

        {/* Loading Pencarian Kota */}
        {sedangMencariKota && <ActivityIndicator color="#0284C7" />}

        {/* Pesan Error & Tombol Coba Lagi */}
        {pesanError && (
          <View
            style={[
              styles.errorBox,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: "#EF4444",
              },
            ]}
          >
            <View style={styles.errorRow}>
              <Ionicons name="warning-outline" size={16} color="#EF4444" />
              <Text
                style={styles.errorText}
                accessibilityLabel={`Pesan galat: ${pesanError}`}
              >
                {pesanError}
              </Text>
            </View>
            {kotaTerpilih && (
              <TouchableOpacity
                onPress={() => pilihKota(kotaTerpilih, true)}
                style={styles.retryButton}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh-outline" size={15} color="#FFFFFF" />
                <Text style={styles.retryButtonText}>Coba Lagi</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Hasil Pencarian Kosong */}
        {!sedangMencariKota &&
          !pesanError &&
          teksTertunda.trim().length > 0 &&
          hasilPencarian.length === 0 && (
            <Text
              accessibilityLabel="Pencarian selesai, kota tidak ditemukan"
              style={[styles.tidakDitemukan, { color: colors.textSecondary }]}
            >
              Kota tidak ditemukan
            </Text>
          )}

        {/* Daftar Hasil Pencarian API */}
        {!sedangMencariKota && hasilPencarian.length > 0 && (
          <View style={styles.hasilPencarianContainer}>
            <Text style={[styles.labelHasilPencarian, { color: colors.text }]}>
              Ditemukan {hasilPencarian.length} kota — pilih salah satu:
            </Text>

            {hasilPencarian.map((kota) => {
              const aktif = kotaTerpilih?.id === kota.id;
              return (
                <TouchableOpacity
                  key={kota.id}
                  onPress={() => pilihKota(kota)}
                  activeOpacity={0.7}
                  style={[
                    styles.hasilItem,
                    {
                      borderColor: aktif ? "#0284C7" : colors.backgroundSelected,
                      backgroundColor: aktif
                        ? colors.backgroundSelected
                        : colors.backgroundElement,
                    },
                  ]}
                >
                  <View style={styles.hasilItemKiri}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color={aktif ? "#0284C7" : colors.textSecondary}
                    />
                    <View>
                      <Text style={[styles.hasilNamaKota, { color: colors.text }]}>
                        {kota.name}
                      </Text>
                      {kota.admin1 && (
                        <Text style={[styles.hasilSubKota, { color: colors.textSecondary }]}>
                          {kota.admin1}, {kota.country}
                        </Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.hasilBadge}>{aktif ? "✓ Terpilih" : "Lihat →"}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Loading Ambil Cuaca */}
        {sedangMemuat && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0284C7" />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Memuat data cuaca & kualitas udara...
            </Text>
          </View>
        )}

        {/* Tampilan Data Cuaca Lengkap */}
        {hasil && kotaTerpilih && !sedangMemuat && (
          <View style={styles.hasilCuacaContainer}>
            {/* Status Badge Cache / Network */}
            <StatusData sumber={hasil.sumber} disimpanPada={hasil.disimpanPada} />

            {/* Kartu Cuaca Utama */}
            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)}
              indeksAQI={hasil.kualitasUdara.indeksAQI}
              kodeCuaca={hasil.cuaca.saatIni.kodeCuaca}
              kondisi={labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)}
            />

            {/* Tombol Aksi Sejajar (Perbarui & Favorit) */}
            <View style={styles.aksiRow}>
              <TouchableOpacity
                onPress={() => pilihKota(kotaTerpilih, true)}
                activeOpacity={0.8}
                style={[
                  styles.tombolAksi,
                  {
                    backgroundColor: colors.backgroundElement,
                    borderColor: colors.backgroundSelected,
                  },
                ]}
              >
                <Ionicons name="refresh-outline" size={16} color={colors.text} />
                <Text style={[styles.tombolAksiText, { color: colors.text }]}>
                  Perbarui
                </Text>
              </TouchableOpacity>

              {!sudahFavorit ? (
                <TouchableOpacity
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
                  activeOpacity={0.8}
                  style={[styles.tombolAksi, styles.tombolFavorit]}
                >
                  <Ionicons name="star-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.tombolFavoritText}>Simpan Favorit</Text>
                </TouchableOpacity>
              ) : (
                <View
                  style={[
                    styles.tombolAksi,
                    {
                      backgroundColor: colors.backgroundElement,
                      borderColor: "#16A34A",
                    },
                  ]}
                >
                  <Ionicons name="star" size={16} color="#16A34A" />
                  <Text style={[styles.tombolAksiText, { color: "#16A34A" }]}>
                    Sudah Favorit
                  </Text>
                </View>
              )}
            </View>

            {/* Grid Info Cuaca 2 Kolom */}
            <View style={styles.infoGrid}>
              {hasil.cuaca.harian?.suhuMaksimal?.[0] !== undefined && (
                <View
                  style={[
                    styles.infoCell,
                    { backgroundColor: colors.backgroundElement },
                  ]}
                >
                  <Ionicons name="thermometer-outline" size={16} color="#0284C7" />
                  <Text style={[styles.infoCellLabel, { color: colors.textSecondary }]}>
                    Suhu Hari Ini
                  </Text>
                  <Text style={[styles.infoCellValue, { color: colors.text }]}>
                    ↑ {hasil.cuaca.harian.suhuMaksimal[0]}°C
                  </Text>
                  <Text style={[styles.infoCellValue, { color: colors.text }]}>
                    ↓ {hasil.cuaca.harian.suhuMinimal[0]}°C
                  </Text>
                </View>
              )}

              <View
                style={[
                  styles.infoCell,
                  { backgroundColor: colors.backgroundElement },
                ]}
              >
                <Ionicons name="partly-sunny-outline" size={16} color="#0284C7" />
                <Text style={[styles.infoCellLabel, { color: colors.textSecondary }]}>
                  Kondisi & Angin
                </Text>
                <Text style={[styles.infoCellValue, { color: colors.text }]}>
                  {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)}
                </Text>
                <Text style={[styles.infoCellValue, { color: colors.text }]}>
                  {hasil.cuaca.saatIni.kecepatanAngin} km/j
                </Text>
              </View>
            </View>

            {/* Rincian PM2.5 & PM10 */}
            {hasil.kualitasUdara && (
              <View style={[styles.pmBox, { backgroundColor: colors.backgroundElement }]}>
                <Ionicons name="leaf-outline" size={14} color="#10B981" />
                <Text style={[styles.pmText, { color: colors.textSecondary }]}>
                  PM2.5:{" "}
                  <Text style={{ color: colors.text, fontWeight: "600" }}>
                    {hasil.kualitasUdara.pm25} µg/m³
                  </Text>
                  {"  "}PM10:{" "}
                  <Text style={{ color: colors.text, fontWeight: "600" }}>
                    {hasil.kualitasUdara.pm10} µg/m³
                  </Text>
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Atribusi Sumber Data */}
        <View style={styles.atribusiContainer}>
          <AtribusiCuaca />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── StyleSheet ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: 16, gap: 14, paddingBottom: 32 },

  // Tombol GPS
  gpsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  gpsButtonText: { fontSize: 14, fontWeight: "600" },
  pesanLokasi: { fontSize: 12, fontStyle: "italic" },

  // Error Box
  errorBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  errorText: { color: "#EF4444", fontSize: 13, flex: 1 },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#EF4444",
    paddingVertical: 9,
    borderRadius: 8,
  },
  retryButtonText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },

  // Hasil Pencarian
  tidakDitemukan: { fontSize: 13, fontStyle: "italic" },
  hasilPencarianContainer: { gap: 8 },
  labelHasilPencarian: { fontSize: 13, fontWeight: "700" },
  hasilItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  hasilItemKiri: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  hasilNamaKota: { fontSize: 14, fontWeight: "600" },
  hasilSubKota: { fontSize: 11, marginTop: 1 },
  hasilBadge: { color: "#0284C7", fontWeight: "600", fontSize: 12 },

  // Loading
  loadingContainer: { padding: 24, alignItems: "center", gap: 8 },
  loadingText: { fontSize: 12 },

  // Hasil Cuaca
  hasilCuacaContainer: { gap: 10 },

  // Tombol Aksi Sejajar
  aksiRow: { flexDirection: "row", gap: 10 },
  tombolAksi: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  tombolAksiText: { fontSize: 13, fontWeight: "600" },
  tombolFavorit: {
    backgroundColor: "#0284C7",
    borderColor: "#0284C7",
  },
  tombolFavoritText: { color: "#FFFFFF", fontSize: 13, fontWeight: "700" },

  // Grid Info Cuaca 2 Kolom
  infoGrid: { flexDirection: "row", gap: 10 },
  infoCell: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    gap: 4,
    alignItems: "flex-start",
  },
  infoCellLabel: { fontSize: 11, marginTop: 2 },
  infoCellValue: { fontSize: 14, fontWeight: "700" },

  // PM Box
  pmBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 10,
  },
  pmText: { fontSize: 12 },

  // Atribusi
  atribusiContainer: { marginTop: 6, alignItems: "center" },
});