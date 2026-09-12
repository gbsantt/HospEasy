package com.hospeasy.backend.service;
import com.hospeasy.backend.dto.SituacaoUnidadeResponseDTO;
import com.hospeasy.backend.entity.*;
import com.hospeasy.backend.repository.*;
import com.hospeasy.backend.exception.UnidadeNaoEncontradaException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
@Service @Transactional(readOnly=true)
public class FavoritoService {
    private final FavoritoRepository favoritos;
    private final UnidadeAtendimentoRepository unidades;
    private final SituacaoUnidadeService situacao;
    public FavoritoService(FavoritoRepository favoritos,UnidadeAtendimentoRepository unidades,SituacaoUnidadeService situacao) {
        this.favoritos=favoritos; this.unidades=unidades; this.situacao=situacao;
    }
    public List<SituacaoUnidadeResponseDTO> listar(Usuario u) {
        return situacao.calcular(favoritos.findByUsuarioIdOrderByIdDesc(u.getId()).stream().map(Favorito::getUnidade).toList());
    }
    @Transactional public SituacaoUnidadeResponseDTO adicionar(Usuario u,Long unidadeId) {
        var unidade=unidades.bloquear(unidadeId).orElseThrow(UnidadeNaoEncontradaException::new);
        if(!favoritos.existsByUsuarioIdAndUnidadeId(u.getId(),unidadeId)) {
            var f=new Favorito(); f.setUsuario(u); f.setUnidade(unidade); favoritos.saveAndFlush(f);
        }
        return situacao.calcular(List.of(unidade)).getFirst();
    }
    @Transactional public void remover(Usuario u,Long unidadeId) {
        unidades.bloquear(unidadeId); favoritos.deleteByUsuarioIdAndUnidadeId(u.getId(),unidadeId);
    }
}
