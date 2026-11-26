import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Layout } from './componentes/layout/Layout.tsx'
import { ProdutosProvider } from './contextos/ProdutosContext.tsx'
import { SacolaProvider } from './contextos/SacolaContext.tsx'
import { UnidadeProvider } from './contextos/UnidadeContext.tsx'
import Catalogo from './paginas/Catalogo.tsx'
import Home from './paginas/Home.tsx'
import Produto from './paginas/Produto.tsx'
import NaoEncontrada from './paginas/NaoEncontrada.tsx'

// Home, catálogo e produto vão no pacote principal (abrem sem atraso nem "pulo" de layout).
// As demais páginas são carregadas só quando abertas.
const Sacola = lazy(() => import('./paginas/Sacola.tsx'))
const NossasLojas = lazy(() => import('./paginas/NossasLojas.tsx'))
const Privacidade = lazy(() => import('./paginas/Privacidade.tsx'))

const carregando = <p className="mx-auto min-h-dvh max-w-6xl px-4 py-16 text-suave">Carregando…</p>
const s = (el: ReactNode) => <Suspense fallback={carregando}>{el}</Suspense>

const rotas = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/catalogo', element: <Catalogo /> },
      { path: '/catalogo/:categoria', element: <Catalogo /> },
      { path: '/produto/:id', element: <Produto /> },
      { path: '/sacola', element: s(<Sacola />) },
      { path: '/lojas', element: s(<NossasLojas />) },
      { path: '/privacidade', element: s(<Privacidade />) },
      { path: '*', element: <NaoEncontrada /> },
    ],
  },
])

export default function App() {
  return (
    <UnidadeProvider>
      <ProdutosProvider>
        <SacolaProvider>
          <RouterProvider router={rotas} />
        </SacolaProvider>
      </ProdutosProvider>
    </UnidadeProvider>
  )
}
