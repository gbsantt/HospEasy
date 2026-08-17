import {
    useMemo,
    useState,
} from "react";

import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    useFavorites,
} from "../context/FavoritesContext";

import {
    useAuth,
} from "../context/AuthContext";

import {
    useNavigation,
} from "@react-navigation/native";

import {
    NativeStackNavigationProp,
} from "@react-navigation/native-stack";

import {
    RootStackParamList,
} from "../navigation/AppNavigator";

import {
    Gesture,
    GestureDetector,
} from "react-native-gesture-handler";

import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";

import {
    BlurView,
} from "expo-blur";

import {
    Unidade,
} from "../types/Unidade";

import {
    colors,
} from "../theme/colors";

import {
    calcularDistanciaKm,
    Coordenada,
} from "../utils/location";


const ALTURA_FECHADA = 82;
const ALTURA_ABERTA = 610;


type Props = {

    unidades: Unidade[];

    localizacaoUsuario:
        Coordenada | null;

    erroLocalizacao?:
        string | null;

    onAbrirUnidade: (
        unidade: Unidade
    ) => void;

};


type UnidadeComDistancia = {
    unidade: Unidade;
    distanciaKm: number;
};


export default function DynamicIsland({

                                          unidades,
                                          localizacaoUsuario,
                                          erroLocalizacao,
                                          onAbrirUnidade,

                                      }: Props) {


    const [
        aberta,
        setAberta,
    ] = useState(false);


    const [
        busca,
        setBusca,
    ] = useState("");

    const {
        favoritos,
    } = useFavorites();

    const {
        usuario,
        autenticado,
    } = useAuth();

    const navigation =
        useNavigation<
            NativeStackNavigationProp<
                RootStackParamList
            >
        >();

    const altura =
        useSharedValue(
            ALTURA_FECHADA
        );


    /*
     * BUSCA NORMAL
     */

    const unidadesFiltradas =
        useMemo(() => {

            const texto =
                busca
                    .trim()
                    .toLowerCase();


            if (!texto) {
                return unidades;
            }


            return unidades.filter(
                (unidade) =>
                    unidade.nome
                        .toLowerCase()
                        .includes(texto)
            );

        }, [
            busca,
            unidades,
        ]);


    /*
     * CALCULA DISTÂNCIA
     */

    const unidadesComDistancia =
        useMemo<
            UnidadeComDistancia[]
        >(() => {

            if (!localizacaoUsuario) {
                return [];
            }


            return unidades
                .map((unidade) => {

                    /*
                     * Usamos os campos latitude e
                     * longitude vindos do backend.
                     */

                    const unidadeCoordenada =
                        unidade as Unidade & {
                            latitude?: number | null;
                            longitude?: number | null;
                        };


                    if (
                        unidadeCoordenada.latitude == null ||
                        unidadeCoordenada.longitude == null
                    ) {
                        return null;
                    }


                    const distanciaKm =
                        calcularDistanciaKm(
                            localizacaoUsuario,
                            {
                                latitude:
                                unidadeCoordenada.latitude,

                                longitude:
                                unidadeCoordenada.longitude,
                            }
                        );


                    return {
                        unidade,
                        distanciaKm,
                    };

                })

                .filter(
                    (
                        item
                    ): item is UnidadeComDistancia =>
                        item !== null
                );

        }, [
            unidades,
            localizacaoUsuario,
        ]);


    /*
     * PRÓXIMAS DE VOCÊ
     *
     * Aqui NÃO importa ocupação.
     * É puramente distância.
     */

    const unidadesProximas =
        useMemo(() => {

            return [
                ...unidadesComDistancia,
            ]

                .sort(
                    (a, b) =>
                        a.distanciaKm -
                        b.distanciaKm
                )

                .slice(
                    0,
                    2
                );

        }, [
            unidadesComDistancia,
        ]);


    /*
     * SUGESTÕES
     *
     * Quanto MENOR o score,
     * melhor a opção.
     *
     * 55% distância
     * 45% ocupação
     */

    const sugestoes =
        useMemo(() => {

            if (
                unidadesComDistancia.length === 0
            ) {
                return [];
            }


            const maiorDistancia =
                Math.max(
                    ...unidadesComDistancia.map(
                        (item) =>
                            item.distanciaKm
                    ),
                    1
                );


            return unidadesComDistancia

                .map((item) => {

                    const ocupacao =
                        Math.min(
                            Math.max(
                                item.unidade
                                    .percentualOcupacao,
                                0
                            ),
                            100
                        );


                    /*
                     * Normalizamos a distância
                     * entre 0 e 100.
                     */

                    const distanciaNormalizada =
                        (
                            item.distanciaKm /
                            maiorDistancia
                        ) * 100;


                    const score =
                        distanciaNormalizada *
                        0.55 +

                        ocupacao *
                        0.45;


                    return {
                        ...item,
                        score,
                    };

                })

                .sort(
                    (a, b) =>
                        a.score -
                        b.score
                )

                .slice(
                    0,
                    2
                );

        }, [
            unidadesComDistancia,
        ]);


    function abrirPerfil() {

        setBusca("");

        fechar();

        navigation.navigate(
            autenticado
                ? "Profile"
                : "Access"
        );
    }


    function abrir() {

        setAberta(true);


        altura.value =
            withSpring(
                ALTURA_ABERTA,
                {
                    damping: 24,
                    stiffness: 180,
                    mass: 0.9,

                    overshootClamping:
                        true,
                }
            );
    }


    function fechar() {

        altura.value =
            withTiming(
                ALTURA_FECHADA,
                {
                    duration: 220,
                }
            );


        setAberta(false);
    }


    function alternar() {

        aberta
            ? fechar()
            : abrir();

    }


    function abrirUnidade(
        unidade: Unidade
    ) {

        setBusca("");

        fechar();

        onAbrirUnidade(
            unidade
        );
    }


    /*
     * ARRASTAR ILHA
     */

    const gesto =
        Gesture.Pan()

            .onUpdate(
                (evento) => {

                    const base =
                        aberta
                            ? ALTURA_ABERTA
                            : ALTURA_FECHADA;


                    let novaAltura =
                        base -
                        evento.translationY;


                    novaAltura =
                        Math.max(
                            ALTURA_FECHADA,

                            Math.min(
                                novaAltura,
                                ALTURA_ABERTA
                            )
                        );


                    altura.value =
                        novaAltura;

                }
            )


            .onEnd(
                (evento) => {

                    /*
                     * Arrastou para cima
                     */

                    if (
                        evento.translationY <
                        -50
                    ) {

                        altura.value =
                            withSpring(
                                ALTURA_ABERTA,
                                {
                                    damping: 24,
                                    stiffness: 180,
                                    mass: 0.9,

                                    overshootClamping:
                                        true,
                                }
                            );


                        runOnJS(
                            setAberta
                        )(true);


                        return;
                    }


                    /*
                     * Arrastou para baixo
                     */

                    if (
                        evento.translationY >
                        50
                    ) {

                        altura.value =
                            withTiming(
                                ALTURA_FECHADA,
                                {
                                    duration: 220,
                                }
                            );


                        runOnJS(
                            setAberta
                        )(false);


                        return;
                    }


                    /*
                     * Soltou sem arrastar
                     * o suficiente.
                     */

                    altura.value =
                        withSpring(
                            aberta
                                ? ALTURA_ABERTA
                                : ALTURA_FECHADA,
                            {
                                damping: 28,
                                stiffness: 200,

                                overshootClamping:
                                    true,
                            }
                        );

                }
            );


    const estiloAnimado =
        useAnimatedStyle(
            () => ({
                height:
                altura.value,
            })
        );


    function formatarDistancia(
        distanciaKm: number
    ) {

        /*
         * Menos de 1 km:
         * mostra metros.
         */

        if (
            distanciaKm < 1
        ) {

            return `${
                Math.round(
                    distanciaKm * 1000
                )
            } m`;

        }


        return `${
            distanciaKm.toFixed(1)
        } km`;

    }


    function textoOcupacao(
        percentual: number
    ) {

        if (
            percentual <= 40
        ) {
            return "Baixa ocupação";
        }


        if (
            percentual <= 70
        ) {
            return "Ocupação moderada";
        }


        return "Alta ocupação";

    }


    const pesquisando =
        busca.trim().length > 0;


    return (

        <GestureDetector
            gesture={gesto}
        >

            <Animated.View
                style={[
                    styles.container,
                    estiloAnimado,
                ]}
            >


                {/* GLASS EFFECT */}

                <BlurView

                    intensity={
                        aberta
                            ? 55
                            : 42
                    }

                    tint="light"

                    style={
                        StyleSheet.absoluteFill
                    }

                />


                <View

                    pointerEvents="none"

                    style={[
                        StyleSheet.absoluteFill,

                        {
                            backgroundColor:
                                aberta
                                    ? colors.glassGreen
                                    : colors.glassLight,
                        },
                    ]}

                />


                {/* BARRINHA */}

                <Pressable

                    style={
                        styles.handleArea
                    }

                    onPress={
                        alternar
                    }

                >

                    <View
                        style={[
                            styles.handle,

                            aberta
                                ? styles.handleOpen
                                : styles.handleClosed,
                        ]}
                    />

                </Pressable>


                {aberta ? (

                    <>

                        {/* PESQUISA */}

                        <View
                            style={
                                styles.searchBarOpen
                            }
                        >

                            <Text
                                style={
                                    styles.searchIcon
                                }
                            >
                                ⌕
                            </Text>


                            <TextInput

                                value={
                                    busca
                                }

                                onChangeText={
                                    setBusca
                                }

                                placeholder="Procurar unidade"

                                placeholderTextColor={
                                    "#666666"
                                }

                                style={
                                    styles.input
                                }

                            />

                        </View>


                        {pesquisando ? (

                            /* RESULTADOS DA PESQUISA */

                            <>

                                <Text
                                    style={
                                        styles.sectionTitle
                                    }
                                >
                                    Resultados
                                </Text>


                                <View
                                    style={
                                        styles.listContainer
                                    }
                                >

                                    {
                                        unidadesFiltradas.length >
                                        0
                                            ? (

                                                unidadesFiltradas
                                                    .slice(0, 4)
                                                    .map(
                                                        (unidade) => (

                                                            <Pressable

                                                                key={
                                                                    unidade.unidadeId
                                                                }

                                                                style={
                                                                    styles.unitRow
                                                                }

                                                                onPress={() =>
                                                                    abrirUnidade(
                                                                        unidade
                                                                    )
                                                                }

                                                            >

                                                                <View
                                                                    style={
                                                                        styles.unitTextContainer
                                                                    }
                                                                >

                                                                    <Text
                                                                        style={
                                                                            styles.unitName
                                                                        }
                                                                    >
                                                                        {unidade.nome}
                                                                    </Text>


                                                                    <Text
                                                                        style={
                                                                            styles.unitInfo
                                                                        }
                                                                    >
                                                                        Movimento:{" "}
                                                                        {unidade.tendencia}
                                                                    </Text>

                                                                </View>


                                                                <View
                                                                    style={
                                                                        styles.percentageBadge
                                                                    }
                                                                >

                                                                    <Text
                                                                        style={
                                                                            styles.percentage
                                                                        }
                                                                    >

                                                                        {
                                                                            unidade
                                                                                .percentualOcupacao
                                                                                .toFixed(0)
                                                                        }
                                                                        %

                                                                    </Text>

                                                                </View>

                                                            </Pressable>

                                                        )
                                                    )

                                            )
                                            : (

                                                <Text
                                                    style={
                                                        styles.emptyText
                                                    }
                                                >
                                                    Nenhuma unidade encontrada
                                                </Text>

                                            )
                                    }

                                </View>

                            </>

                        ) : (

                            /* HOME DA DYNAMIC ISLAND */

                            <>

                                {/* PRÓXIMAS */}

                                <Text
                                    style={
                                        styles.sectionTitle
                                    }
                                >
                                    Próximas de você
                                </Text>


                                <View
                                    style={
                                        styles.listContainer
                                    }
                                >

                                    {
                                        localizacaoUsuario &&
                                        unidadesProximas.length >
                                        0
                                            ? (

                                                unidadesProximas.map(
                                                    ({
                                                         unidade,
                                                         distanciaKm,
                                                     }) => (

                                                        <Pressable

                                                            key={
                                                                `proxima-${unidade.unidadeId}`
                                                            }

                                                            style={
                                                                styles.unitRow
                                                            }

                                                            onPress={() =>
                                                                abrirUnidade(
                                                                    unidade
                                                                )
                                                            }

                                                        >

                                                            <View
                                                                style={
                                                                    styles.unitTextContainer
                                                                }
                                                            >

                                                                <Text
                                                                    style={
                                                                        styles.unitName
                                                                    }
                                                                >
                                                                    {unidade.nome}
                                                                </Text>


                                                                <Text
                                                                    style={
                                                                        styles.unitInfo
                                                                    }
                                                                >
                                                                    📍{" "}
                                                                    {
                                                                        formatarDistancia(
                                                                            distanciaKm
                                                                        )
                                                                    }
                                                                </Text>

                                                            </View>


                                                            <View
                                                                style={
                                                                    styles.percentageBadge
                                                                }
                                                            >

                                                                <Text
                                                                    style={
                                                                        styles.percentage
                                                                    }
                                                                >

                                                                    {
                                                                        unidade
                                                                            .percentualOcupacao
                                                                            .toFixed(0)
                                                                    }
                                                                    %

                                                                </Text>

                                                            </View>

                                                        </Pressable>

                                                    )
                                                )

                                            )
                                            : (

                                                <Text
                                                    style={
                                                        styles.emptyText
                                                    }
                                                >

                                                    {
                                                        erroLocalizacao
                                                            ? "Localização indisponível"
                                                            : "Obtendo sua localização..."
                                                    }

                                                </Text>

                                            )
                                    }

                                </View>


                                {/* SUGESTÕES */}

                                <View
                                    style={
                                        styles.suggestionHeader
                                    }
                                >

                                    <Text
                                        style={
                                            styles.sectionTitleSuggestion
                                        }
                                    >
                                        Sugestões
                                    </Text>


                                    <Text
                                        style={
                                            styles.smartLabel
                                        }
                                    >
                                        melhor opção
                                    </Text>

                                </View>


                                <View
                                    style={
                                        styles.listContainer
                                    }
                                >

                                    {
                                        sugestoes.length >
                                        0
                                            ? (

                                                sugestoes.map(
                                                    ({
                                                         unidade,
                                                         distanciaKm,
                                                     }) => (

                                                        <Pressable

                                                            key={
                                                                `sugestao-${unidade.unidadeId}`
                                                            }

                                                            style={
                                                                styles.unitRow
                                                            }

                                                            onPress={() =>
                                                                abrirUnidade(
                                                                    unidade
                                                                )
                                                            }

                                                        >

                                                            <View
                                                                style={
                                                                    styles.recommendationIcon
                                                                }
                                                            >

                                                                <Text
                                                                    style={
                                                                        styles.recommendationIconText
                                                                    }
                                                                >
                                                                    ★
                                                                </Text>

                                                            </View>


                                                            <View
                                                                style={
                                                                    styles.unitTextContainer
                                                                }
                                                            >

                                                                <Text
                                                                    style={
                                                                        styles.unitName
                                                                    }
                                                                >
                                                                    {unidade.nome}
                                                                </Text>


                                                                <Text
                                                                    style={
                                                                        styles.unitInfo
                                                                    }
                                                                >

                                                                    {
                                                                        formatarDistancia(
                                                                            distanciaKm
                                                                        )
                                                                    }

                                                                    {"  •  "}

                                                                    {
                                                                        textoOcupacao(
                                                                            unidade
                                                                                .percentualOcupacao
                                                                        )
                                                                    }

                                                                </Text>

                                                            </View>


                                                            <View
                                                                style={
                                                                    styles.percentageBadge
                                                                }
                                                            >

                                                                <Text
                                                                    style={
                                                                        styles.percentage
                                                                    }
                                                                >

                                                                    {
                                                                        unidade
                                                                            .percentualOcupacao
                                                                            .toFixed(0)
                                                                    }
                                                                    %

                                                                </Text>

                                                            </View>

                                                        </Pressable>

                                                    )
                                                )

                                            )
                                            : (

                                                <Text
                                                    style={
                                                        styles.emptyText
                                                    }
                                                >
                                                    Aguardando localização
                                                </Text>

                                            )
                                    }

                                </View>

                            </>

                        )}


                        {/* FAVORITOS */}

                        {favoritos.length > 0 && (
                            <>
                                <View
                                    style={
                                        styles.favoritesHeader
                                    }
                                >
                                    <Text
                                        style={
                                            styles.favoritesTitle
                                        }
                                    >
                                        Favoritos
                                    </Text>

                                    <Text
                                        style={
                                            styles.favoritesHeart
                                        }
                                    >
                                        ♥
                                    </Text>
                                </View>

                                <View
                                    style={
                                        styles.listContainer
                                    }
                                >
                                    {favoritos
                                        .slice(0, 2)
                                        .map(
                                            (unidade) => (
                                                <Pressable
                                                    key={
                                                        `favorito-${unidade.unidadeId}`
                                                    }

                                                    style={
                                                        styles.unitRow
                                                    }

                                                    onPress={() =>
                                                        abrirUnidade(
                                                            unidade
                                                        )
                                                    }
                                                >
                                                    <View
                                                        style={
                                                            styles.favoriteMiniIcon
                                                        }
                                                    >
                                                        <Text
                                                            style={
                                                                styles.favoriteMiniIconText
                                                            }
                                                        >
                                                            ♥
                                                        </Text>
                                                    </View>

                                                    <View
                                                        style={
                                                            styles.unitTextContainer
                                                        }
                                                    >
                                                        <Text
                                                            style={
                                                                styles.unitName
                                                            }
                                                        >
                                                            {unidade.nome}
                                                        </Text>

                                                        <Text
                                                            style={
                                                                styles.unitInfo
                                                            }
                                                        >
                                                            Unidade favorita
                                                        </Text>
                                                    </View>

                                                    <View
                                                        style={
                                                            styles.percentageBadge
                                                        }
                                                    >
                                                        <Text
                                                            style={
                                                                styles.percentage
                                                            }
                                                        >
                                                            {unidade.percentualOcupacao.toFixed(
                                                                0
                                                            )}
                                                            %
                                                        </Text>
                                                    </View>
                                                </Pressable>
                                            )
                                        )}
                                </View>
                            </>
                        )}

                        {/* PERFIL */}

                        <Text
                            style={
                                styles.sectionTitleBottom
                            }
                        >
                            Meu Perfil
                        </Text>


                        <Pressable
                            style={
                                styles.option
                            }
                            onPress={
                                abrirPerfil
                            }
                        >

                            <View
                                style={
                                    styles.profileCircle
                                }
                            >

                                <Text
                                    style={
                                        styles.profileCircleText
                                    }
                                >
                                    {usuario
                                        ? usuario.nome
                                            .charAt(0)
                                            .toUpperCase()
                                        : "●"}
                                </Text>

                            </View>


                            <Text
                                style={
                                    styles.optionText
                                }
                            >
                                {usuario
                                    ? usuario.nome
                                    : "acessar perfil"}
                            </Text>


                            <Text
                                style={
                                    styles.arrow
                                }
                            >
                                ›
                            </Text>

                        </Pressable>


                        <View
                            style={
                                styles.spacer
                            }
                        />


                        <Pressable
                            style={
                                styles.supportButton
                            }
                        >

                            <Text
                                style={
                                    styles.supportText
                                }
                            >
                                Suporte
                            </Text>

                        </Pressable>

                    </>

                ) : (

                    /* ILHA FECHADA */

                    <Pressable

                        style={
                            styles.closedArea
                        }

                        onPress={
                            abrir
                        }

                    >

                        <View
                            style={
                                styles.searchBarClosed
                            }
                        >

                            <Text
                                style={
                                    styles.searchIcon
                                }
                            >
                                ⌕
                            </Text>


                            <Text
                                style={
                                    styles.searchText
                                }
                            >
                                Procurar
                            </Text>


                            <View
                                style={
                                    styles.searchMiniIcon
                                }
                            >

                                <Text
                                    style={
                                        styles.searchMiniIconText
                                    }
                                >
                                    ⌕
                                </Text>

                            </View>


                            <View
                                style={
                                    styles.profileButton
                                }
                            >

                                <Text
                                    style={
                                        styles.profileIcon
                                    }
                                >
                                    {usuario
                                        ? usuario.nome
                                            .charAt(0)
                                            .toUpperCase()
                                        : "●"}
                                </Text>

                            </View>

                        </View>

                    </Pressable>

                )}

            </Animated.View>

        </GestureDetector>

    );
}


const styles =
    StyleSheet.create({

        container: {

            position:
                "absolute",

            bottom: 20,

            left: 18,

            right: 18,

            borderRadius:
                25,

            overflow:
                "hidden",

            borderWidth:
                1,

            borderColor:
            colors.glassBorder,

            shadowColor:
                "#000000",

            shadowOpacity:
                0.16,

            shadowRadius:
                18,

            shadowOffset: {
                width: 0,
                height: 6,
            },

            elevation:
                12,

            zIndex:
                50,
        },


        handleArea: {

            height:
                22,

            alignItems:
                "center",

            justifyContent:
                "center",

            zIndex:
                20,
        },


        handle: {

            width:
                46,

            height:
                4,

            borderRadius:
                4,
        },


        handleClosed: {

            backgroundColor:
            colors.primary,
        },


        handleOpen: {

            backgroundColor:
                "rgba(255,255,255,0.85)",
        },


        closedArea: {

            flex:
                1,

            paddingHorizontal:
                8,

            paddingBottom:
                8,
        },


        searchBarClosed: {

            height:
                52,

            borderRadius:
                19,

            borderWidth:
                2,

            borderColor:
            colors.primary,

            backgroundColor:
                "rgba(255,255,255,0.82)",

            paddingLeft:
                14,

            paddingRight:
                6,

            flexDirection:
                "row",

            alignItems:
                "center",
        },


        searchIcon: {

            marginRight:
                8,

            fontSize:
                20,

            color:
            colors.primaryDark,
        },


        searchText: {

            flex:
                1,

            fontSize:
                15,

            fontWeight:
                "800",

            color:
            colors.text,
        },


        searchMiniIcon: {

            width:
                30,

            height:
                30,

            borderRadius:
                15,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        searchMiniIconText: {

            fontSize:
                17,

            color:
            colors.textSecondary,
        },


        profileButton: {

            width:
                38,

            height:
                38,

            borderRadius:
                19,

            backgroundColor:
            colors.primary,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        profileIcon: {

            color:
                "#FFFFFF",

            fontSize:
                14,
        },


        searchBarOpen: {

            height:
                48,

            marginHorizontal:
                14,

            paddingHorizontal:
                14,

            borderRadius:
                17,

            borderWidth:
                1.5,

            borderColor:
                "rgba(47,104,7,0.65)",

            backgroundColor:
                "rgba(255,255,255,0.9)",

            flexDirection:
                "row",

            alignItems:
                "center",
        },


        input: {

            flex:
                1,

            fontSize:
                14,

            color:
            colors.text,
        },


        sectionTitle: {

            marginTop:
                12,

            marginBottom:
                6,

            marginHorizontal:
                16,

            fontSize:
                12,

            fontWeight:
                "900",

            color:
                "#FFFFFF",
        },


        suggestionHeader: {

            marginTop:
                11,

            marginBottom:
                6,

            marginHorizontal:
                16,

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "space-between",
        },


        sectionTitleSuggestion: {

            fontSize:
                12,

            fontWeight:
                "900",

            color:
                "#FFFFFF",
        },


        smartLabel: {

            fontSize:
                9,

            fontWeight:
                "800",

            color:
                "#FFFFFF",

            opacity:
                0.85,
        },


        listContainer: {

            marginHorizontal:
                12,

            borderRadius:
                16,

            backgroundColor:
                "rgba(255,255,255,0.86)",

            overflow:
                "hidden",
        },


        unitRow: {

            minHeight:
                53,

            paddingHorizontal:
                12,

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "space-between",

            borderBottomWidth:
                1,

            borderBottomColor:
                "rgba(0,0,0,0.05)",
        },


        recommendationIcon: {

            width:
                27,

            height:
                27,

            marginRight:
                8,

            borderRadius:
                14,

            backgroundColor:
            colors.primaryLight,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        recommendationIconText: {

            fontSize:
                13,

            color:
            colors.primaryDark,
        },


        unitTextContainer: {

            flex:
                1,

            paddingRight:
                8,
        },


        unitName: {

            fontSize:
                13,

            fontWeight:
                "800",

            color:
            colors.text,
        },


        unitInfo: {

            marginTop:
                2,

            fontSize:
                10,

            color:
            colors.textSecondary,
        },


        percentageBadge: {

            paddingHorizontal:
                8,

            paddingVertical:
                5,

            borderRadius:
                12,

            backgroundColor:
            colors.primaryLight,
        },


        percentage: {

            fontSize:
                11,

            fontWeight:
                "900",

            color:
            colors.primaryDark,
        },


        emptyText: {

            padding:
                14,

            textAlign:
                "center",

            fontSize:
                11,

            color:
            colors.textSecondary,
        },


        sectionTitleBottom: {

            marginTop:
                11,

            marginHorizontal:
                16,

            marginBottom:
                6,

            fontSize:
                12,

            fontWeight:
                "900",

            color:
                "#FFFFFF",
        },


        option: {
            minHeight: 49,

            marginHorizontal: 12,
            marginBottom: 10,

            paddingHorizontal: 10,

            borderRadius: 16,

            backgroundColor:
                "rgba(255,255,255,0.86)",

            flexDirection:
                "row",

            alignItems:
                "center",
        },


        profileCircle: {

            width:
                34,

            height:
                34,

            borderRadius:
                17,

            marginRight:
                9,

            backgroundColor:
            colors.primaryLight,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        profileCircleText: {

            color:
            colors.primary,

            fontSize:
                14,
        },


        optionText: {

            flex:
                1,

            fontSize:
                13,

            fontWeight:
                "700",

            color:
            colors.text,
        },


        arrow: {

            fontSize:
                22,

            color:
            colors.primary,
        },


        spacer: {
            height: 10,
        },


        supportButton: {

            height:
                34,

            marginHorizontal:
                12,

            marginBottom:
                12,

            borderRadius:
                16,

            backgroundColor:
                "rgba(255,255,255,0.9)",

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        supportText: {

            fontSize:
                12,

            fontWeight:
                "800",

            color:
            colors.text,
        },

        favoritesHeader: {
            marginTop: 11,
            marginBottom: 6,
            marginHorizontal: 16,

            flexDirection: "row",

            alignItems: "center",

            justifyContent:
                "space-between",
        },

        favoritesTitle: {
            fontSize: 12,

            fontWeight: "900",

            color: "#FFFFFF",
        },

        favoritesHeart: {
            fontSize: 14,

            color: "#FFFFFF",
        },

        favoriteMiniIcon: {
            width: 27,
            height: 27,

            marginRight: 8,

            borderRadius: 14,

            backgroundColor:
            colors.primaryLight,

            alignItems: "center",

            justifyContent: "center",
        },

        favoriteMiniIconText: {
            fontSize: 13,

            color:
            colors.primary,
        },

    });