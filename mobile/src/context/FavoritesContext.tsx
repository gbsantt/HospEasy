import { createContext,ReactNode,useCallback,useContext,useEffect,useRef,useState } from "react";
import { Unidade } from "../types/Unidade";
import { adicionarFavorito,buscarFavoritos,removerFavorito } from "../service/api";
import { useAuth } from "./AuthContext";
import { Alert } from "../utils/alert";
type Favorites={favoritos:Unidade[];carregandoFavoritos:boolean;erroFavoritos:string|null;
    favoritar:(u:Unidade)=>Promise<void>;desfavoritar:(id:number)=>Promise<void>;alternarFavorito:(u:Unidade)=>Promise<void>;
    estaFavoritado:(id:number)=>boolean;recarregarFavoritos:()=>Promise<void>};
const Context=createContext<Favorites|undefined>(undefined);
export function FavoritesProvider({children}:{children:ReactNode}) {
    const {usuario}=useAuth();
    const [favoritos,setFavoritos]=useState<Unidade[]>([]);
    const [carregandoFavoritos,setLoading]=useState(false);
    const [erroFavoritos,setError]=useState<string|null>(null);
    const session=useRef(usuario?.token); session.current=usuario?.token;
    const pending=useRef(new Set<number>());
    const fetching=useRef<string|undefined>(undefined);
    const requestVersion=useRef(0);
    const recarregarFavoritos=useCallback(async(signal?:AbortSignal)=>{
        if(!usuario || fetching.current===usuario.token)return;
        fetching.current=usuario.token;
        const token=usuario.token,version=++requestVersion.current;
        setLoading(true);
        try {
            const data=await buscarFavoritos(token,signal);
            if(session.current===token && version===requestVersion.current && pending.current.size===0){setFavoritos(data);setError(null);}
        } catch(e) {if(!signal?.aborted && session.current===token)setError(e instanceof Error?e.message:"Falha ao carregar favoritos.");}
        finally {if(fetching.current===token)fetching.current=undefined;if(session.current===token)setLoading(false);}
    },[usuario?.token]);
    useEffect(()=>{
        pending.current.clear();requestVersion.current++;setFavoritos([]);setError(null);
        if(!usuario){setLoading(false);return;}
        const controller=new AbortController();
        void recarregarFavoritos(controller.signal);
        const timer=setInterval(()=>{if(!pending.current.size)void recarregarFavoritos(controller.signal);},15000);
        return ()=>{controller.abort();clearInterval(timer);};
    },[usuario?.token,recarregarFavoritos]);
    async function mutate(id:number,unit?:Unidade) {
        if(!usuario){Alert.alert("Entre na sua conta","Faça login para salvar favoritos.");return;}
        if(pending.current.has(id))return;
        const token=usuario.token;const previous=favoritos.find(u=>u.unidadeId===id);
        pending.current.add(id);requestVersion.current++;
        setFavoritos(items=>unit?[...items.filter(u=>u.unidadeId!==id),unit]:items.filter(u=>u.unidadeId!==id));
        try {
            if(unit)await adicionarFavorito(id,token);else await removerFavorito(id,token);
        } catch(e) {
            if(session.current===token){
                setFavoritos(items=>previous?[...items.filter(u=>u.unidadeId!==id),previous]:items.filter(u=>u.unidadeId!==id));
                const message=e instanceof Error?e.message:"Não foi possível alterar o favorito.";
                setError(message);Alert.alert("Favoritos",message);
            }
        } finally {
            if(session.current===token){pending.current.delete(id);await recarregarFavoritos();}
        }
    }
    const value:Favorites={favoritos,carregandoFavoritos,erroFavoritos,
        favoritar:u=>mutate(u.unidadeId,u),desfavoritar:id=>mutate(id),
        alternarFavorito:u=>mutate(u.unidadeId,favoritos.some(f=>f.unidadeId===u.unidadeId)?undefined:u),
        estaFavoritado:id=>favoritos.some(u=>u.unidadeId===id),recarregarFavoritos};
    return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useFavorites(){const value=useContext(Context);if(!value)throw new Error("FavoritesProvider ausente");return value;}
