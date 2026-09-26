package com.hospeasy.backend.controller;

import com.hospeasy.backend.service.RelatorioUnidadeService;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;

@RestController
public class RelatorioUnidadeController {
    private final RelatorioUnidadeService service;
    public RelatorioUnidadeController(RelatorioUnidadeService service){this.service=service;}
    @GetMapping(value="/unidades/{id}/relatorio.pdf",produces=MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> baixar(@PathVariable Long id) throws IOException {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
            .header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=\"unidade-"+id+"-ocupacao.pdf\"")
            .contentType(MediaType.APPLICATION_PDF).body(service.gerar(id));
    }
}
