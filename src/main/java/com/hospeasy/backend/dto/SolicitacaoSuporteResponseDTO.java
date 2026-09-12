package com.hospeasy.backend.dto;
import com.hospeasy.backend.entity.*;
import java.time.Instant;
public record SolicitacaoSuporteResponseDTO(Long id,String assunto,CategoriaSuporte categoria,String descricao,StatusSuporte status,Instant createdAt,Instant updatedAt,long version) {}
