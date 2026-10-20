// src/app/(tabs)/tentang.tsx
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/use-theme";

export default function TabTentang() {
  const colors = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── 1. Header Logo & Nama Aplikasi ───────────────────────────── */}
        <View style={styles.headerContainer}>
          <View style={[styles.logoBadge, { backgroundColor: colors.backgroundElement }]}>
            <Ionicons name="partly-sunny" size={44} color="#0284C7" />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>
            Jelajah Aman
          </Text>
          <Text style={[styles.appTagline, { color: colors.textSecondary }]}>
            Aplikasi Informasi Cuaca & Kualitas Udara Pintar
          </Text>
          <View style={[styles.versionPill, { backgroundColor: colors.backgroundSelected }]}>
            <Text style={[styles.versionText, { color: colors.textSecondary }]}>
              Versi 1.0.0 
            </Text>
          </View>
        </View>

        {/* ─── 2. Kartu Profil Pengembang (Mahasiswa) ───────────────────── */}
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
            <Ionicons name="person-circle-outline" size={22} color="#0284C7" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Identitas Pengembang
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Nama Mahasiswa */}
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Nama Mahasiswa
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                Muhammad Abid Azhar
              </Text>
            </View>
          </View>

          {/* NIM (Berdiri Sendiri) */}
          <View style={styles.infoRow}>
            <Ionicons name="card-outline" size={18} color={colors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Nomor Induk Mahasiswa 
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                60324051
              </Text>
            </View>
          </View>

          {/* Program Studi */}
          <View style={styles.infoRow}>
            <Ionicons name="school-outline" size={18} color={colors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Program Studi
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                S1 Informatika
              </Text>
            </View>
          </View>

          {/* Perguruan Tinggi */}
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={18} color={colors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Perguruan Tinggi
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                UIN K.H. Abdurrahman Wahid Pekalongan
              </Text>
            </View>
          </View>

          {/* Mata Kuliah & Kelas (Digabung) */}
          <View style={styles.infoRow}>
            <Ionicons name="book-outline" size={18} color={colors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Mata Kuliah & Kelas
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                Pemrograman Berbasis Platform (Kelas A)
              </Text>
            </View>
          </View>

          {/* Keterangan Tugas */}
          <View style={styles.infoRow}>
            <Ionicons name="code-slash-outline" size={18} color={colors.textSecondary} />
            <View style={styles.infoContent}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                Tujuan Proyek
              </Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                Ujian Tengah Semester (UTS)
              </Text>
            </View>
          </View>
        </View>

        {/* ─── 3. Kartu Fitur Aplikasi ──────────────────────────────────── */}
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
            <Ionicons name="sparkles-outline" size={22} color="#0284C7" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Fitur Aplikasi
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.featureItem}>
            <View style={styles.featureIconBox}>
              <Ionicons name="search" size={16} color="#0284C7" />
            </View>
            <View style={styles.featureTextBox}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>
                Pencarian Cuaca Cepat
              </Text>
              <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
                Pencarian kota otomatis dengan debounce & integrasi GPS lokasi terkini.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconBox}>
              <Ionicons name="server-outline" size={16} color="#10B981" />
            </View>
            <View style={styles.featureTextBox}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>
                Offline-First SQLite Cache
              </Text>
              <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
                Data cuaca tersimpan di database lokal sehingga dapat dibuka tanpa koneksi internet.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconBox}>
              <Ionicons name="leaf-outline" size={16} color="#F59E0B" />
            </View>
            <View style={styles.featureTextBox}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>
                Indikator Kualitas Udara (AQI)
              </Text>
              <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
                Evaluasi kadar polusi udara, PM2.5, dan PM10 secara langsung.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconBox}>
              <Ionicons name="time-outline" size={16} color="#8B5CF6" />
            </View>
            <View style={styles.featureTextBox}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>
                Riwayat & Kota Favorit
              </Text>
              <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
                Penyimpanan riwayat pencarian terakhir dan daftar kota favorit pengguna.
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconBox}>
              <Ionicons name="contrast-outline" size={16} color="#EC4899" />
            </View>
            <View style={styles.featureTextBox}>
              <Text style={[styles.featureTitle, { color: colors.text }]}>
                Dukungan Multi-Tema
              </Text>
              <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>
                Pilihan tema Terang, Gelap, atau Ikuti Sistem di menu Pengaturan.
              </Text>
            </View>
          </View>
        </View>

        {/* ─── 4. Kartu Sumber Data & Teknologi ─────────────────────────── */}
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
            <Ionicons name="hardware-chip-outline" size={22} color="#0284C7" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Teknologi & Sumber Data
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.techRow}>
            <Text style={[styles.techLabel, { color: colors.textSecondary }]}>Framework</Text>
            <Text style={[styles.techValue, { color: colors.text }]}>React Native (Expo / Router)</Text>
          </View>

          <View style={styles.techRow}>
            <Text style={[styles.techLabel, { color: colors.textSecondary }]}>Database</Text>
            <Text style={[styles.techValue, { color: colors.text }]}>Expo SQLite & AsyncStorage</Text>
          </View>

          <View style={styles.techRow}>
            <Text style={[styles.techLabel, { color: colors.textSecondary }]}>API Cuaca</Text>
            <Text style={[styles.techValue, { color: colors.text }]}>Open-Meteo Weather & Air Quality API</Text>
          </View>

          <View style={styles.techRow}>
            <Text style={[styles.techLabel, { color: colors.textSecondary }]}>Geocoding</Text>
            <Text style={[styles.techValue, { color: colors.text }]}>Open-Meteo Geocoding API</Text>
          </View>
        </View>

        {/* ─── 5. Footer Hak Cipta ──────────────────────────────────────── */}
        <View style={styles.footerContainer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            © 2026 Jelajah Aman • Muhammad Abid Azhar
          </Text>
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
    alignItems: "center",
    paddingVertical: 12,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 0.3,
  },
  appTagline: {
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },
  versionPill: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  versionText: {
    fontSize: 11,
    fontWeight: "600",
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
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(150, 150, 150, 0.25)",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  featureIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(2, 132, 199, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  featureTextBox: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  featureDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  techRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  techLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  techValue: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
    flexShrink: 1,
  },
  footerContainer: {
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 8,
  },
  footerText: {
    fontSize: 11,
  },
});