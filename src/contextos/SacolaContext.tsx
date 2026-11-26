// Sacola de compras. Guarda só os produtos escolhidos (nada de dados pessoais).

import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ItemSacola } from '../tipos/index.ts'
import { gravar, ler } from '../utils/armazenamento.ts'

interface ValorSacola {
  itens: ItemSacola[]
  quantidadeTotal: number
  subtotal: number
  adicionar: (item: Omit<ItemSacola, 'chave' | 'quantidade'>, quantidade?: number) => void
  alterarQuantidade: (chave: string, quantidade: number) => void
  remover: (chave: string) => void
  esvaziar: () => void
}

const Contexto = createContext<ValorSacola | null>(null)
const CHAVE = 'sacola'
export const QUANTIDADE_MAXIMA = 20

export function SacolaProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemSacola[]>(() => {
    const salvo = ler<ItemSacola[]>(CHAVE, [])
    return Array.isArray(salvo) ? salvo : []
  })

  useEffect(() => gravar(CHAVE, itens), [itens])

  const adicionar = useCallback<ValorSacola['adicionar']>((item, quantidade = 1) => {
    const chave = `${item.produtoId}|${item.tamanho}|${item.cor}`
    setItens((atual) => {
      const existente = atual.find((i) => i.chave === chave)
      if (existente) {
        return atual.map((i) =>
          i.chave === chave ? { ...i, quantidade: Math.min(QUANTIDADE_MAXIMA, i.quantidade + quantidade) } : i,
        )
      }
      return [...atual, { ...item, chave, quantidade }]
    })
  }, [])

  const alterarQuantidade = useCallback((chave: string, quantidade: number) => {
    const q = Math.max(1, Math.min(QUANTIDADE_MAXIMA, Math.round(quantidade)))
    setItens((atual) => atual.map((i) => (i.chave === chave ? { ...i, quantidade: q } : i)))
  }, [])

  const remover = useCallback((chave: string) => setItens((atual) => atual.filter((i) => i.chave !== chave)), [])
  const esvaziar = useCallback(() => setItens([]), [])

  const valor = useMemo<ValorSacola>(
    () => ({
      itens,
      quantidadeTotal: itens.reduce((s, i) => s + i.quantidade, 0),
      subtotal: itens.reduce((s, i) => s + i.preco * i.quantidade, 0),
      adicionar,
      alterarQuantidade,
      remover,
      esvaziar,
    }),
    [itens, adicionar, alterarQuantidade, remover, esvaziar],
  )

  return <Contexto value={valor}>{children}</Contexto>
}

export function useSacola(): ValorSacola {
  const v = use(Contexto)
  if (!v) throw new Error('useSacola precisa estar dentro de <SacolaProvider>')
  return v
}
