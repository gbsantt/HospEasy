// CEPs remain part of the stored address; never concatenate unrelated address numbers.
export function correspondeBuscaUnidade(unidade:{nome:string;endereco:string},busca:string) {
    const texto=busca.trim().toLocaleLowerCase("pt-BR");
    if(!texto)return true;
    const cep=texto.match(/^(?:cep\s*:?\s*)?(\d{5})\s*-?\s*(\d{3})$/);
    if(cep) {
        const esperado=cep[1]+cep[2];
        const encontrados=unidade.endereco.matchAll(/(?:^|[^\d])(\d{5})\s*-?\s*(\d{3})(?!\d)/g);
        return Array.from(encontrados).some(match=>match[1]+match[2]===esperado);
    }
    return `${unidade.nome} ${unidade.endereco}`.toLocaleLowerCase("pt-BR").includes(texto);
}
