package com.hospeasy.backend.controller;

import com.hospeasy.backend.dto.UsuarioRequestDTO;
import com.hospeasy.backend.dto.UsuarioResponseDTO;
import com.hospeasy.backend.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import com.hospeasy.backend.dto.LoginRequestDTO;
import com.hospeasy.backend.dto.LoginResponseDTO;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public UsuarioResponseDTO cadastrarUsuario(
            @Valid @RequestBody UsuarioRequestDTO dto
    ) {
        return usuarioService.cadastrarUsuario(dto);
    }

    @PostMapping("/login")
    public LoginResponseDTO login(
            @Valid @RequestBody LoginRequestDTO dto
    ) {
        return usuarioService.login(dto);
    }
}