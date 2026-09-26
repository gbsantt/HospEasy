package com.hospeasy.backend.service;
import com.hospeasy.backend.entity.Usuario;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
class JwtPersistenceTest {
    private static final String SECRET="test-only-stable-secret-01234567890123456789";
    @Test void validTokenSurvivesServiceRestart() {
        var usuario=new Usuario();usuario.setId(7L);
        var token=new JwtService(SECRET,60000).gerarToken(usuario);
        assertEquals(7L,new JwtService(SECRET,60000).validar(token).usuarioId());
    }
    @Test void restartDoesNotRenewExpiredToken() {
        var usuario=new Usuario();usuario.setId(7L);
        var token=new JwtService(SECRET,-1000).gerarToken(usuario);
        assertThrows(io.jsonwebtoken.ExpiredJwtException.class,()->new JwtService(SECRET,60000).validar(token));
    }
}
