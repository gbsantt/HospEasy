package com.hospeasy.backend.repository;

import com.hospeasy.backend.entity.Favorito;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface FavoritoRepository
        extends JpaRepository<Favorito, Long> {


    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "unidade")
    List<Favorito>
    findByUsuarioIdOrderByIdDesc(
            Long usuarioId
    );


    Optional<Favorito>
    findByUsuarioIdAndUnidadeId(
            Long usuarioId,
            Long unidadeId
    );


    boolean
    existsByUsuarioIdAndUnidadeId(
            Long usuarioId,
            Long unidadeId
    );


    void
    deleteByUsuarioIdAndUnidadeId(
            Long usuarioId,
            Long unidadeId
    );


    void
    deleteByUnidadeId(
            Long unidadeId
    );
}
