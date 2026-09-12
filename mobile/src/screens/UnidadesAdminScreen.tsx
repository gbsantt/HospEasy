import { useCallback,useState } from "react";
import { Text,View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { ScreenLayout,Field,Button,ErrorNotice,ui } from "../components/ScreenLayout";
import { useAuth } from "../context/AuthContext";
import { listarUnidadesAdmin,excluirUnidadeAdmin } from "../service/api";
import { Unidade } from "../types/Unidade";
import { Alert } from "../utils/alert";
export default function UnidadesAdminScreen({navigation}:NativeStackScreenProps<RootStackParamList,"UnidadesAdmin">){
    const {usuario}=useAuth();const [items,setItems]=useState<Unidade[]>([]),[error,setError]=useState(""),[busy,setBusy]=useState(false),[busca,setBusca]=useState(""),[retry,setRetry]=useState(0);
    useFocusEffect(useCallback(()=>{if(!usuario||usuario.tipo!=="ADMIN")return;const c=new AbortController();setBusy(true);setError("");
        listarUnidadesAdmin(usuario.token,c.signal).then(d=>{if(!c.signal.aborted)setItems(d);}).catch(e=>{if(!c.signal.aborted)setError(e.message);}).finally(()=>{if(!c.signal.aborted)setBusy(false);});
        return ()=>c.abort();},[usuario?.token,usuario?.tipo,retry]));
    async function excluir(id:number){if(!usuario)return;setBusy(true);try{await excluirUnidadeAdmin(id,usuario.token);setRetry(x=>x+1);}catch(e){setError(e instanceof Error?e.message:"Não foi possível excluir.");}finally{setBusy(false);}}
    return <ScreenLayout title="Administrar unidades" onBack={()=>navigation.goBack()}>
        {!usuario||usuario.tipo!=="ADMIN"?<Text style={ui.text}>Acesso exclusivo de administradores.</Text>:<>
        <Button title="Nova unidade" onPress={()=>navigation.navigate("CriarUnidadeAdmin")}/>
        <Field label="Buscar unidade por nome ou endereço" value={busca} onChangeText={setBusca}/>
        <ErrorNotice message={error}/><Button title="Atualizar lista" secondary disabled={busy} onPress={()=>setRetry(x=>x+1)}/>
        <Text style={ui.text}>{busy?"Carregando…":`${items.length} unidades cadastradas`}</Text>
        {items.filter(u=>`${u.nome} ${u.endereco}`.toLowerCase().includes(busca.toLowerCase())).map(u=><View key={u.unidadeId} style={ui.card}>
            <Text style={ui.label}>{u.nome}</Text><Text style={ui.text}>{u.tipo.replaceAll("_"," ")} · {u.endereco}</Text>
            <Text style={ui.text}>Telefone: {u.telefone||"Não informado"} · Capacidade: {u.capacidadeAreaMonitorada}</Text>
            <Text style={ui.text}>Câmera: {u.statusCamera.replaceAll("_"," ")} · Medição: {u.statusMedicao.replaceAll("_"," ")}</Text>
            <View style={ui.row}><Button title="Editar" onPress={()=>navigation.navigate("EditarUnidadeAdmin",{unidadeId:u.unidadeId})}/>
                <Button title="Dispositivos" secondary onPress={()=>navigation.navigate("DispositivosAdmin",{unidadeId:u.unidadeId})}/>
                <Button title="Excluir" secondary disabled={busy} onPress={()=>Alert.alert("Excluir unidade",`Excluir "${u.nome}" e seus históricos, avaliações e favoritos? Esta ação não pode ser desfeita.`,[{text:"Cancelar",style:"cancel"},{text:"Excluir",style:"destructive",onPress:()=>void excluir(u.unidadeId)}])}/></View>
        </View>)}</>}
    </ScreenLayout>;
}
