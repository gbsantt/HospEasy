package com.hospeasy.backend.service;

import com.hospeasy.backend.dto.AtualizarAvaliacaoRequestDTO;
import com.hospeasy.backend.dto.AvaliacaoResponseDTO;
import com.hospeasy.backend.dto.CriarAvaliacaoRequestDTO;

import com.hospeasy.backend.entity.Avaliacao;
import com.hospeasy.backend.entity.UnidadeAtendimento;
import com.hospeasy.backend.entity.Usuario;

import com.hospeasy.backend.exception.UnidadeNaoEncontradaException;

import com.hospeasy.backend.repository.AvaliacaoRepository;
import com.hospeasy.backend.repository.UnidadeAtendimentoRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@Transactional(readOnly = true)
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


    @Transactional
    public AvaliacaoResponseDTO criarAvaliacao(
            Long unidadeId,
            CriarAvaliacaoRequestDTO dto,
            Usuario usuario
    ) {

        UnidadeAtendimento unidade =
                unidadeAtendimentoRepository
                        .findById(unidadeId)
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
                        .existsById(unidadeId)
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


    @Transactional
    public AvaliacaoResponseDTO atualizarAvaliacao(
            Long avaliacaoId,
            AtualizarAvaliacaoRequestDTO dto,
            Usuario usuario
    ) {

        Avaliacao avaliacao =
                avaliacaoRepository
                        .findByIdAndUsuarioId(
                                avaliacaoId,
                                usuario.getId()
                        )
                        .orElseThrow(
                                () -> new com.hospeasy.backend.exception.ApiException(404, "AVALIACAO_NAO_ENCONTRADA",
                                        "Avaliação não encontrada."
                                )
                        );


        avaliacao.setNota(
                dto.nota()
        );


        avaliacao.setComentario(
                dto.comentario()
        );


        Avaliacao avaliacaoAtualizada =
                avaliacaoRepository.save(
                        avaliacao
                );


        return converterParaDTO(
                avaliacaoAtualizada
        );
    }


    @Transactional
    public void excluirAvaliacao(
            Long avaliacaoId,
            Usuario usuario
    ) {

        Avaliacao avaliacao =
                avaliacaoRepository
                        .findByIdAndUsuarioId(
                                avaliacaoId,
                                usuario.getId()
                        )
                        .orElseThrow(
                                () -> new com.hospeasy.backend.exception.ApiException(404, "AVALIACAO_NAO_ENCONTRADA",
                                        "Avaliação não encontrada."
                                )
                        );


        avaliacaoRepository.delete(
                avaliacao
        );
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
