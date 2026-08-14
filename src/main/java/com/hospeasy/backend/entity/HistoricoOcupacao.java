package com.hospeasy.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import java.time.LocalDateTime;

@Entity
@Table(name = "historico_ocupacao")
@Getter
@Setter
@NoArgsConstructor
public class HistoricoOcupacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "unidade_atendimento_id", nullable = false)
    private UnidadeAtendimento unidadeAtendimento;

    @Column(nullable = false)
    private Integer quantidadePessoas;

    @Column(nullable = false)
    private Double percentualOcupacao;

    @Column(nullable = false)
    private LocalDateTime registradoEm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registrado_por")
    private Usuario registradoPor;

    @PrePersist
    public void prePersist() {
        if (registradoEm == null) {
            registradoEm = LocalDateTime.now();
        }
    }

    @Enumerated(EnumType.STRING)
    @Column
    private OrigemMedicao origem;
}