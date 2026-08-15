import { StyleSheet, Text, View } from "react-native";

export default function SplashScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.logo}>
                HOSP<Text style={styles.logoAccent}>EASY</Text>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#B7BFC0",
        alignItems: "center",
        justifyContent: "center",
    },

    logo: {
        fontSize: 30,
        fontWeight: "800",
        color: "#111111",
        letterSpacing: -1,
    },

    logoAccent: {
        fontWeight: "400",
    },
});