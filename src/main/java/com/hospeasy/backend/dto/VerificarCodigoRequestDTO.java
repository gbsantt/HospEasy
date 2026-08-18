package com.hospeasy.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record VerificarCodigoRequestDTO(

        @NotBlank
        @Email
        String email,

        @NotBlank
        String codigo

) {
}