# Melhorias de setembro de 2026

## Funcionalidades

- **Sessão:** reutiliza o JWT atual. Web persiste apenas o token em localStorage; nativo continua em SecureStore. A identidade e as permissões vêm de `/usuarios/me`, nunca de dados locais. Rede/5xx não apagam a sessão. Expiração, assinatura e versão da conta continuam validadas pelo backend. Revalidações sem alteração não substituem o objeto do usuário.
- **Relatório:** `GET /unidades/{id}/relatorio.pdf`, exclusivo para usuários autenticados, com download ao final da página de detalhes. Consulta até 100 medições reais, ordenadas por data e ID decrescentes. Inclui nome/endereço, intervalo, contagem, percentual armazenado e origem, médias por amostra e aviso quando não há histórico. Não exporta usuários, e-mails, chaves de câmeras ou outros dados privados. A resposta usa `application/pdf`, `attachment` e `no-store`. Não há geração antecipada durante a navegação.
- **Limites dos dados:** o banco guarda `LocalDateTime`, sem fuso histórico; o PDF informa isso. Os percentuais são os armazenados na medição, sem recalcular pela capacidade atual. Médias não são ponderadas pelo tempo. O relatório não representa necessariamente toda a unidade nem um intervalo fixo de dias.
- **Mapa administrativo:** busca explícita de endereço pelo backend (`GET /admin/geocodificacao`), reutilizando Nominatim e a validação existente. Aceita um ponto aproximado para conferência no mapa; a geocodificação automática do cadastro continua exigindo precisão. Seleção manual, confirmação, preenchimento de endereço e gravação de coordenadas são preservados. Não envia uma busca por tecla. Há timeout, cancelamento e limite de frequência.
- **Tema:** configuração em Meu Perfil, salva neste dispositivo via AsyncStorage. A paleta clara original é mantida; a escura alcança navegação, cards, formulários, diálogos, mapas e painéis. Estilos são memorizados por paleta, sem recriar a navegação ao trocar o tema.

## Desempenho e segurança

- Projeção da janela de ocupação retorna apenas ID da unidade e contagem, sem materializar entidades históricas completas.
- Índice específico para buscar o histórico recente com ordenação estável.
- Marcadores MapLibre são atualizados por ID, sem destruir/recriar todos a cada atualização.
- Polling de ocupação e favoritos pausa em segundo plano. Favoritos atualizam a cada 30 segundos; mutações continuam atualizando imediatamente.
- Parser JWT reutilizado; verificações de conta ativa e versão permanecem em cada requisição autenticada.
- Relatórios e busca de endereço têm limites de frequência. Geocodificação não forma fila de threads aguardando o provedor.
- Armazenamento web segue o padrão bearer existente e é acessível a JavaScript; exige manter proteção contra XSS e HTTPS em produção. Não foi criado um segundo sistema de autenticação.
- O bundle web ainda inclui o MapLibre (aproximadamente 3 MB antes de compressão). Não houve troca do mapa, remoção de funcionalidades nem atualização ampla de dependências. O servidor de produção deve servir os assets com compressão HTTP.
- Auditoria npm: atualização compatível de `@react-navigation/core` de 7.21.13 para 7.22.1 removeu a cadeia vulnerável `query-string`/`decode-uri-component` e três alertas moderados. Resta um alerta alto no `image-size@1.2.1`, dependência do Metro usada para processar assets no build. A correção upstream está em 2.0.3, fora da faixa major usada pelo Metro; não foi imposto override incompatível. Consulte [auditoria atual](npm-audit.json) e os avisos [JXL/HEIF](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq) e [ICNS](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr). Evite assets não confiáveis no build enquanto a cadeia Expo/Metro não for atualizada de forma compatível.

## Atualização e configuração

1. Em `mobile`, execute `npm ci` e gere novamente o frontend com `npm run build:web` (ou use `npm run web` em desenvolvimento).
2. Compile/inicie o backend normalmente. Maven baixa PDFBox 3.0.8, usado para gerar PDFs no servidor. Os módulos oficiais `expo-file-system` e `expo-sharing` atendem ao salvamento/compartilhamento no aplicativo nativo; o navegador usa Blob/download.
3. Flyway aplica automaticamente `V5__indice_historico_recente.sql`. Não há alteração ou conversão de dados nem SQL manual obrigatório. Em bancos grandes, programe a inicialização para uma janela apropriada, pois a criação do índice pode bloquear escritas enquanto executa.
4. Preserve `JWT_SECRET`, banco e origem do frontend entre reinícios. Não gere um novo secret no script de inicialização. Não é necessário configurar um novo secret ou provedor de autenticação.
5. Reconstrua o aplicativo Android/iOS para incluir os módulos nativos novos. Reiniciar apenas o Metro não atualiza o binário instalado.

## Arquivos principais

- `mobile/src/context/AuthContext.tsx`, `mobile/src/service/sessionStorage.web.ts`
- `mobile/src/context/ThemeContext.tsx`, `mobile/src/theme/colors.ts`, `mobile/src/components/ScreenLayout.tsx`
- `mobile/src/screens/ProfileScreen.tsx`, `mobile/src/screens/UnitScreen.tsx`
- `mobile/src/components/AddressSearch.tsx`, `LocationPicker.tsx`, `LocationPicker.native.tsx`, `HospEasyMap.web.tsx`
- `src/main/java/com/hospeasy/backend/service/RelatorioUnidadeService.java`, `GeocodificacaoService.java`, `SituacaoUnidadeService.java`, `JwtService.java`
- Controllers de relatório/geocodificação, `SecurityConfig.java`, `RequestRateLimitFilter.java`, `HistoricoOcupacaoRepository.java`
- `src/main/resources/db/migration/V5__indice_historico_recente.sql`

## Verificação

- Maven `verify`: 28 testes aprovados, sem skips, usando PostgreSQL 18 em uma instância local temporária exclusiva. Inclui migrations V1–V5, autenticação, permissões do relatório, histórico, unidades, favoritos, suporte, dispositivos e geocodificação.
- `npm run typecheck`: aprovado.
- `npm test`: 3 testes de persistência aprovados (recriação da aplicação, migração/logout e rejeição de tokens expirados/malformados).
- Câmera: 12 testes existentes aprovados, com dependências instaladas somente em uma pasta temporária para esta execução.
- Expo export web: aprovado.
- Navegador: tema escuro e persistência após reload; sessão após reload/reabertura de aba; pesquisa real de endereço, navegação do mapa, seleção manual e gravação das coordenadas em banco temporário.
- PDF: extração de texto e renderização de relatório de teste multipágina, porcentagens originais, acentos, endereço longo e histórico vazio.
- Não houve acesso ou modificação do banco de desenvolvimento/produção do usuário. Dados de teste ficaram exclusivamente na instância temporária. Android/iOS não foram executados em dispositivo nesta validação.
