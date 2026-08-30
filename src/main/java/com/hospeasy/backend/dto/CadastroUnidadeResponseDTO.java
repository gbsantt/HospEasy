package com.hospeasy.backend.dto;


public record CadastroUnidadeResponseDTO(

        UnidadeAtendimentoResponseDTO unidade,

        Long cameraId,

        String cameraNome,

        /*
         * A chave é devolvida no momento do cadastro para
         * configurar o dispositivo físico.
         *
         * Não coloque esta chave em logs nem em repositórios.
         */
        String chaveApi

) {
}
