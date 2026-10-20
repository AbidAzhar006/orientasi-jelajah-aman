// src/components/AtribusiCuaca.tsx
import { Text } from "react-native";
import { useTheme } from "../hooks/use-theme";

export default function AtribusiCuaca() {
  const colors = useTheme();

  return (
    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
      Sumber data cuaca & kualitas udara: Open-Meteo.com
    </Text>
  );
}