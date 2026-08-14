package com.hospeasy.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record MedicaoCameraRequestDTO(

        @NotNull(message = "A quantidade de pessoas é obrigatória")
        @Min(value = 0, message = "A quantidade de pessoas não pode ser negativa")
        Integer quantidadePessoas

) {
}