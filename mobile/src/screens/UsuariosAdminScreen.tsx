import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    useCallback,
    useState,
} from "react";

import {
    useFocusEffect,
} from "@react-navigation/native";

import {
    NativeStackScreenProps,
} from "@react-navigation/native-stack";

import {
    RootStackParamList,
} from "../navigation/AppNavigator";

import {
    useAuth,
} from "../context/AuthContext";

import {
    alterarStatusUsuarioAdmin,
    alterarTipoUsuarioAdmin,
    listarUsuariosAdmin,
    UsuarioAdmin,
} from "../service/api";

import {
    colors,
} from "../theme/colors";


type Props =
    NativeStackScreenProps<
        RootStackParamList,
        "UsuariosAdmin"
    >;


export default function UsuariosAdminScreen({
                                                navigation,
                                            }: Props) {

    const {
        usuario,
    } = useAuth();


    const [
        usuarios,
        setUsuarios,
    ] = useState<UsuarioAdmin[]>([]);


    const [
        carregando,
        setCarregando,
    ] = useState(
        true
    );


    const [
        atualizandoId,
        setAtualizandoId,
    ] = useState<number | null>(
        null
    );


    async function carregarUsuarios() {

        if (
            !usuario ||
            usuario.tipo !== "ADMIN"
        ) {

            return;
        }


        try {

            setCarregando(
                true
            );


            const dados =
                await listarUsuariosAdmin(
                    usuario.token
                );


            setUsuarios(
                dados
            );

        } catch (erro) {

            console.error(
                erro
            );


            Alert.alert(
                "Erro",
                "Não foi possível carregar os usuários."
            );

        } finally {

            setCarregando(
                false
            );
        }
    }


    useFocusEffect(

        useCallback(
            () => {

                carregarUsuarios();

            },
            [
                usuario,
            ]
        )
    );


    async function alterarTipo(
        alvo: UsuarioAdmin
    ) {

        if (!usuario) {
            return;
        }


        const novoTipo =
            alvo.tipo === "ADMIN"
                ? "USUARIO"
                : "ADMIN";


        const acao =
            novoTipo === "ADMIN"
                ? "promover"
                : "rebaixar";


        Alert.alert(
            "Alterar permissão",

            `Deseja ${acao} ${alvo.nome}?`,

            [
                {
                    text:
                        "Cancelar",

                    style:
                        "cancel",
                },

                {
                    text:
                        "Confirmar",

                    onPress:
                        async () => {

                            try {

                                setAtualizandoId(
                                    alvo.id
                                );


                                const atualizado =
                                    await alterarTipoUsuarioAdmin(
                                        alvo.id,
                                        novoTipo,
                                        usuario.token
                                    );


                                setUsuarios(
                                    lista =>
                                        lista.map(
                                            item =>
                                                item.id === atualizado.id
                                                    ? atualizado
                                                    : item
                                        )
                                );

                            } catch (erro) {

                                Alert.alert(
                                    "Não foi possível alterar",

                                    erro instanceof Error
                                        ? erro.message
                                        : "Ocorreu um erro."
                                );

                            } finally {

                                setAtualizandoId(
                                    null
                                );
                            }
                        },
                },
            ]
        );
    }


    async function alterarStatus(
        alvo: UsuarioAdmin
    ) {

        if (!usuario) {
            return;
        }


        const novoStatus =
            !alvo.ativo;


        Alert.alert(
            novoStatus
                ? "Ativar usuário"
                : "Desativar usuário",

            novoStatus
                ? `Deseja reativar ${alvo.nome}?`
                : `Deseja desativar ${alvo.nome}?`,

            [
                {
                    text:
                        "Cancelar",

                    style:
                        "cancel",
                },

                {
                    text:
                        "Confirmar",

                    onPress:
                        async () => {

                            try {

                                setAtualizandoId(
                                    alvo.id
                                );


                                const atualizado =
                                    await alterarStatusUsuarioAdmin(
                                        alvo.id,
                                        novoStatus,
                                        usuario.token
                                    );


                                setUsuarios(
                                    lista =>
                                        lista.map(
                                            item =>
                                                item.id === atualizado.id
                                                    ? atualizado
                                                    : item
                                        )
                                );

                            } catch (erro) {

                                Alert.alert(
                                    "Não foi possível alterar",

                                    erro instanceof Error
                                        ? erro.message
                                        : "Ocorreu um erro."
                                );

                            } finally {

                                setAtualizandoId(
                                    null
                                );
                            }
                        },
                },
            ]
        );
    }


    if (
        !usuario ||
        usuario.tipo !== "ADMIN"
    ) {

        return (

            <View
                style={
                    styles.center
                }
            >

                <Text
                    style={
                        styles.errorText
                    }
                >
                    Você não possui permissão
                    para acessar esta área.
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
                contentContainerStyle={
                    styles.content
                }

                showsVerticalScrollIndicator={
                    false
                }
            >

                <View
                    style={
                        styles.top
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
                            styles.titleContainer
                        }
                    >

                        <Text
                            style={
                                styles.title
                            }
                        >
                            Usuários
                        </Text>


                        <Text
                            style={
                                styles.subtitle
                            }
                        >
                            Administração de contas
                        </Text>

                    </View>

                </View>


                <Pressable
                    style={
                        styles.createButton
                    }

                    onPress={() =>
                        navigation.navigate(
                            "CriarUsuarioAdmin"
                        )
                    }
                >

                    <Text
                        style={
                            styles.createButtonText
                        }
                    >
                        + NOVO USUÁRIO
                    </Text>

                </Pressable>


                {
                    carregando
                        ? (

                            <View
                                style={
                                    styles.loading
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
                                    Carregando usuários...
                                </Text>

                            </View>

                        )
                        : (

                            <View
                                style={
                                    styles.list
                                }
                            >

                                {
                                    usuarios.map(
                                        item => {

                                            const ehProprioUsuario =
                                                item.id ===
                                                usuario.id;


                                            const atualizando =
                                                atualizandoId ===
                                                item.id;


                                            return (

                                                <View
                                                    key={
                                                        item.id
                                                    }

                                                    style={
                                                        styles.card
                                                    }
                                                >

                                                    <View
                                                        style={
                                                            styles.cardHeader
                                                        }
                                                    >

                                                        <View
                                                            style={
                                                                styles.avatar
                                                            }
                                                        >

                                                            <Text
                                                                style={
                                                                    styles.avatarText
                                                                }
                                                            >
                                                                {
                                                                    item.nome
                                                                        .charAt(0)
                                                                        .toUpperCase()
                                                                }
                                                            </Text>

                                                        </View>


                                                        <View
                                                            style={
                                                                styles.userInfo
                                                            }
                                                        >

                                                            <Text
                                                                style={
                                                                    styles.userName
                                                                }
                                                            >
                                                                {
                                                                    item.nome
                                                                }

                                                                {
                                                                    ehProprioUsuario
                                                                        ? " (Você)"
                                                                        : ""
                                                                }
                                                            </Text>


                                                            <Text
                                                                style={
                                                                    styles.email
                                                                }
                                                            >
                                                                {
                                                                    item.email
                                                                }
                                                            </Text>

                                                        </View>


                                                        <View
                                                            style={[
                                                                styles.statusBadge,

                                                                item.ativo
                                                                    ? styles.activeBadge
                                                                    : styles.inactiveBadge,
                                                            ]}
                                                        >

                                                            <Text
                                                                style={[
                                                                    styles.statusText,

                                                                    item.ativo
                                                                        ? styles.activeText
                                                                        : styles.inactiveText,
                                                                ]}
                                                            >
                                                                {
                                                                    item.ativo
                                                                        ? "ATIVO"
                                                                        : "INATIVO"
                                                                }
                                                            </Text>

                                                        </View>

                                                    </View>


                                                    <View
                                                        style={
                                                            styles.typeRow
                                                        }
                                                    >

                                                        <Text
                                                            style={
                                                                styles.typeLabel
                                                            }
                                                        >
                                                            Tipo de conta
                                                        </Text>


                                                        <View
                                                            style={
                                                                item.tipo === "ADMIN"
                                                                    ? styles.adminBadge
                                                                    : styles.userBadge
                                                            }
                                                        >

                                                            <Text
                                                                style={
                                                                    item.tipo === "ADMIN"
                                                                        ? styles.adminText
                                                                        : styles.userText
                                                                }
                                                            >
                                                                {
                                                                    item.tipo === "ADMIN"
                                                                        ? "Administrador"
                                                                        : "Usuário"
                                                                }
                                                            </Text>

                                                        </View>

                                                    </View>


                                                    {
                                                        atualizando
                                                            ? (

                                                                <View
                                                                    style={
                                                                        styles.updating
                                                                    }
                                                                >

                                                                    <ActivityIndicator
                                                                        color={
                                                                            colors.primary
                                                                        }
                                                                    />

                                                                </View>

                                                            )
                                                            : (

                                                                <View
                                                                    style={
                                                                        styles.actions
                                                                    }
                                                                >

                                                                    <Pressable
                                                                        style={[
                                                                            styles.actionButton,

                                                                            ehProprioUsuario &&
                                                                            styles.disabledButton,
                                                                        ]}

                                                                        disabled={
                                                                            ehProprioUsuario
                                                                        }

                                                                        onPress={() =>
                                                                            alterarTipo(
                                                                                item
                                                                            )
                                                                        }
                                                                    >

                                                                        <Text
                                                                            style={
                                                                                styles.actionButtonText
                                                                            }
                                                                        >
                                                                            {
                                                                                item.tipo === "ADMIN"
                                                                                    ? "TORNAR USUÁRIO"
                                                                                    : "TORNAR ADMIN"
                                                                            }
                                                                        </Text>

                                                                    </Pressable>


                                                                    <Pressable
                                                                        style={[
                                                                            styles.statusButton,

                                                                            !item.ativo &&
                                                                            styles.activateButton,

                                                                            ehProprioUsuario &&
                                                                            styles.disabledButton,
                                                                        ]}

                                                                        disabled={
                                                                            ehProprioUsuario
                                                                        }

                                                                        onPress={() =>
                                                                            alterarStatus(
                                                                                item
                                                                            )
                                                                        }
                                                                    >

                                                                        <Text
                                                                            style={
                                                                                styles.statusButtonText
                                                                            }
                                                                        >
                                                                            {
                                                                                item.ativo
                                                                                    ? "DESATIVAR"
                                                                                    : "ATIVAR"
                                                                            }
                                                                        </Text>

                                                                    </Pressable>

                                                                </View>

                                                            )
                                                    }

                                                </View>

                                            );
                                        }
                                    )
                                }

                            </View>

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


        center: {
            flex: 1,

            alignItems:
                "center",

            justifyContent:
                "center",

            padding: 30,

            backgroundColor:
            colors.background,
        },


        errorText: {
            textAlign:
                "center",

            color:
            colors.textSecondary,
        },


        top: {
            marginTop: 10,

            flexDirection:
                "row",

            alignItems:
                "center",
        },


        backButton: {
            width: 44,

            height: 44,

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


        titleContainer: {
            marginLeft: 15,
        },


        title: {
            fontSize: 25,

            fontWeight:
                "900",

            color:
            colors.text,
        },


        subtitle: {
            marginTop: 2,

            fontSize: 12,

            color:
            colors.textSecondary,
        },


        createButton: {
            height: 52,

            marginTop: 25,

            borderRadius: 16,

            backgroundColor:
            colors.primary,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        createButtonText: {
            fontSize: 13,

            fontWeight:
                "900",

            color:
                "#FFFFFF",
        },


        loading: {
            paddingVertical: 70,

            alignItems:
                "center",
        },


        loadingText: {
            marginTop: 12,

            color:
            colors.textSecondary,
        },


        list: {
            marginTop: 18,

            gap: 12,
        },


        card: {
            padding: 16,

            borderRadius: 20,

            backgroundColor:
            colors.surface,
        },


        cardHeader: {
            flexDirection:
                "row",

            alignItems:
                "center",
        },


        avatar: {
            width: 44,

            height: 44,

            borderRadius: 22,

            backgroundColor:
            colors.primaryLight,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        avatarText: {
            fontSize: 17,

            fontWeight:
                "900",

            color:
            colors.primaryDark,
        },


        userInfo: {
            flex: 1,

            marginLeft: 11,

            marginRight: 8,
        },


        userName: {
            fontSize: 14,

            fontWeight:
                "900",

            color:
            colors.text,
        },


        email: {
            marginTop: 3,

            fontSize: 11,

            color:
            colors.textSecondary,
        },


        statusBadge: {
            paddingHorizontal: 8,

            paddingVertical: 5,

            borderRadius: 10,
        },


        activeBadge: {
            backgroundColor:
            colors.primaryLight,
        },


        inactiveBadge: {
            backgroundColor:
                "#ECECEC",
        },


        statusText: {
            fontSize: 9,

            fontWeight:
                "900",
        },


        activeText: {
            color:
            colors.primaryDark,
        },


        inactiveText: {
            color:
                "#777777",
        },


        typeRow: {
            marginTop: 15,

            paddingTop: 13,

            borderTopWidth: 1,

            borderTopColor:
            colors.border,

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "space-between",
        },


        typeLabel: {
            fontSize: 11,

            color:
            colors.textSecondary,
        },


        adminBadge: {
            paddingHorizontal: 10,

            paddingVertical: 6,

            borderRadius: 10,

            backgroundColor:
            colors.primaryLight,
        },


        adminText: {
            fontSize: 10,

            fontWeight:
                "900",

            color:
            colors.primaryDark,
        },


        userBadge: {
            paddingHorizontal: 10,

            paddingVertical: 6,

            borderRadius: 10,

            backgroundColor:
                "#EEEEEE",
        },


        userText: {
            fontSize: 10,

            fontWeight:
                "800",

            color:
            colors.textSecondary,
        },


        actions: {
            marginTop: 15,

            flexDirection:
                "row",

            gap: 8,
        },


        actionButton: {
            flex: 1,

            minHeight: 40,

            paddingHorizontal: 8,

            borderRadius: 12,

            backgroundColor:
            colors.primaryLight,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        actionButtonText: {
            fontSize: 9,

            fontWeight:
                "900",

            color:
            colors.primaryDark,

            textAlign:
                "center",
        },


        statusButton: {
            flex: 1,

            minHeight: 40,

            paddingHorizontal: 8,

            borderWidth: 1,

            borderColor:
                "#999999",

            borderRadius: 12,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        activateButton: {
            borderColor:
            colors.primary,
        },


        statusButtonText: {
            fontSize: 9,

            fontWeight:
                "900",

            color:
            colors.text,
        },


        disabledButton: {
            opacity: 0.35,
        },


        updating: {
            minHeight: 55,

            alignItems:
                "center",

            justifyContent:
                "center",
        },

    });