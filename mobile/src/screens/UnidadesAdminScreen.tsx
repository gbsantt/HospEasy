import {
    ActivityIndicator,
    Alert,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    NativeStackScreenProps,
} from "@react-navigation/native-stack";

import {
    useCallback,
    useState,
} from "react";

import {
    useFocusEffect,
} from "@react-navigation/native";

import {
    RootStackParamList,
} from "../navigation/AppNavigator";

import {
    buscarSituacoesUnidades,
    excluirUnidadeAdmin,
} from "../service/api";

import {
    Unidade,
} from "../types/Unidade";

import {
    useAuth,
} from "../context/AuthContext";

import {
    colors,
} from "../theme/colors";


type Props =
    NativeStackScreenProps<
        RootStackParamList,
        "UnidadesAdmin"
    >;

function nomeTipoUnidade(
    tipo: Unidade["tipo"]
) {

    switch (
        tipo
        ) {

        case "UPA":
            return "UPA";

        case "PRONTO_ATENDIMENTO":
            return "Pronto Atendimento";

        case "PRONTO_SOCORRO":
            return "Pronto Socorro";

        default:
            return tipo;
    }
}


function letraTipoUnidade(
    tipo: Unidade["tipo"]
) {

    switch (
        tipo
        ) {

        case "UPA":
            return "U";

        case "PRONTO_ATENDIMENTO":
            return "A";

        case "PRONTO_SOCORRO":
            return "S";

        default:
            return "?";
    }
}


export default function UnidadesAdminScreen({
                                                navigation,
                                            }: Props) {

    const {
        usuario,
    } = useAuth();


    const [
        unidades,
        setUnidades,
    ] = useState<Unidade[]>([]);


    const [
        carregando,
        setCarregando,
    ] = useState(
        true
    );


    const [
        atualizando,
        setAtualizando,
    ] = useState(
        false
    );


    const [
        erro,
        setErro,
    ] = useState(
        ""
    );


    const [
        excluindoId,
        setExcluindoId,
    ] = useState<number | null>(
        null
    );


    async function carregarUnidades(
        mostrarCarregamento = true
    ) {

        try {

            if (
                mostrarCarregamento
            ) {

                setCarregando(
                    true
                );
            }


            setErro(
                ""
            );


            const dados =
                await buscarSituacoesUnidades();


            setUnidades(
                dados
            );

        } catch (
            error
            ) {

            console.error(
                error
            );


            setErro(
                "Não foi possível carregar as unidades."
            );

        } finally {

            if (
                mostrarCarregamento
            ) {

                setCarregando(
                    false
                );
            }
        }
    }


    async function atualizarLista() {

        try {

            setAtualizando(
                true
            );


            await carregarUnidades(
                false
            );

        } finally {

            setAtualizando(
                false
            );
        }
    }


    async function excluirUnidade(
        unidade: Unidade
    ) {

        if (
            !usuario ||
            usuario.tipo !== "ADMIN"
        ) {

            return;
        }


        try {

            setExcluindoId(
                unidade.unidadeId
            );


            await excluirUnidadeAdmin(
                unidade.unidadeId,
                usuario.token
            );


            setUnidades(
                (atual) =>
                    atual.filter(
                        (item) =>
                            item.unidadeId !==
                            unidade.unidadeId
                    )
            );

        } catch (
            error
            ) {

            console.error(
                error
            );


            Alert.alert(
                "Não foi possível excluir",
                error instanceof Error
                    ? error.message
                    : "Tente novamente em instantes."
            );

        } finally {

            setExcluindoId(
                null
            );
        }
    }


    function confirmarExclusao(
        unidade: Unidade
    ) {

        Alert.alert(
            "Excluir unidade",
            `Tem certeza que deseja excluir "${unidade.nome}"? Essa ação não pode ser desfeita e também apagará o histórico de ocupação, avaliações e favoritos ligados a ela.`,
            [
                {
                    text: "Cancelar",
                    style: "cancel",
                },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: () =>
                        excluirUnidade(
                            unidade
                        ),
                },
            ]
        );
    }


    useFocusEffect(

        useCallback(
            () => {

                carregarUnidades();

            },
            []
        )
    );


    if (
        !usuario ||
        usuario.tipo !== "ADMIN"
    ) {

        return (

            <View
                style={
                    styles.centerContainer
                }
            >

                <Text
                    style={
                        styles.errorTitle
                    }
                >
                    Acesso não autorizado
                </Text>


                <Text
                    style={
                        styles.errorText
                    }
                >
                    Esta área é exclusiva para administradores.
                </Text>

            </View>
        );
    }


    if (
        carregando
    ) {

        return (

            <View
                style={
                    styles.centerContainer
                }
            >

                <ActivityIndicator
                    size="large"
                    color={
                        colors.primary
                    }
                />


                <Text
                    style={
                        styles.loadingText
                    }
                >
                    Carregando unidades...
                </Text>

            </View>
        );
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

                refreshControl={

                    <RefreshControl
                        refreshing={
                            atualizando
                        }

                        onRefresh={
                            atualizarLista
                        }

                        tintColor={
                            colors.primary
                        }
                    />
                }

                contentContainerStyle={
                    styles.content
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

                    <Text
                        style={
                            styles.backText
                        }
                    >
                        ‹
                    </Text>

                </Pressable>


                <View
                    style={
                        styles.header
                    }
                >

                    <Text
                        style={
                            styles.title
                        }
                    >
                        Unidades
                    </Text>


                    <Text
                        style={
                            styles.subtitle
                        }
                    >
                        Gerencie os dados cadastrais das unidades
                    </Text>

                </View>


                <Pressable
                    style={
                        styles.createButton
                    }

                    onPress={() =>
                        navigation.navigate(
                            "CriarUnidadeAdmin"
                        )
                    }
                >

                    <Text
                        style={
                            styles.createButtonPlus
                        }
                    >
                        +
                    </Text>


                    <Text
                        style={
                            styles.createButtonText
                        }
                    >
                        NOVA UNIDADE
                    </Text>

                </Pressable>


                <View
                    style={
                        styles.summaryCard
                    }
                >

                    <View>

                        <Text
                            style={
                                styles.summaryLabel
                            }
                        >
                            Unidades cadastradas
                        </Text>


                        <Text
                            style={
                                styles.summaryNumber
                            }
                        >
                            {
                                unidades.length
                            }
                        </Text>

                    </View>


                    <View
                        style={
                            styles.summaryIcon
                        }
                    >

                        <Text
                            style={
                                styles.summaryIconText
                            }
                        >
                            H
                        </Text>

                    </View>

                </View>


                {
                    erro !== "" && (

                        <View
                            style={
                                styles.messageCard
                            }
                        >

                            <Text
                                style={
                                    styles.messageText
                                }
                            >
                                {
                                    erro
                                }
                            </Text>


                            <Pressable
                                style={
                                    styles.retryButton
                                }

                                onPress={() =>
                                    carregarUnidades()
                                }
                            >

                                <Text
                                    style={
                                        styles.retryButtonText
                                    }
                                >
                                    TENTAR NOVAMENTE
                                </Text>

                            </Pressable>

                        </View>

                    )
                }


                {
                    erro === "" &&
                    unidades.length === 0 && (

                        <View
                            style={
                                styles.emptyCard
                            }
                        >

                            <Text
                                style={
                                    styles.emptyTitle
                                }
                            >
                                Nenhuma unidade
                            </Text>


                            <Text
                                style={
                                    styles.emptyText
                                }
                            >
                                Ainda não existem unidades cadastradas.
                            </Text>

                        </View>

                    )
                }


                {
                    unidades.map(
                        (
                            unidade
                        ) => {

                            const percentual =
                                Number.isFinite(
                                    unidade.percentualOcupacao
                                )
                                    ? unidade.percentualOcupacao
                                    : 0;


                            return (

                                <View
                                    key={
                                        unidade.unidadeId
                                    }

                                    style={
                                        styles.unitCard
                                    }
                                >

                                    <View
                                        style={
                                            styles.unitTop
                                        }
                                    >

                                        <View
                                            style={
                                                styles.unitIcon
                                            }
                                        >

                                            <Text
                                                style={
                                                    styles.unitIconText
                                                }
                                            >
                                                {
                                                    letraTipoUnidade(
                                                        unidade.tipo
                                                    )
                                                }
                                            </Text>

                                        </View>


                                        <View
                                            style={
                                                styles.unitMain
                                            }
                                        >

                                            <Text
                                                style={
                                                    styles.unitName
                                                }

                                                numberOfLines={
                                                    2
                                                }
                                            >
                                                {
                                                    unidade.nome
                                                }
                                            </Text>


                                            <Text
                                                style={
                                                    styles.unitType
                                                }
                                            >
                                                {
                                                    nomeTipoUnidade(
                                                        unidade.tipo
                                                    )
                                                }
                                            </Text>

                                        </View>

                                    </View>


                                    <View
                                        style={
                                            styles.infoArea
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
                                                styles.infoValue
                                            }
                                        >
                                            {
                                                unidade.endereco
                                            }
                                        </Text>


                                        {
                                            unidade.telefone && (

                                                <>

                                                    <Text
                                                        style={
                                                            styles.infoLabel
                                                        }
                                                    >
                                                        Telefone
                                                    </Text>


                                                    <Text
                                                        style={
                                                            styles.infoValue
                                                        }
                                                    >
                                                        {
                                                            unidade.telefone
                                                        }
                                                    </Text>

                                                </>

                                            )
                                        }

                                    </View>


                                    <View
                                        style={
                                            styles.statsRow
                                        }
                                    >

                                        <View
                                            style={
                                                styles.stat
                                            }
                                        >

                                            <Text
                                                style={
                                                    styles.statLabel
                                                }
                                            >
                                                Capacidade
                                            </Text>


                                            <Text
                                                style={
                                                    styles.statValue
                                                }
                                            >
                                                {
                                                    unidade
                                                        .capacidadeAreaMonitorada
                                                }
                                            </Text>

                                        </View>


                                        <View
                                            style={
                                                styles.statDivider
                                            }
                                        />


                                        <View
                                            style={
                                                styles.stat
                                            }
                                        >

                                            <Text
                                                style={
                                                    styles.statLabel
                                                }
                                            >
                                                Ocupação
                                            </Text>


                                            <Text
                                                style={
                                                    styles.statValue
                                                }
                                            >
                                                {
                                                    unidade
                                                        .ocupacaoAtual
                                                }
                                            </Text>

                                        </View>


                                        <View
                                            style={
                                                styles.statDivider
                                            }
                                        />


                                        <View
                                            style={
                                                styles.stat
                                            }
                                        >

                                            <Text
                                                style={
                                                    styles.statLabel
                                                }
                                            >
                                                Percentual
                                            </Text>


                                            <Text
                                                style={
                                                    styles.statValue
                                                }
                                            >
                                                {
                                                    percentual
                                                        .toFixed(
                                                            0
                                                        )
                                                }
                                                %
                                            </Text>

                                        </View>

                                    </View>


                                    <Pressable
                                        style={
                                            styles.editButton
                                        }

                                        onPress={() =>
                                            navigation.navigate(
                                                "EditarUnidadeAdmin",
                                                {
                                                    unidade,
                                                }
                                            )
                                        }
                                    >

                                        <Text
                                            style={
                                                styles.editButtonText
                                            }
                                        >
                                            EDITAR UNIDADE
                                        </Text>

                                    </Pressable>


                                    <Pressable
                                        disabled={
                                            excluindoId ===
                                            unidade.unidadeId
                                        }

                                        style={[
                                            styles.deleteButton,
                                            excluindoId ===
                                            unidade.unidadeId &&
                                            styles.deleteButtonDisabled,
                                        ]}

                                        onPress={() =>
                                            confirmarExclusao(
                                                unidade
                                            )
                                        }
                                    >

                                        {
                                            excluindoId ===
                                            unidade.unidadeId
                                                ? (
                                                    <ActivityIndicator
                                                        size="small"
                                                        color={
                                                            colors.danger
                                                        }
                                                    />
                                                )
                                                : (
                                                    <Text
                                                        style={
                                                            styles.deleteButtonText
                                                        }
                                                    >
                                                        EXCLUIR UNIDADE
                                                    </Text>
                                                )
                                        }

                                    </Pressable>

                                </View>

                            );
                        }
                    )
                }

            </ScrollView>

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

            paddingBottom: 50,
        },


        centerContainer: {

            flex: 1,

            padding: 30,

            alignItems:
                "center",

            justifyContent:
                "center",

            backgroundColor:
            colors.background,
        },


        backButton: {

            width: 44,

            height: 44,

            marginTop: 8,

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


        header: {

            marginTop: 30,

            marginBottom: 22,
        },


        title: {

            fontSize: 30,

            fontWeight:
                "900",

            color:
            colors.text,
        },


        subtitle: {

            marginTop: 6,

            fontSize: 13,

            lineHeight: 19,

            color:
            colors.textSecondary,
        },


        createButton: {

            minHeight: 58,

            marginBottom: 16,

            paddingHorizontal: 20,

            borderRadius: 18,

            backgroundColor:
            colors.primary,

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        createButtonPlus: {

            marginRight: 9,

            marginTop: -2,

            fontSize: 25,

            fontWeight:
                "700",

            color:
                "#FFFFFF",
        },


        createButtonText: {

            fontSize: 12,

            fontWeight:
                "900",

            color:
                "#FFFFFF",
        },


        summaryCard: {

            padding: 20,

            marginBottom: 20,

            borderRadius: 22,

            backgroundColor:
            colors.surface,

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "space-between",
        },


        summaryLabel: {

            fontSize: 12,

            color:
            colors.textSecondary,
        },


        summaryNumber: {

            marginTop: 4,

            fontSize: 30,

            fontWeight:
                "900",

            color:
            colors.text,
        },


        summaryIcon: {

            width: 50,

            height: 50,

            borderRadius: 25,

            backgroundColor:
            colors.primaryLight,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        summaryIconText: {

            fontSize: 18,

            fontWeight:
                "900",

            color:
            colors.primaryDark,
        },


        unitCard: {

            padding: 17,

            marginBottom: 14,

            borderRadius: 22,

            backgroundColor:
            colors.surface,
        },


        unitTop: {

            flexDirection:
                "row",

            alignItems:
                "center",
        },


        unitIcon: {

            width: 48,

            height: 48,

            marginRight: 13,

            borderRadius: 24,

            backgroundColor:
            colors.primaryLight,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        unitIconText: {

            fontSize: 17,

            fontWeight:
                "900",

            color:
            colors.primaryDark,
        },


        unitMain: {

            flex: 1,
        },


        unitName: {

            fontSize: 16,

            fontWeight:
                "900",

            color:
            colors.text,
        },


        unitType: {

            marginTop: 3,

            fontSize: 11,

            fontWeight:
                "800",

            color:
            colors.primaryDark,
        },


        infoArea: {

            marginTop: 17,
        },


        infoLabel: {

            marginTop: 7,

            fontSize: 10,

            fontWeight:
                "800",

            color:
            colors.textSecondary,
        },


        infoValue: {

            marginTop: 3,

            fontSize: 12,

            lineHeight: 18,

            color:
            colors.text,
        },


        statsRow: {

            marginTop: 18,

            paddingVertical: 14,

            borderRadius: 16,

            backgroundColor:
            colors.background,

            flexDirection:
                "row",

            alignItems:
                "center",
        },


        stat: {

            flex: 1,

            alignItems:
                "center",
        },


        statDivider: {

            width: 1,

            height: 30,

            backgroundColor:
            colors.border,
        },


        statLabel: {

            fontSize: 9,

            color:
            colors.textSecondary,
        },


        statValue: {

            marginTop: 4,

            fontSize: 15,

            fontWeight:
                "900",

            color:
            colors.text,
        },


        editButton: {

            height: 48,

            marginTop: 16,

            borderRadius: 15,

            backgroundColor:
            colors.primary,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        editButtonText: {

            fontSize: 12,

            fontWeight:
                "900",

            color:
                "#FFFFFF",
        },


        deleteButton: {

            height: 48,

            marginTop: 10,

            borderRadius: 15,

            borderWidth: 1.5,

            borderColor:
            colors.danger,

            backgroundColor:
                "transparent",

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        deleteButtonDisabled: {

            opacity: 0.6,
        },


        deleteButtonText: {

            fontSize: 12,

            fontWeight:
                "900",

            color:
            colors.danger,
        },


        loadingText: {

            marginTop: 12,

            fontSize: 13,

            color:
            colors.textSecondary,
        },


        errorTitle: {

            fontSize: 20,

            fontWeight:
                "900",

            color:
            colors.text,
        },


        errorText: {

            marginTop: 8,

            textAlign:
                "center",

            fontSize: 13,

            color:
            colors.textSecondary,
        },


        messageCard: {

            padding: 20,

            marginBottom: 18,

            borderRadius: 20,

            backgroundColor:
            colors.surface,

            alignItems:
                "center",
        },


        messageText: {

            fontSize: 13,

            textAlign:
                "center",

            color:
            colors.textSecondary,
        },


        retryButton: {

            marginTop: 15,

            paddingHorizontal: 20,

            paddingVertical: 12,

            borderRadius: 14,

            backgroundColor:
            colors.primary,
        },


        retryButtonText: {

            fontSize: 11,

            fontWeight:
                "900",

            color:
                "#FFFFFF",
        },


        emptyCard: {

            padding: 28,

            borderRadius: 20,

            backgroundColor:
            colors.surface,

            alignItems:
                "center",
        },


        emptyTitle: {

            fontSize: 16,

            fontWeight:
                "900",

            color:
            colors.text,
        },


        emptyText: {

            marginTop: 6,

            fontSize: 12,

            color:
            colors.textSecondary,
        },

    });