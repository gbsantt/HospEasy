import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    NativeStackScreenProps,
} from "@react-navigation/native-stack";

import {
    RootStackParamList,
} from "../navigation/AppNavigator";

import {
    useAuth,
} from "../context/AuthContext";

import {
    colors,
} from "../theme/colors";


type Props =
    NativeStackScreenProps<
        RootStackParamList,
        "Profile"
    >;


export default function ProfileScreen({
                                          navigation,
                                      }: Props) {

    const {
        usuario,
        logout,
    } = useAuth();


    async function sair() {

        await logout();


        navigation.reset({
            index: 0,

            routes: [
                {
                    name: "Home",
                },
            ],
        });
    }


    if (!usuario) {

        return (

            <View
                style={
                    styles.container
                }
            >

                <Text>
                    Usuário não autenticado.
                </Text>

            </View>

        );
    }


    return (

        <View
            style={
                styles.container
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

                <Text
                    style={
                        styles.backText
                    }
                >
                    ‹
                </Text>

            </Pressable>


            <View
                style={
                    styles.profileHeader
                }
            >

                <View
                    style={
                        styles.avatar
                    }
                >

                    <Text
                        style={
                            styles.avatarText
                        }
                    >
                        {
                            usuario.nome
                                .charAt(0)
                                .toUpperCase()
                        }
                    </Text>

                </View>


                <Text
                    style={
                        styles.name
                    }
                >
                    {usuario.nome}
                </Text>


                <Text
                    style={
                        styles.email
                    }
                >
                    {usuario.email}
                </Text>

            </View>


            <View
                style={
                    styles.card
                }
            >

                <View
                    style={
                        styles.infoRow
                    }
                >

                    <Text
                        style={
                            styles.infoLabel
                        }
                    >
                        Tipo de conta
                    </Text>


                    <Text
                        style={
                            styles.infoValue
                        }
                    >
                        {
                            usuario.tipo ===
                            "ADMIN"
                                ? "Administrador"
                                : "Funcionário"
                        }
                    </Text>

                </View>


                {
                    usuario.unidadeId !==
                    null && (

                        <View
                            style={
                                styles.infoRow
                            }
                        >

                            <Text
                                style={
                                    styles.infoLabel
                                }
                            >
                                Unidade
                            </Text>


                            <Text
                                style={
                                    styles.infoValue
                                }
                            >
                                #{usuario.unidadeId}
                            </Text>

                        </View>

                    )
                }

            </View>


            <Pressable

                style={
                    styles.logoutButton
                }

                onPress={
                    sair
                }

            >

                <Text
                    style={
                        styles.logoutText
                    }
                >
                    SAIR DA CONTA
                </Text>

            </Pressable>

        </View>

    );
}


const styles =
    StyleSheet.create({

        container: {

            flex: 1,

            padding: 20,

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


        profileHeader: {

            marginTop: 42,

            alignItems:
                "center",
        },


        avatar: {

            width: 90,

            height: 90,

            borderRadius: 45,

            backgroundColor:
            colors.primary,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        avatarText: {

            fontSize: 38,

            fontWeight: "900",

            color: "#FFFFFF",
        },


        name: {

            marginTop: 16,

            fontSize: 26,

            fontWeight: "900",

            color:
            colors.text,
        },


        email: {

            marginTop: 5,

            fontSize: 14,

            color:
            colors.textSecondary,
        },


        card: {

            marginTop: 36,

            padding: 18,

            borderRadius: 20,

            backgroundColor:
            colors.surface,
        },


        infoRow: {

            minHeight: 48,

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "space-between",
        },


        infoLabel: {

            fontSize: 13,

            color:
            colors.textSecondary,
        },


        infoValue: {

            fontSize: 13,

            fontWeight: "800",

            color:
            colors.text,
        },


        logoutButton: {

            height: 54,

            marginTop: 24,

            borderWidth: 1.5,

            borderColor:
            colors.danger,

            borderRadius: 17,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        logoutText: {

            fontSize: 13,

            fontWeight: "900",

            color:
            colors.danger,
        },

    });