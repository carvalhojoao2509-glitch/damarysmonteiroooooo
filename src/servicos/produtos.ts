// Carrega os produtos da fonte escolhida em loja.config.ts.
//
// Fonte "planilha":
//   1. Se o navegador baixou a planilha há menos de `cacheMinutos`, usa essa cópia.
//   2. Senão, baixa a planilha pelo intermediário do próprio site (/api/planilha,
//      função da Netlify), que evita o bloqueio de CORS dos navegadores.
//   3. Se o intermediário não existir (outra hospedagem, teste local), baixa direto do Google.
//   4. Se tudo falhar, usa a última cópia salva (mesmo antiga) e, sem ela,
//      o src/data/produtos.json (reserva, refeito a cada publicação).
// Fonte "json": usa direto o src/data/produtos.json.

import { loja } from '../config/loja.config.ts'
import dadosLocais from '../data/produtos.json'
import type { Produto } from '../tipos/index.ts'
import { ler, gravar } from '../utils/armazenamento.ts'
import { lerCsvProdutos, lerJsonProdutos, type ProdutoBruto } from './csv.ts'

export type OrigemProdutos = 'json' | 'planilha' | 'planilha-cache' | 'reserva-json'

interface CachePlanilha {
  salvoEm: number
  url: string
  csv: string
}

const CHAVE_CACHE = 'planilha'

const produtosLocais = (): Produto[] => lerJsonProdutos(dadosLocais as ProdutoBruto[])

async function baixarPlanilha(url: string): Promise<string> {
  const controle = new AbortController()
  const limite = setTimeout(() => controle.abort(), 8000)
  try {
    const r = await fetch(url, { signal: controle.signal, cache: 'no-store' })
    if (!r.ok) throw new Error(`Planilha respondeu ${r.status}`)
    const csv = await r.text()
    // A planilha despublicada costuma devolver uma página HTML em vez de CSV.
    if (csv.trimStart().startsWith('<')) throw new Error('A planilha não está publicada como CSV')
    return csv
  } finally {
    clearTimeout(limite)
  }
}

/**
 * Produtos disponíveis já no primeiro desenho da tela, sem esperar rede:
 * a fonte "json" (que vai junto no site) ou uma cópia recente da planilha.
 * Retorna null quando é preciso baixar a planilha.
 */
export function produtosImediatos(): { produtos: Produto[]; origem: OrigemProdutos } | null {
  const { fonte, urlPlanilha, cacheMinutos } = loja.produtos
  if (fonte !== 'planilha' || !urlPlanilha) return { produtos: produtosLocais(), origem: 'json' }
  const cache = ler<CachePlanilha | null>(CHAVE_CACHE, null)
  if (cache && cache.url === urlPlanilha && Date.now() - cache.salvoEm < cacheMinutos * 60_000) {
    const produtos = lerCsvProdutos(cache.csv)
    if (produtos.length) return { produtos, origem: 'planilha-cache' }
  }
  return null
}

export async function carregarProdutos(): Promise<{ produtos: Produto[]; origem: OrigemProdutos }> {
  const { fonte, urlPlanilha, cacheMinutos } = loja.produtos
  if (fonte !== 'planilha' || !urlPlanilha) return { produtos: produtosLocais(), origem: 'json' }

  const cache = ler<CachePlanilha | null>(CHAVE_CACHE, null)
  const cacheValido = cache && cache.url === urlPlanilha
  if (cacheValido && Date.now() - cache.salvoEm < cacheMinutos * 60_000) {
    const produtos = lerCsvProdutos(cache.csv)
    if (produtos.length) return { produtos, origem: 'planilha-cache' }
  }

  try {
    let csv: string
    try {
      csv = await baixarPlanilha('/api/planilha')
    } catch (erroIntermediario) {
      console.warn('[catálogo] Intermediário indisponível, tentando o Google direto:', erroIntermediario)
      csv = await baixarPlanilha(urlPlanilha)
    }
    const produtos = lerCsvProdutos(csv)
    if (!produtos.length) throw new Error('Nenhum produto válido na planilha')
    gravar(CHAVE_CACHE, { salvoEm: Date.now(), url: urlPlanilha, csv } satisfies CachePlanilha)
    return { produtos, origem: 'planilha' }
  } catch (erro) {
    console.warn('[catálogo] Não foi possível ler a planilha:', erro)
    if (cacheValido) {
      const produtos = lerCsvProdutos(cache.csv)
      if (produtos.length) return { produtos, origem: 'planilha-cache' }
    }
    return { produtos: produtosLocais(), origem: 'reserva-json' }
  }
}
