package com.hospeasy.backend.dto;
import jakarta.validation.constraints.*;
import com.hospeasy.backend.entity.TipoUnidade;
import com.hospeasy.backend.entity.TipoUsuario;
import com.hospeasy.backend.validation.SenhaValida;
public record LoginRequestDTO(@NotBlank @Email @Size(max=180) String email, @NotBlank @Size(max=72) @SenhaValida String senha) {}
