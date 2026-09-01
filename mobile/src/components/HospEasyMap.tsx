import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    Coordenada,
} from "../utils/location";

import { Unidade } from "../types/Unidade";
import { colors } from "../theme/colors";


type Props = {

    unidades: Unidade[];

    localizacaoUsuario?:
        Coordenada | null;

    onSelecionarUnidade: (
        unidade: Unidade
    ) => void;
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
            return colors.offline;
        }

        if (
            unidade.percentualOcupacao >= 80
        ) {
            return colors.danger;
        }

        if (
            unidade.percentualOcupacao >= 50
        ) {
            return colors.warning;
        }

        return colors.primary;
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

        return `${unidade.percentualOcupacao.toFixed(
            0
        )}%`;
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
                style={
                    styles.streetHorizontal
                }
            />

            <View
                style={
                    styles.streetVertical
                }
            />

            {unidades.map(
                (unidade, index) => {
                    const posicao =
                        posicoes[
                        index %
                        posicoes.length
                            ];

                    return (
                        <View
                            key={
                                unidade.unidadeId
                            }
                            style={[
                                styles.markerWrapper,
                                {
                                    top:
                                    posicao.top,
                                    left:
                                    posicao.left,
                                },
                            ]}
                        >
                            <Pressable
                                style={[
                                    styles.marker,
                                    {
                                        backgroundColor:
                                            corMarcador(
                                                unidade
                                            ),
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
                                style={
                                    styles.markerLabel
                                }
                            >
                                <Text
                                    style={
                                        styles.markerName
                                    }
                                    numberOfLines={1}
                                >
                                    {unidade.nome}
                                </Text>

                                <Text
                                    style={
                                        styles.markerStatus
                                    }
                                >
                                    {
                                        textoStatus(
                                            unidade
                                        )
                                    }
                                </Text>
                            </View>
                        </View>
                    );
                }
            )}

            <View
                style={styles.legend}
            >
                <Legend
                    color={colors.primary}
                    texto="Baixa"
                />

                <Legend
                    color={colors.warning}
                    texto="Moderada"
                />

                <Legend
                    color={colors.danger}
                    texto="Alta"
                />

                <Legend
                    color={colors.offline}
                    texto="Sem dados atuais"
                />
            </View>
        </View>
    );
}


function Legend({
                    color,
                    texto,
                }: {
    color: string;
    texto: string;
}) {
    return (
        <View
            style={
                styles.legendItem
            }
        >
            <View
                style={[
                    styles.legendDot,
                    {
                        backgroundColor:
                        color,
                    },
                ]}
            />

            <Text
                style={
                    styles.legendText
                }
            >
                {texto}
            </Text>
        </View>
    );
}


const styles =
    StyleSheet.create({
        map: {
            flex: 1,

            backgroundColor:
                "#E7ECE5",

            overflow:
                "hidden",
        },

        mapText: {
            position:
                "absolute",

            top: 48,

            alignSelf:
                "center",

            fontSize: 14,
            fontWeight:
                "700",

            color:
            colors.textSecondary,
        },

        streetHorizontal: {
            position:
                "absolute",

            top: "43%",
            left: "-10%",

            width: "120%",
            height: 58,

            backgroundColor:
                "#FFFFFF",

            transform: [
                {
                    rotate:
                        "-8deg",
                },
            ],
        },

        streetVertical: {
            position:
                "absolute",

            top: "-10%",
            left: "49%",

            width: 52,
            height: "120%",

            backgroundColor:
                "#FFFFFF",

            transform: [
                {
                    rotate:
                        "10deg",
                },
            ],
        },

        markerWrapper: {
            position:
                "absolute",

            alignItems:
                "center",
        },

        marker: {
            width: 38,
            height: 38,

            borderRadius:
                19,

            borderWidth: 4,

            borderColor:
                "#FFFFFF",

            alignItems:
                "center",

            justifyContent:
                "center",

            elevation: 6,
        },

        markerCenter: {
            width: 9,
            height: 9,

            borderRadius: 5,

            backgroundColor:
                "#FFFFFF",
        },

        markerLabel: {
            minWidth: 90,
            maxWidth: 130,

            marginTop: 6,

            paddingHorizontal:
                8,

            paddingVertical: 5,

            borderRadius: 10,

            backgroundColor:
            colors.surface,

            alignItems:
                "center",
        },

        markerName: {
            maxWidth: 110,

            fontSize: 11,
            fontWeight:
                "800",

            color:
            colors.text,
        },

        markerStatus: {
            marginTop: 2,

            fontSize: 10,
            fontWeight:
                "600",

            color:
            colors.textSecondary,
        },

        legend: {
            position:
                "absolute",

            top: 80,
            left: 16,

            padding: 10,

            borderRadius: 14,

            backgroundColor:
                "rgba(255,255,255,0.94)",
        },

        legendItem: {
            flexDirection:
                "row",

            alignItems:
                "center",

            marginVertical:
                2,
        },

        legendDot: {
            width: 9,
            height: 9,

            borderRadius: 5,

            marginRight: 7,
        },

        legendText: {
            fontSize: 10,

            color:
            colors.textSecondary,
        },
    });