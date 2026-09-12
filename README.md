# HospEasy

Aplicativo Android/Web para consulta de unidades de saúde, ocupação de áreas monitoradas, avaliações, favoritos, câmeras e suporte. Backend Spring Boot + PostgreSQL; frontend Expo/React Navigation/MapLibre; contador Python/YOLO. A contagem não representa tempo de espera nem orientação clínica.

## Requisitos

- Java 21 e Maven 3.9 (o wrapper `mvnw`/`mvnw.cmd` baixa o Maven).
- PostgreSQL 15 ou superior; validação realizada com PostgreSQL 18.
- Node.js >=22.13 (validado com 24.19), npm e Expo SDK 57.
- Android Studio, SDK/NDK indicados pelo Gradle e `ANDROID_HOME`; Expo Go não inclui o MapLibre nativo: use development build.
- Python com as dependências de camera/requirements.txt (testes do cliente validados em Python 3.14.5). A execução YOLO depende de wheels compatíveis de PyTorch e de webcam; os testes do cliente não precisam de webcam.

## Backend

1. Crie um banco vazio `hospeasy` e um usuário próprio com permissão para criar/evoluir suas tabelas. Não use o usuário da escola/produção nos testes.
2. Configure as variáveis abaixo no processo ou gerenciador de secrets. O backend **não carrega automaticamente um arquivo .env**. `.env.example` é uma referência.
3. Execute `./mvnw spring-boot:run` (PowerShell: `.\mvnw.cmd spring-boot:run`).
4. Para empacotar: `./mvnw clean verify`; para executar: `java -jar target/backend-0.0.1-SNAPSHOT.jar`.

| Variável | Uso |
| --- | --- |
| DB_URL | JDBC PostgreSQL; desenvolvimento: jdbc:postgresql://localhost:5432/hospeasy |
| DB_USERNAME / DB_PASSWORD | Usuário e senha do banco; nunca versionar valores reais |
| JWT_SECRET | Secret aleatório de pelo menos 32 bytes, exclusivo do servidor |
| RECOVERY_SECRET | Secret aleatório independente de pelo menos 32 caracteres para HMAC dos códigos |
| JWT_EXPIRATION_MS | Prazo do JWT; padrão 86400000 (24 h) |
| SPRING_PROFILES_ACTIVE | dev ou prod; padrão dev |
| CORS_ORIGINS | Origens exatas separadas por vírgula, incluindo esquema/porta; sem curinga |
| PORT | Porta; padrão 8080 |
| MAIL_HOST / MAIL_PORT | SMTP; padrão smtp.gmail.com:587, substitua pelo serviço real |
| MAIL_USERNAME / MAIL_PASSWORD / MAIL_FROM | Autenticação e remetente reais |
| MAIL_AUTH / MAIL_STARTTLS_REQUIRED | Padrão true; produção deve exigir TLS |
| BOOTSTRAP_ADMIN_EMAIL / BOOTSTRAP_ADMIN_PASSWORD | Bootstrap opcional, descrito abaixo |
| DB_BASELINE | Somente migração inicial de uma instalação legada, após backup |

Os ajustes locais do usuário foram preservados: desenvolvimento aceita o fallback local de recuperação e baseline automático. O perfil prod exige RECOVERY_SECRET explícito e mantém DB_BASELINE=false por padrão. Antes da primeira migração de qualquer banco com dados, faça backup.

Gere os secrets com gerador criptográfico local e armazene-os fora do repositório. JWT usa ID imutável + versão de autenticação. Tokens antigos são recusados; após atualização todos devem entrar novamente. Redefinição de senha e desativação invalidam sessões anteriores. Mudanças de papel são consultadas no banco em cada requisição.

### Administrador inicial

Em banco sem ADMIN ativo, configure temporariamente BOOTSTRAP_ADMIN_EMAIL e BOOTSTRAP_ADMIN_PASSWORD (mínimo 12 caracteres, máximo 72 bytes UTF-8). Reinicie uma vez. O bootstrap usa bloqueio no banco, não promove um e-mail já cadastrado e não imprime credenciais. Remova ambas as variáveis depois. Não existe senha padrão do produto.

A gestão de usuários permite criar, consultar, editar papel/dados e **desativar/reativar**. Não há exclusão física: avaliações, autoria do suporte e histórico são preservados. Autorrebaixamento, autodesativação e remoção do último ADMIN ativo são bloqueados.

### Migrações e atualização de instalação existente

Flyway executa V1–V4; Hibernate apenas valida (`ddl-auto=validate`).

1. Pare escritores (backend/câmeras) e faça backup completo com `pg_dump`; valide sua restauração em outro banco.
2. Atualize primeiro uma **cópia** do banco e confirme esquema, contagens e dispositivos.
3. Se já existe o esquema Hibernate e **não existe histórico Flyway**, configure DB_BASELINE=true apenas nessa primeira execução. O baseline é versão 0; V1 usa CREATE TABLE IF NOT EXISTS. Não use baseline em versões arbitrárias.
4. Inicie o backend com novos secrets/configuração e confira as migrações. Remova DB_BASELINE.
5. V2 adiciona autenticação, metadados, suporte, recuperação e índices. V3 transforma cada chave antiga em SHA-256, remove a coluna em texto puro e preserva os dispositivos. Se houver mais de uma câmera ativa na unidade, mantém a de menor ID ativa e desativa as demais. Confira essa escolha no painel.
6. V4 acrescenta UUID de medição e unicidade para retries idempotentes. Histórico anterior é preservado; vínculos de dispositivo de medições antigas permanecem nulos.
7. Atualize câmera e frontend juntos: o endpoint antigo de medição por unidade foi removido. A chave antiga continua válida após o hash; se não a possui, regenere no painel.
8. Valide login, unidade, favoritos, câmera e suporte. Para reverter a migração de hashes, restaure o backup; não há como recuperar a chave original pelo hash.

Nunca execute testes contra o banco original. As migrações não removem registros de usuários/unidades/histórico. Exclusão de unidade pela administração é uma ação explícita e remove suas avaliações, favoritos, dispositivos e histórico em uma única transação.

## Android e Web

Na pasta `mobile`:

```sh
npm ci
npm run typecheck
npx expo install --check
npm start
npm run android
npm run web
```

Configure `EXPO_PUBLIC_API_URL` em `mobile/.env.local` ou no processo. Essa URL é **pública**, incorporada ao bundle; nenhuma variável EXPO_PUBLIC pode conter secrets. Sem configuração, Web local usa a porta 8080 e Android debug usa o emulador 10.0.2.2. Dispositivo físico precisa de uma URL alcançável configurada. Release nativo exige URL HTTPS.

`EXPO_PUBLIC_SUPPORT_URL` é opcional: canal real https:// ou mailto: exibido no login. Não há telefone/e-mail fictício. Suporte interno exige autenticação.

### Exportação e rotas Web

```sh
npm run build:web
node scripts/serve-web.mjs
```

O preview escuta somente 127.0.0.1:8081. O diretório `dist` contém a SPA e o worker MapLibre. A hospedagem real precisa servir arquivos existentes e direcionar as demais rotas ao index.html, preservando a URL. Não redirecione arquivos JS inexistentes para HTML.

Para subdiretório, defina EXPO_PUBLIC_BASE_PATH com o prefixo, por exemplo `/hospeasy`, **antes de exportar** e use o mesmo prefixo no servidor. A configuração Expo e o worker compartilham esse valor. Exemplo PowerShell:

```powershell
$env:EXPO_PUBLIC_BASE_PATH='/hospeasy'
npm run build:web
node scripts/serve-web.mjs
```

Abra /hospeasy/. React Navigation continua responsável pelo linking; não foi introduzido Expo Router. URLs usam apenas IDs; códigos de recuperação e objetos de usuário não são serializados em links. Refresh da recuperação reinicia o fluxo, por segurança.

A sessão nativa guarda somente o JWT no SecureStore. Na Web usa sessionStorage da aba, com revalidação no servidor; não é cookie HttpOnly e continua sujeita a XSS. Não introduza HTML não sanitizado nem scripts de terceiros não confiáveis. Favoritos e telas são descartados na troca de conta. Erro 401 encerra sessão; 403 informa falta de permissão.

### Release Android

```powershell
cd android
.\gradlew.bat :app:assembleDebug :app:assembleRelease
```

Sem as quatro variáveis abaixo, o release é **unsigned**, não usa a assinatura debug. Para uma versão distribuível, configure um keystore real fora do repositório:

- HOSPEASY_KEYSTORE_PATH
- HOSPEASY_KEYSTORE_PASSWORD
- HOSPEASY_KEY_ALIAS
- HOSPEASY_KEY_PASSWORD

Não há criação automática de keystore de produção. O manifesto principal recusa HTTP cleartext e desativa backup; o manifesto debug permite HTTP local. Defina EXPO_PUBLIC_API_URL=https://seu-endpoint-real **antes** de gerar release. O build sem essa URL valida compilação, mas o app informa configuração ausente quando tentar acessar a API.

## Câmera

```sh
cd camera
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
python -m pip install -r requirements.txt
```

Instale o modelo YOLO `yolov8n.pt` autorizado para seu uso na pasta camera ou configure HOSPEASY_MODEL_PATH. O cliente não baixa modelos silenciosamente. Caminhos relativos são resolvidos em relação à pasta camera.

1. No painel ADMIN, abra Unidades → Dispositivos.
2. Crie um dispositivo, copie a chave exibida **uma única vez** e guarde-a somente no dispositivo autorizado.
3. Configure `camera/.env` a partir do exemplo com HOSPEASY_API_URL e HOSPEASY_CAMERA_KEY. Não há UNIDADE_ID, CAMERA_ID ou outro ID de banco.
4. Há no máximo uma câmera ativa por unidade. Desative a antiga antes de ativar a substituta. Dispositivo sem unidade é impedido por FK.
5. Execute `python teste_camera.py` (detecção local), `python CameraPreview.py` (prévia) ou `python main.py` (serviço de medição). Q encerra a prévia.
6. Confirme última comunicação no painel. Chave revogada/inativa é recusada; regenerar invalida imediatamente a anterior. Após regenerar, atualize .env e reinicie o cliente; um dispositivo revogado continua inativo até ser ativado.

Configuração padrão: classe pessoa, confiança 0.5, 1280×720, mediana de 5 amostras a cada 180 s. Ajustes opcionais estão em camera/.env.example. Produção, prévia e teste usam o mesmo detector. O cliente envia apenas quantidade + UUID aleatório por medição; retries reutilizam esse UUID. Timeout de conexão/leitura: 5/10 s; até 3 tentativas para rede, 429 e 5xx, com espera. 401/403 encerram o serviço para correção administrativa. Redirecionamentos HTTP não encaminham a chave.

Nenhuma imagem é enviada ao backend. Logs rotativos registram eventos sem chave/senha/resposta bruta. Valide o enquadramento e a contagem no ambiente físico antes de apresentar resultados reais.

## Suporte e ocupação

Usuários criam e consultam suas próprias solicitações, com categorias e estados ABERTO, EM_ANALISE e RESOLVIDO. ADMIN lista, filtra, pagina e altera status com controle de versão. Não há chat/anexos.

Câmera: ONLINE até 6 min sem comunicação; ATRASADA entre 6 e 15 min; OFFLINE depois disso ou sem comunicação; DESATIVADA e SEM_CAMERA são explícitos. Favoritos, Home e detalhes compartilham o cálculo. Somente dados atuais participam das sugestões. Baixa ocupação <50%, moderada 50–79,99%, alta >=80%. A API pública de histórico não expõe o operador.

## Testes reproduzíveis

```sh
./mvnw test
python -m unittest discover -s camera -p test_client.py -v
python -m compileall -q camera
cd mobile
npm run typecheck
npx expo install --check
```

Os testes de integração exigem banco **local e exclusivo** chamado hospeasy_test. Configure TEST_DB_URL=jdbc:postgresql://127.0.0.1:PORTA/hospeasy_test e TEST_DB_USERNAME antes de `mvnw clean verify`. Cada execução cria schemas aleatórios, sem usar dados existentes; o usuário deve poder criar schemas. A senha deste ambiente isolado é vazia, usando PostgreSQL local com trust limitado a loopback. Sem TEST_DB_URL, integração é explicitamente ignorada; testes unitários continuam executando. Não interprete esse skip como aprovação da integração. Os schemas de teste são mantidos para inspeção.

Veja [relatório de implementação](docs/IMPLEMENTACAO.md) para evidências, checklist C/I/M, limitações externas e resultados dos builds. [test.http](test.http) contém exemplos dos contratos; use variáveis locais e não salve tokens reais.
