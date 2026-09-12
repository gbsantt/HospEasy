package com.hospeasy.backend.service;
import com.hospeasy.backend.entity.*;
import com.hospeasy.backend.dto.*;
import com.hospeasy.backend.repository.*;
import com.hospeasy.backend.exception.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.*;
import java.util.*;
@Service
@Transactional
public class DispositivoCameraService {
    @jakarta.persistence.PersistenceContext
    private jakarta.persistence.EntityManager entityManager;
    private final DispositivoCameraRepository dispositivos;
    private final UnidadeAtendimentoRepository unidades;
    private final HistoricoOcupacaoRepository historico;
    private final SecureRandom random=new SecureRandom();
    public DispositivoCameraService(DispositivoCameraRepository dispositivos,UnidadeAtendimentoRepository unidades,HistoricoOcupacaoRepository historico) {
        this.dispositivos=dispositivos; this.unidades=unidades; this.historico=historico;
    }
    public CredencialCameraResponseDTO cadastrar(Long unidadeId,CriarDispositivoRequestDTO dto) {
        var unidade=unidadeBloqueada(unidadeId);
        verificarAtiva(unidadeId,-1L,dto.ativo());
        var d=new DispositivoCamera(); d.setNome(dto.nome().trim()); d.setUnidadeAtendimento(unidade); d.setAtivo(dto.ativo());
        String key=novaChave(); d.setChaveHash(hash(key)); d.setChaveGeradaEm(Instant.now());
        dispositivos.saveAndFlush(d);
        return new CredencialCameraResponseDTO(resposta(d),key);
    }
    @Transactional(readOnly=true) public List<DispositivoResponseDTO> listar(Long unidadeId) {
        if(!unidades.existsById(unidadeId)) throw new UnidadeNaoEncontradaException();
        return dispositivos.findByUnidadeAtendimentoIdOrderById(unidadeId).stream().map(this::resposta).toList();
    }
    public DispositivoResponseDTO atualizar(Long id,AtualizarDispositivoRequestDTO dto) {
        var d=bloquearDispositivo(id);
        if(d.getVersion()!=dto.version()) throw new ApiException(409,"DISPOSITIVO_ALTERADO","O dispositivo foi alterado. Atualize a lista.");
        if(dto.ativo() && d.getChaveRevogadaEm()!=null) throw new ApiException(409,"CHAVE_REVOGADA","Gere uma nova chave antes de ativar.");
        verificarAtiva(d.getUnidadeAtendimento().getId(),id,dto.ativo());
        d.setNome(dto.nome().trim()); d.setAtivo(dto.ativo()); dispositivos.flush(); return resposta(d);
    }
    public DispositivoResponseDTO revogar(Long id) {
        var d=bloquearDispositivo(id); d.setChaveRevogadaEm(Instant.now()); d.setAtivo(false);
        dispositivos.flush(); return resposta(d);
    }
    public CredencialCameraResponseDTO regenerar(Long id) {
        var d=bloquearDispositivo(id); String key=novaChave();
        d.setChaveHash(hash(key)); d.setChaveRevogadaEm(null); d.setChaveGeradaEm(Instant.now());
        d.setUltimaComunicacao(null); dispositivos.flush(); return new CredencialCameraResponseDTO(resposta(d),key);
    }
    public void registrarMedicao(String key,MedicaoCameraRequestDTO dto) {
        if(key==null || key.isBlank() || key.length()>256) throw naoAutorizado();
        String digest=hash(key);
        var encontrado=dispositivos.findByChaveHash(digest).orElseThrow(this::naoAutorizado);
        if(encontrado.getUnidadeAtendimento()==null) throw naoAutorizado();
        var unidade=unidadeBloqueada(encontrado.getUnidadeAtendimento().getId());
        var d=dispositivos.bloquear(encontrado.getId()).orElseThrow(this::naoAutorizado);
        entityManager.refresh(d,jakarta.persistence.LockModeType.PESSIMISTIC_WRITE);
        if(!MessageDigest.isEqual(digest.getBytes(StandardCharsets.US_ASCII),d.getChaveHash().getBytes(StandardCharsets.US_ASCII))
            || !Boolean.TRUE.equals(d.getAtivo()) || d.getChaveRevogadaEm()!=null) throw naoAutorizado();
        int quantidade=dto.quantidadePessoas();
        if(dto.medicaoId()!=null && historico.existsByDispositivoIdAndMedicaoId(d.getId(),dto.medicaoId())) return;
        if(quantidade<0 || quantidade>unidade.getCapacidadeAreaMonitorada())
            throw new ApiException(400,"OCUPACAO_INVALIDA","A quantidade deve estar entre zero e a capacidade da área monitorada.");
        var now=LocalDateTime.now();
        unidade.setOcupacaoAtual(quantidade); unidade.setUltimaAtualizacao(now);
        var h=new HistoricoOcupacao(); h.setUnidadeAtendimento(unidade); h.setDispositivo(d);
        h.setMedicaoId(dto.medicaoId());
        h.setQuantidadePessoas(quantidade); h.setPercentualOcupacao(quantidade*100.0/unidade.getCapacidadeAreaMonitorada());
        h.setRegistradoEm(now); h.setOrigem(OrigemMedicao.CAMERA); historico.save(h);
        d.setUltimaComunicacao(now);
        // All changes commit together; callers never see an accepted response before commit.
        historico.flush();
    }
    private DispositivoCamera bloquearDispositivo(Long id) {
        var d=dispositivos.findById(id).orElseThrow(()->new ApiException(404,"DISPOSITIVO_NAO_ENCONTRADO","Dispositivo não encontrado."));
        unidadeBloqueada(d.getUnidadeAtendimento().getId());
        d=dispositivos.bloquear(id).orElseThrow(()->new ApiException(404,"DISPOSITIVO_NAO_ENCONTRADO","Dispositivo não encontrado."));
        entityManager.refresh(d,jakarta.persistence.LockModeType.PESSIMISTIC_WRITE);
        return d;
    }
    private UnidadeAtendimento unidadeBloqueada(Long id) { return unidades.bloquear(id).orElseThrow(UnidadeNaoEncontradaException::new); }
    private void verificarAtiva(Long unidadeId,Long id,boolean ativo) {
        if(ativo && dispositivos.existsByUnidadeAtendimentoIdAndAtivoTrueAndIdNot(unidadeId,id))
            throw new ApiException(409,"CAMERA_ATIVA_EXISTENTE","Desative a câmera atual antes de ativar outra nesta unidade.");
    }
    private ApiException naoAutorizado() { return new ApiException(401,"CAMERA_NAO_AUTORIZADA","Credencial de câmera inválida ou indisponível."); }
    private String novaChave() { byte[] bytes=new byte[32]; random.nextBytes(bytes); return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes); }
    public static String hash(String key) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(key.getBytes(StandardCharsets.UTF_8))); }
        catch(NoSuchAlgorithmException e) { throw new IllegalStateException("Hash indisponível"); }
    }
    public static StatusCamera status(DispositivoCamera d) {
        if(d==null) return StatusCamera.SEM_CAMERA;
        if(!Boolean.TRUE.equals(d.getAtivo()) || d.getChaveRevogadaEm()!=null) return StatusCamera.DESATIVADA;
        var last=d.getUltimaComunicacao();
        if(last==null || last.isBefore(LocalDateTime.now().minusMinutes(15))) return StatusCamera.OFFLINE;
        if(last.isBefore(LocalDateTime.now().minusMinutes(6))) return StatusCamera.ATRASADA;
        return StatusCamera.ONLINE;
    }
    private DispositivoResponseDTO resposta(DispositivoCamera d) {
        return new DispositivoResponseDTO(d.getId(),d.getNome(),d.getUnidadeAtendimento().getId(),
            Boolean.TRUE.equals(d.getAtivo()),d.getChaveRevogadaEm()!=null,status(d),d.getUltimaComunicacao(),
            d.getChaveGeradaEm(),d.getCreatedAt(),d.getUpdatedAt(),d.getVersion());
    }
}
