import { loja } from '../../config/loja.config.ts'
import type { Produto } from '../../tipos/index.ts'
import { emPromocao, formatarPreco, parcelasPossiveis, precoFinal } from '../../utils/preco.ts'

export function Preco({ produto, grande = false }: { produto: Produto; grande?: boolean }) {
  const final = precoFinal(produto)
  const promo = emPromocao(produto)
  const parc = loja.parcelamento
  const vezes = parc ? parcelasPossiveis(final, parc.vezes, parc.valorMinimoParcela) : 1

  return (
    <div>
      <p className="flex flex-wrap items-baseline gap-x-2">
        {promo && (
          <s className={`text-suave ${grande ? 'text-base' : 'text-sm'}`}>
            <span className="sr-only">De </span>
            {formatarPreco(produto.preco)}
          </s>
        )}
        <span className={`font-semibold ${grande ? 'text-2xl' : 'text-base'}`}>
          {promo && <span className="sr-only">por </span>}
          {formatarPreco(final)}
        </span>
      </p>
      {grande && vezes > 1 && parc && (
        <p className="text-sm text-suave">
          ou {vezes}x de {formatarPreco(final / vezes)}
          {parc.semJuros ? ' sem juros' : ''}
        </p>
      )}
    </div>
  )
}
