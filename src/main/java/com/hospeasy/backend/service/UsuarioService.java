package com.hospeasy.backend.service;

import com.hospeasy.backend.dto.UsuarioRequestDTO;
import com.hospeasy.backend.dto.UsuarioResponseDTO;
import com.hospeasy.backend.entity.UnidadeAtendimento;
import com.hospeasy.backend.entity.Usuario;
import com.hospeasy.backend.repository.UnidadeAtendimentoRepository;
import com.hospeasy.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.hospeasy.backend.dto.LoginRequestDTO;
import com.hospeasy.backend.dto.LoginResponseDTO;
import com.hospeasy.backend.exception.CredenciaisInvalidasException;
import com.hospeasy.backend.exception.EmailJaCadastradoException;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final UnidadeAtendimentoRepository unidadeAtendimentoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            UnidadeAtendimentoRepository unidadeAtendimentoRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.unidadeAtendimentoRepository = unidadeAtendimentoRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public UsuarioResponseDTO cadastrarUsuario(UsuarioRequestDTO dto) {

        if (usuarioRepository.existsByEmail(dto.email())) {
            throw new EmailJaCadastradoException();
        }

        UnidadeAtendimento unidadeAtendimento = null;

        if (dto.unidadeId() != null) {
            unidadeAtendimento = unidadeAtendimentoRepository.findById(dto.unidadeId())
                    .orElseThrow(() ->
                            new RuntimeException("Unidade de atendimento não encontrada")
                    );
        }

        Usuario usuario = new Usuario();

        usuario.setNome(dto.nome());
        usuario.setEmail(dto.email());
        usuario.setSenhaHash(passwordEncoder.encode(dto.senha()));
        usuario.setTipo(dto.tipo());
        usuario.setAtivo(true);
        usuario.setUnidadeAtendimento(unidadeAtendimento);

        Usuario usuarioSalvo = usuarioRepository.save(usuario);

        return converterParaDTO(usuarioSalvo);
    }

    public LoginResponseDTO login(LoginRequestDTO dto) {

        Usuario usuario = usuarioRepository.findByEmail(dto.email())
                .orElseThrow(CredenciaisInvalidasException::new);

        if (!usuario.getAtivo()) {
            throw new RuntimeException("Usuário desativado");
        }

        if (!passwordEncoder.matches(
                dto.senha(),
                usuario.getSenhaHash()
        )) {
            throw new CredenciaisInvalidasException();
        }

        String token = jwtService.gerarToken(usuario);

        return new LoginResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTipo(),
                usuario.getUnidadeAtendimento() != null
                        ? usuario.getUnidadeAtendimento().getId()
                        : null,

                token
        );
    }

    private UsuarioResponseDTO converterParaDTO(Usuario usuario) {

        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTipo(),
                usuario.getAtivo(),

                usuario.getUnidadeAtendimento() != null
                        ? usuario.getUnidadeAtendimento().getId()
                        : null,

                usuario.getUnidadeAtendimento() != null
                        ? usuario.getUnidadeAtendimento().getNome()
                        : null
        );
    }
}