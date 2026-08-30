package com.hospeasy.backend.controller;

import com.hospeasy.backend.dto.FavoritoResponseDTO;

import com.hospeasy.backend.entity.Usuario;

import com.hospeasy.backend.service.FavoritoService;

import org.springframework.http.ResponseEntity;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/usuarios/me/favoritos")
public class FavoritoController {

    private final FavoritoService favoritoService;


    public FavoritoController(
            FavoritoService favoritoService
    ) {

        this.favoritoService =
                favoritoService;
    }


    @GetMapping
    public List<FavoritoResponseDTO> listar(
            @AuthenticationPrincipal
            Usuario usuario
    ) {

        return favoritoService.listar(
                usuario
        );
    }


    @PostMapping("/{unidadeId}")
    public FavoritoResponseDTO adicionar(
            @AuthenticationPrincipal
            Usuario usuario,

            @PathVariable
            Long unidadeId
    ) {

        return favoritoService.adicionar(
                usuario,
                unidadeId
        );
    }


    @DeleteMapping("/{unidadeId}")
    public ResponseEntity<Void> remover(
            @AuthenticationPrincipal
            Usuario usuario,

            @PathVariable
            Long unidadeId
    ) {

        favoritoService.remover(
                usuario,
                unidadeId
        );


        return ResponseEntity
                .noContent()
                .build();
    }
}