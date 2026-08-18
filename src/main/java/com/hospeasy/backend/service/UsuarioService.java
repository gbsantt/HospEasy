package com.hospeasy.backend.service;

import com.hospeasy.backend.dto.CadastroUsuarioRequestDTO;
import com.hospeasy.backend.dto.EsqueciSenhaRequestDTO;
import com.hospeasy.backend.dto.LoginRequestDTO;
import com.hospeasy.backend.dto.LoginResponseDTO;
import com.hospeasy.backend.dto.RedefinirSenhaRequestDTO;
import com.hospeasy.backend.dto.UsuarioRequestDTO;
import com.hospeasy.backend.dto.UsuarioResponseDTO;
import com.hospeasy.backend.dto.VerificarCodigoRequestDTO;

import com.hospeasy.backend.entity.TipoUsuario;
import com.hospeasy.backend.entity.UnidadeAtendimento;
import com.hospeasy.backend.entity.Usuario;

import com.hospeasy.backend.exception.CredenciaisInvalidasException;
import com.hospeasy.backend.exception.EmailJaCadastradoException;

import com.hospeasy.backend.repository.UnidadeAtendimentoRepository;
import com.hospeasy.backend.repository.UsuarioRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;


@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    private final UnidadeAtendimentoRepository
            unidadeAtendimentoRepository;

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;


    /*
     * Recuperação de senha.
     *
     * Por enquanto os códigos ficam em memória.
     * Depois podemos mover isso para banco ou
     * cache e enviar o código por e-mail.
     */
    private final Map<
            String,
            CodigoRecuperacao
            > codigosRecuperacao =
            new ConcurrentHashMap<>();


    private final Random random =
            new Random();


    private record CodigoRecuperacao(

            String codigo,

            LocalDateTime expiraEm

    ) {
    }


    public UsuarioService(

            UsuarioRepository usuarioRepository,

            UnidadeAtendimentoRepository
                    unidadeAtendimentoRepository,

            PasswordEncoder passwordEncoder,

            JwtService jwtService

    ) {

        this.usuarioRepository =
                usuarioRepository;


        this.unidadeAtendimentoRepository =
                unidadeAtendimentoRepository;


        this.passwordEncoder =
                passwordEncoder;


        this.jwtService =
                jwtService;
    }


    /*
     * CADASTRO ADMINISTRATIVO
     */
    public UsuarioResponseDTO cadastrarUsuario(
            UsuarioRequestDTO dto
    ) {

        if (
                usuarioRepository
                        .existsByEmail(
                                dto.email()
                        )
        ) {

            throw new EmailJaCadastradoException();
        }


        UnidadeAtendimento unidadeAtendimento =
                null;


        if (
                dto.unidadeId() != null
        ) {

            unidadeAtendimento =
                    unidadeAtendimentoRepository
                            .findById(
                                    dto.unidadeId()
                            )
                            .orElseThrow(
                                    () ->
                                            new RuntimeException(
                                                    "Unidade de atendimento não encontrada"
                                            )
                            );
        }


        Usuario usuario =
                new Usuario();


        usuario.setNome(
                dto.nome()
        );


        usuario.setEmail(
                dto.email()
        );


        usuario.setSenhaHash(
                passwordEncoder.encode(
                        dto.senha()
                )
        );


        usuario.setTipo(
                dto.tipo()
        );


        usuario.setAtivo(
                true
        );


        usuario.setUnidadeAtendimento(
                unidadeAtendimento
        );


        Usuario usuarioSalvo =
                usuarioRepository.save(
                        usuario
                );


        return converterParaDTO(
                usuarioSalvo
        );
    }


    /*
     * CADASTRO DE USUÁRIO COMUM
     */
    public UsuarioResponseDTO cadastrarUsuarioComum(
            CadastroUsuarioRequestDTO dto
    ) {

        if (
                usuarioRepository
                        .existsByEmail(
                                dto.email()
                        )
        ) {

            throw new EmailJaCadastradoException();
        }


        Usuario usuario =
                new Usuario();


        usuario.setNome(
                dto.nome()
        );


        usuario.setEmail(
                dto.email()
        );


        usuario.setSenhaHash(
                passwordEncoder.encode(
                        dto.senha()
                )
        );


        usuario.setTipo(
                TipoUsuario.USUARIO
        );


        usuario.setAtivo(
                true
        );


        usuario.setUnidadeAtendimento(
                null
        );


        Usuario usuarioSalvo =
                usuarioRepository.save(
                        usuario
                );


        return converterParaDTO(
                usuarioSalvo
        );
    }


    /*
     * LOGIN
     */
    public LoginResponseDTO login(
            LoginRequestDTO dto
    ) {

        Usuario usuario =
                usuarioRepository
                        .findByEmail(
                                dto.email()
                        )
                        .orElseThrow(
                                CredenciaisInvalidasException::new
                        );


        if (
                !usuario.getAtivo()
        ) {

            throw new RuntimeException(
                    "Usuário desativado"
            );
        }


        if (
                !passwordEncoder.matches(
                        dto.senha(),
                        usuario.getSenhaHash()
                )
        ) {

            throw new CredenciaisInvalidasException();
        }


        String token =
                jwtService
                        .gerarToken(
                                usuario
                        );


        return new LoginResponseDTO(

                usuario.getId(),

                usuario.getNome(),

                usuario.getEmail(),

                usuario.getTipo(),

                usuario.getUnidadeAtendimento()
                        != null
                        ? usuario
                        .getUnidadeAtendimento()
                        .getId()
                        : null,

                token
        );
    }


    /*
     * SOLICITAR RECUPERAÇÃO DE SENHA
     *
     * Por enquanto retorna o código.
     * Isso é útil para testar no Postman.
     *
     * Depois podemos substituir esse return
     * por envio real por e-mail.
     */
    public String solicitarRecuperacaoSenha(
            EsqueciSenhaRequestDTO dto
    ) {

        String email =
                dto.email()
                        .trim()
                        .toLowerCase();


        Usuario usuario =
                usuarioRepository
                        .findByEmail(
                                email
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Usuário não encontrado"
                                        )
                        );


        String codigo =
                String.format(
                        "%06d",
                        random.nextInt(
                                1_000_000
                        )
                );


        LocalDateTime expiraEm =
                LocalDateTime
                        .now()
                        .plusMinutes(
                                10
                        );


        codigosRecuperacao.put(

                usuario.getEmail(),

                new CodigoRecuperacao(
                        codigo,
                        expiraEm
                )
        );


        return codigo;
    }


    /*
     * VERIFICA SE O CÓDIGO EXISTE,
     * ESTÁ CORRETO E NÃO EXPIROU.
     */
    public void verificarCodigoRecuperacao(
            VerificarCodigoRequestDTO dto
    ) {

        String email =
                dto.email()
                        .trim()
                        .toLowerCase();


        CodigoRecuperacao recuperacao =
                codigosRecuperacao
                        .get(
                                email
                        );


        if (
                recuperacao == null
        ) {

            throw new RuntimeException(
                    "Código de recuperação inválido"
            );
        }


        if (
                LocalDateTime
                        .now()
                        .isAfter(
                                recuperacao.expiraEm()
                        )
        ) {

            codigosRecuperacao.remove(
                    email
            );


            throw new RuntimeException(
                    "Código expirado"
            );
        }


        if (
                !recuperacao
                        .codigo()
                        .equals(
                                dto.codigo()
                        )
        ) {

            throw new RuntimeException(
                    "Código de recuperação inválido"
            );
        }
    }


    /*
     * REDEFINE A SENHA.
     */
    public void redefinirSenha(
            RedefinirSenhaRequestDTO dto
    ) {

        verificarCodigoRecuperacao(

                new VerificarCodigoRequestDTO(
                        dto.email(),
                        dto.codigo()
                )
        );


        String email =
                dto.email()
                        .trim()
                        .toLowerCase();


        Usuario usuario =
                usuarioRepository
                        .findByEmail(
                                email
                        )
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Usuário não encontrado"
                                        )
                        );


        usuario.setSenhaHash(

                passwordEncoder.encode(
                        dto.novaSenha()
                )
        );


        usuarioRepository.save(
                usuario
        );


        /*
         * Depois de usar o código,
         * removemos para não poder
         * reutilizar.
         */
        codigosRecuperacao.remove(
                email
        );
    }


    /*
     * CONVERTER ENTITY → DTO
     */
    private UsuarioResponseDTO converterParaDTO(
            Usuario usuario
    ) {

        return new UsuarioResponseDTO(

                usuario.getId(),

                usuario.getNome(),

                usuario.getEmail(),

                usuario.getTipo(),

                usuario.getAtivo(),

                usuario.getUnidadeAtendimento()
                        != null
                        ? usuario
                        .getUnidadeAtendimento()
                        .getId()
                        : null,

                usuario.getUnidadeAtendimento()
                        != null
                        ? usuario
                        .getUnidadeAtendimento()
                        .getNome()
                        : null
        );
    }
}