package com.hospeasy.backend.controller;
import com.hospeasy.backend.dto.*;
import com.hospeasy.backend.entity.*;
import com.hospeasy.backend.service.SolicitacaoSuporteService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
@RestController @RequestMapping("/usuarios/me/suporte")
public class SolicitacaoSuporteController {
    private final SolicitacaoSuporteService service;
    public SolicitacaoSuporteController(SolicitacaoSuporteService service) { this.service=service; }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public SolicitacaoSuporteResponseDTO criar(@AuthenticationPrincipal Usuario u,@Valid @RequestBody CriarSolicitacaoSuporteRequestDTO dto) { return service.criar(u,dto); }
    @GetMapping public PaginaDTO<SolicitacaoSuporteResumoDTO> listar(@AuthenticationPrincipal Usuario u,
        @RequestParam(required=false) StatusSuporte status,@RequestParam(required=false) CategoriaSuporte categoria,
        @RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size) {
        return service.listar(u.getId(),status,categoria,page,size);
    }
    @GetMapping("/{id}") public SolicitacaoSuporteResponseDTO buscar(@AuthenticationPrincipal Usuario u,@PathVariable Long id) { return service.buscarPropria(id,u.getId()); }
}
