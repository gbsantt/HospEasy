import {
    Alert,
    KeyboardAvoidingView,
    Platform,
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
    useState,
} from "react";

import {
    RootStackParamList,
} from "../navigation/AppNavigator";

import {
    atualizarUnidadeAdmin,
} from "../service/api";

import {
    TipoUnidade,
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
        "EditarUnidadeAdmin"
    >;


export default function EditarUnidadeAdminScreen({
                                                     navigation,
                                                     route,
                                                 }: Props) {

    const {
        usuario,
    } = useAuth();


    const {
        unidade,
    } = route.params;


    const [
        nome,
        setNome,
    ] = useState(
        unidade.nome
    );


    const [
        endereco,
        setEndereco,
    ] = useState(
        unidade.endereco
    );


    const [
        telefone,
        setTelefone,
    ] = useState(
        unidade.telefone ?? ""
    );


    const [
        capacidade,
        setCapacidade,
    ] = useState(
        String(
            unidade.capacidadeAreaMonitorada
        )
    );


    const [
        latitude,
        setLatitude,
    ] = useState(
        unidade.latitude !== null
            ? String(
                unidade.latitude
            )
            : ""
    );


    const [
        longitude,
        setLongitude,
    ] = useState(
        unidade.longitude !== null
            ? String(
                unidade.longitude
            )
            : ""
    );


    const [
        tipo,
        setTipo,
    ] = useState<TipoUnidade>(
        unidade.tipo
    );


    const [
        salvando,
        setSalvando,
    ] = useState(
        false
    );


    function converterNumeroDecimal(
        valor: string
    ) {

        return Number(
            valor
                .trim()
                .replace(
                    ",",
                    "."
                )
        );
    }


    async function salvar() {

        if (
            !usuario ||
            usuario.tipo !== "ADMIN"
        ) {

            Alert.alert(
                "Acesso negado",
                "Somente administradores podem editar unidades."
            );

            return;
        }


        const nomeLimpo =
            nome.trim();


        const enderecoLimpo =
            endereco.trim();


        if (
            nomeLimpo === ""
        ) {

            Alert.alert(
                "Nome obrigatório",
                "Informe o nome da unidade."
            );

            return;
        }


        if (
            enderecoLimpo === ""
        ) {

            Alert.alert(
                "Endereço obrigatório",
                "Informe o endereço da unidade."
            );

            return;
        }


        const capacidadeNumero =
            Number(
                capacidade.trim()
            );


        if (
            !Number.isInteger(
                capacidadeNumero
            ) ||
            capacidadeNumero <= 0
        ) {

            Alert.alert(
                "Capacidade inválida",
                "Informe uma capacidade maior que zero."
            );

            return;
        }


        if (
            capacidadeNumero <
            unidade.ocupacaoAtual
        ) {

            Alert.alert(
                "Capacidade inválida",
                "A capacidade não pode ser menor que a ocupação atual da unidade."
            );

            return;
        }


        let latitudeNumero:
            number | null =
            null;


        if (
            latitude.trim() !== ""
        ) {

            latitudeNumero =
                converterNumeroDecimal(
                    latitude
                );


            if (
                !Number.isFinite(
                    latitudeNumero
                ) ||
                latitudeNumero < -90 ||
                latitudeNumero > 90
            ) {

                Alert.alert(
                    "Latitude inválida",
                    "A latitude deve estar entre -90 e 90."
                );

                return;
            }
        }


        let longitudeNumero:
            number | null =
            null;


        if (
            longitude.trim() !== ""
        ) {

            longitudeNumero =
                converterNumeroDecimal(
                    longitude
                );


            if (
                !Number.isFinite(
                    longitudeNumero
                ) ||
                longitudeNumero < -180 ||
                longitudeNumero > 180
            ) {

                Alert.alert(
                    "Longitude inválida",
                    "A longitude deve estar entre -180 e 180."
                );

                return;
            }
        }


        try {

            setSalvando(
                true
            );


            await atualizarUnidadeAdmin(
                unidade.unidadeId,
                {
                    nome:
                    nomeLimpo,

                    endereco:
                    enderecoLimpo,

                    telefone:
                        telefone.trim() === ""
                            ? null
                            : telefone.trim(),

                    capacidadeAreaMonitorada:
                    capacidadeNumero,

                    latitude:
                    latitudeNumero,

                    longitude:
                    longitudeNumero,

                    tipo,
                },
                usuario.token
            );


            Alert.alert(
                "Unidade atualizada",
                "As informações da unidade foram salvas.",
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

        } catch (error) {

            console.error(
                error
            );


            Alert.alert(
                "Não foi possível salvar",
                error instanceof Error
                    ? error.message
                    : "Ocorreu um erro ao atualizar a unidade."
            );

        } finally {

            setSalvando(
                false
            );
        }
    }


    return (

        <KeyboardAvoidingView
            style={
                styles.container
            }

            behavior={
                Platform.OS === "ios"
                    ? "padding"
                    : undefined
            }
        >

            <ScrollView
                showsVerticalScrollIndicator={
                    false
                }

                keyboardShouldPersistTaps="handled"

                contentContainerStyle={
                    styles.content
                }
            >

                {/* VOLTAR */}

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


                {/* CABEÇALHO */}

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
                        Editar unidade
                    </Text>


                    <Text
                        style={
                            styles.subtitle
                        }
                    >
                        Altere apenas os dados cadastrais da unidade
                    </Text>

                </View>


                {/* MONITORAMENTO */}

                <View
                    style={
                        styles.monitorCard
                    }
                >

                    <Text
                        style={
                            styles.monitorLabel
                        }
                    >
                        OCUPAÇÃO ATUAL
                    </Text>


                    <Text
                        style={
                            styles.monitorValue
                        }
                    >
                        {
                            unidade.ocupacaoAtual
                        }
                    </Text>


                    <Text
                        style={
                            styles.monitorDescription
                        }
                    >
                        A ocupação é controlada pelo sistema de monitoramento e não pode ser alterada aqui.
                    </Text>

                </View>


                {/* FORMULÁRIO */}

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

                        placeholder="Nome da unidade"

                        placeholderTextColor={
                            colors.textSecondary
                        }
                    />


                    <Text
                        style={
                            styles.label
                        }
                    >
                        Endereço
                    </Text>


                    <TextInput
                        style={[
                            styles.input,
                            styles.addressInput,
                        ]}

                        value={
                            endereco
                        }

                        onChangeText={
                            setEndereco
                        }

                        multiline

                        textAlignVertical="top"

                        placeholder="Endereço da unidade"

                        placeholderTextColor={
                            colors.textSecondary
                        }
                    />


                    <Text
                        style={
                            styles.label
                        }
                    >
                        Telefone
                    </Text>


                    <TextInput
                        style={
                            styles.input
                        }

                        value={
                            telefone
                        }

                        onChangeText={
                            setTelefone
                        }

                        keyboardType="phone-pad"

                        placeholder="Telefone"

                        placeholderTextColor={
                            colors.textSecondary
                        }
                    />


                    <Text
                        style={
                            styles.label
                        }
                    >
                        Capacidade da área monitorada
                    </Text>


                    <TextInput
                        style={
                            styles.input
                        }

                        value={
                            capacidade
                        }

                        onChangeText={
                            setCapacidade
                        }

                        keyboardType="number-pad"

                        placeholder="Capacidade"

                        placeholderTextColor={
                            colors.textSecondary
                        }
                    />


                    {/* TIPO */}

                    <Text
                        style={
                            styles.label
                        }
                    >
                        Tipo da unidade
                    </Text>


                    <View
                        style={
                            styles.optionsColumn
                        }
                    >

                        <Pressable
                            style={[
                                styles.optionButton,

                                tipo === "UPA" &&
                                styles.optionButtonSelected,
                            ]}

                            onPress={() =>
                                setTipo(
                                    "UPA"
                                )
                            }
                        >

                            <Text
                                style={[
                                    styles.optionText,

                                    tipo === "UPA" &&
                                    styles.optionTextSelected,
                                ]}
                            >
                                UPA
                            </Text>

                        </Pressable>


                        <Pressable
                            style={[
                                styles.optionButton,

                                tipo === "PRONTO_ATENDIMENTO" &&
                                styles.optionButtonSelected,
                            ]}

                            onPress={() =>
                                setTipo(
                                    "PRONTO_ATENDIMENTO"
                                )
                            }
                        >

                            <Text
                                style={[
                                    styles.optionText,

                                    tipo === "PRONTO_ATENDIMENTO" &&
                                    styles.optionTextSelected,
                                ]}
                            >
                                PRONTO ATENDIMENTO
                            </Text>

                        </Pressable>


                        <Pressable
                            style={[
                                styles.optionButton,

                                tipo === "PRONTO_SOCORRO" &&
                                styles.optionButtonSelected,
                            ]}

                            onPress={() =>
                                setTipo(
                                    "PRONTO_SOCORRO"
                                )
                            }
                        >

                            <Text
                                style={[
                                    styles.optionText,

                                    tipo === "PRONTO_SOCORRO" &&
                                    styles.optionTextSelected,
                                ]}
                            >
                                PRONTO SOCORRO
                            </Text>

                        </Pressable>

                    </View>


                    {/* COORDENADAS */}

                    <Text
                        style={
                            styles.sectionLabel
                        }
                    >
                        Localização no mapa
                    </Text>


                    <Text
                        style={
                            styles.sectionDescription
                        }
                    >
                        Latitude e longitude utilizadas para posicionar a unidade no mapa.
                    </Text>


                    <Text
                        style={
                            styles.label
                        }
                    >
                        Latitude
                    </Text>


                    <TextInput
                        style={
                            styles.input
                        }

                        value={
                            latitude
                        }

                        onChangeText={
                            setLatitude
                        }

                        keyboardType={
                            Platform.OS === "ios"
                                ? "numbers-and-punctuation"
                                : "numeric"
                        }

                        placeholder="-23.000000"

                        placeholderTextColor={
                            colors.textSecondary
                        }
                    />


                    <Text
                        style={
                            styles.label
                        }
                    >
                        Longitude
                    </Text>


                    <TextInput
                        style={
                            styles.input
                        }

                        value={
                            longitude
                        }

                        onChangeText={
                            setLongitude
                        }

                        keyboardType={
                            Platform.OS === "ios"
                                ? "numbers-and-punctuation"
                                : "numeric"
                        }

                        placeholder="-46.000000"

                        placeholderTextColor={
                            colors.textSecondary
                        }
                    />

                </View>


                {/* SALVAR */}

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

                    <Text
                        style={
                            styles.saveButtonText
                        }
                    >
                        {
                            salvando
                                ? "SALVANDO..."
                                : "SALVAR ALTERAÇÕES"
                        }
                    </Text>

                </Pressable>

            </ScrollView>

        </KeyboardAvoidingView>
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


        monitorCard: {

            padding: 20,

            marginBottom: 20,

            borderRadius: 22,

            backgroundColor:
            colors.primaryLight,
        },


        monitorLabel: {

            fontSize: 10,

            fontWeight:
                "900",

            color:
            colors.primaryDark,
        },


        monitorValue: {

            marginTop: 5,

            fontSize: 32,

            fontWeight:
                "900",

            color:
            colors.primaryDark,
        },


        monitorDescription: {

            marginTop: 7,

            fontSize: 11,

            lineHeight: 17,

            color:
            colors.primaryDark,
        },


        form: {

            padding: 18,

            borderRadius: 22,

            backgroundColor:
            colors.surface,
        },


        label: {

            marginTop: 15,

            marginBottom: 7,

            fontSize: 11,

            fontWeight:
                "800",

            color:
            colors.text,
        },


        input: {

            minHeight: 50,

            paddingHorizontal: 15,

            borderWidth: 1,

            borderColor:
            colors.border,

            borderRadius: 15,

            fontSize: 13,

            color:
            colors.text,

            backgroundColor:
            colors.background,
        },


        addressInput: {

            minHeight: 85,

            paddingTop: 14,

            paddingBottom: 14,
        },


        optionsColumn: {

            gap: 10,
        },


        optionButton: {

            flex: 1,

            height: 48,

            borderWidth: 1,

            borderColor:
            colors.border,

            borderRadius: 15,

            backgroundColor:
            colors.background,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        optionButtonSelected: {

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


        sectionLabel: {

            marginTop: 27,

            fontSize: 14,

            fontWeight:
                "900",

            color:
            colors.text,
        },


        sectionDescription: {

            marginTop: 5,

            marginBottom: 3,

            fontSize: 11,

            lineHeight: 17,

            color:
            colors.textSecondary,
        },


        saveButton: {

            height: 56,

            marginTop: 20,

            borderRadius: 17,

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

            fontSize: 12,

            fontWeight:
                "900",

            color:
                "#FFFFFF",
        },

    });