package com.hospeasy.backend.controller;
import com.hospeasy.backend.dto.*;
import com.hospeasy.backend.service.DispositivoCameraService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import java.util.List;
@RestController @RequestMapping("/admin")
public class DispositivoCameraAdminController {
    private final DispositivoCameraService cameras;
    public DispositivoCameraAdminController(DispositivoCameraService cameras) { this.cameras=cameras; }
    @GetMapping("/unidades/{id}/dispositivos") public List<DispositivoResponseDTO> listar(@PathVariable Long id) { return cameras.listar(id); }
    @PostMapping("/unidades/{id}/dispositivos") public ResponseEntity<CredencialCameraResponseDTO> criar(@PathVariable Long id,@Valid @RequestBody CriarDispositivoRequestDTO dto) {
        return ResponseEntity.status(201).cacheControl(CacheControl.noStore()).body(cameras.cadastrar(id,dto));
    }
    @PatchMapping("/dispositivos/{id}") public DispositivoResponseDTO atualizar(@PathVariable Long id,@Valid @RequestBody AtualizarDispositivoRequestDTO dto) { return cameras.atualizar(id,dto); }
    @PostMapping("/dispositivos/{id}/revogar-chave") public DispositivoResponseDTO revogar(@PathVariable Long id) { return cameras.revogar(id); }
    @PostMapping("/dispositivos/{id}/regenerar-chave") public ResponseEntity<CredencialCameraResponseDTO> regenerar(@PathVariable Long id) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(cameras.regenerar(id));
    }
}
