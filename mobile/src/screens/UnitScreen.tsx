import { useCallback,useState } from "react";
import { Text,View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { ScreenLayout,Button,ErrorNotice,ui } from "../components/ScreenLayout";
import { ApiError,Avaliacao,buscarAvaliacoes,buscarSituacaoUnidade } from "../service/api";
import { Unidade } from "../types/Unidade";
import { useFavorites } from "../context/FavoritesContext";
import { statusNoMapa } from "../utils/mapStatus";
export default function UnitScreen({navigation,route}:NativeStackScreenProps<RootStackParamList,"Unit">){
    const id=route.params.unidadeId;
    const [unidade,setUnidade]=useState<Unidade>(),[avaliacoes,setAvaliacoes]=useState<Avaliacao[]>([]);
    const [error,setError]=useState(""),[reviewError,setReviewError]=useState(""),[missing,setMissing]=useState(false),[retry,setRetry]=useState(0);
    const {alternarFavorito,estaFavoritado}=useFavorites();
    useFocusEffect(useCallback(()=>{
        const c=new AbortController();let timer:ReturnType<typeof setTimeout>;let deleted=false;
        setMissing(false);setError("");setUnidade(undefined);setAvaliacoes([]);setReviewError("");
        async function load(){
            try{const data=await buscarSituacaoUnidade(id,c.signal);if(!c.signal.aborted){setUnidade(data);setError("");}}
            catch(e){if(!c.signal.aborted){
                if(e instanceof ApiError&&e.status===404){setMissing(true);setUnidade(undefined);deleted=true;}
                else{setError("Não foi possível atualizar. A ocupação pode estar desatualizada.");setUnidade(u=>u?{...u,statusMedicao:"DESATUALIZADA"}:u);}
            }}finally{if(!c.signal.aborted&&!deleted)timer=setTimeout(load,15000);}
        }
        void load();
        buscarAvaliacoes(id,c.signal).then(d=>{if(!c.signal.aborted)setAvaliacoes(d);})
            .catch(e=>{if(!c.signal.aborted)setReviewError(e.message);});
        return ()=>{c.abort();clearTimeout(timer);};
    },[id,retry]));
    const status=unidade?statusNoMapa(unidade):undefined;
    const media=avaliacoes.length?avaliacoes.reduce((sum,a)=>sum+a.nota,0)/avaliacoes.length:0;
    return <ScreenLayout title={unidade?.nome??"Unidade de atendimento"} onBack={()=>navigation.canGoBack()?navigation.goBack():navigation.navigate("Home")}>
        {missing?<Text style={ui.text}>Esta unidade não está mais disponível.</Text>:<>
        <ErrorNotice message={error}/>{error&&<Button title="Tentar novamente" onPress={()=>setRetry(n=>n+1)}/>}
        {!unidade&&!error&&<Text style={ui.text}>Carregando unidade…</Text>}
        {unidade&&<>
            <View style={ui.card}><Text style={ui.text}>{unidade.tipo.replaceAll("_"," ")}</Text><Text style={ui.text}>{unidade.endereco}</Text>
                <Text style={ui.text}>Telefone: {unidade.telefone||"Não informado"}</Text>
                <Text style={[ui.title,{color:status!.color}]}>{status!.text}</Text>
                <Text style={ui.text}>Última contagem: {unidade.ocupacaoAtual} pessoas · capacidade: {unidade.capacidadeAreaMonitorada}</Text>
                <Text style={ui.text}>Câmera: {unidade.statusCamera.replaceAll("_"," ")} · medição: {unidade.statusMedicao.replaceAll("_"," ")}</Text>
                <Text style={ui.text}>Última atualização: {unidade.ultimaAtualizacao?new Date(unidade.ultimaAtualizacao).toLocaleString("pt-BR"):"Sem atualização"}</Text>
                {unidade.statusMedicao==="ATUALIZADA" && unidade.ritmoOcupacao!=="DADOS_INSUFICIENTES" ? <><Text style={ui.text}>Média (30 min): {unidade.mediaUltimos30Minutos.toFixed(1)} pessoas</Text>
                <Text style={ui.text}>Tendência: {unidade.tendencia} · ritmo: {unidade.ritmoOcupacao.replaceAll("_"," ")}</Text></> : <Text style={ui.text}>Sem dados suficientes e atuais para estimar tendência.</Text>}
                <Button secondary title={estaFavoritado(id)?"Remover dos favoritos":"Adicionar aos favoritos"} onPress={()=>void alternarFavorito(unidade)}/>
            </View>
            <Button title="Avaliar unidade" onPress={()=>navigation.navigate("Review",{unidadeId:id})}/>
            <Text style={ui.title}>Avaliações {avaliacoes.length? `· ${media.toFixed(1)} / 5`:""}</Text>
            <ErrorNotice message={reviewError}/>{reviewError&&<Button title="Recarregar avaliações" secondary onPress={()=>setRetry(n=>n+1)}/>}
            {avaliacoes.map(a=><View key={a.id} style={ui.card}><Text style={ui.label}>{"★".repeat(a.nota)}{"☆".repeat(5-a.nota)}</Text>
                <Text style={ui.text}>{a.usuarioNome||"Usuário"} · {new Date(a.criadoEm).toLocaleDateString("pt-BR")}</Text>
                <Text style={ui.text}>{a.comentario||"Sem comentário"}</Text></View>)}
            {!avaliacoes.length&&!reviewError&&<Text style={ui.text}>Esta unidade ainda não possui avaliações.</Text>}
        </>}</>}
    </ScreenLayout>;
}
