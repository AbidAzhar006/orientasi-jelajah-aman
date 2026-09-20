import { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';

interface SearchBoxProps {
    onCari: (kota: string) => void;
}

export default function SearchBox({ onCari }: SearchBoxProps) {
    const [kota, setKota] = useState('');

    return (
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <TextInput
                placeholder="Masukkan nama kota"
                value={kota}
                onChangeText={setKota}
                style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: "#fff",
                }}
            />
            <Button
                title="Cari"
                onPress={() => onCari(kota)}
                accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
            />
        </View>
    )
}