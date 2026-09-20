import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { typeScale, spacing } from "../../constants/styles";

export default function TabTentang() {
  return (
    <SafeAreaView style={{ flex: 1, padding: spacing.sedang }}>
      <Text 
        style={{ fontSize: typeScale.judul, fontWeight: "bold", marginBottom: spacing.kecil }}
        accessibilityLabel="Halaman Tentang Aplikasi Jelajah Aman"
      >
        Jelajah Aman
      </Text>
      <Text style={{ fontSize: typeScale.isi }}>Versi 1.0.0</Text>
      <Text style={{ fontSize: typeScale.isi, marginTop: spacing.sedang }}>
        Dibuat oleh: Muhammad Abid Azhar
      </Text>
    </SafeAreaView>
  );
}