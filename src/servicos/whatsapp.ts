// Monta a mensagem do pedido e o link do WhatsApp da unidade escolhida.

import { loja } from '../config/loja.config.ts'
import type { FormaEntrega, ItemSacola, Unidade } from '../tipos/index.ts'
import { formatarPreco } from '../utils/preco.ts'

export interface DadosPedido {
  itens: ItemSacola[]
  unidade: Unidade
  nome: string
  bairroCidade?: string
  pagamento?: string
  entrega?: FormaEntrega
  endereco?: string
  observacoes?: string
}

/** Link wa.me com a mensagem já codificada. */
export function linkWhatsApp(numero: string, mensagem?: string): string {
  const base = `https://wa.me/${numero.replace(/\D/g, '')}`
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base
}

/** "• 2x Camiseta Básica, tam. G, cor Preta, R$ 59,90 cada" */
function linhaItem(i: ItemSacola): string {
  const partes = [`• ${i.quantidade}x ${i.nome}`]
  if (i.tamanho) partes.push(`tam. ${i.tamanho}`)
  if (i.cor) partes.push(`cor ${i.cor}`)
  partes.push(i.quantidade > 1 ? `${formatarPreco(i.preco)} cada` : formatarPreco(i.preco))
  return partes.join(', ')
}

export function totalItens(itens: ItemSacola[]): number {
  return itens.reduce((soma, i) => soma + i.preco * i.quantidade, 0)
}

/** Texto da taxa de entrega para mostrar na tela e na mensagem. */
export function textoTaxa(e?: FormaEntrega): string {
  if (!e || e.taxa === undefined) return ''
  return typeof e.taxa === 'number' ? (e.taxa === 0 ? 'Grátis' : formatarPreco(e.taxa)) : e.taxa
}

/** Mensagem do pedido completo (finalização da sacola). */
export function mensagemPedido(d: DadosPedido): string {
  const subtotal = totalItens(d.itens)
  const taxa = typeof d.entrega?.taxa === 'number' ? d.entrega.taxa : 0
  const linhas = [
    `Olá! Vim pelo catálogo da ${loja.nome} e tenho interesse ${d.itens.length > 1 ? 'nestes itens' : 'neste item'}:`,
    ...d.itens.map(linhaItem),
  ]
  if (taxa > 0) linhas.push(`Taxa de entrega: ${formatarPreco(taxa)}`)
  linhas.push(`Total estimado: ${formatarPreco(subtotal + taxa)}`, '')
  linhas.push(`Unidade: ${d.unidade.nome}`)
  if (d.pagamento) linhas.push(`Pagamento: ${d.pagamento}`)
  if (d.entrega) {
    const t = typeof d.entrega.taxa === 'string' ? ` (taxa: ${d.entrega.taxa})` : ''
    linhas.push(`Entrega: ${d.entrega.nome}${t}`)
    if (d.entrega.pedeEndereco && d.endereco) linhas.push(`Endereço: ${d.endereco}`)
  }
  linhas.push(`Nome: ${d.nome}`)
  if (d.bairroCidade) linhas.push(`Bairro/cidade: ${d.bairroCidade}`)
  if (d.observacoes) linhas.push(`Observações: ${d.observacoes}`)
  linhas.push('', 'Pode confirmar a disponibilidade, por favor?')
  return linhas.join('\n')
}

/** Mensagem curta do botão "Comprar pelo WhatsApp" na página do produto. */
export function mensagemItemUnico(item: ItemSacola, unidade: Unidade, urlProduto: string): string {
  return [
    `Olá! Vim pelo catálogo da ${loja.nome} e tenho interesse neste item:`,
    linhaItem(item),
    urlProduto,
    '',
    `Unidade: ${unidade.nome}`,
    'Pode confirmar a disponibilidade, por favor?',
  ].join('\n')
}

/** Mensagem do botão flutuante (dúvidas gerais). */
export function mensagemDuvida(): string {
  return `Olá! Vim pelo catálogo da ${loja.nome} e tenho uma dúvida.`
}
