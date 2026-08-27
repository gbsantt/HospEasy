import {
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
    criarUsuarioAdmin,
    TipoUsuario,
} from "../service/api";

import {
    colors,
} from "../theme/colors";


type Props =
    NativeStackScreenProps<
        RootStackParamList,
        "CriarUsuarioAdmin"
    >;


export default function CriarUsuarioAdminScreen({
                                                    navigation,
                                                }: Props) {

    const {
        usuario,
    } = useAuth();


    const [
        nome,
        setNome,
    ] = useState("");


    const [
        email,
        setEmail,
    ] = useState("");


    const [
        senha,
        setSenha,
    ] = useState("");


    const [
        confirmarSenha,
        setConfirmarSenha,
    ] = useState("");


    const [
        tipo,
        setTipo,
    ] = useState<TipoUsuario>(
        "USUARIO"
    );


    const [
        carregando,
        setCarregando,
    ] = useState(
        false
    );


    async function cadastrar() {

        if (
            !usuario ||
            usuario.tipo !== "ADMIN"
        ) {

            Alert.alert(
                "Acesso negado",
                "Você não possui permissão para criar usuários."
            );

            return;
        }


        const nomeLimpo =
            nome.trim();


        const emailLimpo =
            email
                .trim()
                .toLowerCase();


        if (
            !nomeLimpo ||
            !emailLimpo ||
            !senha ||
            !confirmarSenha
        ) {

            Alert.alert(
                "Campos obrigatórios",
                "Preencha todos os campos."
            );

            return;
        }


        if (
            !emailLimpo.includes("@") ||
            !emailLimpo.includes(".")
        ) {

            Alert.alert(
                "E-mail inválido",
                "Digite um endereço de e-mail válido."
            );

            return;
        }


        if (
            senha.length < 6
        ) {

            Alert.alert(
                "Senha muito curta",
                "A senha deve possuir no mínimo 6 caracteres."
            );

            return;
        }


        if (
            senha !== confirmarSenha
        ) {

            Alert.alert(
                "Senhas diferentes",
                "A confirmação da senha não corresponde à senha digitada."
            );

            return;
        }


        try {

            setCarregando(
                true
            );


            await criarUsuarioAdmin(
                {
                    nome:
                    nomeLimpo,

                    email:
                    emailLimpo,

                    senha,

                    tipo,
                },

                usuario.token
            );


            Alert.alert(
                "Usuário criado",
                "A conta foi criada com sucesso.",
                [
                    {
                        text:
                            "OK",

                        onPress:
                            () =>
                                navigation.goBack(),
                    },
                ]
            );

        } catch (erro) {

            console.error(
                erro
            );


            Alert.alert(
                "Não foi possível criar",

                erro instanceof Error
                    ? erro.message
                    : "Ocorreu um erro ao criar o usuário."
            );

        } finally {

            setCarregando(
                false
            );
        }
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
                        styles.accessDenied
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

                keyboardShouldPersistTaps={
                    "handled"
                }

                showsVerticalScrollIndicator={
                    false
                }
            >

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
                            styles.headerText
                        }
                    >

                        <Text
                            style={
                                styles.title
                            }
                        >
                            Novo usuário
                        </Text>


                        <Text
                            style={
                                styles.subtitle
                            }
                        >
                            Crie uma nova conta no HospEasy
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

                        placeholder={
                            "Nome completo"
                        }

                        placeholderTextColor={
                            "#999999"
                        }

                        autoCapitalize={
                            "words"
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

                        placeholder={
                            "usuario@email.com"
                        }

                        placeholderTextColor={
                            "#999999"
                        }

                        keyboardType={
                            "email-address"
                        }

                        autoCapitalize={
                            "none"
                        }

                        autoCorrect={
                            false
                        }
                    />


                    <Text
                        style={
                            styles.label
                        }
                    >
                        Tipo de conta
                    </Text>


                    <View
                        style={
                            styles.typeContainer
                        }
                    >

                        <Pressable
                            style={[
                                styles.typeButton,

                                tipo === "USUARIO" &&
                                styles.typeButtonSelected,
                            ]}

                            onPress={() =>
                                setTipo(
                                    "USUARIO"
                                )
                            }
                        >

                            <Text
                                style={[
                                    styles.typeButtonText,

                                    tipo === "USUARIO" &&
                                    styles.typeButtonTextSelected,
                                ]}
                            >
                                USUÁRIO
                            </Text>

                        </Pressable>


                        <Pressable
                            style={[
                                styles.typeButton,

                                tipo === "ADMIN" &&
                                styles.typeButtonSelected,
                            ]}

                            onPress={() =>
                                setTipo(
                                    "ADMIN"
                                )
                            }
                        >

                            <Text
                                style={[
                                    styles.typeButtonText,

                                    tipo === "ADMIN" &&
                                    styles.typeButtonTextSelected,
                                ]}
                            >
                                ADMIN
                            </Text>

                        </Pressable>

                    </View>


                    <View
                        style={
                            styles.typeInfo
                        }
                    >

                        <Text
                            style={
                                styles.typeInfoTitle
                            }
                        >
                            {
                                tipo === "ADMIN"
                                    ? "Administrador"
                                    : "Usuário comum"
                            }
                        </Text>


                        <Text
                            style={
                                styles.typeInfoText
                            }
                        >
                            {
                                tipo === "ADMIN"
                                    ? "Terá acesso às funções administrativas do sistema."
                                    : "Terá acesso normal ao aplicativo, sem permissões administrativas."
                            }
                        </Text>

                    </View>


                    <Text
                        style={
                            styles.label
                        }
                    >
                        Senha
                    </Text>


                    <TextInput
                        style={
                            styles.input
                        }

                        value={
                            senha
                        }

                        onChangeText={
                            setSenha
                        }

                        placeholder={
                            "Mínimo de 6 caracteres"
                        }

                        placeholderTextColor={
                            "#999999"
                        }

                        secureTextEntry
                    />


                    <Text
                        style={
                            styles.label
                        }
                    >
                        Confirmar senha
                    </Text>


                    <TextInput
                        style={
                            styles.input
                        }

                        value={
                            confirmarSenha
                        }

                        onChangeText={
                            setConfirmarSenha
                        }

                        placeholder={
                            "Digite a senha novamente"
                        }

                        placeholderTextColor={
                            "#999999"
                        }

                        secureTextEntry
                    />


                    <Pressable
                        style={[
                            styles.createButton,

                            carregando &&
                            styles.disabledButton,
                        ]}

                        disabled={
                            carregando
                        }

                        onPress={
                            cadastrar
                        }
                    >

                        <Text
                            style={
                                styles.createButtonText
                            }
                        >
                            {
                                carregando
                                    ? "CRIANDO..."
                                    : "CRIAR USUÁRIO"
                            }
                        </Text>

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


        accessDenied: {
            textAlign:
                "center",

            color:
            colors.textSecondary,
        },


        header: {
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


        headerText: {
            flex: 1,

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
            marginTop: 3,

            fontSize: 12,

            color:
            colors.textSecondary,
        },


        form: {
            marginTop: 30,
        },


        label: {
            marginBottom: 8,

            marginTop: 18,

            fontSize: 12,

            fontWeight:
                "800",

            color:
            colors.text,
        },


        input: {
            minHeight: 52,

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


        typeContainer: {
            flexDirection:
                "row",

            gap: 10,
        },


        typeButton: {
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


        typeButtonSelected: {
            borderColor:
            colors.primary,

            backgroundColor:
            colors.primaryLight,
        },


        typeButtonText: {
            fontSize: 11,

            fontWeight:
                "900",

            color:
            colors.textSecondary,
        },


        typeButtonTextSelected: {
            color:
            colors.primaryDark,
        },


        typeInfo: {
            marginTop: 12,

            padding: 14,

            borderRadius: 14,

            backgroundColor:
            colors.primaryLight,
        },


        typeInfoTitle: {
            fontSize: 12,

            fontWeight:
                "900",

            color:
            colors.primaryDark,
        },


        typeInfoText: {
            marginTop: 4,

            fontSize: 11,

            lineHeight: 16,

            color:
            colors.textSecondary,
        },


        createButton: {
            height: 54,

            marginTop: 30,

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


        disabledButton: {
            opacity: 0.55,
        },

    });