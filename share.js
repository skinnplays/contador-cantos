// Arte de resultado no estilo das artes de torneio (1080x1350), com 4 temas.
// Tudo é desenhado no próprio celular, sem enviar nada para servidor.
// Fonte: Anton (Google Fonts, licença OFL), hospedada no próprio site.

const W = 1080;
const H = 1350;
const DISPLAY = '"Anton", "Arial Black", Impact, system-ui, sans-serif';
const BODY = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export const THEMES = {
  ouro: {
    nome: 'Ouro',
    bg: ['#2a1a00', '#0d0800', '#000000'], ray: 'rgba(255, 196, 61, 0.10)', glow: '#ffc53d',
    metal: ['#fff8d6', '#ffd75e', '#c98a0b', '#fff1a6', '#8a5a00'], outline: '#2a1800',
    score: ['#ffffff', '#f3f3f3', '#9a9a9a', '#ffffff', '#5a5a5a'], scoreOutline: '#1a1206',
    ribbon: ['#ffd75e', '#b8860b'], ribbonInk: '#2a1800', accent: ['#ffe58a', '#b8860b'], spark: '#ffe08a',
  },
  esmeralda: {
    nome: 'Esmeralda',
    bg: ['#0e5a2c', '#03200f', '#000a04'], ray: 'rgba(80, 255, 140, 0.10)', glow: '#3dff7a',
    metal: ['#eafff0', '#5cff93', '#0e8f45', '#b9ffd0', '#04461f'], outline: '#021a0b',
    score: ['#ffffff', '#e9f2ec', '#8c9a91', '#ffffff', '#4a554e'], scoreOutline: '#021a0b',
    ribbon: ['#ffd75e', '#b8860b'], ribbonInk: '#2a1800', accent: ['#ffe58a', '#b8860b'], spark: '#9dffbf',
  },
  prata: {
    nome: 'Prata',
    bg: ['#2b3a4d', '#0d141d', '#000000'], ray: 'rgba(170, 210, 255, 0.10)', glow: '#9fd0ff',
    metal: ['#ffffff', '#dfe6ee', '#7b8794', '#f7f9fb', '#3d4651'], outline: '#0b1118',
    score: ['#fff8d6', '#ffd75e', '#c98a0b', '#fff1a6', '#8a5a00'], scoreOutline: '#1a1206',
    ribbon: ['#e8eef5', '#7b8794'], ribbonInk: '#0b1118', accent: ['#f2f5f8', '#7b8794'], spark: '#d6ecff',
  },
  fogo: {
    nome: 'Fogo',
    bg: ['#7a1500', '#260500', '#000000'], ray: 'rgba(255, 110, 40, 0.12)', glow: '#ff6a1a',
    metal: ['#fff6c9', '#ffc53d', '#ff6a1a', '#ffe08a', '#8f1d00'], outline: '#200400',
    score: ['#ffffff', '#f3f3f3', '#9a9a9a', '#ffffff', '#5a5a5a'], scoreOutline: '#200400',
    ribbon: ['#ff8a3d', '#b52a00'], ribbonInk: '#ffffff', accent: ['#ffd36e', '#c2410c'], spark: '#ffb27a',
  },
};

let fontReady = null;
function loadFont() {
  if (!fontReady) {
    fontReady = (async () => {
      try {
        const f = new FontFace('Anton', 'url(anton-latin.woff2)');
        await f.load();
        document.fonts.add(f);
      } catch { /* sem a fonte: usa a do sistema */ }
    })();
  }
  return fontReady;
}

function metalGrad(ctx, y0, y1, stops) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  [0, 0.38, 0.52, 0.7, 1].forEach((p, i) => g.addColorStop(p, stops[i]));
  return g;
}

// Texto metálico: brilho + contorno grosso + sombra 3D + borda clara + gradiente.
function metalText(ctx, text, cx, base, maxW, maxSize, stops, outline, glow, skew = -0.12) {
  let size = maxSize;
  ctx.font = `${size}px ${DISPLAY}`;
  while (ctx.measureText(text).width > maxW && size > 40) { size -= 4; ctx.font = `${size}px ${DISPLAY}`; }
  ctx.save();
  ctx.translate(cx, base);
  ctx.transform(1, 0, skew, 1, 0, 0);
  ctx.textAlign = 'center';
  ctx.lineJoin = 'round';
  ctx.shadowColor = glow; ctx.shadowBlur = 40;
  ctx.lineWidth = size * 0.16; ctx.strokeStyle = outline; ctx.strokeText(text, 0, 0);
  ctx.shadowBlur = 0;
  for (let i = 8; i > 0; i--) { ctx.fillStyle = outline; ctx.fillText(text, i * 0.9, i * 1.4); }
  ctx.lineWidth = size * 0.05; ctx.strokeStyle = stops[0]; ctx.strokeText(text, 0, 0);
  ctx.fillStyle = metalGrad(ctx, -size * 0.82, 0, stops);
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

function rays(ctx, cx, cy, color) {
  ctx.save(); ctx.translate(cx, cy); ctx.fillStyle = color;
  const n = 22;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 1600, a, a + (Math.PI / n) * 0.9); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function sparkles(ctx, color) {
  let s = 7;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  ctx.save();
  for (let i = 0; i < 90; i++) {
    const x = rnd() * W, y = rnd() * H, r = rnd() * 2.6 + 0.6;
    ctx.globalAlpha = rnd() * 0.7 + 0.2; ctx.shadowColor = color; ctx.shadowBlur = 10; ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}

function crown(ctx, cx, cy, w, colors) {
  ctx.save();
  const h = w * 0.55;
  const g = ctx.createLinearGradient(0, cy - h, 0, cy);
  g.addColorStop(0, colors[0]); g.addColorStop(1, colors[1]);
  ctx.fillStyle = g; ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = 4;
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, cy); ctx.lineTo(cx - w / 2, cy - h * 0.55); ctx.lineTo(cx - w / 4, cy - h * 0.25);
  ctx.lineTo(cx, cy - h); ctx.lineTo(cx + w / 4, cy - h * 0.25); ctx.lineTo(cx + w / 2, cy - h * 0.55);
  ctx.lineTo(cx + w / 2, cy); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;
  for (const [x, y] of [[cx - w / 2, cy - h * 0.55], [cx, cy - h], [cx + w / 2, cy - h * 0.55]]) {
    ctx.beginPath(); ctx.arc(x, y, w * 0.07, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

function ribbon(ctx, text, cy, colors, ink) {
  ctx.save();
  let size = 44;
  ctx.font = `${size}px ${DISPLAY}`;
  while (ctx.measureText(text).width > W - 260 && size > 24) { size -= 2; ctx.font = `${size}px ${DISPLAY}`; }
  const w = Math.min(W - 120, ctx.measureText(text).width + 120), h = 74, x = (W - w) / 2, y = cy - h / 2;
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, colors[0]); g.addColorStop(1, colors[1]);
  ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 16; ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(x + 24, y); ctx.lineTo(x + w - 24, y); ctx.lineTo(x + w, y + h / 2); ctx.lineTo(x + w - 24, y + h);
  ctx.lineTo(x + 24, y + h); ctx.lineTo(x, y + h / 2); ctx.closePath(); ctx.fill();
  ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, W / 2, cy + 2);
  ctx.restore();
}

// Texto simples centralizado que diminui até caber.
function fitCenter(ctx, text, y, maxSize, color, maxW = W - 120) {
  let size = maxSize;
  ctx.font = `${size}px ${DISPLAY}`;
  while (ctx.measureText(text).width > maxW && size > 18) { size -= 2; ctx.font = `${size}px ${DISPLAY}`; }
  ctx.fillStyle = color;
  ctx.fillText(text, W / 2, y);
}

/**
 * Dados da roda + campos opcionais da arte.
 * @param {{bird:string, especie?:string, durationMin:number, total:number, dez?:number|null,
 *          melhorMin:number, melhorQtd:number, date:string, owner?:string, plantel?:string, cidade?:string}} d
 * @param {keyof THEMES} themeKey
 * @returns {Promise<HTMLCanvasElement>}
 */
export async function renderArt(d, themeKey = 'esmeralda') {
  const t = THEMES[themeKey] || THEMES.esmeralda;
  await loadFont();
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');

  // fundo: gradiente + raios + brilhos + vinheta
  const bg = ctx.createRadialGradient(W / 2, 600, 60, W / 2, 640, 1100);
  bg.addColorStop(0, t.bg[0]); bg.addColorStop(0.55, t.bg[1]); bg.addColorStop(1, t.bg[2]);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  rays(ctx, W / 2, 600, t.ray);
  sparkles(ctx, t.spark);
  const vg = ctx.createRadialGradient(W / 2, H / 2, 400, W / 2, H / 2, 900);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.65)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

  // data
  ctx.save(); ctx.font = `34px ${DISPLAY}`; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 8; ctx.fillText(d.date, W / 2, 96); ctx.restore();

  // coroa
  crown(ctx, W / 2, 270, 210, t.accent);

  // espécie (opcional) entre estrelas
  if (d.especie) {
    ctx.save(); ctx.textAlign = 'center'; ctx.shadowColor = 'rgba(0,0,0,.85)'; ctx.shadowBlur = 10;
    const sp = d.especie.toUpperCase().split('').join(' ');
    fitCenter(ctx, `★   ${sp}   ★`, 365, 46, '#ffffff');
    ctx.restore();
  }

  // nome
  const name = (d.bird || '').trim() || 'MEU PÁSSARO';
  metalText(ctx, name.toUpperCase(), W / 2, 655, W - 100, 215, t.metal, t.outline, t.glow);

  // placar: "dez-quinze" nas rodas de 15 min, total nas de 10
  const dezQuinze = d.durationMin === 15 && d.dez != null;
  metalText(ctx, dezQuinze ? `${d.dez}-${d.total}` : `${d.total}`, W / 2, 905, W - 120, 235,
    t.score, t.scoreOutline, 'rgba(0,0,0,.8)', -0.08);
  ctx.save(); ctx.font = `38px ${DISPLAY}`; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
  ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 8;
  if (dezQuinze) { ctx.fillText('NOS DEZ', W / 2 - 260, 962); ctx.fillText('NOS QUINZE', W / 2 + 260, 962); }
  else ctx.fillText(`CANTOS EM ${d.durationMin} MINUTOS`, W / 2, 962);
  ctx.restore();

  // melhor minuto
  if (d.melhorQtd > 0) {
    ribbon(ctx, `⚡ MELHOR MINUTO: ${d.melhorQtd} CANTOS (${d.melhorMin}º MIN)`, 1055, t.ribbon, t.ribbonInk);
  }

  // proprietário / plantel / cidade (opcionais)
  ctx.save(); ctx.textAlign = 'center'; ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 8;
  const linha1 = [d.owner && `PROPRIETÁRIO: ${d.owner}`, d.plantel].filter(Boolean).join('  •  ').toUpperCase();
  if (linha1) fitCenter(ctx, linha1, 1150, 40, t.accent[0]);
  if (d.cidade) fitCenter(ctx, d.cidade.toUpperCase(), 1198, 32, '#ffffff');
  ctx.restore();

  // rodapé
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, H - 64, W, 64);
  ctx.font = `600 28px ${BODY}`; ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.textAlign = 'center';
  ctx.fillText('Marcado com o Contador Strike  •  contadorstrike.app', W / 2, H - 22); ctx.restore();

  return c;
}

export function canvasToFile(canvas, name = 'contador-strike-arte.jpg') {
  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(new File([b], name, { type: 'image/jpeg' })) : reject(new Error('sem imagem'))),
      'image/jpeg', 0.92);
  });
}
