import {
    GestureHandlerRootView,
} from "react-native-gesture-handler";

import AppNavigator from "./src/navigation/AppNavigator";
import { ThemeProvider } from "./src/context/ThemeContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

import {
    FavoritesProvider,
} from "./src/context/FavoritesContext";

import {
    AuthProvider,
} from "./src/context/AuthContext";


export default function App() {

    return (

        <GestureHandlerRootView
            style={{
                flex: 1,
            }}
        >

            <SafeAreaProvider>
            <ThemeProvider>
            <AuthProvider>

                <FavoritesProvider>

                    <AppNavigator />

                </FavoritesProvider>

            </AuthProvider>
            </ThemeProvider>
            </SafeAreaProvider>

        </GestureHandlerRootView>

    );
}
