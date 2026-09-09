import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

export default function MapBrand() {
    return (
        <View style={styles.brand} accessibilityLabel="HospEasy — mapa de unidades de saúde">
            <View style={styles.symbol} accessibilityElementsHidden>
                <Text style={styles.letter}>H</Text>
            </View>
            <View>
                <Text style={styles.name}>HOSP<Text style={styles.accent}>EASY</Text></Text>
                <Text style={styles.description}>Unidades de saúde</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    brand: { flexDirection: "row", alignItems: "center", gap: 10 },
    symbol: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
    letter: { color: "#fff", fontSize: 25, fontWeight: "900" },
    name: { color: colors.primaryDark, fontSize: 22, fontWeight: "900", letterSpacing: -0.8 },
    accent: { fontWeight: "400" },
    description: { color: colors.textSecondary, fontSize: 12 },
});
