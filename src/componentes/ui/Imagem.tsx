// Imagem de produto com carregamento preguiçoso e proporção fixa (4:5),
// para a página não "pular" enquanto as fotos carregam.

import { useState, type ImgHTMLAttributes } from 'react'

interface Props extends ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  /** true para a primeira imagem visível da página (carrega na hora). */
  prioridade?: boolean
}

export function Imagem({ src, alt, prioridade = false, className = '', ...resto }: Props) {
  const [falhou, setFalhou] = useState(false)
  return (
    <div className={`relative aspect-[4/5] overflow-hidden bg-superficie ${className}`}>
      {falhou || !src ? (
        <div className="absolute inset-0 grid place-items-center p-4 text-center text-sm text-suave">Foto em breve</div>
      ) : (
        <img
          src={src}
          alt={alt}
          width={800}
          height={1000}
          loading={prioridade ? 'eager' : 'lazy'}
          fetchPriority={prioridade ? 'high' : 'auto'}
          decoding="async"
          onError={() => setFalhou(true)}
          className="absolute inset-0 h-full w-full object-cover"
          {...resto}
        />
      )}
    </div>
  )
}
