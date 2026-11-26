import type { Estoque, Produto, StatusDisponibilidade, Unidade } from '../tipos/index.ts'

/**
 * Status de um produto numa unidade. Se o tamanho for informado e a planilha
 * tiver quantidade por tamanho, considera só aquele tamanho.
 */
export function statusNaUnidade(p: Produto, unidadeId: string, tamanho?: string): StatusDisponibilidade {
  const e: Estoque | undefined = p.estoque[unidadeId]
  if (!e) return 'consultar'
  switch (e.tipo) {
    case 'sim':
      return 'disponivel'
    case 'nao':
      return 'indisponivel'
    case 'consultar':
      return 'consultar'
    case 'quantidade':
      return e.total > 0 ? 'disponivel' : 'indisponivel'
    case 'porTamanho': {
      if (tamanho) {
        // Se a célula lista quantidades por tamanho, tamanho ausente = sem estoque.
        const q = e.quantidades[tamanho.toUpperCase()] ?? 0
        return q > 0 ? 'disponivel' : 'indisponivel'
      }
      return Object.values(e.quantidades).some((q) => q > 0) ? 'disponivel' : 'indisponivel'
    }
  }
}

/** Tamanhos com estoque numa unidade (quando a planilha informa por tamanho). */
export function tamanhosIndisponiveis(p: Produto, unidadeId: string): Set<string> {
  const fora = new Set<string>()
  for (const t of p.tamanhos) {
    if (statusNaUnidade(p, unidadeId, t) === 'indisponivel') fora.add(t)
  }
  return fora
}

/** Outras unidades onde a peça (ou o tamanho) está disponível. */
export function outrasUnidadesComPeca(
  p: Produto,
  unidades: Unidade[],
  unidadeAtualId: string,
  tamanho?: string,
): Unidade[] {
  return unidades.filter((u) => u.id !== unidadeAtualId && statusNaUnidade(p, u.id, tamanho) === 'disponivel')
}

export const textoStatus: Record<StatusDisponibilidade, string> = {
  disponivel: 'Disponível nesta unidade',
  consultar: 'Consultar disponibilidade',
  indisponivel: 'Indisponível nesta unidade',
}
