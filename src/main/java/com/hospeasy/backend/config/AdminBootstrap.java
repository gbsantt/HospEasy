package com.hospeasy.backend.config;
import com.hospeasy.backend.entity.*;
import com.hospeasy.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
@Component
public class AdminBootstrap implements ApplicationRunner {
    private final UsuarioRepository usuarios;
    private final PasswordEncoder encoder;
    private final JdbcTemplate jdbc;
    private final String email,password;
    public AdminBootstrap(UsuarioRepository usuarios,PasswordEncoder encoder,JdbcTemplate jdbc,
        @Value("${app.bootstrap.email}") String email,@Value("${app.bootstrap.password}") String password) {
        this.usuarios=usuarios; this.encoder=encoder; this.jdbc=jdbc; this.email=email; this.password=password;
    }
    @Override @Transactional public void run(ApplicationArguments args) {
        if(email.isBlank() && password.isBlank()) return;
        if(email.isBlank() || password.length()<12 || password.getBytes(StandardCharsets.UTF_8).length>72 ||
            email.length()>180 || !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"))
            throw new IllegalStateException("Configuração de bootstrap inválida. Use e-mail válido e senha entre 12 caracteres e 72 bytes.");
        jdbc.execute("SELECT pg_advisory_xact_lock(684732901)");
        if(usuarios.countByTipoAndAtivoTrue(TipoUsuario.ADMIN)>0) return;
        if(usuarios.existsByEmail(email.trim().toLowerCase(Locale.ROOT)))
            throw new IllegalStateException("O e-mail de bootstrap já pertence a uma conta. Nenhuma permissão foi alterada.");
        var u=new Usuario(); u.setNome("Administrador"); u.setEmail(email.trim().toLowerCase(Locale.ROOT));
        u.setSenhaHash(encoder.encode(password)); u.setTipo(TipoUsuario.ADMIN); u.setAtivo(true); usuarios.save(u);
    }
}
