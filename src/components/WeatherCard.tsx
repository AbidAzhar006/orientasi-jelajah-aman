// src/components/WeatherCard.tsx
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import IndikatorAQI from "./IndikatorAQI";
import { TingkatAQI } from "../types/cuaca";
import { labelKodeCuaca } from "../constants/weatherCodes";

// ─── Props ────────────────────────────────────────────────────────────────────
interface WeatherCardProps {
  kota: string;
  suhu: number;
  tingkatAQI: TingkatAQI;
  indeksAQI?: number;
  kodeCuaca?: number; // Kode WMO cuaca fisik (misal: 0, 1, 3, 61, 95)
  kondisi?: string;   // Label kondisi cuaca fisik (misal: "Mendung", "Cerah")
}

// ─── Visual Map Berdasarkan Kondisi Cuaca Fisik ──────────────────────────────
type WeatherVisual = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  badgeShadowColor: string;
  gradient: [string, string, string];
  glassColor: string;
};

function getWeatherVisual(kodeCuaca?: number, kondisi?: string): WeatherVisual {
  // 1. Prioritas pemetaan berbasis kodeCuaca WMO (Open-Meteo)
  if (kodeCuaca !== undefined) {
    // Cerah (Kode 0)
    if (kodeCuaca === 0) {
      return {
        icon: "sunny",
        iconColor: "#F59E0B",
        badgeShadowColor: "#F59E0B",
        gradient: ["#0284C7", "#0EA5E9", "#7DD3FC"],
        glassColor: "rgba(2, 132, 199, 0.38)",
      };
    }

    // Cerah Berawan (Kode 1)
    if (kodeCuaca === 1) {
      return {
        icon: "partly-sunny",
        iconColor: "#FBBF24",
        badgeShadowColor: "#F59E0B",
        gradient: ["#0369A1", "#38BDF8", "#BAE6FD"],
        glassColor: "rgba(3, 105, 161, 0.38)",
      };
    }

    // Berawan / Mendung / Kabut (Kode 2, 3, 45, 48)
    if ([2, 3, 45, 48].includes(kodeCuaca)) {
      return {
        icon: kodeCuaca === 2 ? "partly-sunny" : "cloudy",
        iconColor: "#94A3B8",
        badgeShadowColor: "#64748B",
        gradient: ["#334155", "#475569", "#64748B"],
        glassColor: "rgba(51, 65, 85, 0.48)",
      };
    }

    // Hujan / Gerimis / Hujan Lokal (Kode 51-67, 80-82)
    if (
      (kodeCuaca >= 51 && kodeCuaca <= 67) ||
      (kodeCuaca >= 80 && kodeCuaca <= 82)
    ) {
      return {
        icon: "rainy",
        iconColor: "#60A5FA",
        badgeShadowColor: "#3B82F6",
        gradient: ["#1E293B", "#1E3A8A", "#3B82F6"],
        glassColor: "rgba(30, 58, 138, 0.45)",
      };
    }

    // Salju (Kode 71-77, 85-86)
    if (
      (kodeCuaca >= 71 && kodeCuaca <= 77) ||
      (kodeCuaca >= 85 && kodeCuaca <= 86)
    ) {
      return {
        icon: "snow",
        iconColor: "#93C5FD",
        badgeShadowColor: "#60A5FA",
        gradient: ["#1E293B", "#475569", "#94A3B8"],
        glassColor: "rgba(30, 41, 59, 0.50)",
      };
    }

    // Badai Petir (Kode 95-99)
    if (kodeCuaca >= 95 && kodeCuaca <= 99) {
      return {
        icon: "thunderstorm",
        iconColor: "#FBBF24",
        badgeShadowColor: "#F59E0B",
        gradient: ["#0F172A", "#1E1B4B", "#312E81"],
        glassColor: "rgba(15, 23, 42, 0.60)",
      };
    }
  }

  // 2. Fallback jika hanya teks `kondisi` yang diberikan
  const teks = (kondisi ?? "").toLowerCase();
  if (teks.includes("petir") || teks.includes("badai")) {
    return {
      icon: "thunderstorm",
      iconColor: "#FBBF24",
      badgeShadowColor: "#F59E0B",
      gradient: ["#0F172A", "#1E1B4B", "#312E81"],
      glassColor: "rgba(15, 23, 42, 0.60)",
    };
  }
  if (teks.includes("hujan") || teks.includes("gerimis")) {
    return {
      icon: "rainy",
      iconColor: "#60A5FA",
      badgeShadowColor: "#3B82F6",
      gradient: ["#1E293B", "#1E3A8A", "#3B82F6"],
      glassColor: "rgba(30, 58, 138, 0.45)",
    };
  }
  if (
    teks.includes("mendung") ||
    teks.includes("awan") ||
    teks.includes("kabut")
  ) {
    return {
      icon: "cloudy",
      iconColor: "#94A3B8",
      badgeShadowColor: "#64748B",
      gradient: ["#334155", "#475569", "#64748B"],
      glassColor: "rgba(51, 65, 85, 0.48)",
    };
  }

  // 3. Default (Cerah)
  return {
    icon: "sunny",
    iconColor: "#F59E0B",
    badgeShadowColor: "#F59E0B",
    gradient: ["#0284C7", "#0EA5E9", "#7DD3FC"],
    glassColor: "rgba(2, 132, 199, 0.38)",
  };
}

// ─── Konstanta Ukuran Badge ───────────────────────────────────────────────────
const BADGE_SIZE = 92;

// ─── Komponen Utama ───────────────────────────────────────────────────────────
export default function WeatherCard({
  kota,
  suhu,
  tingkatAQI,
  indeksAQI,
  kodeCuaca,
  kondisi,
}: WeatherCardProps) {
  // Tentukan label kondisi cuaca fisik yang ditampilkan
  const labelKondisi =
    kondisi ||
    (kodeCuaca !== undefined ? labelKodeCuaca(kodeCuaca) : "Cerah");

  // Ambil palet visual berdasarkan kondisi cuaca riil (BUKAN tingkat polusi AQI)
  const visual = getWeatherVisual(kodeCuaca, labelKondisi);

  return (
    <View style={styles.outerWrapper}>

      {/* ── Badge Ikon Cuaca Melayang ─────────────────────────────────────── */}
      <View style={styles.badgeAnchor}>
        <View
          style={[
            styles.badgeOuter,
            {
              shadowColor: visual.badgeShadowColor,
            },
          ]}
        >
          <LinearGradient
            colors={["#FFFFFF", "#EFF6FF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.badgeInner}
          >
            <Ionicons name={visual.icon} size={50} color={visual.iconColor} />
          </LinearGradient>
        </View>
      </View>

      {/* ── Badan Kartu Bergradasi ────────────────────────────────────────── */}
      <LinearGradient
        colors={visual.gradient}
        start={{ x: 0.0, y: 0.0 }}
        end={{ x: 1.0, y: 1.0 }}
        accessible={true}
        accessibilityLabel={`Cuaca di ${kota}, kondisi ${labelKondisi}, suhu ${suhu} derajat Celcius, kualitas udara ${tingkatAQI}`}
        style={styles.card}
      >
        {/* Dekorasi Lingkaran Transparan (Kanan Atas) */}
        <View style={styles.decorLarge} />
        <View style={styles.decorMedium} />
        <View style={styles.decorSmall} />

        {/* Watermark Suhu Besar di Kanan Belakang */}
        <Text
          style={styles.suhuWatermark}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {suhu}°
        </Text>

        {/* ── Kotak Info Glassmorphism ──────────────────────────────────── */}
        <View
          style={[
            styles.glassBox,
            {
              backgroundColor: visual.glassColor,
            },
          ]}
        >
          {/* Label "SAAT INI" */}
          <Text style={styles.glassLabel}>SAAT INI</Text>

          {/* Kondisi Cuaca Fisik (Misal: "Mendung", "Cerah Berawan", "Hujan") */}
          <Text style={styles.glassCondition}>{labelKondisi}</Text>

          {/* Suhu */}
          <View style={styles.tempRow}>
            <Text style={styles.tempNumber}>{suhu}</Text>
            <Text style={styles.tempUnit}>°C</Text>
          </View>

          {/* Nama Kota dengan Ikon Pin */}
          <View style={styles.kotaRow}>
            <Ionicons name="location-sharp" size={13} color="#94A3B8" />
            <Text style={styles.kotaText} numberOfLines={1}>
              {kota}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── Indikator AQI Tetap Muncul di Bawah Kartu ────────────────────── */}
      <IndikatorAQI
        kota={kota}
        tingkat={tingkatAQI}
        indeksAQI={indeksAQI ?? 0}
      />

    </View>
  );
}

// ─── StyleSheet ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  outerWrapper: {
    gap: 10,
    paddingTop: BADGE_SIZE / 2,
  },

  badgeAnchor: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    alignItems: "center",
  },
  badgeOuter: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 12,
  },
  badgeInner: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    borderRadius: 26,
    overflow: "hidden",
    minHeight: 230,
    padding: 20,
    paddingTop: BADGE_SIZE / 2 + 12,
    justifyContent: "flex-end",
  },

  decorLarge: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    top: -70,
    right: -60,
  },
  decorMedium: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    top: 30,
    right: 60,
  },
  decorSmall: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    top: 10,
    right: 180,
  },

  suhuWatermark: {
    position: "absolute",
    right: -12,
    bottom: -32,
    fontSize: 170,
    fontWeight: "900",
    color: "rgba(255, 255, 255, 0.05)",
    letterSpacing: -10,
    includeFontPadding: false,
  },

  glassBox: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    gap: 1,
    shadowColor: "rgba(255, 255, 255, 0.1)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  glassLabel: {
    color: "rgba(203, 213, 225, 0.8)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  glassCondition: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  tempRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 0,
  },
  tempNumber: {
    color: "#FFFFFF",
    fontSize: 58,
    fontWeight: "800",
    lineHeight: 64,
    letterSpacing: -3,
    includeFontPadding: false,
  },
  tempUnit: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 22,
    fontWeight: "500",
    marginTop: 12,
    marginLeft: 2,
  },
  kotaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  kotaText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
    flexShrink: 1,
  },
});