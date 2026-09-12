import { Platform } from "react-native";
import { Unidade, UnidadeCadastro, TipoUnidade } from "../types/Unidade";
import { CategoriaSuporte, StatusSuporte, ResumoSuporte, SolicitacaoSuporte, SuporteAdmin, Pagina, Dispositivo, CredencialCamera } from "../types/Suporte";

export class ApiError extends Error {
    constructor(public status: number, public codigo: string, message: string, public campos?: Record<string,string>) { super(message); }
}
const invalidSession = new Set<(token: string) => void>();
export function onInvalidSession(callback: (token: string) => void) { invalidSession.add(callback); return () => { invalidSession.delete(callback); }; }
function baseUrl() {
    const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
    if (configured) {
        if (Platform.OS !== "web" && !__DEV__ && !configured.startsWith("https://"))
            throw new ApiError(0,"CONFIGURACAO","Configure uma API HTTPS para o aplicativo de produção.");
        return configured.replace(/\/+$/, "");
    }
    if (Platform.OS === "web") {
        const local = ["localhost","127.0.0.1"].includes(window.location.hostname);
        return local ? `${window.location.protocol}//${window.location.hostname}:8080` : `${window.location.origin}/api`;
    }
    if (__DEV__) return "http://10.0.2.2:8080";
    throw new ApiError(0,"CONFIGURACAO","Configure EXPO_PUBLIC_API_URL para o aplicativo.");
}
type Options = { method?: string; data?: unknown; token?: string; signal?: AbortSignal };
export async function request<T>(path: string, options: Options = {}): Promise<T> {
    const controller = new AbortController();
    const abort = () => controller.abort();
    options.signal?.addEventListener("abort", abort, { once: true });
    if (options.signal?.aborted) controller.abort();
    const timer = setTimeout(abort, 15000);
    try {
        const response = await fetch(baseUrl()+path, {
            method: options.method ?? "GET", signal: controller.signal,
            headers: { ...(options.data !== undefined ? { "Content-Type":"application/json" } : {}),
                ...(options.token ? { Authorization:`Bearer ${options.token}` } : {}) },
            ...(options.data !== undefined ? { body: JSON.stringify(options.data) } : {}),
        });
        const text = await response.text();
        let body: any;
        try { body = text ? JSON.parse(text) : undefined; } catch { body = text; }
        if (!response.ok) {
            if (response.status === 401 && options.token) invalidSession.forEach(callback => callback(options.token!));
            throw new ApiError(response.status, body?.codigo ?? "HTTP_ERROR",
                body?.mensagem ?? (response.status === 403 ? "Você não possui permissão." :
                    response.status === 429 ? "Muitas tentativas. Aguarde antes de continuar." : "Não foi possível concluir a operação."),
                body?.campos);
        }
        return body as T;
    } catch (error) {
        if (error instanceof ApiError) throw error;
        if (options.signal?.aborted) throw error;
        throw new ApiError(0,"REDE","Não foi possível conectar. Verifique a rede e tente novamente.");
    } finally {
        clearTimeout(timer); options.signal?.removeEventListener("abort", abort);
    }
}
export type TipoUsuario = "ADMIN" | "USUARIO";
export type UsuarioAdmin = { id:number; nome:string; email:string; tipo:TipoUsuario; ativo:boolean };
export type LoginResponse = Omit<UsuarioAdmin,"ativo"> & { token:string };
export type CadastroUsuarioPayload = { nome:string; email:string; senha:string };
export type CadastroUsuarioResponse = UsuarioAdmin;
export type Avaliacao = { id:number; unidadeId:number; unidadeNome:string; nota:number; comentario:string|null; criadoEm:string; usuarioId:number|null; usuarioNome:string|null };
export type CriarAvaliacaoPayload = { nota:number; comentario:string };
export type AtualizarAvaliacaoPayload = CriarAvaliacaoPayload;
export const fazerLogin = (email:string,senha:string) => request<LoginResponse>("/usuarios/login",{method:"POST",data:{email,senha}});
export const usuarioAtual = (token:string,signal?:AbortSignal) => request<UsuarioAdmin>("/usuarios/me",{token,signal});
export const cadastrarUsuario = (data:CadastroUsuarioPayload) => request<CadastroUsuarioResponse>("/usuarios/cadastro",{method:"POST",data});
export const solicitarRecuperacaoSenha = (email:string) => request<string>("/usuarios/esqueci-senha",{method:"POST",data:{email}});
export const verificarCodigoRecuperacao = (email:string,codigo:string) => request<void>("/usuarios/verificar-codigo",{method:"POST",data:{email,codigo}});
export const redefinirSenha = (email:string,codigo:string,novaSenha:string) => request<void>("/usuarios/redefinir-senha",{method:"POST",data:{email,codigo,novaSenha}});
export const buscarSituacoesUnidades = (signal?:AbortSignal) => request<Unidade[]>("/unidades/situacoes/ordenadas",{signal});
export const buscarSituacaoUnidade = (id:number,signal?:AbortSignal) => request<Unidade>(`/unidades/${id}/situacao`,{signal});
export const buscarUnidadePorId = (id:number,signal?:AbortSignal) => request<UnidadeCadastro>(`/unidades/${id}`,{signal});
export const listarUnidadesAdmin = (token:string,signal?:AbortSignal) => request<Unidade[]>("/admin/unidades",{token,signal});
export const buscarAvaliacoes = (id:number,signal?:AbortSignal) => request<Avaliacao[]>(`/unidades/${id}/avaliacoes`,{signal});
export const criarAvaliacao = (id:number,data:CriarAvaliacaoPayload,token:string) => request<Avaliacao>(`/unidades/${id}/avaliacoes`,{method:"POST",data,token});
export const buscarMinhasAvaliacoes = (token:string,signal?:AbortSignal) => request<Avaliacao[]>("/usuarios/me/avaliacoes",{token,signal});
export const atualizarAvaliacao = (id:number,data:AtualizarAvaliacaoPayload,token:string) => request<Avaliacao>(`/usuarios/me/avaliacoes/${id}`,{method:"PUT",data,token});
export const excluirAvaliacao = (id:number,token:string) => request<void>(`/usuarios/me/avaliacoes/${id}`,{method:"DELETE",token});
export const listarUsuariosAdmin = (token:string) => request<UsuarioAdmin[]>("/usuarios",{token});
export const buscarUsuarioAdmin = (id:number,token:string,signal?:AbortSignal) => request<UsuarioAdmin>(`/usuarios/${id}`,{token,signal});
export const criarUsuarioAdmin = (data:CadastroUsuarioPayload & {tipo:TipoUsuario},token:string) => request<UsuarioAdmin>("/usuarios",{method:"POST",data,token});
export const atualizarUsuarioAdmin = (id:number,data:Omit<UsuarioAdmin,"id">,token:string) => request<UsuarioAdmin>(`/usuarios/${id}`,{method:"PUT",data,token});
export type AtualizarUnidadeAdminPayload = { nome:string; endereco:string; telefone:string|null; capacidadeAreaMonitorada:number; tipo:TipoUnidade; latitude?:number; longitude?:number };
export type CriarUnidadeAdminPayload = AtualizarUnidadeAdminPayload & { nomeCamera?:string };
export type CadastroUnidadeAdminResponse = { unidade:UnidadeCadastro; cameraId:number|null; cameraNome:string|null; chaveApi:string|null };
export const criarUnidadeAdmin = (data:CriarUnidadeAdminPayload,token:string) => request<CadastroUnidadeAdminResponse>("/unidades",{method:"POST",data,token});
export const atualizarUnidadeAdmin = (id:number,data:AtualizarUnidadeAdminPayload,token:string) => request<UnidadeCadastro>(`/unidades/${id}`,{method:"PUT",data,token});
export const excluirUnidadeAdmin = (id:number,token:string) => request<void>(`/unidades/${id}`,{method:"DELETE",token});
export const buscarFavoritos = (token:string,signal?:AbortSignal) => request<Unidade[]>("/usuarios/me/favoritos",{token,signal});
export const adicionarFavorito = (id:number,token:string) => request<Unidade>(`/usuarios/me/favoritos/${id}`,{method:"POST",token});
export const removerFavorito = (id:number,token:string) => request<void>(`/usuarios/me/favoritos/${id}`,{method:"DELETE",token});

export function listarSuporte(token:string,admin:boolean,page=0,status?:StatusSuporte,categoria?:CategoriaSuporte,signal?:AbortSignal) {
    const query = new URLSearchParams({page:String(page),size:"20"});
    if(status) query.set("status",status); if(categoria) query.set("categoria",categoria);
    return request<Pagina<ResumoSuporte>>(`${admin?"/admin/suporte":"/usuarios/me/suporte"}?${query}`,{token,signal});
}
export const criarSuporte = (data:{assunto:string;categoria:CategoriaSuporte;descricao:string},token:string) => request<SolicitacaoSuporte>("/usuarios/me/suporte",{method:"POST",data,token});
export const buscarSuporte = (id:number,token:string,signal?:AbortSignal) => request<SolicitacaoSuporte>(`/usuarios/me/suporte/${id}`,{token,signal});
export const buscarSuporteAdmin = (id:number,token:string,signal?:AbortSignal) => request<SuporteAdmin>(`/admin/suporte/${id}`,{token,signal});
export const atualizarStatusSuporte = (id:number,status:StatusSuporte,version:number,token:string) => request<SuporteAdmin>(`/admin/suporte/${id}/status`,{method:"PATCH",data:{status,version},token});
export const listarDispositivos = (id:number,token:string,signal?:AbortSignal) => request<Dispositivo[]>(`/admin/unidades/${id}/dispositivos`,{token,signal});
export const criarDispositivo = (id:number,nome:string,ativo:boolean,token:string) => request<CredencialCamera>(`/admin/unidades/${id}/dispositivos`,{method:"POST",data:{nome,ativo},token});
export const atualizarDispositivo = (id:number,nome:string,ativo:boolean,version:number,token:string) => request<Dispositivo>(`/admin/dispositivos/${id}`,{method:"PATCH",data:{nome,ativo,version},token});
export const revogarDispositivo = (id:number,token:string) => request<Dispositivo>(`/admin/dispositivos/${id}/revogar-chave`,{method:"POST",token});
export const regenerarDispositivo = (id:number,token:string) => request<CredencialCamera>(`/admin/dispositivos/${id}/regenerar-chave`,{method:"POST",token});
