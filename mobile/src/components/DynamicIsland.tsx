import { useMemo, useState } from "react";
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

import { Unidade } from "../types/Unidade";


const ALTURA_FECHADA = 60;
const ALTURA_ABERTA = 390;


type Props = {
    unidades: Unidade[];
    onSelecionarUnidade: (unidade: Unidade) => void;
};


export default function DynamicIsland({
                                          unidades,
                                          onSelecionarUnidade,
                                      }: Props) {
    const [aberta, setAberta] = useState(false);
    const [busca, setBusca] = useState("");

    const altura = useSharedValue(ALTURA_FECHADA);

    const unidadesFiltradas = useMemo(() => {
        const texto = busca.trim().toLowerCase();

        if (!texto) {
            return unidades;
        }

        return unidades.filter((unidade) =>
            unidade.nome.toLowerCase().includes(texto)
        );
    }, [busca, unidades]);


    function abrir() {
        setAberta(true);

        altura.value = withSpring(
            ALTURA_ABERTA,
            {
                damping: 18,
                stiffness: 150,
            }
        );
    }


    function fechar() {
        altura.value = withSpring(
            ALTURA_FECHADA,
            {
                damping: 18,
                stiffness: 150,
            }
        );

        setAberta(false);
    }


    function alternar() {
        if (aberta) {
            fechar();
        } else {
            abrir();
        }
    }


    function selecionarUnidade(unidade: Unidade) {
        onSelecionarUnidade(unidade);

        setBusca("");

        fechar();
    }


    const gesto = Gesture.Pan()
        .onUpdate((evento) => {
            const base = aberta
                ? ALTURA_ABERTA
                : ALTURA_FECHADA;

            let novaAltura =
                base - evento.translationY;

            if (novaAltura < ALTURA_FECHADA) {
                novaAltura = ALTURA_FECHADA;
            }

            if (novaAltura > ALTURA_ABERTA) {
                novaAltura = ALTURA_ABERTA;
            }

            altura.value = novaAltura;
        })
        .onEnd((evento) => {
            if (evento.translationY < -50) {
                altura.value = withSpring(
                    ALTURA_ABERTA
                );

                runOnJS(setAberta)(true);

                return;
            }

            if (evento.translationY > 50) {
                altura.value = withSpring(
                    ALTURA_FECHADA
                );

                runOnJS(setAberta)(false);

                return;
            }

            if (aberta) {
                altura.value = withSpring(
                    ALTURA_ABERTA
                );
            } else {
                altura.value = withSpring(
                    ALTURA_FECHADA
                );
            }
        });


    const estiloAnimado = useAnimatedStyle(() => {
        return {
            height: altura.value,
        };
    });


    return (
        <GestureDetector gesture={gesto}>
            <Animated.View
                style={[
                    styles.container,
                    estiloAnimado,
                ]}
            >
                {aberta ? (
                    <>
                        <Pressable
                            style={styles.handleArea}
                            onPress={alternar}
                        >
                            <View style={styles.handle} />
                        </Pressable>

                        <View style={styles.searchBar}>
                            <Text style={styles.searchIcon}>
                                ⌕
                            </Text>

                            <TextInput
                                value={busca}
                                onChangeText={setBusca}
                                placeholder="Procurar unidade"
                                placeholderTextColor="#777"
                                style={styles.input}
                            />
                        </View>

                        <Text style={styles.sectionTitle}>
                            Sugestões
                        </Text>

                        <View style={styles.suggestionsContainer}>
                            {unidadesFiltradas.length > 0 ? (
                                unidadesFiltradas.map((unidade) => (
                                    <Pressable
                                        key={unidade.unidadeId}
                                        style={styles.suggestion}
                                        onPress={() =>
                                            selecionarUnidade(unidade)
                                        }
                                    >
                                        <View>
                                            <Text style={styles.unitName}>
                                                {unidade.nome}
                                            </Text>

                                            <Text style={styles.unitInfo}>
                                                Movimento: {unidade.tendencia}
                                            </Text>
                                        </View>

                                        <Text style={styles.percentage}>
                                            {unidade.percentualOcupacao.toFixed(1)}%
                                        </Text>
                                    </Pressable>
                                ))
                            ) : (
                                <Text style={styles.emptyText}>
                                    Nenhuma unidade encontrada
                                </Text>
                            )}
                        </View>

                        <View style={styles.divider} />

                        <Pressable style={styles.option}>
                            <Text style={styles.optionText}>
                                Meu perfil
                            </Text>

                            <Text style={styles.arrow}>
                                ›
                            </Text>
                        </Pressable>

                        <Pressable style={styles.option}>
                            <Text style={styles.optionText}>
                                Suporte
                            </Text>

                            <Text style={styles.arrow}>
                                ›
                            </Text>
                        </Pressable>
                    </>
                ) : (
                    <Pressable
                        style={styles.collapsedContent}
                        onPress={alternar}
                    >
                        <Text style={styles.searchIcon}>
                            ⌕
                        </Text>

                        <Text style={styles.searchText}>
                            Procurar
                        </Text>

                        <View style={styles.profileButton}>
                            <Text>●</Text>
                        </View>
                    </Pressable>
                )}
            </Animated.View>
        </GestureDetector>
    );
}


const styles = StyleSheet.create({
    container: {
        position: "absolute",

        bottom: 22,
        left: 20,
        right: 20,

        borderRadius: 30,

        backgroundColor: "#FFFFFF",

        overflow: "hidden",

        shadowColor: "#000000",
        shadowOpacity: 0.18,
        shadowRadius: 15,

        shadowOffset: {
            width: 0,
            height: 5,
        },

        elevation: 10,

        zIndex: 50,
    },

    collapsedContent: {
        height: ALTURA_FECHADA,

        flexDirection: "row",
        alignItems: "center",

        paddingHorizontal: 18,
    },

    handleArea: {
        height: 32,

        alignItems: "center",
        justifyContent: "center",
    },

    handle: {
        width: 45,
        height: 5,

        borderRadius: 3,

        backgroundColor: "#D1D1D1",
    },

    searchBar: {
        height: 52,

        marginHorizontal: 18,

        borderRadius: 26,

        backgroundColor: "#F1F1F1",

        flexDirection: "row",
        alignItems: "center",

        paddingHorizontal: 16,
    },

    searchIcon: {
        fontSize: 23,

        marginRight: 10,
    },

    searchText: {
        flex: 1,

        fontSize: 16,
        fontWeight: "600",
    },

    input: {
        flex: 1,

        fontSize: 16,

        color: "#111111",
    },

    profileButton: {
        width: 38,
        height: 38,

        borderRadius: 19,

        backgroundColor: "#E2E2E2",

        alignItems: "center",
        justifyContent: "center",
    },

    sectionTitle: {
        marginTop: 20,
        marginBottom: 8,
        marginHorizontal: 20,

        fontSize: 13,
        fontWeight: "700",

        opacity: 0.5,
    },

    suggestionsContainer: {
        maxHeight: 180,
    },

    suggestion: {
        minHeight: 62,

        marginHorizontal: 20,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    unitName: {
        fontSize: 16,
        fontWeight: "700",
    },

    unitInfo: {
        marginTop: 3,

        fontSize: 13,

        opacity: 0.55,
    },

    percentage: {
        fontSize: 16,
        fontWeight: "700",
    },

    emptyText: {
        marginHorizontal: 20,
        marginVertical: 20,

        fontSize: 14,

        opacity: 0.5,
    },

    divider: {
        height: 1,

        marginHorizontal: 20,
        marginVertical: 8,

        backgroundColor: "#EEEEEE",
    },

    option: {
        height: 48,

        marginHorizontal: 20,

        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    optionText: {
        fontSize: 16,
        fontWeight: "600",
    },

    arrow: {
        fontSize: 24,

        opacity: 0.5,
    },
});