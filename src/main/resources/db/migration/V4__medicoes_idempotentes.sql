ALTER TABLE historico_ocupacao ADD COLUMN medicao_id uuid;
CREATE UNIQUE INDEX uk_medicao_dispositivo ON historico_ocupacao(dispositivo_id,medicao_id) WHERE medicao_id IS NOT NULL;
