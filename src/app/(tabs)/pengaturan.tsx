// src/app/(tabs)/pengaturan.tsx
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { hapusSemuaCache } from "../../services/cacheRepository";
import { useTheme, useModeTema, ModeTema } from "../../hooks/use-theme";

export default function TabPengaturan() {
  const [pesan, setPesan] = useState<string | null>(null);
  const colors = useTheme();
  const [modeTema, setModeTema] = useModeTema();

  // Eksekusi penghapusan seluruh baris cache di SQLite
  async function eksekusiHapusCache() {
    try {
      await hapusSemuaCache();
      setPesan("Seluruh data cache cuaca di SQLite berhasil dikosongkan.");
      setTimeout(() => setPesan(null), 4000); // Pesan hilang otomatis setelah 4 detik
    } catch {
      setPesan("Gagal mengosongkan cache database.");
    }
  }

  // Dialog konfirmasi penghapusan (kompatibel Mobile & Web)
  function konfirmasiHapusSemuaCache() {
    const teksPeringatan =
      "Apakah Anda yakin ingin menghapus seluruh cache cuaca yang tersimpan di perangkat? Data yang dihapus tidak dapat dipulihkan.";

    if (Platform.OS === "web") {
      if (window.confirm(teksPeringatan)) {
        eksekusiHapusCache();
      }
      return;
    }

    Alert.alert("Konfirmasi Hapus Cache", teksPeringatan, [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus Semua",
        style: "destructive",
        onPress: eksekusiHapusCache,
      },
    ]);
  }

  const pilihanTema: {
    label: string;
    nilai: ModeTema;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    { label: "Terang", nilai: "light", icon: "sunny-outline" },
    { label: "Gelap", nilai: "dark", icon: "moon-outline" },
    { label: "Sistem", nilai: "system", icon: "phone-portrait-outline" },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header Halaman ───────────────────────────────────────────── */}
        <View style={styles.headerContainer}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>
            Pengaturan
          </Text>
          <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>
            Kelola preferensi antarmuka dan penyimpanan data aplikasi
          </Text>
        </View>

        {/* ─── Seksi 1: Tampilan & Tema (Fitur 4 UTS) ───────────────────── */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.backgroundSelected,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="color-palette-outline" size={22} color="#0284C7" />
            <View style={styles.cardHeaderText}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Tampilan & Tema
              </Text>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                Pilih gaya tampilan visual sesuai kenyamanan Anda
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.themeSelectorRow}>
            {pilihanTema.map((opsi) => {
              const aktif = modeTema === opsi.nilai;
              return (
                <TouchableOpacity
                  key={opsi.nilai}
                  onPress={() => setModeTema(opsi.nilai)}
                  activeOpacity={0.7}
                  style={[
                    styles.themeButton,
                    {
                      backgroundColor: aktif ? "#0284C7" : colors.background,
                      borderColor: aktif ? "#0284C7" : colors.backgroundSelected,
                    },
                  ]}
                >
                  <Ionicons
                    name={opsi.icon}
                    size={22}
                    color={aktif ? "#FFFFFF" : colors.text}
                  />
                  <Text
                    style={[
                      styles.themeButtonLabel,
                      {
                        color: aktif ? "#FFFFFF" : colors.text,
                        fontWeight: aktif ? "700" : "500",
                      },
                    ]}
                  >
                    {opsi.label}
                  </Text>
                  {aktif && (
                    <View style={styles.activeCheck}>
                      <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ─── Seksi 2: Penyimpanan & Cache (Fitur 3 UTS) ────────────────── */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.backgroundSelected,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="server-outline" size={22} color="#0284C7" />
            <View style={styles.cardHeaderText}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Penyimpanan & Cache
              </Text>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                Manajemen data cuaca offline yang disimpan di database lokal
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
            Aplikasi menggunakan SQLite untuk menyimpan riwayat cuaca kota agar
            tetap bisa diakses saat tidak ada internet. Jika memori terasa penuh
            atau data ingin diperbarui dari awal, Anda dapat membersihkannya.
          </Text>

          <TouchableOpacity
            onPress={konfirmasiHapusSemuaCache}
            activeOpacity={0.8}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
            <Text style={styles.deleteButtonText}>
              Kosongkan Seluruh Cache SQLite
            </Text>
          </TouchableOpacity>

          {pesan && (
            <View style={styles.feedbackBanner}>
              <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
              <Text style={styles.feedbackText}>{pesan}</Text>
            </View>
          )}
        </View>

        {/* ─── Seksi 3: Ringkasan Aplikasi ─────────────────────────────── */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.backgroundSelected,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle-outline" size={22} color="#0284C7" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Informasi Aplikasi
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.rowItem}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>
              Aplikasi
            </Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>
              Jelajah Aman
            </Text>
          </View>

          <View style={styles.rowItem}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>
              Versi Rilis
            </Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>
              1.0.0
            </Text>
          </View>

          <View style={styles.rowItem}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>
              Skema Database
            </Text>
            <Text style={[styles.rowValue, { color: colors.text }]}>
              SQLite (Versi 2)
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Stylesheet ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  headerContainer: {
    paddingVertical: 8,
    gap: 4,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  pageSubtitle: {
    fontSize: 13,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardHeaderText: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  cardDesc: {
    fontSize: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(150, 150, 150, 0.25)",
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 18,
  },
  themeSelectorRow: {
    flexDirection: "row",
    gap: 10,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    position: "relative",
  },
  themeButtonLabel: {
    fontSize: 13,
  },
  activeCheck: {
    position: "absolute",
    top: 6,
    right: 6,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC2626",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 4,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  feedbackBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(22, 163, 74, 0.12)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  feedbackText: {
    color: "#16A34A",
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  rowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  rowValue: {
    fontSize: 13,
    fontWeight: "600",
  },
});