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
    verificarCodigoRecuperacao,
} from "../service/api";

import {
    colors,
} from "../theme/colors";


type Props =
    NativeStackScreenProps<
        RootStackParamList,
        "VerifyCode"
    >;


export default function VerifyCodeScreen({
                                             navigation,
                                             route,
                                         }: Props) {

    const {
        email,
    } = route.params;


    const [
        codigo,
        setCodigo,
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

        const codigoTratado =
            codigo.trim();


        if (
            codigoTratado.length !== 6
        ) {

            setErro(
                "Digite o código de 6 dígitos."
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


            await verificarCodigoRecuperacao(
                email,
                codigoTratado
            );


            navigation.navigate(
                "ResetPassword",
                {
                    email,
                    codigo:
                    codigoTratado,
                }
            );

        } catch (erro) {

            console.error(
                "Erro ao verificar código:",
                erro
            );


            setErro(
                "Código inválido ou expirado."
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
                    Verifique o código
                </Text>


                <Text
                    style={
                        styles.subtitle
                    }
                >
                    Digite o código de 6 dígitos
                    para continuar.
                </Text>


                <Text
                    style={
                        styles.email
                    }
                >
                    {email}
                </Text>


                <Text
                    style={
                        styles.label
                    }
                >
                    Código
                </Text>


                <TextInput
                    value={
                        codigo
                    }

                    onChangeText={(texto) =>
                        setCodigo(
                            texto
                                .replace(
                                    /\D/g,
                                    ""
                                )
                                .slice(
                                    0,
                                    6
                                )
                        )
                    }

                    placeholder="000000"

                    placeholderTextColor={
                        colors.textSecondary
                    }

                    keyboardType="number-pad"

                    maxLength={
                        6
                    }

                    style={
                        styles.codeInput
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

            fontSize: 14,

            color:
            colors.textSecondary,
        },


        email: {

            marginTop: 8,

            marginBottom: 25,

            fontSize: 14,

            fontWeight: "800",

            color:
            colors.primaryDark,
        },


        label: {

            marginBottom: 7,

            fontSize: 13,

            fontWeight: "800",

            color:
            colors.text,
        },


        codeInput: {

            height: 60,

            paddingHorizontal: 16,

            borderWidth: 1.5,

            borderColor:
            colors.border,

            borderRadius: 17,

            backgroundColor:
            colors.surface,

            fontSize: 24,

            fontWeight: "900",

            letterSpacing: 8,

            textAlign: "center",

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