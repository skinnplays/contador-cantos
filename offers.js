// Sugestões de produto mostradas quando a prova termina com poucos cantos.
//
// COMO ADICIONAR UM PRODUTO: copie o modelo comentado abaixo para dentro de PRODUCTS.
//   id:     nome curto, sem espaço nem acento (aparece assim no GoatCounter)
//   name:   nome do produto
//   text:   1 ou 2 frases
//   link:   endereço da loja / catálogo do WhatsApp
//   image:  arquivo da foto dentro da pasta "produtos" (opcional)
//   durations: em quais provas aparece ([10], [15] ou [10, 15])
//
// Com a lista vazia, o aviso nunca aparece.

// Aparece quando o total de cantos fica entre 0 e "max" (inclusive).
export const LIMITS = { 10: { max: 80 }, 15: { max: 140 } };

export const PRODUCTS = [
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
  const limit = limits[durationMin];
  if (!limit || total < 0 || total > limit.max) return null;
  const eligible = products.filter((p) => !p.durations || p.durations.includes(durationMin));
  if (eligible.length === 0) return null;
  const unseen = eligible.find((p) => !seen[p.id]);
  if (unseen) return unseen;
  return eligible.reduce((a, b) => (seen[b.id] < seen[a.id] ? b : a));
}
