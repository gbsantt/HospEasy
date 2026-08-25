package com.hospeasy.backend.dto;

import com.hospeasy.backend.entity.TipoUsuario;


public record LoginResponseDTO(

        Long id,

        String nome,

        String email,

        TipoUsuario tipo,

        String token

) {
}