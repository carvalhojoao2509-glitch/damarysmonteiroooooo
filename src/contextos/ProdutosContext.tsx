// Disponibiliza a lista de produtos para todas as páginas.

import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react'
import { carregarProdutos, produtosImediatos, type OrigemProdutos } from '../servicos/produtos.ts'
import type { Produto } from '../tipos/index.ts'

interface ValorProdutos {
  /** Somente produtos ativos. */
  produtos: Produto[]
  carregando: boolean
  origem: OrigemProdutos | null
  buscarPorId: (id: string) => Produto | undefined
}

const Contexto = createContext<ValorProdutos | null>(null)

export function ProdutosProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<{ produtos: Produto[]; origem: OrigemProdutos | null }>(() => {
    const imediatos = produtosImediatos()
    return imediatos
      ? { produtos: imediatos.produtos.filter((p) => p.ativo), origem: imediatos.origem }
      : { produtos: [], origem: null }
  })

  useEffect(() => {
    if (estado.origem !== null) return // já carregado sem rede
    let ativo = true
    carregarProdutos().then((r) => {
      if (ativo) setEstado({ produtos: r.produtos.filter((p) => p.ativo), origem: r.origem })
    })
    return () => {
      ativo = false
    }
  }, [])

  const valor = useMemo<ValorProdutos>(() => {
    const porId = new Map(estado.produtos.map((p) => [p.id, p]))
    return {
      produtos: estado.produtos,
      carregando: estado.origem === null,
      origem: estado.origem,
      buscarPorId: (id) => porId.get(id),
    }
  }, [estado])

  return <Contexto value={valor}>{children}</Contexto>
}

export function useProdutos(): ValorProdutos {
  const v = use(Contexto)
  if (!v) throw new Error('useProdutos precisa estar dentro de <ProdutosProvider>')
  return v
}
