// src/app/(tabs)/riwayat.tsx
import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  StyleSheet,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { ambilSemuaFavorit, hapusFavorit } from "../../services/favoritStorage";
import { ambilRiwayatPencarian } from "../../services/riwayatStorage";
import {
  daftarKotaTersimpan,
  hapusCacheByKunci,
} from "../../services/cacheRepository";
import { useTheme } from "../../hooks/use-theme";
import { KotaFavorit } from "../../types/favorit";
import { RingkasanKotaTersimpan } from "../../types/cache";

// Format waktu penyimpanan cache agar ramah pengguna
function formatWaktuCache(timestamp: number): string {
  const mnt = Math.floor((Date.now() - timestamp) / 60000);
  if (mnt < 1) return "Baru saja disimpan";
  if (mnt < 60) return `${mnt} menit lalu`;
  const jam = Math.floor(mnt / 60);
  if (jam < 24) return `${jam} jam lalu`;
  return new Date(timestamp).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

// Fungsi pembantu reusable untuk konfirmasi Alert (kompatibel Mobile & Web)
function konfirmasiAksi(judul: string, pesan: string, onSetuju: () => void) {
  if (Platform.OS === "web") {
    if (window.confirm(pesan)) onSetuju();
    return;
  }
  Alert.alert(judul, pesan, [
    { text: "Batal", style: "cancel" },
    { text: "Hapus", style: "destructive", onPress: onSetuju },
  ]);
}

export default function TabRiwayat() {
  const colors = useTheme();
  const [tabAktif, setTabAktif] = useState<"favorit" | "cache">("favorit");

  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [riwayatPencarian, setRiwayatPencarian] = useState<string[]>([]);
  const [kotaCache, setKotaCache] = useState<RingkasanKotaTersimpan[]>([]);

  // Pengambilan seluruh data setiap kali tab difokuskan
  const muatSemuaData = useCallback(() => {
    ambilSemuaFavorit().then(setDaftarFavorit).catch(() => {});
    ambilRiwayatPencarian().then(setRiwayatPencarian).catch(() => {});
    daftarKotaTersimpan().then(setKotaCache).catch(() => {});
  }, []);

  useFocusEffect(useCallback(() => { muatSemuaData(); }, [muatSemuaData]));

  const bukaDiBeranda = (namaKota: string) => {
    router.push({ pathname: "/", params: { q: namaKota } });
  };

  // Normalisasi data item untuk render tunggal yang efisien
  const itemAktif =
    tabAktif === "favorit"
      ? daftarFavorit.map((k) => ({
          key: `fav-${k.id}`,
          nama: k.nama,
          sub: "Buka prakiraan cuaca →",
          subColor: "#0284C7",
          icon: "star" as const,
          iconColor: "#F59E0B",
          iconBg: "rgba(245, 158, 11, 0.12)",
          hapus: () =>
            konfirmasiAksi(
              "Hapus Favorit",
              `Keluarkan "${k.nama}" dari daftar kota favorit?`,
              async () => {
                await hapusFavorit(k.id);
                setDaftarFavorit((prev) =>
                  prev.filter((item) => Number(item.id) !== Number(k.id))
                );
                daftarKotaTersimpan().then(setKotaCache).catch(() => {});
              }
            ),
        }))
      : kotaCache.map((c) => ({
          key: `cache-${c.kunci}`,
          nama: c.nama,
          sub: formatWaktuCache(c.disimpanPada),
          subColor: colors.textSecondary,
          icon: "server-outline" as const,
          iconColor: "#10B981",
          iconBg: "rgba(16, 185, 129, 0.12)",
          hapus: () =>
            konfirmasiAksi(
              "Hapus Cache",
              `Hapus cache cuaca "${c.nama}" dari perangkat?`,
              async () => {
                await hapusCacheByKunci(c.kunci);
                setKotaCache((prev) => prev.filter((item) => item.kunci !== c.kunci));
              }
            ),
        }));

  const emptyInfo =
    tabAktif === "favorit"
      ? {
          icon: "star-outline" as const,
          judul: "Belum Ada Kota Favorit",
          deskripsi: "Cari kota di Beranda lalu klik 'Tambahkan ke Favorit'.",
        }
      : {
          icon: "cloud-offline-outline" as const,
          judul: "Belum Ada Cache Tersimpan",
          deskripsi: "Data cuaca kota otomatis disimpan di SQLite agar bisa dibuka offline.",
        };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Halaman */}
        <View style={styles.header}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>
            Riwayat & Simpanan
          </Text>
          <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
            Akses cepat kota yang pernah Anda cari dan simpan
          </Text>
        </View>

        {/* Seksi 1: Riwayat Pencarian Terakhir (Fitur 2 UTS) */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={18} color="#0284C7" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Pencarian Terakhir (Maks. 10)
            </Text>
          </View>
          <View style={styles.divider} />

          {riwayatPencarian.length === 0 ? (
            <Text style={[styles.emptyInlineText, { color: colors.textSecondary }]}>
              Belum ada riwayat pencarian
            </Text>
          ) : (
            <View style={styles.chipWrapper}>
              {riwayatPencarian.map((namaKota, idx) => (
                <TouchableOpacity
                  key={`${namaKota}-${idx}`}
                  onPress={() => bukaDiBeranda(namaKota)}
                  style={[
                    styles.chip,
                    { backgroundColor: colors.background, borderColor: colors.backgroundSelected },
                  ]}
                  activeOpacity={0.7}
                >
                  <Ionicons name="search-outline" size={12} color="#0284C7" />
                  <Text style={[styles.chipText, { color: colors.text }]}>
                    {namaKota}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Seksi 2: Segmented Switcher */}
        <View
          style={[
            styles.segmentContainer,
            { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected },
          ]}
        >
          {(["favorit", "cache"] as const).map((tipe) => {
            const aktif = tabAktif === tipe;
            const jumlah = tipe === "favorit" ? daftarFavorit.length : kotaCache.length;
            const label = tipe === "favorit" ? "Kota Favorit" : "Cache Offline";
            const iconName = tipe === "favorit" ? "star" : "server";

            return (
              <TouchableOpacity
                key={tipe}
                onPress={() => setTabAktif(tipe)}
                style={[styles.segmentBtn, aktif && { backgroundColor: "#0284C7" }]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={iconName}
                  size={15}
                  color={aktif ? "#FFFFFF" : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.segmentLabel,
                    { color: aktif ? "#FFFFFF" : colors.text, fontWeight: aktif ? "700" : "500" },
                  ]}
                >
                  {label}
                </Text>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: aktif ? "rgba(255,255,255,0.25)" : colors.backgroundSelected },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: aktif ? "#FFFFFF" : colors.textSecondary },
                    ]}
                  >
                    {jumlah}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Seksi 3: Render Daftar Item Tunggal (Fitur 3 UTS) */}
        <View style={styles.listContainer}>
          {itemAktif.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected },
              ]}
            >
              <Ionicons name={emptyInfo.icon} size={42} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{emptyInfo.judul}</Text>
              <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
                {emptyInfo.deskripsi}
              </Text>
            </View>
          ) : (
            itemAktif.map((item) => (
              <View
                key={item.key}
                style={[
                  styles.itemCard,
                  { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected },
                ]}
              >
                <TouchableOpacity
                  style={styles.itemMain}
                  onPress={() => bukaDiBeranda(item.nama)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.itemIcon, { backgroundColor: item.iconBg }]}>
                    <Ionicons name={item.icon} size={18} color={item.iconColor} />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemTitle, { color: colors.text }]}>{item.nama}</Text>
                    <Text style={[styles.itemSub, { color: item.subColor }]}>{item.sub}</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={item.hapus}
                  style={styles.deleteBtn}
                  activeOpacity={0.7}
                  accessibilityLabel={`Hapus ${item.nama}`}
                >
                  <Ionicons name="trash-outline" size={17} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Stylesheet Ringkas ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 32, gap: 14 },
  header: { paddingVertical: 4, gap: 2 },
  pageTitle: { fontSize: 22, fontWeight: "bold", letterSpacing: 0.3 },
  pageSubtitle: { fontSize: 13 },
  card: { borderRadius: 14, padding: 14, borderWidth: 1, gap: 10 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { fontSize: 14, fontWeight: "700" },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: "rgba(150, 150, 150, 0.25)" },
  emptyInlineText: { fontSize: 12, fontStyle: "italic", paddingVertical: 4 },
  chipWrapper: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 12, fontWeight: "600" },
  segmentContainer: { flexDirection: "row", padding: 4, borderRadius: 12, borderWidth: 1, gap: 6 },
  segmentBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 9,
    gap: 7,
  },
  segmentLabel: { fontSize: 13 },
  badge: { paddingVertical: 2, paddingHorizontal: 6, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  listContainer: { gap: 10 },
  emptyCard: {
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  emptyTitle: { fontSize: 15, fontWeight: "700", marginTop: 4 },
  emptyDesc: { fontSize: 12, textAlign: "center", lineHeight: 16, maxWidth: 260 },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    gap: 12,
  },
  itemMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  itemIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  itemInfo: { flex: 1, gap: 2 },
  itemTitle: { fontSize: 14, fontWeight: "600" },
  itemSub: { fontSize: 12, fontWeight: "500" },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
});