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
    colors,
} from "../theme/colors";


type Props =
    NativeStackScreenProps<
        RootStackParamList,
        "Access"
    >;


export default function AccessScreen({
                                         navigation,
                                     }: Props) {

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
                    styles.content
                }
            >

                <View
                    style={
                        styles.logo
                    }
                >

                    <Text
                        style={
                            styles.logoText
                        }
                    >
                        H
                    </Text>

                </View>


                <Text
                    style={
                        styles.title
                    }
                >
                    HospEasy
                </Text>


                <Text
                    style={
                        styles.description
                    }
                >
                    Entre na sua conta ou crie
                    uma para acessar seu perfil
                    e recursos personalizados.
                </Text>


                <Pressable
                    style={
                        styles.primaryButton
                    }

                    onPress={() =>
                        navigation.navigate(
                            "Login"
                        )
                    }
                >

                    <Text
                        style={
                            styles.primaryButtonText
                        }
                    >
                        ENTRAR
                    </Text>

                </Pressable>


                <Pressable
                    style={
                        styles.secondaryButton
                    }

                    onPress={() =>
                        navigation.navigate(
                            "Register"
                        )
                    }
                >

                    <Text
                        style={
                            styles.secondaryButtonText
                        }
                    >
                        CRIAR CONTA
                    </Text>

                </Pressable>


                <Text
                    style={
                        styles.registerInfo
                    }
                >
                    Crie sua conta gratuitamente
                    para personalizar sua experiência.
                </Text>

            </View>

        </View>
    );
}


const styles =
    StyleSheet.create({

        container: {

            flex: 1,

            backgroundColor:
            colors.background,

            padding: 20,
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


        content: {

            flex: 1,

            justifyContent:
                "center",

            alignItems:
                "center",

            paddingBottom: 50,
        },


        logo: {

            width: 82,

            height: 82,

            borderRadius: 24,

            backgroundColor:
            colors.primary,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        logoText: {

            fontSize: 38,

            fontWeight: "900",

            color: "#FFFFFF",
        },


        title: {

            marginTop: 20,

            fontSize: 34,

            fontWeight: "900",

            color:
            colors.text,
        },


        description: {

            maxWidth: 320,

            marginTop: 10,

            marginBottom: 34,

            fontSize: 14,

            lineHeight: 21,

            textAlign: "center",

            color:
            colors.textSecondary,
        },


        primaryButton: {

            width: "100%",

            height: 56,

            maxWidth: 380,

            borderRadius: 18,

            backgroundColor:
            colors.primary,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        primaryButtonText: {

            fontSize: 14,

            fontWeight: "900",

            letterSpacing: 0.8,

            color: "#FFFFFF",
        },


        secondaryButton: {

            width: "100%",

            height: 56,

            maxWidth: 380,

            marginTop: 12,

            borderRadius: 18,

            borderWidth: 2,

            borderColor:
            colors.primary,

            backgroundColor:
            colors.background,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        secondaryButtonText: {

            fontSize: 14,

            fontWeight: "900",

            letterSpacing: 0.8,

            color:
            colors.primary,
        },


        registerInfo: {

            maxWidth: 300,

            marginTop: 18,

            fontSize: 12,

            lineHeight: 18,

            textAlign: "center",

            color:
            colors.textSecondary,
        },

    });