package com.hospeasy.backend.service;

import com.hospeasy.backend.entity.UnidadeAtendimento;
import com.hospeasy.backend.exception.UnidadeNaoEncontradaException;
import com.hospeasy.backend.repository.*;
import org.junit.jupiter.api.Test;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class UnidadeExclusaoTest {
    private final UnidadeAtendimentoRepository unidades = mock(UnidadeAtendimentoRepository.class);
    private final HistoricoOcupacaoRepository historico = mock(HistoricoOcupacaoRepository.class);
    private final AvaliacaoRepository avaliacoes = mock(AvaliacaoRepository.class);
    private final FavoritoRepository favoritos = mock(FavoritoRepository.class);
    private final DispositivoCameraRepository cameras = mock(DispositivoCameraRepository.class);
    private final UnidadeAtendimentoService service = new UnidadeAtendimentoService(unidades, historico,
            mock(DispositivoCameraService.class), mock(GeocodificacaoService.class), avaliacoes, favoritos, cameras);

    @Test
    void removeDependenciasAntesDaUnidade() {
        var unidade = new UnidadeAtendimento();
        when(unidades.findById(1L)).thenReturn(Optional.of(unidade));
        service.excluirUnidade(1L);
        var ordem = inOrder(historico, avaliacoes, favoritos, cameras, unidades);
        ordem.verify(historico).deleteByUnidadeAtendimentoId(1L);
        ordem.verify(avaliacoes).deleteByUnidadeAtendimentoId(1L);
        ordem.verify(favoritos).deleteByUnidadeId(1L);
        ordem.verify(cameras).deleteByUnidadeAtendimentoId(1L);
        ordem.verify(unidades).flush();
        ordem.verify(unidades).delete(unidade);
    }

    @Test
    void unidadeInexistenteNaoRemoveDependencias() {
        when(unidades.findById(9L)).thenReturn(Optional.empty());
        assertThrows(UnidadeNaoEncontradaException.class, () -> service.excluirUnidade(9L));
        verifyNoInteractions(historico, avaliacoes, favoritos, cameras);
        verify(unidades, never()).delete(any());
    }

    @Test
    void falhaEmDependenciaNaoProssegueComExclusao() {
        when(unidades.findById(1L)).thenReturn(Optional.of(new UnidadeAtendimento()));
        doThrow(new IllegalStateException("Falha de banco")).when(historico).deleteByUnidadeAtendimentoId(1L);
        assertThrows(IllegalStateException.class, () -> service.excluirUnidade(1L));
        verifyNoInteractions(avaliacoes, favoritos, cameras);
        verify(unidades, never()).delete(any());
    }
}
