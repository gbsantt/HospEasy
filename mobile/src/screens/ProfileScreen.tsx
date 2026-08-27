import {
    Pressable,
    ScrollView,
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
    useFavorites,
} from "../context/FavoritesContext";

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


    const {
        favoritos,
        alternarFavorito,
    } = useFavorites();


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

                <Text
                    style={
                        styles.notAuthenticatedText
                    }
                >
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

            <ScrollView
                showsVerticalScrollIndicator={
                    false
                }

                contentContainerStyle={
                    styles.content
                }
            >

                {/* VOLTAR */}

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


                {/* PERFIL */}

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


                {/* ADMIN */}

                {
                    usuario.tipo ===
                    "ADMIN" && (

                        <View
                            style={
                                styles.accountCard
                            }
                        >

                            <Text
                                style={
                                    styles.accountLabel
                                }
                            >
                                Tipo de conta
                            </Text>


                            <View
                                style={
                                    styles.adminBadge
                                }
                            >

                                <Text
                                    style={
                                        styles.adminBadgeText
                                    }
                                >
                                    Administrador
                                </Text>

                            </View>

                        </View>

                    )
                }

                {/* PAINEL ADMINISTRATIVO */}

                {
                    usuario.tipo ===
                    "ADMIN" && (

                        <View
                            style={
                                styles.adminSection
                            }
                        >

                            <View
                                style={
                                    styles.adminSectionHeader
                                }
                            >

                                <Text
                                    style={
                                        styles.adminSectionTitle
                                    }
                                >
                                    Painel administrativo
                                </Text>


                                <Text
                                    style={
                                        styles.adminSectionSubtitle
                                    }
                                >
                                    Gerencie o HospEasy
                                </Text>

                            </View>


                            <View
                                style={
                                    styles.adminMenu
                                }
                            >

                                <Pressable
                                    style={
                                        styles.adminMenuItem
                                    }

                                    onPress={() =>
                                        navigation.navigate(
                                            "UsuariosAdmin"
                                        )
                                    }
                                >

                                    <View
                                        style={
                                            styles.adminMenuIcon
                                        }
                                    >

                                        <Text
                                            style={
                                                styles.adminMenuIconText
                                            }
                                        >
                                            U
                                        </Text>

                                    </View>


                                    <View
                                        style={
                                            styles.adminMenuContent
                                        }
                                    >

                                        <Text
                                            style={
                                                styles.adminMenuTitle
                                            }
                                        >
                                            Gerenciar usuários
                                        </Text>


                                        <Text
                                            style={
                                                styles.adminMenuDescription
                                            }
                                        >
                                            Contas, permissões e acessos
                                        </Text>

                                    </View>


                                    <Text
                                        style={
                                            styles.adminMenuArrow
                                        }
                                    >
                                        ›
                                    </Text>

                                </Pressable>

                            </View>

                        </View>

                    )
                }

                {/* USUÁRIO COMUM */}

                {
                    usuario.tipo ===
                    "USUARIO" && (

                        <View
                            style={
                                styles.accountCard
                            }
                        >

                            <Text
                                style={
                                    styles.accountLabel
                                }
                            >
                                Tipo de conta
                            </Text>


                            <Text
                                style={
                                    styles.accountValue
                                }
                            >
                                Usuário
                            </Text>

                        </View>

                    )
                }


                {/* FAVORITOS */}

                {
                    usuario.tipo ===
                    "USUARIO" && (

                        <View
                            style={
                                styles.section
                            }
                        >

                            <View
                                style={
                                    styles.sectionHeader
                                }
                            >

                                <View>

                                    <Text
                                        style={
                                            styles.sectionTitle
                                        }
                                    >
                                        Favoritos
                                    </Text>


                                    <Text
                                        style={
                                            styles.sectionSubtitle
                                        }
                                    >
                                        Suas unidades salvas
                                    </Text>

                                </View>


                                <View
                                    style={
                                        styles.counterBadge
                                    }
                                >

                                    <Text
                                        style={
                                            styles.counterText
                                        }
                                    >
                                        {
                                            favoritos.length
                                        }
                                    </Text>

                                </View>

                            </View>


                            {
                                favoritos.length ===
                                0
                                    ? (

                                        <View
                                            style={
                                                styles.emptyContainer
                                            }
                                        >

                                            <Text
                                                style={
                                                    styles.emptyHeart
                                                }
                                            >
                                                ♡
                                            </Text>


                                            <Text
                                                style={
                                                    styles.emptyTitle
                                                }
                                            >
                                                Nenhum favorito
                                            </Text>


                                            <Text
                                                style={
                                                    styles.emptyText
                                                }
                                            >
                                                Favorite uma unidade para
                                                encontrá-la rapidamente aqui.
                                            </Text>

                                        </View>

                                    )
                                    : (

                                        <View
                                            style={
                                                styles.favoritesContainer
                                            }
                                        >

                                            {
                                                favoritos.map(
                                                    (
                                                        unidade
                                                    ) => (

                                                        <Pressable
                                                            key={
                                                                unidade.unidadeId
                                                            }

                                                            style={
                                                                styles.favoriteCard
                                                            }

                                                            onPress={() =>
                                                                navigation.navigate(
                                                                    "Unit",
                                                                    {
                                                                        unidade,
                                                                    }
                                                                )
                                                            }
                                                        >

                                                            <View
                                                                style={
                                                                    styles.favoriteIcon
                                                                }
                                                            >

                                                                <Text
                                                                    style={
                                                                        styles.favoriteHeart
                                                                    }
                                                                >
                                                                    ♥
                                                                </Text>

                                                            </View>


                                                            <View
                                                                style={
                                                                    styles.favoriteContent
                                                                }
                                                            >

                                                                <Text
                                                                    style={
                                                                        styles.favoriteName
                                                                    }

                                                                    numberOfLines={
                                                                        1
                                                                    }
                                                                >
                                                                    {
                                                                        unidade.nome
                                                                    }
                                                                </Text>


                                                                <Text
                                                                    style={
                                                                        styles.favoriteInfo
                                                                    }
                                                                >
                                                                    Ocupação atual:{" "}
                                                                    {
                                                                        unidade
                                                                            .percentualOcupacao
                                                                            .toFixed(
                                                                                0
                                                                            )
                                                                    }
                                                                    %
                                                                </Text>

                                                            </View>


                                                            <Pressable
                                                                style={
                                                                    styles.removeFavoriteButton
                                                                }

                                                                onPress={(
                                                                    evento
                                                                ) => {

                                                                    evento.stopPropagation();

                                                                    alternarFavorito(
                                                                        unidade
                                                                    );
                                                                }}
                                                            >

                                                                <Text
                                                                    style={
                                                                        styles.removeFavoriteText
                                                                    }
                                                                >
                                                                    ♥
                                                                </Text>

                                                            </Pressable>


                                                            <Text
                                                                style={
                                                                    styles.arrow
                                                                }
                                                            >
                                                                ›
                                                            </Text>

                                                        </Pressable>

                                                    )
                                                )
                                            }

                                        </View>

                                    )
                            }

                        </View>

                    )
                }


                {/* MINHAS AVALIAÇÕES */}

                {
                    usuario.tipo ===
                    "USUARIO" && (

                        <View
                            style={
                                styles.section
                            }
                        >

                            <View
                                style={
                                    styles.sectionHeader
                                }
                            >

                                <View>

                                    <Text
                                        style={
                                            styles.sectionTitle
                                        }
                                    >
                                        Minhas avaliações
                                    </Text>


                                    <Text
                                        style={
                                            styles.sectionSubtitle
                                        }
                                    >
                                        Avaliações feitas por você
                                    </Text>

                                </View>


                                <Text
                                    style={
                                        styles.reviewStar
                                    }
                                >
                                    ★
                                </Text>

                            </View>


                            <View
                                style={
                                    styles.reviewPlaceholder
                                }
                            >

                                <Text
                                    style={
                                        styles.reviewPlaceholderText
                                    }
                                >
                                    Suas avaliações aparecerão aqui.
                                </Text>

                            </View>

                        </View>

                    )
                }


                {/* LOGOUT */}

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

            </ScrollView>

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


        content: {

            padding: 20,

            paddingBottom: 50,
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

            marginTop: 32,

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

            fontWeight:
                "900",

            color:
                "#FFFFFF",
        },


        name: {

            marginTop: 16,

            fontSize: 26,

            fontWeight:
                "900",

            color:
            colors.text,
        },


        email: {

            marginTop: 5,

            fontSize: 14,

            color:
            colors.textSecondary,
        },


        accountCard: {

            marginTop: 30,

            padding: 18,

            borderRadius: 20,

            backgroundColor:
            colors.surface,

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "space-between",
        },


        accountLabel: {

            fontSize: 13,

            color:
            colors.textSecondary,
        },


        accountValue: {

            fontSize: 13,

            fontWeight:
                "800",

            color:
            colors.text,
        },


        adminBadge: {

            paddingHorizontal: 12,

            paddingVertical: 7,

            borderRadius: 14,

            backgroundColor:
            colors.primaryLight,
        },


        adminBadgeText: {

            fontSize: 12,

            fontWeight:
                "900",

            color:
            colors.primaryDark,
        },


        section: {

            marginTop: 28,
        },


        sectionHeader: {

            flexDirection:
                "row",

            alignItems:
                "center",

            justifyContent:
                "space-between",

            marginBottom: 12,
        },


        sectionTitle: {

            fontSize: 19,

            fontWeight:
                "900",

            color:
            colors.text,
        },


        sectionSubtitle: {

            marginTop: 3,

            fontSize: 12,

            color:
            colors.textSecondary,
        },


        counterBadge: {

            minWidth: 32,

            height: 32,

            paddingHorizontal: 9,

            borderRadius: 16,

            backgroundColor:
            colors.primary,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        counterText: {

            fontSize: 12,

            fontWeight:
                "900",

            color:
                "#FFFFFF",
        },


        emptyContainer: {

            paddingVertical: 28,

            paddingHorizontal: 20,

            borderRadius: 20,

            backgroundColor:
            colors.surface,

            alignItems:
                "center",
        },


        emptyHeart: {

            fontSize: 34,

            color:
            colors.primary,
        },


        emptyTitle: {

            marginTop: 7,

            fontSize: 15,

            fontWeight:
                "900",

            color:
            colors.text,
        },


        emptyText: {

            maxWidth: 260,

            marginTop: 5,

            fontSize: 12,

            lineHeight: 18,

            textAlign:
                "center",

            color:
            colors.textSecondary,
        },


        favoritesContainer: {

            borderRadius: 20,

            overflow:
                "hidden",

            backgroundColor:
            colors.surface,
        },


        favoriteCard: {

            minHeight: 68,

            paddingHorizontal: 13,

            flexDirection:
                "row",

            alignItems:
                "center",

            borderBottomWidth: 1,

            borderBottomColor:
            colors.border,
        },


        favoriteIcon: {

            width: 38,

            height: 38,

            marginRight: 11,

            borderRadius: 19,

            backgroundColor:
            colors.primaryLight,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        favoriteHeart: {

            fontSize: 18,

            color:
            colors.primary,
        },


        favoriteContent: {

            flex: 1,

            paddingRight: 8,
        },


        favoriteName: {

            fontSize: 14,

            fontWeight:
                "800",

            color:
            colors.text,
        },


        favoriteInfo: {

            marginTop: 3,

            fontSize: 11,

            color:
            colors.textSecondary,
        },


        removeFavoriteButton: {

            width: 34,

            height: 34,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        removeFavoriteText: {

            fontSize: 18,

            color:
            colors.primary,
        },


        arrow: {

            marginLeft: 2,

            fontSize: 23,

            color:
            colors.primary,
        },


        reviewStar: {

            fontSize: 22,

            color:
            colors.primary,
        },


        reviewPlaceholder: {

            paddingVertical: 22,

            paddingHorizontal: 18,

            borderRadius: 20,

            backgroundColor:
            colors.surface,

            alignItems:
                "center",
        },


        reviewPlaceholderText: {

            fontSize: 12,

            color:
            colors.textSecondary,
        },


        logoutButton: {

            height: 54,

            marginTop: 34,

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

            fontWeight:
                "900",

            color:
            colors.danger,
        },


        notAuthenticatedText: {

            fontSize: 14,

            color:
            colors.textSecondary,
        },

        adminSection: {

            marginTop: 28,
        },


        adminSectionHeader: {

            marginBottom: 12,
        },


        adminSectionTitle: {

            fontSize: 19,

            fontWeight:
                "900",

            color:
            colors.text,
        },


        adminSectionSubtitle: {

            marginTop: 3,

            fontSize: 12,

            color:
            colors.textSecondary,
        },


        adminMenu: {

            borderRadius: 20,

            overflow:
                "hidden",

            backgroundColor:
            colors.surface,
        },


        adminMenuItem: {

            minHeight: 76,

            paddingHorizontal: 15,

            flexDirection:
                "row",

            alignItems:
                "center",
        },


        adminMenuIcon: {

            width: 44,

            height: 44,

            marginRight: 13,

            borderRadius: 22,

            backgroundColor:
            colors.primaryLight,

            alignItems:
                "center",

            justifyContent:
                "center",
        },


        adminMenuIconText: {

            fontSize: 15,

            fontWeight:
                "900",

            color:
            colors.primaryDark,
        },


        adminMenuContent: {

            flex: 1,
        },


        adminMenuTitle: {

            fontSize: 14,

            fontWeight:
                "900",

            color:
            colors.text,
        },


        adminMenuDescription: {

            marginTop: 4,

            fontSize: 11,

            color:
            colors.textSecondary,
        },


        adminMenuArrow: {

            marginLeft: 10,

            fontSize: 25,

            color:
            colors.primary,
        },

    });