// src/components/IndikatorAQI.tsx
import { View, Text } from "react-native";
import { LaporanCuaca } from "../types/cuaca"; // Ubah ke LaporanCuaca

export default function IndikatorAQI({
  kota,
  indeksAQI,
  tingkat,
  diperbaruiPada,
}: LaporanCuaca) {
  // Sesuaikan string case dengan yang ada di cuaca.ts
  const getWarna = () => {
    switch (tingkat) {
      case "Baik":
        return "#4CAF50"; 
      case "Sedang":
        return "#FFC107"; 
      case "Tidak_Sehat":
        return "#FF9800"; 
      case "Berbahaya":
        return "#F44336"; 
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