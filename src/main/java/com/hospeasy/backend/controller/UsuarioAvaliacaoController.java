package com.hospeasy.backend.controller;

import com.hospeasy.backend.dto.AtualizarAvaliacaoRequestDTO;
import com.hospeasy.backend.dto.AvaliacaoResponseDTO;

import com.hospeasy.backend.entity.Usuario;

import com.hospeasy.backend.service.AvaliacaoService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping(
        "/usuarios/me/avaliacoes"
)
public class UsuarioAvaliacaoController {

    private final AvaliacaoService
            avaliacaoService;


    public UsuarioAvaliacaoController(
            AvaliacaoService avaliacaoService
    ) {

        this.avaliacaoService =
                avaliacaoService;
    }


    @GetMapping
    public List<AvaliacaoResponseDTO>
    listarMinhasAvaliacoes(

            @AuthenticationPrincipal
            Usuario usuario
    ) {

        return avaliacaoService
                .listarPorUsuario(
                        usuario
                );
    }


    @PutMapping(
            "/{avaliacaoId}"
    )
    public ResponseEntity<AvaliacaoResponseDTO>
    atualizarAvaliacao(

            @PathVariable
            Long avaliacaoId,

            @Valid
            @RequestBody
            AtualizarAvaliacaoRequestDTO dto,

            @AuthenticationPrincipal
            Usuario usuario
    ) {

        return ResponseEntity.ok(

                avaliacaoService
                        .atualizarAvaliacao(
                                avaliacaoId,
                                dto,
                                usuario
                        )
        );
    }


    @DeleteMapping(
            "/{avaliacaoId}"
    )
    public ResponseEntity<Void>
    excluirAvaliacao(

            @PathVariable
            Long avaliacaoId,

            @AuthenticationPrincipal
            Usuario usuario
    ) {

        avaliacaoService
                .excluirAvaliacao(
                        avaliacaoId,
                        usuario
                );


        return ResponseEntity
                .noContent()
                .build();
    }
}