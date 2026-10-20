// src/types/cuaca.ts
export interface DataCuaca {
  kota: string;
  suhu: number;
  kelembapan: number;
  catatan?: string;
}

export type TingkatAQI = 'Baik' | 'Sedang' | 'Tidak Sehat' | 'Berbahaya';

export interface WeatherCardProps {
  kota: string;
  suhu: number;
  tingkatAQI: TingkatAQI;
  indeksAQI?: number;
  kodeCuaca?: number; // Kode WMO cuaca fisik (misal: 0, 1, 3, 61, 95)
  kondisi?: string;   // Label kondisi cuaca fisik (misal: "Mendung", "Cerah")
}

// Latihan Mandiri - Pertemuan 2
export interface LaporanCuaca {
  kota: string;
  indeksAQI: number;
  tingkat: TingkatAQI;
  diperbaruiPada?: string;
}