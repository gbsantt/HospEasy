import {
    useMemo,
    useState,
} from "react";

import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    Gesture,
    GestureDetector,
} from "react-native-gesture-handler";

import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

import {
    BlurView,
} from "expo-blur";

import {
    Unidade,
} from "../types/Unidade";

import {
    colors,
} from "../theme/colors";


const ALTURA_FECHADA = 82;
const ALTURA_ABERTA = 400;


type Props = {
    unidades: Unidade[];

    onAbrirUnidade: (
        unidade: Unidade
    ) => void;
};


export default function DynamicIsland({
                                          unidades,
                                          onAbrirUnidade,
                                      }: Props) {
    const [
        aberta,
        setAberta,
    ] = useState(false);

    const [
        busca,
        setBusca,
    ] = useState("");

    const altura =
        useSharedValue(
            ALTURA_FECHADA
        );


    const unidadesFiltradas =
        useMemo(() => {
            const texto =
                busca
                    .trim()
                    .toLowerCase();

            if (!texto) {
                return unidades;
            }

            return unidades.filter(
                (unidade) =>
                    unidade.nome
                        .toLowerCase()
                        .includes(texto)
            );
        }, [
            busca,
            unidades,
        ]);


    function abrir() {
        setAberta(true);

        altura.value =
            withSpring(
                ALTURA_ABERTA,
                {
                    damping: 18,
                    stiffness: 150,
                }
            );
    }


    function fechar() {
        altura.value =
            withSpring(
                ALTURA_FECHADA,
                {
                    damping: 18,
                    stiffness: 150,
                }
            );

        setAberta(false);
    }


    function alternar() {
        aberta
            ? fechar()
            : abrir();
    }


    function abrirUnidade(
        unidade: Unidade
    ) {
        setBusca("");

        fechar();

        onAbrirUnidade(
            unidade
        );
    }


    const gesto =
        Gesture.Pan()
            .onUpdate(
                (evento) => {
                    const base =
                        aberta
                            ? ALTURA_ABERTA
                            : ALTURA_FECHADA;

                    let novaAltura =
                        base -
                        evento.translationY;

                    novaAltura =
                        Math.max(
                            ALTURA_FECHADA,
                            Math.min(
                                novaAltura,
                                ALTURA_ABERTA
                            )
                        );

                    altura.value =
                        novaAltura;
                }
            )

            .onEnd(
                (evento) => {
                    if (
                        evento.translationY <
                        -50
                    ) {
                        altura.value =
                            withSpring(
                                ALTURA_ABERTA
                            );

                        runOnJS(
                            setAberta
                        )(true);

                        return;
                    }

                    if (
                        evento.translationY >
                        50
                    ) {
                        altura.value =
                            withSpring(
                                ALTURA_FECHADA
                            );

                        runOnJS(
                            setAberta
                        )(false);

                        return;
                    }

                    altura.value =
                        withSpring(
                            aberta
                                ? ALTURA_ABERTA
                                : ALTURA_FECHADA
                        );
                }
            );


    const estiloAnimado =
        useAnimatedStyle(
            () => ({
                height:
                altura.value,
            })
        );


    return (
        <GestureDetector
            gesture={gesto}
        >
            <Animated.View
                style={[
                    styles.container,
                    estiloAnimado,
                ]}
            >

                <BlurView
                    intensity={
                        aberta
                            ? 55
                            : 42
                    }
                    tint="light"
                    style={
                        StyleSheet.absoluteFill
                    }
                />


                <View
                    pointerEvents="none"
                    style={[
                        StyleSheet.absoluteFill,

                        {
                            backgroundColor:
                                aberta
                                    ? colors.glassGreen
                                    : colors.glassLight,
                        },
                    ]}
                />


                <Pressable
                    style={
                        styles.handleArea
                    }
                    onPress={
                        alternar
                    }
                >
                    <View
                        style={[
                            styles.handle,

                            aberta
                                ? styles.handleOpen
                                : styles.handleClosed,
                        ]}
                    />
                </Pressable>


                {aberta ? (
                    <>
                        <View
                            style={
                                styles.searchBarOpen
                            }
                        >
                            <Text
                                style={
                                    styles.searchIcon
                                }
                            >
                                ⌕
                            </Text>

                            <TextInput
                                value={
                                    busca
                                }

                                onChangeText={
                                    setBusca
                                }

                                placeholder="Procurar"

                                placeholderTextColor={
                                    "#666666"
                                }

                                style={
                                    styles.input
                                }
                            />
                        </View>


                        <Text
                            style={
                                styles.sectionTitle
                            }
                        >
                            Sugestão
                        </Text>


                        <View
                            style={
                                styles.suggestionsContainer
                            }
                        >
                            {unidadesFiltradas.length >
                            0 ? (

                                unidadesFiltradas.map(
                                    (unidade) => (
                                        <Pressable
                                            key={
                                                unidade.unidadeId
                                            }

                                            style={
                                                styles.suggestion
                                            }

                                            onPress={() =>
                                                abrirUnidade(
                                                    unidade
                                                )
                                            }
                                        >
                                            <View
                                                style={
                                                    styles.suggestionText
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.unitName
                                                    }
                                                >
                                                    {
                                                        unidade.nome
                                                    }
                                                </Text>

                                                <Text
                                                    style={
                                                        styles.unitInfo
                                                    }
                                                >
                                                    Movimento:{" "}
                                                    {
                                                        unidade.tendencia
                                                    }
                                                </Text>
                                            </View>


                                            <View
                                                style={
                                                    styles.percentageBadge
                                                }
                                            >
                                                <Text
                                                    style={
                                                        styles.percentage
                                                    }
                                                >
                                                    {unidade.percentualOcupacao.toFixed(
                                                        0
                                                    )}
                                                    %
                                                </Text>
                                            </View>
                                        </Pressable>
                                    )
                                )

                            ) : (

                                <Text
                                    style={
                                        styles.emptyText
                                    }
                                >
                                    Nenhuma unidade encontrada
                                </Text>

                            )}
                        </View>


                        <Text
                            style={
                                styles.sectionTitleBottom
                            }
                        >
                            Meu Perfil
                        </Text>


                        <Pressable
                            style={
                                styles.option
                            }
                        >
                            <View
                                style={
                                    styles.profileCircle
                                }
                            >
                                <Text
                                    style={
                                        styles.profileCircleText
                                    }
                                >
                                    ●
                                </Text>
                            </View>

                            <Text
                                style={
                                    styles.optionText
                                }
                            >
                                acessar perfil
                            </Text>

                            <Text
                                style={
                                    styles.arrow
                                }
                            >
                                ›
                            </Text>
                        </Pressable>


                        <View
                            style={
                                styles.spacer
                            }
                        />


                        <Pressable
                            style={
                                styles.supportButton
                            }
                        >
                            <Text
                                style={
                                    styles.supportText
                                }
                            >
                                Suporte
                            </Text>
                        </Pressable>
                    </>
                ) : (
                    <Pressable
                        style={
                            styles.closedArea
                        }
                        onPress={
                            abrir
                        }
                    >
                        <View
                            style={
                                styles.searchBarClosed
                            }
                        >
                            <Text
                                style={
                                    styles.searchIcon
                                }
                            >
                                ⌕
                            </Text>

                            <Text
                                style={
                                    styles.searchText
                                }
                            >
                                Procurar
                            </Text>


                            <View
                                style={
                                    styles.searchMiniIcon
                                }
                            >
                                <Text
                                    style={
                                        styles.searchMiniIconText
                                    }
                                >
                                    ⌕
                                </Text>
                            </View>


                            <View
                                style={
                                    styles.profileButton
                                }
                            >
                                <Text
                                    style={
                                        styles.profileIcon
                                    }
                                >
                                    ●
                                </Text>
                            </View>
                        </View>
                    </Pressable>
                )}

            </Animated.View>
        </GestureDetector>
    );
}


const styles =
    StyleSheet.create({
        container: {
            position:
                "absolute",

            bottom: 20,
            left: 18,
            right: 18,

            borderRadius: 25,

            overflow:
                "hidden",

            borderWidth: 1,

            borderColor:
            colors.glassBorder,

            shadowColor:
                "#000000",

            shadowOpacity:
                0.16,

            shadowRadius:
                18,

            shadowOffset: {
                width: 0,
                height: 6,
            },

            elevation: 12,

            zIndex: 50,
        },


        handleArea: {
            height: 22,

            alignItems:
                "center",

            justifyContent:
                "center",

            zIndex: 20,
        },

        handle: {
            width: 46,
            height: 4,

            borderRadius: 4,
        },

        handleClosed: {
            backgroundColor:
            colors.primary,
        },

        handleOpen: {
            backgroundColor:
                "rgba(255,255,255,0.85)",
        },


        closedArea: {
            flex: 1,

            paddingHorizontal:
                8,

            paddingBottom: 8,
        },

        searchBarClosed: {
            height: 52,

            borderRadius: 19,

            borderWidth: 2,

            borderColor:
            colors.primary,

            backgroundColor:
                "rgba(255,255,255,0.82)",

            paddingLeft: 14,
            paddingRight: 6,

            flexDirection:
                "row",

            alignItems:
                "center",
        },

        searchIcon: {
            marginRight: 8,

            fontSize: 20,

            color:
            colors.primaryDark,
        },

        searchText: {
            flex: 1,

            fontSize: 15,

            fontWeight:
                "800",

            color:
            colors.text,
        },

        searchMiniIcon: {
            width: 30,
            height: 30,

            borderRadius: 15,

            alignItems:
                "center",

            justifyContent:
                "center",
        },

        searchMiniIconText: {
            fontSize: 17,

            color:
            colors.textSecondary,
        },

        profileButton: {
            width: 38,
            height: 38,

            borderRadius: 19,

            backgroundColor:
            colors.primary,

            alignItems:
                "center",

            justifyContent:
                "center",
        },

        profileIcon: {
            color:
                "#FFFFFF",

            fontSize: 14,
        },


        searchBarOpen: {
            height: 48,

            marginHorizontal:
                14,

            paddingHorizontal:
                14,

            borderRadius: 17,

            borderWidth: 1.5,

            borderColor:
                "rgba(47,104,7,0.65)",

            backgroundColor:
                "rgba(255,255,255,0.9)",

            flexDirection:
                "row",

            alignItems:
                "center",
        },

        input: {
            flex: 1,

            fontSize: 14,

            color:
            colors.text,
        },

        sectionTitle: {
            marginTop: 14,

            marginBottom: 7,

            marginHorizontal:
                16,

            fontSize: 12,

            fontWeight:
                "900",

            color:
                "#FFFFFF",
        },

        suggestionsContainer: {
            maxHeight: 150,

            marginHorizontal:
                12,

            borderRadius: 16,

            backgroundColor:
                "rgba(255,255,255,0.86)",

            overflow:
                "hidden",
        },

        suggestion: {
            minHeight: 58,

            paddingHorizontal:
                13,

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "space-between",

            borderBottomWidth: 1,

            borderBottomColor:
                "rgba(0,0,0,0.05)",
        },

        suggestionText: {
            flex: 1,

            paddingRight: 8,
        },

        unitName: {
            fontSize: 14,

            fontWeight:
                "800",

            color:
            colors.text,
        },

        unitInfo: {
            marginTop: 2,

            fontSize: 11,

            color:
            colors.textSecondary,
        },

        percentageBadge: {
            paddingHorizontal:
                9,

            paddingVertical:
                5,

            borderRadius: 12,

            backgroundColor:
            colors.primaryLight,
        },

        percentage: {
            fontSize: 12,

            fontWeight:
                "900",

            color:
            colors.primaryDark,
        },

        emptyText: {
            padding: 18,

            textAlign:
                "center",

            fontSize: 12,

            color:
            colors.textSecondary,
        },

        sectionTitleBottom: {
            marginTop: 15,

            marginHorizontal:
                16,

            marginBottom: 7,

            fontSize: 12,

            fontWeight:
                "900",

            color:
                "#FFFFFF",
        },

        option: {
            minHeight: 58,

            marginHorizontal:
                12,

            paddingHorizontal:
                10,

            borderRadius: 16,

            backgroundColor:
                "rgba(255,255,255,0.86)",

            flexDirection:
                "row",

            alignItems:
                "center",
        },

        profileCircle: {
            width: 38,
            height: 38,

            borderRadius: 19,

            marginRight: 9,

            backgroundColor:
            colors.primaryLight,

            alignItems:
                "center",

            justifyContent:
                "center",
        },

        profileCircleText: {
            color:
            colors.primary,

            fontSize: 15,
        },

        optionText: {
            flex: 1,

            fontSize: 13,

            fontWeight:
                "700",

            color:
            colors.text,
        },

        arrow: {
            fontSize: 22,

            color:
            colors.primary,
        },

        spacer: {
            flex: 1,
        },

        supportButton: {
            height: 36,

            marginHorizontal:
                12,

            marginBottom: 12,

            borderRadius: 16,

            backgroundColor:
                "rgba(255,255,255,0.9)",

            alignItems:
                "center",

            justifyContent:
                "center",
        },

        supportText: {
            fontSize: 12,

            fontWeight:
                "800",

            color:
            colors.text,
        },
    });