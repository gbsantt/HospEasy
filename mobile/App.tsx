import {
    GestureHandlerRootView,
} from "react-native-gesture-handler";

import AppNavigator from "./src/navigation/AppNavigator";

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

            <AuthProvider>

                <FavoritesProvider>

                    <AppNavigator />

                </FavoritesProvider>

            </AuthProvider>

        </GestureHandlerRootView>

    );
}