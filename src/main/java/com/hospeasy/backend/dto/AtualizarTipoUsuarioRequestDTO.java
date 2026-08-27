package com.hospeasy.backend.dto;

import com.hospeasy.backend.entity.TipoUsuario;

import jakarta.validation.constraints.NotNull;


public record AtualizarTipoUsuarioRequestDTO(

        @NotNull(message = "O tipo de usuário é obrigatório")
        TipoUsuario tipo

) {
}