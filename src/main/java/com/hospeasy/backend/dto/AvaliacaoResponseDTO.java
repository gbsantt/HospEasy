package com.hospeasy.backend.dto;

import java.time.LocalDateTime;


public record AvaliacaoResponseDTO(

        Long id,

        Long unidadeId,

        String unidadeNome,

        Integer nota,

        String comentario,

        LocalDateTime criadoEm,

        Long usuarioId,

        String usuarioNome

) {
}