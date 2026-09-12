package com.hospeasy.backend.service;
import com.hospeasy.backend.entity.Usuario;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
@Service
public class JwtService {
    private final SecretKey chave;
    private final long expiracao;
    public JwtService(@Value("${jwt.secret}") String secret, @Value("${jwt.expiration}") long expiracao) {
        chave=Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)); this.expiracao=expiracao;
    }
    public String gerarToken(Usuario usuario) {
        var agora=new Date();
        return Jwts.builder().issuer("hospeasy").subject(usuario.getId().toString()).claim("formato",2)
            .claim("versao",usuario.getAuthVersion()).issuedAt(agora)
            .expiration(new Date(agora.getTime()+expiracao)).signWith(chave).compact();
    }
    public Identidade validar(String token) {
        Claims c=Jwts.parser().verifyWith(chave).requireIssuer("hospeasy").build().parseSignedClaims(token).getPayload();
        if(!Integer.valueOf(2).equals(c.get("formato",Integer.class)) || c.getExpiration()==null)
            throw new IllegalArgumentException("Formato de sessão inválido");
        return new Identidade(Long.parseLong(c.getSubject()),c.get("versao",Number.class).longValue());
    }
    public record Identidade(Long usuarioId,long versao) {}
}
