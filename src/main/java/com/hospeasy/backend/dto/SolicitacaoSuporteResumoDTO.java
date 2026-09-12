package com.hospeasy.backend.dto;
import com.hospeasy.backend.entity.*;
import java.time.Instant;
public record SolicitacaoSuporteResumoDTO(Long id,String assunto,CategoriaSuporte categoria,StatusSuporte status,Instant createdAt,Instant updatedAt) {}
