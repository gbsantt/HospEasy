package com.hospeasy.backend.dto;
import jakarta.validation.constraints.*;
import com.hospeasy.backend.entity.TipoUnidade;
import com.hospeasy.backend.entity.TipoUsuario;
import com.hospeasy.backend.validation.SenhaValida;
public record VerificarCodigoRequestDTO(@NotBlank @Email @Size(max=180) String email, @NotBlank @Pattern(regexp="[0-9]{6}") String codigo) {}
