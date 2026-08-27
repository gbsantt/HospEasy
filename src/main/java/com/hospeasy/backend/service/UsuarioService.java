package com.hospeasy.backend.service;

import com.hospeasy.backend.dto.AtualizarUsuarioRequestDTO;
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

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;


@Service
public class UsuarioService {

    private final UsuarioRepository
            usuarioRepository;

    private final PasswordEncoder
            passwordEncoder;

    private final JwtService
            jwtService;

    private final EmailService
            emailService;


    /*
     * CÓDIGOS DE RECUPERAÇÃO
     */
    private final Map<
            String,
            CodigoRecuperacao
            > codigosRecuperacao =
            new ConcurrentHashMap<>();


    private final SecureRandom random =
            new SecureRandom();


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
     * =========================================================
     * CADASTRO ADMINISTRATIVO
     * =========================================================
     *
     * Somente ADMIN consegue acessar
     * esse endpoint pelo SecurityConfig.
     *
     * Pode criar:
     *
     * USUARIO
     * ADMIN
     */
    public UsuarioResponseDTO cadastrarUsuario(
            UsuarioRequestDTO dto
    ) {

        String email =
                normalizarEmail(
                        dto.email()
                );


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
                        .trim()
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
     * =========================================================
     * CADASTRO PÚBLICO
     * =========================================================
     *
     * Cadastro pelo app sempre cria
     * usuário comum.
     */
    public UsuarioResponseDTO cadastrarUsuarioComum(
            CadastroUsuarioRequestDTO dto
    ) {

        String email =
                normalizarEmail(
                        dto.email()
                );


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
                        .trim()
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
     * =========================================================
     * LOGIN
     * =========================================================
     */
    public LoginResponseDTO login(
            LoginRequestDTO dto
    ) {

        String email =
                normalizarEmail(
                        dto.email()
                );


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

                token
        );
    }


    /*
     * =========================================================
     * ADMIN - LISTAR USUÁRIOS
     * =========================================================
     */
    public List<UsuarioResponseDTO>
    listarUsuarios() {

        return usuarioRepository
                .findAll()
                .stream()
                .sorted(
                        Comparator.comparing(
                                Usuario::getNome,
                                String.CASE_INSENSITIVE_ORDER
                        )
                )
                .map(
                        this::converterParaDTO
                )
                .toList();
    }


    /*
     * =========================================================
     * ADMIN - BUSCAR USUÁRIO
     * =========================================================
     */
    public UsuarioResponseDTO buscarUsuarioPorId(
            Long id
    ) {

        Usuario usuario =
                buscarUsuario(
                        id
                );


        return converterParaDTO(
                usuario
        );
    }


    /*
     * =========================================================
     * ADMIN - ATUALIZAR USUÁRIO
     * =========================================================
     *
     * Atualiza:
     *
     * nome
     * email
     * tipo
     * status
     *
     * Mantém as proteções administrativas:
     *
     * - não pode rebaixar a própria conta
     * - não pode desativar a própria conta
     * - não pode remover o último ADMIN ativo
     */
    public UsuarioResponseDTO atualizarUsuario(

            Long id,

            AtualizarUsuarioRequestDTO dto,

            Usuario adminLogado

    ) {

        Usuario usuario =
                buscarUsuario(
                        id
                );


        String email =
                normalizarEmail(
                        dto.email()
                );


        /*
         * Verifica se o novo e-mail pertence
         * a OUTRO usuário.
         */
        if (
                usuarioRepository
                        .existsByEmailAndIdNot(
                                email,
                                id
                        )
        ) {

            throw new IllegalStateException(
                    "Este e-mail já está sendo utilizado por outro usuário"
            );
        }


        boolean propriaConta =
                adminLogado != null
                        &&
                        adminLogado
                                .getId()
                                .equals(
                                        usuario.getId()
                                );


        /*
         * O administrador logado não pode
         * remover o próprio acesso ADMIN.
         */
        if (
                propriaConta
                        &&
                        dto.tipo()
                                != TipoUsuario.ADMIN
        ) {

            throw new IllegalStateException(
                    "Você não pode remover seu próprio acesso de administrador"
            );
        }


        /*
         * O administrador logado não pode
         * desativar a própria conta.
         */
        if (
                propriaConta
                        &&
                        !dto.ativo()
        ) {

            throw new IllegalStateException(
                    "Você não pode desativar sua própria conta"
            );
        }


        /*
         * Verifica se esta alteração faria
         * um ADMIN ativo deixar de ser um
         * ADMIN ativo.
         *
         * Isso acontece quando:
         *
         * ADMIN -> USUARIO
         *
         * ou
         *
         * ativo -> inativo
         */
        boolean eraAdminAtivo =
                usuario.getTipo()
                        == TipoUsuario.ADMIN
                        &&
                        usuario.getAtivo();


        boolean continuaraAdminAtivo =
                dto.tipo()
                        == TipoUsuario.ADMIN
                        &&
                        dto.ativo();


        if (
                eraAdminAtivo
                        &&
                        !continuaraAdminAtivo
        ) {

            verificarSePodeRemoverAdmin();
        }


        usuario.setNome(
                dto.nome()
                        .trim()
        );


        usuario.setEmail(
                email
        );


        usuario.setTipo(
                dto.tipo()
        );


        usuario.setAtivo(
                dto.ativo()
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
     * =========================================================
     * SOLICITAR RECUPERAÇÃO
     * =========================================================
     */
    public String solicitarRecuperacaoSenha(
            EsqueciSenhaRequestDTO dto
    ) {

        String email =
                normalizarEmail(
                        dto.email()
                );


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


        return "Código de recuperação enviado para o e-mail";
    }


    /*
     * =========================================================
     * VERIFICAR CÓDIGO
     * =========================================================
     */
    public void verificarCodigoRecuperacao(
            VerificarCodigoRequestDTO dto
    ) {

        String email =
                normalizarEmail(
                        dto.email()
                );


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
     * =========================================================
     * REDEFINIR SENHA
     * =========================================================
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
                normalizarEmail(
                        dto.email()
                );


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
         * Código só funciona uma vez.
         */
        codigosRecuperacao.remove(
                email
        );
    }


    /*
     * =========================================================
     * AUXILIARES
     * =========================================================
     */
    private Usuario buscarUsuario(
            Long id
    ) {

        return usuarioRepository
                .findById(
                        id
                )
                .orElseThrow(
                        () ->
                                new RuntimeException(
                                        "Usuário não encontrado"
                                )
                );
    }


    private void verificarSePodeRemoverAdmin() {

        long administradoresAtivos =
                usuarioRepository
                        .countByTipoAndAtivoTrue(
                                TipoUsuario.ADMIN
                        );


        if (
                administradoresAtivos <= 1
        ) {

            throw new IllegalStateException(
                    "O sistema precisa possuir pelo menos um administrador ativo"
            );
        }
    }


    private String normalizarEmail(
            String email
    ) {

        return email
                .trim()
                .toLowerCase();
    }


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