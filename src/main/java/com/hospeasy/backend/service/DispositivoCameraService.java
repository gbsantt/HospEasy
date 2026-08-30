package com.hospeasy.backend.service;

import com.hospeasy.backend.entity.DispositivoCamera;
import com.hospeasy.backend.entity.StatusCamera;
import com.hospeasy.backend.entity.UnidadeAtendimento;

import com.hospeasy.backend.exception.DispositivoNaoAutorizadoException;

import com.hospeasy.backend.repository.DispositivoCameraRepository;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;

import java.time.LocalDateTime;

import java.util.Base64;


@Service
public class DispositivoCameraService {

    /*
     * 32 bytes = 256 bits de aleatoriedade.
     *
     * A chave é convertida para Base64 URL-safe, sem "="
     * no final, ficando apropriada para HTTP headers.
     */
    private static final int TAMANHO_CHAVE_BYTES =
            32;


    private final DispositivoCameraRepository
            dispositivoCameraRepository;


    private final SecureRandom secureRandom =
            new SecureRandom();


    public DispositivoCameraService(
            DispositivoCameraRepository
                    dispositivoCameraRepository
    ) {

        this.dispositivoCameraRepository =
                dispositivoCameraRepository;
    }


    /*
     * Cria uma câmera já ligada a uma unidade.
     *
     * A chave NÃO vem do aplicativo:
     * o backend gera uma chave imprevisível.
     */
    public DispositivoCamera cadastrarDispositivo(
            String nome,
            UnidadeAtendimento unidadeAtendimento
    ) {

        if (
                nome == null ||
                        nome.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "O nome da câmera é obrigatório"
            );
        }


        if (
                unidadeAtendimento == null ||
                        unidadeAtendimento.getId() == null
        ) {

            throw new IllegalArgumentException(
                    "A câmera precisa estar vinculada a uma unidade válida"
            );
        }


        DispositivoCamera dispositivo =
                new DispositivoCamera();


        dispositivo.setNome(
                nome.trim()
        );


        dispositivo.setChaveApi(
                gerarChaveApiUnica()
        );


        dispositivo.setUnidadeAtendimento(
                unidadeAtendimento
        );


        dispositivo.setAtivo(
                true
        );


        /*
         * Continua null até a câmera física realmente
         * enviar sua primeira medição.
         */
        dispositivo.setUltimaComunicacao(
                null
        );


        return dispositivoCameraRepository.save(
                dispositivo
        );
    }


    private String gerarChaveApiUnica() {

        String chave;


        do {

            byte[] bytes =
                    new byte[
                            TAMANHO_CHAVE_BYTES
                            ];


            secureRandom.nextBytes(
                    bytes
            );


            chave =
                    Base64
                            .getUrlEncoder()
                            .withoutPadding()
                            .encodeToString(
                                    bytes
                            );

        } while (
                dispositivoCameraRepository
                        .existsByChaveApi(
                                chave
                        )
        );


        return chave;
    }


    public boolean unidadePossuiCamera(
            Long unidadeId
    ) {

        if (
                unidadeId == null
        ) {

            return false;
        }


        return dispositivoCameraRepository
                .existsByUnidadeAtendimentoId(
                        unidadeId
                );
    }


    public DispositivoCamera validarDispositivo(
            String chaveApi,
            Long unidadeId
    ) {

        if (
                chaveApi == null ||
                        chaveApi.isBlank()
        ) {

            throw new DispositivoNaoAutorizadoException(
                    "Chave da câmera não informada"
            );
        }


        DispositivoCamera dispositivo =
                dispositivoCameraRepository
                        .findByChaveApi(
                                chaveApi
                        )
                        .orElseThrow(
                                () ->
                                        new DispositivoNaoAutorizadoException(
                                                "Chave da câmera inválida"
                                        )
                        );


        if (
                !Boolean.TRUE.equals(
                        dispositivo.getAtivo()
                )
        ) {

            throw new DispositivoNaoAutorizadoException(
                    "Dispositivo da câmera está desativado"
            );
        }


        if (
                !dispositivo
                        .getUnidadeAtendimento()
                        .getId()
                        .equals(
                                unidadeId
                        )
        ) {

            throw new DispositivoNaoAutorizadoException(
                    "Dispositivo não pertence a esta unidade"
            );
        }


        dispositivo.setUltimaComunicacao(
                LocalDateTime.now()
        );


        dispositivoCameraRepository.save(
                dispositivo
        );


        return dispositivo;
    }


    public StatusCamera calcularStatusCamera(
            DispositivoCamera dispositivo
    ) {

        if (
                !Boolean.TRUE.equals(
                        dispositivo.getAtivo()
                )
        ) {

            return StatusCamera.DESATIVADA;
        }


        if (
                dispositivo.getUltimaComunicacao()
                        == null
        ) {

            return StatusCamera.OFFLINE;
        }


        LocalDateTime agora =
                LocalDateTime.now();


        LocalDateTime limiteOnline =
                agora.minusMinutes(
                        6
                );


        LocalDateTime limiteAtrasada =
                agora.minusMinutes(
                        15
                );


        if (
                dispositivo
                        .getUltimaComunicacao()
                        .isAfter(
                                limiteOnline
                        )
        ) {

            return StatusCamera.ONLINE;
        }


        if (
                dispositivo
                        .getUltimaComunicacao()
                        .isAfter(
                                limiteAtrasada
                        )
        ) {

            return StatusCamera.ATRASADA;
        }


        return StatusCamera.OFFLINE;
    }


    public StatusCamera buscarStatusPorUnidade(
            Long unidadeId
    ) {

        DispositivoCamera dispositivo =
                dispositivoCameraRepository
                        .findFirstByUnidadeAtendimentoId(
                                unidadeId
                        )
                        .orElse(
                                null
                        );


        if (
                dispositivo == null
        ) {

            return StatusCamera.OFFLINE;
        }


        return calcularStatusCamera(
                dispositivo
        );
    }
}
