import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    colors,
} from "../theme/colors";


export default function LoadingScreen() {

    return (

        <View
            style={
                styles.container
            }
        >

            <View
                style={
                    styles.content
                }
            >

                <Text
                    style={
                        styles.logo
                    }
                >
                    HOSP
                    <Text
                        style={
                            styles.logoHighlight
                        }
                    >
                        EASY
                    </Text>
                </Text>


                <ActivityIndicator
                    size="large"
                    color={
                        colors.primary
                    }

                    style={
                        styles.spinner
                    }
                />

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

            alignItems:
                "center",

            justifyContent:
                "center",

        },


        content: {

            alignItems:
                "center",

            justifyContent:
                "center",

        },


        logo: {

            fontSize: 32,

            fontWeight:
                "900",

            letterSpacing:
                1,

            color:
            colors.text,

        },


        logoHighlight: {

            color:
            colors.primary,

        },


        spinner: {

            marginTop: 24,

        },

    });