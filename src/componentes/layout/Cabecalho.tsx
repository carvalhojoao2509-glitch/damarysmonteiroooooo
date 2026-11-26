// Topo do site, desenhado como o letreiro da fachada:
// faixa vinho, coroa fina e o nome da loja centralizado em letras claras.

import { useState } from 'react'
import { Link, NavLink } from 'react-router'
import { loja } from '../../config/loja.config.ts'
import { useSacola } from '../../contextos/SacolaContext.tsx'
import { Dialogo } from '../ui/Dialogo.tsx'
import { IconeCoroa, IconeInstagram, IconeMenu, IconeSacola } from '../ui/Icones.tsx'
import { SeletorUnidade } from './SeletorUnidade.tsx'

export const menu = [
  { rotulo: 'Novidades', para: '/catalogo?tag=novidade' },
  { rotulo: 'Catálogo', para: '/catalogo' },
  { rotulo: 'Plus Size', para: '/catalogo?tag=plus+size' },
  { rotulo: 'Promo', para: '/catalogo?promo=1' },
  { rotulo: 'Nossas lojas', para: '/lojas' },
]

export function Cabecalho() {
  const { quantidadeTotal } = useSacola()
  const [menuAberto, setMenuAberto] = useState(false)
  const instagram = loja.redesSociais.find((r) => r.nome === 'Instagram')

  return (
    <header>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        Pular para o conteúdo
      </a>
      <div className="letreiro">
        <div className="mx-auto grid max-w-6xl grid-cols-[3rem_1fr_3rem] items-center px-2 py-3 md:grid-cols-[12rem_1fr_12rem] md:px-4 md:py-5">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setMenuAberto(true)}
              className="rounded p-2 md:hidden"
              aria-label="Abrir menu"
            >
              <IconeMenu />
            </button>
            {instagram && (
              <a
                href={instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden items-center gap-1.5 text-sm opacity-90 hover:opacity-100 md:flex"
              >
                <IconeInstagram width={18} height={18} />
                {instagram.rotulo}
              </a>
            )}
          </div>

          <Link to="/" className="flex flex-col items-center text-center" aria-label={`${loja.nome}, página inicial`}>
            {loja.logo ? (
              <img src={loja.logo} alt="" className="h-12 w-auto md:h-16" />
            ) : (
              <>
                <IconeCoroa className="mb-0.5 h-3 w-10 text-secundaria md:h-4 md:w-12" />
                <span className="font-titulo text-[1.55rem] leading-none tracking-[0.04em] md:text-[2.6rem]">
                  {loja.nome}
                </span>
              </>
            )}
          </Link>

          <div className="flex justify-end">
            <Link
              to="/sacola"
              className="relative rounded p-2"
              aria-label={`Sacola, ${quantidadeTotal} ${quantidadeTotal === 1 ? 'item' : 'itens'}`}
            >
              <IconeSacola width={26} height={26} />
              {quantidadeTotal > 0 && (
                <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-fundo px-1 text-xs font-bold text-primaria">
                  {quantidadeTotal}
                </span>
              )}
            </Link>
          </div>
        </div>

        <nav aria-label="Principal" className="hidden border-t border-white/15 md:block">
          <ul className="mx-auto flex max-w-6xl justify-center gap-8 px-4 py-2.5 text-[0.95rem]">
            {menu.map((m) => (
              <li key={m.para}>
                <NavLink to={m.para} className="opacity-90 underline-offset-[6px] hover:underline hover:opacity-100">
                  {m.rotulo}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <SeletorUnidade />

      <Dialogo aberto={menuAberto} aoFechar={() => setMenuAberto(false)} titulo="Menu" estilo="lateral">
        <nav aria-label="Menu do celular">
          <ul className="divide-y divide-superficie">
            {[...menu, { rotulo: 'Sacola', para: '/sacola' }].map((m) => (
              <li key={m.para}>
                <Link to={m.para} onClick={() => setMenuAberto(false)} className="block py-3.5 text-lg">
                  {m.rotulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {instagram && (
          <a
            href={instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-center gap-2 text-primaria"
          >
            <IconeInstagram /> {instagram.rotulo}
          </a>
        )}
      </Dialogo>
    </header>
  )
}
