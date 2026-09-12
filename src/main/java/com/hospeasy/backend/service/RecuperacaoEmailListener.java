package com.hospeasy.backend.service;
import org.springframework.stereotype.Component;
import org.springframework.scheduling.annotation.Async;
import org.springframework.transaction.event.*;
@Component
public class RecuperacaoEmailListener {
    private final EmailService email;
    public RecuperacaoEmailListener(EmailService email) { this.email=email; }
    @Async("emailExecutor") @TransactionalEventListener(phase=TransactionPhase.AFTER_COMMIT)
    public void enviar(RecuperacaoSenhaService.CodigoEmail event) {
        try { email.enviarCodigoRecuperacao(event.email(),event.codigo()); }
        catch(Exception e) { org.slf4j.LoggerFactory.getLogger(getClass()).warn("Não foi possível entregar e-mail de recuperação."); }
    }
}
