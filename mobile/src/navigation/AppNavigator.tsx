import {
    NavigationContainer,
} from "@react-navigation/native";

import {
    createNativeStackNavigator,
} from "@react-navigation/native-stack";


import HomeScreen
    from "../screens/HomeScreen";

import UnitScreen
    from "../screens/UnitScreen";

import ReviewScreen
    from "../screens/ReviewScreen";

import AccessScreen
    from "../screens/AccessScreen";

import LoginScreen
    from "../screens/LoginScreen";

import RegisterScreen
    from "../screens/RegisterScreen";

import ProfileScreen
    from "../screens/ProfileScreen";

import ForgotPasswordScreen
    from "../screens/ForgotPasswordScreen";

import VerifyCodeScreen
    from "../screens/VerifyCodeScreen";

import ResetPasswordScreen
    from "../screens/ResetPasswordScreen";

import UsuariosAdminScreen
    from "../screens/UsuariosAdminScreen";

import CriarUsuarioAdminScreen
    from "../screens/CriarUsuarioAdminScreen";

import EditarUsuarioAdminScreen
    from "../screens/EditarUsuarioAdminScreen";

import UnidadesAdminScreen
    from "../screens/UnidadesAdminScreen";

import EditarUnidadeAdminScreen
    from "../screens/EditarUnidadeAdminScreen";


import {
    Unidade,
} from "../types/Unidade";

import {
    UsuarioAdmin,
} from "../service/api";


export type RootStackParamList = {

    Home:
        undefined;


    Unit: {
        unidade: Unidade;
    };


    Review: {
        unidade: Unidade;
    };


    Access:
        undefined;


    Login:
        undefined;


    ForgotPassword:
        undefined;


    VerifyCode: {
        email: string;
    };


    ResetPassword: {
        email: string;
        codigo: string;
    };


    Register:
        undefined;


    Profile:
        undefined;


    UsuariosAdmin:
        undefined;


    CriarUsuarioAdmin:
        undefined;


    EditarUsuarioAdmin: {
        usuario: UsuarioAdmin;
    };


    UnidadesAdmin:
        undefined;


    EditarUnidadeAdmin: {
        unidade: Unidade;
    };
};


const Stack =
    createNativeStackNavigator<
        RootStackParamList
    >();


export default function AppNavigator() {

    return (

        <NavigationContainer>

            <Stack.Navigator
                screenOptions={{
                    headerShown:
                        false,
                }}
            >

                <Stack.Screen
                    name="Home"
                    component={
                        HomeScreen
                    }
                />


                <Stack.Screen
                    name="Unit"
                    component={
                        UnitScreen
                    }
                />


                <Stack.Screen
                    name="Review"
                    component={
                        ReviewScreen
                    }
                />


                <Stack.Screen
                    name="Access"
                    component={
                        AccessScreen
                    }
                />


                <Stack.Screen
                    name="Login"
                    component={
                        LoginScreen
                    }
                />


                <Stack.Screen
                    name="ForgotPassword"
                    component={
                        ForgotPasswordScreen
                    }
                />


                <Stack.Screen
                    name="VerifyCode"
                    component={
                        VerifyCodeScreen
                    }
                />


                <Stack.Screen
                    name="ResetPassword"
                    component={
                        ResetPasswordScreen
                    }
                />


                <Stack.Screen
                    name="Register"
                    component={
                        RegisterScreen
                    }
                />


                <Stack.Screen
                    name="Profile"
                    component={
                        ProfileScreen
                    }
                />


                <Stack.Screen
                    name="UsuariosAdmin"
                    component={
                        UsuariosAdminScreen
                    }
                />


                <Stack.Screen
                    name="CriarUsuarioAdmin"
                    component={
                        CriarUsuarioAdminScreen
                    }
                />


                <Stack.Screen
                    name="EditarUsuarioAdmin"
                    component={
                        EditarUsuarioAdminScreen
                    }
                />


                <Stack.Screen
                    name="UnidadesAdmin"
                    component={
                        UnidadesAdminScreen
                    }
                />


                <Stack.Screen
                    name="EditarUnidadeAdmin"
                    component={
                        EditarUnidadeAdminScreen
                    }
                />

            </Stack.Navigator>

        </NavigationContainer>
    );
}