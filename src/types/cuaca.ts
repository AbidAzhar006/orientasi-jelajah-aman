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
    indeksAQI?: number; // Diubah opsional agar tidak error jika tidak dipanggil
}

// Latihan Mandiri - Pertemuan 2
export interface LaporanCuaca {
    kota: string;
    indeksAQI: number;
    tingkat: "Baik" | "Sedang" | "Tidak_Sehat" | "Berbahaya";
    diperbaruiPada?: string;
}