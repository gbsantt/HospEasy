package com.hospeasy.backend.dto;

import com.hospeasy.backend.entity.TipoUsuario;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AtualizarUsuarioRequestDTO(

        @NotBlank(message = "O nome é obrigatório")
        String nome,

        @NotBlank(message = "O e-mail é obrigatório")
        @Email(message = "E-mail inválido")
        String email,

        @NotNull(message = "O tipo de usuário é obrigatório")
        TipoUsuario tipo,

        @NotNull(message = "O status do usuário é obrigatório")
        Boolean ativo

) {
}