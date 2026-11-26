# Modelo da planilha de produtos

Cada **linha** é um produto. A primeira linha tem os nomes das colunas, exatamente como abaixo
(maiúsculas e acentos não importam: `Preço Promocional` e `preco_promocional` funcionam igual).

Para começar, importe o arquivo `produtos-exemplo.csv` desta pasta no Google Sheets
(Arquivo > Importar > Fazer upload) e apague as linhas de exemplo.

## Colunas

| Coluna | Obrigatória | O que preencher | Exemplo |
|---|---|---|---|
| `id` | sim | Código único, sem espaços nem acentos. Vira o link do produto. **Não mude depois de publicado** (quem salvou o link perde a página). | `camisa-gola-perolas` |
| `nome` | sim | Nome que aparece no site e na mensagem do WhatsApp. | `Camisa Gola de Pérolas` |
| `descricao` | não | Texto da página do produto. Também aparece na prévia do link. | `Camisa branca de tecido leve...` |
| `categoria` | sim | Agrupa no catálogo e vira filtro. Escreva sempre igual. | `Blusas e camisas` |
| `subcategoria` | não | Detalhe extra (entra na busca). | `Camisa` |
| `preco` | sim | Preço normal. Aceita `189,90`, `189.90` ou `R$ 189,90`. | `189,90` |
| `preco_promocional` | não | Preço com desconto. Se for menor que `preco`, o produto entra em "Promo" com o selo de %. Deixe vazio para tirar da promoção. | `149,90` |
| `imagens` | sim | Endereços das fotos separados por `\|`. A primeira é a capa. | `/produtos/camisa-1.webp\|/produtos/camisa-2.webp` |
| `tamanhos` | não | Separados por `\|`. | `P\|M\|G\|GG\|G1\|G2` |
| `cores` | não | Separadas por `\|`. Para mostrar a bolinha de cor, o nome precisa existir em `coresProdutos` no `loja.config.ts`. | `Branca\|Azul-claro` |
| `tags` | não | Separadas por `\|`. As especiais são: `novidade` (selo e seção Novidades), `plus size` (coleção Plus Size), `mais vendido` (aparece primeiro em "Relevância"), `festa`. | `novidade\|plus size` |
| `publico` | não | Ex.: Feminino, Masculino, Infantil. | `Feminino` |
| `ativo` | não | `sim` ou `não`. Com `não` o produto some do site sem apagar a linha. Vazio = sim. | `sim` |
| `data_cadastro` | não | AAAA-MM-DD. Usada para ordenar por "Novidades". | `2026-11-24` |
| `estoque_<loja>` | não | Uma coluna por loja (veja abaixo). | `P:1;M:2;G:0` |

## Estoque por loja

Crie uma coluna para cada loja com o nome `estoque_` + o `id` da loja definido no `loja.config.ts`.
Nesta loja: `estoque_reta-da-penha`, `estoque_itarare`, `estoque_sao-pedro`
(hífen ou sublinhado tanto faz: `estoque_reta_da_penha` também funciona).

O que escrever em cada célula:

| Valor | Significa | No site aparece |
|---|---|---|
| `sim` (ou `x`) | Tem a peça, sem informar quantidade | Disponível nesta unidade |
| `não` (ou `0`) | Não tem | Indisponível nesta unidade (e sugere outra loja que tenha) |
| `consultar` ou vazio | Não sei | Consultar disponibilidade |
| `5` | Tem 5 peças no total | Disponível |
| `P:1;M:2;G:0` | Quantidade por tamanho | Disponível; o tamanho com 0 (ou que não aparece na lista) fica riscado |

## Publicar a planilha (para o site ler sozinho)

1. No Google Sheets: **Arquivo > Compartilhar > Publicar na Web**.
2. Em "Link", escolha a **aba dos produtos** e o formato **Valores separados por vírgula (.csv)**.
3. Clique em **Publicar** e copie o link. Ele termina com `output=csv`.
4. No `src/config/loja.config.ts`, em `produtos`, coloque:
   ```ts
   fonte: 'planilha',
   urlPlanilha: 'COLE O LINK AQUI',
   ```
5. Faça o deploy uma vez. Daí em diante, as mudanças na planilha aparecem no site sem novo deploy.

Observações:
- O Google pode levar **alguns minutos** para atualizar o CSV publicado depois de uma edição.
- O site guarda a planilha no navegador por `cacheMinutos` (5 por padrão). Quem já estava navegando
  pode ver a versão anterior por esse tempo.
- Se a planilha sair do ar ou for despublicada, o site usa a última cópia salva no navegador e,
  sem ela, o `src/data/produtos.json`. Rode `npm run planilha:json -- LINK_DA_PLANILHA` de vez
  em quando para manter essa reserva atualizada.
- O link publicado é público: não coloque na planilha custos, fornecedores ou dados de clientes.
  Use outra aba (não publicada) para isso.
