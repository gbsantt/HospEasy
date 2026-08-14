package com.hospeasy.backend.repository;

import com.hospeasy.backend.entity.HistoricoOcupacao;
import com.hospeasy.backend.entity.OrigemMedicao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface HistoricoOcupacaoRepository
        extends JpaRepository<HistoricoOcupacao, Long> {

    List<HistoricoOcupacao> findByUnidadeAtendimentoIdOrderByRegistradoEmDesc(
            Long unidadeAtendimentoId
    );

    List<HistoricoOcupacao> findTop10ByUnidadeAtendimentoIdAndOrigemOrderByRegistradoEmDesc(
            Long unidadeAtendimentoId,
            OrigemMedicao origem
    );

    List<HistoricoOcupacao> findByUnidadeAtendimentoIdAndOrigemAndRegistradoEmAfterOrderByRegistradoEmDesc(
            Long unidadeAtendimentoId,
            OrigemMedicao origem,
            LocalDateTime registradoEm
    );

    Optional<HistoricoOcupacao> findFirstByUnidadeAtendimentoIdAndOrigemOrderByRegistradoEmDesc(
            Long unidadeAtendimentoId,
            OrigemMedicao origem
    );
}