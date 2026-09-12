package com.hospeasy.backend.repository;
import com.hospeasy.backend.entity.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.domain.*;
import java.util.Optional;
public interface SolicitacaoSuporteRepository extends JpaRepository<SolicitacaoSuporte,Long> {
    Optional<SolicitacaoSuporte> findByIdAndUsuarioId(Long id,Long usuarioId);
    @Query("select s from SolicitacaoSuporte s where (:usuarioId is null or s.usuario.id=:usuarioId) and (:status is null or s.status=:status) and (:categoria is null or s.categoria=:categoria)")
    Page<SolicitacaoSuporte> pesquisar(Long usuarioId,StatusSuporte status,CategoriaSuporte categoria,Pageable page);
}
