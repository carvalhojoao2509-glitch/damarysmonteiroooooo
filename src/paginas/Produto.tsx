import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { loja } from '../config/loja.config.ts'
import { useProdutos } from '../contextos/ProdutosContext.tsx'
import { useSacola } from '../contextos/SacolaContext.tsx'
import { useUnidade } from '../contextos/UnidadeContext.tsx'
import { GradeProdutos } from '../componentes/produto/CardProduto.tsx'
import { Preco } from '../componentes/produto/Preco.tsx'
import { SeloDisponibilidade } from '../componentes/produto/SeloDisponibilidade.tsx'
import { IconeWhatsApp } from '../componentes/ui/Icones.tsx'
import { Imagem } from '../componentes/ui/Imagem.tsx'
import { Seo } from '../componentes/ui/Seo.tsx'
import { registrarPedidoWhatsApp } from '../servicos/metricas.ts'
import { linkWhatsApp, mensagemItemUnico } from '../servicos/whatsapp.ts'
import { statusNaUnidade } from '../utils/disponibilidade.ts'
import { emPromocao, percentualDesconto, precoFinal } from '../utils/preco.ts'
import { slug } from '../utils/texto.ts'
import NaoEncontrada from './NaoEncontrada.tsx'

export default function Produto() {
  const { id = '' } = useParams()
  const { produtos, carregando, buscarPorId } = useProdutos()
  const { unidade } = useUnidade()
  const { adicionar } = useSacola()
  const produto = buscarPorId(id)

  const [foto, setFoto] = useState(0)
  const [tamanho, setTamanho] = useState('')
  const [cor, setCor] = useState('')
  const [erro, setErro] = useState('')
  const [adicionado, setAdicionado] = useState(false)
  const galeria = useRef<HTMLDivElement>(null)

  // Peça com um só tamanho/cor já vem escolhida.
  useEffect(() => {
    setFoto(0)
    setErro('')
    setAdicionado(false)
    setTamanho(produto?.tamanhos.length === 1 ? produto.tamanhos[0] : '')
    setCor(produto?.cores.length === 1 ? produto.cores[0] : '')
  }, [produto])

  if (carregando) return <p className="mx-auto min-h-dvh max-w-6xl px-4 py-16 text-suave">Carregando…</p>
  if (!produto) return <NaoEncontrada />

  const faltando = [!tamanho && produto.tamanhos.length ? 'o tamanho' : '', !cor && produto.cores.length ? 'a cor' : ''].filter(Boolean)
  const item = {
    produtoId: produto.id,
    nome: produto.nome,
    imagem: produto.imagens[0] ?? '',
    tamanho,
    cor,
    preco: precoFinal(produto),
  }

  const validar = () => {
    if (faltando.length) {
      setErro(`Escolha ${faltando.join(' e ')}.`)
      return false
    }
    setErro('')
    return true
  }

  const aoAdicionar = () => {
    if (!validar()) return
    adicionar(item)
    setAdicionado(true)
  }

  const linkCompraDireta = linkWhatsApp(
    unidade.whatsapp,
    mensagemItemUnico({ ...item, chave: '', quantidade: 1 }, unidade),
  )

  const relacionados = produtos.filter((p) => p.categoria === produto.categoria && p.id !== produto.id).slice(0, 4)

  /** Rola a galeria até a foto escolhida (no celular as fotos ficam lado a lado). */
  const irParaFoto = (i: number) => {
    setFoto(i)
    const el = galeria.current
    if (el) el.scrollTo({ left: el.clientWidth * i, behavior: 'smooth' })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4">
      <Seo titulo={produto.nome} descricao={produto.descricao} />

      <nav aria-label="Você está em" className="mb-4 text-sm text-suave">
        <Link to="/" className="hover:underline">Início</Link> /{' '}
        <Link to={`/catalogo/${slug(produto.categoria)}`} className="hover:underline">{produto.categoria}</Link> /{' '}
        <span aria-current="page">{produto.nome}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:gap-12">
        {/* Galeria */}
        <div>
          <div
            ref={galeria}
            className="sem-barra -mx-4 flex snap-x snap-mandatory overflow-x-auto md:mx-0"
            onScroll={(e) => {
              const el = e.currentTarget
              setFoto(Math.round(el.scrollLeft / el.clientWidth))
            }}
            aria-label="Fotos do produto"
          >
            {produto.imagens.map((src, i) => (
              <div key={src} className="w-full shrink-0 snap-center px-4 md:px-0">
                <Imagem src={src} alt={`${produto.nome}, foto ${i + 1} de ${produto.imagens.length}`} prioridade={i === 0} className="rounded-md" />
              </div>
            ))}
          </div>
          {produto.imagens.length > 1 && (
            <div className="mt-3 flex gap-2">
              {produto.imagens.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => irParaFoto(i)}
                  aria-label={`Ver foto ${i + 1}`}
                  aria-current={foto === i}
                  className={`w-16 overflow-hidden rounded ring-2 ring-offset-2 ring-offset-fundo ${foto === i ? 'ring-primaria' : 'ring-transparent'}`}
                >
                  <img src={src} alt="" width={64} height={80} loading="lazy" className="aspect-[4/5] w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informações e compra */}
        <div>
          {emPromocao(produto) && (
            <span className="mb-2 inline-block rounded-sm bg-destaque px-2 py-0.5 text-xs font-semibold text-white">
              Promo −{percentualDesconto(produto)}%
            </span>
          )}
          <h1 className="text-3xl md:text-[2.6rem]">{produto.nome}</h1>
          <div className="mt-3">
            <Preco produto={produto} grande />
          </div>

          {produto.tamanhos.length > 0 && (
            <fieldset className="mt-6">
              <legend className="mb-2 font-semibold">
                Tamanho{tamanho && <span className="font-normal text-suave">: {tamanho}</span>}
              </legend>
              <div className="flex flex-wrap gap-2">
                {produto.tamanhos.map((t) => {
                  const semEstoque = statusNaUnidade(produto, unidade.id, t) === 'indisponivel'
                  return (
                    <label key={t} className={`relative grid h-11 min-w-11 place-items-center rounded-md border px-3 has-[:checked]:border-primaria has-[:checked]:bg-primaria has-[:checked]:text-sobre-primaria has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primaria ${semEstoque ? 'border-texto/15 bg-white text-suave line-through' : 'border-texto/30 bg-white'}`}>
                      <input type="radio" name="tamanho" value={t} checked={tamanho === t} onChange={() => setTamanho(t)} className="sr-only" />
                      {t}
                      {semEstoque && <span className="sr-only"> (sem estoque nesta loja)</span>}
                    </label>
                  )
                })}
              </div>
            </fieldset>
          )}

          {produto.cores.length > 0 && (
            <fieldset className="mt-5">
              <legend className="mb-2 font-semibold">
                Cor{cor && <span className="font-normal text-suave">: {cor}</span>}
              </legend>
              <div className="flex flex-wrap gap-2">
                {produto.cores.map((c) => (
                  <label key={c} className="flex h-11 items-center gap-2 rounded-md border border-texto/30 bg-white px-3 has-[:checked]:border-primaria has-[:checked]:ring-1 has-[:checked]:ring-primaria has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primaria">
                    <input type="radio" name="cor" value={c} checked={cor === c} onChange={() => setCor(c)} className="sr-only" />
                    {loja.coresProdutos[c] && <span className="h-4 w-4 rounded-full ring-1 ring-black/20" style={{ background: loja.coresProdutos[c] }} aria-hidden />}
                    {c}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <div className="mt-5 rounded-md bg-white/70 p-3">
            <SeloDisponibilidade produto={produto} unidadeId={unidade.id} tamanho={tamanho || undefined} />
            <p className="mt-1 text-xs text-suave">{unidade.nome}. Troque a loja no topo da página.</p>
          </div>

          {erro && (
            <p role="alert" className="mt-4 font-semibold text-destaque">
              {erro}
            </p>
          )}

          <div className="mt-5 grid gap-3">
            <button type="button" onClick={aoAdicionar} className="rounded-md bg-primaria py-3.5 font-semibold text-sobre-primaria hover:brightness-110">
              Adicionar à sacola
            </button>
            <a
              href={linkCompraDireta}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                // Sem tamanho/cor escolhidos, mostra o aviso em vez de abrir o WhatsApp.
                if (!validar()) {
                  e.preventDefault()
                  return
                }
                registrarPedidoWhatsApp({ origem: 'produto', unidade: unidade.id, valor: item.preco, itens: 1 })
              }}
              className="flex items-center justify-center gap-2 rounded-md border-2 border-[#1F7A45] py-3 font-semibold text-[#1F7A45] hover:bg-[#1F7A45]/5"
            >
              <IconeWhatsApp /> Comprar pelo WhatsApp
            </a>
          </div>

          {adicionado && (
            <p role="status" className="mt-4 rounded-md bg-disponivel/10 p-3 text-disponivel">
              Adicionado à sacola.{' '}
              <Link to="/sacola" className="font-semibold underline underline-offset-4">
                Ver sacola
              </Link>
            </p>
          )}

          <p className="mt-4 text-sm text-suave">Preço e estoque são confirmados pelo atendimento no WhatsApp.</p>

          {produto.descricao && (
            <div className="mt-8 border-t border-superficie pt-6">
              <h2 className="text-xl">Sobre a peça</h2>
              <p className="mt-2 max-w-[60ch] leading-relaxed">{produto.descricao}</p>
            </div>
          )}
        </div>
      </div>

      {relacionados.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-5 text-[1.75rem]">Mais em {produto.categoria}</h2>
          <GradeProdutos produtos={relacionados} />
        </section>
      )}
    </div>
  )
}
