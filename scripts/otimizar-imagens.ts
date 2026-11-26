// Converte fotos de produtos (JPG, PNG, WebP) para WebP leve, no formato 4:5
// usado pelo catálogo (800 x 1000 px).
//
// Uso:
//   1. Coloque as fotos em fotos-originais/ com o nome desejado.
//      Ex.: fotos-originais/vestido-plissado-um-ombro-1.jpg
//   2. npm run imagens
//   3. As versões otimizadas vão para public/produtos/vestido-plissado-um-ombro-1.webp
//   4. Na planilha, use /produtos/vestido-plissado-um-ombro-1.webp na coluna "imagens".
//
// Opções: npm run imagens -- pasta-de-entrada --sem-corte
//   --sem-corte  mantém a foto inteira (encaixa com fundo da loja) em vez de recortar.

import { mkdir, readdir } from 'node:fs/promises'
import { extname, join, parse } from 'node:path'
import sharp from 'sharp'
import { loja } from '../src/config/loja.config.ts'

const args = process.argv.slice(2)
const entrada = args.find((a) => !a.startsWith('--')) ?? 'fotos-originais'
const semCorte = args.includes('--sem-corte')
const saida = 'public/produtos'
const aceitas = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tif', '.tiff'])

await mkdir(saida, { recursive: true })
const arquivos = (await readdir(entrada)).filter((a) => aceitas.has(extname(a).toLowerCase()))
if (arquivos.length === 0) {
  console.log(`Nenhuma foto em ${entrada}/ (aceita: ${[...aceitas].join(', ')})`)
  process.exit(0)
}

let antes = 0
let depois = 0
for (const arquivo of arquivos) {
  const origem = join(entrada, arquivo)
  const destino = join(saida, `${parse(arquivo).name}.webp`)
  const img = sharp(origem).rotate() // respeita a orientação da foto do celular
  antes += (await img.metadata()).size ?? 0
  const info = await img
    .resize(800, 1000, semCorte ? { fit: 'contain', background: loja.cores.fundo } : { fit: 'cover', position: 'attention' })
    .webp({ quality: 80 })
    .toFile(destino)
  depois += info.size
  console.log(`✓ ${destino} (${Math.round(info.size / 1024)} KB)`)
}
console.log(`\n${arquivos.length} fotos convertidas.${antes ? ` ${Math.round(antes / 1024)} KB → ${Math.round(depois / 1024)} KB` : ''}`)
