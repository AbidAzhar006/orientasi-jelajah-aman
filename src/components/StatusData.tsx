// src/components/StatusData.tsx
import { View, Text } from "react-native";
import { SumberData } from "../types/cache";
import { useTheme } from "../hooks/use-theme";

interface StatusDataProps {
  sumber: SumberData;
  disimpanPada: number;
}

export default function StatusData({ sumber, disimpanPada }: StatusDataProps) {
  const colors = useTheme();
  const waktu = new Date(disimpanPada).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const basi = sumber === "cache-basi"; // ← DIPERBAIKI: dulu "cache_basi" (underscore)
  const labelSumber =
    sumber === "jaringan"
      ? "Data langsung dari internet"
      : basi
      ? "Data tersimpan (offline / perlu diperbarui)"
      : "Data tersimpan di perangkat";

  return (
    <View
      accessible={true}
      accessibilityLabel={`${labelSumber}, diperbarui pukul ${waktu}`}
      style={{
        padding: 10,
        borderRadius: 8,
        backgroundColor: colors.backgroundSelected,
        borderWidth: 1,
        borderColor: basi ? "#F59E0B" : "#10B981",
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text }}>
        {labelSumber}
      </Text>
      <Text style={{ fontSize: 11, color: colors.textSecondary }}>
        Diperbarui: {waktu}
      </Text>
    </View>
  );
}