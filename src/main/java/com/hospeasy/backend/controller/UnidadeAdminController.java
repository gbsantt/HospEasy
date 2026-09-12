package com.hospeasy.backend.controller;
import com.hospeasy.backend.dto.*;
import com.hospeasy.backend.service.UnidadeAtendimentoService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController @RequestMapping("/admin/unidades")
public class UnidadeAdminController {
    private final UnidadeAtendimentoService unidades;
    public UnidadeAdminController(UnidadeAtendimentoService unidades) { this.unidades=unidades; }
    @GetMapping public List<SituacaoUnidadeResponseDTO> listar() { return unidades.listarSituacoes(); }
    @GetMapping("/{id}/historico") public List<HistoricoAdminResponseDTO> historico(@PathVariable Long id) { return unidades.buscarHistoricoAdmin(id); }
}
