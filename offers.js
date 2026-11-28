// Sugestões de produto mostradas quando a prova termina com poucos cantos.
//
// COMO ADICIONAR UM PRODUTO: copie o modelo comentado abaixo para dentro de PRODUCTS.
//   id:     nome curto, sem espaço nem acento (aparece assim no GoatCounter)
//   name:   nome do produto
//   text:   1 ou 2 frases
//   link:   endereço da loja / catálogo do WhatsApp
//   image:  foto do produto: arquivo na pasta "produtos" ou endereço da imagem (opcional)
//   cta:    texto do botão (opcional; padrão "Ver produto")
//   durations: em quais rodas aparece ([10], [15] ou [10, 15])
//   tiers:  faixa de resultado: ['saude'], ['energia'] ou as duas
//   species: só para essas espécies (ex.: ['Coleiro']); sem species = serve para todas
//
// Com a lista vazia, o aviso nunca aparece.

// Aparece quando o total de cantos fica entre 0 e "max" (inclusive).
// Faixas: de 0 até "low" = "saude" (pássaro parado: muda, saúde, vitaminas);
//         de low+1 até max = "energia" (pássaro bem, mas pode render mais).
// Cada produto diz em quais faixas aparece em `tiers` (sem `tiers` = nas duas).
// Se uma faixa ficar sem produto, usa qualquer produto da roda.
// Espécies que marcam em roda de canto (aparecem na arte e filtram os produtos).
export const SPECIES = ['Coleiro', 'Trinca-ferro', 'Canário-da-terra', 'Tiziu', 'Cardeal', 'Curió', 'Bicudo',
  'Azulão', 'Pintassilgo', 'Sabiá', 'Galo-de-campina'];

export const LIMITS = { 10: { max: 80, low: 40 }, 15: { max: 140, low: 60 } };

export function tierFor(durationMin, total, limits = LIMITS) {
  const l = limits[durationMin];
  if (!l || total < 0 || total > l.max) return null;
  return total <= l.low ? 'saude' : 'energia';
}

export const PRODUCTS = [
  {
    id: 'dextrotonic-omniform',
    name: 'Kit Dextrotonic + Omniform',
    text: 'Energia e vitaminas para o seu pássaro chegar mais disposto na próxima roda. Kit importado, fracionado — pronto para usar.',
    link: 'https://meli.la/1cTT6z8',
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_848048-MLB99261528580_112025-F-kit-dextrotonic-e-omniform-importado--fracionado.webp',
    cta: 'Ver no Mercado Livre',
    durations: [10, 15],
    tiers: ['energia'],
  },
  {
    id: 'nekton-booster',
    name: 'Nekton Booster',
    text: 'Suplemento da Alemanha, marca Nekton, referência entre criadores, para mais vigor e disposição na próxima roda.',
    link: 'https://meli.la/1DFPXTm',
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_639833-MLA99367445540_112025-F.webp',
    cta: 'Ver no Mercado Livre',
    durations: [10, 15],
    tiers: ['energia'],
  },
  {
    id: 'nekton-e',
    name: 'Nekton-E – Vitamina E',
    text: 'Suplemento vitaminado da Nekton para manter seu pássaro em forma e cheio de vitalidade durante a temporada de rodas.',
    link: 'https://meli.la/2nimR2Z',
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_674813-MLA99874727303_112025-F.webp',
    cta: 'Ver no Mercado Livre',
    durations: [10, 15],
    tiers: ['saude'],
  },
  {
    id: 'raff-patee-frutas',
    name: 'Farinhada Raff Realpasto Frutas',
    text: 'Farinhada italiana com frutas, nutritiva e saborosa — um reforço de qualidade na alimentação do dia a dia.',
    link: 'https://meli.la/1gajtrA',
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_933841-MLB115128682495_072026-F-farinhada-italiana-patee-frutas-raff-realpasto--1-kg.webp',
    cta: 'Ver no Mercado Livre',
    durations: [10, 15],
    tiers: ['energia', 'saude'],
  },
  {
    id: 'nutribird-unikomplet',
    name: 'Nutribird Unikomplet',
    text: 'Alimento completo da Versele-Laga: nutrição equilibrada em cada grão para seu pássaro render na roda.',
    link: 'https://meli.la/2Lv86tZ',
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_900198-MLB97533290072_112025-F-nutribird-unikomplet-versele-laga-1-kg.webp',
    cta: 'Ver no Mercado Livre',
    durations: [10, 15],
    tiers: ['energia', 'saude'],
  },
  {
    id: 'racao-coleiro-almeidas',
    name: "Ração Coleiro Performance Almeida's",
    text: 'Ração feita para coleiro de competição — alimentação pensada para quem leva o canto a sério.',
    link: 'https://meli.la/1XkHxHm',
    image: 'https://http2.mlstatic.com/D_NQ_NP_2X_619020-MLB116712400934_092026-F-racao-coleiro--performance-500g-almeidas.webp',
    cta: 'Ver no Mercado Livre',
    durations: [10, 15],
    species: ['Coleiro'],
    tiers: ['energia'],
  },
  {
    id: 'selecao-coleiro',
    name: 'Os melhores produtos pro seu coleiro',
    text: 'Uma seleção do Criatório Strike com rações, farinhadas e suplementos para o seu coleiro chegar bem na próxima roda.',
    link: 'https://meli.la/33b6JSp',
    image: 'icon-512.png',
    cta: 'Ver a seleção',
    durations: [10, 15],
    species: ['Coleiro'],
    tiers: ['saude', 'energia'],
  },
  {
    id: 'kit-torneio-shopee',
    name: 'Kit Torneio Omniform + Dextrotonic',
    text: 'Versele-Laga original em frascos de 10 e 20 ml: vitaminas e energia para o pássaro chegar no ponto no dia do torneio.',
    link: 'https://s.shopee.com.br/7pv9p7mw7a?share_channel_code=1',
    image: 'https://down-br.img.susercontent.com/file/br-11134207-820lu-mlmqx94qzitie1@resize_w450_nl.webp',
    cta: 'Ver na Shopee',
    durations: [10, 15],
    tiers: ['energia'],
  },
  {
    id: 'ferti-vit',
    name: 'Ferti-Vit Versele-Laga',
    text: 'Clássico da Oropharma para canto e vigor, fracionado em pote de 10 g — rende bastante e cabe no bolso.',
    link: 'https://s.shopee.com.br/2BGn4AUhOs?share_channel_code=1',
    image: 'https://down-br.img.susercontent.com/file/br-11134207-7r98o-m9hf8eoig3eh26.webp',
    cta: 'Ver na Shopee',
    durations: [10, 15],
    tiers: ['energia'],
  },
  {
    id: 'oro-bath',
    name: 'Oro Bath – Sais de Banho',
    text: 'Sais de banho da Oropharma: penas bonitas e pássaro bem cuidado, pronto para a próxima roda.',
    link: 'https://s.shopee.com.br/4qHYFB9Kgz?share_channel_code=1',
    image: 'https://down-br.img.susercontent.com/file/br-11134207-81ztc-mk2xjwesasqo25@resize_w450_nl.webp',
    cta: 'Ver na Shopee',
    durations: [10, 15],
    tiers: ['saude'],
  },
  {
    id: 'argila-alta-performance',
    name: 'Argila Alta Performance 350 g',
    text: 'Argila para o dia a dia do criatório, um cuidado simples que ajuda a manter o pássaro em forma.',
    link: 'https://s.shopee.com.br/1Lhg4tWDje?share_channel_code=1',
    image: 'https://down-br.img.susercontent.com/file/br-11134207-820mh-mqmfh191txj484.webp',
    cta: 'Ver na Shopee',
    durations: [10, 15],
    tiers: ['saude'],
  },
  {
    id: 'hidrovit',
    name: 'Hidrovit 50 ml – Vetnil',
    text: 'Suplemento vitamínico da Vetnil para dar aquela recuperada e deixar o pássaro cheio de disposição.',
    link: 'https://s.shopee.com.br/8VAqc6mCBX?share_channel_code=1',
    image: 'https://down-br.img.susercontent.com/file/br-11134207-7r98o-mc9n6wir5n8g9e@resize_w450_nl.webp',
    cta: 'Ver na Shopee',
    durations: [10, 15],
    tiers: ['saude'],
  },
  {
    id: 'seta-banho',
    name: 'Seta Banho 30 ml',
    text: 'Banho para manter as penas limpas e o pássaro bem cuidado entre uma roda e outra.',
    link: 'https://s.shopee.com.br/AAJ4bE8xKh?share_channel_code=1',
    image: 'https://down-br.img.susercontent.com/file/br-11134207-7r98o-mdc9cur61ipt95.webp',
    cta: 'Ver na Shopee',
    durations: [10, 15],
    tiers: ['saude'],
  },
  // {
  //   id: 'vitamina-x',
  //   name: 'Vitamina X',
  //   text: 'Ajuda no vigor e na disposição para cantar.',
  //   link: 'https://wa.me/c/55XXXXXXXXXXX',
  //   image: 'produtos/vitamina-x.jpg',
  //   durations: [10, 15],
  // },
];

// Escolhe o produto para esta prova: primeiro os que este celular nunca viu
// (na ordem da lista); se já viu todos, o que foi visto há mais tempo.
// `seen` = { [id]: horário em que foi mostrado }. Não usa nenhum dado pessoal.
// `species`: espécie lembrada no celular ('' = ainda não escolhida → todos os produtos).
export function pickOffer(durationMin, total, seen = {}, products = PRODUCTS, limits = LIMITS, species = '') {
  const tier = tierFor(durationMin, total, limits);
  if (!tier) return null;
  const byDuration = products.filter((p) => (!p.durations || p.durations.includes(durationMin))
    && (!species || !p.species || p.species.includes(species)));
  const byTier = byDuration.filter((p) => !p.tiers || p.tiers.includes(tier));
  const eligible = byTier.length ? byTier : byDuration;
  if (eligible.length === 0) return null;
  const unseen = eligible.find((p) => !seen[p.id]);
  if (unseen) return unseen;
  return eligible.reduce((a, b) => (seen[b.id] < seen[a.id] ? b : a));
}
