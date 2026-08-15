import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { Unidade } from "../types/Unidade";


type Props = {
    unidades: Unidade[];
    onSelecionarUnidade: (unidade: Unidade) => void;
};


export default function HospEasyMap({
                                        unidades,
                                        onSelecionarUnidade,
                                    }: Props) {

    function corMarcador(
        unidade: Unidade
    ) {
        if (
            unidade.statusCamera === "OFFLINE" ||
            unidade.statusCamera === "DESATIVADA" ||
            unidade.statusMedicao !== "ATUALIZADA"
        ) {
            return "#7A7A7A";
        }

        if (
            unidade.percentualOcupacao >= 80
        ) {
            return "#E74C5B";
        }

        if (
            unidade.percentualOcupacao >= 50
        ) {
            return "#F2BE4B";
        }

        return "#47C98B";
    }


    function textoStatus(
        unidade: Unidade
    ) {
        if (
            unidade.statusCamera === "OFFLINE"
        ) {
            return "Offline";
        }

        if (
            unidade.statusCamera === "DESATIVADA"
        ) {
            return "Indisponível";
        }

        if (
            unidade.statusMedicao !== "ATUALIZADA"
        ) {
            return "Desatualizado";
        }

        return `${unidade.percentualOcupacao.toFixed(0)}%`;
    }


    const posicoes = [
        {
            top: "30%",
            left: "25%",
        },
        {
            top: "48%",
            left: "65%",
        },
        {
            top: "65%",
            left: "38%",
        },
        {
            top: "24%",
            left: "70%",
        },
    ] as const;


    return (
        <View style={styles.map}>
            <Text style={styles.mapText}>
                MAPA — visualização web
            </Text>

            <View
                style={styles.streetHorizontal}
            />

            <View
                style={styles.streetVertical}
            />


            {unidades.map(
                (unidade, index) => {

                    const posicao =
                        posicoes[
                        index % posicoes.length
                            ];

                    return (
                        <View
                            key={unidade.unidadeId}
                            style={[
                                styles.markerWrapper,
                                {
                                    top: posicao.top,
                                    left: posicao.left,
                                },
                            ]}
                        >
                            <Pressable
                                style={[
                                    styles.marker,
                                    {
                                        backgroundColor:
                                            corMarcador(unidade),
                                    },
                                ]}
                                onPress={() =>
                                    onSelecionarUnidade(
                                        unidade
                                    )
                                }
                            >
                                <View
                                    style={
                                        styles.markerCenter
                                    }
                                />
                            </Pressable>

                            <View
                                style={styles.markerLabel}
                            >
                                <Text
                                    style={styles.markerName}
                                    numberOfLines={1}
                                >
                                    {unidade.nome}
                                </Text>

                                <Text
                                    style={styles.markerStatus}
                                >
                                    {textoStatus(unidade)}
                                </Text>
                            </View>
                        </View>
                    );
                }
            )}


            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View
                        style={[
                            styles.legendDot,
                            {
                                backgroundColor:
                                    "#47C98B",
                            },
                        ]}
                    />

                    <Text style={styles.legendText}>
                        Baixa
                    </Text>
                </View>

                <View style={styles.legendItem}>
                    <View
                        style={[
                            styles.legendDot,
                            {
                                backgroundColor:
                                    "#F2BE4B",
                            },
                        ]}
                    />

                    <Text style={styles.legendText}>
                        Moderada
                    </Text>
                </View>

                <View style={styles.legendItem}>
                    <View
                        style={[
                            styles.legendDot,
                            {
                                backgroundColor:
                                    "#E74C5B",
                            },
                        ]}
                    />

                    <Text style={styles.legendText}>
                        Alta
                    </Text>
                </View>

                <View style={styles.legendItem}>
                    <View
                        style={[
                            styles.legendDot,
                            {
                                backgroundColor:
                                    "#7A7A7A",
                            },
                        ]}
                    />

                    <Text style={styles.legendText}>
                        Sem dados atuais
                    </Text>
                </View>
            </View>
        </View>
    );
}


const styles = StyleSheet.create({
    map: {
        flex: 1,

        backgroundColor: "#DDE3E1",

        overflow: "hidden",
    },

    mapText: {
        position: "absolute",

        top: 48,

        alignSelf: "center",

        fontSize: 14,
        fontWeight: "700",

        color: "#707776",

        opacity: 0.7,
    },

    streetHorizontal: {
        position: "absolute",

        top: "43%",
        left: "-10%",

        width: "120%",
        height: 58,

        backgroundColor: "#F6F6F6",

        transform: [
            {
                rotate: "-8deg",
            },
        ],
    },

    streetVertical: {
        position: "absolute",

        top: "-10%",
        left: "49%",

        width: 52,
        height: "120%",

        backgroundColor: "#F6F6F6",

        transform: [
            {
                rotate: "10deg",
            },
        ],
    },

    markerWrapper: {
        position: "absolute",

        alignItems: "center",
    },

    marker: {
        width: 38,
        height: 38,

        borderRadius: 19,

        borderWidth: 4,
        borderColor: "#FFFFFF",

        alignItems: "center",
        justifyContent: "center",

        shadowColor: "#000000",
        shadowOpacity: 0.22,
        shadowRadius: 6,

        shadowOffset: {
            width: 0,
            height: 3,
        },

        elevation: 6,
    },

    markerCenter: {
        width: 9,
        height: 9,

        borderRadius: 5,

        backgroundColor: "#FFFFFF",
    },

    markerLabel: {
        marginTop: 6,

        minWidth: 90,
        maxWidth: 130,

        paddingHorizontal: 8,
        paddingVertical: 5,

        borderRadius: 10,

        backgroundColor: "#FFFFFF",

        alignItems: "center",

        shadowColor: "#000000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
    },

    markerName: {
        maxWidth: 110,

        fontSize: 11,
        fontWeight: "700",

        color: "#222222",
    },

    markerStatus: {
        marginTop: 2,

        fontSize: 10,
        fontWeight: "600",

        color: "#666666",
    },

    legend: {
        position: "absolute",

        top: 80,
        left: 16,

        padding: 10,

        borderRadius: 14,

        backgroundColor:
            "rgba(255,255,255,0.9)",
    },

    legendItem: {
        flexDirection: "row",
        alignItems: "center",

        marginVertical: 2,
    },

    legendDot: {
        width: 9,
        height: 9,

        borderRadius: 5,

        marginRight: 7,
    },

    legendText: {
        fontSize: 10,

        color: "#444444",
    },
});