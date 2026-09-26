import { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Button, ErrorNotice, Field, useUI } from "./ScreenLayout";
import { useAuth } from "../context/AuthContext";
import { pesquisarSugestoesEndereco, SugestaoEndereco } from "../service/api";
type Point={latitude:number;longitude:number};
export default function AddressSearch({onFound}:{onFound:(point:Point)=>void}) {
    const ui=useUI(); const {usuario}=useAuth();
    const [address,setAddress]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
    const [results,setResults]=useState<SugestaoEndereco[]>([]),[notice,setNotice]=useState("");
    const controller=useRef<AbortController|null>(null);
    useEffect(()=>()=>controller.current?.abort(),[]);
    async function search(){
        if(!usuario || busy || address.trim().length<5)return;
        const request=new AbortController();controller.current=request;setBusy(true);setError("");setResults([]);setNotice("");
        try{const response=await pesquisarSugestoesEndereco(address.trim(),usuario.token,request.signal);if(!request.signal.aborted){setResults(response.resultados);setNotice(response.aviso??"");}}
        catch(e){if(!request.signal.aborted)setError(e instanceof Error?e.message:"Não foi possível pesquisar.");}
        finally{if(!request.signal.aborted)setBusy(false);}
    }
    return <View style={{padding:14,gap:8}}>
        <Field label="Pesquisar endereço ou CEP" placeholder="Endereço ou CEP (ex.: 01310-100)" value={address} maxLength={300} onChangeText={value=>{controller.current?.abort();setBusy(false);setAddress(value);setResults([]);setNotice("");setError("");}} onSubmitEditing={()=>void search()} returnKeyType="search"/>
        <Button title="Pesquisar no mapa" busy={busy} disabled={!usuario||address.trim().length<5} onPress={()=>void search()}/>
        <ErrorNotice message={error}/>
        {notice?<Text accessibilityRole="alert" style={ui.text}>{notice}</Text>:null}
        {results.length>0?<ScrollView style={{maxHeight:190}} keyboardShouldPersistTaps="handled">
            {results.map((result,index)=><View key={`${result.endereco}-${index}`} style={[ui.card,{gap:6}]}>
                <Text style={ui.text}>{result.endereco}</Text>
                <Text style={[ui.text,{fontSize:12}]}>{result.aviso}</Text>
                <Button secondary title="Usar este ponto e ajustar no mapa" onPress={()=>{onFound(result);setResults([]);setNotice("Ponto selecionado. Confira e ajuste o marcador antes de salvar.");}}/>
            </View>)}
        </ScrollView>:null}
        <Text style={[ui.text,{fontSize:12,lineHeight:18}]}>Busca por BrasilAPI, Nominatim e Photon / OpenStreetMap. Confira o endereço antes de selecionar um resultado.</Text>
    </View>;
}
