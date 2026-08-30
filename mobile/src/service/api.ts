import {
    Unidade,
} from "../types/Unidade";


const URL_BACKEND =
    "http://192.168.1.103:8080";


export type CriarAvaliacaoPayload = {
    nota: number;
    comentario: string;
};


export type Avaliacao = {
    id: number;

    unidadeId: number;

    nota: number;

    comentario:
        string | null;

    criadoEm: string;

    usuarioId:
        number | null;

    usuarioNome:
        string | null;
};


export type TipoUsuario =
    | "ADMIN"
    | "USUARIO";


export type LoginResponse = {
    id: number;

    nome: string;

    email: string;

    tipo: TipoUsuario;

    token: string;
};


export type CadastroUsuarioPayload = {
    nome: string;
    email: string;
    senha: string;
};


export type CadastroUsuarioResponse = {
    id: number;

    nome: string;

    email: string;

    tipo: TipoUsuario;

    ativo: boolean;
};


/*
 * USUÁRIO RETORNADO PELO PAINEL ADMIN
 */
export type UsuarioAdmin = {
    id: number;

    nome: string;

    email: string;

    tipo: TipoUsuario;

    ativo: boolean;
};


/*
 * =========================================================
 * UNIDADES
 * =========================================================
 */

export async function buscarSituacoesUnidades():
    Promise<Unidade[]> {

    const resposta =
        await fetch(
            `${URL_BACKEND}/unidades/situacoes/ordenadas`
        );


    if (!resposta.ok) {

        throw new Error(
            `Erro ao buscar unidades: ${resposta.status}`
        );
    }


    return resposta.json();
}



export async function buscarUnidadePorId(
    unidadeId: number
): Promise<Unidade> {

    const resposta =
        await fetch(
            `${URL_BACKEND}/unidades/${unidadeId}`
        );

    if (!resposta.ok) {

        throw new Error(
            `Erro ao buscar unidade: ${resposta.status}`
        );
    }

    return resposta.json();
}


/*
 * =========================================================
 * AVALIAÇÕES
 * =========================================================
 */

export async function criarAvaliacao(
    unidadeId: number,
    dados: CriarAvaliacaoPayload
): Promise<Avaliacao> {

    const resposta =
        await fetch(
            `${URL_BACKEND}/unidades/${unidadeId}/avaliacoes`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body:
                    JSON.stringify(
                        dados
                    ),
            }
        );


    if (!resposta.ok) {

        throw new Error(
            `Erro ao enviar avaliação: ${resposta.status}`
        );
    }


    return resposta.json();
}


export async function buscarAvaliacoes(
    unidadeId: number
): Promise<Avaliacao[]> {

    const resposta =
        await fetch(
            `${URL_BACKEND}/unidades/${unidadeId}/avaliacoes`
        );


    if (!resposta.ok) {

        throw new Error(
            `Erro ao buscar avaliações: ${resposta.status}`
        );
    }


    return resposta.json();
}


/*
 * =========================================================
 * LOGIN
 * =========================================================
 */

export async function fazerLogin(
    email: string,
    senha: string
): Promise<LoginResponse> {

    const resposta =
        await fetch(
            `${URL_BACKEND}/usuarios/login`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body:
                    JSON.stringify({
                        email,
                        senha,
                    }),
            }
        );


    if (!resposta.ok) {

        if (
            resposta.status === 401 ||
            resposta.status === 403
        ) {

            throw new Error(
                "EMAIL_SENHA_INVALIDOS"
            );
        }


        throw new Error(
            `Erro no login: ${resposta.status}`
        );
    }


    return resposta.json();
}


/*
 * =========================================================
 * SITUAÇÃO DA UNIDADE
 * =========================================================
 */

export async function buscarSituacaoUnidade(
    unidadeId: number
): Promise<Unidade> {

    const resposta =
        await fetch(
            `${URL_BACKEND}/unidades/${unidadeId}/situacao`
        );


    if (!resposta.ok) {

        throw new Error(
            `Erro ao buscar situação da unidade: ${resposta.status}`
        );
    }


    return resposta.json();
}


/*
 * =========================================================
 * CADASTRO PÚBLICO
 * =========================================================
 */

export async function cadastrarUsuario(
    dados: CadastroUsuarioPayload
): Promise<CadastroUsuarioResponse> {

    const resposta =
        await fetch(
            `${URL_BACKEND}/usuarios/cadastro`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body:
                    JSON.stringify(
                        dados
                    ),
            }
        );


    if (!resposta.ok) {

        let mensagem = "";


        try {

            const dadosErro =
                await resposta.json();


            mensagem =
                dadosErro?.message ??
                dadosErro?.mensagem ??
                "";

        } catch {

            // Ignora caso não exista JSON.
        }


        if (
            mensagem
                .toLowerCase()
                .includes("email")
        ) {

            throw new Error(
                "EMAIL_JA_CADASTRADO"
            );
        }


        throw new Error(
            `Erro no cadastro: ${resposta.status}`
        );
    }


    return resposta.json();
}


/*
 * =========================================================
 * RECUPERAÇÃO DE SENHA
 * =========================================================
 */

export async function solicitarRecuperacaoSenha(
    email: string
): Promise<string> {

    const resposta =
        await fetch(
            `${URL_BACKEND}/usuarios/esqueci-senha`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body:
                    JSON.stringify({
                        email,
                    }),
            }
        );


    if (!resposta.ok) {

        if (
            resposta.status === 404
        ) {

            throw new Error(
                "EMAIL_NAO_ENCONTRADO"
            );
        }


        throw new Error(
            `Erro ao solicitar recuperação: ${resposta.status}`
        );
    }


    return resposta.text();
}


export async function verificarCodigoRecuperacao(
    email: string,
    codigo: string
): Promise<void> {

    const resposta =
        await fetch(
            `${URL_BACKEND}/usuarios/verificar-codigo`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body:
                    JSON.stringify({
                        email,
                        codigo,
                    }),
            }
        );


    if (!resposta.ok) {

        throw new Error(
            "CODIGO_INVALIDO"
        );
    }
}


export async function redefinirSenha(
    email: string,
    codigo: string,
    novaSenha: string
): Promise<void> {

    const resposta =
        await fetch(
            `${URL_BACKEND}/usuarios/redefinir-senha`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body:
                    JSON.stringify({
                        email,
                        codigo,
                        novaSenha,
                    }),
            }
        );


    if (!resposta.ok) {

        throw new Error(
            "ERRO_REDEFINIR_SENHA"
        );
    }
}


/*
 * =========================================================
 * ADMIN - USUÁRIOS
 * =========================================================
 */


/*
 * LISTAR TODOS OS USUÁRIOS
 */
export async function listarUsuariosAdmin(
    token: string
): Promise<UsuarioAdmin[]> {

    const resposta =
        await fetch(
            `${URL_BACKEND}/usuarios`,
            {
                method: "GET",

                headers: {
                    Authorization:
                        `Bearer ${token}`,
                },
            }
        );


    if (!resposta.ok) {

        throw new Error(
            `Erro ao buscar usuários: ${resposta.status}`
        );
    }


    return resposta.json();
}

/*
 * CRIAR USUÁRIO PELO ADMIN
 */
export async function criarUsuarioAdmin(
    dados: {
        nome: string;
        email: string;
        senha: string;
        tipo: TipoUsuario;
    },
    token: string
): Promise<UsuarioAdmin> {

    const resposta =
        await fetch(
            `${URL_BACKEND}/usuarios`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`,
                },

                body:
                    JSON.stringify(
                        dados
                    ),
            }
        );


    if (!resposta.ok) {

        let mensagem = "";


        try {

            const erro =
                await resposta.json();


            mensagem =
                erro?.message ??
                erro?.mensagem ??
                "";

        } catch {

            // Sem JSON.
        }


        throw new Error(
            mensagem ||
            `Erro ao criar usuário: ${resposta.status}`
        );
    }


    return resposta.json();
}

export async function atualizarUsuarioAdmin(
    usuarioId: number,

    dados: {
        nome: string;
        email: string;
        tipo: TipoUsuario;
        ativo: boolean;
    },

    token: string
): Promise<UsuarioAdmin> {

    const resposta =
        await fetch(
            `${URL_BACKEND}/usuarios/${usuarioId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`,
                },

                body:
                    JSON.stringify(
                        dados
                    ),
            }
        );


    if (!resposta.ok) {

        let mensagem = "";


        try {

            const erro =
                await resposta.json();


            mensagem =
                erro?.message ??
                erro?.mensagem ??
                "";

        } catch {

            // Resposta sem JSON.
        }


        throw new Error(
            mensagem ||
            `Erro ao atualizar usuário: ${resposta.status}`
        );
    }


    return resposta.json();
}

/*
 * =========================================================
 * ADMIN - UNIDADES
 * =========================================================
 */


export type CriarUnidadeAdminPayload = {
    nome: string;
    endereco: string;
    telefone: string | null;
    capacidadeAreaMonitorada: number;
    tipo: "UPA" | "PRONTO_ATENDIMENTO" | "PRONTO_SOCORRO";
};


export async function criarUnidadeAdmin(
    dados: CriarUnidadeAdminPayload,
    token: string
): Promise<Unidade> {

    const resposta =
        await fetch(
            `${URL_BACKEND}/unidades`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",

                    Authorization:
                        `Bearer ${token}`,
                },

                body:
                    JSON.stringify({
                        ...dados,

                        /*
                         * O ADMIN não precisa mais informar
                         * coordenadas manualmente.
                         *
                         * O backend geocodifica o endereço e
                         * preenche latitude/longitude.
                         */
                        latitude: null,
                        longitude: null,
                    }),
            }
        );


    if (!resposta.ok) {

        let mensagem = "";


        try {

            const erro =
                await resposta.json();


            mensagem =
                erro?.message ??
                erro?.mensagem ??
                "";

        } catch {

            // Resposta sem JSON.
        }


        throw new Error(
            mensagem ||
            `Erro ao criar unidade: ${resposta.status}`
        );
    }


    return resposta.json();
}



export type AtualizarUnidadeAdminPayload = {
    nome: string;
    endereco: string;
    telefone: string | null;
    capacidadeAreaMonitorada: number;
    latitude: number | null;
    longitude: number | null;
    tipo: "UPA" | "PRONTO_ATENDIMENTO" | "PRONTO_SOCORRO";
};


export async function atualizarUnidadeAdmin(
    unidadeId: number,
    dados: AtualizarUnidadeAdminPayload,
    token: string
): Promise<Unidade> {

    const resposta = await fetch(
        `${URL_BACKEND}/unidades/${unidadeId}`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },

            body: JSON.stringify(dados),
        }
    );


    if (!resposta.ok) {

        let mensagem = "";

        try {
            const erro = await resposta.json();
            mensagem = erro?.message ?? erro?.mensagem ?? "";
        } catch {
            // Sem JSON.
        }

        throw new Error(
            mensagem ||
            `Erro ao atualizar unidade: ${resposta.status}`
        );
    }


    return resposta.json();
}
