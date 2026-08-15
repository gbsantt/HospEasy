import {
  useEffect,
  useState,
} from "react";

import {
  GestureHandlerRootView,
} from "react-native-gesture-handler";

import SplashScreen from "./src/screens/SplashScreen";
import AppNavigator from "./src/navigation/AppNavigator";


export default function App() {
  const [
    carregando,
    setCarregando,
  ] = useState(true);


  useEffect(() => {
    const timer =
        setTimeout(() => {
          setCarregando(false);
        }, 2000);

    return () =>
        clearTimeout(timer);
  }, []);


  return (
      <GestureHandlerRootView
          style={{ flex: 1 }}
      >
        {carregando ? (
            <SplashScreen />
        ) : (
            <AppNavigator />
        )}
      </GestureHandlerRootView>
  );
}