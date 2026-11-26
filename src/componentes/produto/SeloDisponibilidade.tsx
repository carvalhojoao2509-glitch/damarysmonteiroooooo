// Mostra se a peça está disponível na loja escolhida e, se não estiver,
// sugere outra loja que tenha.

import { loja } from '../../config/loja.config.ts'
import type { Produto, StatusDisponibilidade } from '../../tipos/index.ts'
import { outrasUnidadesComPeca, statusNaUnidade, textoStatus } from '../../utils/disponibilidade.ts'

const estilo: Record<StatusDisponibilidade, string> = {
  disponivel: 'text-disponivel',
  consultar: 'text-suave',
  indisponivel: 'text-destaque',
}
const marcador: Record<StatusDisponibilidade, string> = {
  disponivel: 'bg-disponivel',
  consultar: 'border border-suave',
  indisponivel: 'border-2 border-destaque',
}

interface Props {
  produto: Produto
  unidadeId: string
  tamanho?: string
  compacto?: boolean
}

export function SeloDisponibilidade({ produto, unidadeId, tamanho, compacto = false }: Props) {
  const status = statusNaUnidade(produto, unidadeId, tamanho)
  const outras = status !== 'disponivel' ? outrasUnidadesComPeca(produto, loja.unidades, unidadeId, tamanho) : []
  const texto = compacto && status === 'disponivel' ? 'Disponível na sua loja' : textoStatus[status]

  return (
    <div className={compacto ? 'text-xs' : 'text-sm'}>
      <p className={`flex items-center gap-1.5 font-medium ${estilo[status]}`}>
        <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${marcador[status]}`} aria-hidden />
        {tamanho && !compacto ? `Tamanho ${tamanho}: ` : ''}
        {texto}
      </p>
      {outras.length > 0 && (
        <p className="mt-0.5 text-suave">
          Tem na {outras.map((u) => u.nome.replace(/^Loja /, '')).join(' e na ')}
        </p>
      )}
    </div>
  )
}
