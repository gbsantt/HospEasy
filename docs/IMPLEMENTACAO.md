# Implementação e validação do HospEasy

## Escopo e resultado

Correções de segurança, contratos, recuperação persistente, migrações, administração de câmeras, suporte, frontend, mapas e documentação implementadas no repositório. Não houve deploy, push/merge ou uso do banco original. A alteração preexistente em UnidadeAtendimentoService foi respeitada: permanece o flush explícito dos dependentes antes da exclusão da unidade.

Este relatório distingue validação local de homologação externa. Os dados usados nos testes são descartáveis, em PostgreSQL local isolado e schemas aleatórios. A instalação original não foi migrada nesta tarefa.

## Checklist da auditoria original

| Item | Status | Implementação e evidência |
| --- | --- | --- |
| C1 | RESOLVIDO | PUT de unidades restrito a ADMIN; teste HTTP 403 para usuário comum e CRUD administrativo. |
| C2 | RESOLVIDO | JWT identifica ID imutável; troca/reutilização de e-mail, token adulterado/expirado e formato legado testados. |
| C3 | RESOLVIDO | Desafios persistentes com HMAC, expiração, limites por conta/IP, tentativas e consumo único; testes concorrentes. |
| I1 | RESOLVIDO | authVersion invalida JWT após reset/desativação; teste confirma 401 do token anterior. |
| I2 | RESOLVIDO | Recuperação em PostgreSQL, bloqueio do usuário e transação; apenas um reset concorrente vence. |
| I3 | RESOLVIDO | Revalidação inicial, em foreground e periódica via /usuarios/me. Refresh e indisponibilidade conferidos na Web. |
| I4 | RESOLVIDO | JWT no SecureStore nativo e sessionStorage Web; migração descarta sessão AsyncStorage legada. Limite XSS Web documentado. |
| I5 | RESOLVIDO | Hash SHA-256, metadados, revogação, rotação e chave exibida uma vez. Hash e recusa de chave antiga testados. |
| I6 | RESOLVIDO | POST /cameras/medicoes resolve unidade pela chave; cliente não usa IDs do banco. |
| I7 | RESOLVIDO | Ocupação, histórico e comunicação na mesma transação; restrição de teste força falha e confirma rollback. |
| I8 | RESOLVIDO | Uma câmera ativa por unidade, bloqueio e índice parcial; concorrência e migração legada testadas. |
| I9 | RESOLVIDO | Favoritos usam SituacaoUnidadeService; SEM_CAMERA validado por API e favorito persistido pela Web. |
| I10 | RESOLVIDO | DTO cadastral id separado de situação unidadeId; tipo incluído, consumidores TS atualizados. |
| I11 | RESOLVIDO | Detalhe por ID, polling sequencial cancelável, 404 e informação desatualizada explícitos; exclusão testada no backend. |
| I12 | RESOLVIDO | Favoritos com rollback otimista, geração de requisição e guarda de sessão; navegação descartada por identidade/papel. |
| I13 | RESOLVIDO | Sugestões exigem ONLINE/ATUALIZADA; cores 50/80 centralizadas; favoritos usam estado atual das unidades. |
| I14 | RESOLVIDO | Listagem administrativa completa, incluindo unidade sem câmera, coberta por integração e interface. |
| I15 | RESOLVIDO | Nota @NotNull e 1..5; ausência rejeitada com 400; avaliação persistida no teste HTTP e na Web. |
| I16 | RESOLVIDO | Limites de campos conforme colunas, incluindo máximo BCrypt em bytes; unidade com nome excessivo rejeitada antes do banco. |
| I17 | RESOLVIDO | Erros padronizados status/codigo/mensagem; 400/401/403/404/409/429 testados, erro interno sanitizado. |
| I18 | RESOLVIDO | Bloqueio ordenado serializa alterações de administradores; teste concorrente preserva um ADMIN ativo. |
| I19 | RESOLVIDO | URLs por ambiente, localhost/emulador só em desenvolvimento e requisito HTTPS no release; sem IP privado fixo no código. |
| I20 | RESOLVIDO | CORS com origens explícitas e sem credenciais; preflight autorizado e origem recusada testados. |
| I21 | RESOLVIDO | Release sem assinatura debug, quatro variáveis de keystore, cleartext recusado no manifesto principal. Assinatura real depende do proprietário. |
| I22 | RESOLVIDO | Geocodificação diferencia ausência, aproximação, HTTP/429, timeout e rede; quatro testes de serviço e coordenadas manuais no cadastro. |
| I23 | RESOLVIDO | Detector único, confiança 0.5 compartilhada; intervalo/amostragem centralizados e testes de filtro de pessoas. |
| I24 | RESOLVIDO | Validação de configuração, timeout, retry 429/5xx/rede, falha fatal de credencial, sem logs de chave; testes Python. |
| I25 | PARCIALMENTE RESOLVIDO | Layout com safe area, rolagem, teclado e Island limitada à tela; Web conferida em várias larguras. Falta validação física de teclado/gestos Android; não há dispositivo conectado. |
| I26 | RESOLVIDO | 21 testes Java (14 integração PostgreSQL e 7 unitários), 8 testes Python e validação Web. Testes isolados e instruções reproduzíveis. |
| M1 | RESOLVIDO | Situações calculadas em lote, janela de histórico única e EntityGraph de avaliações/favoritos; índices de consulta. |
| M2 | RESOLVIDO | Flyway V1–V4 e Hibernate validate, perfis dev/prod; criação e migração com dados legados testadas. |
| M3 | RESOLVIDO | React Navigation linking com IDs, rotas internas, fallback SPA e recuperação sem código na URL. |
| M4 | RESOLVIDO | Worker preparado no postinstall/export, prefixo comum ao Expo/linking e caminho do worker; mapa Web renderizado. |
| M5 | PARCIALMENTE RESOLVIDO | Native informa carregamento/erro, timeout de localização, enquadra unidades e oferece lista. Falta validar GPS/permissões/renderização em aparelho Android; Web sem localização validada. |
| M6 | RESOLVIDO | Perfil mostra falhas e permite recarregar; suporte, favoritos e avaliações acessíveis. |
| M7 | RESOLVIDO | Removidos logs provisórios da recuperação; nenhum código/senha é logado. |
| M8 | RESOLVIDO | react-native-maps removido após busca de usos; worklets declarado diretamente e alinhado ao Expo. |
| M9 | RESOLVIDO | Dependências Python diretas fixadas, modelo relativo à pasta camera e ausência do modelo tratada/testada. |
| M10 | RESOLVIDO | Mapa alternativo fictício substituído por contrato da implementação nativa; Splash/Loading sem uso removidos. |
| M11 | RESOLVIDO | README, exemplos de ambiente e test.http reescritos, com atualização legada, bootstrap, câmera, testes e builds. |
| M12 | RESOLVIDO | Histórico público não contém operador; histórico administrativo separado e limitado a 100 registros. |
| M13 | RESOLVIDO | Decisão explícita de desativar/reativar usuários, preservando autoria. CRUD administrativo testado e documentado. |

I25 e M5 não têm falha de implementação conhecida: a parte ainda não homologada depende de aparelho/emulador e interação física. Impacto: não se pode certificar comportamento do teclado, GPS e gestos nativos. Falta instalar o development build em um dispositivo e executar a matriz mobile abaixo.

## Banco, migrações e decisões

- **V1__schema_inicial.sql**: seis tabelas originais, criação compatível com instalação nova e baseline legado versão 0.
- **V2__seguranca_dispositivos_suporte.sql**: auth_version; metadados/versão da câmera; dispositivo no histórico; desafio_recuperacao e solicitacao_suporte; índices.
- **V3__Hash_camera_keys.java**: hash das chaves existentes, retirada da coluna em texto puro, índice de hash e índice parcial para uma câmera ativa. Preserva dispositivos e mantém ativa a de menor ID em caso de duplicidade anterior.
- **V4__medicoes_idempotentes.sql**: UUID e índice único por dispositivo/medição; evita duplicidade nos retries.
- Sem ddl-auto=update. Migração em produção exige backup/restauração validada e atualização de uma cópia primeiro.
- Usuários são desativados, não apagados. Suporte mantém autoria. Exclusão administrativa explícita de unidade remove seus dependentes em transação.
- Última comunicação e histórico antigos usam LocalDateTime para compatibilidade do esquema original; novos metadados usam Instant. Configure o fuso da JVM de forma consistente entre servidores.

## Endpoints

| Grupo | Endpoints / alteração |
| --- | --- |
| Sessão | POST /usuarios/login, /cadastro, /esqueci-senha, /verificar-codigo, /redefinir-senha; novo GET /usuarios/me |
| Usuários ADMIN | GET/POST /usuarios, GET/PUT /usuarios/{id}; atualização permite desativação/reativação |
| Unidades públicas | GET /unidades, /{id}, /situacoes, /situacoes/ordenadas, /{id}/situacao, /{id}/historico |
| Unidades ADMIN | POST /unidades, PUT/DELETE /unidades/{id}, PATCH /unidades/{id}/ocupacao; novo GET /admin/unidades e /admin/unidades/{id}/historico |
| Câmeras ADMIN | GET/POST /admin/unidades/{id}/dispositivos; PATCH /admin/dispositivos/{id}; POST /admin/dispositivos/{id}/revogar-chave e /regenerar-chave |
| Medição | Novo POST /cameras/medicoes, X-Camera-Key, quantidadePessoas e medicaoId opcional; resposta 204 |
| Medição removida | POST /unidades/{id}/medicoes |
| Favoritos | GET /usuarios/me/favoritos, POST/DELETE /usuarios/me/favoritos/{unidadeId}; situação real na resposta |
| Avaliações | GET/POST /unidades/{id}/avaliacoes, GET /usuarios/me/avaliacoes, PUT/DELETE /usuarios/me/avaliacoes/{id}; autoria imposta pelo servidor |
| Suporte próprio | POST/GET /usuarios/me/suporte; GET /usuarios/me/suporte/{id}, por ID + proprietário |
| Suporte ADMIN | GET /admin/suporte, GET /admin/suporte/{id}, PATCH /admin/suporte/{id}/status |

Listas de suporte aceitam page, size (1–100), status e categoria. Atualização de status/dispositivo usa version. GET de outro proprietário retorna 404. Nenhuma listagem de câmera devolve chave ou hash. Criação/rotação devolvem chave uma vez e têm no-store.

## Frontend e Python

Frontend mantém Expo/React Navigation e MapLibre/OpenFreeMap. Introduz SecureStore, revalidação de sessão, tratamento central de 401, estados de erro, telas de suporte/dispositivos, contratos separados, formulários com rolagem e safe area, polling cancelável, URLs internas e prefixo de hospedagem. A Web usa armazenamento por aba e continua sujeita a XSS; não foi apresentada como sessão HttpOnly.

Python usa configuração única e caminho absoluto do modelo, classe pessoa, confiança compartilhada, mediana de amostras, retries limitados com UUID idempotente, parada por chave inválida, logs rotativos sanitizados e nenhuma imagem enviada ao servidor.

## Testes e builds

Resultados finais e comandos estão registrados na seção de evidências abaixo. O teste de rollback injeta uma restrição somente no schema descartável; a falha esperada não é erro do produto. A primeira tentativa Maven encontrou uma classe compilada obsoleta e foi substituída por build limpo. Uma tentativa de repackage encontrou o JAR aberto pelo backend de teste no Windows; após encerrar esse processo, package passou.

### Matriz funcional

| Área | Validação local | Homologação externa restante |
| --- | --- | --- |
| Autenticação/autorização | Login válido/incorreto/inativo, cadastro não ADMIN, JWT inválido/expirado/legado, reset revoga JWT, e-mail reutilizado, rotas ADMIN | Política de sessão/SMTP na instalação real |
| Usuários | Criar, listar, buscar, alterar, desativar; concorrência último ADMIN e autorrebaixamento | Cadastro de operadores reais |
| Unidades | Criar com coordenadas confirmadas, atualizar, excluir dependentes, ausência de câmera, validações | Confirmar coordenadas das unidades reais |
| Avaliações/favoritos | Nota obrigatória, propriedade, situação real, exclusão dependente; fluxo Web e persistência | Uso físico no Android |
| Suporte | Autoria automática, isolamento 404, paginação/filtros, status e conflito de versão; criação/consulta/status na Web | Fluxo operacional da equipe |
| Câmeras | Hash, chave inválida/ausente/inativa/revogada, rotação, uma ativa concorrente, UUID, limite da área, FK sem unidade, rollback | Webcam, enquadramento e qualidade da contagem |
| Recuperação | Expiração, 5 tentativas, 5 solicitações/h, cooldown, resposta uniforme, consumo concorrente e revogação de JWT | Entrega de SMTP real |
| Mapa Web | Renderização OpenFreeMap, marcador, enquadramento, ausência de localização e lista | Disponibilidade contínua do provedor |
| Android | Compilação nativa e configuração de release | Teclado, GPS, permissões, gestures/Island, SecureStore em aparelho |
| Produção | CORS explícito, TLS preparado, secret/configuração fora do bundle | Domínio, certificados, proxy confiável e keystore do proprietário |

### Checklist de segurança

- [x] ADMIN obrigatório nas mutações administrativas.
- [x] Identidade JWT imutável e versão de autenticação verificada no banco.
- [x] Senhas BCrypt; limites respeitam os 72 bytes do algoritmo.
- [x] Recuperação persistente, HMAC, bloqueios, tentativas e consumo único.
- [x] Chaves de câmera aleatórias; somente hash no banco; rotação/revogação.
- [x] Câmera identifica sua unidade no servidor; FK obrigatória.
- [x] Suporte/favoritos/avaliações isolados pelo usuário autenticado.
- [x] CORS sem curinga e sem credenciais, com testes de preflight.
- [x] Erros internos sanitizados e log SQL de falhas de linha desativado para não imprimir dados.
- [x] .env e keystores privados ignorados; debug.keystore é exclusivamente de desenvolvimento.
- [x] Release não recebe assinatura debug e não permite cleartext no manifesto principal.
- [ ] Homologar SMTP, HTTPS/proxy, keystore real e execução Android física.
- [ ] Tratar os avisos transitivos de dependências ainda sem correção compatível, descritos abaixo.

## Operação e atualização

[README](../README.md) contém os requisitos, todas as variáveis, comandos de execução/build/teste, backup e baseline legado, bootstrap seguro e configuração de câmera nova. [test.http](../test.http) contém os contratos atuais sem credenciais reais.

Em produção com proxy, mantenha limitação também no proxy e configure **somente proxies confiáveis** antes de habilitar tratamento de cabeçalhos encaminhados. O limitador IP da aplicação é local à instância; os limites por conta e a recuperação são persistentes no PostgreSQL. Não confie cegamente em X-Forwarded-For.

As integrações externas não foram alteradas: SMTP real, domínio/HTTPS, banco original, keystore e hardware dependem do responsável pela instalação. Nenhum desses itens foi substituído por credenciais fictícias de produção.

## Revisão final das próprias alterações

A revisão e os testes identificaram e corrigiram: registro duplicado de filtros Spring; entidade de câmera carregada antes do lock (refresh sob bloqueio); repetição de medição após retry (UUID); montagem de URL Web com campos privados; acesso a window.location no bundle nativo; prefixo Web também necessário no config do React Navigation; polling Home em segundo plano; médias sem amostra mostradas como informação útil; sessão anterior mantendo telas; arquivo de teste compilado antigo; assinatura debug de release; e exposição de dados pelo log de erro SQL.

Não há falha crítica conhecida nos fluxos de backend validados. Limitações de validação e dependências restantes são explicitadas; aprovação local não equivale a homologação física ou autorização para publicar.

## Arquivos e dependências

O inventário completo de arquivos criados, alterados e removidos está em [ARQUIVOS.md](ARQUIVOS.md).

Backend: adicionados starter Flyway, módulo PostgreSQL Flyway e spring-security-test. Frontend: SecureStore e Worklets diretos; react-native-maps removido; Expo Blur/Clipboard/Location alinhados ao SDK; uuid do xcode atualizado por override compatível (smoke test v4 passou). Python: versões diretas fixadas em requirements.txt.

A auditoria npm caiu de 21 para 10 avisos (4 altos e 6 moderados), derivados de image-size/Metro e decode-uri-component/query-string/React Navigation. O relatório detalhado está em [npm-audit.json](npm-audit.json). Não foi usado audit fix --force: a sugestão automática troca versões principais e quebra a arquitetura atual. A versão publicada de image-size consultada ainda está na faixa afetada; decode-uri-component corrigido muda para ESM, incompatível com o consumidor CommonJS atual. Esses avisos permanecem pendentes de atualização compatível e devem ser acompanhados antes da publicação.

Foram preservados os ajustes locais do usuário em recuperação/baseline. Em prod, RECOVERY_SECRET permanece obrigatório e baseline automático fica desativado por padrão.

## Evidências da execução final

- `mvn verify`, Java 21, PostgreSQL 18 em `127.0.0.1:55439/hospeasy_test`: **21 testes, zero falhas, zero erros, zero ignorados**, com empacotamento do JAR concluído. Log local: `D:/HospEasy/.test-runtime/maven-final.log`.
- Python 3.14.5: `python -m unittest discover -s camera -p test_client.py -v`: **8 testes aprovados**. `python -m compileall -q camera` também concluído. Isso valida o cliente e seus contratos; não substitui a execução do modelo com webcam.
- `npm run typecheck`: aprovado. `npm run build:web`: exportação raiz aprovada; exportação com `EXPO_PUBLIC_BASE_PATH=/hospeasy` também aprovada.
- `expo install --check`: dependências alinhadas ao SDK. O smoke test de geração de UUID pelo pacote xcode passou com o override instalado.
- Revisão de segredos: nenhum valor secreto dos arquivos `.env` locais encontrado nos bundles textuais inspecionados. Nenhum `.env` real ou keystore privado está versionado; o único keystore versionado é o de debug.
- `git diff --check`: aprovado após normalizar finais de arquivo.

Os fluxos Web de suporte, avaliação, favorito, atualização de sessão e mapa foram exercitados anteriormente no schema isolado `qa_visual`. Nesta retomada, a navegação visual conservou `/hospeasy/acesso` e `/hospeasy/entrar`, e o erro de conexão apareceu de forma legível. A repetição dos fluxos autenticados pelo navegador integrado nas portas 18080/18081 ficou limitada por `ERR_BLOCKED_BY_CLIENT`; os testes HTTP do backend passaram. Não se apresenta essa repetição como homologação visual concluída.

A prévia local foi corrigida para ler o arquivo antes de enviar headers. Uma exportação simultânea podia remover o arquivo durante a leitura e encerrar o servidor com `ERR_HTTP_HEADERS_SENT`. Requisições inválidas e arquivos ausentes agora retornam erro sem encerrar o processo.

Avisos adicionais de build: APIs nativas de dependências depreciadas, recursos Gradle incompatíveis com uma futura migração para Gradle 10, flag experimental de base path do Expo e cópia de bibliotecas C++ entre discos porque hard links não são possíveis. Não foi feita atualização principal de Gradle/Expo para silenciar esses avisos. Caches CMake obsoletos após a atualização de Worklets foram removidos somente dentro das pastas geradas do projeto.

### Android e artefatos finais

`gradlew.bat :app:assembleDebug :app:assembleRelease -PreactNativeArchitectures=arm64-v8a --max-workers=2 --console=plain`: **BUILD SUCCESSFUL em 17m19s**, 825 tarefas (173 executadas, 652 atualizadas). A validação final foi ARM64; outras arquiteturas não foram recompiladas depois dos últimos ajustes. Log: `D:/HospEasy/.test-runtime/android-arm64-final.log`.

- Debug: `mobile/android/app/build/outputs/apk/debug/app-debug.apk` (82.977.061 bytes). Destina-se ao desenvolvimento com Metro.
- Release: `mobile/android/app/build/outputs/apk/release/app-release-unsigned.apk` (45.935.282 bytes). Requer configuração de API HTTPS e keystore própria para distribuição; não é uma instalação de produção configurada.
- JAR: `target/backend-0.0.1-SNAPSHOT.jar`.
- Web: `mobile/dist`; exportação adicional de teste em `D:/HospEasy/.test-runtime/web-subpath`.

O apksigner confirmou a ausência de assinatura no release (resultado esperado). O aapt confirmou `allowBackup=false`, `usesCleartextTraffic=false` e ABI `arm64-v8a`. Não há atributo debuggable habilitado no manifesto de release. Nenhum valor secreto dos `.env` locais foi encontrado no bundle extraído do APK. SHA-256 do APK unsigned: `77B9BBDCC598ABBDB95111E40442B4F00BD29C6B8AC37B8D71A885DAEB335550`.

Após a correção da prévia, os caminhos `/hospeasy/entrar` e `/hospeasy/admin/suporte` responderam HTTP 200 com HTML; o worker `maplibre-gl-worker.mjs` e seu módulo `maplibre-gl-shared.mjs` responderam 200 com MIME JavaScript. Caminho malformado e asset inexistente retornaram 400/404 sem encerrar o servidor.

Resultado do checklist original: **40 itens resolvidos e 2 parcialmente resolvidos (I25 e M5)**, ambos com implementação disponível e homologação física Android pendente. Permanecem os 10 avisos npm descritos acima e as dependências externas explicitadas na matriz. Não houve publicação nem modificação de dados da instalação original.
