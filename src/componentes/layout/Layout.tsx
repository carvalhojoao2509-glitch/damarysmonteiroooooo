import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { iniciarMetricas, registrarPagina } from '../../servicos/metricas.ts'
import { BotaoWhatsAppFlutuante } from './BotaoWhatsAppFlutuante.tsx'
import { Cabecalho } from './Cabecalho.tsx'
import { Rodape } from './Rodape.tsx'
import { SeletorUnidade } from './SeletorUnidade.tsx'

export function Layout() {
  const { pathname, search } = useLocation()

  useEffect(() => iniciarMetricas(), [])

  // Volta ao topo ao trocar de página (não ao mudar só os filtros) e registra a visita.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  useEffect(() => {
    registrarPagina(pathname + search)
  }, [pathname, search])

  return (
    <div className="flex min-h-dvh flex-col">
      <Cabecalho />
      <SeletorUnidade />
      <main id="conteudo" className="flex-1">
        <Outlet />
      </main>
      <Rodape />
      <BotaoWhatsAppFlutuante />
    </div>
  )
}
