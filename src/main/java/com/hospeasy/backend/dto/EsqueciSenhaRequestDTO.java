package com.hospeasy.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EsqueciSenhaRequestDTO(

        @NotBlank
        @Email
        String email

) {
}