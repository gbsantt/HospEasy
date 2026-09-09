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
    redefinirSenha,
} from "../service/api";

import {
    colors,
} from "../theme/colors";


type Props =
    NativeStackScreenProps<
        RootStackParamList,
        "ResetPassword"
    >;


export default function ResetPasswordScreen({
                                                navigation,
                                                route,
                                            }: Props) {

    const {
        email,
        codigo,
    } = route.params;


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
    ] = useState<string | null>(
        null
    );


    async function salvar() {

        if (
            senha.length < 6
        ) {

            setErro(
                "A senha precisa ter pelo menos 6 caracteres."
            );

            return;
        }


        if (
            senha !== confirmarSenha
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


            await redefinirSenha(
                email,
                codigo,
                senha
            );


            navigation.reset({
                index: 0,

                routes: [
                    {
                        name:
                            "Login",
                    },
                ],
            });

        } catch (erro) {

            console.error(
                "Erro ao redefinir senha:",
                erro
            );


            setErro(
                "Não foi possível redefinir sua senha."
            );

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
                    Nova senha
                </Text>


                <Text
                    style={
                        styles.subtitle
                    }
                >
                    Escolha uma nova senha
                    para sua conta HospEasy.
                </Text>


                <Text
                    style={
                        styles.label
                    }
                >
                    Nova senha
                </Text>


                <TextInput
                    value={
                        senha
                    }

                    onChangeText={
                        setSenha
                    }

                    placeholder="Nova senha"

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

                    placeholder="Digite novamente"

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
                        salvar
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
                                    SALVAR NOVA SENHA
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