package com.hospeasy.backend.dto;

import com.hospeasy.backend.entity.TipoUsuario;

public record UsuarioResponseDTO(

        Long id,

        String nome,

        String email,

        TipoUsuario tipo,

        Boolean ativo,

        Long unidadeId,

        String unidadeNome

) {
}