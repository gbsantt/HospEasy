package com.hospeasy.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RedefinirSenhaRequestDTO(

        @NotBlank
        @Email
        String email,

        @NotBlank
        String codigo,

        @NotBlank
        @Size(min = 6)
        String novaSenha

) {
}