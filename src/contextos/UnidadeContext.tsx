// Unidade (loja física) escolhida pelo cliente. Fica salva no navegador.

import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react'
import { loja } from '../config/loja.config.ts'
import type { Unidade } from '../tipos/index.ts'
import { gravar, ler } from '../utils/armazenamento.ts'

interface ValorUnidade {
  unidade: Unidade
  /** Falso enquanto o cliente ainda não escolheu (estamos usando a primeira da lista). */
  escolhida: boolean
  escolher: (id: string) => void
}

const Contexto = createContext<ValorUnidade | null>(null)
const CHAVE = 'unidade'

export function UnidadeProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<string | null>(() => {
    const salvo = ler<string | null>(CHAVE, null)
    return loja.unidades.some((u) => u.id === salvo) ? salvo : null
  })

  const escolher = useCallback((novo: string) => {
    setId(novo)
    gravar(CHAVE, novo)
  }, [])

  const valor = useMemo<ValorUnidade>(
    () => ({
      unidade: loja.unidades.find((u) => u.id === id) ?? loja.unidades[0],
      escolhida: id !== null,
      escolher,
    }),
    [id, escolher],
  )

  return <Contexto value={valor}>{children}</Contexto>
}

export function useUnidade(): ValorUnidade {
  const v = use(Contexto)
  if (!v) throw new Error('useUnidade precisa estar dentro de <UnidadeProvider>')
  return v
}
