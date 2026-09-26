CREATE INDEX idx_historico_unidade_data_id
    ON historico_ocupacao(unidade_atendimento_id, registrado_em DESC, id DESC);
