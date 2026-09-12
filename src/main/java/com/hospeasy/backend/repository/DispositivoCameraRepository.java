package com.hospeasy.backend.repository;
import com.hospeasy.backend.entity.DispositivoCamera;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.util.*;
public interface DispositivoCameraRepository extends JpaRepository<DispositivoCamera,Long> {
    Optional<DispositivoCamera> findByChaveHash(String hash);
    @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select d from DispositivoCamera d where d.id=:id")
    Optional<DispositivoCamera> bloquear(Long id);
    List<DispositivoCamera> findByUnidadeAtendimentoIdOrderById(Long id);
    List<DispositivoCamera> findByUnidadeAtendimentoIdIn(Collection<Long> ids);
    boolean existsByUnidadeAtendimentoIdAndAtivoTrueAndIdNot(Long unidadeId,Long id);
    void deleteByUnidadeAtendimentoId(Long id);
}
