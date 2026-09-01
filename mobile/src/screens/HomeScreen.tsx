import {
    useEffect,
    useState,
} from "react";

import {
    StyleSheet,
    Text,
    View,
} from "react-native";



import {
    useNavigation,
} from "@react-navigation/native";

import {
    NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import DynamicIsland from "../components/DynamicIsland";
import HospEasyMap from "../components/HospEasyMap";
import UnitMapCard from "../components/UnitMapCard";

import {
    buscarSituacoesUnidades,
} from "../service/api";

import {
    Unidade,
} from "../types/Unidade";

import {
    RootStackParamList,
} from "../navigation/AppNavigator";

import {
    colors,
} from "../theme/colors";

import {
    useUserLocation,
} from "../hooks/useUserLocation";


export default function HomeScreen() {

    const navigation =
        useNavigation<
            NativeStackNavigationProp<
                RootStackParamList
            >
        >();


    const [
        unidades,
        setUnidades,
    ] = useState<Unidade[]>([]);


    const [
        unidadeSelecionada,
        setUnidadeSelecionada,
    ] = useState<Unidade | null>(
        null
    );


    const [
        carregando,
        setCarregando,
    ] = useState(true);


    const [
        erro,
        setErro,
    ] = useState<string | null>(
        null
    );


    // Localização real do usuário
    const {
        localizacao,
        erro: erroLocalizacao,
    } = useUserLocation();


    useEffect(() => {

        carregarUnidades(
            true
        );


        const intervalo =
            setInterval(() => {

                carregarUnidades(
                    false
                );

            }, 1000);


        return () => {

            clearInterval(
                intervalo
            );
        };

    }, []);


    async function carregarUnidades(
        mostrarCarregamento = false
    ) {

        try {

            if (
                mostrarCarregamento
            ) {

                setCarregando(
                    true
                );
            }

            setErro(
                null
            );


            const dados =
                await buscarSituacoesUnidades();


            setUnidades(
                dados
            );

        } catch (erro) {

            console.error(
                "Erro ao carregar unidades:",
                erro
            );


            setErro(
                "Não foi possível carregar as unidades."
            );

        } finally {

            if (
                mostrarCarregamento
            ) {

                setCarregando(
                    false
                );
            }
        }
    }


    function selecionarUnidade(
        unidade: Unidade
    ) {

        setUnidadeSelecionada(
            unidade
        );
    }


    function abrirUnidade(
        unidade: Unidade
    ) {

        setUnidadeSelecionada(
            null
        );


        navigation.navigate(
            "Unit",
            {
                unidade,
            }
        );
    }


    return (

        <View
            style={styles.container}
        >

            <HospEasyMap
                unidades={
                    unidades
                }

                localizacaoUsuario={
                    localizacao
                }

                onSelecionarUnidade={
                    selecionarUnidade
                }
            />


            {carregando && (

                <View
                    style={
                        styles.statusContainer
                    }
                >

                    <Text
                        style={
                            styles.statusText
                        }
                    >
                        Carregando unidades...
                    </Text>

                </View>

            )}


            {erro && (

                <View
                    style={
                        styles.statusContainer
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


            {unidadeSelecionada && (

                <UnitMapCard

                    nome={
                        unidadeSelecionada.nome
                    }

                    percentual={
                        unidadeSelecionada
                            .percentualOcupacao
                    }

                    tendencia={
                        unidadeSelecionada
                            .tendencia
                    }

                    nivelOcupacao={
                        unidadeSelecionada
                            .nivelOcupacao
                    }

                    statusCamera={
                        unidadeSelecionada
                            .statusCamera
                    }

                    onPress={() =>
                        abrirUnidade(
                            unidadeSelecionada
                        )
                    }

                    onClose={() =>
                        setUnidadeSelecionada(
                            null
                        )
                    }

                />

            )}


            <DynamicIsland

                unidades={
                    unidades
                }

                localizacaoUsuario={
                    localizacao
                }

                erroLocalizacao={
                    erroLocalizacao
                }

                onAbrirUnidade={
                    abrirUnidade
                }

            />

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


        statusContainer: {

            position:
                "absolute",

            top: 40,

            left: 20,

            right: 20,

            alignItems:
                "center",

            zIndex: 100,
        },


        statusText: {

            paddingHorizontal:
                14,

            paddingVertical:
                8,

            borderRadius:
                18,

            backgroundColor:
            colors.surface,

            fontSize:
                13,

            fontWeight:
                "600",

            color:
            colors.text,
        },


        errorText: {

            paddingHorizontal:
                14,

            paddingVertical:
                8,

            borderRadius:
                18,

            backgroundColor:
            colors.surface,

            fontSize:
                13,

            fontWeight:
                "600",

            color:
            colors.danger,
        },

    });