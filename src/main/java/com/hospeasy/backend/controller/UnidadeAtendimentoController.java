package com.hospeasy.backend.controller;

import com.hospeasy.backend.dto.UnidadeAtendimentoRequestDTO;
import com.hospeasy.backend.dto.UnidadeAtendimentoResponseDTO;
import com.hospeasy.backend.service.UnidadeAtendimentoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import com.hospeasy.backend.dto.AtualizarOcupacaoDTO;
import com.hospeasy.backend.dto.HistoricoOcupacaoResponseDTO;
import com.hospeasy.backend.entity.Usuario;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.hospeasy.backend.dto.MedicaoCameraRequestDTO;
import com.hospeasy.backend.service.DispositivoCameraService;
import com.hospeasy.backend.dto.SituacaoUnidadeResponseDTO;

import java.util.List;

@RestController
@RequestMapping({"/unidades", "/unidades"})
public class UnidadeAtendimentoController {

    private final UnidadeAtendimentoService unidadeAtendimentoService;
    private final DispositivoCameraService dispositivoCameraService;

    public UnidadeAtendimentoController(
            UnidadeAtendimentoService unidadeAtendimentoService,
            DispositivoCameraService dispositivoCameraService
    ) {
        this.unidadeAtendimentoService = unidadeAtendimentoService;
        this.dispositivoCameraService = dispositivoCameraService;
    }

    @GetMapping
    public List<UnidadeAtendimentoResponseDTO> listarUnidades() {
        return unidadeAtendimentoService.listarUnidades();
    }

    @GetMapping("/{id}")
    public UnidadeAtendimentoResponseDTO buscarUnidadePorId(@PathVariable Long id) {
        return unidadeAtendimentoService.buscarPorId(id);
    }

    @PostMapping
    public UnidadeAtendimentoResponseDTO cadastrarUnidades(
            @Valid @RequestBody UnidadeAtendimentoRequestDTO dto
    ) {
        return unidadeAtendimentoService.cadastrarUnidades(dto);
    }

    @GetMapping("/{id}/historico")
    public List<HistoricoOcupacaoResponseDTO> buscarHistorico(
            @PathVariable Long id
    ) {
        return unidadeAtendimentoService.buscarHistorico(id);
    }

    @PatchMapping("/{id}/ocupacao")
    public UnidadeAtendimentoResponseDTO atualizarOcupacao(
            @PathVariable Long id,
            @Valid @RequestBody AtualizarOcupacaoDTO dto,
            @AuthenticationPrincipal Usuario usuario
    ) {
        return unidadeAtendimentoService.atualizarOcupacao(id, dto, usuario);
    }

    @PostMapping("/{id}/medicoes")
    public UnidadeAtendimentoResponseDTO registrarMedicaoCamera(
            @PathVariable Long id,
            @RequestHeader("X-API-Key") String chaveApi,
            @Valid @RequestBody MedicaoCameraRequestDTO dto
    ) {

        dispositivoCameraService.validarDispositivo(
                chaveApi,
                id
        );

        return unidadeAtendimentoService.registrarMedicaoCamera(
                id,
                dto
        );
    }

    @GetMapping("/{id}/situacao")
    public SituacaoUnidadeResponseDTO buscarSituacaoAtual(
            @PathVariable Long id
    ) {
        return unidadeAtendimentoService.buscarSituacaoAtual(id);
    }

    @GetMapping("/situacoes")
    public List<SituacaoUnidadeResponseDTO> listarSituacoes() {
        return unidadeAtendimentoService.listarSituacoes();
    }

    @GetMapping("/situacoes/ordenadas")
    public List<SituacaoUnidadeResponseDTO> listarSituacoesOrdenadas() {
        return unidadeAtendimentoService.listarSituacoesOrdenadasPorOcupacao();
    }
}