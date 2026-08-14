package com.hospeasy.backend.exception;

public class DispositivoNaoAutorizadoException extends RuntimeException {

    public DispositivoNaoAutorizadoException(String mensagem) {
        super(mensagem);
    }
}