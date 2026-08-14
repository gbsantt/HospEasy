package com.hospeasy.backend.service;

import com.hospeasy.backend.entity.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
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

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiracao
    ) {
        this.chave = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );

        this.expiracao = expiracao;
    }

    public String gerarToken(Usuario usuario) {

        Date agora = new Date();
        Date validade = new Date(
                agora.getTime() + expiracao
        );

        return Jwts.builder()
                .subject(usuario.getEmail())
                .claim("usuarioId", usuario.getId())
                .claim("tipo", usuario.getTipo().name())
                .claim(
                        "unidadeId",
                        usuario.getUnidadeAtendimento() != null
                                ? usuario.getUnidadeAtendimento().getId()
                                : null
                )
                .issuedAt(agora)
                .expiration(validade)
                .signWith(chave)
                .compact();
    }

    public String extrairEmail(String token) {
        return extrairClaims(token).getSubject();
    }

    public Long extrairUsuarioId(String token) {

        Number usuarioId = extrairClaims(token)
                .get("usuarioId", Number.class);

        return usuarioId.longValue();
    }

    public boolean tokenValido(String token) {

        try {

            Claims claims = extrairClaims(token);

            return claims.getExpiration()
                    .after(new Date());

        } catch (Exception e) {

            return false;
        }
    }

    private Claims extrairClaims(String token) {

        return Jwts.parser()
                .verifyWith(chave)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}