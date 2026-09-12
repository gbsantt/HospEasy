package com.hospeasy.backend.dto;
import com.hospeasy.backend.entity.StatusSuporte;
import jakarta.validation.constraints.NotNull;
public record AtualizarStatusSuporteRequestDTO(@NotNull StatusSuporte status,@NotNull Long version) {}
