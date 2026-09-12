import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import UnidadeAdminForm from "../components/UnidadeAdminForm";
export default function EditarUnidadeAdminScreen({navigation,route}:NativeStackScreenProps<RootStackParamList,"EditarUnidadeAdmin">){return <UnidadeAdminForm navigation={navigation} unidadeId={route.params.unidadeId}/>;}
