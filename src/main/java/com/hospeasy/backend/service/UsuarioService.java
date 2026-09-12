package com.hospeasy.backend.service;
import com.hospeasy.backend.dto.*;
import com.hospeasy.backend.entity.*;
import com.hospeasy.backend.exception.*;
import com.hospeasy.backend.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
@Service
public class UsuarioService {
    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final RecuperacaoSenhaService recuperacao;
    private final String senhaFicticia;
    public UsuarioService(UsuarioRepository usuarios,PasswordEncoder encoder,JwtService jwt,RecuperacaoSenhaService recuperacao) {
        this.usuarios=usuarios; this.encoder=encoder; this.jwt=jwt; this.recuperacao=recuperacao;
        senhaFicticia=encoder.encode(UUID.randomUUID().toString());
    }
    @Transactional public UsuarioResponseDTO cadastrarUsuario(UsuarioRequestDTO dto) {
        return criar(dto.nome(),dto.email(),dto.senha(),dto.tipo());
    }
    @Transactional public UsuarioResponseDTO cadastrarUsuarioComum(CadastroUsuarioRequestDTO dto) {
        return criar(dto.nome(),dto.email(),dto.senha(),TipoUsuario.USUARIO);
    }
    private UsuarioResponseDTO criar(String nome,String email,String senha,TipoUsuario tipo) {
        email=normalizar(email);
        if(usuarios.existsByEmail(email)) throw new EmailJaCadastradoException();
        var u=new Usuario(); u.setNome(nome.trim()); u.setEmail(email); u.setSenhaHash(encoder.encode(senha));
        u.setTipo(tipo); u.setAtivo(true); return dto(usuarios.save(u));
    }
    public LoginResponseDTO login(LoginRequestDTO dto) {
        var u=usuarios.findByEmail(normalizar(dto.email())).orElse(null);
        boolean senhaOk=encoder.matches(dto.senha(),u==null?senhaFicticia:u.getSenhaHash());
        if(u==null || !senhaOk || !Boolean.TRUE.equals(u.getAtivo())) throw new CredenciaisInvalidasException();
        return new LoginResponseDTO(u.getId(),u.getNome(),u.getEmail(),u.getTipo(),jwt.gerarToken(u));
    }
    public List<UsuarioResponseDTO> listarUsuarios() {
        return usuarios.findAll().stream().sorted(Comparator.comparing(Usuario::getNome,String.CASE_INSENSITIVE_ORDER)).map(this::dto).toList();
    }
    public UsuarioResponseDTO buscarUsuarioPorId(Long id) {
        return dto(usuarios.findById(id).orElseThrow(()->new ApiException(404,"USUARIO_NAO_ENCONTRADO","Usuário não encontrado.")));
    }
    @Transactional public UsuarioResponseDTO atualizarUsuario(Long id,AtualizarUsuarioRequestDTO data,Usuario admin) {
        // Stable lock order serializes changes to the last-admin invariant.
        var all=usuarios.bloquearUsuarios();
        var u=all.stream().filter(x->x.getId().equals(id)).findFirst()
            .orElseThrow(()->new ApiException(404,"USUARIO_NAO_ENCONTRADO","Usuário não encontrado."));
        boolean self=admin!=null && admin.getId().equals(id);
        if(self && (data.tipo()!=TipoUsuario.ADMIN || !data.ativo()))
            throw new ApiException(409,"PROPRIO_ADMIN","Você não pode remover seu acesso administrativo ou desativar sua conta.");
        long admins=all.stream().filter(x->x.getTipo()==TipoUsuario.ADMIN && Boolean.TRUE.equals(x.getAtivo())).count();
        if(u.getTipo()==TipoUsuario.ADMIN && Boolean.TRUE.equals(u.getAtivo()) &&
            (data.tipo()!=TipoUsuario.ADMIN || !data.ativo()) && admins<=1)
            throw new ApiException(409,"ULTIMO_ADMIN","O sistema precisa possuir pelo menos um administrador ativo.");
        String email=normalizar(data.email());
        if(usuarios.existsByEmailAndIdNot(email,id)) throw new EmailJaCadastradoException();
        if(!Boolean.TRUE.equals(data.ativo()) && Boolean.TRUE.equals(u.getAtivo())) u.setAuthVersion(u.getAuthVersion()+1);
        u.setNome(data.nome().trim()); u.setEmail(email); u.setTipo(data.tipo()); u.setAtivo(data.ativo());
        return dto(usuarios.save(u));
    }
    public String solicitarRecuperacaoSenha(EsqueciSenhaRequestDTO dto) {
        recuperacao.solicitar(normalizar(dto.email()));
        return "Se existir uma conta elegível, você receberá as instruções por e-mail.";
    }
    public void verificarCodigoRecuperacao(VerificarCodigoRequestDTO dto) { recuperacao.verificar(normalizar(dto.email()),dto.codigo()); }
    public void redefinirSenha(RedefinirSenhaRequestDTO dto) { recuperacao.redefinir(normalizar(dto.email()),dto.codigo(),dto.novaSenha()); }
    private String normalizar(String value) { return value.trim().toLowerCase(Locale.ROOT); }
    private UsuarioResponseDTO dto(Usuario u) { return new UsuarioResponseDTO(u.getId(),u.getNome(),u.getEmail(),u.getTipo(),u.getAtivo()); }
}
