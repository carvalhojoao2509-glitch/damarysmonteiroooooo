import { Link } from 'react-router'
import { loja } from '../../config/loja.config.ts'
import { IconeCoroa } from '../ui/Icones.tsx'
import { menu } from './Cabecalho.tsx'

export function Rodape() {
  return (
    <footer className="letreiro mt-16 pb-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <IconeCoroa className="mb-1 text-secundaria" />
          <p className="font-titulo text-2xl">{loja.nome}</p>
          <p className="mt-1 opacity-80">{loja.slogan}</p>
          {loja.mensagemRodape && <p className="mt-5 font-titulo text-lg opacity-90">{loja.mensagemRodape}</p>}
        </div>

        <nav aria-label="Rodapé">
          <h2 className="mb-3 text-lg">Navegue</h2>
          <ul className="space-y-2 opacity-90">
            {menu.map((m) => (
              <li key={m.para}>
                <Link to={m.para} className="hover:underline">
                  {m.rotulo}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/privacidade" className="hover:underline">
                Privacidade
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="mb-3 text-lg">Lojas</h2>
          <ul className="space-y-2 opacity-90">
            {loja.unidades.map((u) => (
              <li key={u.id}>{u.nome}</li>
            ))}
          </ul>
          <ul className="mt-4 space-y-2">
            {loja.redesSociais.map((r) => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                  {r.nome}: {r.rotulo}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 text-lg">Pagamento</h2>
          <ul className="space-y-2 opacity-90">
            {loja.pagamentos.map((p) => (
              <li key={p.id}>{p.nome}</li>
            ))}
          </ul>
          {loja.parcelamento && (
            <p className="mt-2 text-sm opacity-80">
              Crédito em até {loja.parcelamento.vezes}x{loja.parcelamento.semJuros ? ' sem juros' : ''}
            </p>
          )}
        </div>
      </div>
      <p className="mx-auto max-w-6xl px-4 text-sm opacity-70">
        Preços e estoque sujeitos a confirmação pelo atendimento. Este site não guarda seus dados pessoais.
      </p>
    </footer>
  )
}
