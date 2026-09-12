import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { SupportDetail } from "./DetalheSuporteScreen";
export default function DetalheSuporteAdminScreen({navigation,route}:NativeStackScreenProps<RootStackParamList,"DetalheSuporteAdmin">){return <SupportDetail navigation={navigation} id={route.params.id} admin/>;}
