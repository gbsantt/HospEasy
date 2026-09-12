import {
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { colors } from "../theme/colors";


type Props = {
    nome: string;
    percentual: number;
    tendencia: string;
    nivelOcupacao: string;
    statusCamera: string;
    statusMedicao?: string;

    onPress: () => void;
    onClose: () => void;
};


export default function UnitMapCard({
                                        nome,
                                        percentual,
                                        tendencia,
                                        nivelOcupacao,
                                        statusCamera,
                                        statusMedicao,
                                        onPress,
                                        onClose,
                                    }: Props) {
    return (
        <View style={[styles.card, Platform.OS === "web" && styles.webCard]}>
            <Pressable
                style={styles.closeButton}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Fechar detalhes da unidade"
            >
                <Text style={styles.closeText}>
                    ×
                </Text>
            </Pressable>

            <Text style={styles.nome}>
                {nome}
            </Text>

            <Text style={styles.info}>
                {statusCamera !== "ONLINE" || statusMedicao !== "ATUALIZADA"
                    ? "Ocupação: sem dados atuais" : `Ocupação: ${percentual.toFixed(1)}%`}
            </Text>

            <Text style={styles.info}>
                Nível: {statusCamera === "ONLINE" && statusMedicao === "ATUALIZADA" ? nivelOcupacao : "Indisponível"}
            </Text>

            <Text style={styles.info}>
                Movimento: {statusCamera === "ONLINE" && statusMedicao === "ATUALIZADA" ? tendencia : "Indisponível"}
            </Text>

            <Text style={styles.atualizacao}>
                Câmera: {statusCamera}
            </Text>

            <Pressable
                style={styles.button}
                onPress={onPress}
            >
                <Text style={styles.buttonText}>
                    Ver detalhes
                </Text>
            </Pressable>
        </View>
    );
}


const styles = StyleSheet.create({
    webCard: { bottom: 34, maxWidth: 380, maxHeight: "90%", overflow: "scroll" },
    card: {
        position: "absolute",

        left: 20,
        right: 20,
        bottom: 100,

        padding: 18,
        paddingTop: 20,

        borderRadius: 22,

        backgroundColor: colors.surface,

        shadowColor: "#000000",
        shadowOpacity: 0.15,
        shadowRadius: 12,

        shadowOffset: {
            width: 0,
            height: 4,
        },

        elevation: 6,

        zIndex: 20,
    },

    closeButton: {
        position: "absolute",

        top: 8,
        right: 14,

        width: 32,
        height: 32,

        alignItems: "center",
        justifyContent: "center",

        zIndex: 30,
    },

    closeText: {
        fontSize: 26,
        fontWeight: "500",

        color: colors.textSecondary,
    },

    nome: {
        paddingRight: 30,

        marginBottom: 8,

        fontSize: 19,
        fontWeight: "800",

        color: colors.text,
    },

    info: {
        marginBottom: 3,

        fontSize: 14,

        color: colors.textSecondary,
    },

    atualizacao: {
        marginTop: 5,

        fontSize: 12,

        color: colors.textSecondary,

        opacity: 0.7,
    },

    button: {
        marginTop: 15,

        paddingVertical: 12,

        borderRadius: 14,

        backgroundColor: colors.primary,

        alignItems: "center",
    },

    buttonText: {
        color: "#FFFFFF",

        fontWeight: "800",
    },
});
