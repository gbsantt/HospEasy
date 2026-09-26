import { AppState, Platform } from "react-native";
export function appIsActive() {
    return Platform.OS==="web" ? document.visibilityState!=="hidden" : AppState.currentState==="active";
}
