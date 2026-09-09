# HospEasy — aplicativo e web

O mesmo projeto Expo atende Android/iOS e navegador. O mapa web usa MapLibre GL JS
com OpenFreeMap, coordenadas reais e os mesmos dados do backend do aplicativo.
O arquivo `.native.tsx` continua responsável pelo mapa no celular instalado.

## Executar no computador

1. Inicie o PostgreSQL e o backend Spring Boot, na porta 8080, como já faz para o app.
2. Nesta pasta, execute `npm install` se as dependências ainda não estiverem instaladas.
3. Execute `npm run web` e abra `http://localhost:8081`.

O backend permite o site nas portas 8081 e 8082, em `localhost` ou `127.0.0.1`.
Se o Expo escolher 8082 porque 8081 já está ocupada, use o endereço mostrado por ele.
Após alterar a configuração CORS, reinicie o backend. Com o servidor desligado,
o mapa continua acessível, mas o site exibe um aviso e tenta carregar as unidades novamente.
Nenhuma unidade fictícia é inserida.

## Endereço do servidor

No navegador, o padrão é `http://localhost:8080`. No aplicativo instalado,
foi preservado o endereço local anterior (`http://192.168.1.100:8080`).
Para mudar, copie `.env.example` para `.env.local` e ajuste `EXPO_PUBLIC_API_URL`.
Reinicie o Expo após a alteração. Essa variável é pública: não inclua senhas ou tokens nela.

Para acessar a web de outro dispositivo na mesma rede, use o IP do computador
em `EXPO_PUBLIC_API_URL` e permita a origem correspondente na configuração CORS do backend.
O navegador normalmente exige HTTPS para permitir localização, exceto no localhost.
Mesmo sem localização autorizada, a busca e a consulta das unidades continuam disponíveis.

## Verificações e publicação

- `npm run typecheck`: verifica TypeScript.
- `npm run build:web`: gera os arquivos estáticos em `dist`.
- Os comandos npm de instalação, início e build copiam automaticamente o worker
  do MapLibre e seu módulo compartilhado para `public/maplibre`. Esses arquivos
  precisam acompanhar o site: o Metro não os gera a partir do import principal.
  Se iniciar o Expo diretamente, execute antes `node scripts/prepare-map-worker.mjs`.
- O servidor de hospedagem precisa servir `index.html` como fallback da aplicação.

Antes de publicar para pessoas fora da rede local, é necessário disponibilizar o backend
por HTTPS, configurar sua URL em `EXPO_PUBLIC_API_URL`, permitir a origem do site no CORS
e gerar novamente a versão web. Um site hospedado não consegue usar o localhost do desenvolvedor.

## Comportamento do mapa

- A marca HospEasy e a legenda ficam visíveis acima do mapa no app e no site.
- Os marcadores usam a letra H e indicam baixa ocupação (<50%), moderada (50–79%)
  ou alta (≥80%). Sem medição atual ou com câmera indisponível, ficam cinza.
- Unidades sem coordenadas válidas aparecem na lista, mas não são posicionadas no mapa.
- As unidades são atualizadas após cada consulta, com intervalo de cinco segundos e timeout
  de dez segundos. Um aviso informa falhas de atualização.
- Os créditos do provedor cartográfico permanecem visíveis.

Referências: [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/),
[publicação web no Expo](https://docs.expo.dev/guides/publishing-websites/),
[MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/).
