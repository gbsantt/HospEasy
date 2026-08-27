package com.hospeasy.backend.dto;

import com.hospeasy.backend.entity.TipoUnidade;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record AtualizarUnidadeRequestDTO(

        @NotBlank(message = "O nome é obrigatório")
        String nome,

        @NotBlank(message = "O endereço é obrigatório")
        String endereco,

        @Size(max = 20, message = "O telefone deve possuir no máximo 20 caracteres")
        String telefone,

        @NotNull(message = "A capacidade da área monitorada é obrigatória")
        @Positive(message = "A capacidade da área monitorada deve ser maior que zero")
        Integer capacidadeAreaMonitorada,

        @DecimalMin(value = "-90.0", message = "Latitude inválida")
        @DecimalMax(value = "90.0", message = "Latitude inválida")
        Double latitude,

        @DecimalMin(value = "-180.0", message = "Longitude inválida")
        @DecimalMax(value = "180.0", message = "Longitude inválida")
        Double longitude,

        @NotNull(message = "O tipo da unidade é obrigatório")
        TipoUnidade tipo

) {
}