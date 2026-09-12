package com.hospeasy.backend.repository;
import com.hospeasy.backend.entity.*;
import org.springframework.data.jpa.repository.*;
import java.time.LocalDateTime;
import java.util.*;
public interface HistoricoOcupacaoRepository extends JpaRepository<HistoricoOcupacao,Long> {
    boolean existsByDispositivoIdAndMedicaoId(Long dispositivoId,java.util.UUID medicaoId);
    List<HistoricoOcupacao> findTop100ByUnidadeAtendimentoIdOrderByRegistradoEmDesc(Long id);
    @Query("select h from HistoricoOcupacao h where h.unidadeAtendimento.id in :ids and h.origem=com.hospeasy.backend.entity.OrigemMedicao.CAMERA and h.registradoEm>=:inicio order by h.registradoEm desc")
    List<HistoricoOcupacao> janela(Collection<Long> ids,LocalDateTime inicio);
    void deleteByUnidadeAtendimentoId(Long id);
}
