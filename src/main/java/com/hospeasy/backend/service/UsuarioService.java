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
import com.hospeasy.backend.entity.Usuario;

import com.hospeasy.backend.exception.CredenciaisInvalidasException;
import com.hospeasy.backend.exception.EmailJaCadastradoException;

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

    private final PasswordEncoder passwordEncoder;

    private final JwtService jwtService;

    private final EmailService emailService;


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

            PasswordEncoder passwordEncoder,

            JwtService jwtService,

            EmailService emailService

    ) {

        this.usuarioRepository =
                usuarioRepository;


        this.passwordEncoder =
                passwordEncoder;


        this.jwtService =
                jwtService;


        this.emailService =
                emailService;
    }


    /*
     * CADASTRO ADMINISTRATIVO.
     *
     * O tipo é escolhido pelo ADMIN.
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


        Usuario usuario =
                new Usuario();


        usuario.setNome(
                dto.nome()
        );


        usuario.setEmail(
                dto.email()
                        .trim()
                        .toLowerCase()
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


        Usuario usuarioSalvo =
                usuarioRepository.save(
                        usuario
                );


        return converterParaDTO(
                usuarioSalvo
        );
    }


    /*
     * CADASTRO PÚBLICO.
     *
     * Sempre cria USUARIO.
     */
    public UsuarioResponseDTO cadastrarUsuarioComum(
            CadastroUsuarioRequestDTO dto
    ) {

        String email =
                dto.email()
                        .trim()
                        .toLowerCase();


        if (
                usuarioRepository
                        .existsByEmail(
                                email
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
                email
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

                null,

                token
        );
    }


    /*
     * SOLICITAR RECUPERAÇÃO DE SENHA
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

                email,

                new CodigoRecuperacao(
                        codigo,
                        expiraEm
                )
        );


        emailService
                .enviarCodigoRecuperacao(
                        usuario.getEmail(),
                        codigo
                );


        /*
         * Ainda retorna enquanto estamos
         * testando.
         */
        return codigo;
    }


    /*
     * VERIFICAR CÓDIGO
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
     * REDEFINIR SENHA
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


        codigosRecuperacao.remove(
                email
        );
    }


    /*
     * ENTITY -> DTO
     */
    private UsuarioResponseDTO converterParaDTO(
            Usuario usuario
    ) {

        return new UsuarioResponseDTO(

                usuario.getId(),

                usuario.getNome(),

                usuario.getEmail(),

                usuario.getTipo(),

                usuario.getAtivo()
        );
    }
}