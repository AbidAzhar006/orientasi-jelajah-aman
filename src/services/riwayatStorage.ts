// src/services/riwayatStorage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const RIWAYAT_KEY = "@jelajah_aman:riwayat_pencarian";

export async function ambilRiwayatPencarian(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(RIWAYAT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function tambahRiwayatPencarian(namaKota: string): Promise<void> {
  const bersih = namaKota.trim();
  if (!bersih) return;

  try {
    const lama = await ambilRiwayatPencarian();
    const tanpaDuplikat = lama.filter(
      (item) => item.toLowerCase() !== bersih.toLowerCase()
    );
    // Batasi maksimal 10 pencarian terakhir sesuai ketentuan UTS
    const baru = [bersih, ...tanpaDuplikat].slice(0, 10);
    await AsyncStorage.setItem(RIWAYAT_KEY, JSON.stringify(baru));
  } catch {
    // Abaikan jika gagal menulis storage
  }
}