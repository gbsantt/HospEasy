package com.hospeasy.backend.dto;

import com.hospeasy.backend.entity.TipoUnidade;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;


public record UnidadeAtendimentoRequestDTO(

        @NotBlank(message = "O nome da unidade é obrigatório")
        @Size(max = 150)
        String nome,

        @NotBlank(message = "O endereço é obrigatório")
        @Size(max = 255)
        String endereco,

        @Size(max = 20)
        String telefone,

        @NotNull(message = "A capacidade da área monitorada é obrigatória")
        @Min(
                value = 1,
                message = "A capacidade da área monitorada deve ser maior que zero"
        )
        Integer capacidadeAreaMonitorada,

        @NotNull(message = "O tipo da unidade é obrigatório")
        TipoUnidade tipo,

        @NotBlank(message = "O nome da câmera é obrigatório")
        @Size(
                max = 100,
                message = "O nome da câmera deve possuir no máximo 100 caracteres"
        )
        String nomeCamera

) {
}
