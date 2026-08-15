import {
    NavigationContainer,
} from "@react-navigation/native";

import {
    createNativeStackNavigator,
} from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";
import UnitScreen from "../screens/UnitScreen";

import { Unidade } from "../types/Unidade";


export type RootStackParamList = {
    Home: undefined;

    Unit: {
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
                    headerShown: false,
                }}
            >
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                />

                <Stack.Screen
                    name="Unit"
                    component={UnitScreen}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}