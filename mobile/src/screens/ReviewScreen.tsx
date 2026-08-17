import {
    useState,
} from "react";

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
    NativeStackScreenProps,
} from "@react-navigation/native-stack";

import {
    RootStackParamList,
} from "../navigation/AppNavigator";

import {
    criarAvaliacao,
} from "../service/api";

import {
    colors,
} from "../theme/colors";


type Props =
    NativeStackScreenProps<
        RootStackParamList,
        "Review"
    >;


export default function ReviewScreen({
                                         route,
                                         navigation,
                                     }: Props) {

    const { unidade } =
        route.params;


    const [
        nota,
        setNota,
    ] = useState(0);


    const [
        comentario,
        setComentario,
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


    async function enviarAvaliacao() {

        if (nota === 0) {
            setErro(
                "Selecione uma nota antes de enviar."
            );

            return;
        }


        try {
            setEnviando(true);
            setErro(null);


            await criarAvaliacao(
                unidade.unidadeId,
                {
                    nota,
                    comentario:
                        comentario.trim(),
                }
            );


            Alert.alert(
                "Avaliação enviada",
                "Obrigado pela sua avaliação."
            );


            navigation.goBack();

        } catch (erro) {

            console.error(
                "Erro ao enviar avaliação:",
                erro
            );


            setErro(
                "Não foi possível enviar sua avaliação."
            );

        } finally {

            setEnviando(false);

        }
    }


    return (
        <View
            style={styles.container}
        >

            <ScrollView
                contentContainerStyle={
                    styles.content
                }

                keyboardShouldPersistTaps="handled"
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


                <Text
                    style={
                        styles.title
                    }
                >
                    Avaliar
                </Text>


                <Text
                    style={
                        styles.unitName
                    }
                >
                    {unidade.nome}
                </Text>


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
                        Como foi sua experiência?
                    </Text>


                    <Text
                        style={
                            styles.description
                        }
                    >
                        Toque nas estrelas para dar
                        uma nota para a unidade.
                    </Text>


                    <View
                        style={
                            styles.starsContainer
                        }
                    >
                        {[1, 2, 3, 4, 5].map(
                            (estrela) => (

                                <Pressable
                                    key={
                                        estrela
                                    }

                                    onPress={() => {
                                        setNota(
                                            estrela
                                        );

                                        setErro(
                                            null
                                        );
                                    }}

                                    style={
                                        styles.starButton
                                    }
                                >

                                    <Text
                                        style={[
                                            styles.star,

                                            estrela <= nota &&
                                            styles.starActive,
                                        ]}
                                    >
                                        ★
                                    </Text>

                                </Pressable>
                            )
                        )}
                    </View>


                    {nota > 0 && (

                        <Text
                            style={
                                styles.ratingText
                            }
                        >
                            {nota} de 5
                        </Text>

                    )}

                </View>


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
                        Comentário
                    </Text>


                    <Text
                        style={
                            styles.description
                        }
                    >
                        Conte um pouco sobre sua experiência.
                    </Text>


                    <TextInput
                        value={
                            comentario
                        }

                        onChangeText={
                            setComentario
                        }

                        placeholder="Escreva sua avaliação..."

                        placeholderTextColor={
                            colors.textSecondary
                        }

                        multiline

                        maxLength={500}

                        textAlignVertical="top"

                        style={
                            styles.input
                        }
                    />


                    <Text
                        style={
                            styles.counter
                        }
                    >
                        {
                            comentario.length
                        }
                        /500
                    </Text>

                </View>


                {erro && (

                    <View
                        style={
                            styles.errorBox
                        }
                    >

                        <Text
                            style={
                                styles.errorText
                            }
                        >
                            {erro}
                        </Text>

                    </View>

                )}


                <Pressable
                    disabled={
                        nota === 0 ||
                        enviando
                    }

                    style={[
                        styles.submitButton,

                        (
                            nota === 0 ||
                            enviando
                        ) &&
                        styles.submitButtonDisabled,
                    ]}

                    onPress={
                        enviarAvaliacao
                    }
                >

                    <Text
                        style={
                            styles.submitText
                        }
                    >
                        {
                            enviando
                                ? "ENVIANDO..."
                                : "ENVIAR AVALIAÇÃO"
                        }
                    </Text>

                </Pressable>

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

            paddingTop: 28,

            paddingBottom: 50,
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

            marginBottom: 24,
        },


        backText: {
            fontSize: 34,

            lineHeight: 36,

            color:
            colors.primaryDark,
        },


        title: {
            fontSize: 30,

            fontWeight: "900",

            color:
            colors.text,
        },


        unitName: {
            marginTop: 5,

            fontSize: 15,

            color:
            colors.textSecondary,
        },


        section: {
            marginTop: 22,

            padding: 20,

            borderRadius: 22,

            backgroundColor:
            colors.surface,
        },


        sectionTitle: {
            fontSize: 18,

            fontWeight: "800",

            color:
            colors.text,
        },


        description: {
            marginTop: 6,

            fontSize: 13,

            lineHeight: 19,

            color:
            colors.textSecondary,
        },


        starsContainer: {
            flexDirection: "row",

            justifyContent:
                "center",

            marginTop: 24,
        },


        starButton: {
            paddingHorizontal: 5,
        },


        star: {
            fontSize: 42,

            color:
            colors.disabled,
        },


        starActive: {
            color:
            colors.primary,
        },


        ratingText: {
            marginTop: 12,

            textAlign:
                "center",

            fontSize: 13,

            fontWeight: "700",

            color:
            colors.primaryDark,
        },


        input: {
            minHeight: 140,

            marginTop: 18,

            padding: 14,

            borderRadius: 16,

            backgroundColor:
            colors.primaryLight,

            fontSize: 15,

            color:
            colors.text,
        },


        counter: {
            marginTop: 7,

            textAlign:
                "right",

            fontSize: 11,

            color:
            colors.textSecondary,
        },


        errorBox: {
            marginTop: 16,

            padding: 13,

            borderRadius: 14,

            backgroundColor:
                "#FDECEC",
        },


        errorText: {
            textAlign:
                "center",

            fontSize: 13,

            fontWeight: "700",

            color:
            colors.danger,
        },


        submitButton: {
            height: 56,

            marginTop: 24,

            borderRadius: 17,

            backgroundColor:
            colors.primary,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        submitButtonDisabled: {
            backgroundColor:
            colors.disabled,
        },


        submitText: {
            fontSize: 14,

            fontWeight: "900",

            letterSpacing: 0.8,

            color: "#FFFFFF",
        },
    });