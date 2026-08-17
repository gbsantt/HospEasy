import {
    NavigationContainer,
} from "@react-navigation/native";

import {
    createNativeStackNavigator,
} from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";
import UnitScreen from "../screens/UnitScreen";
import ReviewScreen from "../screens/ReviewScreen";
import AccessScreen from "../screens/AccessScreen";
import LoginScreen from "../screens/LoginScreen";
import ProfileScreen from "../screens/ProfileScreen";

import {
    Unidade,
} from "../types/Unidade";


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

    Profile:
        undefined;
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
                    name="Profile"
                    component={
                        ProfileScreen
                    }
                />

            </Stack.Navigator>

        </NavigationContainer>

    );
}