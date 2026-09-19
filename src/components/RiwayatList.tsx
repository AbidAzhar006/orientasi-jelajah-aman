// components/RiwayatList.tsx (diperbarui)
import { View, Text } from "react-native";
import { Link } from "expo-router";

interface RiwayatListProps {
    daftarKota: string[];
}

export default function RiwayatList({ daftarKota }: RiwayatListProps) {
    return (
        <View>
            {daftarKota.map((kota) => (
                <Link key={kota} href={`/detail/${kota}` as any}>
                    <Text>{kota}</Text>
                </Link>
            ))}
        </View>
    );
}