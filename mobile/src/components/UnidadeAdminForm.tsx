import {
    useEffect,
    useState,
} from "react";

import {
    Text,
    View,
} from "react-native";

import * as Clipboard from "expo-clipboard";

import {
    useAuth,
} from "../context/AuthContext";

import {
    atualizarUnidadeAdmin,
    buscarUnidadePorId,
    criarUnidadeAdmin,
} from "../service/api";

import {
    TipoUnidade,
} from "../types/Unidade";

import {
    ScreenLayout,
    Field,
    Button,
    ErrorNotice,
    ui,
} from "./ScreenLayout";

import {
    Alert,
} from "../utils/alert";

import LocationPicker from "./LocationPicker";


type Localizacao = {
    latitude: number;
    longitude: number;
};


export default function UnidadeAdminForm({
                                             navigation,
                                             unidadeId,
                                         }: {
    navigation: any;
    unidadeId?: number;
}) {

    const {
        usuario,
    } = useAuth();


    const [
        nome,
        setNome,
    ] = useState("");


    const [
        endereco,
        setEndereco,
    ] = useState("");


    const [
        telefone,
        setTelefone,
    ] = useState("");


    const [
        capacidade,
        setCapacidade,
    ] = useState("");


    const [
        tipo,
        setTipo,
    ] =
        useState<TipoUnidade>(
            "UPA"
        );


    const [
        nomeCamera,
        setNomeCamera,
    ] = useState("");


    const [
        localizacao,
        setLocalizacao,
    ] =
        useState<Localizacao | null>(
            null
        );


    const [
        mapaAberto,
        setMapaAberto,
    ] = useState(false);


    const [
        buscandoEndereco,
        setBuscandoEndereco,
    ] = useState(false);


    const [
        loaded,
        setLoaded,
    ] =
        useState(
            !unidadeId
        );


    const [
        busy,
        setBusy,
    ] = useState(false);


    const [
        loading,
        setLoading,
    ] =
        useState(
            !!unidadeId
        );


    const [
        error,
        setError,
    ] = useState("");


    const [
        key,
        setKey,
    ] = useState("");


    const [
        done,
        setDone,
    ] = useState(false);


    const [
        retry,
        setRetry,
    ] = useState(0);


    useEffect(() => {

        if (
            !unidadeId ||
            !usuario ||
            usuario.tipo !== "ADMIN"
        ) {
            return;
        }


        const controller =
            new AbortController();


        setLoading(true);
        setError("");


        buscarUnidadePorId(
            unidadeId,
            controller.signal
        )
            .then((unidade) => {

                if (
                    controller.signal.aborted
                ) {
                    return;
                }


                setLoaded(true);

                setNome(
                    unidade.nome
                );

                setEndereco(
                    unidade.endereco ?? ""
                );

                setTelefone(
                    unidade.telefone ?? ""
                );

                setCapacidade(
                    String(
                        unidade.capacidadeAreaMonitorada
                    )
                );

                setTipo(
                    unidade.tipo
                );


                if (
                    unidade.latitude !== null &&
                    unidade.latitude !== undefined &&
                    unidade.longitude !== null &&
                    unidade.longitude !== undefined
                ) {

                    setLocalizacao({
                        latitude:
                        unidade.latitude,

                        longitude:
                        unidade.longitude,
                    });

                } else {

                    setLocalizacao(
                        null
                    );

                }

            })
            .catch((erro) => {

                if (
                    !controller.signal.aborted
                ) {

                    setError(
                        erro instanceof Error
                            ? erro.message
                            : "Não foi possível carregar a unidade."
                    );

                }

            })
            .finally(() => {

                if (
                    !controller.signal.aborted
                ) {

                    setLoading(
                        false
                    );

                }

            });


        return () =>
            controller.abort();

    }, [
        unidadeId,
        usuario?.token,
        usuario?.tipo,
        retry,
    ]);

    async function buscarEndereco(
        latitude: number,
        longitude: number
    ): Promise<string> {

        setBuscandoEndereco(true);

        try {
            const params = new URLSearchParams({
                format: "jsonv2",
                lat: String(latitude),
                lon: String(longitude),
                addressdetails: "1",
                zoom: "18",
                "accept-language": "pt-BR",
            });

            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
                { headers: { Accept: "application/json" } }
            );

            if (!response.ok) {
                throw new Error("Não foi possível localizar o endereço.");
            }

            const resultado: { display_name?: string } = await response.json();
            const enderecoEncontrado = resultado.display_name?.trim() ?? "";

            if (!enderecoEncontrado) {
                throw new Error("Nenhum endereço foi encontrado para esse ponto.");
            }

            setEndereco(enderecoEncontrado);
            return enderecoEncontrado;
        } catch (erro) {
            console.warn("Não foi possível obter o endereço:", erro);
            throw erro instanceof Error
                ? erro
                : new Error("Não foi possível obter o endereço desse ponto.");
        } finally {
            setBuscandoEndereco(false);
        }
    }


    async function save() {

        if (
            !usuario ||
            usuario.tipo !== "ADMIN" ||
            !loaded
        ) {
            return;
        }


        const cap =
            Number(
                capacidade
            );


        if (
            !nome.trim()
        ) {

            setError(
                "Informe o nome da unidade."
            );

            return;
        }


        if (
            !Number.isInteger(cap) ||
            cap < 1
        ) {

            setError(
                "Informe uma capacidade inteira maior que zero."
            );

            return;
        }


        if (
            !localizacao
        ) {

            setError(
                "Selecione a localização da unidade no mapa."
            );

            return;
        }


        if (
            !endereco.trim()
        ) {

            setError(
                "Não foi possível identificar o endereço. Confirme a localização no mapa novamente ou informe o endereço manualmente."
            );

            return;
        }


        const data = {

            nome:
                nome.trim(),

            endereco:
                endereco.trim(),

            telefone:
                telefone.trim() || null,

            capacidadeAreaMonitorada:
            cap,

            tipo,

            latitude:
            localizacao.latitude,

            longitude:
            localizacao.longitude,

        };


        setBusy(true);
        setError("");


        try {

            if (
                unidadeId
            ) {

                await atualizarUnidadeAdmin(
                    unidadeId,
                    data,
                    usuario.token
                );


                navigation.goBack();

                return;
            }


            const result =
                await criarUnidadeAdmin(
                    {
                        ...data,

                        nomeCamera:
                            nomeCamera.trim() ||
                            undefined,
                    },

                    usuario.token
                );


            setDone(true);

            setKey(
                result.chaveApi ?? ""
            );


            if (
                !result.chaveApi
            ) {

                navigation.goBack();

            }

        } catch (erro) {

            setError(
                erro instanceof Error
                    ? erro.message
                    : "Não foi possível salvar."
            );

        } finally {

            setBusy(false);

        }

    }


    if (
        !usuario ||
        usuario.tipo !== "ADMIN"
    ) {

        return (

            <ScreenLayout
                title="Unidade"

                onBack={() =>
                    navigation.goBack()
                }
            >

                <Text
                    style={
                        ui.text
                    }
                >
                    Acesso exclusivo de administradores.
                </Text>

            </ScreenLayout>

        );
    }


    return (

        <ScreenLayout
            title={
                unidadeId
                    ? "Editar unidade"
                    : "Nova unidade"
            }

            onBack={() =>
                navigation.goBack()
            }
        >

            <ErrorNotice
                message={
                    error
                }
            />


            {
                loading ? (

                    <Text
                        style={
                            ui.text
                        }
                    >
                        Carregando…
                    </Text>

                ) : done ? (

                    <View
                        style={
                            ui.card
                        }
                    >

                        <Text
                            style={
                                ui.label
                            }
                        >
                            Unidade cadastrada. Copie a chave agora;
                            ela não será recuperável.
                        </Text>


                        <Text
                            selectable

                            style={
                                ui.text
                            }
                        >
                            {key}
                        </Text>


                        <Button
                            title="Copiar chave"

                            onPress={() => {

                                void Clipboard
                                    .setStringAsync(
                                        key
                                    )
                                    .then(() =>
                                        Alert.alert(
                                            "Chave copiada"
                                        )
                                    )
                                    .catch(() =>
                                        setError(
                                            "Não foi possível copiar. Selecione a chave manualmente."
                                        )
                                    );

                            }}
                        />


                        <Button
                            title="Concluir"

                            onPress={() => {

                                setKey("");

                                navigation.goBack();

                            }}
                        />

                    </View>

                ) : (

                    <>

                        <Field
                            label="Nome da unidade"

                            value={
                                nome
                            }

                            onChangeText={
                                setNome
                            }

                            maxLength={
                                150
                            }
                        />


                        <Field
                            label="Endereço"

                            value={
                                endereco
                            }

                            onChangeText={
                                setEndereco
                            }

                            maxLength={
                                255
                            }

                            multiline
                        />


                        <Field
                            label="Telefone"

                            value={
                                telefone
                            }

                            onChangeText={
                                setTelefone
                            }

                            keyboardType=
                                "phone-pad"

                            maxLength={
                                20
                            }
                        />


                        <Field
                            label="Capacidade da área monitorada"

                            value={
                                capacidade
                            }

                            onChangeText={
                                setCapacidade
                            }

                            keyboardType=
                                "number-pad"

                            maxLength={
                                9
                            }
                        />


                        <Text
                            style={
                                ui.label
                            }
                        >
                            Tipo
                        </Text>


                        <View
                            style={
                                ui.row
                            }
                        >

                            {
                                (
                                    [
                                        "UPA",
                                        "PRONTO_ATENDIMENTO",
                                        "PRONTO_SOCORRO",
                                    ] as TipoUnidade[]
                                ).map(
                                    (
                                        tipoOpcao
                                    ) => (

                                        <Button
                                            key={
                                                tipoOpcao
                                            }

                                            title={
                                                tipoOpcao
                                                    .replaceAll(
                                                        "_",
                                                        " "
                                                    )
                                            }

                                            secondary={
                                                tipo !==
                                                tipoOpcao
                                            }

                                            onPress={() =>
                                                setTipo(
                                                    tipoOpcao
                                                )
                                            }
                                        />

                                    )
                                )
                            }

                        </View>


                        <Text
                            style={
                                ui.label
                            }
                        >
                            Localização
                        </Text>


                        <View
                            style={
                                ui.card
                            }
                        >

                            {
                                localizacao ? (

                                    <>

                                        <Text
                                            style={
                                                ui.text
                                            }
                                        >
                                            Localização selecionada
                                        </Text>


                                        <Text
                                            style={
                                                ui.text
                                            }
                                        >
                                            {
                                                localizacao.latitude
                                                    .toFixed(
                                                        6
                                                    )
                                            }

                                            {"  •  "}

                                            {
                                                localizacao.longitude
                                                    .toFixed(
                                                        6
                                                    )
                                            }
                                        </Text>

                                    </>

                                ) : (

                                    <Text
                                        style={
                                            ui.text
                                        }
                                    >
                                        Nenhuma localização selecionada.
                                    </Text>

                                )
                            }


                            <Button
                                title={
                                    localizacao
                                        ? "Alterar localização"
                                        : "Selecionar no mapa"
                                }

                                secondary

                                onPress={() => {

                                    setError("");

                                    setMapaAberto(
                                        true
                                    );

                                }}
                            />

                        </View>


                        <LocationPicker
                            visible={
                                mapaAberto
                            }

                            coordenada={
                                localizacao
                            }

                            onChange={(
                                novaLocalizacao
                            ) => {

                                setLocalizacao(
                                    novaLocalizacao
                                );

                            }}

                            onClose={() =>
                                setMapaAberto(
                                    false
                                )
                            }

                            onConfirm={() => {

                                if (
                                    !localizacao
                                ) {

                                    setError(
                                        "Toque no mapa para selecionar a localização da unidade."
                                    );

                                    return;
                                }


                                const coordenadaConfirmada = localizacao;

                                setError("");

                                void buscarEndereco(
                                    coordenadaConfirmada.latitude,
                                    coordenadaConfirmada.longitude
                                )
                                    .then(() => {
                                        setMapaAberto(false);
                                    })
                                    .catch((erro) => {
                                        setError(
                                            erro instanceof Error
                                                ? erro.message
                                                : "Não foi possível obter o endereço desse ponto."
                                        );
                                        setMapaAberto(false);
                                    });

                            }}
                        />


                        {
                            !unidadeId && (

                                <Field
                                    label="Nome da primeira câmera (opcional)"

                                    value={
                                        nomeCamera
                                    }

                                    onChangeText={
                                        setNomeCamera
                                    }

                                    maxLength={
                                        100
                                    }
                                />

                            )
                        }


                        {
                            unidadeId && (

                                <Button
                                    title="Gerenciar dispositivos"

                                    secondary

                                    onPress={() =>
                                        navigation.navigate(
                                            "DispositivosAdmin",
                                            {
                                                unidadeId,
                                            }
                                        )
                                    }
                                />

                            )
                        }


                        <Button
                            title="Salvar unidade"

                            disabled={
                                !loaded
                            }

                            busy={
                                busy
                            }

                            onPress={() =>
                                Alert.alert(
                                    "Salvar unidade",

                                    "Confirma os dados informados?",

                                    [
                                        {
                                            text:
                                                "Cancelar",

                                            style:
                                                "cancel",
                                        },

                                        {
                                            text:
                                                "Salvar",

                                            onPress:
                                                () =>
                                                    void save(),
                                        },
                                    ]
                                )
                            }
                        />


                        {
                            error &&
                            unidadeId && (

                                <Button
                                    title="Recarregar cadastro"

                                    secondary

                                    onPress={() =>
                                        setRetry(
                                            (
                                                atual
                                            ) =>
                                                atual +
                                                1
                                        )
                                    }
                                />

                            )
                        }

                    </>

                )
            }

        </ScreenLayout>

    );
}