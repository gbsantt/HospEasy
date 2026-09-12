import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { SupportList } from "./SuporteScreen";
export default function SuporteAdminScreen({navigation}:NativeStackScreenProps<RootStackParamList,"SuporteAdmin">){return <SupportList navigation={navigation} admin/>;}
