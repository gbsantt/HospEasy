import { useEffect,useState } from "react";
import { Text,View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { ScreenLayout,Field,Button,ErrorNotice,ui } from "../components/ScreenLayout";
import { useAuth } from "../context/AuthContext";
import { buscarUsuarioAdmin,atualizarUsuarioAdmin,UsuarioAdmin,TipoUsuario } from "../service/api";
export default function EditarUsuarioAdminScreen({navigation,route}:NativeStackScreenProps<RootStackParamList,"EditarUsuarioAdmin">){
    const {usuario,revalidar}=useAuth();const [data,setData]=useState<UsuarioAdmin>(),[error,setError]=useState(""),[busy,setBusy]=useState(false),[retry,setRetry]=useState(0);
    useEffect(()=>{if(!usuario||usuario.tipo!=="ADMIN")return;const c=new AbortController();setError("");
        buscarUsuarioAdmin(route.params.usuarioId,usuario.token,c.signal).then(d=>{if(!c.signal.aborted)setData(d);}).catch(e=>{if(!c.signal.aborted)setError(e.message);});return ()=>c.abort();
    },[route.params.usuarioId,usuario?.token,usuario?.tipo,retry]);
    async function save(){if(!data||!usuario)return;setBusy(true);setError("");
        try{await atualizarUsuarioAdmin(data.id,{nome:data.nome.trim(),email:data.email.trim(),tipo:data.tipo,ativo:data.ativo},usuario.token);await revalidar();navigation.goBack();}
        catch(e){setError(e instanceof Error?e.message:"Não foi possível salvar.");}finally{setBusy(false);}}
    const self=data?.id===usuario?.id;
    return <ScreenLayout title="Editar usuário" onBack={()=>navigation.goBack()}>
        {!usuario||usuario.tipo!=="ADMIN"?<Text style={ui.text}>Acesso exclusivo de administradores.</Text>:<>
        <ErrorNotice message={error}/>{error&&<Button title="Recarregar" secondary onPress={()=>setRetry(x=>x+1)}/>}
        {data?<><Field label="Nome" value={data.nome} onChangeText={nome=>setData({...data,nome})} maxLength={120}/>
            <Field label="E-mail" value={data.email} onChangeText={email=>setData({...data,email})} maxLength={180} keyboardType="email-address" autoCapitalize="none"/>
            {self?<Text style={ui.text}>Sua própria conta deve permanecer ativa e administradora.</Text>:<>
            <View style={ui.row}>{(["USUARIO","ADMIN"] as TipoUsuario[]).map(tipo=><Button key={tipo} title={tipo} secondary={data.tipo!==tipo} onPress={()=>setData({...data,tipo})}/>)}</View>
            <Button title={data.ativo?"Conta ativa — desativar":"Conta inativa — ativar"} secondary onPress={()=>setData({...data,ativo:!data.ativo})}/></>}
            <Button title="Salvar alterações" busy={busy} onPress={()=>void save()}/></>:!error&&<Text style={ui.text}>Carregando…</Text>}
        </>}
    </ScreenLayout>;
}
