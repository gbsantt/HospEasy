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
    solicitarRecuperacaoSenha,
} from "../service/api";

import {
    colors,
} from "../theme/colors";


type Props =
    NativeStackScreenProps<
        RootStackParamList,
        "ForgotPassword"
    >;


export default function ForgotPasswordScreen({
                                                 navigation,
                                             }: Props) {

    const [
        email,
        setEmail,
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


    async function continuar() {

        const emailTratado =
            email
                .trim()
                .toLowerCase();


        if (!emailTratado) {

            setErro(
                "Digite seu email."
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


            const codigo =
                await solicitarRecuperacaoSenha(
                    emailTratado
                );


            console.log(
                "Código de recuperação:",
                codigo
            );


            navigation.navigate(
                "VerifyCode",
                {
                    email:
                    emailTratado,
                }
            );

        } catch (erro) {

            console.error(
                "Erro ao recuperar senha:",
                erro
            );


            if (
                erro instanceof Error &&
                erro.message ===
                "EMAIL_NAO_ENCONTRADO"
            ) {

                setErro(
                    "Não encontramos uma conta com esse email."
                );

            } else {

                setErro(
                    "Não foi possível solicitar a recuperação."
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
                    Esqueceu a senha?
                </Text>


                <Text
                    style={
                        styles.subtitle
                    }
                >
                    Digite o email da sua conta
                    para recuperar o acesso.
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

                    autoCorrect={
                        false
                    }

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
                        continuar
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
                                    CONTINUAR
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

            lineHeight: 21,

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