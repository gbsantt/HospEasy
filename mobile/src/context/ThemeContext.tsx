import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Appearance, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { colors as lightColors, darkColors } from "../theme/colors";

type Mode = "light" | "dark";
const KEY = "@hospeasy:theme";
const Context = createContext({ mode: "light" as Mode, colors: lightColors, setMode: async (_mode: Mode) => {} });
export function ThemeProvider({ children }: { children: ReactNode }) {
    const [mode, updateMode] = useState<Mode>("light");
    const [ready, setReady] = useState(false);
    const queue = useRef(Promise.resolve());
    useEffect(() => { let active=true; void AsyncStorage.getItem(KEY).then(value => {
        if(active && (value === "light" || value === "dark")) updateMode(value);
    }).catch(()=>{}).finally(()=>{if(active)setReady(true);}); return ()=>{active=false;}; }, []);
    const value = useMemo(() => ({ mode, colors: mode === "dark" ? darkColors : lightColors,
        setMode: async (next: Mode) => {
            const task=queue.current.catch(()=>{}).then(()=>AsyncStorage.setItem(KEY,next));
            queue.current=task;
            await task;
            updateMode(next);
        }
    }), [mode]);
    useEffect(() => {
        if(Platform.OS === "web") {
            document.documentElement.dataset.theme=mode;
            document.documentElement.style.colorScheme=mode;
            document.body.style.backgroundColor=value.colors.background;
            for(const key of ["surface","text","primaryLight","primaryDark"] as const)
                document.documentElement.style.setProperty(`--he-${key}`,value.colors[key]);
        } else Appearance.setColorScheme(mode);
    },[mode,value.colors]);
    if(!ready) return null;
    return <Context.Provider value={value}><StatusBar style={mode === "dark" ? "light" : "dark"}/>{children}</Context.Provider>;
}
export const useTheme = () => useContext(Context);
