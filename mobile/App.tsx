import {
    GestureHandlerRootView,
} from "react-native-gesture-handler";

import AppNavigator from "./src/navigation/AppNavigator";
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
            <AuthProvider>

                <FavoritesProvider>

                    <AppNavigator />

                </FavoritesProvider>

            </AuthProvider>
            </SafeAreaProvider>

        </GestureHandlerRootView>

    );
}
