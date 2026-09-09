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

        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;
    }


    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .csrf(csrf ->
                        csrf.disable()
                )

                .cors(cors ->
                        cors.configurationSource(
                                corsConfigurationSource()
                        )
                )

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                .authorizeHttpRequests(auth -> auth

                        /*
                         * ROTAS PÚBLICAS DE USUÁRIO
                         */
                        .requestMatchers(
                                HttpMethod.POST,
                                "/usuarios/login",
                                "/usuarios/cadastro",
                                "/usuarios/esqueci-senha",
                                "/usuarios/verificar-codigo",
                                "/usuarios/redefinir-senha"
                        ).permitAll()


                        /*
                         * CONSULTAR UNIDADES
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/unidades",
                                "/unidades/**"
                        ).permitAll()


                        /*
                         * CRIAR AVALIAÇÃO
                         *
                         * Exige usuário autenticado
                         * para vincular a avaliação
                         * à conta.
                         */
                        .requestMatchers(
                                HttpMethod.POST,
                                "/unidades/*/avaliacoes"
                        ).authenticated()

                        /*
                         * FAVORITOS DO USUÁRIO LOGADO
                         */
                        .requestMatchers(
                                "/usuarios/me/favoritos",
                                "/usuarios/me/favoritos/**"
                        ).authenticated()

                        /*
                         * AVALIAÇÕES DO USUÁRIO LOGADO
                         */
                        .requestMatchers(
                                "/usuarios/me/avaliacoes",
                                "/usuarios/me/avaliacoes/**"
                        ).authenticated()

                        /*
                         * ADMIN - LISTAR USUÁRIOS
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/usuarios"
                        ).hasRole("ADMIN")


                        /*
                         * ADMIN - BUSCAR USUÁRIO
                         */
                        .requestMatchers(
                                HttpMethod.GET,
                                "/usuarios/*"
                        ).hasRole("ADMIN")


                        /*
                         * ADMIN - CADASTRAR USUÁRIO
                         */
                        .requestMatchers(
                                HttpMethod.POST,
                                "/usuarios"
                        ).hasRole("ADMIN")


                        /*
                         * ADMIN - ATUALIZAR USUÁRIO
                         */
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/usuarios/*"
                        ).hasRole("ADMIN")


                        /*
                         * ADMIN - ATUALIZAR OCUPAÇÃO
                         */
                        .requestMatchers(
                                HttpMethod.PATCH,
                                "/unidades/*/ocupacao"
                        ).hasRole("ADMIN")


                        /*
                         * ADMIN - CADASTRAR UNIDADE
                         */
                        .requestMatchers(
                                HttpMethod.POST,
                                "/unidades"
                        ).hasRole("ADMIN")


                        /*
                         * ADMIN - EXCLUIR UNIDADE
                         */
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/unidades/*"
                        ).hasRole("ADMIN")


                        /*
                         * RECEBER MEDIÇÕES DA CÂMERA
                         */
                        .requestMatchers(
                                HttpMethod.POST,
                                "/unidades/*/medicoes"
                        ).permitAll()


                        /*
                         * ERROS DO SPRING
                         */
                        .requestMatchers(
                                "/error"
                        ).permitAll()


                        /*
                         * QUALQUER OUTRA ROTA
                         * EXIGE AUTENTICAÇÃO
                         *
                         * SEMPRE DEVE SER O ÚLTIMO.
                         */
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
                        "http://localhost:8081",
                        "http://localhost:8082",
                        "http://127.0.0.1:8081",
                        "http://127.0.0.1:8082"
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
