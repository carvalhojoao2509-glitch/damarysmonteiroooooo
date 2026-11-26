// Gera as imagens ILUSTRATIVAS dos produtos de exemplo (public/produtos/*.webp).
// Servem só para a demonstração: em um cliente real, use as fotos das peças
// (peças que já têm foto real NÃO estão nesta lista, para não serem sobrescritas)
// (veja scripts/otimizar-imagens.ts). Uso: npm run imagens:exemplo

import { mkdir } from 'node:fs/promises'
import sharp from 'sharp'

type Forma =
  | 'vestido-longo' | 'vestido-midi' | 'vestido-curto' | 'conjunto' | 'conjunto-short' | 'conjunto-calca' | 'macacao'
  | 'blusa' | 'regata' | 'cropped' | 'bata' | 'camisa' | 'kimono' | 'saia-longa' | 'saia-midi' | 'saia-lapis'
  | 'calca' | 'short' | 'bolsa' | 'colar'
type Estampa = 'liso' | 'floral' | 'listras' | 'folhas' | 'geometrica' | 'canelado' | 'plissado' | 'acetinado'
type Detalhe = 'perolas' | 'laco' | 'cinto' | 'amarracao'

interface Peca { id: string; forma: Forma; cor: string; estampa: Estampa; fundo: string; detalhe?: Detalhe }

const pecas: Peca[] = [
  { id: 'cropped-trico-canelado', forma: 'cropped', cor: '#B5563A', estampa: 'canelado', fundo: '#EFE4DA' },
  { id: 'calca-alfaiataria-oliva', forma: 'calca', cor: '#6B6B3A', estampa: 'liso', fundo: '#ECE6DA', detalhe: 'cinto' },
  { id: 'camisa-gola-perolas', forma: 'camisa', cor: '#FBFAF7', estampa: 'liso', fundo: '#E8DCCB', detalhe: 'perolas' },
  { id: 'camisa-amarracao', forma: 'camisa', cor: '#FBFAF7', estampa: 'liso', fundo: '#E3E6EA', detalhe: 'amarracao' },
  { id: 'conjunto-camisa-short-menta', forma: 'conjunto-short', cor: '#A9D8C3', estampa: 'liso', fundo: '#F1ECE5' },
  { id: 'blusa-viscose', forma: 'blusa', cor: '#E3A5B4', estampa: 'liso', fundo: '#F2EAE6' },
  { id: 'blusa-laco', forma: 'blusa', cor: '#5A1E24', estampa: 'acetinado', fundo: '#EDE6E0', detalhe: 'laco' },
  { id: 'vestido-midi-envelope', forma: 'vestido-midi', cor: '#1F2C4D', estampa: 'liso', fundo: '#E6E4E2', detalhe: 'amarracao' },
  { id: 'saia-midi-plissada', forma: 'saia-midi', cor: '#DCC4AE', estampa: 'plissado', fundo: '#EDE7E2' },
  { id: 'saia-lapis', forma: 'saia-lapis', cor: '#26211F', estampa: 'liso', fundo: '#EAE3DC' },
  { id: 'calca-pantalona-linho', forma: 'calca', cor: '#D9C3A5', estampa: 'liso', fundo: '#EBE5DE' },
  { id: 'calca-jeans-reta', forma: 'calca', cor: '#4A6A93', estampa: 'liso', fundo: '#E7E9EC' },
  { id: 'macacao-alfaiataria', forma: 'macacao', cor: '#26211F', estampa: 'liso', fundo: '#EDE6DF', detalhe: 'cinto' },
  { id: 'vestido-plus-floral', forma: 'vestido-midi', cor: '#5A1E24', estampa: 'floral', fundo: '#F1E9E2' },
  { id: 'blusa-cetim-plus', forma: 'bata', cor: '#F1E6D6', estampa: 'acetinado', fundo: '#E5DCD3' },
  { id: 'kimono-alongado', forma: 'kimono', cor: '#B8925A', estampa: 'folhas', fundo: '#EFE8E1' },
]

// Silhuetas desenhadas numa área de 800 x 1000.
const formas: Record<Forma, string> = {
  'vestido-longo': 'M335 205 L465 205 L500 430 L650 905 Q400 950 150 905 L300 430 Z M300 250 L230 300 L265 340 L320 300 Z M500 250 L570 300 L535 340 L480 300 Z',
  'vestido-midi': 'M340 205 L370 205 L385 260 Q400 275 415 260 L430 205 L460 205 L500 430 L610 790 Q400 830 190 790 L300 430 Z',
  'vestido-curto': 'M340 205 L370 205 L385 260 Q400 275 415 260 L430 205 L460 205 L505 420 L585 650 Q400 690 215 650 L295 420 Z',
  conjunto: 'M310 200 L360 200 L380 290 L400 300 L420 290 L440 200 L490 200 L520 330 L520 520 L280 520 L280 330 Z M300 470 L500 470 L610 900 Q400 935 190 900 Z',
  macacao: 'M340 205 L370 205 L385 260 Q400 275 415 260 L430 205 L460 205 L505 440 L570 900 L430 900 L400 520 L370 900 L230 900 L295 440 Z',
  blusa: 'M290 230 L510 230 L590 280 L625 380 L555 405 L520 335 L525 640 L275 640 L280 335 L245 405 L175 380 L210 280 Z',
  cropped: 'M330 200 L360 200 L372 262 Q400 296 428 262 L440 200 L470 200 L515 330 L520 470 L280 470 L285 330 Z',
  'conjunto-short': 'M300 200 L360 188 L400 235 L440 188 L500 200 L575 255 L610 360 L548 380 L520 310 L520 470 L280 470 L280 310 L252 380 L190 360 L225 255 Z M285 495 L515 495 L548 740 L420 740 L400 625 L380 740 L252 740 Z',
  'conjunto-calca': 'M300 200 L500 200 L575 250 L630 560 L575 572 L520 320 L520 450 L280 450 L280 320 L225 572 L170 560 L225 250 Z M290 470 L510 470 L555 900 L430 900 L400 600 L370 900 L245 900 Z',
  'saia-lapis': 'M300 300 L500 300 L520 520 L505 720 L295 720 L280 520 Z',
  regata: 'M330 200 L360 200 L372 265 Q400 300 428 265 L440 200 L470 200 L525 340 L530 640 L270 640 L275 340 Z',
  bata: 'M300 215 L500 215 L520 330 L540 660 L260 660 L280 330 Z M300 225 Q190 230 185 330 Q220 400 285 360 Z M500 225 Q610 230 615 330 Q580 400 515 360 Z',
  camisa: 'M300 200 L360 185 L400 240 L440 185 L500 200 L575 260 L640 640 L585 655 L530 370 L530 720 L270 720 L270 370 L215 655 L160 640 L225 260 Z',
  kimono: 'M250 195 L550 195 L705 430 L610 485 L555 395 L555 830 L245 830 L245 395 L190 485 L95 430 Z',
  'saia-longa': 'M305 250 L495 250 L620 890 Q400 925 180 890 Z',
  'saia-midi': 'M300 270 L500 270 L595 750 Q400 775 205 750 Z',
  calca: 'M290 215 L510 215 L565 885 L430 885 L400 430 L370 885 L235 885 Z',
  short: 'M285 300 L515 300 L548 575 L420 575 L400 455 L380 575 L252 575 Z',
  bolsa: 'M240 430 Q240 410 260 410 L540 410 Q560 410 560 430 L585 720 Q585 745 560 745 L240 745 Q215 745 215 720 Z',
  colar: '',
}

function estampa(e: Estampa, cor: string): string {
  switch (e) {
    case 'floral':
      return `<pattern id="p" width="90" height="90" patternUnits="userSpaceOnUse"><rect width="90" height="90" fill="${cor}"/>
        <g fill="#fff" opacity=".85"><circle cx="22" cy="22" r="7"/><circle cx="34" cy="22" r="7"/><circle cx="28" cy="12" r="7"/><circle cx="28" cy="32" r="7"/></g>
        <circle cx="28" cy="22" r="5" fill="#E9B81C"/><g fill="#EC7A62" opacity=".9"><circle cx="66" cy="62" r="6"/><circle cx="76" cy="62" r="6"/><circle cx="71" cy="54" r="6"/><circle cx="71" cy="70" r="6"/></g></pattern>`
    case 'listras':
      return `<pattern id="p" width="120" height="120" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
        <rect width="120" height="120" fill="${cor}"/><rect width="24" height="120" x="24" fill="#E9B81C"/><rect width="18" height="120" x="62" fill="#1F7A4F"/><rect width="14" height="120" x="94" fill="#F3EAE4"/></pattern>`
    case 'folhas':
      return `<pattern id="p" width="110" height="110" patternUnits="userSpaceOnUse"><rect width="110" height="110" fill="${cor}"/>
        <ellipse cx="30" cy="30" rx="26" ry="11" fill="#5FB7A6" transform="rotate(-35 30 30)"/><ellipse cx="80" cy="78" rx="24" ry="10" fill="#E0621F" transform="rotate(40 80 78)"/>
        <ellipse cx="85" cy="25" rx="16" ry="7" fill="#F3EAE4" transform="rotate(20 85 25)"/></pattern>`
    case 'geometrica':
      return `<pattern id="p" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="${cor}"/>
        <path d="M0 80 L40 30 L80 80 Z" fill="#C0262D"/><path d="M20 0 L40 25 L60 0 Z" fill="#2F5AA8"/><circle cx="40" cy="62" r="8" fill="#F3EAE4"/></pattern>`
    case 'canelado':
      return `<pattern id="p" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="${cor}"/><rect width="5" height="16" x="10" fill="#000" opacity=".14"/></pattern>`
    case 'plissado':
      return `<pattern id="p" width="26" height="26" patternUnits="userSpaceOnUse"><rect width="26" height="26" fill="${cor}"/><rect width="9" height="26" x="17" fill="#000" opacity=".09"/><rect width="3" height="26" x="2" fill="#fff" opacity=".25"/></pattern>`
    case 'acetinado':
      return `<linearGradient id="p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${cor}"/><stop offset=".38" stop-color="#fff" stop-opacity=".55"/><stop offset=".42" stop-color="${cor}"/><stop offset=".7" stop-color="${cor}"/><stop offset=".78" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="${cor}"/></linearGradient>`
    default:
      return `<pattern id="p" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="${cor}"/></pattern>`
  }
}

function svg(p: Peca, detalhe: boolean): string {
  const corpo =
    p.forma === 'colar'
      ? `<path d="M250 230 Q400 620 550 230" fill="none" stroke="${p.cor}" stroke-width="9" stroke-dasharray="2 13" stroke-linecap="round"/>
         <ellipse cx="400" cy="500" rx="48" ry="66" fill="${p.cor}"/><ellipse cx="388" cy="484" rx="16" ry="26" fill="#fff" opacity=".35"/>`
      : `<path d="${formas[p.forma]}" fill="url(#p)" stroke="rgba(0,0,0,.18)" stroke-width="3" fill-rule="nonzero"/>
         <path d="${formas[p.forma]}" fill="url(#luz)"/>`
  const alca =
    p.forma === 'bolsa' ? `<path d="M300 415 Q400 230 500 415" fill="none" stroke="${p.cor}" stroke-width="16"/>` : ''
  const cabide =
    p.forma === 'bolsa' || p.forma === 'colar'
      ? ''
      : `<path d="M400 120 q0 -38 26 -38 q24 0 24 24 q0 18 -24 30 L400 150 L250 205 L550 205 L400 150" fill="none" stroke="#9b8a80" stroke-width="7" stroke-linejoin="round"/>`
  const detalhes: Record<Detalhe, string> = {
    perolas: [330, 350, 370, 430, 450, 470].map((x, i) => `<circle cx="${x}" cy="${200 + (i < 3 ? i * 14 : (5 - i) * 14)}" r="8" fill="#fff" stroke="#c9b9a6" stroke-width="2"/>`).join(''),
    laco: '<path d="M400 230 L345 200 L345 262 Z M400 230 L455 200 L455 262 Z M392 230 L370 330 M408 230 L430 330" fill="#5A1E24" stroke="#3E1418" stroke-width="5"/>',
    cinto: '<rect x="282" y="255" width="236" height="26" fill="#3E1418"/><rect x="384" y="250" width="34" height="36" fill="none" stroke="#C9A45C" stroke-width="6"/>',
    amarracao: '<path d="M300 430 Q400 470 500 430 M400 450 L360 560 M400 450 L445 550" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="10" stroke-linecap="round"/>',
  }
  const extra = p.detalhe ? detalhes[p.detalhe] : ''
  // A segunda foto é um "detalhe": a mesma peça ampliada.
  const zoom = detalhe ? 'transform="translate(-260 -260) scale(1.65)"' : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000">
    <defs>${estampa(p.estampa, p.cor)}
      <linearGradient id="luz" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>
    </defs>
    <rect width="800" height="1000" fill="${detalhe ? '#FBF8F4' : p.fundo}"/>
    <ellipse cx="400" cy="955" rx="230" ry="16" fill="#000" opacity=".06"/>
    <g ${zoom}>${cabide}${alca}${corpo}${extra}</g>
  </svg>`
}

await mkdir('public/produtos', { recursive: true })
for (const p of pecas) {
  for (const [n, detalhe] of [[1, false], [2, true]] as const) {
    await sharp(Buffer.from(svg(p, detalhe))).webp({ quality: 78 }).toFile(`public/produtos/${p.id}-${n}.webp`)
  }
}
console.log(`✓ ${pecas.length * 2} imagens geradas em public/produtos/`)
