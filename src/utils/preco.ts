import type { Produto } from '../tipos/index.ts'

const formatador = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** 189.9 -> "R$ 189,90" (com espaço comum, para funcionar bem também no WhatsApp). */
export function formatarPreco(valor: number): string {
  return formatador.format(valor).replace(/ /g, ' ')
}

/** Preço que vale de fato: o promocional, se houver e for menor. */
export function precoFinal(p: Produto): number {
  return p.precoPromocional && p.precoPromocional < p.preco ? p.precoPromocional : p.preco
}

export function emPromocao(p: Produto): boolean {
  return precoFinal(p) < p.preco
}

/** Percentual de desconto arredondado, ex.: 20 */
export function percentualDesconto(p: Produto): number {
  return Math.round((1 - precoFinal(p) / p.preco) * 100)
}

/**
 * Quantas parcelas cabem respeitando o valor mínimo da parcela.
 * Retorna 1 quando não compensa parcelar.
 */
export function parcelasPossiveis(valor: number, vezes: number, minimo: number): number {
  return Math.max(1, Math.min(vezes, Math.floor(valor / minimo)))
}
