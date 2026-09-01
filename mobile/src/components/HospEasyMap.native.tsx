import {
    useEffect,
    useRef,
} from "react";

import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    Camera,
    Map,
    Marker,
} from "@maplibre/maplibre-react-native";

import {
    Unidade,
} from "../types/Unidade";

import {
    Coordenada,
} from "../utils/location";

import {
    colors,
} from "../theme/colors";


type Props = {

    unidades: Unidade[];

    localizacaoUsuario:
        Coordenada | null;

    onSelecionarUnidade: (
        unidade: Unidade
    ) => void;
};


export default function HospEasyMap({
                                        unidades,
                                        localizacaoUsuario,
                                        onSelecionarUnidade,
                                    }: Props) {

    const cameraRef =
        useRef<any>(null);


    const centralizouUsuario =
        useRef(false);


    function corMarcador(
        unidade: Unidade
    ) {

        if (
            unidade.statusCamera === "OFFLINE" ||
            unidade.statusCamera === "DESATIVADA" ||
            unidade.statusMedicao !== "ATUALIZADA"
        ) {

            return colors.offline;
        }


        if (
            unidade.percentualOcupacao >= 80
        ) {

            return colors.danger;
        }


        if (
            unidade.percentualOcupacao >= 50
        ) {

            return colors.warning;
        }


        return colors.primary;
    }


    const unidadesComLocalizacao =
        unidades.filter(
            (unidade) =>
                unidade.latitude !== null &&
                unidade.longitude !== null
        );


    function irParaMinhaLocalizacao() {

        if (
            !localizacaoUsuario
        ) {

            return;
        }


        cameraRef.current?.flyTo(
            {
                center: [
                    localizacaoUsuario.longitude,
                    localizacaoUsuario.latitude,
                ],

                zoom: 15,

                duration: 1000,
            }
        );
    }


    useEffect(() => {

        if (
            !localizacaoUsuario ||
            centralizouUsuario.current
        ) {

            return;
        }


        centralizouUsuario.current =
            true;


        cameraRef.current?.flyTo(
            {
                center: [
                    localizacaoUsuario.longitude,
                    localizacaoUsuario.latitude,
                ],

                zoom: 15,

                duration: 1000,
            }
        );

    }, [
        localizacaoUsuario,
    ]);


    return (

        <View
            style={
                styles.container
            }
        >

            <Map
                style={
                    styles.map
                }

                mapStyle=
                    "https://tiles.openfreemap.org/styles/liberty"
            >

                <Camera
                    ref={
                        cameraRef
                    }

                    initialViewState={{
                        center: [
                            -46.6333,
                            -23.5505,
                        ],

                        zoom: 11,
                    }}
                />


                {
                    localizacaoUsuario && (

                        <Marker
                            id="usuario-localizacao"

                            lngLat={[
                                localizacaoUsuario.longitude,
                                localizacaoUsuario.latitude,
                            ]}
                        >

                            <View
                                style={
                                    styles.userMarkerContainer
                                }
                            >

                                <View
                                    style={
                                        styles.userMarkerPulse
                                    }
                                />

                                <View
                                    style={
                                        styles.userMarker
                                    }
                                />

                            </View>

                        </Marker>

                    )
                }


                {
                    unidadesComLocalizacao.map(
                        (unidade) => (

                            <Marker
                                key={
                                    unidade.unidadeId
                                }

                                id={
                                    String(
                                        unidade.unidadeId
                                    )
                                }

                                lngLat={[
                                    unidade.longitude!,
                                    unidade.latitude!,
                                ]}

                                onPress={() =>
                                    onSelecionarUnidade(
                                        unidade
                                    )
                                }
                            >

                                <View
                                    style={[
                                        styles.marker,
                                        {
                                            backgroundColor:
                                                corMarcador(
                                                    unidade
                                                ),
                                        },
                                    ]}
                                >

                                    <View
                                        style={
                                            styles.markerCenter
                                        }
                                    />

                                </View>

                            </Marker>

                        )
                    )
                }

            </Map>


            <Pressable
                style={[
                    styles.locationButton,

                    !localizacaoUsuario &&
                    styles.locationButtonDisabled,
                ]}

                disabled={
                    !localizacaoUsuario
                }

                onPress={
                    irParaMinhaLocalizacao
                }
            >

                <Text
                    style={
                        styles.locationButtonIcon
                    }
                >
                    ⦿
                </Text>

            </Pressable>

        </View>
    );
}


const styles =
    StyleSheet.create({

        container: {

            flex: 1,

        },


        map: {

            flex: 1,

        },


        marker: {

            width: 30,

            height: 30,

            borderRadius: 15,

            borderWidth: 3,

            borderColor:
                "#FFFFFF",

            alignItems:
                "center",

            justifyContent:
                "center",

        },


        markerCenter: {

            width: 8,

            height: 8,

            borderRadius: 4,

            backgroundColor:
                "#FFFFFF",

        },


        /*
         * LOCALIZAÇÃO DO USUÁRIO
         */

        userMarkerContainer: {

            width: 38,

            height: 38,

            alignItems:
                "center",

            justifyContent:
                "center",

        },


        userMarkerPulse: {

            position:
                "absolute",

            width: 34,

            height: 34,

            borderRadius: 17,

            backgroundColor:
                "rgba(33, 150, 243, 0.22)",

        },


        userMarker: {

            width: 18,

            height: 18,

            borderRadius: 9,

            backgroundColor:
                "#2196F3",

            borderWidth: 3,

            borderColor:
                "#FFFFFF",

        },


        /*
         * BOTÃO "MINHA LOCALIZAÇÃO"
         */

        locationButton: {

            position:
                "absolute",

            right: 18,

            /*
             * Mais alto para não bater
             * com a DynamicIsland.
             */
            bottom: 125,

            width: 50,

            height: 50,

            borderRadius: 25,

            backgroundColor:
                "#FFFFFF",

            alignItems:
                "center",

            justifyContent:
                "center",

            elevation: 8,

            shadowColor:
                "#000000",

            shadowOffset: {
                width: 0,
                height: 3,
            },

            shadowOpacity: 0.22,

            shadowRadius: 5,

        },


        locationButtonDisabled: {

            opacity: 0.45,

        },


        locationButtonIcon: {

            fontSize: 29,

            lineHeight: 31,

            color:
            colors.primary,

            fontWeight:
                "700",

        },

    });