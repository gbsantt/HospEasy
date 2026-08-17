package com.hospeasy.backend.exception;

public class UnidadeNaoEncontradaException extends RuntimeException {

    public UnidadeNaoEncontradaException() {
        super("Unidade de atendimento não encontrado");
    }
}