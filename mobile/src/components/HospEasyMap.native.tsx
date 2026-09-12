import { useEffect,useRef,useState } from "react";
import { Pressable,StyleSheet,Text,View } from "react-native";
import { Camera,CameraRef,Map,Marker } from "@maplibre/maplibre-react-native";
import { Unidade } from "../types/Unidade";
import { Coordenada } from "../utils/location";
import { statusNoMapa,temCoordenadas } from "../utils/mapStatus";
type Props={unidades:Unidade[];localizacaoUsuario?:Coordenada|null;onSelecionarUnidade:(u:Unidade)=>void};
export default function HospEasyMap({unidades,localizacaoUsuario,onSelecionarUnidade}:Props){
 const camera=useRef<CameraRef>(null), centered=useRef(false), userCentered=useRef(false);
 const [ready,setReady]=useState(false),[error,setError]=useState(false),[attempt,setAttempt]=useState(0);
 const valid=unidades.filter(temCoordenadas);
 useEffect(()=>{const timer=setTimeout(()=>{if(!loaded.current)setError(true);},20000);return()=>clearTimeout(timer);},[attempt]);
 useEffect(()=>{if(!ready)return;if(localizacaoUsuario&&!userCentered.current){camera.current?.flyTo({center:[localizacaoUsuario.longitude,localizacaoUsuario.latitude],zoom:14,duration:500});userCentered.current=true;}
 else if(!centered.current&&!userCentered.current&&valid.length){const xs=valid.map(u=>u.longitude),ys=valid.map(u=>u.latitude);camera.current?.fitBounds([Math.min(...xs)-.005,Math.min(...ys)-.005,Math.max(...xs)+.005,Math.max(...ys)+.005],{duration:0});centered.current=true;}},[ready,unidades,localizacaoUsuario]);
 // A successful load cancels the watchdog by switching its condition below.
 const loaded=useRef(false);loaded.current=ready;
 useEffect(()=>{if(ready)setError(false);},[ready]);
 return <View style={{flex:1}}><Map key={attempt} style={{flex:1}} mapStyle="https://tiles.openfreemap.org/styles/liberty" onDidFinishLoadingMap={()=>{setReady(true);setError(false);}} onDidFailLoadingMap={()=>setError(true)}>
 <Camera ref={camera} initialViewState={{center:[0,0],zoom:1}}/>
 {valid.map(u=><Marker key={u.unidadeId} id={String(u.unidadeId)} lngLat={[u.longitude,u.latitude]} onPress={()=>onSelecionarUnidade(u)}><View accessibilityLabel={u.nome} style={[styles.marker,{backgroundColor:statusNoMapa(u).color}]}><Text style={{color:"white",fontWeight:"900"}}>H</Text></View></Marker>)}
 {localizacaoUsuario&&<Marker id="usuario" lngLat={[localizacaoUsuario.longitude,localizacaoUsuario.latitude]}><View style={[styles.marker,{backgroundColor:"#2196f3"}]}/></Marker>}
 </Map>
 {(!ready||error)&&<View style={styles.notice}><Text>{error?"Mapa indisponível. As unidades continuam acessíveis na lista abaixo.":"Carregando mapa…"}</Text>{error&&<Pressable accessibilityRole="button" onPress={()=>{setReady(false);setError(false);centered.current=false;userCentered.current=false;setAttempt(v=>v+1);}} style={{padding:12}}><Text>Tentar novamente</Text></Pressable>}</View>}
 {localizacaoUsuario&&<Pressable accessibilityRole="button" accessibilityLabel="Minha localização" style={styles.location} onPress={()=>camera.current?.flyTo({center:[localizacaoUsuario.longitude,localizacaoUsuario.latitude],zoom:15,duration:500})}><Text style={{fontSize:28}}>⦿</Text></Pressable>}
 </View>;
}
const styles=StyleSheet.create({marker:{width:30,height:30,borderRadius:15,borderWidth:3,borderColor:"white",alignItems:"center",justifyContent:"center"},notice:{position:"absolute",top:12,left:12,right:12,backgroundColor:"white",padding:14,borderRadius:12},location:{position:"absolute",bottom:125,right:18,backgroundColor:"white",padding:12,borderRadius:30}});
