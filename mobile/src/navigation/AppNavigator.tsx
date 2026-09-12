import { NavigationContainer,getPathFromState } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { ScreenLayout,Button,ErrorNotice } from "../components/ScreenLayout";
import { Text,Platform } from "react-native";
import { Avaliacao } from "../service/api";
import { Unidade } from "../types/Unidade";
import HomeScreen from "../screens/HomeScreen";
import UnitScreen from "../screens/UnitScreen";
import ReviewScreen from "../screens/ReviewScreen";
import AccessScreen from "../screens/AccessScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";
import VerifyCodeScreen from "../screens/VerifyCodeScreen";
import ResetPasswordScreen from "../screens/ResetPasswordScreen";
import UsuariosAdminScreen from "../screens/UsuariosAdminScreen";
import CriarUsuarioAdminScreen from "../screens/CriarUsuarioAdminScreen";
import EditarUsuarioAdminScreen from "../screens/EditarUsuarioAdminScreen";
import UnidadesAdminScreen from "../screens/UnidadesAdminScreen";
import CriarUnidadeAdminScreen from "../screens/CriarUnidadeAdminScreen";
import EditarUnidadeAdminScreen from "../screens/EditarUnidadeAdminScreen";
import SuporteScreen from "../screens/SuporteScreen";
import NovaSolicitacaoSuporteScreen from "../screens/NovaSolicitacaoSuporteScreen";
import DetalheSuporteScreen from "../screens/DetalheSuporteScreen";
import SuporteAdminScreen from "../screens/SuporteAdminScreen";
import DetalheSuporteAdminScreen from "../screens/DetalheSuporteAdminScreen";
import DispositivosAdminScreen from "../screens/DispositivosAdminScreen";
export type RootStackParamList={
    Home:undefined; Unit:{unidadeId:number};
    Review:{unidadeId?:number;avaliacaoId?:number;unidade?:Unidade;avaliacao?:Avaliacao};
    Access:undefined; Login:undefined; Register:undefined; Profile:undefined; ForgotPassword:undefined;
    VerifyCode:{email?:string}; ResetPassword:{email?:string;codigo?:string};
    UsuariosAdmin:undefined; CriarUsuarioAdmin:undefined; EditarUsuarioAdmin:{usuarioId:number};
    UnidadesAdmin:undefined; CriarUnidadeAdmin:undefined; EditarUnidadeAdmin:{unidadeId:number};
    Suporte:undefined; NovaSolicitacaoSuporte:undefined; DetalheSuporte:{id:number};
    SuporteAdmin:undefined; DetalheSuporteAdmin:{id:number}; DispositivosAdmin:{unidadeId:number};
};
const Stack=createNativeStackNavigator<RootStackParamList>();
const base=(process.env.EXPO_PUBLIC_BASE_PATH??"").replace(/\/$/,"");
// Recovery codes, snapshots and personal data must never become URL query parameters.
function publicState(state:any):any {
    return {...state,routes:state.routes.map((r:any)=>({...r,
        params:r.params?Object.fromEntries(Object.entries(r.params).filter(([key])=>["id","unidadeId","usuarioId","avaliacaoId"].includes(key))):undefined,
        state:r.state?publicState(r.state):undefined}))};
}
const linking={
    prefixes:[...(Platform.OS==="web"&&typeof window!=="undefined"?[window.location.origin+base]:[]),"hospeasy://"],
    config:{path:Platform.OS==="web"?base:undefined,initialRouteName:"Home" as const,screens:{
        Home:"",Unit:{path:"unidades/:unidadeId",parse:{unidadeId:Number}},
        Review:{path:"avaliar",parse:{unidadeId:Number,avaliacaoId:Number}},Access:"acesso",Login:"entrar",Register:"cadastro",Profile:"perfil",
        ForgotPassword:"recuperar",VerifyCode:"recuperar/codigo",ResetPassword:"recuperar/nova-senha",
        UsuariosAdmin:"admin/usuarios",CriarUsuarioAdmin:"admin/usuarios/novo",EditarUsuarioAdmin:{path:"admin/usuarios/:usuarioId",parse:{usuarioId:Number}},
        UnidadesAdmin:"admin/unidades",CriarUnidadeAdmin:"admin/unidades/nova",EditarUnidadeAdmin:{path:"admin/unidades/:unidadeId",parse:{unidadeId:Number}},
        Suporte:"suporte",NovaSolicitacaoSuporte:"suporte/nova",DetalheSuporte:{path:"suporte/:id",parse:{id:Number}},
        SuporteAdmin:"admin/suporte",DetalheSuporteAdmin:{path:"admin/suporte/:id",parse:{id:Number}},
        DispositivosAdmin:{path:"admin/unidades/:unidadeId/dispositivos",parse:{unidadeId:Number}}
    }},
    getPathFromState:(state:any,options:any)=>getPathFromState(publicState(state),options)
};
export default function AppNavigator(){
    const {usuario,carregandoSessao,erroSessao,revalidar,logout}=useAuth();
    if(carregandoSessao)return <ScreenLayout title="HospEasy"><Text>Validando sessão…</Text></ScreenLayout>;
    if(erroSessao)return <ScreenLayout title="Validar sessão"><ErrorNotice message={erroSessao}/>
        <Button title="Tentar novamente" onPress={()=>void revalidar()}/><Button title="Sair da conta" secondary onPress={()=>void logout()}/></ScreenLayout>;
    return <NavigationContainer key={`${usuario?.id??"anon"}:${usuario?.tipo??""}`} linking={linking} documentTitle={{formatter:()=>"HospEasy — Unidades de saúde"}}>
        <Stack.Navigator screenOptions={{headerShown:false}}>
            <Stack.Screen name="Home" component={HomeScreen}/><Stack.Screen name="Unit" component={UnitScreen}/>
            <Stack.Screen name="Review" component={ReviewScreen}/><Stack.Screen name="Access" component={AccessScreen}/>
            <Stack.Screen name="Login" component={LoginScreen}/><Stack.Screen name="Register" component={RegisterScreen}/>
            <Stack.Screen name="Profile" component={ProfileScreen}/><Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen}/>
            <Stack.Screen name="VerifyCode" component={VerifyCodeScreen}/><Stack.Screen name="ResetPassword" component={ResetPasswordScreen}/>
            <Stack.Screen name="UsuariosAdmin" component={UsuariosAdminScreen}/><Stack.Screen name="CriarUsuarioAdmin" component={CriarUsuarioAdminScreen}/>
            <Stack.Screen name="EditarUsuarioAdmin" component={EditarUsuarioAdminScreen}/><Stack.Screen name="UnidadesAdmin" component={UnidadesAdminScreen}/>
            <Stack.Screen name="CriarUnidadeAdmin" component={CriarUnidadeAdminScreen}/><Stack.Screen name="EditarUnidadeAdmin" component={EditarUnidadeAdminScreen}/>
            <Stack.Screen name="Suporte" component={SuporteScreen}/><Stack.Screen name="NovaSolicitacaoSuporte" component={NovaSolicitacaoSuporteScreen}/>
            <Stack.Screen name="DetalheSuporte" component={DetalheSuporteScreen}/><Stack.Screen name="SuporteAdmin" component={SuporteAdminScreen}/>
            <Stack.Screen name="DetalheSuporteAdmin" component={DetalheSuporteAdminScreen}/><Stack.Screen name="DispositivosAdmin" component={DispositivosAdminScreen}/>
        </Stack.Navigator>
    </NavigationContainer>;
}
