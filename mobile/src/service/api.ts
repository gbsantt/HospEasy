import {
    Unidade,
} from "../types/Unidade";


const URL_BACKEND =
    "http://192.168.56.1:8080";


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
 * RECUPERAÇÃO DE SENHA
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