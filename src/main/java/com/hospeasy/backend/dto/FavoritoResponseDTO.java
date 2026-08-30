package com.hospeasy.backend.dto;


public record FavoritoResponseDTO(

        Long unidadeId,

        String nome,

        String endereco,

        String telefone,

        Double latitude,

        Double longitude,

        Integer capacidadeAreaMonitorada,

        Integer ocupacaoAtual,

        Double percentualOcupacao,

        String nivelOcupacao,

        Double mediaUltimos30Minutos,

        String tendencia,

        String ritmoOcupacao,

        String ultimaAtualizacao,

        String statusMedicao,

        String statusCamera

) {
}