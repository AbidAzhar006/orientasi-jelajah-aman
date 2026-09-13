import { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

interface SearchBoxProps {
    onCari: (kota: string) => void;
}

export default function SearchBox({ onCari }: SearchBoxProps) {
    const [kota, setKota] = useState('');

    return (
        <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput
                placeholder="Masukkan nama kota"
                value={kota}
                onChangeText={setKota}
            />
            <Button title="Cari" onPress={() => onCari(kota)} />
        </View>
    )
}