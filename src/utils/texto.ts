// Funções de texto usadas na busca, nas URLs e na planilha.

/** Remove acentos e deixa em minúsculas: "Calça Jeans" -> "calca jeans". */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

/** Transforma um nome em trecho de URL: "Calças e shorts" -> "calcas-e-shorts". */
export function slug(texto: string): string {
  return normalizar(texto)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
