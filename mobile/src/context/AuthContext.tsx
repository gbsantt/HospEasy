import { createContext,ReactNode,useCallback,useContext,useEffect,useRef,useState } from "react";
import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiError,cadastrarUsuario,fazerLogin,LoginResponse,onInvalidSession,usuarioAtual } from "../service/api";
import { readToken,writeToken,clearToken } from "../service/sessionStorage";
type Auth = { usuario:LoginResponse|null; carregandoSessao:boolean; erroSessao:string|null; autenticado:boolean;
    login:(email:string,senha:string)=>Promise<void>; cadastro:(nome:string,email:string,senha:string)=>Promise<void>;
    logout:()=>Promise<void>; revalidar:()=>Promise<void> };
const Context=createContext<Auth|undefined>(undefined);
export function AuthProvider({children}:{children:ReactNode}) {
    const [usuario,setUsuario]=useState<LoginResponse|null>(null);
    const [carregandoSessao,setLoading]=useState(true);
    const [erroSessao,setError]=useState<string|null>(null);
    const current=useRef<LoginResponse|null>(null);
    const validating=useRef(false);
    const generation=useRef(0);
    const storageQueue=useRef<Promise<void>>(Promise.resolve());
    const persist=(action:()=>Promise<void>) => {
        const task=storageQueue.current.catch(()=>{}).then(action); storageQueue.current=task; return task;
    };
    const logout=useCallback(async()=>{
        generation.current++; current.current=null; setUsuario(null); setError(null); setLoading(false);
        try { await persist(clearToken); } catch { setError("Não foi possível remover a sessão armazenada. Tente sair novamente."); }
    },[]);
    const revalidar=useCallback(async()=>{
        if(validating.current)return; validating.current=true;
        const epoch=generation.current;
        try {
            const token=current.current?.token ?? await readToken();
            if(!token || epoch!==generation.current) return;
            const data=await usuarioAtual(token);
            if(epoch!==generation.current) return;
            const session={id:data.id,nome:data.nome,email:data.email,tipo:data.tipo,token};
            current.current=session; setUsuario(session); setError(null);
        } catch(error) {
            if(epoch!==generation.current) return;
            if(error instanceof ApiError && error.status===401) await logout();
            else setError(error instanceof Error?error.message:"Não foi possível validar a sessão.");
        } finally { validating.current=false; if(epoch===generation.current) setLoading(false); }
    },[logout]);
    useEffect(()=>{
        const unsubscribe=onInvalidSession(token=>{if(current.current?.token===token) void logout();});
        void AsyncStorage.removeItem("@hospeasy:sessao").catch(()=>{});
        void revalidar();
        const listener=AppState.addEventListener("change",state=>{if(state==="active") void revalidar();});
        const timer=setInterval(()=>{if(current.current) void revalidar();},60000);
        return ()=>{unsubscribe();listener.remove();clearInterval(timer);};
    },[revalidar,logout]);
    async function save(session:LoginResponse,epoch:number) {
        if(epoch!==generation.current) return;
        await persist(async()=>{if(epoch===generation.current) await writeToken(session.token);});
        if(epoch!==generation.current) return;
        current.current=session; setUsuario(session); setError(null); setLoading(false);
    }
    async function login(email:string,senha:string) {
        const epoch=++generation.current;
        await save(await fazerLogin(email.trim().toLowerCase(),senha),epoch);
    }
    async function cadastro(nome:string,email:string,senha:string) {
        const epoch=++generation.current;
        await cadastrarUsuario({nome:nome.trim(),email:email.trim().toLowerCase(),senha});
        try { await save(await fazerLogin(email.trim().toLowerCase(),senha),epoch); }
        catch { throw new Error("Conta criada. Entre com seu e-mail e senha para continuar."); }
    }
    return <Context.Provider value={{usuario,carregandoSessao,erroSessao,autenticado:!!usuario,login,cadastro,logout,revalidar}}>{children}</Context.Provider>;
}
export function useAuth(){const value=useContext(Context);if(!value)throw new Error("AuthProvider ausente");return value;}
