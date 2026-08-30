package com.hospeasy.backend.repository;

import com.hospeasy.backend.entity.DispositivoCamera;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface DispositivoCameraRepository
        extends JpaRepository<DispositivoCamera, Long> {

    Optional<DispositivoCamera> findByChaveApi(
            String chaveApi
    );


    Optional<DispositivoCamera> findFirstByUnidadeAtendimentoId(
            Long unidadeId
    );


    boolean existsByChaveApi(
            String chaveApi
    );


    boolean existsByUnidadeAtendimentoId(
            Long unidadeId
    );
}
