import * as L from './logic.js';
import { pickOffer, tierFor, SPECIES } from './offers.js';
import { renderArt, canvasToFile } from './share.js';
import { startTour, tourSeen, isTourOpen } from './tour.js';

const KEY = 'contador-cantos.sessao.v1';
const $ = (id) => document.getElementById(id);

const el = {
  wake: $('wake'), bird: $('bird'), timer: $('timer'), bar: $('bar'), status: $('status'),
  timerCard: $('timerCard'), total: $('total'), avg: $('avg'), forecast: $('forecast'),
  forecastLabel: $('forecastLabel'), avgCard: $('avgCard'), forecastCard: $('forecastCard'),
  minutes: $('minutes'), startPause: $('startPause'), reset: $('reset'),
  minus: $('minus'), plus: $('plus'), confirm: $('confirm'),
  durations: [...document.querySelectorAll('.duration button')],
  vistoSteps: [...document.querySelectorAll('.visto-step button')],
  vistoList: $('vistoList'), toast: $('toast'), toastTitle: $('toastTitle'), toastText: $('toastText'),
  install: $('install'), iosHelp: $('iosHelp'), swap: $('swap'),
};

// ---------- altura real da tela ----------
// Mede a área visível e passa para o CSS (--dvh). Remede quando a tela muda, quando o
// app volta do segundo plano e algumas vezes logo após abrir, porque alguns Android
// só informam a altura certa depois que as barras do sistema terminam de aparecer.
function fitViewport() {
  const h = window.innerHeight || document.documentElement.clientHeight;
  if (h > 0) document.documentElement.style.setProperty('--dvh', `${h / 100}px`);
}
fitViewport();
for (const ev of ['resize', 'orientationchange', 'pageshow', 'focus']) window.addEventListener(ev, fitViewport);
window.visualViewport?.addEventListener('resize', fitViewport);
document.addEventListener('visibilitychange', () => { if (!document.hidden) fitViewport(); });
[60, 250, 700, 1500, 3000].forEach((ms) => setTimeout(fitViewport, ms));

// ---------- posição dos botões (preferência de cada celular) ----------
const LAYOUT_KEY = 'contador-cantos.botoes-no-meio';
let controlsUp = false;
try { controlsUp = localStorage.getItem(LAYOUT_KEY) === '1'; } catch { /* sem armazenamento */ }
function applyLayout() {
  document.querySelector('.app').classList.toggle('controls-up', controlsUp);
  el.swap.setAttribute('aria-pressed', String(controlsUp));
}
applyLayout();
el.swap.addEventListener('click', () => {
  controlsUp = !controlsUp;
  applyLayout();
  try { localStorage.setItem(LAYOUT_KEY, controlsUp ? '1' : '0'); } catch { /* sem armazenamento */ }
});

let s = load() ?? L.createSession(15);
let warnedLastMinute = false;

function load() {
  try {
    const o = JSON.parse(localStorage.getItem(KEY));
    return L.isValid(o) ? L.normalize(o) : null;
  } catch { return null; }
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* sem armazenamento: segue só em memória */ }
}

function update(next) {
  if (next === s) return;
  s = next;
  save();
  render();
}

// ---------- tela sempre ligada ----------
let wakeLock = null;
async function keepScreenOn() {
  if (!('wakeLock' in navigator)) { el.wake.dataset.state = 'unsupported'; el.wake.textContent = 'Tela pode apagar'; return; }
  if (wakeLock || document.visibilityState !== 'visible') return;
  try {
    wakeLock = await navigator.wakeLock.request('screen');
    el.wake.dataset.state = 'on';
    el.wake.textContent = 'Tela ligada';
    wakeLock.addEventListener('release', () => {
      wakeLock = null;
      el.wake.dataset.state = 'off';
      el.wake.textContent = 'Toque para manter a tela ligada';
    });
  } catch {
    el.wake.dataset.state = 'off';
    el.wake.textContent = 'Toque para manter a tela ligada';
  }
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') keepScreenOn();
});
document.addEventListener('pointerdown', keepScreenOn, { capture: true });

// ---------- instalar e tela cheia ----------
const isInstalled = () => matchMedia('(display-mode: standalone)').matches
  || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
  || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

// Contagem anônima de eventos no GoatCounter (sem dados pessoais).
// O script carrega em segundo plano; se ainda não chegou, tenta de novo por alguns segundos.
function track(name, tries = 20) {
  try {
    if (window.goatcounter?.count) {
      window.goatcounter.count({ path: name, title: name, event: true });
    } else if (tries > 0) {
      setTimeout(() => track(name, tries - 1), 500);
    }
  } catch { /* sem contagem */ }
}
if (isInstalled()) track('app-aberto-instalado');

let installEvent = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installEvent = e;
  if (!isInstalled()) el.install.hidden = false;
});
window.addEventListener('appinstalled', () => {
  installEvent = null; el.install.hidden = true;
  track('instalar-concluido');
});
// Mostra o botão sempre que não estiver instalado; se o navegador não oferecer
// a instalação automática, o botão explica como instalar pelo menu.
if (!isInstalled()) el.install.hidden = false;

el.install.addEventListener('click', async () => {
  track('instalar-clique');
  if (installEvent) {
    installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    installEvent = null;
    track(outcome === 'accepted' ? 'instalar-aceito' : 'instalar-recusado');
    if (outcome === 'accepted') el.install.hidden = true;
    return;
  }
  const g = installGuide();
  track(`instalar-instrucoes-${g.kind}`);
  $('installTitle').textContent = g.title;
  $('installSteps').innerHTML = g.steps.map((s) => `<li>${s}</li>`).join(''); // textos fixos do app
  $('installAfter').hidden = !!g.openOutside;
  $('installCopy').hidden = !g.openOutside;
  $('installCopy').textContent = 'Copiar link';
  el.iosHelp.showModal();
});

$('installCopy').addEventListener('click', async () => {
  const url = 'https://contadorstrike.app/';
  try { await navigator.clipboard.writeText(url); }
  catch {
    const t = document.createElement('textarea'); t.value = url; document.body.append(t);
    t.select(); try { document.execCommand('copy'); } catch { /* sem cópia */ } t.remove();
  }
  $('installCopy').textContent = 'Link copiado ✓';
  track('instalar-copiar-link');
});

// Escolhe o passo a passo certo para o aparelho e o navegador em uso.
// Safari 26 (iOS 26) escondeu o Compartilhar dentro do menu "⋯"; navegadores de
// dentro de apps (Instagram, Facebook...) não instalam, então pedimos para abrir fora.
function installGuide() {
  const ua = navigator.userAgent;
  const inApp = /Instagram|FBAN|FBAV|FB_IAB|FBIOS|musical_ly|Bytedance|TikTok|Snapchat|LinkedInApp|Pinterest|Line\//i.test(ua);
  const appName = /Instagram/i.test(ua) ? 'Instagram' : /FBAN|FBAV|FB_IAB|FBIOS/i.test(ua) ? 'Facebook'
    : /musical_ly|Bytedance|TikTok/i.test(ua) ? 'TikTok' : 'aplicativo';
  const outside = isIOS ? 'Safari' : 'Chrome';
  const share = '<b>Compartilhar</b> (o quadrado com a seta para cima)';
  const add = 'Role a lista e toque em <b>Adicionar à Tela de Início</b>';

  if (inApp) {
    return {
      kind: `app-${appName.toLowerCase()}`, openOutside: true, title: `Abra no ${outside} para instalar`,
      steps: [
        `Você está no navegador do ${appName}, que não instala apps.`,
        `Toque nos três pontinhos <b>${isIOS ? '⋯' : '⋮'}</b> no canto de cima e escolha <b>Abrir no navegador</b> (ou <b>Abrir no ${outside}</b>).`,
        `Se não tiver essa opção, toque em <b>Copiar link</b> aqui embaixo e cole no ${outside}.`,
        'Lá, toque em <b>⬇ Instalar</b> de novo.',
      ],
    };
  }
  if (!isIOS) {
    return {
      kind: 'outros', title: 'Instalar no Android',
      steps: [
        'Abra este site no <b>Chrome</b>.',
        'Toque no menu <b>⋮</b> (canto superior direito).',
        'Toque em <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.',
      ],
    };
  }

  const iPad = !/iphone|ipod/i.test(ua);
  const device = iPad ? 'iPad' : 'iPhone';
  const os = ua.match(/OS (\d+)_(\d+)/);
  const iosVer = os ? +os[1] + +os[2] / 10 : 0;
  const safariVer = +(ua.match(/Version\/(\d+)/)?.[1] || 0);
  const browser = /CriOS/.test(ua) ? 'Chrome' : /FxiOS/.test(ua) ? 'Firefox' : /EdgiOS/.test(ua) ? 'Edge'
    : /OPiOS|OPT\//.test(ua) ? 'Opera' : /GSA\//.test(ua) ? 'app do Google' : /Ddg\/|DuckDuckGo/.test(ua) ? 'DuckDuckGo'
    : (/Safari\//.test(ua) && safariVer) ? 'Safari' : 'outro';

  if (browser === 'Safari' && safariVer >= 26) {
    return {
      kind: 'iphone-safari26', title: `Instalar no ${device}`,
      steps: [
        `Toque nos três pontinhos <b>⋯</b> ${iPad ? 'no alto da tela' : 'ao lado do endereço do site, embaixo à direita'}.`,
        `Toque em ${share}.`,
        `${add} (se não aparecer, toque em <b>Ver mais</b>).`,
        'Deixe <b>Abrir como App Web</b> ligado e toque em <b>Adicionar</b>.',
      ],
    };
  }
  if (browser === 'Safari') {
    return {
      kind: 'iphone-safari', title: `Instalar no ${device}`,
      steps: [
        `Toque no botão ${share}, ${iPad ? 'no alto da tela, à direita' : 'na barra de baixo (ou de cima) do Safari'}.`,
        `${add}.`,
        'Toque em <b>Adicionar</b>, no canto de cima.',
      ],
    };
  }
  // Chrome, Edge, Firefox... só instalam no iPhone a partir do iOS 16.4
  if (browser !== 'outro' && iosVer >= 16.4) {
    const first = browser === 'Chrome'
      ? `Toque em ${share}, no alto da tela, ao lado do endereço do site.`
      : `Abra o menu do ${browser} e toque em ${share}.`;
    return {
      kind: `iphone-${browser.toLowerCase().replace(/\s/g, '-')}`, title: `Instalar no ${device}`,
      steps: [
        first,
        `${add} (se não aparecer, toque em <b>Mais</b> ou <b>Editar ações</b>).`,
        'Toque em <b>Adicionar</b>.',
        'Não achou a opção? Abra <b>contadorstrike.app</b> no <b>Safari</b> e instale por lá.',
      ],
    };
  }
  return {
    kind: 'iphone-abrir-safari', openOutside: true, title: 'Abra no Safari para instalar',
    steps: [
      `Neste navegador o ${device} não deixa instalar o app.`,
      'Toque em <b>Copiar link</b> aqui embaixo.',
      'Abra o <b>Safari</b>, cole o link na barra de endereço e abra o site.',
      'Lá, toque em <b>⬇ Instalar</b> de novo.',
    ],
  };
}

// No navegador (sem instalar), entra em tela cheia ao tocar em +1 ou Iniciar.
// Precisa ser no "soltar o dedo": é aí que o navegador libera tela cheia e som.
function goFullscreen() {
  const root = document.documentElement;
  if (isInstalled() || document.fullscreenElement || !root.requestFullscreen) return;
  root.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
}
el.plus.addEventListener('pointerup', goFullscreen);
el.startPause.addEventListener('pointerup', goFullscreen);

// ---------- som e vibração ----------
let audio = null;
function unlockAudio() {
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
  } catch { /* sem áudio */ }
}
document.addEventListener('pointerup', unlockAudio, { capture: true });
document.addEventListener('keydown', unlockAudio, { capture: true });

function beep(freq = 880, ms = 180, times = 1) {
  try {
    if (!audio) return;
    for (let i = 0; i < times; i++) {
      const t = audio.currentTime + i * (ms / 1000 + 0.12);
      const o = audio.createOscillator();
      const g = audio.createGain();
      o.frequency.value = freq;
      g.gain.setValueAtTime(0.25, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + ms / 1000);
      o.connect(g).connect(audio.destination);
      o.start(t);
      o.stop(t + ms / 1000);
    }
  } catch { /* sem áudio */ }
}
// iPhone (Safari) não tem navigator.vibrate. Desde o iOS 18, acionar um
// <input type="checkbox" switch> gera um toque háptico do sistema.
let hapticLabel = null;
function iosTap() {
  if (!hapticLabel) {
    hapticLabel = document.createElement('label');
    hapticLabel.setAttribute('aria-hidden', 'true');
    hapticLabel.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.setAttribute('switch', '');
    input.tabIndex = -1;
    hapticLabel.appendChild(input);
    document.body.appendChild(hapticLabel);
  }
  hapticLabel.click();
}
const canVibrate = typeof navigator.vibrate === 'function';
function vibrate(p) {
  try {
    if (canVibrate) { navigator.vibrate(p); return; }
    // padrão [vibra, pausa, vibra, ...] -> um toque por trecho de vibração
    const parts = Array.isArray(p) ? p : [p];
    let t = 0;
    for (let i = 0; i < parts.length; i += 2) {
      if (t === 0) iosTap(); else setTimeout(iosTap, t);
      t += (parts[i] || 0) + (parts[i + 1] || 0);
    }
  } catch { /* sem vibração */ }
}

// ---------- ações ----------
function plus() {
  const now = Date.now();
  if (s.finished) return;
  let next = L.isRunning(s) ? s : L.start(s, now);
  next = L.addCanto(next, now);
  el.plus.classList.add('pressed');
  setTimeout(() => el.plus.classList.remove('pressed'), 90);
  update(next);
  if (L.justReachedVisto(s)) announceVisto(L.vistos(s).at(-1));
  else vibrate(25);
}

let toastTimer = 0;
function announceVisto(v) {
  el.toastTitle.textContent = `${v.n}º VISTO`;
  el.toastText.textContent = `${v.count} cantos · ${fmtClock(Math.floor(v.ms / 1000))}`;
  el.toast.hidden = false;
  vibrate([400, 100, 400]);
  beep(1175, 160, 2);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.toast.hidden = true; }, 4000);
}
el.toast.addEventListener('pointerdown', () => { el.toast.hidden = true; });

function minus() {
  if (s.events.length === 0) return;
  vibrate([15, 40, 15]);
  update(L.removeCanto(s));
}

function startPause() {
  if (s.finished) return reset();
  const now = Date.now();
  update(L.isRunning(s) ? L.pause(s, now) : L.start(s, now));
}

function reset() {
  if (!L.hasStarted(s)) return;
  el.confirm.returnValue = '';
  el.confirm.showModal();
}
el.confirm.addEventListener('close', () => {
  if (el.confirm.returnValue !== 'ok') return;
  warnedLastMinute = false;
  el.toast.hidden = true;
  update(L.createSession(s.durationMin, s.bird, s.vistoStep));
});

// pointerdown responde na hora (sem esperar o "click"), importante para contar rápido.
el.plus.addEventListener('pointerdown', (e) => { if (e.button === 0) { e.preventDefault(); plus(); } });
el.minus.addEventListener('pointerdown', (e) => { if (e.button === 0) { e.preventDefault(); minus(); } });
el.plus.addEventListener('contextmenu', (e) => e.preventDefault());
el.minus.addEventListener('contextmenu', (e) => e.preventDefault());
el.startPause.addEventListener('click', startPause);
el.reset.addEventListener('click', reset);
el.durations.forEach((b) => b.addEventListener('click', () => update(L.setDuration(s, Number(b.dataset.min)))));
el.vistoSteps.forEach((b) => b.addEventListener('click', () => update(L.setVistoStep(s, Number(b.dataset.step)))));
el.bird.value = s.bird;
el.bird.addEventListener('input', () => update(L.setBird(s, el.bird.value)));
el.bird.addEventListener('keydown', (e) => { if (e.key === 'Enter') el.bird.blur(); });

// Teclado ou controle Bluetooth (passador de slides), se alguém usar.
document.addEventListener('keydown', (e) => {
  if (e.target === el.bird || isTourOpen() || el.confirm.open || el.iosHelp.open || offerDlg.open || pushDlg.open || artDlg.open || e.repeat) return;
  if ([' ', 'Enter', 'ArrowUp', 'ArrowRight', 'PageDown', '+'].includes(e.key)) { e.preventDefault(); plus(); }
  else if (['Backspace', 'ArrowDown', 'ArrowLeft', 'PageUp', '-'].includes(e.key)) { e.preventDefault(); minus(); }
});

// ---------- desenho ----------
const fmtClock = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
const fmtAvg = (v) => (v === null ? '—' : v.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }));

let builtFor = 0;
function buildMinutes() {
  el.minutes.innerHTML = '';
  for (let i = 0; i < s.durationMin; i++) {
    const c = document.createElement('div');
    c.className = 'cell';
    c.innerHTML = `<span class="heat"></span><span class="v" hidden></span><span class="m">${i + 1}º min</span><span class="c">0</span>`;
    el.minutes.append(c);
  }
  builtFor = s.durationMin;
}

let vistoKey = '';
function renderVistos(vs) {
  const missing = L.cantosToNextVisto(s);
  const key = `${s.vistoStep}|${vs.length}|${missing}|${s.finished}`;
  if (key === vistoKey) return;
  vistoKey = key;
  el.vistoSteps.forEach((b) => b.setAttribute('aria-checked', String(Number(b.dataset.step) === s.vistoStep)));
  const chips = vs.map((v) => `<span class="vchip"><b>${v.n}º</b>${fmtClock(Math.floor(v.ms / 1000))}</span>`);
  if (!s.finished) chips.push(`<span class="vchip next">${vs.length + 1}º: faltam ${missing}</span>`);
  if (s.finished && vs.length === 0) chips.push('<span class="vchip next">nenhum visto</span>');
  el.vistoList.innerHTML = chips.join('');
  el.vistoList.scrollLeft = el.vistoList.scrollWidth;
}

function render() {
  const now = Date.now();
  const durMs = s.durationMin * L.MS_MIN;
  const elapsed = L.elapsedMs(s, now);
  const remainingSec = Math.ceil((durMs - elapsed) / 1000);
  const running = L.isRunning(s);
  const started = L.hasStarted(s);
  const cur = L.minuteIndex(s, elapsed);

  el.timer.textContent = fmtClock(remainingSec);
  el.bar.style.width = `${(elapsed / durMs) * 100}%`;
  el.timerCard.classList.toggle('warn', running && remainingSec <= 10);
  el.timerCard.classList.toggle('done', s.finished);
  el.status.textContent = s.finished ? 'Tempo encerrado — resultado final'
    : running ? `Contando · ${cur + 1}º minuto de ${s.durationMin}`
    : started ? 'Pausado' : 'Toque em +1 ou Iniciar para começar';

  const st = L.stats(s, now);
  el.total.textContent = st.total;
  el.avg.textContent = fmtAvg(st.avg);
  el.forecast.textContent = st.forecast ?? '—';
  const provisional = st.provisional && st.forecast !== null;
  el.avgCard.classList.toggle('provisional', provisional);
  el.forecastCard.classList.toggle('provisional', provisional);

  if (builtFor !== s.durationMin) buildMinutes();
  const vs = L.vistos(s);
  renderVistos(vs);
  const vistoByMinute = {};
  for (const v of vs) (vistoByMinute[L.minuteIndex(s, v.ms)] ??= []).push(`V${v.n}`);

  const counts = L.perMinute(s);
  const max = Math.max(1, ...counts);
  [...el.minutes.children].forEach((cell, i) => {
    const badge = cell.querySelector('.v');
    badge.hidden = !vistoByMinute[i];
    badge.textContent = vistoByMinute[i]?.join(' ') ?? '';
    const reached = s.finished || i <= cur;
    cell.querySelector('.c').textContent = reached ? counts[i] : '–';
    cell.querySelector('.heat').style.height = `${(counts[i] / max) * 100}%`;
    cell.classList.toggle('current', !s.finished && started && i === cur);
    cell.classList.toggle('future', !reached || (!started && i === 0));
  });

  el.startPause.textContent = s.finished ? 'Nova roda' : running ? 'Pausar' : started ? 'Continuar' : 'Iniciar';
  el.forecastLabel.textContent = s.finished ? 'Resultado' : 'Previsão';
  el.plus.disabled = s.finished;
  el.minus.disabled = s.events.length === 0;
  el.reset.disabled = !started;
  el.reset.hidden = s.finished;
  shareBtn.hidden = !s.finished;
  el.durations.forEach((b) => {
    b.setAttribute('aria-checked', String(Number(b.dataset.min) === s.durationMin));
    b.disabled = started;
  });
}

// ---------- sugestão de produto ao fim da prova ----------
const OFFERS_SEEN_KEY = 'contador-cantos.anuncios-vistos';
const offerDlg = $('offer');
let offerShown = null;
function showOffer() {
  let seen = {};
  try { seen = JSON.parse(localStorage.getItem(OFFERS_SEEN_KEY)) || {}; } catch { /* sem armazenamento */ }
  const total = s.events.length;
  const p = pickOffer(s.durationMin, total, seen, undefined, undefined, currentSpecies());
  // segurança: só abre links https (evita "javascript:" ou endereços estranhos por engano)
  if (!p || !/^https:\/\//i.test(p.link)) return false;
  offerShown = p;
  seen[p.id] = Date.now();
  try { localStorage.setItem(OFFERS_SEEN_KEY, JSON.stringify(seen)); } catch { /* sem armazenamento */ }

  const hint = tierFor(s.durationMin, total) === 'saude'
    ? 'Pássaro cantando pouco pode estar em muda ou precisando de reforço.'
    : 'Seu pássaro pode render mais!';
  $('offerResult').textContent = `Resultado: ${total} cantos em ${s.durationMin} minutos. ${hint}`;
  $('offerName').textContent = p.name;
  $('offerText').textContent = p.text || '';
  const img = $('offerImg');
  img.hidden = !p.image;
  if (p.image) { img.src = p.image; img.alt = p.name; }
  $('offerLink').href = p.link;
  $('offerLink').textContent = p.cta || 'Ver produto';
  track(`produto-${p.id}-mostrou`);
  // espera o alerta de fim de tempo antes de abrir
  setTimeout(() => { if (!offerDlg.open) offerDlg.showModal(); }, 1500);
  return true;
}
$('offerLink').addEventListener('click', () => {
  if (offerShown) track(`produto-${offerShown.id}-clicou`);
  offerDlg.close();
});

// ---------- arte de resultado ("Monte sua arte") ----------
// Ao tocar em Compartilhar, abre a tela com prévia, tema, espécie e campos opcionais.
// Preferências (tema, espécie, proprietário, plantel, cidade) ficam lembradas no celular.
const ART_KEY = 'contador-cantos.arte';
const shareBtn = $('share');
const artDlg = $('arte');
const artPreview = $('artePreview');
const artInputs = {
  bird: $('arteBird'), especie: $('arteEspecie'), outra: $('arteEspecieOutra'), outraWrap: $('arteOutraWrap'),
  owner: $('arteOwner'), plantel: $('artePlantel'), cidade: $('arteCidade'),
};
const temaBtns = [...document.querySelectorAll('.tema-btn')];
let artPrefs = { tema: 'esmeralda', especie: '', especieOutra: '', owner: '', plantel: '', cidade: '' };
try { artPrefs = { ...artPrefs, ...(JSON.parse(localStorage.getItem(ART_KEY)) || {}) }; } catch { /* sem armazenamento */ }
function saveArtPrefs() {
  try { localStorage.setItem(ART_KEY, JSON.stringify(artPrefs)); } catch { /* sem armazenamento */ }
}
function currentSpecies() {
  return artPrefs.especie === 'Outra' ? String(artPrefs.especieOutra || '').trim() : artPrefs.especie;
}

// opções de espécie
artInputs.especie.innerHTML = '';
for (const [value, label] of [['', 'Escolha a espécie'], ...SPECIES.map((x) => [x, x]), ['Outra', 'Outra…']]) {
  const o = document.createElement('option');
  o.value = value; o.textContent = label;
  artInputs.especie.append(o);
}

function dezCount() {
  return s.events.filter((ms) => ms < 10 * L.MS_MIN).length;
}
function artData() {
  const pm = L.perMinute(s);
  const best = Math.max(0, ...pm);
  return {
    bird: s.bird,
    especie: currentSpecies(),
    durationMin: s.durationMin,
    total: s.events.length,
    dez: s.durationMin === 15 ? dezCount() : null,
    melhorQtd: best,
    melhorMin: pm.indexOf(best) + 1,
    date: new Date().toLocaleDateString('pt-BR'),
    owner: String(artPrefs.owner || '').trim(),
    plantel: String(artPrefs.plantel || '').trim(),
    cidade: String(artPrefs.cidade || '').trim(),
  };
}

let artFile = null;
let artSeq = 0;
let artUrl = '';
let artPending = null;
function refreshArt() {
  const seq = ++artSeq;
  artFile = null;
  artDlg.classList.add('rendering');
  artPending = (async () => {
    try {
      const canvas = await renderArt(artData(), artPrefs.tema);
      const file = await canvasToFile(canvas);
      if (seq !== artSeq) return null;
      artFile = file;
      if (artUrl) URL.revokeObjectURL(artUrl);
      artUrl = URL.createObjectURL(file);
      artPreview.src = artUrl;
      return file;
    } catch { return null; } finally {
      if (seq === artSeq) artDlg.classList.remove('rendering');
    }
  })();
  return artPending;
}
let artTimer = 0;
function scheduleArt() { clearTimeout(artTimer); artTimer = setTimeout(refreshArt, 250); }

function fillArtForm() {
  artInputs.bird.value = s.bird;
  artInputs.especie.value = artPrefs.especie || '';
  artInputs.outra.value = artPrefs.especieOutra || '';
  artInputs.outraWrap.hidden = artPrefs.especie !== 'Outra';
  artInputs.owner.value = artPrefs.owner || '';
  artInputs.plantel.value = artPrefs.plantel || '';
  artInputs.cidade.value = artPrefs.cidade || '';
  temaBtns.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.tema === artPrefs.tema)));
}

temaBtns.forEach((b) => b.addEventListener('click', () => {
  artPrefs.tema = b.dataset.tema;
  temaBtns.forEach((x) => x.setAttribute('aria-checked', String(x === b)));
  saveArtPrefs();
  refreshArt();
}));
artInputs.bird.addEventListener('input', () => {
  update(L.setBird(s, artInputs.bird.value));
  el.bird.value = s.bird;
  scheduleArt();
});
artInputs.especie.addEventListener('change', () => {
  artPrefs.especie = artInputs.especie.value;
  artInputs.outraWrap.hidden = artPrefs.especie !== 'Outra';
  saveArtPrefs();
  refreshArt();
});
for (const [key, input] of [['especieOutra', artInputs.outra], ['owner', artInputs.owner], ['plantel', artInputs.plantel], ['cidade', artInputs.cidade]]) {
  input.addEventListener('input', () => { artPrefs[key] = input.value; saveArtPrefs(); scheduleArt(); });
}
// Enter nos campos não fecha a janela
artDlg.querySelector('form').addEventListener('submit', (e) => {
  if (e.submitter?.value !== 'close') e.preventDefault();
});
artDlg.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.matches('input')) { e.preventDefault(); e.target.blur(); }
});

shareBtn.addEventListener('click', () => {
  track('arte-aberta');
  fillArtForm();
  artDlg.showModal();
  refreshArt();
});

function shareText() {
  const name = s.bird.trim() || 'Meu pássaro';
  const sp = currentSpecies();
  const placar = s.durationMin === 15
    ? `${dezCount()}-${s.events.length} (dez-quinze)`
    : `${s.events.length} cantos em 10 minutos`;
  return `🔥 ${sp ? sp + ' ' : ''}${name}: ${placar}!\nMarcado com o Contador Strike: https://contadorstrike.app`;
}
function downloadFile(file) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url; a.download = file.name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
$('arteShare').addEventListener('click', async () => {
  track(`arte-tema-${artPrefs.tema}`);
  const file = artFile || await artPending;
  const text = shareText();
  try {
    if (file && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], text });
      track('compartilhar-imagem');
    } else if (navigator.share) {
      await navigator.share({ text });
      track('compartilhar-texto');
    } else if (file) {
      downloadFile(file);
      track('compartilhar-download');
    }
  } catch (err) {
    // cancelado pela pessoa: não faz nada; outro erro: baixa a imagem
    if (err?.name !== 'AbortError' && file) downloadFile(file);
  }
});

// ---------- convite para notificações (OneSignal) ----------
// Só pergunta depois de uma roda que NÃO mostrou produto (roda boa), se o aparelho
// aceita notificações, se a pessoa ainda não decidiu e no máximo 1 vez por semana.
// O pedido oficial do celular só aparece se a pessoa tocar em "Quero receber".
const PUSH_ASKED_KEY = 'contador-cantos.push-convite';
const PUSH_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000;
const pushDlg = $('push');
function pushEligible() {
  const OS = window.OneSignalReady;
  if (!OS) return false;
  try {
    if (!OS.Notifications.isPushSupported()) return false;
    if (OS.Notifications.permissionNative !== 'default') return false;
  } catch { return false; }
  let last = 0;
  try { last = Number(localStorage.getItem(PUSH_ASKED_KEY)) || 0; } catch { /* sem armazenamento */ }
  return Date.now() - last > PUSH_INTERVAL_MS;
}
function showPushInvite() {
  if (!pushEligible()) return;
  try { localStorage.setItem(PUSH_ASKED_KEY, String(Date.now())); } catch { /* sem armazenamento */ }
  $('pushResult').textContent = `Boa roda! ${s.events.length} cantos em ${s.durationMin} minutos.`;
  track('push-convite-mostrou');
  setTimeout(() => { if (!pushDlg.open && !offerDlg.open) pushDlg.showModal(); }, 1500);
}
$('pushYes').addEventListener('click', () => {
  track('push-convite-sim');
  pushDlg.close();
  const OS = window.OneSignalReady;
  if (!OS) return;
  // precisa ser chamado direto no toque (exigência do iPhone)
  OS.Notifications.requestPermission()
    .then(() => { if (OS.Notifications.permission) track('push-permitiu'); else track('push-negou'); })
    .catch(() => {});
});
$('pushNo').addEventListener('click', () => { track('push-convite-agora-nao'); pushDlg.close(); });

function loop() {
  const now = Date.now();
  const next = L.tick(s, now);
  if (next !== s) {
    s = next;
    save();
    vibrate([300, 120, 300, 120, 300]);
    beep(660, 350, 3);
    if (s.finished && !showOffer()) showPushInvite();
  } else if (L.isRunning(s) && !warnedLastMinute && s.durationMin * L.MS_MIN - L.elapsedMs(s, now) <= L.MS_MIN) {
    warnedLastMinute = true;
    vibrate([120, 80, 120]);
    beep(990, 120, 2);
  }
  render();
}

render();
keepScreenOn();
setInterval(loop, 200);

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  // Quando uma versão nova do app assume, recarrega uma vez (a contagem fica salva).
  const hadController = !!navigator.serviceWorker.controller;
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloaded) return;
    reloaded = true;
    location.reload();
  });
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })
    .then((reg) => reg.update())
    .catch(() => {});
}

// ---------- guia de primeiro uso ----------
$('help').addEventListener('click', () => startTour(track));
// Abre sozinho só para quem nunca viu e não tem roda em andamento.
if (!tourSeen() && !L.hasStarted(s)) {
  setTimeout(() => {
    const anyOpen = [...document.querySelectorAll('dialog')].some((d) => d.open);
    if (!anyOpen && !isTourOpen() && !L.hasStarted(s)) startTour(track);
  }, 700);
}

// ---------- bloqueios: menu do botão direito, F12 e atalhos de inspeção ----------
document.addEventListener('contextmenu', (e) => {
  if (!e.target.closest('input, textarea')) e.preventDefault();
});
document.addEventListener('keydown', (e) => {
  const k = e.key.toUpperCase();
  const ctrl = e.ctrlKey || e.metaKey;
  if (
    k === 'F12' ||
    (ctrl && e.shiftKey && ['I', 'J', 'C'].includes(k)) ||
    (ctrl && e.altKey && ['I', 'J', 'C'].includes(k)) ||
    (ctrl && k === 'U')
  ) e.preventDefault();
});
