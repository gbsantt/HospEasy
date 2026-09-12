package com.hospeasy.backend.repository;
import com.hospeasy.backend.entity.UnidadeAtendimento;
import org.springframework.data.jpa.repository.*;
import jakarta.persistence.LockModeType;
import java.util.Optional;
public interface UnidadeAtendimentoRepository extends JpaRepository<UnidadeAtendimento,Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE) @Query("select u from UnidadeAtendimento u where u.id=:id")
    Optional<UnidadeAtendimento> bloquear(Long id);
}
