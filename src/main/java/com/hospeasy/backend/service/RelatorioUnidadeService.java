package com.hospeasy.backend.service;

import com.hospeasy.backend.repository.*;
import com.hospeasy.backend.exception.UnidadeNaoEncontradaException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.apache.pdfbox.pdmodel.*;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.*;
import java.io.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class RelatorioUnidadeService {
    private final UnidadeAtendimentoRepository unidades;
    private final HistoricoOcupacaoRepository historico;
    private static final DateTimeFormatter DATA=DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");
    private static final String COLUNAS=String.format("%-19s     %7s    %8s     %s","Data/hora","Pessoas","Ocupação","Origem");
    public RelatorioUnidadeService(UnidadeAtendimentoRepository unidades,HistoricoOcupacaoRepository historico) {
        this.unidades=unidades; this.historico=historico;
    }
    @Transactional(readOnly=true)
    public byte[] gerar(Long id) throws IOException {
        var unidade=unidades.findById(id).orElseThrow(UnidadeNaoEncontradaException::new);
        var registros=historico.findTop100ByUnidadeAtendimentoIdOrderByRegistradoEmDescIdDesc(id);
        var linhas=new ArrayList<String>();
        linhas.add("HospEasy - Histórico de ocupação");
        linhas.add("Unidade #"+id+": "+unidade.getNome());
        linhas.add("Endereço: "+unidade.getEndereco());
        linhas.add("Emitido em: "+DATA.format(LocalDateTime.now()));
        linhas.add("Recorte: até 100 registros mais recentes, em ordem decrescente.");
        linhas.add("Horários conforme armazenados no servidor, sem fuso registrado.");
        linhas.add("Percentuais originais de cada medição; não recalculados pela capacidade atual.");
        linhas.add("As contagens representam a área monitorada, não toda a unidade.");
        linhas.add("Registros disponíveis neste relatório: "+registros.size());
        if(!registros.isEmpty()) {
            linhas.add("Período: "+DATA.format(registros.getLast().getRegistradoEm())+" a "+DATA.format(registros.getFirst().getRegistradoEm()));
            linhas.add(String.format(Locale.forLanguageTag("pt-BR"),"Média das amostras: %.1f pessoas | Ocupação média: %.1f%%",
                registros.stream().mapToInt(h->h.getQuantidadePessoas()).average().orElseThrow(),
                registros.stream().mapToDouble(h->h.getPercentualOcupacao()).average().orElseThrow()));
            linhas.add("Médias por amostra, sem ponderação pelo intervalo entre medições.");
        }
        linhas.add("");
        linhas.add(COLUNAS);
        if(registros.isEmpty()) linhas.add("Nenhum registro histórico disponível para esta unidade.");
        for(var h:registros) linhas.add(String.format(Locale.forLanguageTag("pt-BR"),"%s     %7d    %7.1f%%     %s",
            DATA.format(h.getRegistradoEm()),h.getQuantidadePessoas(),h.getPercentualOcupacao(),h.getOrigem()==null?"Não informada":h.getOrigem().name()));
        try(var doc=new PDDocument();var output=new ByteArrayOutputStream()) {
            var font=new PDType1Font(Standard14Fonts.FontName.COURIER);
            var wrapped=new ArrayList<String>();
            // Fixed-width wrapping keeps even long addresses inside the page margins.
            for(String line:linhas) {
                var clean=new StringBuilder();
                line.codePoints().forEach(cp->{String s=new String(Character.toChars(cp));try{font.encode(s);clean.append(s);}catch(Exception e){clean.append('?');}});
                String text=clean.toString();
                while(text.length()>83){wrapped.add(text.substring(0,83));text=text.substring(83);}
                wrapped.add(text);
            }
            int pages=(wrapped.size()+44)/45;
            for(int start=0,pageNumber=1;start<wrapped.size();start+=45,pageNumber++) {
                var page=new PDPage(PDRectangle.A4);doc.addPage(page);
                try(var content=new PDPageContentStream(doc,page)) {
                    content.beginText();content.setFont(font,10);content.setLeading(15);content.newLineAtOffset(42,790);
                    if(start>0){content.showText("HospEasy - Histórico de ocupação (continuação)");content.newLine();content.showText(COLUNAS);content.newLine();}
                    for(String line:wrapped.subList(start,Math.min(start+45,wrapped.size()))){content.showText(line);content.newLine();}
                    content.endText();
                    content.beginText();content.setFont(font,9);content.newLineAtOffset(42,35);
                    content.showText("HospEasy | Unidade #"+id+" | Página "+pageNumber+" de "+pages);content.endText();
                }
            }
            doc.save(output);return output.toByteArray();
        }
    }
}
