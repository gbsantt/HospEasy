package com.hospeasy.backend.service;

import com.hospeasy.backend.dto.AvaliacaoResponseDTO;
import com.hospeasy.backend.dto.CriarAvaliacaoRequestDTO;

import com.hospeasy.backend.entity.Avaliacao;
import com.hospeasy.backend.entity.UnidadeAtendimento;
import com.hospeasy.backend.entity.Usuario;

import com.hospeasy.backend.exception.UnidadeNaoEncontradaException;

import com.hospeasy.backend.repository.AvaliacaoRepository;
import com.hospeasy.backend.repository.UnidadeAtendimentoRepository;

import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class AvaliacaoService {

    private final AvaliacaoRepository
            avaliacaoRepository;

    private final UnidadeAtendimentoRepository
            unidadeAtendimentoRepository;


    public AvaliacaoService(
            AvaliacaoRepository avaliacaoRepository,
            UnidadeAtendimentoRepository unidadeAtendimentoRepository
    ) {

        this.avaliacaoRepository =
                avaliacaoRepository;

        this.unidadeAtendimentoRepository =
                unidadeAtendimentoRepository;
    }


    public AvaliacaoResponseDTO criarAvaliacao(
            Long unidadeId,
            CriarAvaliacaoRequestDTO dto,
            Usuario usuario
    ) {

        UnidadeAtendimento unidade =
                unidadeAtendimentoRepository
                        .findById(
                                unidadeId
                        )
                        .orElseThrow(
                                UnidadeNaoEncontradaException::new
                        );


        Avaliacao avaliacao =
                new Avaliacao();


        avaliacao.setNota(
                dto.nota()
        );


        avaliacao.setComentario(
                dto.comentario()
        );


        avaliacao.setUnidadeAtendimento(
                unidade
        );


        /*
         * Agora a avaliação pertence
         * ao usuário autenticado.
         */
        avaliacao.setUsuario(
                usuario
        );


        Avaliacao avaliacaoSalva =
                avaliacaoRepository.save(
                        avaliacao
                );


        return converterParaDTO(
                avaliacaoSalva
        );
    }


    public List<AvaliacaoResponseDTO>
    listarPorUnidade(
            Long unidadeId
    ) {

        if (
                !unidadeAtendimentoRepository
                        .existsById(
                                unidadeId
                        )
        ) {

            throw new UnidadeNaoEncontradaException();
        }


        return avaliacaoRepository
                .findByUnidadeAtendimentoIdOrderByCriadoEmDesc(
                        unidadeId
                )
                .stream()
                .map(
                        this::converterParaDTO
                )
                .toList();
    }


    public List<AvaliacaoResponseDTO>
    listarPorUsuario(
            Usuario usuario
    ) {

        return avaliacaoRepository
                .findByUsuarioIdOrderByCriadoEmDesc(
                        usuario.getId()
                )
                .stream()
                .map(
                        this::converterParaDTO
                )
                .toList();
    }


    private AvaliacaoResponseDTO
    converterParaDTO(
            Avaliacao avaliacao
    ) {

        return new AvaliacaoResponseDTO(

                avaliacao.getId(),

                avaliacao
                        .getUnidadeAtendimento()
                        .getId(),

                avaliacao
                        .getUnidadeAtendimento()
                        .getNome(),

                avaliacao.getNota(),

                avaliacao.getComentario(),

                avaliacao.getCriadoEm(),

                avaliacao.getUsuario() != null
                        ? avaliacao
                        .getUsuario()
                        .getId()
                        : null,

                avaliacao.getUsuario() != null
                        ? avaliacao
                        .getUsuario()
                        .getNome()
                        : null
        );
    }
}