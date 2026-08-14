package com.hospeasy.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        // Login continua público
                        .requestMatchers(
                                org.springframework.http.HttpMethod.POST,
                                "/usuarios/login"
                        ).permitAll()

                        // Consultar hospitais e histórico é público
                        .requestMatchers(
                                org.springframework.http.HttpMethod.GET,
                                "/unidades",
                                "/unidades/**"
                        ).permitAll()

                        // Somente ADMIN pode cadastrar usuários
                        .requestMatchers(
                                org.springframework.http.HttpMethod.POST,
                                "/usuarios"
                        ).hasRole("ADMIN")

                        // ADMIN e FUNCIONARIO podem atualizar ocupação
                        .requestMatchers(
                                org.springframework.http.HttpMethod.PATCH,
                                "/unidades/*/ocupacao"
                        ).hasAnyRole("ADMIN", "FUNCIONARIO")

                        // Somente ADMIN pode cadastrar hospitais
                        .requestMatchers(
                                org.springframework.http.HttpMethod.POST,
                                "/unidades"
                        ).hasRole("ADMIN")


                        .requestMatchers(
                                org.springframework.http.HttpMethod.POST,
                                "/unidades/*/medicoes"
                        ).permitAll()

                        // Qualquer outra rota precisa estar autenticada
                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }
}