export interface DataCuaca{
    kota: string;
    suhu: number;
    kelembapan: number;
    catatan?: string;
}

export type TingkatAQI = 'Baik' | 'Sedang' | 'Tidak Sehat' | 'Berbahaya';

export interface WeatherCardProps{
    kota: string;
    suhu: number;
    tingkatAQI: TingkatAQI;
}

// Latihan Mandiri - Pertemuan 2
export interface LaporanCuaca {
    kota: string;
    indeksAQI: number;
    tingkat: "Baik" | "Sedang" | "Tidak_Sehat" | "Berbahaya";
    diperbaruiPada?: string;
}