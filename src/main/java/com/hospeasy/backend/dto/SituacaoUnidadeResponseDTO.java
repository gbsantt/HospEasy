package com.hospeasy.backend.dto;

import com.hospeasy.backend.entity.RitmoOcupacao;
import com.hospeasy.backend.entity.StatusCamera;
import com.hospeasy.backend.entity.StatusMedicao;
import com.hospeasy.backend.entity.TendenciaOcupacao;

import java.time.LocalDateTime;

public record SituacaoUnidadeResponseDTO(

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
        TendenciaOcupacao tendencia,
        LocalDateTime ultimaAtualizacao,
        StatusMedicao statusMedicao,
        StatusCamera statusCamera,
        RitmoOcupacao ritmoOcupacao

) {
}