package com.hospeasy.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.MethodArgumentNotValidException;
import java.util.LinkedHashMap;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UnidadeNaoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> tratarUnidadeNaoEncontrado(
            UnidadeNaoEncontradoException exception
    ) {

        Map<String, Object> erro = new HashMap<>();

        erro.put("status", HttpStatus.NOT_FOUND.value());
        erro.put("erro", "Not Found");
        erro.put("mensagem", exception.getMessage());
        erro.put("dataHora", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(erro);
    }
    @ExceptionHandler(SemPermissaoException.class)
    public ResponseEntity<Map<String, Object>> tratarSemPermissao(
            SemPermissaoException exception
    ) {

        Map<String, Object> erro = new HashMap<>();

        erro.put("status", HttpStatus.FORBIDDEN.value());
        erro.put("erro", "Forbidden");
        erro.put("mensagem", exception.getMessage());
        erro.put("dataHora", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(erro);
    }
    @ExceptionHandler(CredenciaisInvalidasException.class)
    public ResponseEntity<Map<String, Object>> tratarCredenciaisInvalidas(
            CredenciaisInvalidasException exception
    ) {

        Map<String, Object> erro = new HashMap<>();

        erro.put("status", HttpStatus.UNAUTHORIZED.value());
        erro.put("erro", "Unauthorized");
        erro.put("mensagem", exception.getMessage());
        erro.put("dataHora", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(erro);
    }
    @ExceptionHandler(EmailJaCadastradoException.class)
    public ResponseEntity<Map<String, Object>> tratarEmailJaCadastrado(
            EmailJaCadastradoException exception
    ) {

        Map<String, Object> erro = new HashMap<>();

        erro.put("status", HttpStatus.CONFLICT.value());
        erro.put("erro", "Conflict");
        erro.put("mensagem", exception.getMessage());
        erro.put("dataHora", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(erro);
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> tratarValidacao(
            MethodArgumentNotValidException exception
    ) {

        Map<String, String> campos = new LinkedHashMap<>();

        exception.getBindingResult()
                .getFieldErrors()
                .forEach(erro ->
                        campos.put(
                                erro.getField(),
                                erro.getDefaultMessage()
                        )
                );

        Map<String, Object> resposta = new LinkedHashMap<>();

        resposta.put("status", HttpStatus.BAD_REQUEST.value());
        resposta.put("erro", "Bad Request");
        resposta.put("mensagem", "Existem campos inválidos");
        resposta.put("campos", campos);
        resposta.put("dataHora", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(resposta);
    }
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> tratarRegraNegocio(
            IllegalArgumentException exception
    ) {

        Map<String, Object> erro = new HashMap<>();

        erro.put("status", HttpStatus.BAD_REQUEST.value());
        erro.put("erro", "Bad Request");
        erro.put("mensagem", exception.getMessage());
        erro.put("dataHora", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(erro);
    }

    @ExceptionHandler(DispositivoNaoAutorizadoException.class)
    public ResponseEntity<Map<String, Object>> tratarDispositivoNaoAutorizado(
            DispositivoNaoAutorizadoException exception
    ) {

        Map<String, Object> erro = new HashMap<>();

        erro.put("status", HttpStatus.UNAUTHORIZED.value());
        erro.put("erro", "Unauthorized");
        erro.put("mensagem", exception.getMessage());
        erro.put("dataHora", LocalDateTime.now());

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(erro);
    }
}