import { useCallback,useEffect,useState } from "react";
import { Text,View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Clipboard from "expo-clipboard";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAuth } from "../context/AuthContext";
import { listarDispositivos,criarDispositivo,atualizarDispositivo,revogarDispositivo,regenerarDispositivo } from "../service/api";
import { Dispositivo } from "../types/Suporte";
import { ScreenLayout,Field,Button,ErrorNotice,ui } from "../components/ScreenLayout";
import { Alert } from "../utils/alert";
export default function DispositivosAdminScreen({navigation,route}:NativeStackScreenProps<RootStackParamList,"DispositivosAdmin">){
    const {usuario}=useAuth();const id=route.params.unidadeId;
    const [items,setItems]=useState<Dispositivo[]>([]),[nome,setNome]=useState(""),[key,setKey]=useState("");
    const [error,setError]=useState(""),[busy,setBusy]=useState(false),[retry,setRetry]=useState(0);
    useFocusEffect(useCallback(()=>{
        if(!usuario||usuario.tipo!=="ADMIN")return;
        const c=new AbortController();setBusy(true);
        listarDispositivos(id,usuario.token,c.signal).then(d=>{if(!c.signal.aborted)setItems(d);})
            .catch(e=>{if(!c.signal.aborted)setError(e.message);}).finally(()=>{if(!c.signal.aborted)setBusy(false);});
        return ()=>c.abort();
    },[id,usuario?.token,usuario?.tipo,retry]));
    useFocusEffect(useCallback(()=>()=>setKey(""),[]));
    async function action(work:()=>Promise<unknown>){setBusy(true);setError("");try{await work();setRetry(x=>x+1);}
        catch(e){setError(e instanceof Error?e.message:"Não foi possível concluir.");}finally{setBusy(false);}}
    function confirm(title:string,message:string,work:()=>Promise<unknown>){Alert.alert(title,message,[{text:"Cancelar",style:"cancel"},{text:"Confirmar",onPress:()=>void action(work)}]);}
    if(!usuario||usuario.tipo!=="ADMIN")return <ScreenLayout title="Dispositivos" onBack={()=>navigation.goBack()}><Text style={ui.text}>Acesso exclusivo de administradores.</Text></ScreenLayout>;
    return <ScreenLayout title="Dispositivos da unidade" onBack={()=>navigation.goBack()}>
        <Text style={ui.text}>Somente uma câmera pode estar ativa. Desative a atual antes de ativar outra.</Text>
        <ErrorNotice message={error}/>{error&&<Button title="Atualizar lista" onPress={()=>setRetry(x=>x+1)}/>}
        {key&&<View style={ui.card}><Text style={ui.label}>Copie agora. Esta chave não será exibida novamente.</Text>
            <Text selectable style={ui.text}>{key}</Text><Button title="Copiar chave" onPress={()=>{void Clipboard.setStringAsync(key).then(()=>Alert.alert("Chave copiada")).catch(()=>setError("Não foi possível copiar. Selecione a chave manualmente."));}}/>
            <Button title="Já configurei; ocultar chave" secondary onPress={()=>setKey("")}/></View>}
        <Field label="Nome do novo dispositivo" value={nome} onChangeText={setNome} maxLength={100}/>
        <Button title="Cadastrar dispositivo inativo" busy={busy} disabled={!nome.trim()} onPress={()=>void action(async()=>{
            const result=await criarDispositivo(id,nome.trim(),false,usuario.token);setKey(result.cameraKey);setNome("");
        })}/>
        {items.map(d=><DeviceCard key={d.id} device={d} busy={busy}
            onSave={(name)=>void action(()=>atualizarDispositivo(d.id,name,d.ativo,d.version,usuario.token))}
            onToggle={()=>confirm(d.ativo?"Desativar dispositivo":"Ativar dispositivo","A alteração afeta o envio de medições.",()=>atualizarDispositivo(d.id,d.nome,!d.ativo,d.version,usuario.token))}
            onRevoke={()=>confirm("Revogar chave","A chave atual deixará de funcionar e o dispositivo será desativado.",()=>revogarDispositivo(d.id,usuario.token))}
            onRotate={()=>confirm("Regenerar chave","A chave anterior deixará de funcionar. Configure a nova chave no dispositivo.",async()=>{const r=await regenerarDispositivo(d.id,usuario.token);setKey(r.cameraKey);})}/>)}
        {!busy&&!items.length&&<Text style={ui.text}>Nenhum dispositivo cadastrado.</Text>}
    </ScreenLayout>;
}
function DeviceCard({device:d,busy,onSave,onToggle,onRevoke,onRotate}:{device:Dispositivo;busy:boolean;onSave:(name:string)=>void;onToggle:()=>void;onRevoke:()=>void;onRotate:()=>void}){
    const [name,setName]=useState(d.nome);
    useEffect(()=>setName(d.nome),[d.nome]);
    return <View style={ui.card}><Field label="Nome do dispositivo" value={name} onChangeText={setName} maxLength={100}/>
        <Text style={ui.text}>Estado: {d.status} · {d.chaveRevogada?"Chave revogada":"Chave vigente"}</Text>
        <Text style={ui.text}>Última comunicação: {d.ultimaComunicacao?new Date(d.ultimaComunicacao).toLocaleString("pt-BR"):"Nenhuma"}</Text>
        <View style={ui.row}><Button title="Salvar nome" disabled={busy||!name.trim()||name.trim()===d.nome} onPress={()=>onSave(name.trim())}/>
            <Button title={d.ativo?"Desativar":"Ativar"} disabled={busy||(!d.ativo&&d.chaveRevogada)} onPress={onToggle}/>
            <Button title="Regenerar chave" disabled={busy} secondary onPress={onRotate}/>
            <Button title="Revogar chave" disabled={busy||d.chaveRevogada} secondary onPress={onRevoke}/></View>
    </View>;
}
