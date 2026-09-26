export const colors = {
    // Identidade HospEasy
    primary: "#438F0B",
    primaryDark: "#2F6807",
    primaryLight: "#E6F1DE",

    // Glass effect
    glassLight: "rgba(255, 255, 255, 0.72)",
    glassGreen: "rgba(67, 143, 11, 0.76)",
    glassBorder: "rgba(255, 255, 255, 0.38)",

    // Estrutura
    background: "#F5F7F4",
    surface: "#FFFFFF",

    text: "#171717",
    textSecondary: "#727272",

    border: "#E4E7E2",

    // Status
    success: "#438F0B",
    warning: "#F2BE4B",
    danger: "#E74C5B",

    offline: "#7A7A7A",

    disabled: "#CFCFCF",
};

export type Palette = typeof colors;
export const darkColors: Palette = {
    ...colors,
    primary: "#438F0B",
    primaryDark: "#A0DC77",
    primaryLight: "#263E20",
    glassLight: "rgba(25, 34, 26, 0.94)",
    glassBorder: "rgba(160, 180, 155, 0.25)",
    background: "#101710",
    surface: "#1C261D",
    text: "#F0F4EE",
    textSecondary: "#B0BCAF",
    border: "#3C4B3B",
    success: "#8DCE60",
    danger: "#FF7E8A",
    offline: "#B0B0B0",
    disabled: "#596454",
};
