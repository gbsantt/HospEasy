import BackChevron from "../components/BackChevron";
import {
    useState,
} from "react";

import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

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
    colors,
} from "../theme/colors";


type Props =
    NativeStackScreenProps<
        RootStackParamList,
        "Register"
    >;


export default function RegisterScreen({
                                           navigation,
                                       }: Props) {

    const {
        cadastro,
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
        enviando,
        setEnviando,
    ] = useState(false);


    const [
        erro,
        setErro,
    ] =
        useState<string | null>(
            null
        );


    async function cadastrar() {

        if (
            !nome.trim() ||
            !email.trim() ||
            !senha ||
            !confirmarSenha
        ) {

            setErro(
                "Preencha todos os campos."
            );

            return;
        }


        if (
            senha.length < 6
        ) {

            setErro(
                "A senha deve ter pelo menos 6 caracteres."
            );

            return;
        }


        if (
            senha !==
            confirmarSenha
        ) {

            setErro(
                "As senhas não coincidem."
            );

            return;
        }


        try {

            setEnviando(
                true
            );

            setErro(
                null
            );


            await cadastro(
                nome,
                email,
                senha
            );


            navigation.reset({
                index: 0,

                routes: [
                    {
                        name: "Home",
                    },
                ],
            });

        } catch (erro) {

            console.error(
                "Erro no cadastro:",
                erro
            );


            if (
                erro instanceof Error &&
                erro.message ===
                "EMAIL_JA_CADASTRADO"
            ) {

                setErro(
                    "Este email já está cadastrado."
                );

            } else {

                setErro(
                    "Não foi possível criar sua conta."
                );
            }

        } finally {

            setEnviando(
                false
            );
        }
    }


    return (

        <View
            style={
                styles.container
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
                    styles.content
                }
            >

                <Text
                    style={
                        styles.title
                    }
                >
                    Criar conta
                </Text>


                <Text
                    style={
                        styles.subtitle
                    }
                >
                    Crie sua conta HospEasy.
                </Text>


                <Text
                    style={
                        styles.label
                    }
                >
                    Nome
                </Text>


                <TextInput
                    value={
                        nome
                    }

                    onChangeText={
                        setNome
                    }

                    placeholder="Seu nome"

                    placeholderTextColor={
                        colors.textSecondary
                    }

                    style={
                        styles.input
                    }
                />


                <Text
                    style={
                        styles.label
                    }
                >
                    Email
                </Text>


                <TextInput
                    value={
                        email
                    }

                    onChangeText={
                        setEmail
                    }

                    placeholder="seu@email.com"

                    placeholderTextColor={
                        colors.textSecondary
                    }

                    keyboardType="email-address"

                    autoCapitalize="none"

                    style={
                        styles.input
                    }
                />


                <Text
                    style={
                        styles.label
                    }
                >
                    Senha
                </Text>


                <TextInput
                    value={
                        senha
                    }

                    onChangeText={
                        setSenha
                    }

                    placeholder="Mínimo de 6 caracteres"

                    placeholderTextColor={
                        colors.textSecondary
                    }

                    secureTextEntry

                    style={
                        styles.input
                    }
                />


                <Text
                    style={
                        styles.label
                    }
                >
                    Confirmar senha
                </Text>


                <TextInput
                    value={
                        confirmarSenha
                    }

                    onChangeText={
                        setConfirmarSenha
                    }

                    placeholder="Digite a senha novamente"

                    placeholderTextColor={
                        colors.textSecondary
                    }

                    secureTextEntry

                    style={
                        styles.input
                    }
                />


                {
                    erro && (

                        <Text
                            style={
                                styles.error
                            }
                        >
                            {erro}
                        </Text>

                    )
                }


                <Pressable
                    disabled={
                        enviando
                    }

                    style={[
                        styles.button,

                        enviando &&
                        styles.buttonDisabled,
                    ]}

                    onPress={
                        cadastrar
                    }
                >

                    {
                        enviando
                            ? (

                                <ActivityIndicator
                                    color="#FFFFFF"
                                />

                            )
                            : (

                                <Text
                                    style={
                                        styles.buttonText
                                    }
                                >
                                    CRIAR CONTA
                                </Text>

                            )
                    }

                </Pressable>


                <Pressable
                    onPress={() =>
                        navigation.navigate(
                            "Login"
                        )
                    }

                    style={
                        styles.loginLink
                    }
                >

                    <Text
                        style={
                            styles.loginLinkText
                        }
                    >
                        Já tem uma conta? Entrar
                    </Text>

                </Pressable>

            </View>

        </View>
    );
}


const styles =
    StyleSheet.create({

        container: {

            flex: 1,

            padding: 20,

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


        content: {

            flex: 1,

            justifyContent:
                "center",

            paddingBottom: 40,
        },


        title: {

            fontSize: 34,

            fontWeight: "900",

            color:
            colors.text,
        },


        subtitle: {

            marginTop: 7,

            marginBottom: 22,

            fontSize: 14,

            color:
            colors.textSecondary,
        },


        label: {

            marginTop: 12,

            marginBottom: 7,

            fontSize: 13,

            fontWeight: "800",

            color:
            colors.text,
        },


        input: {

            height: 54,

            paddingHorizontal: 16,

            borderWidth: 1.5,

            borderColor:
            colors.border,

            borderRadius: 17,

            backgroundColor:
            colors.surface,

            fontSize: 15,

            color:
            colors.text,
        },


        error: {

            marginTop: 15,

            fontSize: 13,

            fontWeight: "700",

            textAlign: "center",

            color:
            colors.danger,
        },


        button: {

            height: 56,

            marginTop: 24,

            borderRadius: 18,

            backgroundColor:
            colors.primary,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        buttonDisabled: {

            opacity: 0.65,
        },


        buttonText: {

            fontSize: 14,

            fontWeight: "900",

            letterSpacing: 0.8,

            color: "#FFFFFF",
        },


        loginLink: {

            marginTop: 20,

            alignItems:
                "center",
        },


        loginLinkText: {

            fontSize: 13,

            fontWeight: "700",

            color:
            colors.primaryDark,
        },

    });