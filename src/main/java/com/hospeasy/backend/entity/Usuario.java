package com.hospeasy.backend.entity;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name = "usuario")
@Getter
@Setter
@NoArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;


    @Column(
            nullable = false,
            length = 120
    )
    private String nome;


    @Column(
            nullable = false,
            unique = true,
            length = 180
    )
    private String email;


    @Column(
            nullable = false
    )
    private String senhaHash;


    @Enumerated(
            EnumType.STRING
    )
    @Column(
            nullable = false,
            length = 30
    )
    private TipoUsuario tipo;


    @Column(
            nullable = false
    )
    private Boolean ativo = true;
}