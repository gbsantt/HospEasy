import {
    StyleSheet,
    Text,
    View,
} from "react-native";

import { colors } from "../theme/colors";


export default function SplashScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.logo}>
                HOSP
                <Text style={styles.logoAccent}>
                    EASY
                </Text>
            </Text>

            <View style={styles.detail} />
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,

        backgroundColor: colors.primary,

        alignItems: "center",
        justifyContent: "center",
    },

    logo: {
        fontSize: 34,
        fontWeight: "900",

        letterSpacing: -1,

        color: "#FFFFFF",
    },

    logoAccent: {
        fontWeight: "400",
    },

    detail: {
        width: 36,
        height: 4,

        marginTop: 12,

        borderRadius: 10,

        backgroundColor: "#FFFFFF",

        opacity: 0.65,
    },
});