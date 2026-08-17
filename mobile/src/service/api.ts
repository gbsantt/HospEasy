import { Unidade } from "../types/Unidade";


const URL_BACKEND = "http://localhost:8080";


export type CriarAvaliacaoPayload = {
    nota: number;
    comentario: string;
};


export type Avaliacao = {
    id: number;
    unidadeId: number;

    nota: number;
    comentario: string | null;

    criadoEm: string;

    usuarioId: number | null;
    usuarioNome: string | null;
};


export async function buscarSituacoesUnidades(): Promise<Unidade[]> {
    const resposta = await fetch(
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

    const resposta = await fetch(
        `${URL_BACKEND}/unidades/${unidadeId}/avaliacoes`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(dados),
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

    const resposta = await fetch(
        `${URL_BACKEND}/unidades/${unidadeId}/avaliacoes`
    );


    if (!resposta.ok) {
        throw new Error(
            `Erro ao buscar avaliações: ${resposta.status}`
        );
    }


    return resposta.json();
}