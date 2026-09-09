import { View } from "react-native";
import { colors } from "../theme/colors";

export default function BackChevron() {
    return <View aria-hidden style={{ width: 10, height: 10, borderLeftWidth: 2,
        borderBottomWidth: 2, borderColor: colors.primaryDark,
        transform: [{ translateX: 2 }, { rotate: "45deg" }] }} />;
}
