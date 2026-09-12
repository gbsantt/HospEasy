package com.hospeasy.backend.dto;
import com.hospeasy.backend.entity.StatusCamera;
import java.time.*;
public record DispositivoResponseDTO(Long id,String nome,Long unidadeId,boolean ativo,boolean chaveRevogada,
    StatusCamera status,LocalDateTime ultimaComunicacao,Instant chaveGeradaEm,Instant createdAt,Instant updatedAt,long version) {}
