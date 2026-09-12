import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import UnidadeAdminForm from "../components/UnidadeAdminForm";
export default function CriarUnidadeAdminScreen({navigation}:NativeStackScreenProps<RootStackParamList,"CriarUnidadeAdmin">){return <UnidadeAdminForm navigation={navigation}/>;}
