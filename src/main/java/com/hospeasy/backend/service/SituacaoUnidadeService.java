package com.hospeasy.backend.service;
import com.hospeasy.backend.entity.*;
import com.hospeasy.backend.dto.SituacaoUnidadeResponseDTO;
import com.hospeasy.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
@Service @Transactional(readOnly=true)
public class SituacaoUnidadeService {
    private final DispositivoCameraRepository cameras;
    private final HistoricoOcupacaoRepository historico;
    public SituacaoUnidadeService(DispositivoCameraRepository cameras,HistoricoOcupacaoRepository historico) {
        this.cameras=cameras; this.historico=historico;
    }
    public List<SituacaoUnidadeResponseDTO> calcular(List<UnidadeAtendimento> unidades) {
        if(unidades.isEmpty()) return List.of();
        var ids=unidades.stream().map(UnidadeAtendimento::getId).toList();
        var dispositivos=cameras.findByUnidadeAtendimentoIdIn(ids).stream()
            .collect(Collectors.groupingBy(d->d.getUnidadeAtendimento().getId()));
        var recentes=historico.janela(ids,LocalDateTime.now().minusMinutes(30)).stream()
            .collect(Collectors.groupingBy(h->h.getUnidadeAtendimento().getId()));
        return unidades.stream().map(u-> {
            var ds=dispositivos.getOrDefault(u.getId(),List.of());
            var camera=ds.stream().filter(d->Boolean.TRUE.equals(d.getAtivo())).findFirst()
                .orElseGet(()->ds.stream().min(Comparator.comparing(DispositivoCamera::getId)).orElse(null));
            var status=DispositivoCameraService.status(camera);
            var hs=recentes.getOrDefault(u.getId(),List.of());
            double media=hs.stream().mapToInt(HistoricoOcupacao::getQuantidadePessoas).average().orElse(0);
            // Disjoint windows avoid comparing samples against themselves.
            int n=Math.min(3,hs.size()/2);
            double delta=n==0?0:hs.stream().limit(n).mapToInt(HistoricoOcupacao::getQuantidadePessoas).average().orElse(0)
                -hs.stream().skip(hs.size()-n).mapToInt(HistoricoOcupacao::getQuantidadePessoas).average().orElse(0);
            var tendencia=delta>=3?TendenciaOcupacao.AUMENTANDO:delta<=-3?TendenciaOcupacao.DIMINUINDO:TendenciaOcupacao.ESTAVEL;
            var ritmo=hs.size()<4?RitmoOcupacao.DADOS_INSUFICIENTES:
                delta>=10?RitmoOcupacao.AUMENTANDO_RAPIDO:delta>=3?RitmoOcupacao.AUMENTANDO:
                delta<=-10?RitmoOcupacao.ESVAZIANDO_RAPIDO:delta<=-3?RitmoOcupacao.ESVAZIANDO:RitmoOcupacao.ESTAVEL;
            var statusMedicao=camera==null || camera.getUltimaComunicacao()==null?StatusMedicao.SEM_DADOS:
                status==StatusCamera.ONLINE?StatusMedicao.ATUALIZADA:StatusMedicao.DESATUALIZADA;
            double p=percentual(u);
            return new SituacaoUnidadeResponseDTO(u.getId(),u.getNome(),u.getEndereco(),u.getTelefone(),
                u.getLatitude(),u.getLongitude(),u.getCapacidadeAreaMonitorada(),u.getOcupacaoAtual(),p,nivel(p),
                media,tendencia,u.getUltimaAtualizacao(),statusMedicao,status,ritmo,u.getTipo());
        }).toList();
    }
    public static double percentual(UnidadeAtendimento u) {
        return u.getCapacidadeAreaMonitorada()==null || u.getCapacidadeAreaMonitorada()<=0?0:
            (u.getOcupacaoAtual()==null?0:u.getOcupacaoAtual())*100.0/u.getCapacidadeAreaMonitorada();
    }
    public static String nivel(double p) { return p>=100?"LOTADO":p>=80?"ALTA":p>=50?"MODERADA":"BAIXA"; }
}
