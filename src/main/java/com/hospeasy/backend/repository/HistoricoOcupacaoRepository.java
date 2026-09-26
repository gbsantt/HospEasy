package com.hospeasy.backend.repository;
import com.hospeasy.backend.entity.*;
import org.springframework.data.jpa.repository.*;
import java.time.LocalDateTime;
import java.util.*;
public interface HistoricoOcupacaoRepository extends JpaRepository<HistoricoOcupacao,Long> {
    boolean existsByDispositivoIdAndMedicaoId(Long dispositivoId,java.util.UUID medicaoId);
    List<HistoricoOcupacao> findTop100ByUnidadeAtendimentoIdOrderByRegistradoEmDesc(Long id);
    List<HistoricoOcupacao> findTop100ByUnidadeAtendimentoIdOrderByRegistradoEmDescIdDesc(Long id);
    interface Amostra { Long getUnidadeId(); Integer getQuantidadePessoas(); }
    @Query("select h.unidadeAtendimento.id as unidadeId, h.quantidadePessoas as quantidadePessoas from HistoricoOcupacao h where h.unidadeAtendimento.id in :ids and h.origem=com.hospeasy.backend.entity.OrigemMedicao.CAMERA and h.registradoEm>=:inicio order by h.registradoEm desc, h.id desc")
    List<Amostra> janela(Collection<Long> ids,LocalDateTime inicio);
    void deleteByUnidadeAtendimentoId(Long id);
}
