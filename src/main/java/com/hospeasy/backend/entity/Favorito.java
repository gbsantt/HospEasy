package com.hospeasy.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(
        name = "favorito",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_favorito_usuario_unidade",
                        columnNames = {
                                "usuario_id",
                                "unidade_id"
                        }
                )
        }
)
public class Favorito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne(optional = false)
    @JoinColumn(
            name = "usuario_id",
            nullable = false
    )
    private Usuario usuario;


    @ManyToOne(optional = false)
    @JoinColumn(
            name = "unidade_id",
            nullable = false
    )
    private UnidadeAtendimento unidade;


    public Favorito() {
    }


    public Long getId() {
        return id;
    }


    public void setId(Long id) {
        this.id = id;
    }


    public Usuario getUsuario() {
        return usuario;
    }


    public void setUsuario(
            Usuario usuario
    ) {
        this.usuario = usuario;
    }


    public UnidadeAtendimento getUnidade() {
        return unidade;
    }


    public void setUnidade(
            UnidadeAtendimento unidade
    ) {
        this.unidade = unidade;
    }
}