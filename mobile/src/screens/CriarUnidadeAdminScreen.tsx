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

import * as Clipboard
    from "expo-clipboard";

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
    criarUnidadeAdmin,
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
        "CriarUnidadeAdmin"
    >;


export default function CriarUnidadeAdminScreen({
                                                    navigation,
                                                }: Props) {

    const {
        usuario,
    } = useAuth();


    const [
        nome,
        setNome,
    ] = useState(
        ""
    );


    const [
        endereco,
        setEndereco,
    ] = useState(
        ""
    );


    const [
        telefone,
        setTelefone,
    ] = useState(
        ""
    );


    const [
        capacidade,
        setCapacidade,
    ] = useState(
        ""
    );


    const [
        nomeCamera,
        setNomeCamera,
    ] = useState(
        ""
    );


    const [
        tipo,
        setTipo,
    ] = useState<TipoUnidade | null>(
        null
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
        cadastroConcluidoVisivel,
        setCadastroConcluidoVisivel,
    ] = useState(
        false
    );


    const [
        chaveApiGerada,
        setChaveApiGerada,
    ] = useState(
        ""
    );


    const [
        nomeCameraCadastrada,
        setNomeCameraCadastrada,
    ] = useState(
        ""
    );


    function validarFormulario() {

        if (
            nome.trim() === ""
        ) {

            Alert.alert(
                "Nome obrigatório",
                "Informe o nome da unidade."
            );

            return false;
        }


        if (
            endereco.trim() === ""
        ) {

            Alert.alert(
                "Endereço obrigatório",
                "Informe o endereço completo da unidade."
            );

            return false;
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

            return false;
        }


        if (
            nomeCamera.trim() === ""
        ) {

            Alert.alert(
                "Câmera obrigatória",
                "Informe um nome para identificar a câmera da unidade."
            );

            return false;
        }


        if (
            !tipo
        ) {

            Alert.alert(
                "Tipo obrigatório",
                "Selecione o tipo da unidade."
            );

            return false;
        }


        return true;
    }


    function abrirConfirmacao() {

        if (
            !validarFormulario()
        ) {

            return;
        }


        setConfirmacaoVisivel(
            true
        );
    }


    async function cadastrar() {

        if (
            !usuario ||
            usuario.tipo !== "ADMIN"
        ) {

            Alert.alert(
                "Acesso negado",
                "Somente administradores podem cadastrar unidades."
            );

            return;
        }


        if (
            !tipo
        ) {

            return;
        }


        try {

            setConfirmacaoVisivel(
                false
            );


            setSalvando(
                true
            );


            const resultado =
                await criarUnidadeAdmin(
                    {
                        nome:
                            nome.trim(),

                        endereco:
                            endereco.trim(),

                        telefone:
                            telefone.trim() === ""
                                ? null
                                : telefone.trim(),

                        capacidadeAreaMonitorada:
                            Number(
                                capacidade.trim()
                            ),

                        tipo,

                        nomeCamera:
                            nomeCamera.trim(),
                    },
                    usuario.token
                );


            setChaveApiGerada(
                resultado.chaveApi
            );


            setNomeCameraCadastrada(
                resultado.cameraNome
            );


            setCadastroConcluidoVisivel(
                true
            );

        } catch (error) {

            console.error(
                error
            );


            Alert.alert(
                "Não foi possível cadastrar",
                error instanceof Error
                    ? error.message
                    : "Ocorreu um erro ao cadastrar a unidade."
            );

        } finally {

            setSalvando(
                false
            );
        }
    }


    async function copiarChaveApi() {

        if (
            chaveApiGerada === ""
        ) {

            return;
        }


        await Clipboard.setStringAsync(
            chaveApiGerada
        );


        Alert.alert(
            "Chave copiada",
            "A chave da câmera foi copiada."
        );
    }


    function concluirCadastro() {

        setCadastroConcluidoVisivel(
            false
        );


        navigation.goBack();
    }


    if (
        !usuario ||
        usuario.tipo !== "ADMIN"
    ) {

        return (

            <View
                style={
                    styles.centerContainer
                }
            >

                <Text
                    style={
                        styles.errorTitle
                    }
                >
                    Acesso não autorizado
                </Text>


                <Text
                    style={
                        styles.errorText
                    }
                >
                    Esta área é exclusiva para administradores.
                </Text>

            </View>
        );
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
                        styles.header
                    }
                >

                    <Text
                        style={
                            styles.title
                        }
                    >
                        Nova unidade
                    </Text>


                    <Text
                        style={
                            styles.subtitle
                        }
                    >
                        Cadastre a unidade pelo endereço. O HospEasy localizará a posição no mapa automaticamente.
                    </Text>

                </View>


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
                        Informe o endereço completo da unidade no campo Endereço para obtermos sua posição no mapa.
                    </Text>

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
                        Nome da unidade
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

                        placeholder="Ex.: UPA Jardim Aurora"

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

                        placeholder="Ex.: Rua das Flores, 120, Campinas - SP"

                        placeholderTextColor={
                            colors.textSecondary
                        }
                    />


                    <Text
                        style={
                            styles.addressHint
                        }
                    >
                        Quanto mais completo o endereço, mais precisa será a localização no mapa.
                    </Text>


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

                        placeholder="(00) 0000-0000"

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

                        placeholder="Ex.: 80"

                        placeholderTextColor={
                            colors.textSecondary
                        }
                    />


                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        Câmera de monitoramento
                    </Text>


                    <Text
                        style={
                            styles.sectionDescription
                        }
                    >
                        Toda unidade precisa ter pelo menos uma câmera vinculada. O sistema irá gerar automaticamente a chave de acesso da câmera.
                    </Text>


                    <Text
                        style={
                            styles.label
                        }
                    >
                        Nome da câmera
                    </Text>


                    <TextInput
                        style={
                            styles.input
                        }

                        value={
                            nomeCamera
                        }

                        onChangeText={
                            setNomeCamera
                        }

                        placeholder="Ex.: Câmera da recepção"

                        placeholderTextColor={
                            colors.textSecondary
                        }
                    />


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

                </View>


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
                        abrirConfirmacao
                    }
                >

                    <Text
                        style={
                            styles.saveButtonText
                        }
                    >
                        {
                            salvando
                                ? "CADASTRANDO..."
                                : "CADASTRAR UNIDADE"
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
                            Confirmar cadastro
                        </Text>


                        <Text
                            style={
                                styles.modalDescription
                            }
                        >
                            Deseja cadastrar esta unidade? O endereço será localizado automaticamente no mapa.
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
                                    cadastrar
                                }
                            >

                                <Text
                                    style={
                                        styles.modalConfirmText
                                    }
                                >
                                    SIM, CADASTRAR
                                </Text>

                            </Pressable>

                        </View>

                    </View>

                </View>

            </Modal>

            <Modal
                visible={
                    cadastroConcluidoVisivel
                }

                transparent

                animationType="fade"

                onRequestClose={() => {
                    /*
                     * Não fechamos pelo botão de voltar sem
                     * passar pela tela da chave.
                     */
                }}
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
                                styles.successTitle
                            }
                        >
                            Unidade cadastrada
                        </Text>


                        <Text
                            style={
                                styles.modalDescription
                            }
                        >
                            A unidade e a câmera foram criadas. Guarde a chave abaixo para configurar o dispositivo físico.
                        </Text>


                        <View
                            style={
                                styles.cameraResultCard
                            }
                        >

                            <Text
                                style={
                                    styles.cameraResultLabel
                                }
                            >
                                CÂMERA
                            </Text>


                            <Text
                                style={
                                    styles.cameraResultName
                                }
                            >
                                {
                                    nomeCameraCadastrada
                                }
                            </Text>


                            <Text
                                style={
                                    styles.cameraResultLabel
                                }
                            >
                                CHAVE API
                            </Text>


                            <Text
                                selectable

                                style={
                                    styles.apiKeyText
                                }
                            >
                                {
                                    chaveApiGerada
                                }
                            </Text>

                        </View>


                        <Pressable
                            style={
                                styles.copyButton
                            }

                            onPress={
                                copiarChaveApi
                            }
                        >

                            <Text
                                style={
                                    styles.copyButtonText
                                }
                            >
                                COPIAR CHAVE
                            </Text>

                        </Pressable>


                        <Pressable
                            style={
                                styles.finishButton
                            }

                            onPress={
                                concluirCadastro
                            }
                        >

                            <Text
                                style={
                                    styles.finishButtonText
                                }
                            >
                                CONCLUIR
                            </Text>

                        </Pressable>

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


        centerContainer: {

            flex: 1,

            padding: 30,

            alignItems:
                "center",

            justifyContent:
                "center",

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


        header: {

            marginTop: 30,

            marginBottom: 20,
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

            lineHeight: 20,

            color:
            colors.textSecondary,
        },


        locationInfo: {

            padding: 18,

            marginBottom: 18,

            borderRadius: 20,

            backgroundColor:
            colors.primaryLight,
        },


        locationInfoTitle: {

            fontSize: 11,

            fontWeight:
                "900",

            color:
            colors.primaryDark,
        },


        locationInfoText: {

            marginTop: 7,

            fontSize: 12,

            lineHeight: 18,

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

            minHeight: 90,

            paddingTop: 14,

            paddingBottom: 14,
        },


        addressHint: {

            marginTop: 7,

            fontSize: 10,

            lineHeight: 15,

            color:
            colors.textSecondary,
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

            borderColor:
            colors.primary,

            backgroundColor:
            colors.primary,
        },


        optionText: {

            fontSize: 12,

            fontWeight:
                "900",

            color:
            colors.textSecondary,
        },


        optionTextSelected: {

            color:
                "#FFFFFF",
        },


        saveButton: {

            minHeight: 58,

            marginTop: 20,

            borderRadius: 18,

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


        sectionTitle: {

            marginTop: 28,

            fontSize: 15,

            fontWeight:
                "900",

            color:
            colors.text,
        },


        sectionDescription: {

            marginTop: 6,

            marginBottom: 2,

            fontSize: 11,

            lineHeight: 17,

            color:
            colors.textSecondary,
        },


        successTitle: {

            fontSize: 22,

            fontWeight:
                "900",

            color:
            colors.primaryDark,
        },


        cameraResultCard: {

            marginTop: 18,

            padding: 16,

            borderRadius: 16,

            backgroundColor:
            colors.primaryLight,
        },


        cameraResultLabel: {

            marginTop: 4,

            fontSize: 9,

            fontWeight:
                "900",

            color:
            colors.primaryDark,
        },


        cameraResultName: {

            marginTop: 5,

            marginBottom: 14,

            fontSize: 14,

            fontWeight:
                "900",

            color:
            colors.text,
        },


        apiKeyText: {

            marginTop: 7,

            fontSize: 12,

            lineHeight: 18,

            fontWeight:
                "700",

            color:
            colors.text,

            flexWrap:
                "wrap",
        },


        copyButton: {

            minHeight: 52,

            marginTop: 16,

            borderWidth: 2,

            borderColor:
            colors.primary,

            borderRadius: 16,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        copyButtonText: {

            fontSize: 12,

            fontWeight:
                "900",

            color:
            colors.primaryDark,
        },


        finishButton: {

            minHeight: 54,

            marginTop: 10,

            borderRadius: 16,

            backgroundColor:
            colors.primary,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        finishButtonText: {

            fontSize: 12,

            fontWeight:
                "900",

            color:
                "#FFFFFF",
        },


        errorTitle: {

            fontSize: 20,

            fontWeight:
                "900",

            color:
            colors.text,
        },


        errorText: {

            marginTop: 8,

            textAlign:
                "center",

            fontSize: 13,

            color:
            colors.textSecondary,
        },
    });
