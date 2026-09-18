import {
    useEffect,
    useRef,
} from "react";

import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    Map,
    Marker,
    NavigationControl,
} from "maplibre-gl";

import "maplibre-gl/dist/maplibre-gl.css";

import {
    colors,
} from "../theme/colors";


type Coordenada = {
    latitude: number;
    longitude: number;
};


type Props = {
    visible: boolean;
    coordenada: Coordenada | null;

    onChange: (
        coordenada: Coordenada
    ) => void;

    onConfirm: () => void;
    onClose: () => void;
};


export default function LocationPicker({
                                           visible,
                                           coordenada,
                                           onChange,
                                           onConfirm,
                                           onClose,
                                       }: Props) {

    const mapContainerRef =
        useRef<HTMLDivElement | null>(
            null
        );

    const mapRef =
        useRef<Map | null>(
            null
        );

    const markerRef =
        useRef<Marker | null>(
            null
        );


    useEffect(() => {

        if (
            !visible ||
            !mapContainerRef.current
        ) {
            return;
        }


        const centro:
            [number, number] =
            coordenada
                ? [
                    coordenada.longitude,
                    coordenada.latitude,
                ]
                : [
                    -46.6333,
                    -23.5505,
                ];


        const map =
            new Map({

                container:
                mapContainerRef.current,

                style:
                    "https://tiles.openfreemap.org/styles/liberty",

                center:
                centro,

                zoom:
                    coordenada
                        ? 16
                        : 10,

            });


        mapRef.current =
            map;


        map.addControl(
            new (
                require("maplibre-gl")
                    .NavigationControl
            )(),
            "top-right"
        );


        function criarMarcador(
            longitude: number,
            latitude: number
        ) {

            if (
                markerRef.current
            ) {

                markerRef.current
                    .setLngLat([
                        longitude,
                        latitude,
                    ]);

                return;
            }


            markerRef.current =
                new Marker({
                    color:
                        "#61B723",
                })
                    .setLngLat([
                        longitude,
                        latitude,
                    ])
                    .addTo(
                        map
                    );

        }


        if (
            coordenada
        ) {

            criarMarcador(
                coordenada.longitude,
                coordenada.latitude
            );

        }


        map.on(
            "click",
            (
                event
            ) => {

                const longitude =
                    event.lngLat.lng;

                const latitude =
                    event.lngLat.lat;


                criarMarcador(
                    longitude,
                    latitude
                );


                onChange({
                    latitude,
                    longitude,
                });

            }
        );


        /*
         * O modal pode terminar de calcular
         * o tamanho depois que o MapLibre
         * inicializa.
         */
        const resizeTimer =
            window.setTimeout(
                () => {

                    map.resize();

                },
                150
            );


        return () => {

            window.clearTimeout(
                resizeTimer
            );

            markerRef.current
                ?.remove();

            markerRef.current =
                null;

            map.remove();

            mapRef.current =
                null;

        };

    }, [
        visible,
    ]);


    return (

        <Modal
            visible={
                visible
            }

            transparent

            animationType="fade"

            onRequestClose={
                onClose
            }
        >

            <View
                style={
                    styles.overlay
                }
            >

                <View
                    style={
                        styles.modal
                    }
                >

                    <View
                        style={
                            styles.header
                        }
                    >

                        <View>

                            <Text
                                style={
                                    styles.title
                                }
                            >
                                Localização da unidade
                            </Text>


                            <Text
                                style={
                                    styles.subtitle
                                }
                            >
                                Clique no mapa para marcar a posição exata.
                            </Text>

                        </View>


                        <Pressable
                            onPress={
                                onClose
                            }

                            style={
                                styles.closeButton
                            }
                        >

                            <Text
                                style={
                                    styles.closeText
                                }
                            >
                                ✕
                            </Text>

                        </Pressable>

                    </View>


                    <View
                        style={
                            styles.mapWrapper
                        }
                    >

                        <div
                            ref={
                                mapContainerRef
                            }

                            style={{
                                width:
                                    "100%",

                                height:
                                    "100%",
                            }}
                        />

                    </View>


                    <View
                        style={
                            styles.footer
                        }
                    >

                        <View
                            style={
                                styles.locationInfo
                            }
                        >

                            {
                                coordenada ? (

                                    <>

                                        <Text
                                            style={
                                                styles.locationTitle
                                            }
                                        >
                                            Posição selecionada
                                        </Text>


                                        <Text
                                            style={
                                                styles.coordinates
                                            }
                                        >
                                            {
                                                coordenada.latitude
                                                    .toFixed(
                                                        6
                                                    )
                                            }

                                            {"  •  "}

                                            {
                                                coordenada.longitude
                                                    .toFixed(
                                                        6
                                                    )
                                            }
                                        </Text>

                                    </>

                                ) : (

                                    <Text
                                        style={
                                            styles.noLocation
                                        }
                                    >
                                        Nenhum ponto selecionado.
                                    </Text>

                                )
                            }

                        </View>


                        <View
                            style={
                                styles.actions
                            }
                        >

                            <Pressable
                                style={
                                    styles.cancelButton
                                }

                                onPress={
                                    onClose
                                }
                            >

                                <Text
                                    style={
                                        styles.cancelText
                                    }
                                >
                                    Cancelar
                                </Text>

                            </Pressable>


                            <Pressable
                                disabled={
                                    !coordenada
                                }

                                style={[
                                    styles.confirmButton,

                                    !coordenada &&
                                    styles.disabledButton,
                                ]}

                                onPress={
                                    onConfirm
                                }
                            >

                                <Text
                                    style={
                                        styles.confirmText
                                    }
                                >
                                    Confirmar localização
                                </Text>

                            </Pressable>

                        </View>

                    </View>

                </View>

            </View>

        </Modal>

    );
}


const styles =
    StyleSheet.create({

        overlay: {

            flex: 1,

            backgroundColor:
                "rgba(0,0,0,0.55)",

            alignItems:
                "center",

            justifyContent:
                "center",

            padding: 24,

        },


        modal: {

            width:
                "100%",

            maxWidth:
                1000,

            height:
                "85%",

            maxHeight:
                750,

            overflow:
                "hidden",

            borderRadius:
                24,

            backgroundColor:
            colors.surface,

        },


        header: {

            paddingHorizontal:
                22,

            paddingVertical:
                18,

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "space-between",

            borderBottomWidth:
                1,

            borderBottomColor:
            colors.border,

        },


        title: {

            fontSize:
                20,

            fontWeight:
                "900",

            color:
            colors.text,

        },


        subtitle: {

            marginTop:
                3,

            fontSize:
                13,

            color:
            colors.textSecondary,

        },


        closeButton: {

            width:
                38,

            height:
                38,

            alignItems:
                "center",

            justifyContent:
                "center",

            borderRadius:
                19,

        },


        closeText: {

            fontSize:
                20,

            color:
            colors.text,

        },


        mapWrapper: {

            flex:
                1,

            minHeight:
                350,

        },


        footer: {

            padding:
                18,

            gap:
                14,

            borderTopWidth:
                1,

            borderTopColor:
            colors.border,

        },


        locationInfo: {

            minHeight:
                42,

        },


        locationTitle: {

            fontSize:
                12,

            fontWeight:
                "800",

            color:
            colors.textSecondary,

        },


        coordinates: {

            marginTop:
                4,

            fontSize:
                14,

            fontWeight:
                "800",

            color:
            colors.text,

        },


        noLocation: {

            fontSize:
                13,

            color:
            colors.textSecondary,

        },


        actions: {

            flexDirection:
                "row",

            justifyContent:
                "flex-end",

            gap:
                10,

        },


        cancelButton: {

            paddingVertical:
                12,

            paddingHorizontal:
                20,

            borderRadius:
                12,

            borderWidth:
                1,

            borderColor:
            colors.border,

        },


        cancelText: {

            fontWeight:
                "700",

            color:
            colors.text,

        },


        confirmButton: {

            paddingVertical:
                12,

            paddingHorizontal:
                20,

            borderRadius:
                12,

            backgroundColor:
            colors.primary,

        },


        disabledButton: {

            opacity:
                0.4,

        },


        confirmText: {

            fontWeight:
                "900",

            color:
                "#FFFFFF",

        },

    });