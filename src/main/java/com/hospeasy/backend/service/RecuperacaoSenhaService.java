package com.hospeasy.backend.service;
import com.hospeasy.backend.entity.*;
import com.hospeasy.backend.repository.*;
import com.hospeasy.backend.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.*;
import java.util.HexFormat;
@Service
public class RecuperacaoSenhaService {
    private final UsuarioRepository usuarios;
    private final DesafioRecuperacaoRepository desafios;
    private final PasswordEncoder encoder;
    private final ApplicationEventPublisher events;
    private final byte[] secret;
    private final SecureRandom random=new SecureRandom();
    public RecuperacaoSenhaService(UsuarioRepository usuarios,DesafioRecuperacaoRepository desafios,
        PasswordEncoder encoder,ApplicationEventPublisher events,@Value("${recovery.secret}") String secret) {
        if(secret.length()<32) throw new IllegalArgumentException("RECOVERY_SECRET deve ter pelo menos 32 caracteres");
        this.usuarios=usuarios; this.desafios=desafios; this.encoder=encoder; this.events=events;
        this.secret=secret.getBytes(StandardCharsets.UTF_8);
    }
    @Transactional public void solicitar(String email) {
        var u=usuarios.bloquearPorEmail(email).orElse(null);
        if(u==null || !Boolean.TRUE.equals(u.getAtivo())) return;
        Instant now=Instant.now();
        var d=desafios.findById(u.getId()).orElseGet(DesafioRecuperacao::new);
        if(d.getSolicitadoEm()!=null && d.getSolicitadoEm().plusSeconds(60).isAfter(now)) return;
        if(d.getJanelaInicio()==null || d.getJanelaInicio().plusSeconds(3600).isBefore(now)) {
            d.setJanelaInicio(now); d.setSolicitacoes(0);
        }
        if(d.getSolicitacoes()>=5) return; // Uniform public response, including cooldown.
        String codigo=String.format("%06d",random.nextInt(1_000_000));
        d.setUsuarioId(u.getId()); d.setCodigoHash(hash(u.getId(),codigo)); d.setExpiraEm(now.plusSeconds(600));
        d.setSolicitadoEm(now); d.setSolicitacoes(d.getSolicitacoes()+1); d.setTentativas(0); d.setConsumidoEm(null);
        desafios.save(d); events.publishEvent(new CodigoEmail(email,codigo));
    }
    @Transactional(noRollbackFor=ApiException.class) public void verificar(String email,String codigo) { validar(email,codigo); }
    @Transactional(noRollbackFor=ApiException.class) public void redefinir(String email,String codigo,String senha) {
        var u=validar(email,codigo);
        u.setSenhaHash(encoder.encode(senha)); u.setAuthVersion(u.getAuthVersion()+1);
        usuarios.save(u);
        var d=desafios.findById(u.getId()).orElseThrow(); d.setConsumidoEm(Instant.now()); desafios.save(d);
    }
    private Usuario validar(String email,String codigo) {
        var u=usuarios.bloquearPorEmail(email).orElse(null);
        if(u==null || !Boolean.TRUE.equals(u.getAtivo())) throw invalido();
        var d=desafios.findById(u.getId()).orElse(null);
        if(d==null || d.getConsumidoEm()!=null || !d.getExpiraEm().isAfter(Instant.now()) || d.getTentativas()>=5) throw invalido();
        boolean matches=MessageDigest.isEqual(d.getCodigoHash().getBytes(StandardCharsets.US_ASCII),
            hash(u.getId(),codigo).getBytes(StandardCharsets.US_ASCII));
        if(!matches) {
            d.setTentativas(d.getTentativas()+1);
            if(d.getTentativas()>=5) d.setConsumidoEm(Instant.now());
            desafios.save(d); throw invalido();
        }
        return u;
    }
    private ApiException invalido() { return new ApiException(400,"CODIGO_INVALIDO","Código inválido, expirado ou já utilizado."); }
    private String hash(Long id,String codigo) {
        try {
            var mac=Mac.getInstance("HmacSHA256"); mac.init(new SecretKeySpec(secret,"HmacSHA256"));
            return HexFormat.of().formatHex(mac.doFinal(("recuperacao:"+id+":"+codigo).getBytes(StandardCharsets.UTF_8)));
        } catch(GeneralSecurityException e) { throw new IllegalStateException("Não foi possível proteger o desafio."); }
    }
    // Do not use a record here: its generated toString would expose the code.
    public static final class CodigoEmail {
        private final String email,codigo;
        public CodigoEmail(String email,String codigo) { this.email=email; this.codigo=codigo; }
        public String email() { return email; }
        public String codigo() { return codigo; }
        @Override public String toString() { return "CodigoEmail[redacted]"; }
    }
}
