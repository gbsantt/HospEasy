package com.hospeasy.backend.service;
import com.hospeasy.backend.dto.*;
import com.hospeasy.backend.entity.*;
import com.hospeasy.backend.exception.*;
import com.hospeasy.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
@Service @Transactional(readOnly=true)
public class UnidadeAtendimentoService {
    private final UnidadeAtendimentoRepository unidades;
    private final HistoricoOcupacaoRepository historico;
    private final AvaliacaoRepository avaliacoes;
    private final FavoritoRepository favoritos;
    private final DispositivoCameraRepository dispositivos;
    private final DispositivoCameraService cameras;
    private final GeocodificacaoService geo;
    private final SituacaoUnidadeService situacao;
    public UnidadeAtendimentoService(UnidadeAtendimentoRepository unidades,HistoricoOcupacaoRepository historico,
        DispositivoCameraService cameras,GeocodificacaoService geo,AvaliacaoRepository avaliacoes,
        FavoritoRepository favoritos,DispositivoCameraRepository dispositivos,SituacaoUnidadeService situacao) {
        this.unidades=unidades; this.historico=historico; this.cameras=cameras; this.geo=geo;
        this.avaliacoes=avaliacoes; this.favoritos=favoritos; this.dispositivos=dispositivos; this.situacao=situacao;
    }
    public List<UnidadeAtendimentoResponseDTO> listarUnidades() { return unidades.findAll().stream().map(this::dto).toList(); }
    public UnidadeAtendimentoResponseDTO buscarPorId(Long id) { return dto(buscar(id)); }
    public SituacaoUnidadeResponseDTO buscarSituacaoAtual(Long id) { return situacao.calcular(List.of(buscar(id))).getFirst(); }
    public List<SituacaoUnidadeResponseDTO> listarSituacoes() { return situacao.calcular(unidades.findAll()); }
    public List<SituacaoUnidadeResponseDTO> listarSituacoesOrdenadasPorOcupacao() {
        return listarSituacoes().stream().sorted(Comparator
            .comparingInt((SituacaoUnidadeResponseDTO s)->s.statusCamera()==StatusCamera.ONLINE && s.statusMedicao()==StatusMedicao.ATUALIZADA?0:1)
            .thenComparingDouble(SituacaoUnidadeResponseDTO::percentualOcupacao)).toList();
    }
    @Transactional public CadastroUnidadeResponseDTO cadastrarUnidades(UnidadeAtendimentoRequestDTO d) {
        var coords=coordenadas(d.endereco(),d.latitude(),d.longitude());
        var u=new UnidadeAtendimento(); preencher(u,d.nome(),d.endereco(),d.telefone(),d.capacidadeAreaMonitorada(),d.tipo());
        u.setLatitude(coords.latitude()); u.setLongitude(coords.longitude()); unidades.saveAndFlush(u);
        CredencialCameraResponseDTO camera=null;
        if(d.nomeCamera()!=null && !d.nomeCamera().isBlank()) camera=cameras.cadastrar(u.getId(),new CriarDispositivoRequestDTO(d.nomeCamera(),true));
        return new CadastroUnidadeResponseDTO(dto(u),camera==null?null:camera.dispositivo().id(),
            camera==null?null:camera.dispositivo().nome(),camera==null?null:camera.cameraKey());
    }
    @Transactional public UnidadeAtendimentoResponseDTO atualizarUnidade(Long id,AtualizarUnidadeRequestDTO d) {
        var u=unidades.bloquear(id).orElseThrow(UnidadeNaoEncontradaException::new);
        if(d.capacidadeAreaMonitorada()<u.getOcupacaoAtual()) throw new IllegalArgumentException("A capacidade não pode ser menor que a ocupação atual.");
        if(d.latitude()!=null || d.longitude()!=null || !u.getEndereco().equalsIgnoreCase(d.endereco().trim())) {
            var coords=coordenadas(d.endereco(),d.latitude(),d.longitude()); u.setLatitude(coords.latitude()); u.setLongitude(coords.longitude());
        }
        preencher(u,d.nome(),d.endereco(),d.telefone(),d.capacidadeAreaMonitorada(),d.tipo()); return dto(unidades.save(u));
    }
    private GeocodificacaoService.Coordenadas coordenadas(String endereco,Double lat,Double lon) {
        if((lat==null)!=(lon==null)) throw new IllegalArgumentException("Informe latitude e longitude juntas.");
        if(lat!=null) {
            if(!Double.isFinite(lat)||!Double.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)
                throw new IllegalArgumentException("Coordenadas inválidas.");
            return new GeocodificacaoService.Coordenadas(lat,lon);
        }
        return geo.geocodificar(endereco);
    }
    private void preencher(UnidadeAtendimento u,String nome,String endereco,String telefone,Integer capacidade,TipoUnidade tipo) {
        u.setNome(nome.trim()); u.setEndereco(endereco.trim()); u.setTelefone(telefone==null||telefone.isBlank()?null:telefone.trim());
        u.setCapacidadeAreaMonitorada(capacidade); u.setTipo(tipo);
    }
    @Transactional public void excluirUnidade(Long id) {
        var u=unidades.bloquear(id).orElseThrow(UnidadeNaoEncontradaException::new);
        historico.deleteByUnidadeAtendimentoId(id); avaliacoes.deleteByUnidadeAtendimentoId(id);
        favoritos.deleteByUnidadeId(id); dispositivos.deleteByUnidadeAtendimentoId(id);
        // Preserve the existing explicit flush before deleting the parent.
        unidades.flush(); unidades.delete(u);
    }
    @Transactional public UnidadeAtendimentoResponseDTO atualizarOcupacao(Long id,AtualizarOcupacaoDTO d,Usuario usuario) {
        var u=unidades.bloquear(id).orElseThrow(UnidadeNaoEncontradaException::new);
        if(d.quantidadePessoas()<0 || d.quantidadePessoas()>u.getCapacidadeAreaMonitorada()) throw new IllegalArgumentException("Ocupação fora da capacidade.");
        u.setOcupacaoAtual(d.quantidadePessoas()); u.setUltimaAtualizacao(LocalDateTime.now());
        var h=new HistoricoOcupacao(); h.setUnidadeAtendimento(u); h.setQuantidadePessoas(d.quantidadePessoas());
        h.setPercentualOcupacao(SituacaoUnidadeService.percentual(u)); h.setRegistradoPor(usuario);
        h.setOrigem(OrigemMedicao.MANUAL); historico.saveAndFlush(h); return dto(u);
    }
    public List<HistoricoOcupacaoResponseDTO> buscarHistorico(Long id) {
        buscar(id);
        return historico.findTop100ByUnidadeAtendimentoIdOrderByRegistradoEmDesc(id).stream()
            .map(h->new HistoricoOcupacaoResponseDTO(h.getId(),id,h.getQuantidadePessoas(),h.getPercentualOcupacao(),h.getRegistradoEm(),h.getOrigem())).toList();
    }
    public List<HistoricoAdminResponseDTO> buscarHistoricoAdmin(Long id) {
        buscar(id);
        return historico.findTop100ByUnidadeAtendimentoIdOrderByRegistradoEmDesc(id).stream().map(h->new HistoricoAdminResponseDTO(
            h.getId(),h.getQuantidadePessoas(),h.getPercentualOcupacao(),h.getRegistradoEm(),h.getOrigem(),
            h.getDispositivo()==null?null:h.getDispositivo().getId(),h.getRegistradoPor()==null?null:h.getRegistradoPor().getId())).toList();
    }
    private UnidadeAtendimento buscar(Long id) { return unidades.findById(id).orElseThrow(UnidadeNaoEncontradaException::new); }
    private UnidadeAtendimentoResponseDTO dto(UnidadeAtendimento u) {
        double p=SituacaoUnidadeService.percentual(u);
        return new UnidadeAtendimentoResponseDTO(u.getId(),u.getNome(),u.getEndereco(),u.getTelefone(),u.getCapacidadeAreaMonitorada(),
            u.getOcupacaoAtual(),p,SituacaoUnidadeService.nivel(p),u.getLatitude(),u.getLongitude(),u.getUltimaAtualizacao(),u.getTipo());
    }
}
