// Janela modal acessível usando o <dialog> nativo do navegador:
// prende o foco, fecha com Esc e devolve o foco ao botão que abriu.

import { useEffect, useRef, type ReactNode } from 'react'
import { IconeFechar } from './Icones.tsx'

interface Props {
  aberto: boolean
  aoFechar: () => void
  titulo: string
  children: ReactNode
  /** 'lateral' = gaveta pela direita; 'base' = sobe do rodapé no celular */
  estilo?: 'base' | 'lateral'
}

export function Dialogo({ aberto, aoFechar, titulo, children, estilo = 'base' }: Props) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (aberto && !d.open) d.showModal()
    if (!aberto && d.open) d.close()
  }, [aberto])

  const posicao =
    estilo === 'lateral'
      ? 'ml-auto mr-0 h-dvh max-h-dvh w-[min(24rem,92vw)]'
      : 'mb-0 mt-auto w-full max-w-none sm:m-auto sm:max-w-lg sm:rounded-lg rounded-t-2xl max-h-[88dvh]'

  return (
    <dialog
      ref={ref}
      onClose={aoFechar}
      onClick={(e) => e.target === ref.current && aoFechar()}
      aria-label={titulo}
      className={`${posicao} bg-fundo p-0 text-texto shadow-xl`}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-superficie bg-fundo px-5 py-3">
        <h2 className="text-xl">{titulo}</h2>
        <button type="button" onClick={aoFechar} className="-mr-2 rounded p-2" aria-label="Fechar">
          <IconeFechar />
        </button>
      </div>
      <div className="px-5 py-4">{children}</div>
    </dialog>
  )
}
