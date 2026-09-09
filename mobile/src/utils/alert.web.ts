import type { AlertButton, AlertOptions } from "react-native";

// Mantém as confirmações e callbacks das telas compartilhadas no navegador.
export const Alert = {
    alert(title: string, message?: string, buttons?: AlertButton[], _options?: AlertOptions) {
        const text = [title, message].filter(Boolean).join("\n\n");
        const actions = buttons ?? [];
        if (actions.length <= 1) {
            window.alert(text);
            actions[0]?.onPress?.();
            return;
        }
        const cancel = actions.find((button) => button.style === "cancel");
        const confirm = actions.find((button) => button.style !== "cancel");
        if (window.confirm(text)) confirm?.onPress?.();
        else cancel?.onPress?.();
    },
};
