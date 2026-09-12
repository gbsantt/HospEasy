package com.hospeasy.backend.controller;
import com.hospeasy.backend.dto.MedicaoCameraRequestDTO;
import com.hospeasy.backend.service.DispositivoCameraService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
@RestController @RequestMapping("/cameras")
public class CameraMedicaoController {
    private final DispositivoCameraService cameras;
    public CameraMedicaoController(DispositivoCameraService cameras) { this.cameras=cameras; }
    @PostMapping("/medicoes") public ResponseEntity<Void> registrar(
        @RequestHeader(value="X-Camera-Key",required=false) String key,@Valid @RequestBody MedicaoCameraRequestDTO dto) {
        cameras.registrarMedicao(key,dto); return ResponseEntity.noContent().build();
    }
}
