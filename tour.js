// Guia de primeiro uso: destaca cada parte da tela com uma explicação curta.
// Abre sozinho só na primeira vez (e sem roda em andamento). Dá para pular a qualquer
// momento e rever pelo botão "?" no topo.

const TOUR_KEY = 'contador-cantos.tutorial-visto';

const STEPS = [
  { title: '👋 Bem-vindo ao Contador Strike', text: 'Veja rapidinho o que cada botão faz. Leva menos de 1 minuto.', next: 'Começar' },
  { sel: '#plus', title: '+1 = um canto', text: 'Toque aqui a cada canto do pássaro. O primeiro toque já liga o cronômetro.' },
  { sel: '#minus', title: 'Errou? Use o −1', text: 'Tira o último canto marcado.' },
  { sel: '.setup', title: 'Nome e tempo da roda', text: 'Escreva o nome do pássaro e escolha roda de 10 ou 15 minutos.' },
  { sel: '#startPause', title: 'Iniciar e pausar', text: 'Começa o tempo sem marcar canto e pausa se precisar. No fim da roda, vira “Nova roda”.' },
  { sel: '.stats', title: 'Acompanhe a roda', text: 'Total de cantos, média por minuto e a previsão de quantos cantos o pássaro vai fechar.' },
  { sel: '.vistos', title: 'Vistos', text: 'Escolha visto a cada 50 ou 60 cantos. Quando o pássaro passa um visto, o celular vibra, apita e mostra o tempo.' },
  { sel: '#minutes', title: 'Minuto a minuto', text: 'Quantos cantos o pássaro fez em cada minuto da roda.' },
  { sel: '#swap', title: 'Troque de lugar', text: 'Prefere o +1 no meio da tela? Toque aqui para trocar os botões de lugar com a grade de minutos.' },
  { sel: '#reset', title: 'Zerar', text: 'Apaga a roda para começar de novo (pede confirmação). No fim da roda aparece “Compartilhar”, que gera a arte do resultado.' },
  { sel: '#install', title: 'Instale no celular', text: 'Coloque o app na tela inicial: abre em tela cheia e funciona sem internet.' },
  { sel: '#help', title: 'Rever o guia', text: 'Para ver este guia de novo, é só tocar no “?”. Boa roda! 🏆', next: 'Começar a marcar' },
];

const $ = (id) => document.getElementById(id);
const tour = $('tour'), spot = $('tourSpot'), card = $('tourCard');
const stepEl = $('tourStep'), titleEl = $('tourTitle'), textEl = $('tourText');
const backBtn = $('tourBack'), nextBtn = $('tourNext'), skipBtn = $('tourSkip');

let steps = [], i = 0, onTrack = () => {};

const visible = (node) => !!node && !node.hidden && node.getClientRects().length > 0;

export const isTourOpen = () => !tour.hidden;

export function tourSeen() {
  try { return localStorage.getItem(TOUR_KEY) === '1'; } catch { return true; }
}

function place() {
  if (tour.hidden) return;
  const st = steps[i];
  const target = st.sel ? document.querySelector(st.sel) : null;
  const vw = window.innerWidth, vh = window.innerHeight, m = 12;
  const cw = Math.min(360, vw - 2 * m);
  card.style.width = `${cw}px`;
  const ch = card.offsetHeight;
  if (!target) {
    tour.classList.add('no-target');
    card.style.left = `${(vw - cw) / 2}px`;
    card.style.top = `${Math.max(m, (vh - ch) / 2)}px`;
    return;
  }
  tour.classList.remove('no-target');
  const r = target.getBoundingClientRect(), pad = 6;
  const top = Math.max(4, r.top - pad), bottom = Math.min(vh - 4, r.bottom + pad);
  Object.assign(spot.style, { left: `${r.left - pad}px`, top: `${top}px`, width: `${r.width + 2 * pad}px`, height: `${bottom - top}px` });
  // cartão do lado com mais espaço (acima ou abaixo do destaque)
  const below = vh - bottom, above = top;
  let y;
  if (below >= ch + m * 2 || below >= above) y = Math.min(bottom + m, vh - ch - m);
  else y = Math.max(m, top - ch - m);
  // se nem assim couber sem cobrir, encosta no lado com mais espaço
  card.style.top = `${Math.max(m, y)}px`;
  card.style.left = `${Math.min(Math.max(m, r.left + r.width / 2 - cw / 2), vw - cw - m)}px`;
}

function show() {
  const st = steps[i];
  stepEl.textContent = `${i + 1} de ${steps.length}`;
  titleEl.textContent = st.title;
  textEl.textContent = st.text;
  backBtn.hidden = i === 0;
  nextBtn.textContent = st.next || 'Próximo';
  place();
  nextBtn.focus({ preventScroll: true });
}

function finish(how) {
  tour.hidden = true;
  try { localStorage.setItem(TOUR_KEY, '1'); } catch { /* sem armazenamento */ }
  onTrack(how === 'skip' ? `tutorial-pulou-${i + 1}` : 'tutorial-concluido');
}

export function startTour(track) {
  onTrack = track || (() => {});
  steps = STEPS.filter((st) => !st.sel || visible(document.querySelector(st.sel)));
  i = 0;
  tour.hidden = false;
  onTrack('tutorial-aberto');
  show();
}

nextBtn.addEventListener('click', () => { if (i < steps.length - 1) { i++; show(); } else finish('done'); });
backBtn.addEventListener('click', () => { if (i > 0) { i--; show(); } });
skipBtn.addEventListener('click', () => finish('skip'));
// toques fora do cartão não chegam aos botões do app enquanto o guia está aberto
tour.addEventListener('pointerdown', (e) => { if (!card.contains(e.target)) e.preventDefault(); });
document.addEventListener('keydown', (e) => {
  if (tour.hidden) return;
  if (e.key === 'Escape') { e.preventDefault(); finish('skip'); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); nextBtn.click(); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); backBtn.click(); }
}, true);
window.addEventListener('resize', place);
window.visualViewport?.addEventListener('resize', place);
