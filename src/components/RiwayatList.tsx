import { View, Text } from 'react-native';

interface RiwayatListProps {
    daftarKota: string[];
}

export default function RiwayatList({ daftarKota }: RiwayatListProps) {

    return (
        <View>
            {daftarKota.map((kota, index) => (
                <Text key={index}>{kota}</Text>
            ))}
        </View>
    );
}