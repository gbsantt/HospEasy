package com.hospeasy.backend.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.*;
@Entity @Table(name="dispositivo_camera") @Getter @Setter @NoArgsConstructor
public class DispositivoCamera {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false) private String nome;
    @Column(nullable=false,unique=true,length=64) private String chaveHash;
    @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="unidade_atendimento_id",nullable=false) private UnidadeAtendimento unidadeAtendimento;
    @Column(nullable=false) private Boolean ativo=true;
    private LocalDateTime ultimaComunicacao;
    private Instant chaveRevogadaEm;
    @Column(nullable=false) private Instant chaveGeradaEm;
    @Column(nullable=false) private Instant createdAt;
    @Column(nullable=false) private Instant updatedAt;
    @Version private long version;
    @PrePersist void criar() { createdAt=Instant.now(); updatedAt=createdAt; if(chaveGeradaEm==null) chaveGeradaEm=createdAt; }
    @PreUpdate void atualizar() { updatedAt=Instant.now(); }
}
