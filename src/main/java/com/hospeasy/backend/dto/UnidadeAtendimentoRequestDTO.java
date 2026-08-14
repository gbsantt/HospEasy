package com.hospeasy.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import com.hospeasy.backend.entity.TipoUnidade;

public record UnidadeAtendimentoRequestDTO(

        @NotBlank(message = "O nome da Unidade é obrigatória")
        @Size(max = 150)
        String nome,

        @NotBlank(message = "O endereço é obrigatório")
        @Size(max = 255)
        String endereco,

        @Size(max = 20)
        String telefone,

        @NotNull(message = "A capacidade da área monitorada é obrigatória")
        @Min(value = 1, message = "A capacidade da área monitorada deve ser maior que zero")
        Integer capacidadeAreaMonitorada,

        Double latitude,

        Double longitude,

        @NotNull(message = "O tipo da unidade é obrigatório")
                TipoUnidade tipo
) {
}