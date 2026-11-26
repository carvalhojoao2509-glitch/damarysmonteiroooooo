import { useState } from 'react'
import { loja } from '../config/loja.config.ts'
import { useUnidade } from '../contextos/UnidadeContext.tsx'
import { IconeMapa, IconeRelogio, IconeWhatsApp } from '../componentes/ui/Icones.tsx'
import { Seo } from '../componentes/ui/Seo.tsx'
import { linkWhatsApp, mensagemDuvida } from '../servicos/whatsapp.ts'
import type { Unidade } from '../tipos/index.ts'

/** O mapa só carrega quando a pessoa pede: deixa a página leve e não chama o Google sem necessidade. */
function Mapa({ u }: { u: Unidade }) {
  const [ver, setVer] = useState(false)
  const busca = encodeURIComponent(`${u.endereco}, ${u.bairroCidade}`)
  if (!ver) {
    return (
      <button type="button" onClick={() => setVer(true)} className="grid aspect-[16/10] w-full place-items-center rounded-md bg-superficie text-sm font-semibold text-primaria">
        <span className="flex items-center gap-2"><IconeMapa /> Mostrar mapa</span>
      </button>
    )
  }
  return (
    <iframe
      title={`Mapa da ${u.nome}`}
      src={`https://www.google.com/maps?q=${busca}&output=embed`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className="aspect-[16/10] w-full rounded-md border-0"
    />
  )
}

export default function NossasLojas() {
  const { unidade, escolher } = useUnidade()
  return (
    <div className="mx-auto max-w-6xl px-4 pt-6">
      <Seo titulo="Nossas lojas" descricao={`Endereços e horários das lojas ${loja.nome}.`} />
      <h1 className="text-4xl md:text-5xl">Nossas lojas</h1>
      <p className="mt-2 text-suave">Escolha a loja que vai atender você: o pedido vai para o WhatsApp dela.</p>

      <ul className="mt-8 grid gap-6 md:grid-cols-3">
        {loja.unidades.map((u) => (
          <li key={u.id} className="flex flex-col rounded-lg bg-white p-4">
            <Mapa u={u} />
            <h2 className="mt-4 text-2xl">{u.nome}</h2>
            <p className="mt-1">{u.endereco}</p>
            <p className="text-suave">{u.bairroCidade}</p>
            <div className="mt-3 flex gap-2 text-sm">
              <IconeRelogio width={18} height={18} className="mt-0.5 shrink-0 text-primaria" />
              <ul>{u.horarios.map((h) => <li key={h}>{h}</li>)}</ul>
            </div>
            <div className="mt-auto grid gap-2 pt-5">
              <a href={linkWhatsApp(u.whatsapp, mensagemDuvida())} target="_blank" rel="noopener noreferrer" className="pressionavel flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#1F7A45] py-2.5 font-semibold text-white">
                <IconeWhatsApp width={20} height={20} /> WhatsApp
              </a>
              <a href={u.linkMapa} target="_blank" rel="noopener noreferrer" className="pressionavel flex min-h-11 items-center justify-center rounded-md border border-texto/25 py-2.5 font-semibold">
                Abrir no Google Maps
              </a>
              {u.id === unidade.id ? (
                <p className="flex min-h-11 items-center justify-center text-sm text-disponivel">Esta é a loja escolhida</p>
              ) : (
                <button type="button" onClick={() => escolher(u.id)} className="min-h-11 text-sm font-semibold text-primaria underline underline-offset-4">
                  Comprar nesta loja
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
