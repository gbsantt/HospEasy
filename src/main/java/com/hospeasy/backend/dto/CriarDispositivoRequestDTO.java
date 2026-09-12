package com.hospeasy.backend.dto;
import jakarta.validation.constraints.*;
public record CriarDispositivoRequestDTO(@NotBlank @Size(max=100) String nome,@NotNull Boolean ativo) {}
