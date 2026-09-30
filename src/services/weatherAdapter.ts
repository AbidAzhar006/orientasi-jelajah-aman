// src/services/weatherAdapter.ts

import { TingkatAQI } from "../types/cuaca";

export function konversiTingkatAQI(indeksEropa: number): TingkatAQI {
  if (indeksEropa <= 20) return "Baik";
  if (indeksEropa <= 40) return "Sedang";
  if (indeksEropa <= 60) return "Tidak Sehat";
  return "Berbahaya";
}