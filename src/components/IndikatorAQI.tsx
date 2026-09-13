// src/components/IndikatorAQI.tsx
import { View, Text } from "react-native";
import { LaporanCuaca } from "../types/cuaca"; // 1. Ubah ke LaporanCuaca

export default function IndikatorAQI({
  kota,
  indeksAQI,
  tingkat,
  diperbaruiPada,
}: LaporanCuaca) {
  // 2. Sesuaikan string case dengan yang ada di cuaca.ts
  const getWarna = () => {
    switch (tingkat) {
      case "Baik":
        return "#4CAF50"; // Hijau
      case "Sedang":
        return "#FFC107"; // Kuning
      case "Tidak_Sehat":
        return "#FF9800"; // Oranye
      case "Berbahaya":
        return "#F44336"; // Merah
      default:
        return "#777";
    }
  };

  return (
    <View
      style={{
        padding: 12,
        borderRadius: 8,
        backgroundColor: getWarna(),
        marginTop: 8,
      }}
    >
      <Text style={{ color: "#FFF", fontWeight: "bold", fontSize: 16 }}>
        Kualitas Udara {kota}: {tingkat} ({indeksAQI})
      </Text>
      {diperbaruiPada && (
        <Text style={{ color: "#FFF", fontSize: 12, marginTop: 4 }}>
          Diperbarui: {diperbaruiPada}
        </Text>
      )}
    </View>
  );
}