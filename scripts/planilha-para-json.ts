// Converte uma planilha CSV em src/data/produtos.json.
//
// Uso:
//   npm run planilha:json                         -> usa planilha/produtos-exemplo.csv
//   npm run planilha:json -- caminho/arquivo.csv  -> usa um CSV baixado
//   npm run planilha:json -- https://docs.google.com/...output=csv  -> baixa da planilha publicada
//
// Útil para: (1) manter o produtos.json igual à planilha, servindo de reserva
// caso a planilha fique fora do ar; (2) clientes que preferem a fonte "json".

import { readFile, writeFile } from 'node:fs/promises'
import { lerCsvProdutos } from '../src/servicos/csv.ts'
import type { Estoque, Produto } from '../src/tipos/index.ts'

const origem = process.argv[2] ?? 'planilha/produtos-exemplo.csv'
const csv = origem.startsWith('http') ? await (await fetch(origem)).text() : await readFile(origem, 'utf8')

const produtos = lerCsvProdutos(csv)

/** Volta o estoque para o formato curto e legível usado no JSON ("sim", "P:2;M:0"...). */
function estoqueTexto(e: Estoque): string | number {
  switch (e.tipo) {
    case 'quantidade':
      return e.total
    case 'porTamanho':
      return Object.entries(e.quantidades)
        .map(([t, q]) => `${t}:${q}`)
        .join(';')
    default:
      return e.tipo
  }
}

const saida = produtos.map((p: Produto) => ({
  ...p,
  precoPromocional: p.precoPromocional ?? null,
  estoque: Object.fromEntries(Object.entries(p.estoque).map(([u, e]) => [u, estoqueTexto(e)])),
}))

await writeFile('src/data/produtos.json', JSON.stringify(saida, null, 2) + '\n')
console.log(`✓ ${produtos.length} produtos gravados em src/data/produtos.json (origem: ${origem})`)
