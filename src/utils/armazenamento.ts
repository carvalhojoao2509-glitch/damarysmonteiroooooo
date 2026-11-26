// Acesso seguro ao localStorage. Em aba anônima, com cookies bloqueados ou em
// alguns navegadores embutidos (Instagram), o localStorage pode falhar: aqui
// qualquer erro é ignorado e o site continua funcionando sem lembrar a escolha.

const PREFIXO = 'catalogo:'

export function ler<T>(chave: string, padrao: T): T {
  try {
    const bruto = window.localStorage.getItem(PREFIXO + chave)
    return bruto === null ? padrao : (JSON.parse(bruto) as T)
  } catch {
    return padrao
  }
}

export function gravar(chave: string, valor: unknown): void {
  try {
    window.localStorage.setItem(PREFIXO + chave, JSON.stringify(valor))
  } catch {
    /* sem armazenamento disponível: segue sem salvar */
  }
}

export function apagar(chave: string): void {
  try {
    window.localStorage.removeItem(PREFIXO + chave)
  } catch {
    /* ignora */
  }
}
