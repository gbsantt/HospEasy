package com.hospeasy.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "dispositivo_camera")
@Getter
@Setter
@NoArgsConstructor
public class DispositivoCamera {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String chaveApi;

    @ManyToOne
    @JoinColumn(name = "unidade_atendimento_id", nullable = false)
    private UnidadeAtendimento unidadeAtendimento;

    @Column(nullable = false)
    private Boolean ativo = true;

    private LocalDateTime ultimaComunicacao;
}