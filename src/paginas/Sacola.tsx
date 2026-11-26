// Sacola + finalização. Não há pagamento online: o pedido vira uma mensagem
// pronta no WhatsApp da loja escolhida, e o atendimento confirma tudo por lá.
// Os dados digitados aqui NÃO são salvos: vão apenas na mensagem.

import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { loja } from '../config/loja.config.ts'
import { QUANTIDADE_MAXIMA, useSacola } from '../contextos/SacolaContext.tsx'
import { useUnidade } from '../contextos/UnidadeContext.tsx'
import { IconeLixeira, IconeMais, IconeMenos, IconeWhatsApp } from '../componentes/ui/Icones.tsx'
import { Seo } from '../componentes/ui/Seo.tsx'
import { registrarPedidoWhatsApp } from '../servicos/metricas.ts'
import { linkWhatsApp, mensagemPedido, textoTaxa } from '../servicos/whatsapp.ts'
import { formatarPreco } from '../utils/preco.ts'

const AVISO = 'catalogo:pedido-enviado'
function lerAvisoEnviado(): boolean {
  try {
    return window.sessionStorage.getItem(AVISO) === '1'
  } catch {
    return false
  }
}
function gravarAvisoEnviado(sim: boolean) {
  try {
    if (sim) window.sessionStorage.setItem(AVISO, '1')
    else window.sessionStorage.removeItem(AVISO)
  } catch {
    /* sem armazenamento: a confirmação só aparece enquanto a página não recarrega */
  }
}

export default function Sacola() {
  const { itens, subtotal, alterarQuantidade, remover, esvaziar, quantidadeTotal } = useSacola()
  const { unidade, escolher } = useUnidade()

  const [nome, setNome] = useState('')
  const [bairroCidade, setBairroCidade] = useState('')
  const [pagamento, setPagamento] = useState('')
  const [entregaId, setEntregaId] = useState(loja.entregas[0]?.id ?? '')
  const [endereco, setEndereco] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [erros, setErros] = useState<Record<string, string>>({})
  /**
   * Pedido enviado? Guardamos só um aviso "sim" na sessão da aba (sem nome, endereço
   * ou itens), para a confirmação continuar aparecendo quando a cliente volta do WhatsApp.
   * O link com a mensagem fica apenas na memória da página.
   */
  const [enviado, setEnviadoEstado] = useState<boolean>(() => lerAvisoEnviado())
  const [linkEnviado, setLinkEnviado] = useState<string | null>(null)
  const setEnviado = (link: string | null) => {
    setEnviadoEstado(link !== null)
    setLinkEnviado(link)
    gravarAvisoEnviado(link !== null)
  }

  const entrega = loja.entregas.find((e) => e.id === entregaId)
  const taxa = typeof entrega?.taxa === 'number' ? entrega.taxa : 0

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    const novos: Record<string, string> = {}
    if (!nome.trim()) novos.nome = 'Digite seu nome.'
    if (!pagamento) novos.pagamento = 'Escolha a forma de pagamento.'
    if (entrega?.pedeEndereco && !endereco.trim()) novos.endereco = 'Digite o endereço de entrega.'
    setErros(novos)
    if (Object.keys(novos).length) {
      // Leva o foco ao primeiro campo com problema (ajuda leitores de tela e teclado).
      document.getElementById(`campo-${Object.keys(novos)[0]}`)?.focus()
      return
    }

    const mensagem = mensagemPedido({
      itens,
      unidade,
      nome: nome.trim(),
      bairroCidade: bairroCidade.trim(),
      pagamento: loja.pagamentos.find((p) => p.id === pagamento)?.nome,
      entrega,
      endereco: endereco.trim(),
      observacoes: observacoes.trim(),
    })
    registrarPedidoWhatsApp({ origem: 'sacola', unidade: unidade.id, valor: subtotal + taxa, itens: quantidadeTotal })
    const link = linkWhatsApp(unidade.whatsapp, mensagem)
    // Mostra a confirmação (para quem voltar ao site) e abre o WhatsApp.
    setEnviado(link)
    window.scrollTo(0, 0)
    window.location.href = link
  }

  // Depois do envio: confirmação, com opção de reabrir o WhatsApp ou começar outro pedido.
  if (enviado && itens.length > 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-14 text-center">
        <Seo titulo="Pedido enviado" />
        <h1 className="text-4xl">Pedido enviado para o WhatsApp</h1>
        <p className="mt-3 text-suave">
          A mensagem com as peças já está pronta na conversa com a {unidade.nome}. Se ainda não enviou, toque em
          enviar no WhatsApp: o atendimento confirma preço e disponibilidade por lá.
        </p>
        <div className="mt-8 grid gap-3">
          {linkEnviado && (
            <a href={linkEnviado} className="pressionavel flex items-center justify-center gap-2 rounded-md bg-[#1F7A45] py-3.5 font-semibold text-white hover:bg-[#186338]">
              <IconeWhatsApp /> Abrir o WhatsApp de novo
            </a>
          )}
          <button
            type="button"
            onClick={() => {
              esvaziar()
              setEnviado(null)
            }}
            className="rounded-md bg-primaria py-3.5 font-semibold text-sobre-primaria hover:brightness-110"
          >
            Esvaziar a sacola e fazer outro pedido
          </button>
          <button type="button" onClick={() => setEnviado(null)} className="py-2 font-semibold text-primaria underline underline-offset-4">
            Voltar à sacola
          </button>
        </div>
      </div>
    )
  }

  if (itens.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <Seo titulo="Sacola" />
        <h1 className="text-4xl">Sua sacola está vazia</h1>
        <p className="mt-3 text-suave">Escolha as peças no catálogo e envie o pedido pelo WhatsApp da loja.</p>
        <Link to="/catalogo" className="pressionavel mt-6 inline-flex rounded-md bg-primaria px-6 py-3 font-semibold text-sobre-primaria">
          Ver o catálogo
        </Link>
      </div>
    )
  }

  const erroDe = (campo: string) =>
    erros[campo] ? (
      <p id={`erro-${campo}`} className="mt-1 text-sm font-semibold text-destaque">
        {erros[campo]}
      </p>
    ) : null

  return (
    <div className="mx-auto max-w-6xl px-4 pt-6">
      <Seo titulo="Sacola" />
      <h1 className="text-4xl md:text-5xl">Sacola</h1>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_26rem]">
        {/* Itens */}
        <section aria-labelledby="titulo-itens">
          <h2 id="titulo-itens" className="sr-only">Itens</h2>
          <ul className="divide-y divide-superficie border-y border-superficie">
            {itens.map((i) => (
              <li key={i.chave} className="flex gap-4 py-4">
                <Link to={`/produto/${i.produtoId}`} className="w-20 shrink-0 sm:w-24">
                  <img src={i.imagem} alt="" width={96} height={120} loading="lazy" className="aspect-[4/5] w-full rounded object-cover" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link to={`/produto/${i.produtoId}`} className="font-semibold leading-snug hover:underline">
                    {i.nome}
                  </Link>
                  <p className="text-sm text-suave">
                    {[i.tamanho && `Tam. ${i.tamanho}`, i.cor].filter(Boolean).join(', ')}
                  </p>
                  <p className="mt-1 text-sm">{formatarPreco(i.preco)} cada</p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center rounded-md border border-texto/25 bg-white" role="group" aria-label={`Quantidade de ${i.nome}`}>
                      <button type="button" className="grid h-11 w-11 place-items-center disabled:opacity-30" onClick={() => alterarQuantidade(i.chave, i.quantidade - 1)} disabled={i.quantidade <= 1} aria-label="Diminuir">
                        <IconeMenos width={16} height={16} />
                      </button>
                      <span className="numeros min-w-6 text-center" aria-live="polite">{i.quantidade}</span>
                      <button type="button" className="grid h-11 w-11 place-items-center disabled:opacity-30" onClick={() => alterarQuantidade(i.chave, i.quantidade + 1)} disabled={i.quantidade >= QUANTIDADE_MAXIMA} aria-label="Aumentar">
                        <IconeMais width={16} height={16} />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="numeros font-semibold">{formatarPreco(i.preco * i.quantidade)}</span>
                      <button type="button" onClick={() => remover(i.chave)} className="-mr-2 grid h-11 w-11 place-items-center text-suave hover:text-destaque" aria-label={`Remover ${i.nome}`}>
                        <IconeLixeira width={18} height={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <Link to="/catalogo" className="mt-2 inline-flex min-h-11 items-center font-semibold text-primaria underline underline-offset-4">
            Continuar escolhendo
          </Link>
        </section>

        {/* Finalização */}
        <section aria-labelledby="titulo-finalizar" className="rounded-lg bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)] lg:sticky lg:top-4 lg:self-start">
          <h2 id="titulo-finalizar" className="text-2xl">Finalizar pelo WhatsApp</h2>
          <p className="mt-1 text-sm text-suave">Sem pagamento pelo site: você combina tudo com a loja no WhatsApp.</p>

          <form noValidate onSubmit={enviar} className="mt-5 space-y-5">
            <div>
              <label htmlFor="campo-nome" className="mb-1 block font-semibold">Seu nome</label>
              <input id="campo-nome" className="campo" autoComplete="name" required value={nome} onChange={(e) => setNome(e.target.value)} aria-invalid={!!erros.nome} aria-describedby={erros.nome ? 'erro-nome' : undefined} />
              {erroDe('nome')}
            </div>

            <div>
              <label htmlFor="campo-bairro" className="mb-1 block font-semibold">
                Bairro e cidade <span className="font-normal text-suave">(opcional)</span>
              </label>
              <input id="campo-bairro" className="campo" autoComplete="address-level2" value={bairroCidade} onChange={(e) => setBairroCidade(e.target.value)} />
            </div>

            <div>
              <label htmlFor="campo-unidade" className="mb-1 block font-semibold">Loja que vai atender</label>
              <select id="campo-unidade" className="campo" value={unidade.id} onChange={(e) => escolher(e.target.value)}>
                {loja.unidades.map((u) => (
                  <option key={u.id} value={u.id}>{u.nome}</option>
                ))}
              </select>
            </div>

            <fieldset aria-describedby={erros.pagamento ? 'erro-pagamento' : undefined}>
              <legend className="mb-2 font-semibold">Pagamento</legend>
              <div className="grid grid-cols-2 gap-2">
                {loja.pagamentos.map((p, idx) => (
                  <label key={p.id} className="pressionavel flex min-h-11 items-center gap-2 rounded-md border border-texto/25 px-3 py-2.5 text-sm has-[:checked]:border-primaria has-[:checked]:bg-primaria/5">
                    <input id={idx === 0 ? 'campo-pagamento' : undefined} type="radio" name="pagamento" value={p.id} checked={pagamento === p.id} onChange={() => setPagamento(p.id)} className="accent-[var(--cor-primaria)]" />
                    {p.nome}
                  </label>
                ))}
              </div>
              {erroDe('pagamento')}
            </fieldset>

            <fieldset>
              <legend className="mb-2 font-semibold">Entrega</legend>
              <div className="space-y-2">
                {loja.entregas.map((e) => (
                  <label key={e.id} className="pressionavel flex min-h-11 items-start gap-2 rounded-md border border-texto/25 px-3 py-3 text-sm has-[:checked]:border-primaria has-[:checked]:bg-primaria/5">
                    <input type="radio" name="entrega" value={e.id} checked={entregaId === e.id} onChange={() => setEntregaId(e.id)} className="mt-0.5 accent-[var(--cor-primaria)]" />
                    <span>
                      {e.nome}
                      {(e.taxa !== undefined || e.detalhe) && (
                        <span className="block text-suave">{[e.detalhe, e.taxa !== undefined && `Taxa: ${textoTaxa(e)}`].filter(Boolean).join('. ')}</span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {entrega?.pedeEndereco && (
              <div>
                <label htmlFor="campo-endereco" className="mb-1 block font-semibold">Endereço de entrega</label>
                <textarea id="campo-endereco" rows={2} className="campo" autoComplete="street-address" value={endereco} onChange={(e) => setEndereco(e.target.value)} aria-invalid={!!erros.endereco} aria-describedby={erros.endereco ? 'erro-endereco' : undefined} placeholder="Rua, número, complemento e bairro" />
                {erroDe('endereco')}
              </div>
            )}

            <div>
              <label htmlFor="campo-obs" className="mb-1 block font-semibold">
                Observações <span className="font-normal text-suave">(opcional)</span>
              </label>
              <textarea id="campo-obs" rows={2} className="campo" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Ex.: é para presente" />
            </div>

            <dl className="numeros space-y-1 border-t border-superficie pt-4">
              <div className="flex justify-between">
                <dt>Subtotal ({quantidadeTotal} {quantidadeTotal === 1 ? 'peça' : 'peças'})</dt>
                <dd>{formatarPreco(subtotal)}</dd>
              </div>
              {entrega?.taxa !== undefined && (
                <div className="flex justify-between text-suave">
                  <dt>Entrega</dt>
                  <dd>{textoTaxa(entrega)}</dd>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold">
                <dt>Total estimado</dt>
                <dd>{formatarPreco(subtotal + taxa)}</dd>
              </div>
            </dl>

            <p className="rounded-md bg-superficie/70 p-3 text-sm">
              Preço e estoque serão confirmados pelo atendimento da {unidade.nome} no WhatsApp.
            </p>

            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-md bg-[#1F7A45] py-3.5 font-semibold text-white hover:bg-[#186338]">
              <IconeWhatsApp /> Enviar pedido pelo WhatsApp
            </button>
            <p className="text-xs text-suave">
              Seus dados não ficam salvos neste site: vão só na mensagem para a loja.{' '}
              <Link to="/privacidade" className="underline">Privacidade</Link>
            </p>
          </form>
        </section>
      </div>
    </div>
  )
}
