import { View, Text } from 'react-native';

interface RiwayatListProps {
    daftarKota: string[];
}

export default function RiwayatList({ daftarKota }: RiwayatListProps) {

    return (
        <View style={{ marginTop: 12, padding: 12, backgroundColor: "#f0f0f0", borderRadius: 8 }}>
            <Text style={{ fontWeight: "bold", fontSize: 14, marginBottom: 8, color: "#333" }}>
                Riwayat Pencarian:
            </Text>
            {daftarKota.map((item, index) => (
                <Text key={index} style={{ color: "#555", fontSize: 13, marginVertical: 2 }}>
                    • {item}
                </Text>
            ))}
        </View>
    );
}