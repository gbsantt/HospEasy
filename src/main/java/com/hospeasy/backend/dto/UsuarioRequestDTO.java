package com.hospeasy.backend.dto;

import com.hospeasy.backend.entity.TipoUsuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;


public record UsuarioRequestDTO(

        @NotBlank(message = "O nome é obrigatório")
        String nome,

        @NotBlank(message = "O email é obrigatório")
        @Email(message = "Email inválido")
        String email,

        @NotBlank(message = "A senha é obrigatória")
        @Size(
                min = 6,
                message = "A senha deve possuir no mínimo 6 caracteres"
        )
        String senha,

        @NotNull(message = "O tipo de usuário é obrigatório")
        TipoUsuario tipo

) {
}