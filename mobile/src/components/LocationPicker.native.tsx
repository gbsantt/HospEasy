import {
    Modal,
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
    colors,
} from "../theme/colors";


type Coordenada = {
    latitude: number;
    longitude: number;
};


type Props = {
    visible: boolean;

    coordenada:
        Coordenada | null;

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

    const centroInicial:
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


    return (

        <Modal
            visible={
                visible
            }

            animationType="slide"

            onRequestClose={
                onClose
            }
        >

            <View
                style={
                    styles.container
                }
            >

                <View
                    style={
                        styles.header
                    }
                >

                    <Pressable
                        onPress={
                            onClose
                        }

                        style={
                            styles.headerButton
                        }
                    >

                        <Text
                            style={
                                styles.headerButtonText
                            }
                        >
                            Cancelar
                        </Text>

                    </Pressable>


                    <Text
                        style={
                            styles.title
                        }
                    >
                        Localização da unidade
                    </Text>


                    <Pressable
                        onPress={
                            onConfirm
                        }

                        disabled={
                            !coordenada
                        }

                        style={
                            styles.headerButton
                        }
                    >

                        <Text
                            style={[
                                styles.confirmText,

                                !coordenada &&
                                styles.disabledText,
                            ]}
                        >
                            Confirmar
                        </Text>

                    </Pressable>

                </View>


                <View
                    style={
                        styles.mapContainer
                    }
                >

                    <Map
                        style={
                            styles.map
                        }

                        mapStyle=
                            "https://tiles.openfreemap.org/styles/liberty"

                        onPress={(
                            event: any
                        ) => {

                            const coords =
                                event?.geometry?.coordinates;


                            if (
                                !coords ||
                                coords.length < 2
                            ) {

                                return;
                            }


                            onChange({
                                longitude:
                                    Number(
                                        coords[0]
                                    ),

                                latitude:
                                    Number(
                                        coords[1]
                                    ),
                            });

                        }}
                    >

                        <Camera
                            initialViewState={{
                                center:
                                centroInicial,

                                zoom:
                                    coordenada
                                        ? 16
                                        : 11,
                            }}
                        />


                        {
                            coordenada && (

                                <Marker
                                    id=
                                        "unidade-selecionada"

                                    lngLat={[
                                        coordenada.longitude,
                                        coordenada.latitude,
                                    ]}
                                >

                                    <View
                                        style={
                                            styles.markerOuter
                                        }
                                    >

                                        <View
                                            style={
                                                styles.markerInner
                                            }
                                        />

                                    </View>

                                </Marker>

                            )
                        }

                    </Map>


                    {
                        !coordenada && (

                            <View
                                pointerEvents=
                                    "none"

                                style={
                                    styles.hint
                                }
                            >

                                <Text
                                    style={
                                        styles.hintText
                                    }
                                >
                                    Toque no mapa para marcar a unidade
                                </Text>

                            </View>

                        )
                    }

                </View>


                {
                    coordenada && (

                        <View
                            style={
                                styles.footer
                            }
                        >

                            <Text
                                style={
                                    styles.footerLabel
                                }
                            >
                                Local selecionado
                            </Text>

                            <Text
                                style={
                                    styles.footerCoordinate
                                }
                            >
                                {
                                    coordenada.latitude
                                        .toFixed(6)
                                }
                                {"  •  "}
                                {
                                    coordenada.longitude
                                        .toFixed(6)
                                }
                            </Text>

                        </View>

                    )
                }

            </View>

        </Modal>
    );
}


const styles =
    StyleSheet.create({

        container: {

            flex: 1,

            backgroundColor:
            colors.background,

        },


        header: {

            paddingTop: 48,

            paddingHorizontal:
                14,

            paddingBottom:
                14,

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "space-between",

            backgroundColor:
            colors.surface,

            borderBottomWidth:
                1,

            borderBottomColor:
            colors.border,

        },


        headerButton: {

            minWidth: 72,

        },


        headerButtonText: {

            fontSize: 14,

            color:
            colors.textSecondary,

        },


        confirmText: {

            fontSize: 14,

            fontWeight:
                "800",

            textAlign:
                "right",

            color:
            colors.primary,

        },


        disabledText: {

            opacity: 0.4,

        },


        title: {

            fontSize: 16,

            fontWeight:
                "900",

            color:
            colors.text,

        },


        mapContainer: {

            flex: 1,

        },


        map: {

            flex: 1,

        },


        hint: {

            position:
                "absolute",

            top: 20,

            left: 20,

            right: 20,

            alignItems:
                "center",

        },


        hintText: {

            paddingHorizontal:
                14,

            paddingVertical:
                9,

            borderRadius:
                18,

            backgroundColor:
                "rgba(255,255,255,0.94)",

            fontSize: 12,

            fontWeight:
                "700",

            color:
            colors.text,

        },


        markerOuter: {

            width: 34,

            height: 34,

            borderRadius: 17,

            backgroundColor:
            colors.primary,

            borderWidth: 4,

            borderColor:
                "#FFFFFF",

            alignItems:
                "center",

            justifyContent:
                "center",

        },


        markerInner: {

            width: 8,

            height: 8,

            borderRadius: 4,

            backgroundColor:
                "#FFFFFF",

        },


        footer: {

            padding: 16,

            backgroundColor:
            colors.surface,

            borderTopWidth:
                1,

            borderTopColor:
            colors.border,

        },


        footerLabel: {

            fontSize: 11,

            fontWeight:
                "800",

            color:
            colors.textSecondary,

        },


        footerCoordinate: {

            marginTop: 4,

            fontSize: 14,

            fontWeight:
                "800",

            color:
            colors.text,

        },

    });