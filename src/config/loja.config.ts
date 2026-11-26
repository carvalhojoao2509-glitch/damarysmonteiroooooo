// ╔══════════════════════════════════════════════════════════════════╗
// ║  CONFIGURAÇÃO DA LOJA                                            ║
// ║  Tudo o que muda de um cliente para outro está neste arquivo.    ║
// ║  Para lançar um novo cliente: duplique o projeto, edite este     ║
// ║  arquivo, troque as imagens em /public/marca e os produtos.      ║
// ╚══════════════════════════════════════════════════════════════════╝
//
// Atenção: este arquivo também é lido no build (SEO, sitemap). Não importe
// nada do navegador aqui (window, document, localStorage...).

import type { ConfigLoja } from '../tipos/index.ts'

export const loja: ConfigLoja = {
  nome: 'Dâmarys Monteiro',
  slogan: 'Moda feminina com estilo e personalidade',
  descricao:
    'Conjuntos, camisas, alfaiataria e peças de festa, do slim ao plus size. Escolha no catálogo e finalize seu pedido pelo WhatsApp com uma das nossas 3 lojas em Vitória.',

  // Troque pelo domínio do cliente depois de publicar (sem barra no fim).
  urlSite: 'https://catalogo-exemplo.vercel.app',

  // Vazio = o nome da loja aparece escrito com a fonte de título (como o letreiro).
  logo: '',
  favicon: '/marca/favicon.svg',
  imagemCompartilhamento: '/marca/compartilhamento.jpg',

  // Cores do logo, da fachada e do feed (ver estudo da marca). Todas viram variáveis CSS (ver vite.config.ts).
  cores: {
    primaria: '#5A1E24', // vinho do logo
    textoSobrePrimaria: '#F5EFE6', // creme
    secundaria: '#B8925A', // dourado suave: só detalhes decorativos (contraste baixo para texto)
    fundo: '#F5EFE6', // creme
    superficie: '#E8DCCB', // nude: faixas e separações
    texto: '#2B2B2B',
    textoSuave: '#5E5650',
    destaque: '#3E1418', // vinho escuro: selo de promoção
    disponivel: '#2F6B3F',
  },

  // Nomes das famílias. Os arquivos das fontes são importados em src/estilos/fontes.ts.
  fontes: {
    titulo: "'Marcellus', 'Times New Roman', serif",
    texto: "'Figtree Variable', system-ui, sans-serif",
  },

  redesSociais: [
    {
      nome: 'Instagram',
      url: 'https://www.instagram.com/damarysmonteiroo/',
      rotulo: '@damarysmonteiroo',
    },
  ],

  // ⚠️ [CONFIRMAR COM A CLIENTE] Os nomes dos bairros vêm do Instagram da loja.
  // Endereços, horários e WhatsApp abaixo são PROVISÓRIOS. Troque antes de publicar.
  unidades: [
    {
      id: 'reta-da-penha',
      nome: 'Loja Reta da Penha',
      endereco: 'Endereço a confirmar',
      bairroCidade: 'Reta da Penha, Vitória - ES',
      horarios: ['Seg a sex: 9h às 18h', 'Sáb: 9h às 13h'],
      whatsapp: '5527999990001',
      linkMapa: 'https://www.google.com/maps/search/?api=1&query=Reta+da+Penha+Vit%C3%B3ria+ES',
    },
    {
      id: 'itarare',
      nome: 'Loja Itararé',
      endereco: 'Endereço a confirmar',
      bairroCidade: 'Itararé, Vitória - ES',
      horarios: ['Seg a sex: 9h às 18h', 'Sáb: 9h às 13h'],
      whatsapp: '5527999990002',
      linkMapa: 'https://www.google.com/maps/search/?api=1&query=Itarar%C3%A9+Vit%C3%B3ria+ES',
    },
    {
      id: 'sao-pedro',
      nome: 'Loja São Pedro',
      endereco: 'Endereço a confirmar',
      bairroCidade: 'São Pedro, Vitória - ES',
      horarios: ['Seg a sex: 9h às 18h', 'Sáb: 9h às 13h'],
      whatsapp: '5527999990003',
      linkMapa: 'https://www.google.com/maps/search/?api=1&query=S%C3%A3o+Pedro+Vit%C3%B3ria+ES',
    },
  ],

  pagamentos: [
    { id: 'pix', nome: 'Pix' },
    { id: 'credito', nome: 'Cartão de crédito' },
    { id: 'debito', nome: 'Cartão de débito' },
    { id: 'dinheiro', nome: 'Dinheiro' },
  ],
  // [CONFIRMAR] Remova esta linha se a loja não parcelar.
  parcelamento: { vezes: 4, valorMinimoParcela: 50, semJuros: true },

  entregas: [
    { id: 'retirada', nome: 'Retirada na loja', pedeEndereco: false },
    { id: 'motoboy', nome: 'Entrega por motoboy', taxa: 'A combinar', pedeEndereco: true, detalhe: 'Grande Vitória' },
    { id: 'correios', nome: 'Envio pelos Correios', taxa: 'Calculada no atendimento', pedeEndereco: true },
  ],

  campanha: {
    titulo: 'Coleção nova',
    texto: 'Cetim, plissados e alfaiataria em dourado, menta e vinho. Conforto que veste e valoriza.',
    botao: 'Ver a coleção',
    link: '/catalogo?tag=novidade',
    produtosVitrine: ['vestido-acetinado-dourado', 'conjunto-colete-saia-plissada', 'vestido-plissado-um-ombro'],
  },

  // Círculos da home, como os destaques do Instagram. `link` pode ser uma categoria ou uma coleção filtrada.
  destaques: [
    { nome: 'Novidades', link: '/catalogo?tag=novidade', imagem: '/produtos/vestido-acetinado-dourado-2.webp' },
    { nome: 'Conjuntos', link: '/catalogo/conjuntos', imagem: '/produtos/conjunto-colete-saia-plissada-2.webp' },
    { nome: 'Vestidos e saias', link: '/catalogo/vestidos-e-saias', imagem: '/produtos/vestido-plissado-um-ombro-2.webp' },
    { nome: 'Plus Size', link: '/catalogo?tag=plus+size', imagem: '/produtos/conjunto-camisa-pantalona-2.webp' },
    { nome: 'Promo', link: '/catalogo?promo=1', imagem: '/produtos/macacao-canelado-toque-macio-2.webp' },
  ],

  // Looks prontos: combinações de peças que a cliente pode pôr na sacola de uma vez.
  // Exemplo: { id: 'trabalho', nome: 'Para o trabalho', produtos: ['id-da-blusa', 'id-da-calca'] }
  // Lista vazia = a seção não aparece na home.
  looks: [],

  plusSize: {
    titulo: 'Do slim ao plus size',
    texto: 'As mesmas peças, com modelagem pensada para cada corpo. Grade do P ao G3.',
    link: '/catalogo?tag=plus+size',
  },

  // [CONFIRMAR] Foto e texto enviados pela Dâmarys.
  sobre: {
    titulo: 'Sobre a Dâmarys',
    texto: [
      'A Dâmarys escolhe cada peça pensando na mulher que quer se sentir bonita e confortável no trabalho, na igreja, num evento ou no dia a dia.',
      'Hoje são três lojas em Vitória e um atendimento online que chega a clientes de todo o Espírito Santo.',
    ],
    foto: '',
  },

  // Frase breve no rodapé (o tom do perfil é carinhoso e com fé). Deixe vazio para não mostrar.
  mensagemRodape: 'Que Deus abençoe o seu dia.',

  produtos: {
    // 'json' = usa src/data/produtos.json (precisa de novo deploy para mudar).
    // 'planilha' = lê a planilha do Google publicada como CSV (muda sem deploy).
    fonte: 'json',
    urlPlanilha: '',
    cacheMinutos: 5,
  },

  metricas: {
    googleAnalyticsId: '',
    metaPixelId: '',
  },

  coresProdutos: {
    Preta: '#1d1d1f', Branca: '#ffffff', 'Off-white': '#f4efe6', Nude: '#dcc4ae', Bege: '#d9c3a5',
    Caramelo: '#a8693a', Terracota: '#b5563a', Vinho: '#5a1e24', Rosa: '#e3a5b4', 'Azul-claro': '#9dbbe0',
    Marinho: '#1f2c4d', 'Verde-menta': '#a9d8c3', 'Verde-oliva': '#6b6b3a', 'Verde-esmeralda': '#1f6b52',
    Dourada: '#c9a45c', Jeans: '#4a6a93',
    Estampada: 'conic-gradient(#5a1e24 0 25%, #c9a45c 0 50%, #a9d8c3 0 75%, #e3a5b4 0)',
  },
}
