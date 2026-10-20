// src/hooks/use-theme.ts
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export type ModeTema = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "@jelajah_aman:mode_tema";
let currentMode: ModeTema = "system";
let sudahDimuat = false;
const listeners = new Set<(mode: ModeTema) => void>();

export async function aturModeTema(mode: ModeTema) {
  currentMode = mode;
  listeners.forEach((listener) => listener(mode));

  try {
    await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Abaikan error storage
  }
}

export function useModeTema(): [ModeTema, (mode: ModeTema) => Promise<void>] {
  const [mode, setMode] = useState<ModeTema>(currentMode);

  useEffect(() => {
    if (!sudahDimuat) {
      sudahDimuat = true;
      AsyncStorage.getItem(THEME_STORAGE_KEY)
        .then((tersimpan) => {
          if (
            tersimpan === "light" ||
            tersimpan === "dark" ||
            tersimpan === "system"
          ) {
            currentMode = tersimpan;
            listeners.forEach((l) => l(tersimpan));
          }
        })
        .catch(() => {});
    }

    const listener = (modeBaru: ModeTema) => setMode(modeBaru);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return [mode, aturModeTema];
}

export function useTheme() {
  const systemScheme = useColorScheme();
  const [mode] = useModeTema();

  const resolvedScheme =
    mode === "system"
      ? systemScheme === "dark"
        ? "dark"
        : "light"
      : mode;

  return Colors[resolvedScheme];
}