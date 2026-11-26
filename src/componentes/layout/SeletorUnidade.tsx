// Barra logo abaixo do letreiro: mostra a loja escolhida e permite trocar.
// A loja escolhida define o WhatsApp que recebe o pedido e a disponibilidade mostrada.

import { useState } from 'react'
import { loja } from '../../config/loja.config.ts'
import { useUnidade } from '../../contextos/UnidadeContext.tsx'
import { Dialogo } from '../ui/Dialogo.tsx'
import { IconeLoja } from '../ui/Icones.tsx'

export function SeletorUnidade() {
  const { unidade, escolhida, escolher } = useUnidade()
  const [aberto, setAberto] = useState(false)

  if (loja.unidades.length < 2) return null

  return (
    <>
      <div className="border-b border-superficie bg-fundo">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 text-sm">
          <span className="flex min-w-0 items-center gap-2">
            <IconeLoja width={18} height={18} className="shrink-0 text-primaria" />
            <span className="truncate">
              {escolhida ? (
                <>
                  Comprando na <strong className="font-semibold">{unidade.nome}</strong>
                </>
              ) : (
                'Escolha a loja mais perto de você'
              )}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setAberto(true)}
            className="-mr-2 inline-flex min-h-11 shrink-0 items-center rounded px-2 font-semibold text-primaria underline underline-offset-4"
          >
            {escolhida ? 'Trocar loja' : 'Escolher'}
          </button>
        </div>
      </div>

      <Dialogo aberto={aberto} aoFechar={() => setAberto(false)} titulo="Escolha sua loja">
        <p className="mb-4 text-sm text-suave">
          Seu pedido vai para o WhatsApp da loja escolhida, e o catálogo mostra o que tem lá.
        </p>
        <fieldset className="space-y-2">
          <legend className="sr-only">Lojas</legend>
          {loja.unidades.map((u) => (
            <label
              key={u.id}
              className="pressionavel flex items-start gap-3 rounded-lg border border-superficie bg-white/60 p-3 has-[:checked]:border-primaria has-[:checked]:bg-white"
            >
              <input
                type="radio"
                name="unidade"
                value={u.id}
                checked={escolhida && u.id === unidade.id}
                onChange={() => {
                  escolher(u.id)
                  setAberto(false)
                }}
                className="mt-1 accent-[var(--cor-primaria)]"
              />
              <span>
                <span className="block font-semibold">{u.nome}</span>
                <span className="block text-sm text-suave">{u.bairroCidade}</span>
              </span>
            </label>
          ))}
        </fieldset>
      </Dialogo>
    </>
  )
}
