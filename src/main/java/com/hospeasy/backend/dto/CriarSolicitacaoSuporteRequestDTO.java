package com.hospeasy.backend.dto;
import com.hospeasy.backend.entity.CategoriaSuporte;
import jakarta.validation.constraints.*;
public record CriarSolicitacaoSuporteRequestDTO(@NotBlank @Size(max=150) String assunto,
    @NotNull CategoriaSuporte categoria,@NotBlank @Size(max=5000) String descricao) {}
