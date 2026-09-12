package com.hospeasy.backend.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
@Entity @Table(name="desafio_recuperacao") @Getter @Setter @NoArgsConstructor
public class DesafioRecuperacao {
    @Id private Long usuarioId;
    @Column(nullable=false,length=64) private String codigoHash;
    @Column(nullable=false) private Instant expiraEm;
    @Column(nullable=false) private Instant solicitadoEm;
    @Column(nullable=false) private Instant janelaInicio;
    @Column(nullable=false) private int solicitacoes;
    @Column(nullable=false) private int tentativas;
    private Instant consumidoEm;
}
