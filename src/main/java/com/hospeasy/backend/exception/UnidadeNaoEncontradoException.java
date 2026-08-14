package com.hospeasy.backend.exception;

public class UnidadeNaoEncontradoException extends RuntimeException {

    public UnidadeNaoEncontradoException() {
        super("Unidade de atendimento não encontrado");
    }
}