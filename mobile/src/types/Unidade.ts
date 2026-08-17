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
};