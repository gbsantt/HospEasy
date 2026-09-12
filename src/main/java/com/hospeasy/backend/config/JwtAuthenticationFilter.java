package com.hospeasy.backend.config;
import com.hospeasy.backend.repository.UsuarioRepository;
import com.hospeasy.backend.service.JwtService;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwt;
    private final UsuarioRepository usuarios;
    public JwtAuthenticationFilter(JwtService jwt,UsuarioRepository usuarios) { this.jwt=jwt; this.usuarios=usuarios; }
    @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)
        throws ServletException,IOException {
        String header=req.getHeader("Authorization");
        if(header!=null && header.startsWith("Bearer ")) {
            JwtService.Identidade id=null;
            try { id=jwt.validar(header.substring(7)); }
            catch(io.jsonwebtoken.JwtException | IllegalArgumentException | NullPointerException ignored) {}
            if(id!=null) {
                var u=usuarios.findById(id.usuarioId()).orElse(null);
                if(u!=null && Boolean.TRUE.equals(u.getAtivo()) && u.getAuthVersion()==id.versao())
                    SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(
                        u,null,List.of(new SimpleGrantedAuthority("ROLE_"+u.getTipo().name()))));
            }
        }
        chain.doFilter(req,res);
    }
}
