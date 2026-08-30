package com.hospeasy.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;


public record AtualizarAvaliacaoRequestDTO(

        @Min(
                value = 1,
                message = "A nota mínima é 1"
        )
        @Max(
                value = 5,
                message = "A nota máxima é 5"
        )
        Integer nota,


        @Size(
                max = 500,
                message = "O comentário deve ter no máximo 500 caracteres"
        )
        String comentario

) {
}