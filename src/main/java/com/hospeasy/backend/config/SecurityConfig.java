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

    private final JwtAuthenticationFilter
            jwtAuthenticationFilter;


    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {

        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;
    }


    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .csrf(
                        csrf ->
                                csrf.disable()
                )

                .cors(
                        cors ->
                                cors.configurationSource(
                                        corsConfigurationSource()
                                )
                )

                .sessionManagement(
                        session ->
                                session.sessionCreationPolicy(
                                        SessionCreationPolicy.STATELESS
                                )
                )

                .authorizeHttpRequests(
                        auth -> auth


                                // LOGIN
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/usuarios/login"
                                )
                                .permitAll()


                                // CADASTRO COMUM
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/usuarios/cadastro"
                                )
                                .permitAll()


                                // RECUPERAÇÃO DE SENHA
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/usuarios/esqueci-senha",
                                        "/usuarios/verificar-codigo",
                                        "/usuarios/redefinir-senha"
                                )
                                .permitAll()


                                // CONSULTAR UNIDADES
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/unidades",
                                        "/unidades/**"
                                )
                                .permitAll()


                                // CRIAR AVALIAÇÃO
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/unidades/*/avaliacoes"
                                )
                                .permitAll()


                                // CRIAR USUÁRIO ADMINISTRATIVAMENTE
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/usuarios"
                                )
                                .hasRole(
                                        "ADMIN"
                                )


                                // CADASTRAR UNIDADE
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/unidades"
                                )
                                .hasRole(
                                        "ADMIN"
                                )


                                // CÂMERA
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/unidades/*/medicoes"
                                )
                                .permitAll()


                                // ERROS DO SPRING
                                .requestMatchers(
                                        "/error"
                                )
                                .permitAll()


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
    public CorsConfigurationSource
    corsConfigurationSource() {

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
                List.of(
                        "*"
                )
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