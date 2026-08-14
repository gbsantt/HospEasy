package com.hospeasy.backend.dto;

import java.time.LocalDateTime;

import com.hospeasy.backend.entity.OrigemMedicao;

public record HistoricoOcupacaoResponseDTO(

        Long id,
        Long unidadeId,
        Integer quantidadePessoas,
        Double percentualOcupacao,
        LocalDateTime registradoEm,
        Long registradoPorId,
        String registradoPorNome,
        OrigemMedicao origem

) {
}