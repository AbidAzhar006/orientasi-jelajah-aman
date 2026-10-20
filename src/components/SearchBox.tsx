// src/components/SearchBox.tsx
import { useState } from "react";
import { View, TextInput } from "react-native";
import { useTheme } from "../hooks/use-theme";

interface SearchBoxProps {
  onCari: (kataKunci: string) => void;
}

export default function SearchBox({ onCari }: SearchBoxProps) {
  const [teks, setTeks] = useState("");
  const colors = useTheme();

  function ubahTeks(nilai: string) {
    setTeks(nilai);
    onCari(nilai);
  }

  return (
    <View>
      <TextInput
        value={teks}
        onChangeText={ubahTeks}
        placeholder="Cari nama kota..."
        placeholderTextColor={colors.textSecondary}
        accessibilityLabel="Kolom pencarian kota"
        style={{
          borderWidth: 1,
          borderColor: colors.textSecondary,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 8,
          backgroundColor: colors.backgroundElement,
          color: colors.text,
        }}
      />
    </View>
  );
}