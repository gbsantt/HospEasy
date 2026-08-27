package com.hospeasy.backend.controller;

import com.hospeasy.backend.dto.AtualizarUsuarioRequestDTO;
import com.hospeasy.backend.dto.CadastroUsuarioRequestDTO;
import com.hospeasy.backend.dto.EsqueciSenhaRequestDTO;
import com.hospeasy.backend.dto.LoginRequestDTO;
import com.hospeasy.backend.dto.LoginResponseDTO;
import com.hospeasy.backend.dto.RedefinirSenhaRequestDTO;
import com.hospeasy.backend.dto.UsuarioRequestDTO;
import com.hospeasy.backend.dto.UsuarioResponseDTO;
import com.hospeasy.backend.dto.VerificarCodigoRequestDTO;

import com.hospeasy.backend.entity.Usuario;

import com.hospeasy.backend.service.UsuarioService;

import jakarta.validation.Valid;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;


    public UsuarioController(
            UsuarioService usuarioService
    ) {

        this.usuarioService =
                usuarioService;
    }


    /*
     * =========================================================
     * ADMIN - LISTAR USUÁRIOS
     * =========================================================
     */
    @GetMapping
    public List<UsuarioResponseDTO> listarUsuarios() {

        return usuarioService
                .listarUsuarios();
    }


    /*
     * =========================================================
     * ADMIN - BUSCAR USUÁRIO
     * =========================================================
     */
    @GetMapping("/{id}")
    public UsuarioResponseDTO buscarUsuario(
            @PathVariable Long id
    ) {

        return usuarioService
                .buscarUsuarioPorId(
                        id
                );
    }


    /*
     * =========================================================
     * ADMIN - CADASTRAR USUÁRIO
     * =========================================================
     */
    @PostMapping
    public UsuarioResponseDTO cadastrarUsuario(

            @Valid
            @RequestBody
            UsuarioRequestDTO dto

    ) {

        return usuarioService
                .cadastrarUsuario(
                        dto
                );
    }


    /*
     * =========================================================
     * ADMIN - ATUALIZAR USUÁRIO
     * =========================================================
     */
    @PutMapping("/{id}")
    public UsuarioResponseDTO atualizarUsuario(

            @PathVariable Long id,

            @Valid
            @RequestBody
            AtualizarUsuarioRequestDTO dto,

            @AuthenticationPrincipal
            Usuario adminLogado

    ) {

        return usuarioService
                .atualizarUsuario(
                        id,
                        dto,
                        adminLogado
                );
    }


    /*
     * =========================================================
     * CADASTRO PÚBLICO DO APP
     * =========================================================
     */
    @PostMapping("/cadastro")
    public UsuarioResponseDTO cadastrarUsuarioComum(

            @Valid
            @RequestBody
            CadastroUsuarioRequestDTO dto

    ) {

        return usuarioService
                .cadastrarUsuarioComum(
                        dto
                );
    }


    /*
     * =========================================================
     * LOGIN
     * =========================================================
     */
    @PostMapping("/login")
    public LoginResponseDTO login(

            @Valid
            @RequestBody
            LoginRequestDTO dto

    ) {

        return usuarioService
                .login(
                        dto
                );
    }


    /*
     * =========================================================
     * SOLICITAR RECUPERAÇÃO DE SENHA
     * =========================================================
     */
    @PostMapping("/esqueci-senha")
    public String esqueciSenha(

            @Valid
            @RequestBody
            EsqueciSenhaRequestDTO dto

    ) {

        return usuarioService
                .solicitarRecuperacaoSenha(
                        dto
                );
    }


    /*
     * =========================================================
     * VERIFICAR CÓDIGO
     * =========================================================
     */
    @PostMapping("/verificar-codigo")
    public void verificarCodigo(

            @Valid
            @RequestBody
            VerificarCodigoRequestDTO dto

    ) {

        usuarioService
                .verificarCodigoRecuperacao(
                        dto
                );
    }


    /*
     * =========================================================
     * REDEFINIR SENHA
     * =========================================================
     */
    @PostMapping("/redefinir-senha")
    public void redefinirSenha(

            @Valid
            @RequestBody
            RedefinirSenhaRequestDTO dto

    ) {

        usuarioService
                .redefinirSenha(
                        dto
                );
    }
}