export type TipoUnidade =
    | "UPA"
    | "PRONTO_ATENDIMENTO"
    | "PRONTO_SOCORRO";

export type UnidadeCadastro = {
    id: number; nome: string; endereco: string; telefone: string | null;
    capacidadeAreaMonitorada: number; ocupacaoAtual: number; percentualOcupacao: number;
    nivelOcupacao: string; latitude: number | null; longitude: number | null;
    ultimaAtualizacao: string | null; tipo: TipoUnidade;
};


export type Unidade = {

    unidadeId: number;

    nome: string;

    endereco: string;

    telefone: string | null;

    latitude: number | null;

    longitude: number | null;

    capacidadeAreaMonitorada: number;

    ocupacaoAtual: number;

    percentualOcupacao: number;

    nivelOcupacao: string;

    mediaUltimos30Minutos: number;

    tendencia: string;

    ritmoOcupacao: string;

    ultimaAtualizacao: string | null;

    statusMedicao: string;

    statusCamera: string;

    tipo: TipoUnidade;
};
