package com.hospeasy.backend.dto;

import com.hospeasy.backend.entity.TendenciaOcupacao;
import com.hospeasy.backend.entity.StatusMedicao;
import java.time.LocalDateTime;
import com.hospeasy.backend.entity.StatusCamera;
import com.hospeasy.backend.entity.RitmoOcupacao;

public record SituacaoUnidadeResponseDTO(

        Long unidadeId,
        String nome,
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