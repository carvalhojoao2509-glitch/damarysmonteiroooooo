import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { loja } from '../config/loja.config.ts'
import { useProdutos } from '../contextos/ProdutosContext.tsx'
import { GradeProdutos } from '../componentes/produto/CardProduto.tsx'
import { Imagem } from '../componentes/ui/Imagem.tsx'
import { Seo } from '../componentes/ui/Seo.tsx'
import { IconeCoroa, IconeWhatsApp } from '../componentes/ui/Icones.tsx'
import { emPromocao, formatarPreco, precoFinal } from '../utils/preco.ts'
import type { Produto } from '../tipos/index.ts'

const botaoPrimario =
  'inline-flex items-center justify-center rounded-md bg-primaria px-6 py-3 font-semibold text-sobre-primaria hover:brightness-110'

function Secao({ titulo, link, rotuloLink, children }: { titulo: string; link?: string; rotuloLink?: string; children: ReactNode }) {
  return (
    <section className="mx-auto mt-14 max-w-6xl px-4">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="text-[1.75rem] md:text-4xl">{titulo}</h2>
        {link && (
          <Link to={link} className="shrink-0 pb-1 text-sm font-semibold text-primaria underline underline-offset-4">
            {rotuloLink ?? 'Ver todos'}
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

export default function Home() {
  const { produtos, carregando, buscarPorId } = useProdutos()
  const porData = [...produtos].sort((a, b) => b.dataCadastro.localeCompare(a.dataCadastro))
  const novidades = porData.filter((p) => p.tags.includes('novidade')).slice(0, 8)
  const promocoes = produtos.filter(emPromocao).slice(0, 4)
  const vitrine = (
    loja.campanha.produtosVitrine.map(buscarPorId).filter(Boolean) as Produto[]
  ).concat(porData).slice(0, 3)
  const unicos = vitrine.filter((p, i) => vitrine.findIndex((q) => q.id === p.id) === i)

  return (
    <>
      <Seo />

      {/* Campanha: título à esquerda, "vitrine" com três vidros à direita */}
      <section className="bg-superficie/60">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-8 md:grid-cols-[1fr_1.25fr] md:py-14">
          <div>
            <h1 className="text-[2.6rem] leading-[1.05] text-primaria md:text-6xl">{loja.campanha.titulo}</h1>
            <p className="mt-4 max-w-[34ch] text-lg text-suave">{loja.campanha.texto}</p>
            <Link to={loja.campanha.link} className={`${botaoPrimario} mt-6`}>
              {loja.campanha.botao}
            </Link>
          </div>
          <div className="vitrine grid-cols-3 rounded-sm" aria-label="Vitrine da coleção">
            {carregando
              ? [0, 1, 2].map((i) => <div key={i} className="aspect-[4/5] animate-pulse bg-superficie" />)
              : unicos.map((p, i) => (
                  <Link key={p.id} to={`/produto/${p.id}`} className="group relative block">
                    <Imagem src={p.imagens[0] ?? ''} alt="" prioridade={i === 0} />
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-2 pb-2 pt-8 text-[0.7rem] leading-tight text-white sm:text-sm">
                      {p.nome}
                    </span>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* Destaques em círculos, como os destaques fixos do Instagram */}
      <nav aria-label="Coleções" className="mx-auto mt-8 max-w-6xl">
        <ul className="sem-barra flex gap-4 overflow-x-auto px-4 pb-2 md:justify-center md:gap-7">
          {loja.destaques.map((d) => (
            <li key={d.nome} className="shrink-0">
              <Link to={d.link} className="flex w-[4.75rem] flex-col items-center gap-2 text-center md:w-24">
                <span className="rounded-full bg-[conic-gradient(var(--cor-primaria),var(--cor-secundaria),var(--cor-primaria))] p-[2.5px]">
                  <span className="block rounded-full bg-fundo p-[3px]">
                    <img
                      src={d.imagem}
                      alt=""
                      width={80}
                      height={80}
                      loading="lazy"
                      className="h-[4.1rem] w-[4.1rem] rounded-full object-cover md:h-20 md:w-20"
                    />
                  </span>
                </span>
                <span className="text-xs leading-tight md:text-sm">{d.nome}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <Secao titulo="Novidades" link="/catalogo?tag=novidade">
        {carregando ? <p className="text-suave">Carregando peças…</p> : <GradeProdutos produtos={novidades} />}
      </Secao>

      {loja.plusSize && (
        <section className="mt-16 bg-primaria text-sobre-primaria">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl md:text-4xl">{loja.plusSize.titulo}</h2>
              <p className="mt-2 max-w-[48ch] opacity-90">{loja.plusSize.texto}</p>
            </div>
            <Link
              to={loja.plusSize.link}
              className="inline-flex shrink-0 items-center justify-center self-start rounded-md bg-fundo px-6 py-3 font-semibold text-primaria md:self-auto"
            >
              Ver peças plus size
            </Link>
          </div>
        </section>
      )}

      {loja.looks.length > 0 && !carregando && (
        <Secao titulo="Looks prontos">
          <ul className="sem-barra -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:px-0">
            {loja.looks.map((look) => {
              const pecas = look.produtos.map(buscarPorId).filter(Boolean) as Produto[]
              if (pecas.length === 0) return null
              const total = pecas.reduce((s, p) => s + precoFinal(p), 0)
              return (
                <li key={look.id} className="w-[78vw] shrink-0 snap-start rounded-md bg-white p-3 md:w-auto">
                  <div className="grid grid-cols-2 gap-1.5">
                    {pecas.slice(0, 2).map((p) => (
                      <Imagem key={p.id} src={p.imagens[0] ?? ''} alt={p.nome} className="rounded-sm" />
                    ))}
                  </div>
                  <h3 className="mt-3 text-xl">{look.nome}</h3>
                  <ul className="mt-2 space-y-1 text-sm">
                    {pecas.map((p) => (
                      <li key={p.id}>
                        <Link to={`/produto/${p.id}`} className="underline underline-offset-4">
                          {p.nome}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm text-suave">Look completo: {formatarPreco(total)}</p>
                </li>
              )
            })}
          </ul>
        </Secao>
      )}

      {promocoes.length > 0 && (
        <Secao titulo="Promo" link="/catalogo?promo=1" rotuloLink="Ver todas">
          <GradeProdutos produtos={promocoes} />
        </Secao>
      )}

      {loja.grupoWhatsApp && (
        <section className="mx-auto mt-16 max-w-6xl px-4">
          <div className="flex flex-col gap-4 rounded-lg border border-secundaria/50 bg-white/70 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-[1.75rem]">{loja.grupoWhatsApp.rotulo}</h2>
              <p className="mt-1 text-suave">{loja.grupoWhatsApp.texto}</p>
            </div>
            <a
              href={loja.grupoWhatsApp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-md bg-[#1F7A45] px-6 py-3 font-semibold text-white hover:bg-[#186338] md:self-auto"
            >
              <IconeWhatsApp width={20} height={20} /> Entrar no {loja.grupoWhatsApp.rotulo}
            </a>
          </div>
        </section>
      )}

      {loja.sobre && (
        <section className="mx-auto mt-16 grid max-w-6xl gap-8 px-4 md:grid-cols-[0.8fr_1fr] md:items-center">
          {loja.sobre.foto ? (
            <img src={loja.sobre.foto} alt={`Foto de ${loja.nome}`} loading="lazy" className="aspect-[4/5] w-full rounded-md object-cover" />
          ) : (
            <div className="letreiro grid aspect-[4/5] max-h-[26rem] w-full place-items-center rounded-md p-8 text-center">
              <div>
                <IconeCoroa className="mx-auto mb-2 text-secundaria" />
                <p className="font-titulo text-4xl leading-tight">{loja.nome}</p>
              </div>
            </div>
          )}
          <div>
            <h2 className="text-[1.75rem] md:text-4xl">{loja.sobre.titulo}</h2>
            {loja.sobre.texto.map((t) => (
              <p key={t} className="mt-4 max-w-[60ch] text-lg leading-relaxed">
                {t}
              </p>
            ))}
            <Link to="/lojas" className="mt-6 inline-block font-semibold text-primaria underline underline-offset-4">
              Conheça nossas {loja.unidades.length} lojas
            </Link>
          </div>
        </section>
      )}
    </>
  )
}
