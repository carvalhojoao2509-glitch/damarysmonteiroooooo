// Roda depois do `vite build` (já incluído no `npm run build`). Gera:
//  1. Uma página HTML por produto, categoria e página fixa, com título, descrição
//     e imagem próprios. WhatsApp, Instagram e Facebook não executam JavaScript:
//     sem isso, todo link compartilhado mostraria a mesma prévia.
//  2. O sitemap.xml para o Google.
//
// Se a fonte for a planilha, ela é baixada aqui; se falhar, usa o produtos.json.
// Produtos novos cadastrados só na planilha aparecem no site na hora, mas a
// prévia própria do link deles só existe depois do próximo deploy.

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import sharp from 'sharp'
import { loja } from '../src/config/loja.config.ts'
import dados from '../src/data/produtos.json' with { type: 'json' }
import { lerCsvProdutos, lerJsonProdutos, type ProdutoBruto } from '../src/servicos/csv.ts'
import type { Produto } from '../src/tipos/index.ts'
import { slug } from '../src/utils/texto.ts'

const DIST = 'dist'
const url = loja.urlSite.replace(/\/$/, '')

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

async function obterProdutos(): Promise<Produto[]> {
  const { fonte, urlPlanilha } = loja.produtos
  if (fonte === 'planilha' && urlPlanilha) {
    try {
      const r = await fetch(urlPlanilha)
      if (!r.ok) throw new Error(`status ${r.status}`)
      const lista = lerCsvProdutos(await r.text())
      if (lista.length) return lista
      throw new Error('planilha vazia')
    } catch (e) {
      console.warn(`! Planilha indisponível no build (${String(e)}). Usando src/data/produtos.json.`)
    }
  }
  return lerJsonProdutos(dados as ProdutoBruto[])
}

/** Troca as tags de SEO do index.html pelas da página. */
function pagina(modelo: string, caminho: string, titulo: string, descricao: string, imagem?: string): string {
  const t = esc(`${titulo} | ${loja.nome}`)
  const d = esc(descricao.slice(0, 200))
  const img = imagem ? (imagem.startsWith('http') ? imagem : url + imagem) : url + loja.imagemCompartilhamento
  const u = url + caminho
  return modelo
    .replace(/<title>.*?<\/title>/s, `<title>${t}</title>`)
    .replace(/(<meta name="description" content=")[^"]*/, `$1${d}`)
    .replace(/(<meta property="og:title" content=")[^"]*/, `$1${t}`)
    .replace(/(<meta property="og:description" content=")[^"]*/, `$1${d}`)
    .replace(/(<meta property="og:url" content=")[^"]*/, `$1${u}`)
    .replace(/(<meta property="og:image" content=")[^"]*/, `$1${img}`)
    .replace(/(<link rel="canonical" href=")[^"]*/, `$1${u}`)
}

/** Grava /x.html (Vercel com cleanUrls) e /x/index.html (Netlify e outros servidores estáticos). */
async function gravar(caminho: string, html: string) {
  for (const arquivo of [`${DIST}${caminho}.html`, `${DIST}${caminho}/index.html`]) {
    await mkdir(dirname(arquivo), { recursive: true })
    await writeFile(arquivo, html)
  }
}

const modelo = await readFile(`${DIST}/index.html`, 'utf8')
const produtos = (await obterProdutos()).filter((p) => p.ativo)
const categorias = [...new Set(produtos.map((p) => p.categoria))]
const hoje = new Date().toISOString().slice(0, 10)
const urls: string[] = ['/']

const fixas: [string, string, string][] = [
  ['/catalogo', 'Catálogo', `Todas as peças da ${loja.nome}. ${loja.slogan}.`],
  ['/lojas', 'Nossas lojas', `Endereços, horários e WhatsApp das lojas ${loja.nome}.`],
  ['/privacidade', 'Privacidade', 'Como este catálogo trata os seus dados.'],
]
for (const [caminho, titulo, descricao] of fixas) {
  await gravar(caminho, pagina(modelo, caminho, titulo, descricao))
  urls.push(caminho)
}

for (const c of categorias) {
  const caminho = `/catalogo/${slug(c)}`
  await gravar(caminho, pagina(modelo, caminho, c, `${c} da ${loja.nome}. ${loja.slogan}.`))
  urls.push(caminho)
}

/**
 * Gera /og/<id>.jpg (1200x630) a partir da primeira foto, porque o WhatsApp
 * nem sempre mostra prévias em WebP. Retorna o caminho, ou undefined se falhar.
 */
async function imagemPrevia(p: Produto): Promise<string | undefined> {
  const origem = p.imagens[0]
  if (!origem) return undefined
  try {
    const bytes = origem.startsWith('http')
      ? Buffer.from(await (await fetch(origem)).arrayBuffer())
      : await readFile(`${DIST}${origem}`)
    await mkdir(`${DIST}/og`, { recursive: true })
    await sharp(bytes)
      .resize(1200, 630, { fit: 'contain', background: loja.cores.fundo })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(`${DIST}/og/${p.id}.jpg`)
    return `/og/${p.id}.jpg`
  } catch (e) {
    console.warn(`! Sem prévia para ${p.id}: ${String(e)}`)
    return undefined
  }
}

for (const p of produtos) {
  const caminho = `/produto/${p.id}`
  const preco = (p.precoPromocional && p.precoPromocional < p.preco ? p.precoPromocional : p.preco)
    .toFixed(2)
    .replace('.', ',')
  await gravar(caminho, pagina(modelo, caminho, p.nome, `R$ ${preco}. ${p.descricao}`, await imagemPrevia(p)))
  urls.push(caminho)
}

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${url}${u === '/' ? '/' : u}</loc><lastmod>${hoje}</lastmod></url>`).join('\n')}
</urlset>
`
await writeFile(`${DIST}/sitemap.xml`, sitemap)
await writeFile(
  `${DIST}/robots.txt`,
  loja.demonstracao
    ? 'User-agent: *\nDisallow: /\n' // demonstração: fora dos buscadores
    : `User-agent: *\nAllow: /\n\nSitemap: ${url}/sitemap.xml\n`,
)

console.log(`✓ pós-build: ${urls.length} páginas com prévia própria + sitemap.xml (${url})`)
