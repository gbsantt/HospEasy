package com.hospeasy.backend.controller;

import com.hospeasy.backend.dto.AvaliacaoResponseDTO;

import com.hospeasy.backend.entity.Usuario;

import com.hospeasy.backend.service.AvaliacaoService;

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
}