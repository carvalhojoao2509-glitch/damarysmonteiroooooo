// Tipos compartilhados por todo o projeto.
// Este arquivo não importa nada do navegador, para poder ser usado também
// pelos scripts de build (sitemap, páginas de compartilhamento).

/** Uma loja física da marca. */
export interface Unidade {
  /** Identificador curto, sem espaços nem acentos. Vira a coluna `estoque_<id>` da planilha. */
  id: string
  nome: string
  endereco: string
  bairroCidade: string
  /** Ex.: ["Seg a sex: 9h às 19h", "Sáb: 9h às 14h"] */
  horarios: string[]
  /** Formato internacional, só números: 55 + DDD + número. Ex.: 5527999999999 */
  whatsapp: string
  /** Link "Compartilhar" do Google Maps. */
  linkMapa: string
}

export interface FormaPagamento {
  id: string
  nome: string
  /** Texto curto opcional, ex.: "Chave enviada pelo atendente" */
  detalhe?: string
}

export interface FormaEntrega {
  id: string
  nome: string
  /** Número em reais, ou um texto como "A combinar". Omitir = sem taxa. */
  taxa?: number | string
  /** Se verdadeiro, a finalização pede o endereço do cliente. */
  pedeEndereco: boolean
  detalhe?: string
}

export interface RedeSocial {
  nome: 'Instagram' | 'Facebook' | 'TikTok' | 'YouTube' | 'Site'
  url: string
  /** Texto exibido, ex.: "@minhaloja" */
  rotulo: string
}

export interface ConfigLoja {
  nome: string
  slogan: string
  descricao: string
  /** Endereço público do site, sem barra no fim. Usado no SEO e nas prévias de compartilhamento. */
  urlSite: string
  /** Caminho de uma imagem de logo em /public. Deixe vazio para mostrar o nome em texto. */
  logo: string
  favicon: string
  /** Imagem 1200x630 mostrada ao compartilhar o link (WhatsApp, Instagram, Facebook). */
  imagemCompartilhamento: string
  cores: {
    primaria: string
    textoSobrePrimaria: string
    secundaria: string
    fundo: string
    superficie: string
    texto: string
    textoSuave: string
    destaque: string
    disponivel: string
  }
  fontes: {
    titulo: string
    texto: string
  }
  redesSociais: RedeSocial[]
  unidades: Unidade[]
  pagamentos: FormaPagamento[]
  parcelamento?: { vezes: number; valorMinimoParcela: number; semJuros: boolean }
  entregas: FormaEntrega[]
  campanha: {
    titulo: string
    texto: string
    botao: string
    /** Link do botão, ex.: "/catalogo?tag=natal" */
    link: string
    /** IDs de até 3 produtos mostrados na vitrine da home. Vazio = usa as novidades. */
    produtosVitrine: string[]
  }
  /** Círculos da home (como os destaques do Instagram). */
  destaques: { nome: string; link: string; imagem: string }[]
  /** Looks prontos: combinações de produtos (por id). */
  looks: { id: string; nome: string; produtos: string[] }[]
  /** Faixa de chamada para a grade plus size. Omitir = não mostra. */
  plusSize?: { titulo: string; texto: string; link: string }
  /** Seção "Sobre" com a dona da marca. Omitir = não mostra. */
  sobre?: { titulo: string; texto: string[]; foto: string }
  mensagemRodape: string
  produtos: {
    fonte: 'json' | 'planilha'
    /** Link da planilha publicada como CSV (Arquivo > Compartilhar > Publicar na Web > CSV). */
    urlPlanilha: string
    /** Por quantos minutos o navegador reaproveita a planilha antes de baixar de novo. */
    cacheMinutos: number
  }
  metricas: {
    /** Ex.: "G-XXXXXXXXXX". Vazio = desligado. */
    googleAnalyticsId: string
    /** Ex.: "123456789012345". Vazio = desligado. */
    metaPixelId: string
  }
  /** Mapa opcional de nome de cor -> código, para mostrar a bolinha de cor. */
  coresProdutos: Record<string, string>
}

/** Disponibilidade de um produto em uma unidade, já interpretada. */
export type Estoque =
  | { tipo: 'sim' }
  | { tipo: 'nao' }
  | { tipo: 'consultar' }
  | { tipo: 'quantidade'; total: number }
  | { tipo: 'porTamanho'; quantidades: Record<string, number> }

export interface Produto {
  id: string
  nome: string
  descricao: string
  categoria: string
  subcategoria: string
  preco: number
  precoPromocional?: number
  imagens: string[]
  tamanhos: string[]
  cores: string[]
  tags: string[]
  publico: string
  ativo: boolean
  /** AAAA-MM-DD. Usado para ordenar por novidades. */
  dataCadastro: string
  /** Chave = id da unidade. Unidade ausente = "consultar disponibilidade". */
  estoque: Record<string, Estoque>
}

export type StatusDisponibilidade = 'disponivel' | 'consultar' | 'indisponivel'

export interface ItemSacola {
  /** produtoId + tamanho + cor, para juntar itens iguais. */
  chave: string
  produtoId: string
  nome: string
  imagem: string
  tamanho: string
  cor: string
  /** Preço unitário no momento em que foi adicionado. */
  preco: number
  quantidade: number
}
