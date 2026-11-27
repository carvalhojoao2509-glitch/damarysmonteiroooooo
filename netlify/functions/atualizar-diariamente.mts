// Republica o site uma vez por dia (às 6h UTC = 3h em Brasília), sem ninguém precisar agir.
// Na nova publicação: a cópia de reserva (produtos.json) é refeita a partir da planilha,
// e peças novas ganham a prévia própria ao serem compartilhadas no WhatsApp.
//
// Requer uma vez: criar um "build hook" na Netlify e salvar o endereço na variável
// BUILD_HOOK_URL (passo a passo no README). Sem ela, esta função não faz nada.

export default async (): Promise<Response> => {
  const gancho = process.env.BUILD_HOOK_URL
  if (!gancho) {
    console.log('[atualizar] BUILD_HOOK_URL não configurada; nada a fazer.')
    return new Response('sem build hook', { status: 200 })
  }
  const r = await fetch(`${gancho}?trigger_title=${encodeURIComponent('Atualização diária da planilha')}`, { method: 'POST' })
  console.log('[atualizar] build hook respondeu', r.status)
  return new Response(`build hook: ${r.status}`, { status: 200 })
}

export const config = { schedule: '0 6 * * *' }
