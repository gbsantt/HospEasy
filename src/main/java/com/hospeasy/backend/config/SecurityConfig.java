package com.hospeasy.backend.config;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;
import java.util.*;
@Configuration
public class SecurityConfig {
    private final JwtAuthenticationFilter jwt;
    private final RequestRateLimitFilter limiter;
    private final List<String> origins;
    public SecurityConfig(JwtAuthenticationFilter jwt,RequestRateLimitFilter limiter,@Value("${app.cors.origins}") String origins) {
        this.jwt=jwt; this.limiter=limiter;
        this.origins=Arrays.stream(origins.split(",")).map(String::trim).filter(s->!s.isEmpty()).toList();
        if(this.origins.contains("*")) throw new IllegalArgumentException("Configure origens CORS explícitas");
    }
    @Bean SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http.csrf(c->c.disable()).cors(c->c.configurationSource(corsConfigurationSource()))
            .sessionManagement(c->c.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(c->c
                .authenticationEntryPoint((req,res,e)->SecurityErrors.write(res,401,"SESSAO_INVALIDA","Entre novamente para continuar."))
                .accessDeniedHandler((req,res,e)->SecurityErrors.write(res,403,"ACESSO_NEGADO","Você não possui permissão.")))
            .authorizeHttpRequests(a->a
                .requestMatchers(HttpMethod.POST,"/usuarios/login","/usuarios/cadastro","/usuarios/esqueci-senha","/usuarios/verificar-codigo","/usuarios/redefinir-senha").permitAll()
                .requestMatchers("/usuarios/me","/usuarios/me/**").authenticated()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET,"/unidades","/unidades/**").permitAll()
                .requestMatchers(HttpMethod.POST,"/unidades/*/avaliacoes").authenticated()
                .requestMatchers("/usuarios","/usuarios/*").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST,"/unidades").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT,"/unidades/*").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE,"/unidades/*").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PATCH,"/unidades/*/ocupacao").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST,"/cameras/medicoes").permitAll()
                .requestMatchers("/error").permitAll().anyRequest().denyAll())
            .addFilterBefore(jwt,UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(limiter,JwtAuthenticationFilter.class).build();
    }
    @Bean CorsConfigurationSource corsConfigurationSource() {
        var c=new CorsConfiguration(); c.setAllowedOrigins(origins);
        c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
        c.setAllowedHeaders(List.of("Authorization","Content-Type","X-Camera-Key"));
        c.setExposedHeaders(List.of("Retry-After")); c.setAllowCredentials(false);
        var s=new UrlBasedCorsConfigurationSource(); s.registerCorsConfiguration("/**",c); return s;
    }
}
