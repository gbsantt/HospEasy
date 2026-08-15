import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";


type Props = {
    nome: string;
    percentual: number;
    tendencia: string;
    nivelOcupacao: string;
    statusCamera: string;

    onPress: () => void;
    onClose: () => void;
};


export default function UnitMapCard({
                                        nome,
                                        percentual,
                                        tendencia,
                                        nivelOcupacao,
                                        statusCamera,
                                        onPress,
                                        onClose,
                                    }: Props) {

    return (
        <View style={styles.card}>

            <Pressable
                style={styles.closeButton}
                onPress={onClose}
            >
                <Text style={styles.closeText}>
                    ×
                </Text>
            </Pressable>


            <Text style={styles.nome}>
                {nome}
            </Text>


            <Text style={styles.info}>
                Ocupação: {percentual.toFixed(1)}%
            </Text>

            <Text style={styles.info}>
                Nível: {nivelOcupacao}
            </Text>

            <Text style={styles.info}>
                Movimento: {tendencia}
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
    card: {
        position: "absolute",

        left: 20,
        right: 20,
        bottom: 100,

        backgroundColor: "#FFFFFF",

        borderRadius: 20,

        padding: 18,
        paddingTop: 20,

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

        color: "#333333",
    },

    nome: {
        fontSize: 18,
        fontWeight: "700",

        marginBottom: 8,

        paddingRight: 30,
    },

    info: {
        fontSize: 14,

        marginBottom: 3,

        color: "#333333",
    },

    atualizacao: {
        fontSize: 12,

        opacity: 0.55,

        marginTop: 5,
    },

    button: {
        marginTop: 14,

        backgroundColor: "#111111",

        paddingVertical: 11,

        borderRadius: 12,

        alignItems: "center",
    },

    buttonText: {
        color: "#FFFFFF",

        fontWeight: "700",
    },
});