# Catálogo digital com pedido pelo WhatsApp

Template de catálogo para lojas de roupa. A cliente navega, monta a sacola e é levada ao
WhatsApp da loja escolhida com a mensagem do pedido pronta. Não há pagamento online: o
fechamento acontece na conversa.

Site 100% estático (Vite + React + TypeScript + Tailwind CSS), sem backend e sem banco de dados.
Pode ser hospedado de graça na Vercel ou na Netlify.

Esta cópia está configurada como **demonstração para a Dâmarys Monteiro** (3 lojas em Vitória/ES).
O catálogo de exemplo tem 5 peças com fotos; preços, tamanhos, estoque, endereços e telefones são de exemplo
(ver [O que pedir à cliente](#o-que-pedir-à-cliente-antes-de-publicar)).

---

## Rodar no computador

Precisa do [Node.js](https://nodejs.org) 20 ou mais novo.

```bash
npm install
```
```bash
npm run dev
```

Abra o endereço que aparecer (normalmente http://localhost:5173).

Outros comandos:

| Comando | Para quê |
|---|---|
| `npm run build` | Gera o site final em `dist/` (checa os tipos, gera prévias de compartilhamento e o sitemap) |
| `npm run preview` | Abre o site final gerado, para conferir antes de publicar |
| `npm run imagens` | Converte as fotos de `fotos-originais/` em WebP leve dentro de `public/produtos/` |
| `npm run planilha:json` | Converte uma planilha CSV (arquivo ou link) em `src/data/produtos.json` |

## Onde fica cada coisa

```
src/config/loja.config.ts   ★ tudo o que muda entre clientes
src/data/produtos.json      produtos (fonte local e reserva da planilha)
planilha/                   modelo da planilha + CSV de exemplo
public/marca/               favicon e imagem de compartilhamento
public/produtos/            fotos dos produtos em WebP
scripts/                    conversão de fotos, planilha → JSON, pós-build (SEO)
src/paginas/                Home, Catálogo, Produto, Sacola, Nossas lojas, Privacidade
src/componentes/            cabeçalho, rodapé, cards, filtros etc.
src/servicos/               leitura da planilha, mensagem do WhatsApp, métricas
src/utils/                  busca, filtros, disponibilidade, preços
```

---

## Criar um novo cliente (passo a passo)

1. **Duplique a pasta** do projeto (ou crie um repositório novo a partir dele) e dê o nome do cliente.
   Apague `node_modules` e `dist` da cópia, se vierem junto.
2. **Edite `src/config/loja.config.ts`**:
   - `nome`, `slogan`, `descricao`, `urlSite` (o domínio final)
   - `cores`: principal, fundo, texto etc. Confira o contraste de texto em https://webaim.org/resources/contrastchecker/ (mínimo 4,5:1)
   - `unidades`: um item por loja, com `id` sem acentos (ex.: `centro`), endereço, horários,
     WhatsApp **só com números e com 55 + DDD** (ex.: `5527999999999`) e o link do Google Maps
   - `pagamentos`, `parcelamento`, `entregas`
   - `campanha` (texto e produtos da vitrine da home), `destaques` (círculos), `looks`, `plusSize`, `sobre`
   - `redesSociais`, `mensagemRodape`, `metricas`
3. **Marca**: troque `public/marca/favicon.svg` e `public/marca/compartilhamento.jpg`
   (1200 x 630 px, aparece quando o link é compartilhado). Se tiver logo em imagem,
   coloque em `public/marca/` e preencha `logo` na config (vazio = nome escrito com a fonte de título).
4. **Fontes**: em `src/estilos/fontes.ts` troque os imports (`npm i @fontsource/<nome>`) e,
   na config, os nomes em `fontes`. Catálogo: https://fontsource.org
5. **Produtos**: monte a planilha (ver abaixo) ou edite `src/data/produtos.json`.
   Fotos: coloque em `fotos-originais/` e rode `npm run imagens`.
6. Apague de `public/produtos/` as fotos da loja de exemplo.
7. `npm run build` e `npm run preview` para conferir. Depois publique.

---

## Planilha do Google Sheets

Assim você ou o lojista atualizam produtos, preços e estoque **sem novo deploy**.
O passo a passo completo, com todas as colunas, está em [`planilha/MODELO_PLANILHA.md`](planilha/MODELO_PLANILHA.md).

Resumo:
1. Importe `planilha/produtos-exemplo.csv` no Google Sheets.
2. Uma coluna `estoque_<id-da-loja>` para cada loja: `sim`, `não`, `consultar`, um número ou `P:1;M:2`.
3. **Arquivo > Compartilhar > Publicar na Web**, aba dos produtos, formato **CSV**.
4. Cole o link em `loja.config.ts` > `produtos.urlPlanilha` e mude `fonte` para `'planilha'`.

Se a planilha falhar, o site usa a última cópia salva no navegador e depois o `produtos.json`.

---

## Publicar

### Vercel
1. Suba o projeto para um repositório no GitHub.
2. Em https://vercel.com, **Add New > Project**, importe o repositório.
3. A Vercel detecta o Vite. Confira: Build Command `npm run build`, Output Directory `dist`. **Deploy**.
4. O arquivo `vercel.json` já cuida das rotas (abrir `/produto/...` direto) e do cache.

### Netlify
1. Em https://app.netlify.com, **Add new site > Import an existing project**, escolha o repositório.
2. O `netlify.toml` já define o build (`npm run build`, pasta `dist`) e as rotas. **Deploy**.

### Domínio próprio (ex.: damarysmonteiro.com.br)
1. Registre o domínio (para `.com.br`: https://registro.br).
2. Na Vercel: **Project > Settings > Domains > Add**. Na Netlify: **Domain management > Add a domain**.
3. A plataforma mostra os registros de DNS (tipo A ou CNAME) para cadastrar no registro.br,
   ou os servidores de DNS deles para usar no lugar. O HTTPS é ativado sozinho.
4. Atualize `urlSite` no `loja.config.ts` com o domínio final e publique de novo
   (as prévias de compartilhamento e o sitemap usam esse endereço).
5. Envie `https://seudominio/sitemap.xml` no [Google Search Console](https://search.google.com/search-console).

### Atualizar sem deploy x com deploy
- **Planilha** (preço, estoque, produto novo, ativar/desativar): muda sozinho no site.
- **Config, fotos novas em `public/`, textos e banners**: precisam de novo deploy
  (com o GitHub ligado, basta enviar a alteração; a Vercel/Netlify publica sozinha).
- A prévia de link de um produto **novo** (foto no WhatsApp) só existe depois de um deploy.
  Na Vercel: **Deployments > ⋯ > Redeploy**. Na Netlify: **Deploys > Trigger deploy**.

---

## Métricas (para mostrar resultados ao cliente)

Preencha em `loja.config.ts` > `metricas`:
- `googleAnalyticsId`: ID do GA4 (`G-XXXXXXX`)
- `metaPixelId`: ID do Pixel da Meta

Eventos enviados:
- `pedido_whatsapp` (GA4) e `Contact` + `PedidoWhatsApp` (Pixel) em cada envio ao WhatsApp,
  com `origem` (`sacola`, `produto` ou `duvida`), `unidade`, valor estimado e número de itens.
- Visualização de página a cada troca de tela.

No GA4, marque `pedido_whatsapp` como **evento principal** (Administrador > Eventos) para ver
quantos pedidos o catálogo gerou por mês e por loja.

**LGPD:** com métricas ligadas, o site passa a usar cookies de terceiros. A página de
Privacidade passa a mencionar isso automaticamente. Para uso mais rigoroso, considere
adicionar um aviso de consentimento de cookies.

---

## Checklist de manutenção mensal

- [ ] Produtos novos: fotos em `fotos-originais/`, `npm run imagens`, linha na planilha
- [ ] Produtos que saíram: `ativo = não` (não apague a linha: o link antigo mostra "não existe mais")
- [ ] Preços e promoções: `preco` / `preco_promocional`
- [ ] Estoque por loja: colunas `estoque_...`
- [ ] Campanha da home: `campanha` (título, texto, 3 produtos da vitrine) na config
- [ ] Destaques e looks da home: `destaques` e `looks` na config
- [ ] Horários de feriado / fim de ano: `unidades[].horarios`
- [ ] Atualizar a reserva: `npm run planilha:json -- LINK_DA_PLANILHA`
- [ ] Deploy (para fotos, config e prévias de produtos novos)
- [ ] Teste rápido no celular: abrir um produto, pôr na sacola, enviar para o WhatsApp
- [ ] Relatório para o cliente: pedidos enviados (`pedido_whatsapp`) no GA4, por loja

---

## O que pedir à cliente antes de publicar

- [ ] Logo em alta resolução (PNG sem fundo ou SVG)
- [ ] WhatsApp de cada loja (ou um central)
- [ ] Endereço e horário de cada loja
- [ ] Fotos dos produtos com nome, preço, tamanhos e cores (e autorização para usar)
- [ ] Grade real de tamanhos (slim e plus)
- [ ] Formas de pagamento, parcelamento, entrega/frete e política de trocas
- [ ] Domínio desejado
- [ ] Foto da Dâmarys e texto para a seção "Sobre"
