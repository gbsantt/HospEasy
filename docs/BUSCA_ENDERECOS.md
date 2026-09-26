# Busca de localização sem cadastro

O pop-up administrativo usa `/admin/geocodificacao/sugestoes`, protegido pelas mesmas permissões de administrador. O serviço tenta Nominatim primeiro e consulta Photon somente quando não há resultado confirmado ou o serviço está indisponível. BrasilAPI resolve CEP para endereço; suas coordenadas não são usadas, pois podem representar o centro do município.

Nenhuma chave, conta, dependência ou migration adicional é necessária. Todos os resultados exigem seleção explícita antes de alterar o marcador. A busca automática usada no cadastro e o endpoint anterior mantêm a validação estrita.

Sugestões Photon exibem rua, bairro, cidade, estado e CEP fornecidos pelo mapa, além de um aviso de divergência. Não representam confirmação do CEP solicitado. Resultados de centro de cidade, coordenadas inválidas e ruas diferentes da informada são descartados. Para CEP, a rua e a cidade precisam coincidir para que uma sugestão seja oferecida.

## Limitação verificada

Em 26/09/2026, `13233251` foi resolvido como Rua Itu, Jardim Laura, Campo Limpo Paulista/SP. Nominatim não confirmou esse endereço; Photon sugeriu Rua Itú, Jardim Marsola, CEP 13231-448. O aplicativo mostra essa diferença e não move o marcador sozinho. Não foi comprovado que os dois endereços representam o mesmo lugar.

O servidor público Photon permite uso moderado sem cadastro, mas não garante disponibilidade: https://github.com/komoot/photon#demo-server. A pesquisa é feita por envio do formulário, sem consultas a cada tecla, e mantém a limitação de frequência existente. Para uso em grande escala será necessário rever a hospedagem do geocodificador.

## Verificação

`GeocodificacaoTest` cobre a seleção, divergências, coordenadas inválidas e preservação da busca estrita. `GeocodificacaoLiveTest` faz consultas reais somente quando `HOSPEASY_GEOCODE_LIVE=true`; não depende de banco e fica desabilitado nas execuções normais.

Exemplo PowerShell: defina `$env:HOSPEASY_GEOCODE_LIVE='true'` e execute `./mvnw.cmd '-Dtest=GeocodificacaoTest,GeocodificacaoLiveTest' test`.
