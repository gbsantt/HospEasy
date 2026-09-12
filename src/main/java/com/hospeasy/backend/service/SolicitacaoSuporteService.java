package com.hospeasy.backend.service;
import com.hospeasy.backend.dto.*;
import com.hospeasy.backend.entity.*;
import com.hospeasy.backend.repository.SolicitacaoSuporteRepository;
import com.hospeasy.backend.exception.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.*;
@Service @Transactional(readOnly=true)
public class SolicitacaoSuporteService {
    private final SolicitacaoSuporteRepository repository;
    public SolicitacaoSuporteService(SolicitacaoSuporteRepository repository) { this.repository=repository; }
    @Transactional public SolicitacaoSuporteResponseDTO criar(Usuario usuario,CriarSolicitacaoSuporteRequestDTO dto) {
        var s=new SolicitacaoSuporte(); s.setUsuario(usuario); s.setAssunto(dto.assunto().trim());
        s.setCategoria(dto.categoria()); s.setDescricao(dto.descricao().trim()); s.setStatus(StatusSuporte.ABERTO);
        return detalhe(repository.saveAndFlush(s));
    }
    public PaginaDTO<SolicitacaoSuporteResumoDTO> listar(Long usuarioId,StatusSuporte status,CategoriaSuporte categoria,int page,int size) {
        if(page<0 || size<1 || size>100) throw new ApiException(400,"PAGINACAO_INVALIDA","Use página a partir de zero e tamanho entre 1 e 100.");
        return PaginaDTO.de(repository.pesquisar(usuarioId,status,categoria,
            PageRequest.of(page,size,Sort.by(Sort.Order.desc("createdAt"),Sort.Order.desc("id"))))
            .map(s->new SolicitacaoSuporteResumoDTO(s.getId(),s.getAssunto(),s.getCategoria(),s.getStatus(),s.getCreatedAt(),s.getUpdatedAt())));
    }
    public SolicitacaoSuporteResponseDTO buscarPropria(Long id,Long usuarioId) {
        return detalhe(repository.findByIdAndUsuarioId(id,usuarioId).orElseThrow(this::missing));
    }
    public SolicitacaoSuporteAdminResponseDTO buscarAdmin(Long id) { return admin(repository.findById(id).orElseThrow(this::missing)); }
    @Transactional public SolicitacaoSuporteAdminResponseDTO atualizar(Long id,AtualizarStatusSuporteRequestDTO dto) {
        var s=repository.findById(id).orElseThrow(this::missing);
        if(s.getVersion()!=dto.version()) throw new ApiException(409,"SUPORTE_ALTERADO","Esta solicitação foi alterada. Atualize antes de continuar.");
        s.setStatus(dto.status()); repository.flush(); return admin(s);
    }
    private ApiException missing() { return new ApiException(404,"SUPORTE_NAO_ENCONTRADO","Solicitação não encontrada."); }
    private SolicitacaoSuporteResponseDTO detalhe(SolicitacaoSuporte s) {
        return new SolicitacaoSuporteResponseDTO(s.getId(),s.getAssunto(),s.getCategoria(),s.getDescricao(),s.getStatus(),s.getCreatedAt(),s.getUpdatedAt(),s.getVersion());
    }
    private SolicitacaoSuporteAdminResponseDTO admin(SolicitacaoSuporte s) {
        return new SolicitacaoSuporteAdminResponseDTO(detalhe(s),s.getUsuario().getId(),s.getUsuario().getNome(),s.getUsuario().getEmail());
    }
}
