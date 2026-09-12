import { useCallback,useState } from "react";
import { Text,View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { ScreenLayout,Button,ErrorNotice,ui } from "../components/ScreenLayout";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../context/FavoritesContext";
import { Avaliacao,buscarMinhasAvaliacoes,excluirAvaliacao } from "../service/api";
import { Alert } from "../utils/alert";
export default function ProfileScreen({navigation}:NativeStackScreenProps<RootStackParamList,"Profile">){
    const {usuario,logout}=useAuth();const {favoritos,desfavoritar,erroFavoritos}=useFavorites();
    const [reviews,setReviews]=useState<Avaliacao[]>([]),[error,setError]=useState(""),[busy,setBusy]=useState(false),[retry,setRetry]=useState(0);
    useFocusEffect(useCallback(()=>{if(!usuario)return;const c=new AbortController();setBusy(true);setError("");setReviews([]);
        buscarMinhasAvaliacoes(usuario.token,c.signal).then(d=>{if(!c.signal.aborted)setReviews(d);}).catch(e=>{if(!c.signal.aborted)setError(e.message);}).finally(()=>{if(!c.signal.aborted)setBusy(false);});
        return ()=>c.abort();},[usuario?.token,retry]));
    async function remove(id:number){if(!usuario)return;try{await excluirAvaliacao(id,usuario.token);setRetry(x=>x+1);}
        catch(e){setError(e instanceof Error?e.message:"Não foi possível excluir.");}}
    return <ScreenLayout title="Meu perfil" onBack={()=>navigation.goBack()}>
        {!usuario?<Button title="Entrar na conta" onPress={()=>navigation.navigate("Login")}/>:<>
        <View style={ui.card}><Text style={ui.title}>{usuario.nome}</Text><Text style={ui.text}>{usuario.email}</Text><Text style={ui.text}>{usuario.tipo==="ADMIN"?"Administrador":"Usuário"}</Text></View>
        <Button title="Minhas solicitações de suporte" onPress={()=>navigation.navigate("Suporte")}/>
        {usuario.tipo==="ADMIN"&&<View style={ui.card}><Text style={ui.label}>Painel administrativo</Text>
            <Button title="Gerenciar usuários" onPress={()=>navigation.navigate("UsuariosAdmin")}/>
            <Button title="Gerenciar unidades e dispositivos" onPress={()=>navigation.navigate("UnidadesAdmin")}/>
            <Button title="Gerenciar suporte" onPress={()=>navigation.navigate("SuporteAdmin")}/></View>}
        <Text style={ui.title}>Favoritos ({favoritos.length})</Text><ErrorNotice message={erroFavoritos}/>
        {favoritos.map(u=><View key={u.unidadeId} style={ui.card}><Text style={ui.label}>{u.nome}</Text>
            <View style={ui.row}><Button title="Ver unidade" onPress={()=>navigation.navigate("Unit",{unidadeId:u.unidadeId})}/>
                <Button title="Remover favorito" secondary onPress={()=>void desfavoritar(u.unidadeId)}/></View></View>)}
        {!favoritos.length&&<Text style={ui.text}>Você ainda não tem favoritos.</Text>}
        <Text style={ui.title}>Minhas avaliações ({reviews.length})</Text><ErrorNotice message={error}/>
        {error&&<Button title="Tentar novamente" onPress={()=>setRetry(x=>x+1)}/>}
        {busy?<Text style={ui.text}>Carregando…</Text>:reviews.map(a=><View key={a.id} style={ui.card}>
            <Text style={ui.label}>{a.unidadeNome} · {a.nota} / 5</Text><Text style={ui.text}>{a.comentario||"Sem comentário"}</Text>
            <Text style={ui.text}>{new Date(a.criadoEm).toLocaleDateString("pt-BR")}</Text><View style={ui.row}>
                <Button title="Editar avaliação" onPress={()=>navigation.navigate("Review",{avaliacaoId:a.id})}/>
                <Button title="Excluir avaliação" secondary onPress={()=>Alert.alert("Excluir avaliação","Esta ação não pode ser desfeita.",[{text:"Cancelar",style:"cancel"},{text:"Excluir",style:"destructive",onPress:()=>void remove(a.id)}])}/></View>
        </View>)}
        {!busy&&!error&&!reviews.length&&<Text style={ui.text}>Você ainda não enviou avaliações.</Text>}
        <Button title="Sair da conta" secondary onPress={()=>Alert.alert("Sair","Deseja encerrar esta sessão?",[{text:"Cancelar",style:"cancel"},{text:"Sair",onPress:()=>{void logout().then(()=>navigation.reset({index:0,routes:[{name:"Home"}]})).catch(()=>setError("Não foi possível remover a sessão salva. Tente sair novamente."));}}])}/>
        </>}
    </ScreenLayout>;
}
