import { useCallback,useState } from "react";
import { Text,View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAuth } from "../context/AuthContext";
import { listarSuporte } from "../service/api";
import { categorias,statusSuporte,CategoriaSuporte,StatusSuporte,Pagina,ResumoSuporte } from "../types/Suporte";
import { ScreenLayout,Button,ErrorNotice,ui } from "../components/ScreenLayout";
export function SupportList({navigation,admin=false}:{navigation:any;admin?:boolean}) {
    const {usuario}=useAuth();
    const [page,setPage]=useState(0),[status,setStatus]=useState<StatusSuporte>(),[categoria,setCategoria]=useState<CategoriaSuporte>();
    const [data,setData]=useState<Pagina<ResumoSuporte>>(),[error,setError]=useState(""),[busy,setBusy]=useState(false),[retry,setRetry]=useState(0);
    useFocusEffect(useCallback(()=>{
        if(!usuario || (admin&&usuario.tipo!=="ADMIN"))return;
        const controller=new AbortController();setBusy(true);setError("");
        listarSuporte(usuario.token,admin,page,status,categoria,controller.signal).then(d=>{if(!controller.signal.aborted)setData(d);})
            .catch(e=>{if(!controller.signal.aborted)setError(e.message);}).finally(()=>{if(!controller.signal.aborted)setBusy(false);});
        return ()=>controller.abort();
    },[usuario?.token,usuario?.tipo,admin,page,status,categoria,retry]));
    if(!usuario || (admin&&usuario.tipo!=="ADMIN"))return <ScreenLayout title="Suporte" onBack={()=>navigation.goBack()}><Text style={ui.text}>Entre com uma conta autorizada.</Text><Button title="Entrar" onPress={()=>navigation.navigate("Login")}/></ScreenLayout>;
    return <ScreenLayout title={admin?"Gerenciar suporte":"Minhas solicitações"} onBack={()=>navigation.goBack()}>
        {!admin&&<Button title="Nova solicitação" onPress={()=>navigation.navigate("NovaSolicitacaoSuporte")}/>}
        <Text style={ui.label}>Status</Text><View style={ui.row}><Button title="Todos" secondary={!status} onPress={()=>{setStatus(undefined);setPage(0);}}/>
            {statusSuporte.map(s=><Button key={s} title={s.replaceAll("_"," ")} secondary={status!==s} onPress={()=>{setStatus(s);setPage(0);}}/>)}</View>
        <Text style={ui.label}>Categoria</Text><View style={ui.row}><Button title="Todas" secondary={!categoria} onPress={()=>{setCategoria(undefined);setPage(0);}}/>
            {categorias.map(c=><Button key={c} title={c.replaceAll("_"," ")} secondary={categoria!==c} onPress={()=>{setCategoria(c);setPage(0);}}/>)}</View>
        <ErrorNotice message={error}/>{error&&<Button title="Tentar novamente" onPress={()=>setRetry(x=>x+1)}/>}
        {busy?<Text style={ui.text}>Carregando…</Text>:data?.content.length?data.content.map(s=><View key={s.id} style={ui.card}>
            <Text style={ui.label}>{s.assunto}</Text><Text style={ui.text}>{s.categoria.replaceAll("_"," ")} · {s.status.replaceAll("_"," ")}</Text>
            <Text style={ui.text}>{new Date(s.createdAt).toLocaleString("pt-BR")}</Text>
            <Button title="Ver solicitação" secondary onPress={()=>navigation.navigate(admin?"DetalheSuporteAdmin":"DetalheSuporte",{id:s.id})}/>
        </View>):!error&&<Text style={ui.text}>Nenhuma solicitação encontrada.</Text>}
        <View style={ui.row}><Button title="Anterior" disabled={page===0||busy} onPress={()=>setPage(p=>p-1)}/>
            <Text style={ui.text}>Página {page+1} de {Math.max(1,data?.totalPages??1)}</Text>
            <Button title="Próxima" disabled={busy||page+1>=(data?.totalPages??1)} onPress={()=>setPage(p=>p+1)}/></View>
    </ScreenLayout>;
}
export default function SuporteScreen({navigation}:NativeStackScreenProps<RootStackParamList,"Suporte">){return <SupportList navigation={navigation}/>;}
