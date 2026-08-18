import {
    Unidade,
} from "../types/Unidade";


const URL_BACKEND =
    "http://192.168.15.206:8080";


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
    | "FUNCIONARIO"
    | "USUARIO";


export type LoginResponse = {
    id: number;

    nome: string;

    email: string;

    tipo: TipoUsuario;

    unidadeId:
        number | null;

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

    unidadeId:
        number | null;

    unidadeNome:
        string | null;
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

        /*
         * O backend pode responder com
         * formatos diferentes dependendo
         * do ExceptionHandler.
         *
         * Tentamos ler a resposta para
         * identificar email duplicado.
         */
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