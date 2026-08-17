import {
    Unidade,
} from "../types/Unidade";


const URL_BACKEND =
    "http://localhost:8080";


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


export type LoginResponse = {
    id: number;

    nome: string;

    email: string;

    tipo:
        | "ADMIN"
        | "FUNCIONARIO";

    unidadeId:
        number | null;

    token: string;
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