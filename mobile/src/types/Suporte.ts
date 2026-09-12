export const categorias = ["APLICATIVO","CADASTRO","LOGIN","INFORMACAO_UNIDADE","LOCALIZACAO_MAPA","AVALIACAO","OUTRO"] as const;
export const statusSuporte = ["ABERTO","EM_ANALISE","RESOLVIDO"] as const;
export type CategoriaSuporte = typeof categorias[number];
export type StatusSuporte = typeof statusSuporte[number];
export type SolicitacaoSuporte = { id:number; assunto:string; categoria:CategoriaSuporte; descricao:string; status:StatusSuporte; createdAt:string; updatedAt:string; version:number };
export type SuporteAdmin = { solicitacao:SolicitacaoSuporte; usuarioId:number; usuarioNome:string; usuarioEmail:string };
export type Pagina<T> = { content:T[]; number:number; size:number; totalElements:number; totalPages:number };
export type Dispositivo = { id:number; nome:string; unidadeId:number; ativo:boolean; chaveRevogada:boolean; status:string; ultimaComunicacao:string|null; chaveGeradaEm:string; createdAt:string; updatedAt:string; version:number };
export type CredencialCamera = { dispositivo:Dispositivo; cameraKey:string };

export type ResumoSuporte = Omit<SolicitacaoSuporte,"descricao"|"version">;
