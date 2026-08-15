import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    NativeStackScreenProps,
} from "@react-navigation/native-stack";

import {
    RootStackParamList,
} from "../navigation/AppNavigator";


type Props =
    NativeStackScreenProps<
        RootStackParamList,
        "Unit"
    >;


export default function UnitScreen({
                                       route,
                                       navigation,
                                   }: Props) {

    const { unidade } =
        route.params;


    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={
                    styles.content
                }
            >

                <Pressable
                    style={styles.backButton}
                    onPress={() =>
                        navigation.goBack()
                    }
                >
                    <Text style={styles.backText}>
                        ←
                    </Text>
                </Pressable>


                <Text style={styles.title}>
                    {unidade.nome}
                </Text>


                <Text style={styles.subtitle}>
                    Situação atual da unidade
                </Text>


                <View style={styles.mainCard}>
                    <Text style={styles.label}>
                        Ocupação atual
                    </Text>

                    <Text style={styles.percentage}>
                        {unidade.percentualOcupacao.toFixed(1)}%
                    </Text>

                    <Text style={styles.people}>
                        {unidade.ocupacaoAtual} pessoas
                    </Text>

                    <Text style={styles.status}>
                        {unidade.nivelOcupacao}
                    </Text>
                </View>


                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Fluxo
                    </Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>
                            Tendência
                        </Text>

                        <Text style={styles.infoValue}>
                            {unidade.tendencia}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>
                            Ritmo
                        </Text>

                        <Text style={styles.infoValue}>
                            {unidade.ritmoOcupacao}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>
                            Média nos últimos 30 min
                        </Text>

                        <Text style={styles.infoValue}>
                            {unidade.mediaUltimos30Minutos.toFixed(
                                1
                            )}
                        </Text>
                    </View>
                </View>


                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                        Monitoramento
                    </Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>
                            Câmera
                        </Text>

                        <Text style={styles.infoValue}>
                            {unidade.statusCamera}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>
                            Medição
                        </Text>

                        <Text style={styles.infoValue}>
                            {unidade.statusMedicao}
                        </Text>
                    </View>
                </View>


                <Pressable
                    style={styles.reviewButton}
                    onPress={() => {
                        console.log(
                            "Avaliar unidade:",
                            unidade.unidadeId
                        );
                    }}
                >
                    <Text style={styles.reviewText}>
                        AVALIAR
                    </Text>
                </Pressable>

            </ScrollView>
        </View>
    );
}


const styles =
    StyleSheet.create({
        container: {
            flex: 1,

            backgroundColor:
                "#F4F4F4",
        },

        content: {
            padding: 20,
            paddingTop: 28,

            paddingBottom: 50,
        },

        backButton: {
            width: 42,
            height: 42,

            borderRadius: 21,

            backgroundColor:
                "#FFFFFF",

            alignItems: "center",
            justifyContent: "center",

            marginBottom: 20,
        },

        backText: {
            fontSize: 24,
        },

        title: {
            fontSize: 28,
            fontWeight: "800",

            color: "#111111",
        },

        subtitle: {
            marginTop: 5,

            fontSize: 14,

            color: "#777777",
        },

        mainCard: {
            marginTop: 25,

            backgroundColor:
                "#FFFFFF",

            borderRadius: 24,

            padding: 24,
        },

        label: {
            fontSize: 14,

            color: "#777777",
        },

        percentage: {
            marginTop: 8,

            fontSize: 42,
            fontWeight: "800",

            color: "#111111",
        },

        people: {
            marginTop: 4,

            fontSize: 15,

            color: "#555555",
        },

        status: {
            marginTop: 16,

            alignSelf: "flex-start",

            backgroundColor:
                "#EEEEEE",

            paddingHorizontal: 12,
            paddingVertical: 6,

            borderRadius: 12,

            fontWeight: "700",
        },

        section: {
            marginTop: 16,

            backgroundColor:
                "#FFFFFF",

            borderRadius: 20,

            padding: 18,
        },

        sectionTitle: {
            fontSize: 17,
            fontWeight: "800",

            marginBottom: 10,
        },

        infoRow: {
            flexDirection: "row",
            justifyContent:
                "space-between",

            paddingVertical: 8,
        },

        infoLabel: {
            fontSize: 14,

            color: "#666666",
        },

        infoValue: {
            fontSize: 14,
            fontWeight: "700",

            maxWidth: "50%",

            textAlign: "right",
        },

        reviewButton: {
            marginTop: 22,

            backgroundColor:
                "#111111",

            height: 54,

            borderRadius: 16,

            alignItems: "center",
            justifyContent: "center",
        },

        reviewText: {
            color: "#FFFFFF",

            fontSize: 15,
            fontWeight: "800",
        },
    });