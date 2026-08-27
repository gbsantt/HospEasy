package com.hospeasy.backend.dto;

import jakarta.validation.constraints.NotNull;


public record AtualizarStatusUsuarioRequestDTO(

        @NotNull(message = "O status do usuário é obrigatório")
        Boolean ativo

) {
}