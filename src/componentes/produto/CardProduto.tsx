import { Link } from 'react-router'
import { useUnidade } from '../../contextos/UnidadeContext.tsx'
import type { Produto } from '../../tipos/index.ts'
import { emPromocao, percentualDesconto } from '../../utils/preco.ts'
import { Imagem } from '../ui/Imagem.tsx'
import { Preco } from './Preco.tsx'
import { SeloDisponibilidade } from './SeloDisponibilidade.tsx'

export function CardProduto({ produto, prioridade = false }: { produto: Produto; prioridade?: boolean }) {
  const { unidade, escolhida } = useUnidade()
  const promo = emPromocao(produto)
  const novidade = produto.tags.includes('novidade')
  const plus = produto.tags.includes('plus size')

  return (
    <article className="group relative flex flex-col">
      <div className="relative">
        <Imagem
          src={produto.imagens[0] ?? ''}
          alt={`${produto.nome}${produto.cores.length ? `, ${produto.cores.join(', ')}` : ''}`}
          prioridade={prioridade}
          className="rounded-md transition-[filter] group-hover:brightness-[0.97]"
        />
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {promo && (
            <span className="rounded-sm bg-destaque px-2 py-0.5 text-xs font-semibold text-white">
              −{percentualDesconto(produto)}%
            </span>
          )}
          {novidade && <span className="rounded-sm bg-fundo/95 px-2 py-0.5 text-xs font-semibold text-primaria">Novidade</span>}
        </div>
      </div>
      <div className="mt-2.5 flex flex-1 flex-col gap-1">
        <h3 className="font-texto text-[0.95rem] font-normal leading-snug">
          {/* O link cobre o cartão inteiro (área de toque maior no celular) */}
          <Link to={`/produto/${produto.id}`} className="after:absolute after:inset-0">
            {produto.nome}
          </Link>
        </h3>
        {plus && <p className="text-xs text-suave">Até {produto.tamanhos.at(-1)}</p>}
        <Preco produto={produto} />
        {escolhida && <SeloDisponibilidade produto={produto} unidadeId={unidade.id} compacto />}
      </div>
    </article>
  )
}

/** Grade de cartões: 2 colunas no celular, até 4 no computador. */
export function GradeProdutos({ produtos, prioridade = 0 }: { produtos: Produto[]; prioridade?: number }) {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
      {produtos.map((p, i) => (
        <li key={p.id}>
          <CardProduto produto={p} prioridade={i < prioridade} />
        </li>
      ))}
    </ul>
  )
}
