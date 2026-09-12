package com.hospeasy.backend.controller;
import com.hospeasy.backend.dto.*;
import com.hospeasy.backend.entity.Usuario;
import com.hospeasy.backend.service.UnidadeAtendimentoService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.http.*;
import java.util.List;
@RestController @RequestMapping("/unidades")
public class UnidadeAtendimentoController {
    private final UnidadeAtendimentoService unidades;
    public UnidadeAtendimentoController(UnidadeAtendimentoService unidades) { this.unidades=unidades; }
    @GetMapping public List<UnidadeAtendimentoResponseDTO> listar() { return unidades.listarUnidades(); }
    @GetMapping("/{id}") public UnidadeAtendimentoResponseDTO buscar(@PathVariable Long id) { return unidades.buscarPorId(id); }
    @PostMapping public ResponseEntity<CadastroUnidadeResponseDTO> criar(@Valid @RequestBody UnidadeAtendimentoRequestDTO dto) {
        return ResponseEntity.status(201).cacheControl(CacheControl.noStore()).body(unidades.cadastrarUnidades(dto));
    }
    @PutMapping("/{id}") public UnidadeAtendimentoResponseDTO atualizar(@PathVariable Long id,@Valid @RequestBody AtualizarUnidadeRequestDTO dto) { return unidades.atualizarUnidade(id,dto); }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void excluir(@PathVariable Long id) { unidades.excluirUnidade(id); }
    @PatchMapping("/{id}/ocupacao") public UnidadeAtendimentoResponseDTO ocupacao(@PathVariable Long id,@Valid @RequestBody AtualizarOcupacaoDTO dto,@AuthenticationPrincipal Usuario usuario) {
        return unidades.atualizarOcupacao(id,dto,usuario);
    }
    @GetMapping("/{id}/historico") public List<HistoricoOcupacaoResponseDTO> historico(@PathVariable Long id) { return unidades.buscarHistorico(id); }
    @GetMapping("/{id}/situacao") public SituacaoUnidadeResponseDTO situacao(@PathVariable Long id) { return unidades.buscarSituacaoAtual(id); }
    @GetMapping("/situacoes") public List<SituacaoUnidadeResponseDTO> situacoes() { return unidades.listarSituacoes(); }
    @GetMapping("/situacoes/ordenadas") public List<SituacaoUnidadeResponseDTO> ordenadas() { return unidades.listarSituacoesOrdenadasPorOcupacao(); }
}
