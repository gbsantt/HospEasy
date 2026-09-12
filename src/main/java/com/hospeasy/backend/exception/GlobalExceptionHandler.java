package com.hospeasy.backend.exception;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.MissingRequestHeaderException;
import java.util.*;
@RestControllerAdvice
public class GlobalExceptionHandler {
    private ResponseEntity<Map<String,Object>> error(int status,String code,String message) {
        return ResponseEntity.status(status).body(Map.of("status",status,"codigo",code,"mensagem",message));
    }
    @ExceptionHandler(ApiException.class) ResponseEntity<Map<String,Object>> api(ApiException e) {
        var response=error(e.getStatus(),e.getCodigo(),e.getMessage());
        if(e.getStatus()==429) return ResponseEntity.status(429).header("Retry-After","60").body(response.getBody());
        return response;
    }
    @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<Map<String,Object>> validation(MethodArgumentNotValidException e) {
        Map<String,String> fields=new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors().forEach(f->fields.put(f.getField(),f.getDefaultMessage()));
        return ResponseEntity.badRequest().body(Map.of("status",400,"codigo","VALIDACAO","mensagem","Existem campos inválidos.","campos",fields));
    }
    @ExceptionHandler({HttpMessageNotReadableException.class,MethodArgumentTypeMismatchException.class,MissingRequestHeaderException.class})
    ResponseEntity<Map<String,Object>> invalid(Exception e) { return error(400,"REQUISICAO_INVALIDA","Requisição inválida."); }
    @ExceptionHandler(UnidadeNaoEncontradaException.class) ResponseEntity<Map<String,Object>> missing(Exception e) {
        return error(404,"UNIDADE_NAO_ENCONTRADA","Unidade não encontrada.");
    }
    @ExceptionHandler(CredenciaisInvalidasException.class) ResponseEntity<Map<String,Object>> login(Exception e) {
        return error(401,"CREDENCIAIS_INVALIDAS","E-mail ou senha inválidos.");
    }
    @ExceptionHandler(DispositivoNaoAutorizadoException.class) ResponseEntity<Map<String,Object>> device(Exception e) {
        return error(401,"CAMERA_NAO_AUTORIZADA","Credencial de câmera inválida ou indisponível.");
    }
    @ExceptionHandler(SemPermissaoException.class) ResponseEntity<Map<String,Object>> forbidden(Exception e) {
        return error(403,"ACESSO_NEGADO","Você não possui permissão.");
    }
    @ExceptionHandler(EmailJaCadastradoException.class) ResponseEntity<Map<String,Object>> duplicate(Exception e) {
        return error(409,"EMAIL_JA_CADASTRADO","Este e-mail já está cadastrado.");
    }
    @ExceptionHandler({DataIntegrityViolationException.class,ObjectOptimisticLockingFailureException.class})
    ResponseEntity<Map<String,Object>> conflict(Exception e) {
        return error(409,"CONFLITO","Os dados foram alterados ou conflitam com outro registro. Atualize e tente novamente.");
    }
    @ExceptionHandler({org.springframework.web.servlet.resource.NoResourceFoundException.class,org.springframework.web.servlet.NoHandlerFoundException.class})
    ResponseEntity<Map<String,Object>> route(Exception e) { return error(404,"RECURSO_NAO_ENCONTRADO","Recurso não encontrado."); }
    @ExceptionHandler(org.springframework.web.bind.MissingServletRequestParameterException.class)
    ResponseEntity<Map<String,Object>> parameter(Exception e) { return error(400,"REQUISICAO_INVALIDA","Informe os parâmetros obrigatórios."); }
    @ExceptionHandler(org.springframework.web.HttpRequestMethodNotSupportedException.class)
    ResponseEntity<Map<String,Object>> method(Exception e) { return error(405,"METODO_NAO_PERMITIDO","Método não permitido neste recurso."); }
    @ExceptionHandler(IllegalArgumentException.class) ResponseEntity<Map<String,Object>> rule(IllegalArgumentException e) {
        return error(400,"REGRA_NEGOCIO",e.getMessage());
    }
    @ExceptionHandler(IllegalStateException.class) ResponseEntity<Map<String,Object>> state(IllegalStateException e) {
        return error(409,"CONFLITO",e.getMessage());
    }
    @ExceptionHandler(Exception.class) ResponseEntity<Map<String,Object>> unexpected(Exception e) {
        org.slf4j.LoggerFactory.getLogger(getClass()).error("Falha interna: {}",e.getClass().getSimpleName());
        return error(500,"ERRO_INTERNO","Não foi possível concluir a operação.");
    }
}
