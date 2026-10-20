// src/services/locationService.ts
import * as Location from "expo-location";

export type StatusIzinLokasi = "granted" | "denied" | "unavailable";

export interface InfoWilayah {
  nama: string;
  wilayah?: string;
  negara?: string;
}

export async function mintaIzinLokasi(): Promise<StatusIzinLokasi> {
  const layananAktif = await Location.hasServicesEnabledAsync();
  if (!layananAktif) {
    return "unavailable";
  }

  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === "granted" ? "granted" : "denied";
}

export async function ambilKoordinatSaatIni() {
  const lokasi = await Location.getCurrentPositionAsync({});
  return {
    latitude: lokasi.coords.latitude,
    longitude: lokasi.coords.longitude,
  };
}

// Reverse Geocoding: Mengubah koordinat (lat, lon) menjadi nama kota asli
export async function ambilNamaKotaDariKoordinat(
  latitude: number,
  longitude: number
): Promise<InfoWilayah | null> {
  // 1. Coba fitur native bawaan expo-location
  try {
    const hasil = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (hasil && hasil.length > 0) {
      const tempat = hasil[0];
      const nama =
        tempat.city ||
        tempat.subregion ||
        tempat.district ||
        tempat.region ||
        tempat.name;

      if (nama) {
        return {
          nama,
          wilayah: tempat.region ?? undefined,
          negara: tempat.country ?? undefined,
        };
      }
    }
  } catch {
    // Abaikan jika native geocoder gagal atau dijalankan di browser web
  }

  // 2. Fallback via API Reverse Geocoding client gratis (Bahasa Indonesia, no API key)
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=id`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const nama = data.city || data.locality || data.principalSubdivision;
      if (nama) {
        return {
          nama,
          wilayah: data.principalSubdivision ?? undefined,
          negara: data.countryName ?? undefined,
        };
      }
    }
  } catch {
    // Abaikan
  }

  return null;
}