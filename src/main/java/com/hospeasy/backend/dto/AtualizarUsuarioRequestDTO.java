package com.hospeasy.backend.dto;
import jakarta.validation.constraints.*;
import com.hospeasy.backend.entity.TipoUnidade;
import com.hospeasy.backend.entity.TipoUsuario;
import com.hospeasy.backend.validation.SenhaValida;
public record AtualizarUsuarioRequestDTO(@NotBlank @Size(max=120) String nome, @NotBlank @Email @Size(max=180) String email, @NotNull TipoUsuario tipo, @NotNull Boolean ativo) {}
