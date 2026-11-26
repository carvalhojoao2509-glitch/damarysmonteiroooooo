import { createBrowserRouter, RouterProvider } from 'react-router'
import { Layout } from './componentes/layout/Layout.tsx'
import { ProdutosProvider } from './contextos/ProdutosContext.tsx'
import { SacolaProvider } from './contextos/SacolaContext.tsx'
import { UnidadeProvider } from './contextos/UnidadeContext.tsx'
import Catalogo from './paginas/Catalogo.tsx'
import Home from './paginas/Home.tsx'
import NossasLojas from './paginas/NossasLojas.tsx'
import Privacidade from './paginas/Privacidade.tsx'
import Produto from './paginas/Produto.tsx'
import Sacola from './paginas/Sacola.tsx'
import NaoEncontrada from './paginas/NaoEncontrada.tsx'

// Todas as páginas vão no pacote principal (são pequenas): abrem sem atraso nem "pulo" de layout.

const rotas = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/catalogo', element: <Catalogo /> },
      { path: '/catalogo/:categoria', element: <Catalogo /> },
      { path: '/produto/:id', element: <Produto /> },
      { path: '/sacola', element: <Sacola /> },
      { path: '/lojas', element: <NossasLojas /> },
      { path: '/privacidade', element: <Privacidade /> },
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
