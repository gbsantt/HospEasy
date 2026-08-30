package com.hospeasy.backend.service;

import com.hospeasy.backend.dto.FavoritoResponseDTO;

import com.hospeasy.backend.entity.Favorito;
import com.hospeasy.backend.entity.UnidadeAtendimento;
import com.hospeasy.backend.entity.Usuario;

import com.hospeasy.backend.repository.FavoritoRepository;
import com.hospeasy.backend.repository.UnidadeAtendimentoRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
public class FavoritoService {

    private final FavoritoRepository favoritoRepository;

    private final UnidadeAtendimentoRepository
            unidadeAtendimentoRepository;


    public FavoritoService(
            FavoritoRepository favoritoRepository,
            UnidadeAtendimentoRepository unidadeAtendimentoRepository
    ) {

        this.favoritoRepository =
                favoritoRepository;

        this.unidadeAtendimentoRepository =
                unidadeAtendimentoRepository;
    }


    public List<FavoritoResponseDTO> listar(
            Usuario usuario
    ) {

        return favoritoRepository
                .findByUsuarioIdOrderByIdDesc(
                        usuario.getId()
                )
                .stream()
                .map(
                        favorito ->
                                converterParaDTO(
                                        favorito.getUnidade()
                                )
                )
                .toList();
    }


    @Transactional
    public FavoritoResponseDTO adicionar(
            Usuario usuario,
            Long unidadeId
    ) {

        boolean jaExiste =
                favoritoRepository
                        .existsByUsuarioIdAndUnidadeId(
                                usuario.getId(),
                                unidadeId
                        );


        if (jaExiste) {

            UnidadeAtendimento unidade =
                    unidadeAtendimentoRepository
                            .findById(
                                    unidadeId
                            )
                            .orElseThrow(
                                    () ->
                                            new RuntimeException(
                                                    "Unidade não encontrada"
                                            )
                            );


            return converterParaDTO(
                    unidade
            );
        }


        UnidadeAtendimento unidade =
                unidadeAtendimentoRepository
                        .findById(
                                unidadeId
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Unidade não encontrada"
                                        )
                        );


        Favorito favorito =
                new Favorito();


        favorito.setUsuario(
                usuario
        );

        favorito.setUnidade(
                unidade
        );


        favoritoRepository.save(
                favorito
        );


        return converterParaDTO(
                unidade
        );
    }


    @Transactional
    public void remover(
            Usuario usuario,
            Long unidadeId
    ) {

        favoritoRepository
                .deleteByUsuarioIdAndUnidadeId(
                        usuario.getId(),
                        unidadeId
                );
    }


    private FavoritoResponseDTO converterParaDTO(
            UnidadeAtendimento unidade
    ) {

        int capacidade =
                unidade
                        .getCapacidadeAreaMonitorada() != null
                        ? unidade
                        .getCapacidadeAreaMonitorada()
                        : 0;


        int ocupacao =
                unidade.getOcupacaoAtual() != null
                        ? unidade
                        .getOcupacaoAtual()
                        : 0;


        double percentual =
                capacidade > 0
                        ? (
                        ocupacao * 100.0 /
                                capacidade
                )
                        : 0.0;


        String nivelOcupacao;

        if (percentual >= 80) {

            nivelOcupacao =
                    "ALTA";

        } else if (
                percentual >= 50
        ) {

            nivelOcupacao =
                    "MODERADA";

        } else {

            nivelOcupacao =
                    "BAIXA";
        }


        return new FavoritoResponseDTO(

                unidade.getId(),

                unidade.getNome(),

                unidade.getEndereco(),

                unidade.getTelefone(),

                unidade.getLatitude(),

                unidade.getLongitude(),

                capacidade,

                ocupacao,

                percentual,

                nivelOcupacao,

                percentual,

                "ESTAVEL",

                "NORMAL",

                unidade.getUltimaAtualizacao() != null
                        ? unidade
                        .getUltimaAtualizacao()
                        .toString()
                        : null,

                "ATUALIZADA",

                "ONLINE"
        );
    }
}