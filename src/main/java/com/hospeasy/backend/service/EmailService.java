package com.hospeasy.backend.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;


@Service
public class EmailService {

    private final JavaMailSender mailSender;


    public EmailService(
            JavaMailSender mailSender
    ) {

        this.mailSender =
                mailSender;
    }


    public void enviarCodigoRecuperacao(
            String destinatario,
            String codigo
    ) {

        SimpleMailMessage mensagem =
                new SimpleMailMessage();


        mensagem.setTo(
                destinatario
        );


        mensagem.setSubject(
                "HospEasy - Recuperação de senha"
        );


        mensagem.setText(
                """
                Olá!

                Recebemos uma solicitação para redefinir sua senha no HospEasy.

                Seu código de recuperação é:

                %s

                Esse código expira em 10 minutos.

                Se você não solicitou a recuperação da senha, ignore este e-mail.

                HospEasy
                """.formatted(
                        codigo
                )
        );


        mailSender.send(
                mensagem
        );
    }
}