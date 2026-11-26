// Catálogo com busca, filtros e ordenação. Tudo fica na URL:
// /catalogo/conjuntos?q=linho&tam=M,G&promo=1&ordem=menor-preco

import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { loja } from '../config/loja.config.ts'
import { useProdutos } from '../contextos/ProdutosContext.tsx'
import { GradeProdutos } from '../componentes/produto/CardProduto.tsx'
import { Dialogo } from '../componentes/ui/Dialogo.tsx'
import { IconeBusca, IconeFechar, IconeFiltro } from '../componentes/ui/Icones.tsx'
import { Seo } from '../componentes/ui/Seo.tsx'
import {
  aplicarFiltros,
  contarFiltrosAtivos,
  escreverFiltros,
  lerFiltros,
  opcoesOrdem,
  type Filtros,
  type Ordem,
} from '../utils/filtros.ts'
import { precoFinal } from '../utils/preco.ts'
import { slug } from '../utils/texto.ts'

/** Ordem de exibição dos tamanhos (o que não estiver aqui vai para o fim). */
const ORDEM_TAMANHOS = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'G1', 'G2', 'G3', 'G4', '34', '36', '38', '40', '42', '44', '46', '48', '50', 'Único']

const nomeTag: Record<string, string> = { novidade: 'Novidades', 'plus size': 'Plus Size', 'mais vendido': 'Mais vendidos', festa: 'Festa' }

export default function Catalogo() {
  const { categoria = '' } = useParams()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { produtos, carregando } = useProdutos()
  const [painelAberto, setPainelAberto] = useState(false)

  const filtros = lerFiltros(params, categoria)
  const resultado = useMemo(() => aplicarFiltros(produtos, filtros), [produtos, params, categoria])

  // Opções disponíveis vêm dos próprios produtos (nada para configurar).
  const categorias = useMemo(() => [...new Set(produtos.map((p) => p.categoria))], [produtos])
  const tamanhos = useMemo(() => {
    const todos = [...new Set(produtos.flatMap((p) => p.tamanhos))]
    const pos = (t: string) => (ORDEM_TAMANHOS.indexOf(t) + 1 || 999)
    return todos.sort((a, b) => pos(a) - pos(b))
  }, [produtos])
  const cores = useMemo(() => [...new Set(produtos.flatMap((p) => p.cores))].sort(), [produtos])
  const precoMaximo = useMemo(() => Math.ceil(Math.max(0, ...produtos.map(precoFinal))), [produtos])

  const nomeCategoria = categorias.find((c) => slug(c) === categoria)
  const titulo =
    nomeCategoria ?? (filtros.tag ? nomeTag[filtros.tag] ?? filtros.tag : filtros.promocao ? 'Promo' : 'Catálogo')

  /** Atualiza a URL; replace evita encher o histórico do "voltar" a cada clique. */
  const atualizar = (mudanca: Partial<Filtros>) => {
    const novo = { ...filtros, ...mudanca }
    setParams(escreverFiltros(novo), { replace: true })
  }
  const trocarCategoria = (c: string) => {
    const qs = escreverFiltros(filtros).toString()
    navigate(`/catalogo${c ? `/${c}` : ''}${qs ? `?${qs}` : ''}`)
  }
  const alternar = (lista: string[], valor: string) =>
    lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor]
  const limpar = () => setParams(escreverFiltros({ ...lerFiltros(new URLSearchParams()), busca: filtros.busca, ordem: filtros.ordem }), { replace: true })

  const ativos = contarFiltrosAtivos(filtros)

  const chip = (ativo: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-sm ${ativo ? 'border-primaria bg-primaria text-sobre-primaria' : 'border-texto/25 bg-white'}`

  const painel = (
    <div className="space-y-7">
      <fieldset>
        <legend className="mb-2 font-semibold">Categoria</legend>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={chip(!categoria)} aria-pressed={!categoria} onClick={() => trocarCategoria('')}>
            Todas
          </button>
          {categorias.map((c) => (
            <button key={c} type="button" className={chip(slug(c) === categoria)} aria-pressed={slug(c) === categoria} onClick={() => trocarCategoria(slug(c))}>
              {c}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 font-semibold">Tamanho</legend>
        <div className="flex flex-wrap gap-2">
          {tamanhos.map((t) => (
            <button key={t} type="button" className={`${chip(filtros.tamanhos.includes(t))} min-w-11`} aria-pressed={filtros.tamanhos.includes(t)} onClick={() => atualizar({ tamanhos: alternar(filtros.tamanhos, t) })}>
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 font-semibold">Cor</legend>
        <div className="flex flex-wrap gap-2">
          {cores.map((c) => (
            <button key={c} type="button" className={`${chip(filtros.cores.includes(c))} flex items-center gap-1.5`} aria-pressed={filtros.cores.includes(c)} onClick={() => atualizar({ cores: alternar(filtros.cores, c) })}>
              {loja.coresProdutos[c] && (
                <span className="h-3.5 w-3.5 rounded-full ring-1 ring-black/20" style={{ background: loja.coresProdutos[c] }} aria-hidden />
              )}
              {c}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 font-semibold">Preço (R$)</legend>
        <div className="flex items-center gap-3">
          <label className="flex-1">
            <span className="mb-1 block text-sm text-suave">Mínimo</span>
            <input type="number" inputMode="numeric" min={0} placeholder="0" className="campo" value={filtros.precoMin ?? ''} onChange={(e) => atualizar({ precoMin: e.target.value === '' ? undefined : Number(e.target.value) })} />
          </label>
          <label className="flex-1">
            <span className="mb-1 block text-sm text-suave">Máximo</span>
            <input type="number" inputMode="numeric" min={0} placeholder={String(precoMaximo)} className="campo" value={filtros.precoMax ?? ''} onChange={(e) => atualizar({ precoMax: e.target.value === '' ? undefined : Number(e.target.value) })} />
          </label>
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="mb-2 font-semibold">Mais filtros</legend>
        <label className="flex items-center gap-3">
          <input type="checkbox" className="h-5 w-5 accent-[var(--cor-primaria)]" checked={filtros.promocao} onChange={(e) => atualizar({ promocao: e.target.checked })} />
          Só promoções
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" className="h-5 w-5 accent-[var(--cor-primaria)]" checked={filtros.tag === 'plus size'} onChange={(e) => atualizar({ tag: e.target.checked ? 'plus size' : '' })} />
          Só plus size
        </label>
        <label className="block">
          <span className="mb-1 block">Disponível na loja</span>
          <select className="campo" value={filtros.unidade} onChange={(e) => atualizar({ unidade: e.target.value })}>
            <option value="">Qualquer loja</option>
            {loja.unidades.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      {ativos > 0 && (
        <button type="button" onClick={limpar} className="font-semibold text-primaria underline underline-offset-4">
          Limpar filtros
        </button>
      )}
    </div>
  )

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6">
      <Seo titulo={titulo} descricao={`${titulo} da ${loja.nome}. ${loja.slogan}.`} />

      <nav aria-label="Você está em" className="mb-2 text-sm text-suave">
        <Link to="/" className="hover:underline">Início</Link> / <span aria-current="page">{titulo}</span>
      </nav>
      <h1 className="text-4xl md:text-5xl">{titulo}</h1>

      {/* Busca */}
      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative mt-5">
        <label htmlFor="busca" className="sr-only">Buscar no catálogo</label>
        <IconeBusca className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-suave" />
        <input
          id="busca"
          type="search"
          enterKeyHint="search"
          placeholder="Buscar: camisa, linho, vinho…"
          className="campo pl-11"
          value={filtros.busca}
          onChange={(e) => atualizar({ busca: e.target.value })}
        />
      </form>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button type="button" onClick={() => setPainelAberto(true)} className="flex items-center gap-2 rounded-md border border-texto/25 bg-white px-4 py-2.5 font-semibold lg:hidden">
          <IconeFiltro width={18} height={18} /> Filtrar{ativos > 0 && ` (${ativos})`}
        </button>
        <p className="hidden text-sm text-suave lg:block" aria-live="polite">
          {carregando ? 'Carregando…' : `${resultado.length} ${resultado.length === 1 ? 'peça' : 'peças'}`}
        </p>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-suave">Ordenar</span>
          <select className="campo w-auto py-2" value={filtros.ordem} onChange={(e) => atualizar({ ordem: e.target.value as Ordem })}>
            {opcoesOrdem.map((o) => (
              <option key={o.valor} value={o.valor}>{o.rotulo}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-3 text-sm text-suave lg:hidden" aria-live="polite">
        {carregando ? 'Carregando…' : `${resultado.length} ${resultado.length === 1 ? 'peça' : 'peças'}`}
      </p>

      <div className="mt-6 lg:grid lg:grid-cols-[15rem_1fr] lg:gap-10">
        <aside className="hidden lg:block" aria-label="Filtros">{painel}</aside>
        <div className="min-h-[60vh]">
          <h2 className="sr-only">Peças</h2>
          {!carregando && resultado.length === 0 ? (
            <div className="rounded-md bg-superficie/60 p-8 text-center">
              <p className="text-lg">Nenhuma peça com esses filtros.</p>
              <p className="mt-1 text-suave">Tire algum filtro ou fale com a loja: pode ter chegado novidade.</p>
              <button type="button" onClick={() => navigate('/catalogo')} className="mt-4 inline-flex items-center gap-1 font-semibold text-primaria underline underline-offset-4">
                <IconeFechar width={16} height={16} /> Ver o catálogo todo
              </button>
            </div>
          ) : (
            <GradeProdutos produtos={resultado} prioridade={2} />
          )}
        </div>
      </div>

      <Dialogo aberto={painelAberto} aoFechar={() => setPainelAberto(false)} titulo="Filtrar">
        {painel}
        <button type="button" onClick={() => setPainelAberto(false)} className="sticky bottom-0 mt-6 w-full rounded-md bg-primaria py-3 font-semibold text-sobre-primaria">
          Ver {resultado.length} {resultado.length === 1 ? 'peça' : 'peças'}
        </button>
      </Dialogo>
    </div>
  )
}
