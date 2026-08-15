import { Unidade } from "../types/Unidade";

const URL_BACKEND = "http://localhost:8080";


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