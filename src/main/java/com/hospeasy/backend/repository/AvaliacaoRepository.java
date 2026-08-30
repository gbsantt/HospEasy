package com.hospeasy.backend.repository;

import com.hospeasy.backend.entity.Avaliacao;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface AvaliacaoRepository
        extends JpaRepository<Avaliacao, Long> {


    List<Avaliacao>
    findByUnidadeAtendimentoIdOrderByCriadoEmDesc(
            Long unidadeId
    );


    List<Avaliacao>
    findByUsuarioIdOrderByCriadoEmDesc(
            Long usuarioId
    );
}