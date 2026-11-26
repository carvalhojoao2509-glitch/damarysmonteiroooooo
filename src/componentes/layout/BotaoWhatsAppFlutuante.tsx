// Botão fixo no canto da tela para tirar dúvidas com a loja escolhida.

import { useLocation } from 'react-router'
import { useUnidade } from '../../contextos/UnidadeContext.tsx'
import { registrarPedidoWhatsApp } from '../../servicos/metricas.ts'
import { linkWhatsApp, mensagemDuvida } from '../../servicos/whatsapp.ts'
import { IconeWhatsApp } from '../ui/Icones.tsx'

export function BotaoWhatsAppFlutuante() {
  const { unidade } = useUnidade()
  const { pathname } = useLocation()
  // Na sacola o botão principal já é o WhatsApp; o flutuante só atrapalharia.
  if (pathname === '/sacola') return null

  return (
    <a
      href={linkWhatsApp(unidade.whatsapp, mensagemDuvida())}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => registrarPedidoWhatsApp({ origem: 'duvida', unidade: unidade.id, valor: 0, itens: 0 })}
      className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-[#1F7A45] py-3 pl-3 pr-4 text-white shadow-lg ring-1 ring-black/10 hover:bg-[#186338]"
    >
      <IconeWhatsApp width={26} height={26} />
      <span className="text-sm font-semibold">Dúvidas?</span>
      <span className="sr-only"> Falar no WhatsApp da {unidade.nome}</span>
    </a>
  )
}
