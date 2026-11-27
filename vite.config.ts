import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { loja } from './src/config/loja.config.ts'
import { urlDoSite } from './scripts/url-do-site.ts'

/** Escapa texto para ser colocado com segurança dentro do HTML. */
const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * Plugin que lê o loja.config.ts e escreve no index.html:
 * - as cores e fontes como variáveis CSS (sem "piscar" ao carregar)
 * - título, descrição, favicon e tags de compartilhamento (Open Graph)
 * Assim, trocar de cliente não exige editar o index.html.
 */
function configDaLoja(): Plugin {
  return {
    name: 'config-da-loja',
    transformIndexHtml(html) {
      const c = loja.cores
      const variaveis = `:root{--cor-primaria:${c.primaria};--cor-texto-sobre-primaria:${c.textoSobrePrimaria};--cor-secundaria:${c.secundaria};--cor-fundo:${c.fundo};--cor-superficie:${c.superficie};--cor-texto:${c.texto};--cor-texto-suave:${c.textoSuave};--cor-destaque:${c.destaque};--cor-disponivel:${c.disponivel};--fonte-titulo:${loja.fontes.titulo};--fonte-texto:${loja.fontes.texto};}`
      const titulo = `${loja.nome} | ${loja.slogan}`
      const url = urlDoSite()
      const imagem = url + loja.imagemCompartilhamento
      return html
        .replace('<!--TITULO-->', esc(titulo))
        .replace(
          '<!--HEAD-->',
          [
            `<meta name="description" content="${esc(loja.descricao)}" />`,
            `<meta name="theme-color" content="${c.primaria}" />`,
            `<link rel="icon" href="${loja.favicon}" />`,
            `<link rel="canonical" href="${url}/" />`,
            `<meta property="og:type" content="website" />`,
            `<meta property="og:locale" content="pt_BR" />`,
            `<meta property="og:site_name" content="${esc(loja.nome)}" />`,
            `<meta property="og:title" content="${esc(titulo)}" />`,
            `<meta property="og:description" content="${esc(loja.descricao)}" />`,
            `<meta property="og:url" content="${url}/" />`,
            `<meta property="og:image" content="${imagem}" />`,
            `<meta property="og:image:width" content="1200" />`,
            `<meta property="og:image:height" content="630" />`,
            `<meta name="twitter:card" content="summary_large_image" />`,
            `<style>${variaveis}</style>`,
            ...(loja.demonstracao ? ['<meta name="robots" content="noindex, nofollow" />'] : []),
          ].join('\n    '),
        )
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), configDaLoja()],
})
