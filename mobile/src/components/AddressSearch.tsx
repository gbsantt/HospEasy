import { useEffect, useRef, useState } from "react";
import { View, Text } from "react-native";
import { Button, ErrorNotice, Field, useUI } from "./ScreenLayout";
import { useAuth } from "../context/AuthContext";
import { pesquisarEndereco } from "../service/api";
type Point={latitude:number;longitude:number};
export default function AddressSearch({onFound}:{onFound:(point:Point)=>void}) {
    const ui=useUI(); const {usuario}=useAuth();
    const [address,setAddress]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
    const controller=useRef<AbortController|null>(null);
    useEffect(()=>()=>controller.current?.abort(),[]);
    async function search(){
        if(!usuario || busy || address.trim().length<5)return;
        const request=new AbortController();controller.current=request;setBusy(true);setError("");
        try{const point=await pesquisarEndereco(address.trim(),usuario.token,request.signal);if(!request.signal.aborted)onFound(point);}
        catch(e){if(!request.signal.aborted)setError(e instanceof Error?e.message:"Não foi possível pesquisar.");}
        finally{if(!request.signal.aborted)setBusy(false);}
    }
    return <View style={{padding:14,gap:8}}>
        <Field label="Pesquisar endereço ou CEP" placeholder="Endereço ou CEP (ex.: 01310-100)" value={address} maxLength={300} onChangeText={setAddress} onSubmitEditing={()=>void search()} returnKeyType="search"/>
        <Button title="Pesquisar no mapa" busy={busy} disabled={!usuario||address.trim().length<5} onPress={()=>void search()}/>
        <ErrorNotice message={error}/>
        <Text style={[ui.text,{fontSize:12,lineHeight:18}]}>Busca por OpenStreetMap/Nominatim. O CEP localiza uma região; ajuste o ponto exato da unidade antes de confirmar.</Text>
    </View>;
}
