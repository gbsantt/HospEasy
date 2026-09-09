import BackChevron from "../components/BackChevron";
import {
    useCallback,
    useState,
} from "react";

import {
    useFavorites,
} from "../context/FavoritesContext";

import {
    ActivityIndicator,
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
    useFocusEffect,
} from "@react-navigation/native";

import {
    RootStackParamList,
} from "../navigation/AppNavigator";

import {
    Avaliacao,
    buscarAvaliacoes,
    buscarSituacaoUnidade,
} from "../service/api";

import {
    colors,
} from "../theme/colors";


type Props =
    NativeStackScreenProps<
        RootStackParamList,
        "Unit"
    >;


export default function UnitScreen({
                                       route,
                                       navigation,
                                   }: Props) {

    const {
        unidade: unidadeInicial,
    } = route.params;


    const [
        unidade,
        setUnidade,
    ] = useState(
        unidadeInicial
    );

    const {
        alternarFavorito,
        estaFavoritado,
    } = useFavorites();


    const favoritada =
        estaFavoritado(
            unidade.unidadeId
        );


    const [
        avaliacoes,
        setAvaliacoes,
    ] = useState<Avaliacao[]>([]);


    const [
        carregandoAvaliacoes,
        setCarregandoAvaliacoes,
    ] = useState(false);


    const [
        erroAvaliacoes,
        setErroAvaliacoes,
    ] = useState<string | null>(
        null
    );


    useFocusEffect(

        useCallback(() => {

            carregarAvaliacoes();

            atualizarUnidade();


            const intervalo =
                setInterval(() => {

                    atualizarUnidade();

                }, 1000);


            return () => {

                clearInterval(
                    intervalo
                );
            };

        }, [unidadeInicial.unidadeId])

    );

    async function atualizarUnidade() {

        try {

            const dados =
                await buscarSituacaoUnidade(
                    unidadeInicial.unidadeId
                );


            setUnidade(
                dados
            );

        } catch (erro) {

            console.error(
                "Erro ao atualizar unidade:",
                erro
            );
        }
    }

    async function carregarAvaliacoes() {

        try {

            setCarregandoAvaliacoes(
                true
            );

            setErroAvaliacoes(
                null
            );


            const dados =
                await buscarAvaliacoes(
                    unidade.unidadeId
                );


            setAvaliacoes(
                dados
            );

        } catch (erro) {

            console.error(
                "Erro ao buscar avaliações:",
                erro
            );


            setErroAvaliacoes(
                "Não foi possível carregar as avaliações."
            );

        } finally {

            setCarregandoAvaliacoes(
                false
            );

        }
    }


    const mediaAvaliacoes =
        avaliacoes.length > 0
            ? (
                avaliacoes.reduce(
                    (
                        total,
                        avaliacao
                    ) =>
                        total +
                        avaliacao.nota,
                    0
                ) /
                avaliacoes.length
            )
            : 0;


    function corOcupacao() {

        if (
            unidade.statusCamera ===
            "OFFLINE" ||
            unidade.statusCamera ===
            "DESATIVADA" ||
            unidade.statusMedicao !==
            "ATUALIZADA"
        ) {

            return colors.offline;
        }


        if (
            unidade.percentualOcupacao >=
            80
        ) {

            return colors.danger;
        }


        if (
            unidade.percentualOcupacao >=
            50
        ) {

            return colors.warning;
        }


        return colors.primary;
    }


    function formatarTexto(
        texto: string
    ) {

        return texto
            .replaceAll(
                "_",
                " "
            )
            .toLowerCase()
            .replace(
                /^\w/,
                (letra) =>
                    letra.toUpperCase()
            );
    }


    function formatarData(
        data: string | null
    ) {

        if (!data) {

            return "Sem atualização";
        }


        return new Date(
            data
        ).toLocaleString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    }


    function formatarDataAvaliacao(
        data: string
    ) {

        return new Date(
            data
        ).toLocaleDateString(
            "pt-BR",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
            }
        );
    }


    function renderizarEstrelas(
        nota: number
    ) {

        return [1, 2, 3, 4, 5]
            .map(
                (estrela) =>
                    estrela <= nota
                        ? "★"
                        : "☆"
            )
            .join("");
    }


    return (

        <View
            style={
                styles.container
            }
        >

            <ScrollView

                showsVerticalScrollIndicator={
                    false
                }

                contentContainerStyle={
                    styles.content
                }

            >


                {/* CABEÇALHO */}

                <View
                    style={
                        styles.header
                    }
                >

                    <Pressable

                        style={
                            styles.backButton
                        }

                        onPress={() =>
                            navigation.goBack()
                        }

                    >

                        <BackChevron />

                    </Pressable>


                    <View
                        style={
                            styles.headerText
                        }
                    >

                        <Text
                            style={
                                styles.title
                            }
                        >
                            {unidade.nome}
                        </Text>


                        <Text
                            style={
                                styles.subtitle
                            }
                        >
                            Situação atual da unidade
                        </Text>

                    </View>


                    <Pressable

                        style={[
                            styles.favoriteButton,

                            favoritada &&
                            styles.favoriteButtonActive,
                        ]}

                        onPress={() =>
                            alternarFavorito(
                                unidade
                            )
                        }

                    >

                        <Text
                            style={[
                                styles.favoriteIcon,

                                favoritada &&
                                styles.favoriteIconActive,
                            ]}
                        >

                            {
                                favoritada
                                    ? "♥"
                                    : "♡"
                            }

                        </Text>

                    </Pressable>

                </View>


                {/* OCUPAÇÃO */}

                <View
                    style={
                        styles.occupancyCard
                    }
                >

                    <View>

                        <Text
                            style={
                                styles.cardLabel
                            }
                        >
                            OCUPAÇÃO ATUAL
                        </Text>


                        <Text
                            style={
                                styles.percentage
                            }
                        >

                            {
                                unidade
                                    .percentualOcupacao
                                    .toFixed(0)
                            }
                            %

                        </Text>


                        <Text
                            style={
                                styles.people
                            }
                        >

                            {
                                unidade.ocupacaoAtual
                            }{" "}
                            de{" "}
                            {
                                unidade
                                    .capacidadeAreaMonitorada
                            }{" "}
                            pessoas

                        </Text>

                    </View>


                    <View
                        style={[
                            styles.statusCircle,

                            {
                                backgroundColor:
                                    corOcupacao(),
                            },
                        ]}
                    >

                        <Text
                            style={
                                styles.statusCircleText
                            }
                        >

                            {
                                unidade
                                    .percentualOcupacao
                                    .toFixed(0)
                            }

                        </Text>

                    </View>

                </View>


                <View
                    style={
                        styles.progressBackground
                    }
                >

                    <View
                        style={[
                            styles.progress,

                            {
                                width:
                                    `${Math.min(
                                        unidade
                                            .percentualOcupacao,
                                        100
                                    )}%`,

                                backgroundColor:
                                    corOcupacao(),
                            },
                        ]}
                    />

                </View>


                <View
                    style={
                        styles.statusRow
                    }
                >

                    <View
                        style={[
                            styles.statusDot,

                            {
                                backgroundColor:
                                    corOcupacao(),
                            },
                        ]}
                    />


                    <Text
                        style={
                            styles.statusText
                        }
                    >

                        {
                            formatarTexto(
                                unidade
                                    .nivelOcupacao
                            )
                        }

                    </Text>

                </View>


                {/* INFORMAÇÕES */}

                <View
                    style={
                        styles.section
                    }
                >

                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        Informações
                    </Text>


                    <View
                        style={
                            styles.infoBlock
                        }
                    >

                        <Text
                            style={
                                styles.infoLabel
                            }
                        >
                            Endereço
                        </Text>


                        <Text
                            style={
                                styles.infoText
                            }
                        >
                            {unidade.endereco}
                        </Text>

                    </View>


                    <View
                        style={
                            styles.separator
                        }
                    />


                    <View
                        style={
                            styles.infoBlock
                        }
                    >

                        <Text
                            style={
                                styles.infoLabel
                            }
                        >
                            Telefone
                        </Text>


                        <Text
                            style={
                                styles.infoText
                            }
                        >

                            {
                                unidade.telefone ||
                                "Não informado"
                            }

                        </Text>

                    </View>

                </View>


                {/* FLUXO */}

                <View
                    style={
                        styles.section
                    }
                >

                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        Fluxo da unidade
                    </Text>


                    <InfoRow

                        label="Tendência"

                        value={
                            formatarTexto(
                                unidade.tendencia
                            )
                        }

                    />


                    <InfoRow

                        label="Ritmo"

                        value={
                            formatarTexto(
                                unidade
                                    .ritmoOcupacao
                            )
                        }

                    />


                    <InfoRow

                        label="Média nos últimos 30 min"

                        value={
                            unidade
                                .mediaUltimos30Minutos
                                .toFixed(1)
                        }

                    />

                </View>


                {/* MONITORAMENTO */}

                <View
                    style={
                        styles.section
                    }
                >

                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        Monitoramento
                    </Text>


                    <InfoRow

                        label="Câmera"

                        value={
                            formatarTexto(
                                unidade
                                    .statusCamera
                            )
                        }

                    />


                    <InfoRow

                        label="Medição"

                        value={
                            formatarTexto(
                                unidade
                                    .statusMedicao
                            )
                        }

                    />


                    <InfoRow

                        label="Última atualização"

                        value={
                            formatarData(
                                unidade
                                    .ultimaAtualizacao
                            )
                        }

                    />

                </View>


                {/* AVALIAÇÕES */}

                <View
                    style={
                        styles.section
                    }
                >

                    <View
                        style={
                            styles.reviewHeader
                        }
                    >

                        <View>

                            <Text
                                style={
                                    styles.sectionTitle
                                }
                            >
                                Avaliações
                            </Text>


                            {
                                avaliacoes.length >
                                0 && (

                                    <Text
                                        style={
                                            styles.reviewCount
                                        }
                                    >

                                        {
                                            avaliacoes.length
                                        }{" "}

                                        {
                                            avaliacoes.length ===
                                            1
                                                ? "avaliação"
                                                : "avaliações"
                                        }

                                    </Text>

                                )
                            }

                        </View>


                        {
                            avaliacoes.length >
                            0 && (

                                <View
                                    style={
                                        styles.averageContainer
                                    }
                                >

                                    <Text
                                        style={
                                            styles.averageStar
                                        }
                                    >
                                        ★
                                    </Text>


                                    <Text
                                        style={
                                            styles.averageText
                                        }
                                    >

                                        {
                                            mediaAvaliacoes
                                                .toFixed(1)
                                        }

                                    </Text>

                                </View>

                            )
                        }

                    </View>


                    {
                        carregandoAvaliacoes
                            ? (

                                <View
                                    style={
                                        styles.loadingReviews
                                    }
                                >

                                    <ActivityIndicator
                                        color={
                                            colors.primary
                                        }
                                    />


                                    <Text
                                        style={
                                            styles.loadingReviewsText
                                        }
                                    >
                                        Carregando avaliações...
                                    </Text>

                                </View>

                            )
                            : erroAvaliacoes
                                ? (

                                    <Text
                                        style={
                                            styles.reviewError
                                        }
                                    >
                                        {erroAvaliacoes}
                                    </Text>

                                )
                                : avaliacoes.length ===
                                0
                                    ? (

                                        <View
                                            style={
                                                styles.emptyReviews
                                            }
                                        >

                                            <Text
                                                style={
                                                    styles.emptyStar
                                                }
                                            >
                                                ☆
                                            </Text>


                                            <Text
                                                style={
                                                    styles.emptyReviewsText
                                                }
                                            >
                                                Esta unidade ainda não possui avaliações.
                                            </Text>

                                        </View>

                                    )
                                    : (

                                        avaliacoes.map(
                                            (
                                                avaliacao
                                            ) => (

                                                <View

                                                    key={
                                                        avaliacao.id
                                                    }

                                                    style={
                                                        styles.reviewCard
                                                    }

                                                >

                                                    <View
                                                        style={
                                                            styles.reviewTop
                                                        }
                                                    >

                                                        <Text
                                                            style={
                                                                styles.reviewStars
                                                            }
                                                        >

                                                            {
                                                                renderizarEstrelas(
                                                                    avaliacao.nota
                                                                )
                                                            }

                                                        </Text>


                                                        <Text
                                                            style={
                                                                styles.reviewDate
                                                            }
                                                        >

                                                            {
                                                                formatarDataAvaliacao(
                                                                    avaliacao.criadoEm
                                                                )
                                                            }

                                                        </Text>

                                                    </View>


                                                    {
                                                        avaliacao
                                                            .usuarioNome && (

                                                            <Text
                                                                style={
                                                                    styles.reviewUser
                                                                }
                                                            >
                                                                {
                                                                    avaliacao
                                                                        .usuarioNome
                                                                }
                                                            </Text>

                                                        )
                                                    }


                                                    {
                                                        avaliacao.comentario &&
                                                        avaliacao.comentario
                                                            .trim()
                                                            .length >
                                                        0 && (

                                                            <Text
                                                                style={
                                                                    styles.reviewComment
                                                                }
                                                            >
                                                                {
                                                                    avaliacao
                                                                        .comentario
                                                                }
                                                            </Text>

                                                        )
                                                    }

                                                </View>

                                            )
                                        )

                                    )
                    }

                </View>


                {/* BOTÃO AVALIAR */}

                <Pressable

                    style={
                        styles.reviewButton
                    }

                    onPress={() =>
                        navigation.navigate(
                            "Review",
                            {
                                unidade,
                            }
                        )
                    }

                >

                    <Text
                        style={
                            styles.reviewText
                        }
                    >
                        AVALIAR
                    </Text>

                </Pressable>

            </ScrollView>

        </View>

    );
}


function InfoRow({
                     label,
                     value,
                 }: {
    label: string;
    value: string;
}) {

    return (

        <View
            style={
                styles.infoRow
            }
        >

            <Text
                style={
                    styles.infoLabel
                }
            >
                {label}
            </Text>


            <Text
                style={
                    styles.infoValue
                }
            >
                {value}
            </Text>

        </View>

    );
}


const styles =
    StyleSheet.create({

        container: {

            flex: 1,

            backgroundColor:
            colors.background,
        },


        content: {

            padding: 20,

            paddingTop: 28,

            paddingBottom: 50,
        },


        header: {

            flexDirection:
                "row",

            alignItems:
                "center",
        },


        headerText: {

            flex: 1,
        },


        backButton: {

            width: 44,

            height: 44,

            marginRight: 14,

            borderRadius: 22,

            backgroundColor:
            colors.primaryLight,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        backText: {

            fontSize: 34,

            lineHeight: 36,

            color:
            colors.primaryDark,
        },


        title: {

            fontSize: 26,

            fontWeight:
                "900",

            color:
            colors.text,
        },


        subtitle: {

            marginTop: 3,

            fontSize: 13,

            color:
            colors.textSecondary,
        },


        favoriteButton: {

            width: 44,

            height: 44,

            marginLeft: 8,

            borderRadius: 22,

            backgroundColor:
            colors.primaryLight,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        favoriteButtonActive: {

            backgroundColor:
            colors.primary,
        },


        favoriteIcon: {

            fontSize: 25,

            color:
            colors.primary,
        },


        favoriteIconActive: {

            color:
                "#FFFFFF",
        },


        occupancyCard: {

            marginTop: 28,

            padding: 22,

            borderRadius: 24,

            backgroundColor:
            colors.surface,

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "space-between",
        },


        cardLabel: {

            fontSize: 11,

            fontWeight:
                "800",

            letterSpacing:
                0.8,

            color:
            colors.primaryDark,
        },


        percentage: {

            marginTop: 6,

            fontSize: 44,

            fontWeight:
                "900",

            color:
            colors.text,
        },


        people: {

            marginTop: 2,

            fontSize: 13,

            color:
            colors.textSecondary,
        },


        statusCircle: {

            width: 58,

            height: 58,

            borderRadius: 29,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        statusCircleText: {

            color:
                "#FFFFFF",

            fontSize: 17,

            fontWeight:
                "900",
        },


        progressBackground: {

            height: 7,

            marginTop: 14,

            borderRadius: 10,

            backgroundColor:
            colors.border,

            overflow:
                "hidden",
        },


        progress: {

            height:
                "100%",

            borderRadius:
                10,
        },


        statusRow: {

            marginTop: 9,

            marginLeft: 4,

            flexDirection:
                "row",

            alignItems:
                "center",
        },


        statusDot: {

            width: 8,

            height: 8,

            borderRadius: 4,

            marginRight: 7,
        },


        statusText: {

            fontSize: 12,

            fontWeight:
                "700",

            color:
            colors.textSecondary,
        },


        section: {

            marginTop: 18,

            padding: 18,

            borderRadius: 20,

            backgroundColor:
            colors.surface,
        },


        sectionTitle: {

            marginBottom: 12,

            fontSize: 17,

            fontWeight:
                "900",

            color:
            colors.primaryDark,
        },


        infoBlock: {

            paddingVertical:
                3,
        },


        infoLabel: {

            fontSize: 13,

            color:
            colors.textSecondary,
        },


        infoText: {

            marginTop: 5,

            fontSize: 15,

            fontWeight:
                "600",

            color:
            colors.text,
        },


        separator: {

            height: 1,

            marginVertical:
                14,

            backgroundColor:
            colors.border,
        },


        infoRow: {

            minHeight: 38,

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "space-between",
        },


        infoValue: {

            maxWidth:
                "55%",

            fontSize: 13,

            fontWeight:
                "700",

            textAlign:
                "right",

            color:
            colors.text,
        },


        reviewHeader: {

            flexDirection:
                "row",

            justifyContent:
                "space-between",

            alignItems:
                "center",
        },


        reviewCount: {

            marginTop: -7,

            fontSize: 12,

            color:
            colors.textSecondary,
        },


        averageContainer: {

            flexDirection:
                "row",

            alignItems:
                "center",

            paddingHorizontal:
                10,

            paddingVertical:
                6,

            borderRadius:
                14,

            backgroundColor:
            colors.primaryLight,
        },


        averageStar: {

            marginRight: 4,

            fontSize: 18,

            color:
            colors.primary,
        },


        averageText: {

            fontSize: 16,

            fontWeight:
                "900",

            color:
            colors.primaryDark,
        },


        loadingReviews: {

            paddingVertical:
                22,

            alignItems:
                "center",
        },


        loadingReviewsText: {

            marginTop: 8,

            fontSize: 12,

            color:
            colors.textSecondary,
        },


        reviewError: {

            paddingVertical:
                18,

            textAlign:
                "center",

            fontSize: 13,

            color:
            colors.danger,
        },


        emptyReviews: {

            paddingVertical:
                18,

            alignItems:
                "center",
        },


        emptyStar: {

            fontSize: 32,

            color:
            colors.primary,
        },


        emptyReviewsText: {

            marginTop: 5,

            fontSize: 13,

            textAlign:
                "center",

            color:
            colors.textSecondary,
        },


        reviewCard: {

            marginTop: 12,

            padding: 14,

            borderRadius: 16,

            backgroundColor:
            colors.primaryLight,
        },


        reviewTop: {

            flexDirection:
                "row",

            justifyContent:
                "space-between",

            alignItems:
                "center",
        },


        reviewStars: {

            fontSize: 17,

            letterSpacing:
                1,

            color:
            colors.primary,
        },


        reviewDate: {

            fontSize: 10,

            color:
            colors.textSecondary,
        },


        reviewUser: {

            marginTop: 8,

            fontSize: 12,

            fontWeight:
                "800",

            color:
            colors.primaryDark,
        },


        reviewComment: {

            marginTop: 8,

            fontSize: 13,

            lineHeight: 19,

            color:
            colors.text,
        },


        reviewButton: {

            height: 54,

            marginTop: 20,

            borderRadius: 17,

            backgroundColor:
            colors.primary,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        reviewText: {

            fontSize: 14,

            fontWeight:
                "900",

            letterSpacing:
                0.8,

            color:
                "#FFFFFF",
        },

    });