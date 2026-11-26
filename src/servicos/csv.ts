// Converte as linhas da planilha (CSV) e do produtos.json em produtos tipados.
// Também é usado pelos scripts de build, por isso não usa nada do navegador.
//
// Regras de preenchimento da planilha estão documentadas em planilha/MODELO_PLANILHA.md.

import Papa from 'papaparse'
import type { Estoque, Produto } from '../tipos/index.ts'
import { normalizar } from '../utils/texto.ts'

/** Formato "solto" aceito no produtos.json e nas linhas da planilha. */
export interface ProdutoBruto {
  id?: unknown
  nome?: unknown
  descricao?: unknown
  categoria?: unknown
  subcategoria?: unknown
  preco?: unknown
  precoPromocional?: unknown
  imagens?: unknown
  tamanhos?: unknown
  cores?: unknown
  tags?: unknown
  publico?: unknown
  ativo?: unknown
  dataCadastro?: unknown
  /** id da unidade -> "sim" | "não" | "consultar" | "5" | "P:2;M:0;G:3" */
  estoque?: Record<string, unknown>
}

const texto = (v: unknown) => (v === null || v === undefined ? '' : String(v).trim())

/** Aceita "189,90", "189.90", "R$ 1.189,90" e números. */
export function lerPreco(v: unknown): number | undefined {
  if (typeof v === 'number') return Number.isFinite(v) && v > 0 ? v : undefined
  let s = texto(v).replace(/r\$/i, '').replace(/\s/g, '')
  if (!s) return undefined
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.')
  const n = Number(s)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

/** "P|M|G", "P, M, G" ou ["P","M"] -> ["P","M","G"] */
export function lerLista(v: unknown, separadores = /[|,;]/): string[] {
  if (Array.isArray(v)) return v.map(texto).filter(Boolean)
  return texto(v)
    .split(separadores)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Vazio conta como "sim" (produto ativo por padrão). */
export function lerSimNao(v: unknown, padrao = true): boolean {
  if (typeof v === 'boolean') return v
  const s = normalizar(texto(v))
  if (!s) return padrao
  return ['sim', 's', 'x', 'true', '1', 'ativo', 'yes'].includes(s)
}

/**
 * Interpreta a célula de estoque de uma unidade:
 * - "sim" / "x"            -> disponível, sem quantidade
 * - "não" / "0"            -> indisponível
 * - "consultar" / vazio    -> consultar disponibilidade
 * - "5"                    -> 5 peças no total
 * - "P:2; M:0; G:3"        -> quantidade por tamanho (também aceita P=2)
 */
export function lerEstoque(v: unknown): Estoque {
  if (typeof v === 'number') return v > 0 ? { tipo: 'quantidade', total: v } : { tipo: 'nao' }
  const bruto = texto(v)
  const s = normalizar(bruto)
  if (!s || s === 'consultar' || s === '?') return { tipo: 'consultar' }
  if (['sim', 's', 'x', 'disponivel'].includes(s)) return { tipo: 'sim' }
  if (['nao', 'n', 'indisponivel', 'esgotado'].includes(s)) return { tipo: 'nao' }
  if (/^\d+$/.test(s)) {
    const n = Number(s)
    return n > 0 ? { tipo: 'quantidade', total: n } : { tipo: 'nao' }
  }
  const quantidades: Record<string, number> = {}
  for (const parte of bruto.split(/[;,|]/)) {
    const m = parte.trim().match(/^(.+?)\s*[:=]\s*(\d+)$/)
    if (m) quantidades[m[1].trim().toUpperCase()] = Number(m[2])
  }
  if (Object.keys(quantidades).length > 0) return { tipo: 'porTamanho', quantidades }
  return { tipo: 'consultar' }
}

/** Converte um produto "solto" em Produto. Retorna null se faltar o essencial. */
export function montarProduto(b: ProdutoBruto): Produto | null {
  const id = texto(b.id)
  const nome = texto(b.nome)
  const preco = lerPreco(b.preco)
  if (!id || !nome || preco === undefined) return null

  const estoque: Record<string, Estoque> = {}
  for (const [unidade, valor] of Object.entries(b.estoque ?? {})) {
    estoque[unidade] = lerEstoque(valor)
  }

  return {
    id,
    nome,
    descricao: texto(b.descricao),
    categoria: texto(b.categoria) || 'Outros',
    subcategoria: texto(b.subcategoria),
    preco,
    precoPromocional: lerPreco(b.precoPromocional),
    imagens: lerLista(b.imagens, /[|\n]/),
    tamanhos: lerLista(b.tamanhos),
    cores: lerLista(b.cores),
    tags: lerLista(b.tags).map((t) => normalizar(t)),
    publico: texto(b.publico),
    ativo: lerSimNao(b.ativo),
    dataCadastro: texto(b.dataCadastro),
    estoque,
  }
}

/** "Preço Promocional" -> "preco_promocional" */
const nomeColuna = (c: string) => normalizar(c).replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')

/** Lê o texto CSV da planilha e devolve a lista de produtos válidos. */
export function lerCsvProdutos(csv: string): Produto[] {
  const { data } = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: nomeColuna,
  })

  const produtos: Produto[] = []
  for (const linha of data) {
    const estoque: Record<string, unknown> = {}
    for (const [coluna, valor] of Object.entries(linha)) {
      // "estoque_reta_da_penha" -> unidade "reta-da-penha" (ids de unidade usam hífen)
      if (coluna.startsWith('estoque_')) estoque[coluna.slice('estoque_'.length).replace(/_/g, '-')] = valor
    }
    const p = montarProduto({
      id: linha.id,
      nome: linha.nome,
      descricao: linha.descricao,
      categoria: linha.categoria,
      subcategoria: linha.subcategoria,
      preco: linha.preco,
      precoPromocional: linha.preco_promocional,
      imagens: linha.imagens,
      tamanhos: linha.tamanhos,
      cores: linha.cores,
      tags: linha.tags,
      publico: linha.publico,
      ativo: linha.ativo,
      dataCadastro: linha.data_cadastro,
      estoque,
    })
    if (p) produtos.push(p)
  }
  return produtos
}

/** Converte o conteúdo do produtos.json. */
export function lerJsonProdutos(lista: ProdutoBruto[]): Produto[] {
  return lista.map(montarProduto).filter((p): p is Produto => p !== null)
}
