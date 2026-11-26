// Métricas opcionais: Google Analytics 4 e Meta Pixel.
// Só são carregadas se os IDs estiverem preenchidos em loja.config.ts > metricas.
// O evento principal é "pedido_whatsapp", disparado ao enviar um pedido.
// Com ele dá para mostrar ao lojista quantos pedidos o catálogo gerou.

import { loja } from '../config/loja.config.ts'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    fbq?: ((...args: unknown[]) => void) & { queue?: unknown[]; callMethod?: (...a: unknown[]) => void }
    _fbq?: unknown
  }
}

let iniciado = false

function carregarScript(src: string) {
  const s = document.createElement('script')
  s.async = true
  s.src = src
  document.head.appendChild(s)
}

/** Chamado uma vez quando o site abre. */
export function iniciarMetricas(): void {
  if (iniciado || typeof window === 'undefined') return
  iniciado = true
  const { googleAnalyticsId, metaPixelId } = loja.metricas

  if (googleAnalyticsId) {
    window.dataLayer = window.dataLayer || []
    window.gtag = function gtag() {
      window.dataLayer!.push(arguments)
    }
    window.gtag('js', new Date())
    // As visualizações de página são enviadas por registrarPagina(), a cada troca de rota.
    window.gtag('config', googleAnalyticsId, { send_page_view: false })
    carregarScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleAnalyticsId)}`)
  }

  if (metaPixelId) {
    // Versão enxuta do código oficial do Meta Pixel.
    const fbq = function (...args: unknown[]) {
      if (fbq.callMethod) fbq.callMethod(...args)
      else fbq.queue!.push(args)
    } as NonNullable<Window['fbq']> & { push?: unknown; loaded?: boolean; version?: string }
    fbq.queue = []
    fbq.push = fbq
    fbq.loaded = true
    fbq.version = '2.0'
    window.fbq = fbq
    window._fbq = fbq
    carregarScript('https://connect.facebook.net/en_US/fbevents.js')
    fbq('init', metaPixelId)
  }
}

/** Registra a troca de página (o site é uma SPA, então avisamos a cada rota). */
export function registrarPagina(caminho: string): void {
  window.gtag?.('event', 'page_view', { page_path: caminho, page_location: window.location.href })
  window.fbq?.('track', 'PageView')
}

/** Evento de pedido enviado ao WhatsApp. */
export function registrarPedidoWhatsApp(dados: {
  origem: 'sacola' | 'produto' | 'duvida'
  unidade: string
  valor: number
  itens: number
}): void {
  window.gtag?.('event', 'pedido_whatsapp', {
    origem: dados.origem,
    unidade: dados.unidade,
    value: dados.valor,
    currency: 'BRL',
    itens: dados.itens,
  })
  window.fbq?.('track', 'Contact', { value: dados.valor, currency: 'BRL' })
  window.fbq?.('trackCustom', 'PedidoWhatsApp', dados)
}
