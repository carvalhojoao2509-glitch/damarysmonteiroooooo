// Filtros e ordenação do catálogo. O estado dos filtros mora na URL
// (?q=vestido&tam=M&promo=1...), então o link filtrado pode ser compartilhado.

import type { Produto } from '../tipos/index.ts'
import { pontuarBusca } from './busca.ts'
import { statusNaUnidade } from './disponibilidade.ts'
import { emPromocao, precoFinal } from './preco.ts'
import { slug } from './texto.ts'

export type Ordem = 'relevancia' | 'menor-preco' | 'maior-preco' | 'novidades'

export const opcoesOrdem: { valor: Ordem; rotulo: string }[] = [
  { valor: 'relevancia', rotulo: 'Relevância' },
  { valor: 'novidades', rotulo: 'Novidades' },
  { valor: 'menor-preco', rotulo: 'Menor preço' },
  { valor: 'maior-preco', rotulo: 'Maior preço' },
]

export interface Filtros {
  busca: string
  /** slug da categoria (vem do caminho /catalogo/:categoria) */
  categoria: string
  tamanhos: string[]
  cores: string[]
  precoMin?: number
  precoMax?: number
  promocao: boolean
  /** id da unidade: mostra só o que está disponível nela */
  unidade: string
  /** tag, ex.: "novidade" (links da home e da campanha) */
  tag: string
  ordem: Ordem
}

const lista = (v: string | null) => (v ? v.split(',').filter(Boolean) : [])
const numero = (v: string | null) => {
  const n = v ? Number(v) : NaN
  return Number.isFinite(n) && n >= 0 ? n : undefined
}

export function lerFiltros(params: URLSearchParams, categoria = ''): Filtros {
  const ordem = params.get('ordem') as Ordem | null
  return {
    busca: params.get('q') ?? '',
    categoria,
    tamanhos: lista(params.get('tam')),
    cores: lista(params.get('cor')),
    precoMin: numero(params.get('min')),
    precoMax: numero(params.get('max')),
    promocao: params.get('promo') === '1',
    unidade: params.get('unidade') ?? '',
    tag: params.get('tag') ?? '',
    ordem: ordem && opcoesOrdem.some((o) => o.valor === ordem) ? ordem : 'relevancia',
  }
}

/** Gera os parâmetros da URL a partir dos filtros (sem a categoria, que fica no caminho). */
export function escreverFiltros(f: Filtros): URLSearchParams {
  const p = new URLSearchParams()
  if (f.busca) p.set('q', f.busca)
  if (f.tamanhos.length) p.set('tam', f.tamanhos.join(','))
  if (f.cores.length) p.set('cor', f.cores.join(','))
  if (f.precoMin !== undefined) p.set('min', String(f.precoMin))
  if (f.precoMax !== undefined) p.set('max', String(f.precoMax))
  if (f.promocao) p.set('promo', '1')
  if (f.unidade) p.set('unidade', f.unidade)
  if (f.tag) p.set('tag', f.tag)
  if (f.ordem !== 'relevancia') p.set('ordem', f.ordem)
  return p
}

/** Quantos filtros (fora busca, categoria e ordem) estão ligados. */
export function contarFiltrosAtivos(f: Filtros): number {
  return (
    f.tamanhos.length +
    f.cores.length +
    (f.precoMin !== undefined || f.precoMax !== undefined ? 1 : 0) +
    (f.promocao ? 1 : 0) +
    (f.unidade ? 1 : 0) +
    (f.tag ? 1 : 0)
  )
}

/** Aplica filtros e ordenação. Produtos inativos nunca aparecem. */
export function aplicarFiltros(produtos: Produto[], f: Filtros): Produto[] {
  const pontos = new Map<string, number>()

  const resultado = produtos.filter((p) => {
    if (!p.ativo) return false
    if (f.categoria && slug(p.categoria) !== f.categoria) return false
    if (f.tag && !p.tags.includes(f.tag)) return false
    if (f.tamanhos.length && !f.tamanhos.some((t) => p.tamanhos.includes(t))) return false
    if (f.cores.length && !f.cores.some((c) => p.cores.includes(c))) return false
    const preco = precoFinal(p)
    if (f.precoMin !== undefined && preco < f.precoMin) return false
    if (f.precoMax !== undefined && preco > f.precoMax) return false
    if (f.promocao && !emPromocao(p)) return false
    if (f.unidade) {
      // Com tamanho escolhido, exige estoque em pelo menos um dos tamanhos marcados.
      const tams = f.tamanhos.length ? f.tamanhos : [undefined]
      if (!tams.some((t) => statusNaUnidade(p, f.unidade, t) === 'disponivel')) return false
    }
    if (f.busca) {
      const n = pontuarBusca(p, f.busca)
      if (n === 0) return false
      pontos.set(p.id, n)
    }
    return true
  })

  const maisVendido = (p: Produto) => (p.tags.includes('mais vendido') ? 1 : 0)
  const porData = (a: Produto, b: Produto) => b.dataCadastro.localeCompare(a.dataCadastro)

  switch (f.ordem) {
    case 'menor-preco':
      return resultado.sort((a, b) => precoFinal(a) - precoFinal(b))
    case 'maior-preco':
      return resultado.sort((a, b) => precoFinal(b) - precoFinal(a))
    case 'novidades':
      return resultado.sort(porData)
    default:
      // Relevância: pontos da busca; sem busca, "mais vendido" primeiro e depois os mais novos.
      return resultado.sort(
        (a, b) =>
          (pontos.get(b.id) ?? 0) - (pontos.get(a.id) ?? 0) ||
          maisVendido(b) - maisVendido(a) ||
          porData(a, b),
      )
  }
}
