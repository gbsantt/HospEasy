package com.hospeasy.backend.exception;
public class ApiException extends RuntimeException {
    private final int status;
    private final String codigo;
    public ApiException(int status, String codigo, String mensagem) {
        super(mensagem); this.status = status; this.codigo = codigo;
    }
    public int getStatus() { return status; }
    public String getCodigo() { return codigo; }
}
