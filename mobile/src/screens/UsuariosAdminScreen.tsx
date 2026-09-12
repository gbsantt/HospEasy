import { useCallback,useState } from "react";
import { Text,View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { ScreenLayout,Field,Button,ErrorNotice,ui } from "../components/ScreenLayout";
import { useAuth } from "../context/AuthContext";
import { listarUsuariosAdmin,UsuarioAdmin } from "../service/api";
export default function UsuariosAdminScreen({navigation}:NativeStackScreenProps<RootStackParamList,"UsuariosAdmin">){
    const {usuario}=useAuth();const [items,setItems]=useState<UsuarioAdmin[]>([]),[error,setError]=useState(""),[busy,setBusy]=useState(false),[retry,setRetry]=useState(0),[search,setSearch]=useState("");
    useFocusEffect(useCallback(()=>{if(!usuario||usuario.tipo!=="ADMIN")return;let active=true;setBusy(true);setError("");
        listarUsuariosAdmin(usuario.token).then(d=>{if(active)setItems(d);}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setBusy(false);});return ()=>{active=false;};
    },[usuario?.token,usuario?.tipo,retry]));
    return <ScreenLayout title="Administrar usuários" onBack={()=>navigation.goBack()}>
        {!usuario||usuario.tipo!=="ADMIN"?<Text style={ui.text}>Acesso exclusivo de administradores.</Text>:<>
        <Button title="Novo usuário" onPress={()=>navigation.navigate("CriarUsuarioAdmin")}/><Field label="Buscar usuário" value={search} onChangeText={setSearch}/>
        <ErrorNotice message={error}/>{error&&<Button title="Tentar novamente" onPress={()=>setRetry(x=>x+1)}/>}
        {busy?<Text style={ui.text}>Carregando…</Text>:items.filter(u=>`${u.nome} ${u.email}`.toLowerCase().includes(search.toLowerCase())).map(u=><View key={u.id} style={ui.card}>
            <Text style={ui.label}>{u.nome}{u.id===usuario.id?" (Você)":""}</Text><Text style={ui.text}>{u.email}</Text>
            <Text style={ui.text}>{u.tipo} · {u.ativo?"Ativo":"Inativo"}</Text><Button title="Editar usuário" onPress={()=>navigation.navigate("EditarUsuarioAdmin",{usuarioId:u.id})}/>
        </View>)}</>}
    </ScreenLayout>;
}
