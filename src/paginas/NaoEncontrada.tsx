import { Link } from 'react-router'
import { Seo } from '../componentes/ui/Seo.tsx'

export default function NaoEncontrada() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <Seo titulo="Página não encontrada" />
      <h1 className="text-4xl">Esta página não existe mais</h1>
      <p className="mt-3 text-suave">A peça pode ter saído do catálogo. Veja o que está disponível agora.</p>
      <Link to="/catalogo" className="mt-6 inline-flex rounded-md bg-primaria px-6 py-3 font-semibold text-sobre-primaria">
        Ver o catálogo
      </Link>
    </div>
  )
}
