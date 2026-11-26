// Atualiza o título da aba e a descrição de cada página.
// As prévias de compartilhamento (Open Graph) são geradas no build
// (scripts/pos-build.ts), porque WhatsApp e Instagram não executam JavaScript.

import { useEffect } from 'react'
import { loja } from '../../config/loja.config.ts'

export function Seo({ titulo, descricao }: { titulo?: string; descricao?: string }) {
  useEffect(() => {
    document.title = titulo ? `${titulo} | ${loja.nome}` : `${loja.nome} | ${loja.slogan}`
    document.querySelector('meta[name="description"]')?.setAttribute('content', descricao || loja.descricao)
  }, [titulo, descricao])
  return null
}
