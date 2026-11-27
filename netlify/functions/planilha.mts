// Intermediário da planilha: busca o CSV publicado do Google Planilhas no servidor
// da Netlify e o entrega ao site no mesmo endereço. O site chama /api/planilha,
// que o netlify.toml encaminha para esta função (/.netlify/functions/planilha).
// Por quê: alguns navegadores bloqueiam a leitura direta da planilha a partir de
// outro site (CORS). Pelo mesmo endereço, o bloqueio não acontece.
//
// O link vem da variável PLANILHA_URL (configurável no painel da Netlify) ou,
// se ela não existir, de loja.config.ts > produtos.urlPlanilha.

import { loja } from '../../src/config/loja.config.ts'

export default async (): Promise<Response> => {
  const url = process.env.PLANILHA_URL || loja.produtos.urlPlanilha
  if (!url) return new Response('Planilha não configurada', { status: 404 })

  try {
    const r = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(8000) })
    const csv = await r.text()
    if (!r.ok) throw new Error(`Google respondeu ${r.status}`)
    // Planilha despublicada devolve uma página HTML em vez de CSV.
    if (csv.trimStart().startsWith('<')) throw new Error('A planilha não está publicada como CSV')

    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        // Navegador: sempre pergunta de novo (o site já tem o próprio cache).
        'Cache-Control': 'public, max-age=0, must-revalidate',
        // CDN da Netlify: guarda 1 minuto e serve a cópia anterior por mais 1 minuto enquanto atualiza.
        'Netlify-CDN-Cache-Control': 'public, durable, max-age=60, stale-while-revalidate=60',
      },
    })
  } catch (erro) {
    console.error('[planilha] falha ao ler a planilha:', erro)
    return new Response('Não foi possível ler a planilha', { status: 502, headers: { 'Cache-Control': 'no-store' } })
  }
}

