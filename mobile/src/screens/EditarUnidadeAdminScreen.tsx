import BackChevron from "../components/BackChevron";
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { Alert } from "../utils/alert";

import {
    NativeStackScreenProps,
} from "@react-navigation/native-stack";

import {
    useEffect,
    useState,
} from "react";

import {
    RootStackParamList,
} from "../navigation/AppNavigator";

import {
    atualizarUnidadeAdmin,
    buscarUnidadePorId,
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
        tipo,
        setTipo,
    ] = useState<TipoUnidade | null>(
        unidade.tipo ?? null
    );


    const [
        salvando,
        setSalvando,
    ] = useState(
        false
    );


    const [
        confirmacaoVisivel,
        setConfirmacaoVisivel,
    ] = useState(
        false
    );


    const [
        carregandoTipo,
        setCarregandoTipo,
    ] = useState(
        true
    );


    /*
     * A listagem de situações não traz o tipo da unidade.
     * Por isso buscamos o cadastro completo ao abrir a tela,
     * garantindo que o botão correto já venha marcado.
     */
    useEffect(
        () => {

            let telaAtiva =
                true;


            async function carregarTipoDaUnidade() {

                try {

                    const unidadeCompleta =
                        await buscarUnidadePorId(
                            unidade.unidadeId
                        );


                    if (
                        telaAtiva
                    ) {

                        setTipo(
                            unidadeCompleta.tipo
                        );
                    }

                } catch (error) {

                    console.error(
                        "Erro ao carregar tipo da unidade:",
                        error
                    );


                    if (
                        telaAtiva &&
                        unidade.tipo
                    ) {

                        setTipo(
                            unidade.tipo
                        );
                    }

                } finally {

                    if (
                        telaAtiva
                    ) {

                        setCarregandoTipo(
                            false
                        );
                    }
                }
            }


            carregarTipoDaUnidade();


            return () => {

                telaAtiva =
                    false;
            };

        },
        [
            unidade.unidadeId,
            unidade.tipo,
        ]
    );



    async function confirmarSalvamento() {

        setConfirmacaoVisivel(
            false
        );

        await executarSalvamento();
    }


    async function executarSalvamento() {

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




        if (
            !tipo
        ) {

            Alert.alert(
                "Tipo obrigatório",
                "Selecione o tipo da unidade."
            );

            return;
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

                    tipo,
                },
                usuario.token
            );


            navigation.goBack();

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

                    <BackChevron />

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


                    {
                        carregandoTipo && (
                            <Text
                                style={
                                    styles.typeLoadingText
                                }
                            >
                                Carregando tipo da unidade...
                            </Text>
                        )
                    }


                    {/* LOCALIZAÇÃO AUTOMÁTICA */}

                    <View
                        style={
                            styles.locationInfo
                        }
                    >

                        <Text
                            style={
                                styles.locationInfoTitle
                            }
                        >
                            LOCALIZAÇÃO AUTOMÁTICA
                        </Text>


                        <Text
                            style={
                                styles.locationInfoText
                            }
                        >
                            Se o endereço for alterado, o HospEasy recalculará automaticamente a posição da unidade no mapa.
                        </Text>

                    </View>

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

                    onPress={() =>
                        setConfirmacaoVisivel(
                            true
                        )
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

            <Modal
                visible={
                    confirmacaoVisivel
                }

                transparent

                animationType="fade"

                onRequestClose={() =>
                    setConfirmacaoVisivel(
                        false
                    )
                }
            >

                <View
                    style={
                        styles.modalOverlay
                    }
                >

                    <View
                        style={
                            styles.modalCard
                        }
                    >

                        <Text
                            style={
                                styles.modalTitle
                            }
                        >
                            Confirmar alteração
                        </Text>


                        <Text
                            style={
                                styles.modalDescription
                            }
                        >
                            Deseja salvar as alterações desta unidade? Se o endereço mudou, a localização no mapa será recalculada automaticamente.
                        </Text>


                        <View
                            style={
                                styles.modalActions
                            }
                        >

                            <Pressable
                                style={[
                                    styles.modalButton,
                                    styles.modalCancelButton,
                                ]}

                                onPress={() =>
                                    setConfirmacaoVisivel(
                                        false
                                    )
                                }
                            >

                                <Text
                                    style={
                                        styles.modalCancelText
                                    }
                                >
                                    CANCELAR
                                </Text>

                            </Pressable>


                            <Pressable
                                style={[
                                    styles.modalButton,
                                    styles.modalConfirmButton,
                                ]}

                                onPress={
                                    confirmarSalvamento
                                }
                            >

                                <Text
                                    style={
                                        styles.modalConfirmText
                                    }
                                >
                                    SIM, SALVAR
                                </Text>

                            </Pressable>

                        </View>

                    </View>

                </View>

            </Modal>

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

            width: "100%",

            minHeight: 68,

            paddingHorizontal: 20,

            paddingVertical: 18,

            borderWidth: 2,

            borderColor:
            colors.border,

            borderRadius: 16,

            backgroundColor:
            colors.background,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        optionButtonSelected: {

            borderWidth: 2.5,

            borderColor:
            colors.primary,

            backgroundColor:
            colors.primary,
        },


        optionText: {

            fontSize: 12,

            lineHeight: 17,

            fontWeight:
                "900",

            textAlign:
                "center",

            color:
            colors.textSecondary,
        },


        optionTextSelected: {

            color:
                "#FFFFFF",
        },


        typeLoadingText: {

            marginTop: 9,

            fontSize: 11,

            color:
            colors.textSecondary,

            textAlign:
                "center",
        },


        modalOverlay: {

            flex: 1,

            padding: 24,

            backgroundColor:
                "rgba(0, 0, 0, 0.55)",

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        modalCard: {

            width: "100%",

            maxWidth: 430,

            padding: 24,

            borderRadius: 22,

            backgroundColor:
            colors.surface,
        },


        modalTitle: {

            fontSize: 22,

            fontWeight:
                "900",

            color:
            colors.text,
        },


        modalDescription: {

            marginTop: 10,

            fontSize: 13,

            lineHeight: 20,

            color:
            colors.textSecondary,
        },


        modalActions: {

            marginTop: 24,

            gap: 10,
        },


        modalButton: {

            minHeight: 54,

            borderRadius: 16,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        modalCancelButton: {

            borderWidth: 1,

            borderColor:
            colors.border,

            backgroundColor:
            colors.background,
        },


        modalConfirmButton: {

            backgroundColor:
            colors.primary,
        },


        modalCancelText: {

            fontSize: 12,

            fontWeight:
                "900",

            color:
            colors.text,
        },


        modalConfirmText: {

            fontSize: 12,

            fontWeight:
                "900",

            color:
                "#FFFFFF",
        },



        locationInfo: {

            marginTop: 22,

            padding: 17,

            borderRadius: 18,

            backgroundColor:
            colors.primaryLight,
        },


        locationInfoTitle: {

            fontSize: 10,

            fontWeight:
                "900",

            color:
            colors.primaryDark,
        },


        locationInfoText: {

            marginTop: 7,

            fontSize: 11,

            lineHeight: 17,

            color:
            colors.primaryDark,
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
