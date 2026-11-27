// Descobre o endereço público do site na hora do build, para as prévias de
// compartilhamento (Open Graph) e o sitemap apontarem para o domínio certo.
// Ordem: URL_SITE (definida à mão) > endereço de produção da Netlify ou da Vercel
// > urlSite do loja.config.ts. Assim, ao ligar um domínio próprio na hospedagem,
// o build já usa o domínio novo sem precisar editar nada.

import { loja } from '../src/config/loja.config.ts'

export function urlDoSite(): string {
  const env = process.env
  const netlify = env.CONTEXT === 'production' ? env.URL : undefined
  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined
  return (env.URL_SITE || netlify || vercel || loja.urlSite).replace(/\/$/, '')
}
