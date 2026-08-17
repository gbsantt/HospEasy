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
        "Login"
    >;


export default function LoginScreen({
                                        navigation,
                                    }: Props) {

    const {
        login,
    } = useAuth();


    const [
        email,
        setEmail,
    ] =
        useState("");


    const [
        senha,
        setSenha,
    ] =
        useState("");


    const [
        enviando,
        setEnviando,
    ] =
        useState(false);


    const [
        erro,
        setErro,
    ] =
        useState<string | null>(
            null
        );


    async function entrar() {

        if (
            !email.trim() ||
            !senha
        ) {

            setErro(
                "Preencha email e senha."
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


            await login(
                email.trim(),
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
                "Erro no login:",
                erro
            );


            if (
                erro instanceof Error &&
                erro.message ===
                "EMAIL_SENHA_INVALIDOS"
            ) {

                setErro(
                    "Email ou senha inválidos."
                );

            } else {

                setErro(
                    "Não foi possível entrar."
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
                    styles.content
                }
            >

                <Text
                    style={
                        styles.title
                    }
                >
                    Entrar
                </Text>


                <Text
                    style={
                        styles.subtitle
                    }
                >
                    Acesse sua conta HospEasy.
                </Text>


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

                    placeholder="Sua senha"

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
                        entrar
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
                                    ENTRAR
                                </Text>

                            )
                    }

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

            paddingBottom: 60,
        },


        title: {

            fontSize: 34,

            fontWeight: "900",

            color:
            colors.text,
        },


        subtitle: {

            marginTop: 7,

            marginBottom: 30,

            fontSize: 14,

            color:
            colors.textSecondary,
        },


        label: {

            marginTop: 15,

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

            marginTop: 26,

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

    });