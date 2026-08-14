package com.hospeasy.backend.exception;

public class EmailJaCadastradoException extends RuntimeException {

    public EmailJaCadastradoException() {
        super("Já existe um usuário com esse e-mail");
    }
}