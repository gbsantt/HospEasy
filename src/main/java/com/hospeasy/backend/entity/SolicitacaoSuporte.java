package com.hospeasy.backend.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
@Entity @Table(name="solicitacao_suporte") @Getter @Setter @NoArgsConstructor
public class SolicitacaoSuporte {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="usuario_id",nullable=false) private Usuario usuario;
    @Column(nullable=false,length=150) private String assunto;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=40) private CategoriaSuporte categoria;
    @Column(nullable=false,length=5000) private String descricao;
    @Enumerated(EnumType.STRING) @Column(nullable=false,length=30) private StatusSuporte status=StatusSuporte.ABERTO;
    @Column(nullable=false) private Instant createdAt;
    @Column(nullable=false) private Instant updatedAt;
    @Version private long version;
    @PrePersist void criar() { createdAt=Instant.now(); updatedAt=createdAt; }
    @PreUpdate void atualizar() { updatedAt=Instant.now(); }
}
