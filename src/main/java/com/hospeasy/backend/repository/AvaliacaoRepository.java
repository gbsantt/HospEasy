package com.hospeasy.backend.repository;

import com.hospeasy.backend.entity.Avaliacao;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface AvaliacaoRepository
        extends JpaRepository<Avaliacao, Long> {


    @org.springframework.data.jpa.repository.EntityGraph(attributePaths={"usuario","unidadeAtendimento"})
    List<Avaliacao>
    findByUnidadeAtendimentoIdOrderByCriadoEmDesc(
            Long unidadeId
    );


    @org.springframework.data.jpa.repository.EntityGraph(attributePaths={"usuario","unidadeAtendimento"})
    List<Avaliacao>
    findByUsuarioIdOrderByCriadoEmDesc(
            Long usuarioId
    );


    Optional<Avaliacao>
    findByIdAndUsuarioId(
            Long avaliacaoId,
            Long usuarioId
    );


    void
    deleteByUnidadeAtendimentoId(
            Long unidadeAtendimentoId
    );
}
