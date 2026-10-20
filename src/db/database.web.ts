// src/db/database.web.ts

const VERSI_DATABASE = 2; // Menyesuaikan versi database pada HP

// Interface untuk memastikan tipe data generik <T> di cacheRepository tetap selaras
export interface MockDatabase {
  getFirstAsync<T>(query: string, params?: any[]): Promise<T | null>;
  getAllAsync<T>(query: string, params?: any[]): Promise<T[]>;
  runAsync(query: string, params?: any[]): Promise<any>;
  execAsync(query: string): Promise<any>;
}

// Simulasi database di memori/browser agar berjalan mulus tanpa error native worker
const mockDb: MockDatabase = {
  getFirstAsync: async <T>(query: string, params?: any[]): Promise<T | null> => {
    // Jika query mengecek versi database, kembalikan versi 2
    if (query.includes("user_version")) {
      return { user_version: VERSI_DATABASE } as unknown as T;
    }
    return null;
  },
  getAllAsync: async <T>(query: string, params?: any[]): Promise<T[]> => {
    // Mengembalikan array kosong untuk daftar cache di web
    return [] as T[];
  },
  runAsync: async (query: string, params?: any[]): Promise<any> => {
    // Simulasi eksekusi perintah tulis/ubah data
    return Promise.resolve();
  },
  execAsync: async (query: string): Promise<any> => {
    // Simulasi eksekusi perintah tabel
    return Promise.resolve();
  },
};

// Fungsi satu pintu yang dipanggil oleh cacheRepository
export function ambilDatabase(): Promise<MockDatabase> {
  return Promise.resolve(mockDb);
}