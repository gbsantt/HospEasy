import { useEffect,useState } from "react";
import { Linking,Text,View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useAuth } from "../context/AuthContext";
import { atualizarUnidadeAdmin,buscarUnidadePorId,criarUnidadeAdmin } from "../service/api";
import { TipoUnidade } from "../types/Unidade";
import { ScreenLayout,Field,Button,ErrorNotice,ui } from "./ScreenLayout";
import { Alert } from "../utils/alert";
export default function UnidadeAdminForm({navigation,unidadeId}:{navigation:any;unidadeId?:number}){
    const {usuario}=useAuth();const [nome,setNome]=useState(""),[endereco,setEndereco]=useState(""),[telefone,setTelefone]=useState("");
    const [capacidade,setCapacidade]=useState(""),[tipo,setTipo]=useState<TipoUnidade>("UPA"),[nomeCamera,setNomeCamera]=useState("");
    const [lat,setLat]=useState(""),[lon,setLon]=useState(""),[manual,setManual]=useState(false),[confirmed,setConfirmed]=useState(false);
    const [loaded,setLoaded]=useState(!unidadeId);
    const [busy,setBusy]=useState(false),[loading,setLoading]=useState(!!unidadeId),[error,setError]=useState(""),[key,setKey]=useState(""),[done,setDone]=useState(false),[retry,setRetry]=useState(0);
    useEffect(()=>{
        if(!unidadeId||!usuario||usuario.tipo!=="ADMIN")return;
        const c=new AbortController();setLoading(true);setError("");
        buscarUnidadePorId(unidadeId,c.signal).then(u=>{if(!c.signal.aborted){
            setLoaded(true);setNome(u.nome);setEndereco(u.endereco);setTelefone(u.telefone??"");setCapacidade(String(u.capacidadeAreaMonitorada));setTipo(u.tipo);
            setLat(u.latitude===null?"":String(u.latitude));setLon(u.longitude===null?"":String(u.longitude));
        }}).catch(e=>{if(!c.signal.aborted)setError(e.message);}).finally(()=>{if(!c.signal.aborted)setLoading(false);});
        return ()=>c.abort();
    },[unidadeId,usuario?.token,usuario?.tipo,retry]);
    async function save(){
        if(!usuario||usuario.tipo!=="ADMIN"||!loaded)return;
        const cap=Number(capacidade),latitude=Number(lat.replace(",",".")),longitude=Number(lon.replace(",","."));
        if(!nome.trim()||!endereco.trim()||!Number.isInteger(cap)||cap<1){setError("Preencha nome, endereço e capacidade inteira maior que zero.");return;}
        if(manual&&(!lat.trim()||!lon.trim()||!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180||!confirmed)){
            setError("Informe coordenadas válidas e confirme a posição da unidade.");return;
        }
        setBusy(true);setError("");
        const data={nome:nome.trim(),endereco:endereco.trim(),telefone:telefone.trim()||null,capacidadeAreaMonitorada:cap,tipo,...(manual?{latitude,longitude}:{})};
        try{
            if(unidadeId){await atualizarUnidadeAdmin(unidadeId,data,usuario.token);navigation.goBack();}
            else{const result=await criarUnidadeAdmin({...data,nomeCamera:nomeCamera.trim()||undefined},usuario.token);
                setDone(true);setKey(result.chaveApi??"");if(!result.chaveApi)navigation.goBack();}
        }catch(e){setError(e instanceof Error?e.message:"Não foi possível salvar.");}finally{setBusy(false);}
    }
    if(!usuario||usuario.tipo!=="ADMIN")return <ScreenLayout title="Unidade" onBack={()=>navigation.goBack()}><Text style={ui.text}>Acesso exclusivo de administradores.</Text></ScreenLayout>;
    return <ScreenLayout title={unidadeId?"Editar unidade":"Nova unidade"} onBack={()=>navigation.goBack()}>
        <ErrorNotice message={error}/>
        {loading?<Text style={ui.text}>Carregando…</Text>:done?<View style={ui.card}>
            <Text style={ui.label}>Unidade cadastrada. Copie a chave agora; ela não será recuperável.</Text><Text selectable style={ui.text}>{key}</Text>
            <Button title="Copiar chave" onPress={()=>{void Clipboard.setStringAsync(key).then(()=>Alert.alert("Chave copiada")).catch(()=>setError("Não foi possível copiar. Selecione a chave manualmente."));}}/>
            <Button title="Concluir" onPress={()=>{setKey("");navigation.goBack();}}/>
        </View>:<>
            <Field label="Nome da unidade" value={nome} onChangeText={setNome} maxLength={150}/>
            <Field label="Endereço completo" value={endereco} onChangeText={v=>{setEndereco(v);setConfirmed(false);}} maxLength={255} multiline/>
            <Field label="Telefone" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" maxLength={20}/>
            <Field label="Capacidade da área monitorada" value={capacidade} onChangeText={setCapacidade} keyboardType="number-pad" maxLength={9}/>
            <Text style={ui.label}>Tipo</Text><View style={ui.row}>{(["UPA","PRONTO_ATENDIMENTO","PRONTO_SOCORRO"] as TipoUnidade[]).map(t=><Button key={t} title={t.replaceAll("_"," ")} secondary={tipo!==t} onPress={()=>setTipo(t)}/>)}</View>
            <Button title={manual?"Usar busca pelo endereço":"Informar/corrigir coordenadas"} secondary onPress={()=>{setManual(v=>!v);setConfirmed(false);}}/>
            {manual?<View style={ui.card}><Text style={ui.text}>Confirme a posição exata da unidade. Uma busca aproximada não será aceita automaticamente.</Text>
                <Field label="Latitude" value={lat} onChangeText={v=>{setLat(v);setConfirmed(false);}} keyboardType="numbers-and-punctuation"/>
                <Field label="Longitude" value={lon} onChangeText={v=>{setLon(v);setConfirmed(false);}} keyboardType="numbers-and-punctuation"/>
                <Button title="Conferir no OpenStreetMap" secondary disabled={!lat||!lon} onPress={()=>{void Linking.openURL(`https://www.openstreetmap.org/?mlat=${encodeURIComponent(lat.replace(",","."))}&mlon=${encodeURIComponent(lon.replace(",","."))}#map=18/${encodeURIComponent(lat.replace(",","."))}/${encodeURIComponent(lon.replace(",","."))}`).catch(()=>setError("Não foi possível abrir o mapa."));}}/>
                <Button title={confirmed?"Posição confirmada":"Confirmo a posição da unidade"} secondary={!confirmed} onPress={()=>setConfirmed(v=>!v)}/>
            </View>:<Text style={ui.text}>O endereço será localizado automaticamente. Se o resultado for aproximado ou o serviço estiver indisponível, informe coordenadas confirmadas.</Text>}
            {!unidadeId&&<Field label="Nome da primeira câmera (opcional)" value={nomeCamera} onChangeText={setNomeCamera} maxLength={100}/>}
            {unidadeId&&<Button title="Gerenciar dispositivos" secondary onPress={()=>navigation.navigate("DispositivosAdmin",{unidadeId})}/>}
            <Button title="Salvar unidade" disabled={!loaded} busy={busy} onPress={()=>Alert.alert("Salvar unidade","Confirma os dados informados?",[{text:"Cancelar",style:"cancel"},{text:"Salvar",onPress:()=>void save()}])}/>
            {error&&unidadeId&&<Button title="Recarregar cadastro" secondary onPress={()=>setRetry(n=>n+1)}/>}
        </>}
    </ScreenLayout>;
}
