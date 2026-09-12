package com.hospeasy.backend.dto;
import jakarta.validation.constraints.*;
import com.hospeasy.backend.entity.TipoUnidade;
import com.hospeasy.backend.entity.TipoUsuario;
import com.hospeasy.backend.validation.SenhaValida;
public record AtualizarAvaliacaoRequestDTO(@NotNull @Min(1) @Max(5) Integer nota, @Size(max=500) String comentario) {}
