// src/app/tambah-favorit.tsx
import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { tambahFavorit } from "../services/favoritStorage";
import { useTheme } from "../hooks/use-theme";

export default function ModalTambahFavorit() {
  const colors = useTheme();
  const [sedangMenyimpan, setSedangMenyimpan] = useState(false);

  const { id, nama, lat, lon } = useLocalSearchParams<{
    id: string;
    nama: string;
    lat: string;
    lon: string;
  }>();

  async function simpan() {
    setSedangMenyimpan(true);
    try {
      await tambahFavorit({
        id: Number(id),
        nama: nama || "Kota Pilihan",
        latitude: Number(lat),
        longitude: Number(lon),
      });
      router.back();
    } catch {
      setSedangMenyimpan(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Konfigurasi Header Modal Dinamis */}
      <Stack.Screen
        options={{
          title: "Tambah Favorit",
          headerTitleAlign: "center",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      <View style={styles.container}>
        {/* ─── Kartu Konfirmasi Modal ─────────────────────────────────────── */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.backgroundSelected,
            },
          ]}
        >
          {/* Badge Ikon Bintang Besar */}
          <View style={styles.iconCircle}>
            <Ionicons name="star" size={42} color="#F59E0B" />
          </View>

          {/* Label & Nama Kota */}
          <Text style={[styles.cardSubTitle, { color: colors.textSecondary }]}>
            Simpan Kota ke Favorit
          </Text>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
            {nama || "Kota Terpilih"}
          </Text>

          {/* Kapsul Koordinat GPS (Opsional Informasi Tambahan) */}
          {lat && lon && (
            <View
              style={[
                styles.coordBadge,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.backgroundSelected,
                },
              ]}
            >
              <Ionicons name="location-outline" size={13} color="#0284C7" />
              <Text style={[styles.coordText, { color: colors.textSecondary }]}>
                {Number(lat).toFixed(2)}°, {Number(lon).toFixed(2)}°
              </Text>
            </View>
          )}

          {/* Deskripsi Penjelas */}
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
            Kota ini akan disematkan ke daftar favorit pada tab Riwayat agar Anda
            dapat memantau prakiraan cuaca dengan cepat kapan saja.
          </Text>

          {/* ─── Dua Tombol Aksi Sejajar Horizontal ───────────────────────── */}
          <View style={styles.actionRow}>
            {/* Tombol Batal */}
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.7}
              disabled={sedangMenyimpan}
              style={[
                styles.btn,
                styles.btnCancel,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.backgroundSelected,
                },
              ]}
            >
              <Text style={[styles.btnCancelText, { color: colors.text }]}>
                Batal
              </Text>
            </TouchableOpacity>

            {/* Tombol Simpan */}
            <TouchableOpacity
              onPress={simpan}
              activeOpacity={0.8}
              disabled={sedangMenyimpan}
              style={[styles.btn, styles.btnSave]}
            >
              {sedangMenyimpan ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="star" size={16} color="#FFFFFF" />
                  <Text style={styles.btnSaveText}>Simpan</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Stylesheet ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 22,
    borderWidth: 1,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  iconCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  cardSubTitle: {
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  coordBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  coordText: {
    fontSize: 11,
    fontWeight: "600",
  },
  cardDescription: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 8,
    marginBottom: 24,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  btnCancel: {
    borderWidth: 1,
  },
  btnCancelText: {
    fontSize: 14,
    fontWeight: "600",
  },
  btnSave: {
    backgroundColor: "#0284C7",
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  btnSaveText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});