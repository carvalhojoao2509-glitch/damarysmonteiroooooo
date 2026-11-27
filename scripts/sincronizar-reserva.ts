// Roda no início de todo build: se a loja usa a planilha, baixa a versão atual e
// regrava src/data/produtos.json, que é a cópia de reserva do site.
// Se a planilha falhar, mantém a reserva anterior e o build continua normalmente.

import { writeFile } from 'node:fs/promises'
import { loja } from '../src/config/loja.config.ts'
import { lerCsvProdutos } from '../src/servicos/csv.ts'
import type { Estoque } from '../src/tipos/index.ts'

const url = process.env.PLANILHA_URL || loja.produtos.urlPlanilha
if (loja.produtos.fonte !== 'planilha' || !url) {
  console.log('• reserva: a planilha não está ligada, mantendo src/data/produtos.json')
  process.exit(0)
}

const texto = (e: Estoque): string | number =>
  e.tipo === 'quantidade' ? e.total
  : e.tipo === 'porTamanho' ? Object.entries(e.quantidades).map(([t, q]) => `${t}:${q}`).join(';')
  : e.tipo

try {
  const r = await fetch(url, { signal: AbortSignal.timeout(15000) })
  const csv = await r.text()
  if (!r.ok || csv.trimStart().startsWith('<')) throw new Error(`resposta inválida (${r.status})`)
  const produtos = lerCsvProdutos(csv)
  if (!produtos.length) throw new Error('nenhum produto válido')
  const saida = produtos.map((p) => ({
    ...p,
    precoPromocional: p.precoPromocional ?? null,
    estoque: Object.fromEntries(Object.entries(p.estoque).map(([u, e]) => [u, texto(e)])),
  }))
  await writeFile('src/data/produtos.json', JSON.stringify(saida, null, 2) + '\n')
  console.log(`✓ reserva: ${produtos.length} produtos copiados da planilha`)
} catch (e) {
  console.warn(`! reserva: planilha indisponível (${String(e)}); mantendo a reserva anterior`)
}
