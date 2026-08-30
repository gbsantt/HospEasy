package com.hospeasy.backend.controller;

import com.hospeasy.backend.dto.AvaliacaoResponseDTO;
import com.hospeasy.backend.dto.CriarAvaliacaoRequestDTO;

import com.hospeasy.backend.entity.Usuario;

import com.hospeasy.backend.service.AvaliacaoService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping(
        "/unidades/{unidadeId}/avaliacoes"
)
public class AvaliacaoController {

    private final AvaliacaoService
            avaliacaoService;


    public AvaliacaoController(
            AvaliacaoService avaliacaoService
    ) {

        this.avaliacaoService =
                avaliacaoService;
    }


    @PostMapping
    public ResponseEntity<AvaliacaoResponseDTO>
    criarAvaliacao(

            @PathVariable
            Long unidadeId,

            @Valid
            @RequestBody
            CriarAvaliacaoRequestDTO dto,

            @AuthenticationPrincipal
            Usuario usuario
    ) {

        AvaliacaoResponseDTO avaliacao =
                avaliacaoService
                        .criarAvaliacao(
                                unidadeId,
                                dto,
                                usuario
                        );


        return ResponseEntity
                .status(
                        HttpStatus.CREATED
                )
                .body(
                        avaliacao
                );
    }


    /*
     * Continua público.
     *
     * Qualquer pessoa pode visualizar
     * avaliações da unidade.
     */
    @GetMapping
    public ResponseEntity<
            List<AvaliacaoResponseDTO>
            >
    listarAvaliacoes(
            @PathVariable
            Long unidadeId
    ) {

        return ResponseEntity.ok(
                avaliacaoService
                        .listarPorUnidade(
                                unidadeId
                        )
        );
    }
}