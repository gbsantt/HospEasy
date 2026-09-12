package com.hospeasy.backend.dto;
import jakarta.validation.constraints.*;
public record AtualizarDispositivoRequestDTO(@NotBlank @Size(max=100) String nome,@NotNull Boolean ativo,@NotNull Long version) {}
