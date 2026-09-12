import {Text,View} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "../navigation/AppNavigator";
import {ScreenLayout,Button,ui} from "../components/ScreenLayout";
export default function AccessScreen({navigation}:NativeStackScreenProps<RootStackParamList,"Access">){
 return <ScreenLayout title="HospEasy" onBack={()=>navigation.goBack()}><View style={ui.card}>
 <Text style={ui.title}>Bem-vindo</Text><Text style={ui.text}>Entre na sua conta ou crie uma para acessar seu perfil e recursos personalizados.</Text>
 <Button title="Entrar" onPress={()=>navigation.navigate("Login")}/><Button title="Criar conta" secondary onPress={()=>navigation.navigate("Register")}/>
 <Text style={ui.text}>Crie sua conta gratuitamente para personalizar sua experiência.</Text></View></ScreenLayout>;
}
