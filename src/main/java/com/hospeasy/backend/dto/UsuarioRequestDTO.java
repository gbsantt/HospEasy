package com.hospeasy.backend.dto;
import jakarta.validation.constraints.*;
import com.hospeasy.backend.entity.TipoUnidade;
import com.hospeasy.backend.entity.TipoUsuario;
import com.hospeasy.backend.validation.SenhaValida;
public record UsuarioRequestDTO(@NotBlank @Size(max=120) String nome, @NotBlank @Email @Size(max=180) String email, @NotBlank @Size(min=6,max=72) @SenhaValida String senha, @NotNull TipoUsuario tipo) {}
