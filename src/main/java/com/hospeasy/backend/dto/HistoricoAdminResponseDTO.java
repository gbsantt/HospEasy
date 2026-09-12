package com.hospeasy.backend.dto;
import com.hospeasy.backend.entity.OrigemMedicao;
import java.time.LocalDateTime;
public record HistoricoAdminResponseDTO(Long id,Integer quantidadePessoas,Double percentualOcupacao,LocalDateTime registradoEm,OrigemMedicao origem,Long dispositivoId,Long operadorId) {}
