import type { Produto } from '../tipos/index.ts'
import { normalizar } from './texto.ts'

/**
 * Pontua um produto para a busca. 0 = não encontrado.
 * Ignora acentos e maiúsculas; todas as palavras digitadas precisam aparecer.
 * Nome vale mais que categoria/tags, que valem mais que a descrição.
 */
export function pontuarBusca(p: Produto, consulta: string): number {
  const palavras = normalizar(consulta).split(/\s+/).filter(Boolean)
  if (palavras.length === 0) return 1

  const nome = normalizar(p.nome)
  const meio = normalizar([p.categoria, p.subcategoria, p.tags.join(' '), p.cores.join(' ')].join(' '))
  const descricao = normalizar(p.descricao)

  let total = 0
  for (const w of palavras) {
    // Aceita plural/singular simples: "vestidos" encontra "vestido".
    const raiz = w.length > 4 && w.endsWith('s') ? w.slice(0, -1) : w
    if (nome.includes(raiz)) total += nome.startsWith(raiz) ? 12 : 10
    else if (meio.includes(raiz)) total += 5
    else if (descricao.includes(raiz)) total += 2
    else return 0
  }
  return total
}
