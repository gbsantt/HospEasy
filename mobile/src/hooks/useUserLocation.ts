import {useCallback,useEffect,useRef,useState} from "react";
import * as Location from "expo-location";
import {Coordenada} from "../utils/location";
export function useUserLocation(){
 const [localizacao,setLocation]=useState<Coordenada|null>(null),[carregando,setLoading]=useState(true),[erro,setError]=useState<string|null>(null);
 const generation=useRef(0),busy=useRef(false);
 const recarregar=useCallback(async()=>{if(busy.current)return;busy.current=true;const epoch=++generation.current;setLoading(true);setError(null);let timer:ReturnType<typeof setTimeout>|undefined;
 try{
  if(!await Location.hasServicesEnabledAsync())throw new Error("Ative a localização do dispositivo. Você pode continuar pela lista.");
  const permission=await Location.requestForegroundPermissionsAsync();if(permission.status!==Location.PermissionStatus.GRANTED)throw new Error("Permissão de localização negada. Você pode continuar pela lista.");
  const position=await Promise.race([ (async()=>await Location.getLastKnownPositionAsync({maxAge:60000,requiredAccuracy:500})??await Location.getCurrentPositionAsync({accuracy:Location.Accuracy.Balanced}))(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error("Localização demorou demais. Tente novamente.")),15000);})]);
  if(epoch===generation.current)setLocation({latitude:position.coords.latitude,longitude:position.coords.longitude});
 }catch(e){if(epoch===generation.current){setLocation(null);setError(e instanceof Error?e.message:"Localização indisponível.");}}
 finally{clearTimeout(timer);busy.current=false;if(epoch===generation.current)setLoading(false);}},[]);
 useEffect(()=>{void recarregar();return()=>{generation.current++;};},[recarregar]);
 return{localizacao,carregando,erro,recarregar};
}
