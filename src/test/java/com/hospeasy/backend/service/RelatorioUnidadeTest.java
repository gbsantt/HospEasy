package com.hospeasy.backend.service;
import com.hospeasy.backend.entity.*;
import com.hospeasy.backend.repository.*;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.junit.jupiter.api.Test;
import java.util.*;
import java.time.LocalDateTime;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class RelatorioUnidadeTest {
    @Test void reportsStoredPercentagesAndPaginatesWithoutPrivateData() throws Exception {
        var units=mock(UnidadeAtendimentoRepository.class);var history=mock(HistoricoOcupacaoRepository.class);
        var unit=new UnidadeAtendimento();unit.setId(7L);unit.setNome("Unidade de teste São José");
        unit.setEndereco("Endereço extenso para verificar quebra de linha ".repeat(6));unit.setCapacidadeAreaMonitorada(999);
        when(units.findById(7L)).thenReturn(Optional.of(unit));
        var rows=new ArrayList<HistoricoOcupacao>();
        for(int i=0;i<100;i++) {var row=new HistoricoOcupacao();row.setQuantidadePessoas(12);row.setPercentualOcupacao(75.0);row.setOrigem(OrigemMedicao.CAMERA);row.setRegistradoEm(LocalDateTime.of(2026,9,25,12,0).minusMinutes(i));rows.add(row);}
        when(history.findTop100ByUnidadeAtendimentoIdOrderByRegistradoEmDescIdDesc(7L)).thenReturn(rows);
        var bytes=new RelatorioUnidadeService(units,history).gerar(7L);
        try(var pdf=Loader.loadPDF(bytes)) {
            assertEquals(3,pdf.getNumberOfPages());
            String text=new PDFTextStripper().getText(pdf);
            assertTrue(text.contains("75,0%"));assertTrue(text.contains("São José"));assertTrue(text.contains("100"));
            assertFalse(text.contains("999"));assertFalse(text.contains("registradoPor"));
            var dir=java.nio.file.Path.of("target","report-test");java.nio.file.Files.createDirectories(dir);
            java.nio.file.Files.write(dir.resolve("relatorio.pdf"),bytes);
            var renderer=new PDFRenderer(pdf);
            for(int i=0;i<pdf.getNumberOfPages();i++) javax.imageio.ImageIO.write(renderer.renderImageWithDPI(i,110),"png",dir.resolve("page-"+i+".png").toFile());
        }
    }
    @Test void emptyHistoryDoesNotInventMeasurements() throws Exception {
        var units=mock(UnidadeAtendimentoRepository.class);var history=mock(HistoricoOcupacaoRepository.class);
        var unit=new UnidadeAtendimento();unit.setNome("Sem registros");unit.setEndereco("Rua");
        when(units.findById(1L)).thenReturn(Optional.of(unit));
        when(history.findTop100ByUnidadeAtendimentoIdOrderByRegistradoEmDescIdDesc(1L)).thenReturn(List.of());
        try(var pdf=Loader.loadPDF(new RelatorioUnidadeService(units,history).gerar(1L))) {
            String text=new PDFTextStripper().getText(pdf);assertTrue(text.contains("Nenhum registro"));assertFalse(text.contains("Ocupação média:"));
        }
    }
}
