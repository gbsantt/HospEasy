package com.hospeasy.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .cors(cors -> {})

                .csrf(csrf ->
                        csrf.disable()
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // Login público
                        .requestMatchers(
                                HttpMethod.POST,
                                "/usuarios/login"
                        ).permitAll()

                        // Consulta das unidades é pública
                        .requestMatchers(
                                HttpMethod.GET,
                                "/unidades",
                                "/unidades/**"
                        ).permitAll()

                        // Medição enviada pela câmera
                        .requestMatchers(
                                HttpMethod.POST,
                                "/unidades/*/medicoes"
                        ).permitAll()

                        // Somente ADMIN cadastra usuários
                        .requestMatchers(
                                HttpMethod.POST,
                                "/usuarios"
                        ).hasRole("ADMIN")

                        // Somente ADMIN cadastra unidades
                        .requestMatchers(
                                HttpMethod.POST,
                                "/unidades"
                        ).hasRole("ADMIN")

                        // ADMIN e FUNCIONARIO atualizam ocupação
                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/unidades/*/ocupacao"
                        ).hasAnyRole(
                                "ADMIN",
                                "FUNCIONARIO"
                        )

                        // Demais rotas exigem autenticação
                        .anyRequest()
                        .authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:8081"
                )
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PATCH",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(
                true
        );

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}