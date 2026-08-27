import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    useState,
} from "react";

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
    atualizarUsuarioAdmin,
    TipoUsuario,
} from "../service/api";

import {
    colors,
} from "../theme/colors";


type Props =
    NativeStackScreenProps<
        RootStackParamList,
        "EditarUsuarioAdmin"
    >;


export default function EditarUsuarioAdminScreen({
                                                     navigation,
                                                     route,
                                                 }: Props) {

    const {
        usuario: adminLogado,
    } = useAuth();


    const usuarioEditado =
        route.params.usuario;


    const ehPropriaConta =
        adminLogado?.id ===
        usuarioEditado.id;


    const [
        nome,
        setNome,
    ] = useState(
        usuarioEditado.nome
    );


    const [
        email,
        setEmail,
    ] = useState(
        usuarioEditado.email
    );


    const [
        tipo,
        setTipo,
    ] = useState<TipoUsuario>(
        usuarioEditado.tipo
    );


    const [
        ativo,
        setAtivo,
    ] = useState(
        usuarioEditado.ativo
    );


    const [
        salvando,
        setSalvando,
    ] = useState(
        false
    );


    async function salvar() {

        if (
            !adminLogado ||
            adminLogado.tipo !== "ADMIN"
        ) {

            Alert.alert(
                "Sem permissão",
                "Você não possui permissão para realizar esta ação."
            );

            return;
        }


        const nomeLimpo =
            nome.trim();


        const emailLimpo =
            email
                .trim()
                .toLowerCase();


        if (!nomeLimpo) {

            Alert.alert(
                "Nome obrigatório",
                "Informe o nome do usuário."
            );

            return;
        }


        if (
            !emailLimpo ||
            !emailLimpo.includes("@") ||
            !emailLimpo.includes(".")
        ) {

            Alert.alert(
                "E-mail inválido",
                "Informe um e-mail válido."
            );

            return;
        }


        try {

            setSalvando(
                true
            );


            await atualizarUsuarioAdmin(

                usuarioEditado.id,

                {
                    nome:
                    nomeLimpo,

                    email:
                    emailLimpo,

                    tipo,

                    ativo,
                },

                adminLogado.token
            );


            Alert.alert(
                "Usuário atualizado",
                "As alterações foram salvas com sucesso.",
                [
                    {
                        text:
                            "OK",

                        onPress: () =>
                            navigation.goBack(),
                    },
                ]
            );

        } catch (erro) {

            Alert.alert(
                "Não foi possível salvar",

                erro instanceof Error
                    ? erro.message
                    : "Ocorreu um erro ao atualizar o usuário."
            );

        } finally {

            setSalvando(
                false
            );
        }
    }


    if (
        !adminLogado ||
        adminLogado.tipo !== "ADMIN"
    ) {

        return (

            <View
                style={
                    styles.center
                }
            >

                <Text
                    style={
                        styles.permissionText
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

                keyboardShouldPersistTaps="handled"

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
                            Editar usuário
                        </Text>


                        <Text
                            style={
                                styles.subtitle
                            }
                        >
                            Atualize os dados da conta
                        </Text>

                    </View>

                </View>


                <View
                    style={
                        styles.userCard
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
                                usuarioEditado.nome
                                    .charAt(0)
                                    .toUpperCase()
                            }
                        </Text>

                    </View>


                    <View
                        style={
                            styles.userCardContent
                        }
                    >

                        <Text
                            style={
                                styles.userCardName
                            }
                        >
                            {
                                usuarioEditado.nome
                            }

                            {
                                ehPropriaConta
                                    ? " (Você)"
                                    : ""
                            }
                        </Text>


                        <Text
                            style={
                                styles.userCardEmail
                            }
                        >
                            {
                                usuarioEditado.email
                            }
                        </Text>

                    </View>

                </View>


                <View
                    style={
                        styles.form
                    }
                >

                    <Text
                        style={
                            styles.label
                        }
                    >
                        Nome
                    </Text>


                    <TextInput
                        style={
                            styles.input
                        }

                        value={
                            nome
                        }

                        onChangeText={
                            setNome
                        }

                        placeholder="Nome do usuário"

                        placeholderTextColor={
                            colors.textSecondary
                        }

                        editable={
                            !salvando
                        }
                    />


                    <Text
                        style={
                            styles.label
                        }
                    >
                        E-mail
                    </Text>


                    <TextInput
                        style={
                            styles.input
                        }

                        value={
                            email
                        }

                        onChangeText={
                            setEmail
                        }

                        placeholder="email@exemplo.com"

                        placeholderTextColor={
                            colors.textSecondary
                        }

                        autoCapitalize="none"

                        keyboardType="email-address"

                        editable={
                            !salvando
                        }
                    />


                    <Text
                        style={
                            styles.sectionLabel
                        }
                    >
                        Tipo de conta
                    </Text>


                    {
                        ehPropriaConta
                            ? (

                                <View
                                    style={
                                        styles.lockedCard
                                    }
                                >

                                    <Text
                                        style={
                                            styles.lockedTitle
                                        }
                                    >
                                        Administrador
                                    </Text>


                                    <Text
                                        style={
                                            styles.lockedDescription
                                        }
                                    >
                                        Você não pode remover
                                        seu próprio acesso de administrador.
                                    </Text>

                                </View>

                            )
                            : (

                                <View
                                    style={
                                        styles.optionsRow
                                    }
                                >

                                    <Pressable
                                        style={[
                                            styles.option,

                                            tipo === "USUARIO" &&
                                            styles.optionSelected,
                                        ]}

                                        disabled={
                                            salvando
                                        }

                                        onPress={() =>
                                            setTipo(
                                                "USUARIO"
                                            )
                                        }
                                    >

                                        <Text
                                            style={[
                                                styles.optionText,

                                                tipo === "USUARIO" &&
                                                styles.optionTextSelected,
                                            ]}
                                        >
                                            USUÁRIO
                                        </Text>

                                    </Pressable>


                                    <Pressable
                                        style={[
                                            styles.option,

                                            tipo === "ADMIN" &&
                                            styles.optionSelected,
                                        ]}

                                        disabled={
                                            salvando
                                        }

                                        onPress={() =>
                                            setTipo(
                                                "ADMIN"
                                            )
                                        }
                                    >

                                        <Text
                                            style={[
                                                styles.optionText,

                                                tipo === "ADMIN" &&
                                                styles.optionTextSelected,
                                            ]}
                                        >
                                            ADMIN
                                        </Text>

                                    </Pressable>

                                </View>
                            )
                    }


                    <Text
                        style={
                            styles.sectionLabel
                        }
                    >
                        Status da conta
                    </Text>


                    {
                        ehPropriaConta
                            ? (

                                <View
                                    style={
                                        styles.lockedCard
                                    }
                                >

                                    <View
                                        style={
                                            styles.statusLine
                                        }
                                    >

                                        <View
                                            style={
                                                styles.statusDot
                                            }
                                        />


                                        <Text
                                            style={
                                                styles.lockedTitle
                                            }
                                        >
                                            Conta ativa
                                        </Text>

                                    </View>


                                    <Text
                                        style={
                                            styles.lockedDescription
                                        }
                                    >
                                        Você não pode desativar
                                        sua própria conta.
                                    </Text>

                                </View>

                            )
                            : (

                                <View
                                    style={
                                        styles.optionsRow
                                    }
                                >

                                    <Pressable
                                        style={[
                                            styles.option,

                                            ativo &&
                                            styles.optionSelected,
                                        ]}

                                        disabled={
                                            salvando
                                        }

                                        onPress={() =>
                                            setAtivo(
                                                true
                                            )
                                        }
                                    >

                                        <Text
                                            style={[
                                                styles.optionText,

                                                ativo &&
                                                styles.optionTextSelected,
                                            ]}
                                        >
                                            ATIVO
                                        </Text>

                                    </Pressable>


                                    <Pressable
                                        style={[
                                            styles.option,

                                            !ativo &&
                                            styles.optionSelected,
                                        ]}

                                        disabled={
                                            salvando
                                        }

                                        onPress={() =>
                                            setAtivo(
                                                false
                                            )
                                        }
                                    >

                                        <Text
                                            style={[
                                                styles.optionText,

                                                !ativo &&
                                                styles.optionTextSelected,
                                            ]}
                                        >
                                            INATIVO
                                        </Text>

                                    </Pressable>

                                </View>
                            )
                    }


                    <Pressable
                        style={[
                            styles.saveButton,

                            salvando &&
                            styles.saveButtonDisabled,
                        ]}

                        disabled={
                            salvando
                        }

                        onPress={
                            salvar
                        }
                    >

                        {
                            salvando
                                ? (

                                    <ActivityIndicator
                                        color="#FFFFFF"
                                    />

                                )
                                : (

                                    <Text
                                        style={
                                            styles.saveButtonText
                                        }
                                    >
                                        SALVAR ALTERAÇÕES
                                    </Text>
                                )
                        }

                    </Pressable>

                </View>

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


        permissionText: {
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


        userCard: {
            marginTop: 25,

            padding: 16,

            borderRadius: 20,

            backgroundColor:
            colors.surface,

            flexDirection:
                "row",

            alignItems:
                "center",
        },


        avatar: {
            width: 48,

            height: 48,

            borderRadius: 24,

            backgroundColor:
            colors.primaryLight,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        avatarText: {
            fontSize: 18,

            fontWeight:
                "900",

            color:
            colors.primaryDark,
        },


        userCardContent: {
            flex: 1,

            marginLeft: 13,
        },


        userCardName: {
            fontSize: 15,

            fontWeight:
                "900",

            color:
            colors.text,
        },


        userCardEmail: {
            marginTop: 3,

            fontSize: 11,

            color:
            colors.textSecondary,
        },


        form: {
            marginTop: 22,
        },


        label: {
            marginBottom: 7,

            fontSize: 12,

            fontWeight:
                "800",

            color:
            colors.text,
        },


        input: {
            height: 52,

            marginBottom: 17,

            paddingHorizontal: 15,

            borderWidth: 1,

            borderColor:
            colors.border,

            borderRadius: 15,

            backgroundColor:
            colors.surface,

            fontSize: 14,

            color:
            colors.text,
        },


        sectionLabel: {
            marginTop: 5,

            marginBottom: 9,

            fontSize: 12,

            fontWeight:
                "800",

            color:
            colors.text,
        },


        optionsRow: {
            flexDirection:
                "row",

            gap: 10,

            marginBottom: 20,
        },


        option: {
            flex: 1,

            height: 48,

            borderWidth: 1,

            borderColor:
            colors.border,

            borderRadius: 14,

            backgroundColor:
            colors.surface,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        optionSelected: {
            borderColor:
            colors.primary,

            backgroundColor:
            colors.primaryLight,
        },


        optionText: {
            fontSize: 11,

            fontWeight:
                "900",

            color:
            colors.textSecondary,
        },


        optionTextSelected: {
            color:
            colors.primaryDark,
        },


        lockedCard: {
            padding: 15,

            marginBottom: 20,

            borderRadius: 15,

            backgroundColor:
            colors.primaryLight,
        },


        lockedTitle: {
            fontSize: 12,

            fontWeight:
                "900",

            color:
            colors.primaryDark,
        },


        lockedDescription: {
            marginTop: 5,

            fontSize: 11,

            lineHeight: 16,

            color:
            colors.textSecondary,
        },


        statusLine: {
            flexDirection:
                "row",

            alignItems:
                "center",
        },


        statusDot: {
            width: 8,

            height: 8,

            marginRight: 7,

            borderRadius: 4,

            backgroundColor:
            colors.primary,
        },


        saveButton: {
            height: 54,

            marginTop: 12,

            borderRadius: 16,

            backgroundColor:
            colors.primary,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        saveButtonDisabled: {
            opacity: 0.6,
        },


        saveButtonText: {
            fontSize: 13,

            fontWeight:
                "900",

            color:
                "#FFFFFF",
        },

    });