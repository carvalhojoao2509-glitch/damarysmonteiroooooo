import { loja } from '../config/loja.config.ts'
import { Seo } from '../componentes/ui/Seo.tsx'

export default function Privacidade() {
  const temMetricas = Boolean(loja.metricas.googleAnalyticsId || loja.metricas.metaPixelId)
  return (
    <article className="mx-auto max-w-2xl px-4 pt-6">
      <Seo titulo="Privacidade" />
      <h1 className="text-4xl">Privacidade</h1>
      <div className="mt-6 space-y-4 leading-relaxed">
        <p>
          Este catálogo não tem cadastro, login nem pagamento online. Seu nome, endereço e observações não são
          gravados neste site: eles vão apenas na mensagem que você mesma envia pelo WhatsApp para a {loja.nome}.
        </p>
        <p>
          O navegador guarda só a loja escolhida e as peças da sacola, para você não perder a seleção. Isso fica no
          seu aparelho e pode ser apagado limpando os dados do site.
        </p>
        {temMetricas && (
          <p>
            Usamos ferramentas de estatística (como Google Analytics ou Meta Pixel) para contar visitas e pedidos
            enviados. Elas podem usar cookies e não recebem seu nome nem seu endereço.
          </p>
        )}
        <p>
          A conversa no WhatsApp segue as regras do próprio WhatsApp. Para pedir a exclusão de dados enviados por lá,
          fale com a loja pelo mesmo número.
        </p>
      </div>
    </article>
  )
}
