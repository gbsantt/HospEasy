import { useCallback,useState } from "react";
import { Text,View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAuth } from "../context/AuthContext";
import { buscarSuporte,buscarSuporteAdmin,atualizarStatusSuporte } from "../service/api";
import { SolicitacaoSuporte,SuporteAdmin,StatusSuporte,statusSuporte } from "../types/Suporte";
import { ScreenLayout,Button,ErrorNotice,ui } from "../components/ScreenLayout";
export function SupportDetail({navigation,id,admin=false}:{navigation:any;id:number;admin?:boolean}) {
    const {usuario}=useAuth();const [data,setData]=useState<SolicitacaoSuporte>(),[owner,setOwner]=useState<SuporteAdmin>();
    const [error,setError]=useState(""),[busy,setBusy]=useState(false),[retry,setRetry]=useState(0);
    useFocusEffect(useCallback(()=>{
        if(!usuario || (admin&&usuario.tipo!=="ADMIN"))return;
        const c=new AbortController();setBusy(true);setError("");setData(undefined);
        const work=admin?buscarSuporteAdmin(id,usuario.token,c.signal).then(d=>{if(!c.signal.aborted){setOwner(d);setData(d.solicitacao);}}):
            buscarSuporte(id,usuario.token,c.signal).then(d=>{if(!c.signal.aborted)setData(d);});
        work.catch(e=>{if(!c.signal.aborted)setError(e.message);}).finally(()=>{if(!c.signal.aborted)setBusy(false);});
        return ()=>c.abort();
    },[id,usuario?.token,usuario?.tipo,admin,retry]));
    async function atualizar(status:StatusSuporte){if(!data||!usuario)return;setBusy(true);setError("");
        try{const d=await atualizarStatusSuporte(id,status,data.version,usuario.token);setData(d.solicitacao);}
        catch(e){setError(e instanceof Error?e.message:"Não foi possível atualizar.");}finally{setBusy(false);}}
    if(!usuario || (admin && usuario.tipo!=="ADMIN")) return <ScreenLayout title="Suporte" onBack={()=>navigation.goBack()}><Text>Acesso restrito à conta autorizada.</Text></ScreenLayout>;
    return <ScreenLayout title="Solicitação de suporte" onBack={()=>navigation.goBack()}>
        <ErrorNotice message={error}/>{error&&<Button title="Atualizar" onPress={()=>setRetry(x=>x+1)}/>}
        {!usuario&&<Button title="Entrar" onPress={()=>navigation.navigate("Login")}/>}
        {busy&&<Text style={ui.text}>Aguarde…</Text>}
        {data&&<View style={ui.card}><Text style={ui.title}>{data.assunto}</Text><Text style={ui.text}>{data.categoria.replaceAll("_"," ")} · {data.status.replaceAll("_"," ")}</Text>
            <Text selectable style={ui.text}>{data.descricao}</Text><Text style={ui.text}>Criada: {new Date(data.createdAt).toLocaleString("pt-BR")}</Text>
            <Text style={ui.text}>Atualizada: {new Date(data.updatedAt).toLocaleString("pt-BR")}</Text>
            {admin&&owner&&<Text style={ui.text}>Solicitante: {owner.usuarioNome} · {owner.usuarioEmail}</Text>}
            {admin&&<View style={ui.row}>{statusSuporte.map(s=><Button key={s} title={s.replaceAll("_"," ")} secondary={data.status!==s} disabled={busy||data.status===s} onPress={()=>void atualizar(s)}/>)}</View>}
        </View>}
    </ScreenLayout>;
}
export default function DetalheSuporteScreen({navigation,route}:NativeStackScreenProps<RootStackParamList,"DetalheSuporte">){return <SupportDetail navigation={navigation} id={route.params.id}/>;}
