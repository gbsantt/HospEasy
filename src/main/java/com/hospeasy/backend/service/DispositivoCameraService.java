package com.hospeasy.backend.service;

import com.hospeasy.backend.entity.DispositivoCamera;
import com.hospeasy.backend.repository.DispositivoCameraRepository;
import org.springframework.stereotype.Service;
import com.hospeasy.backend.exception.DispositivoNaoAutorizadoException;
import java.time.LocalDateTime;
import com.hospeasy.backend.entity.StatusCamera;
import java.time.LocalDateTime;

@Service
public class DispositivoCameraService {

    private final DispositivoCameraRepository dispositivoCameraRepository;


    public DispositivoCameraService(
            DispositivoCameraRepository dispositivoCameraRepository
    ) {
        this.dispositivoCameraRepository = dispositivoCameraRepository;
    }

    public DispositivoCamera validarDispositivo(
            String chaveApi,
            Long unidadeId
    ) {

        if (chaveApi == null || chaveApi.isBlank()) {
            throw new DispositivoNaoAutorizadoException(
                    "Chave da câmera não informada"
            );
        }

        DispositivoCamera dispositivo = dispositivoCameraRepository
                .findByChaveApi(chaveApi)
                .orElseThrow(() ->
                        new DispositivoNaoAutorizadoException(
                                "Chave da câmera inválida"
                        )
                );

        if (!Boolean.TRUE.equals(dispositivo.getAtivo())) {
            throw new DispositivoNaoAutorizadoException(
                    "Dispositivo da câmera está desativado"
            );
        }

        if (!dispositivo.getUnidadeAtendimento().getId().equals(unidadeId)) {
            throw new DispositivoNaoAutorizadoException(
                    "Dispositivo não pertence a esta unidade"
            );
        }

        dispositivo.setUltimaComunicacao(LocalDateTime.now());

        dispositivoCameraRepository.save(dispositivo);

        return dispositivo;
    }

    public StatusCamera calcularStatusCamera(
            DispositivoCamera dispositivo
    ) {

        if (!Boolean.TRUE.equals(dispositivo.getAtivo())) {
            return StatusCamera.DESATIVADA;
        }

        if (dispositivo.getUltimaComunicacao() == null) {
            return StatusCamera.OFFLINE;
        }

        LocalDateTime agora = LocalDateTime.now();

        LocalDateTime limiteOnline =
                agora.minusMinutes(6);

        LocalDateTime limiteAtrasada =
                agora.minusMinutes(15);

        if (dispositivo.getUltimaComunicacao()
                .isAfter(limiteOnline)) {

            return StatusCamera.ONLINE;
        }

        if (dispositivo.getUltimaComunicacao()
                .isAfter(limiteAtrasada)) {

            return StatusCamera.ATRASADA;
        }

        return StatusCamera.OFFLINE;
    }

    public StatusCamera buscarStatusPorUnidade(Long unidadeId) {

        DispositivoCamera dispositivo =
                dispositivoCameraRepository
                        .findFirstByUnidadeAtendimentoId(unidadeId)
                        .orElse(null);

        if (dispositivo == null) {
            return StatusCamera.OFFLINE;
        }

        return calcularStatusCamera(dispositivo);
    }
}