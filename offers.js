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
//
// Com a lista vazia, o aviso nunca aparece.

// Aparece quando o total de cantos fica entre 0 e "max" (inclusive).
// Faixas: de 0 até "low" = "saude" (pássaro parado: muda, saúde, vitaminas);
//         de low+1 até max = "energia" (pássaro bem, mas pode render mais).
// Cada produto diz em quais faixas aparece em `tiers` (sem `tiers` = nas duas).
// Se uma faixa ficar sem produto, usa qualquer produto da roda.
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
    tiers: ['saude', 'energia'],
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
export function pickOffer(durationMin, total, seen = {}, products = PRODUCTS, limits = LIMITS) {
  const tier = tierFor(durationMin, total, limits);
  if (!tier) return null;
  const byDuration = products.filter((p) => !p.durations || p.durations.includes(durationMin));
  const byTier = byDuration.filter((p) => !p.tiers || p.tiers.includes(tier));
  const eligible = byTier.length ? byTier : byDuration;
  if (eligible.length === 0) return null;
  const unseen = eligible.find((p) => !seen[p.id]);
  if (unseen) return unseen;
  return eligible.reduce((a, b) => (seen[b.id] < seen[a.id] ? b : a));
}
