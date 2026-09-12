package com.hospeasy.backend.dto;
import jakarta.validation.constraints.*;
import com.hospeasy.backend.entity.TipoUnidade;
import com.hospeasy.backend.entity.TipoUsuario;
import com.hospeasy.backend.validation.SenhaValida;
public record AtualizarUnidadeRequestDTO(@NotBlank @Size(max=150) String nome, @NotBlank @Size(max=255) String endereco, @Size(max=20) String telefone,
    @NotNull @Min(1) Integer capacidadeAreaMonitorada, @NotNull TipoUnidade tipo,
    @DecimalMin("-90") @DecimalMax("90") Double latitude, @DecimalMin("-180") @DecimalMax("180") Double longitude) {}
