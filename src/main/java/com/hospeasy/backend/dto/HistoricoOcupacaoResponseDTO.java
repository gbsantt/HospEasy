package com.hospeasy.backend.dto;
import com.hospeasy.backend.entity.OrigemMedicao;
import java.time.LocalDateTime;
public record HistoricoOcupacaoResponseDTO(Long id,Long unidadeId,Integer quantidadePessoas,Double percentualOcupacao,LocalDateTime registradoEm,OrigemMedicao origem) {}
