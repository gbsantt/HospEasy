package com.hospeasy.backend.service;

import com.hospeasy.backend.dto.AtualizarOcupacaoDTO;
import com.hospeasy.backend.dto.AtualizarUnidadeRequestDTO;
import com.hospeasy.backend.dto.CadastroUnidadeResponseDTO;
import com.hospeasy.backend.dto.HistoricoOcupacaoResponseDTO;
import com.hospeasy.backend.dto.UnidadeAtendimentoRequestDTO;
import com.hospeasy.backend.dto.UnidadeAtendimentoResponseDTO;
import com.hospeasy.backend.dto.MedicaoCameraRequestDTO;
import com.hospeasy.backend.dto.SituacaoUnidadeResponseDTO;

import com.hospeasy.backend.entity.DispositivoCamera;
import com.hospeasy.backend.entity.HistoricoOcupacao;
import com.hospeasy.backend.entity.OrigemMedicao;
import com.hospeasy.backend.entity.StatusMedicao;
import com.hospeasy.backend.entity.TendenciaOcupacao;
import com.hospeasy.backend.entity.UnidadeAtendimento;
import com.hospeasy.backend.entity.Usuario;
import com.hospeasy.backend.entity.StatusCamera;
import com.hospeasy.backend.entity.RitmoOcupacao;

import com.hospeasy.backend.exception.UnidadeNaoEncontradaException;

import com.hospeasy.backend.repository.HistoricoOcupacaoRepository;
import com.hospeasy.backend.repository.UnidadeAtendimentoRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;


@Service
public class UnidadeAtendimentoService {

    private final UnidadeAtendimentoRepository
            unidadeAtendimentoRepository;

    private final HistoricoOcupacaoRepository
            historicoOcupacaoRepository;

    private final DispositivoCameraService
            dispositivoCameraService;


    private final GeocodificacaoService
            geocodificacaoService;


    public UnidadeAtendimentoService(

            UnidadeAtendimentoRepository
                    unidadeAtendimentoRepository,

            HistoricoOcupacaoRepository
                    historicoOcupacaoRepository,

            DispositivoCameraService
                    dispositivoCameraService,

            GeocodificacaoService
                    geocodificacaoService

    ) {

        this.unidadeAtendimentoRepository =
                unidadeAtendimentoRepository;

        this.historicoOcupacaoRepository =
                historicoOcupacaoRepository;

        this.dispositivoCameraService =
                dispositivoCameraService;

        this.geocodificacaoService =
                geocodificacaoService;
    }


    /*
     * LISTAR TODAS AS UNIDADES
     */
    public List<UnidadeAtendimentoResponseDTO>
    listarUnidades() {

        return unidadeAtendimentoRepository
                .findAll()
                .stream()
                .filter(
                        unidade ->
                                dispositivoCameraService
                                        .unidadePossuiCamera(
                                                unidade.getId()
                                        )
                )
                .map(
                        this::converterParaDTO
                )
                .toList();
    }


    /*
     * CADASTRAR UNIDADE + CÂMERA
     *
     * A transação garante que:
     *
     * - se a unidade for salva e a câmera falhar,
     *   a unidade também será desfeita;
     *
     * - não teremos uma nova unidade sem câmera.
     */
    @Transactional
    public CadastroUnidadeResponseDTO
    cadastrarUnidades(
            UnidadeAtendimentoRequestDTO dto
    ) {

        UnidadeAtendimento unidadeAtendimento =
                new UnidadeAtendimento();


        unidadeAtendimento.setNome(
                dto.nome().trim()
        );


        unidadeAtendimento.setEndereco(
                dto.endereco().trim()
        );


        String telefone =
                dto.telefone() == null
                        ? null
                        : dto.telefone().trim();


        unidadeAtendimento.setTelefone(
                telefone == null || telefone.isBlank()
                        ? null
                        : telefone
        );


        unidadeAtendimento
                .setCapacidadeAreaMonitorada(
                        dto.capacidadeAreaMonitorada()
                );


        unidadeAtendimento.setOcupacaoAtual(
                0
        );


        /*
         * O ADMIN não informa coordenadas.
         * O endereço é convertido automaticamente.
         */
        GeocodificacaoService.Coordenadas coordenadas =
                geocodificacaoService.geocodificar(
                        dto.endereco()
                );


        unidadeAtendimento.setLatitude(
                coordenadas.latitude()
        );


        unidadeAtendimento.setLongitude(
                coordenadas.longitude()
        );


        unidadeAtendimento.setTipo(
                dto.tipo()
        );


        UnidadeAtendimento unidadeSalva =
                unidadeAtendimentoRepository.save(
                        unidadeAtendimento
                );


        /*
         * A câmera é criada na MESMA transação e já
         * recebe a unidade recém-cadastrada.
         */
        DispositivoCamera camera =
                dispositivoCameraService
                        .cadastrarDispositivo(
                                dto.nomeCamera(),
                                unidadeSalva
                        );


        return new CadastroUnidadeResponseDTO(

                converterParaDTO(
                        unidadeSalva
                ),

                camera.getId(),

                camera.getNome(),

                camera.getChaveApi()
        );
    }


    /*
     * BUSCAR UNIDADE POR ID
     */
    public UnidadeAtendimentoResponseDTO
    buscarPorId(
            Long id
    ) {

        UnidadeAtendimento unidadeAtendimento =
                unidadeAtendimentoRepository
                        .findById(
                                id
                        )
                        .orElseThrow(
                                UnidadeNaoEncontradaException::new
                        );


        return converterParaDTO(
                unidadeAtendimento
        );
    }


    /*
     * ATUALIZAR DADOS CADASTRAIS DA UNIDADE
     *
     * Não altera ocupação atual nem histórico.
     */
    public UnidadeAtendimentoResponseDTO
    atualizarUnidade(

            Long id,

            AtualizarUnidadeRequestDTO dto

    ) {

        UnidadeAtendimento unidadeAtendimento =
                unidadeAtendimentoRepository
                        .findById(
                                id
                        )
                        .orElseThrow(
                                UnidadeNaoEncontradaException::new
                        );


        if (
                unidadeAtendimento.getOcupacaoAtual() != null
                        &&
                        dto.capacidadeAreaMonitorada()
                                < unidadeAtendimento.getOcupacaoAtual()
        ) {

            throw new IllegalArgumentException(
                    "A capacidade da área monitorada não pode ser menor que a ocupação atual"
            );
        }


        unidadeAtendimento.setNome(
                dto.nome().trim()
        );

        String enderecoAnterior =
                unidadeAtendimento
                        .getEndereco();


        String novoEndereco =
                dto.endereco()
                        .trim();


        /*
         * Só consulta o geocodificador quando o endereço
         * realmente mudou. Assim, editar telefone, nome,
         * capacidade ou tipo não faz uma nova consulta
         * desnecessária.
         */
        if (
                enderecoAnterior == null
                        ||
                        !enderecoAnterior
                                .trim()
                                .equalsIgnoreCase(
                                        novoEndereco
                                )
        ) {

            GeocodificacaoService.Coordenadas coordenadas =
                    geocodificacaoService.geocodificar(
                            novoEndereco
                    );


            unidadeAtendimento.setLatitude(
                    coordenadas.latitude()
            );


            unidadeAtendimento.setLongitude(
                    coordenadas.longitude()
            );
        }


        unidadeAtendimento.setEndereco(
                novoEndereco
        );


        String telefone =
                dto.telefone() == null
                        ? null
                        : dto.telefone().trim();

        unidadeAtendimento.setTelefone(
                telefone == null || telefone.isBlank()
                        ? null
                        : telefone
        );

        unidadeAtendimento.setCapacidadeAreaMonitorada(
                dto.capacidadeAreaMonitorada()
        );

        unidadeAtendimento.setTipo(
                dto.tipo()
        );


        UnidadeAtendimento unidadeSalva =
                unidadeAtendimentoRepository.save(
                        unidadeAtendimento
                );


        return converterParaDTO(
                unidadeSalva
        );
    }


    /*
     * ATUALIZAÇÃO MANUAL DE OCUPAÇÃO
     *
     * Mantida temporariamente para não quebrar
     * o controller atual.
     *
     * Depois podemos remover esse endpoint
     * completamente, deixando a ocupação ser
     * atualizada somente pela câmera.
     */
    public UnidadeAtendimentoResponseDTO
    atualizarOcupacao(

            Long id,

            AtualizarOcupacaoDTO dto,

            Usuario usuario

    ) {

        UnidadeAtendimento unidadeAtendimento =
                unidadeAtendimentoRepository
                        .findById(
                                id
                        )
                        .orElseThrow(
                                UnidadeNaoEncontradaException::new
                        );


        int quantidade =
                dto.quantidadePessoas();


        if (
                quantidade >
                        unidadeAtendimento
                                .getCapacidadeAreaMonitorada()
        ) {

            throw new IllegalArgumentException(
                    "A ocupação não pode ser maior que a capacidade da área monitorada"
            );
        }


        if (
                quantidade < 0
        ) {

            throw new IllegalArgumentException(
                    "A ocupação não pode ser negativa"
            );
        }


        unidadeAtendimento.setOcupacaoAtual(
                quantidade
        );


        unidadeAtendimento.setUltimaAtualizacao(
                LocalDateTime.now()
        );


        UnidadeAtendimento unidadeAtendimentoSalvo =
                unidadeAtendimentoRepository
                        .save(
                                unidadeAtendimento
                        );


        double percentual =
                calcularPercentual(
                        unidadeAtendimento
                );


        HistoricoOcupacao historico =
                new HistoricoOcupacao();


        historico.setUnidadeAtendimento(
                unidadeAtendimento
        );


        historico.setQuantidadePessoas(
                quantidade
        );


        historico.setPercentualOcupacao(
                percentual
        );


        historico.setRegistradoPor(
                usuario
        );


        historico.setOrigem(
                OrigemMedicao.MANUAL
        );


        historicoOcupacaoRepository.save(
                historico
        );


        return converterParaDTO(
                unidadeAtendimentoSalvo
        );
    }


    /*
     * HISTÓRICO DA UNIDADE
     */
    public List<HistoricoOcupacaoResponseDTO>
    buscarHistorico(
            Long unidadeId
    ) {

        if (
                !unidadeAtendimentoRepository
                        .existsById(
                                unidadeId
                        )
        ) {

            throw new UnidadeNaoEncontradaException();
        }


        return historicoOcupacaoRepository
                .findByUnidadeAtendimentoIdOrderByRegistradoEmDesc(
                        unidadeId
                )
                .stream()
                .map(
                        historico ->
                                new HistoricoOcupacaoResponseDTO(

                                        historico.getId(),

                                        historico
                                                .getUnidadeAtendimento()
                                                .getId(),

                                        historico
                                                .getQuantidadePessoas(),

                                        historico
                                                .getPercentualOcupacao(),

                                        historico
                                                .getRegistradoEm(),

                                        historico
                                                .getRegistradoPor()
                                                != null
                                                ? historico
                                                .getRegistradoPor()
                                                .getId()
                                                : null,

                                        historico
                                                .getRegistradoPor()
                                                != null
                                                ? historico
                                                .getRegistradoPor()
                                                .getNome()
                                                : null,

                                        historico
                                                .getOrigem()
                                )
                )
                .toList();
    }


    /*
     * SITUAÇÃO ATUAL DA UNIDADE
     */
    public SituacaoUnidadeResponseDTO
    buscarSituacaoAtual(
            Long unidadeId
    ) {

        UnidadeAtendimento unidadeAtendimento =
                unidadeAtendimentoRepository
                        .findById(
                                unidadeId
                        )
                        .orElseThrow(
                                UnidadeNaoEncontradaException::new
                        );


        double percentual =
                calcularPercentual(
                        unidadeAtendimento
                );


        double media =
                calcularMediaUltimasMedicoes(
                        unidadeId
                );


        TendenciaOcupacao tendencia =
                calcularTendencia(
                        unidadeId
                );


        return new SituacaoUnidadeResponseDTO(

                unidadeAtendimento.getId(),

                unidadeAtendimento.getNome(),

                unidadeAtendimento.getEndereco(),

                unidadeAtendimento.getTelefone(),

                unidadeAtendimento.getLatitude(),

                unidadeAtendimento.getLongitude(),

                unidadeAtendimento
                        .getCapacidadeAreaMonitorada(),

                unidadeAtendimento
                        .getOcupacaoAtual(),

                percentual,

                calcularNivelOcupacao(
                        percentual
                ),

                media,

                tendencia,

                unidadeAtendimento
                        .getUltimaAtualizacao(),

                verificarStatusMedicao(
                        unidadeId
                ),

                dispositivoCameraService
                        .buscarStatusPorUnidade(
                                unidadeId
                        ),

                calcularRitmoOcupacao(
                        unidadeId
                )
        );
    }


    /*
     * STATUS DA MEDIÇÃO
     */
    public StatusMedicao verificarStatusMedicao(
            Long unidadeId
    ) {

        var ultimaMedicao =
                historicoOcupacaoRepository
                        .findFirstByUnidadeAtendimentoIdAndOrigemOrderByRegistradoEmDesc(
                                unidadeId,
                                OrigemMedicao.CAMERA
                        );


        if (
                ultimaMedicao.isEmpty()
        ) {

            return StatusMedicao.SEM_DADOS;
        }


        LocalDateTime limite =
                LocalDateTime
                        .now()
                        .minusMinutes(
                                6
                        );


        if (
                ultimaMedicao
                        .get()
                        .getRegistradoEm()
                        .isBefore(
                                limite
                        )
        ) {

            return StatusMedicao.DESATUALIZADA;
        }


        return StatusMedicao.ATUALIZADA;
    }


    /*
     * REGISTRAR MEDIÇÃO DA CÂMERA
     */
    public UnidadeAtendimentoResponseDTO
    registrarMedicaoCamera(

            Long unidadeId,

            MedicaoCameraRequestDTO dto

    ) {

        UnidadeAtendimento unidadeAtendimento =
                unidadeAtendimentoRepository
                        .findById(
                                unidadeId
                        )
                        .orElseThrow(
                                UnidadeNaoEncontradaException::new
                        );


        int quantidade =
                dto.quantidadePessoas();


        if (
                quantidade >
                        unidadeAtendimento
                                .getCapacidadeAreaMonitorada()
        ) {

            throw new IllegalArgumentException(
                    "A ocupação não pode ser maior que a capacidade da área monitorada"
            );
        }


        if (
                quantidade < 0
        ) {

            throw new IllegalArgumentException(
                    "A ocupação não pode ser negativa"
            );
        }


        unidadeAtendimento.setOcupacaoAtual(
                quantidade
        );


        unidadeAtendimento.setUltimaAtualizacao(
                LocalDateTime.now()
        );


        UnidadeAtendimento unidadeAtendimentoSalvo =
                unidadeAtendimentoRepository
                        .save(
                                unidadeAtendimento
                        );


        double percentual =
                calcularPercentual(
                        unidadeAtendimento
                );


        HistoricoOcupacao historico =
                new HistoricoOcupacao();


        historico.setUnidadeAtendimento(
                unidadeAtendimento
        );


        historico.setQuantidadePessoas(
                quantidade
        );


        historico.setPercentualOcupacao(
                percentual
        );


        historico.setRegistradoPor(
                null
        );


        historico.setOrigem(
                OrigemMedicao.CAMERA
        );


        historicoOcupacaoRepository.save(
                historico
        );


        return converterParaDTO(
                unidadeAtendimentoSalvo
        );
    }


    /*
     * MÉDIA DOS ÚLTIMOS 30 MINUTOS
     */
    public double calcularMediaUltimasMedicoes(
            Long unidadeId
    ) {

        LocalDateTime inicioJanela =
                LocalDateTime
                        .now()
                        .minusMinutes(
                                30
                        );


        List<HistoricoOcupacao> medicoes =
                historicoOcupacaoRepository
                        .findByUnidadeAtendimentoIdAndOrigemAndRegistradoEmAfterOrderByRegistradoEmDesc(

                                unidadeId,

                                OrigemMedicao.CAMERA,

                                inicioJanela
                        );


        if (
                medicoes.isEmpty()
        ) {

            return 0;
        }


        return medicoes
                .stream()
                .mapToInt(
                        HistoricoOcupacao::getQuantidadePessoas
                )
                .average()
                .orElse(
                        0
                );
    }


    /*
     * TENDÊNCIA
     */
    public TendenciaOcupacao calcularTendencia(
            Long unidadeId
    ) {

        LocalDateTime inicioJanela =
                LocalDateTime
                        .now()
                        .minusMinutes(
                                30
                        );


        List<HistoricoOcupacao> medicoes =
                historicoOcupacaoRepository
                        .findByUnidadeAtendimentoIdAndOrigemAndRegistradoEmAfterOrderByRegistradoEmDesc(

                                unidadeId,

                                OrigemMedicao.CAMERA,

                                inicioJanela
                        );


        if (
                medicoes.size() < 2
        ) {

            return TendenciaOcupacao.ESTAVEL;
        }


        double mediaRecente =
                medicoes
                        .stream()
                        .limit(
                                3
                        )
                        .mapToInt(
                                HistoricoOcupacao::getQuantidadePessoas
                        )
                        .average()
                        .orElse(
                                0
                        );


        double mediaAntiga =
                medicoes
                        .stream()
                        .skip(
                                Math.max(
                                        0,
                                        medicoes.size() - 3
                                )
                        )
                        .mapToInt(
                                HistoricoOcupacao::getQuantidadePessoas
                        )
                        .average()
                        .orElse(
                                0
                        );


        double diferenca =
                mediaRecente
                        - mediaAntiga;


        if (
                diferenca >= 3
        ) {

            return TendenciaOcupacao.AUMENTANDO;
        }


        if (
                diferenca <= -3
        ) {

            return TendenciaOcupacao.DIMINUINDO;
        }


        return TendenciaOcupacao.ESTAVEL;
    }


    /*
     * LISTAR SITUAÇÕES
     */
    public List<SituacaoUnidadeResponseDTO>
    listarSituacoes() {

        return unidadeAtendimentoRepository
                .findAll()
                .stream()
                .filter(
                        unidadeAtendimento ->
                                dispositivoCameraService
                                        .unidadePossuiCamera(
                                                unidadeAtendimento.getId()
                                        )
                )
                .map(
                        unidadeAtendimento ->
                                buscarSituacaoAtual(
                                        unidadeAtendimento
                                                .getId()
                                )
                )
                .toList();
    }


    /*
     * LISTAR SITUAÇÕES ORDENADAS
     */
    public List<SituacaoUnidadeResponseDTO>
    listarSituacoesOrdenadasPorOcupacao() {

        return unidadeAtendimentoRepository
                .findAll()
                .stream()
                .filter(
                        unidade ->
                                dispositivoCameraService
                                        .unidadePossuiCamera(
                                                unidade.getId()
                                        )
                )
                .map(
                        unidade ->
                                buscarSituacaoAtual(
                                        unidade.getId()
                                )
                )
                .sorted(

                        java.util.Comparator
                                .comparingInt(
                                        this::prioridadeDisponibilidade
                                )
                                .thenComparingDouble(
                                        SituacaoUnidadeResponseDTO
                                                ::percentualOcupacao
                                )
                )
                .toList();
    }


    /*
     * RITMO DE OCUPAÇÃO
     */
    public RitmoOcupacao calcularRitmoOcupacao(
            Long unidadeId
    ) {

        LocalDateTime inicioJanela =
                LocalDateTime
                        .now()
                        .minusMinutes(
                                30
                        );


        List<HistoricoOcupacao> medicoes =
                historicoOcupacaoRepository
                        .findByUnidadeAtendimentoIdAndOrigemAndRegistradoEmAfterOrderByRegistradoEmDesc(

                                unidadeId,

                                OrigemMedicao.CAMERA,

                                inicioJanela
                        );


        if (
                medicoes.size() < 4
        ) {

            return RitmoOcupacao
                    .DADOS_INSUFICIENTES;
        }


        double mediaRecente =
                medicoes
                        .stream()
                        .limit(
                                3
                        )
                        .mapToInt(
                                HistoricoOcupacao::getQuantidadePessoas
                        )
                        .average()
                        .orElse(
                                0
                        );


        double mediaAntiga =
                medicoes
                        .stream()
                        .skip(
                                Math.max(
                                        0,
                                        medicoes.size() - 3
                                )
                        )
                        .mapToInt(
                                HistoricoOcupacao::getQuantidadePessoas
                        )
                        .average()
                        .orElse(
                                0
                        );


        double diferenca =
                mediaRecente
                        - mediaAntiga;


        if (
                diferenca <= -10
        ) {

            return RitmoOcupacao
                    .ESVAZIANDO_RAPIDO;
        }


        if (
                diferenca <= -3
        ) {

            return RitmoOcupacao
                    .ESVAZIANDO;
        }


        if (
                diferenca >= 10
        ) {

            return RitmoOcupacao
                    .AUMENTANDO_RAPIDO;
        }


        if (
                diferenca >= 3
        ) {

            return RitmoOcupacao
                    .AUMENTANDO;
        }


        return RitmoOcupacao
                .ESTAVEL;
    }


    /*
     * PRIORIDADE PARA ORDENAÇÃO
     */
    private int prioridadeDisponibilidade(
            SituacaoUnidadeResponseDTO situacao
    ) {

        if (
                situacao.statusCamera()
                        == StatusCamera.ONLINE

                        &&

                        situacao.statusMedicao()
                                == StatusMedicao.ATUALIZADA
        ) {

            return 0;
        }


        if (
                situacao.statusCamera()
                        == StatusCamera.ATRASADA
        ) {

            return 1;
        }


        return 2;
    }


    /*
     * ENTITY -> DTO
     */
    private UnidadeAtendimentoResponseDTO
    converterParaDTO(
            UnidadeAtendimento unidadeAtendimento
    ) {

        double percentual =
                calcularPercentual(
                        unidadeAtendimento
                );


        return new UnidadeAtendimentoResponseDTO(

                unidadeAtendimento.getId(),

                unidadeAtendimento.getNome(),

                unidadeAtendimento.getEndereco(),

                unidadeAtendimento.getTelefone(),

                unidadeAtendimento
                        .getCapacidadeAreaMonitorada(),

                unidadeAtendimento
                        .getOcupacaoAtual(),

                percentual,

                calcularNivelOcupacao(
                        percentual
                ),

                unidadeAtendimento
                        .getLatitude(),

                unidadeAtendimento
                        .getLongitude(),

                unidadeAtendimento
                        .getUltimaAtualizacao(),

                unidadeAtendimento
                        .getTipo()
        );
    }


    /*
     * CALCULAR PERCENTUAL
     */
    private double calcularPercentual(
            UnidadeAtendimento unidadeAtendimento
    ) {

        if (
                unidadeAtendimento
                        .getCapacidadeAreaMonitorada()
                        == null

                        ||

                        unidadeAtendimento
                                .getCapacidadeAreaMonitorada()
                                <= 0
        ) {

            return 0;
        }


        return (
                unidadeAtendimento
                        .getOcupacaoAtual()
                        * 100.0
        )
                /
                unidadeAtendimento
                        .getCapacidadeAreaMonitorada();
    }


    /*
     * NÍVEL DE OCUPAÇÃO
     */
    private String calcularNivelOcupacao(
            double percentual
    ) {

        if (
                percentual >= 100
        ) {

            return "LOTADO";
        }


        if (
                percentual >= 80
        ) {

            return "ALTA";
        }


        if (
                percentual >= 50
        ) {

            return "MODERADA";
        }


        return "BAIXA";
    }


}