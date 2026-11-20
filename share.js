// Gera a imagem de resultado para compartilhar (1080x1350, bom para WhatsApp e Instagram).
// Tudo é desenhado no próprio celular, sem enviar nada para servidor.

const W = 1080;
const H = 1350;
const C = {
  bg: '#0b1f1d', surface: '#12302d', line: '#2a5651', text: '#f1f7f5',
  muted: '#9dbdb7', brand: '#2bb39a', accent: '#f2c14e', accentInk: '#2b1d00',
};
const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

let logoPromise = null;
function loadLogo() {
  if (!logoPromise) {
    logoPromise = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = 'icon-512.png';
    });
  }
  return logoPromise;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Diminui a fonte até o texto caber na largura.
function fitFont(ctx, text, weight, maxSize, maxWidth) {
  let size = maxSize;
  do {
    ctx.font = `${weight} ${size}px ${FONT}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 4;
  } while (size > 24);
  return size;
}

const clock = (ms) => {
  const sec = Math.floor(ms / 1000);
  return `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
};

/**
 * @param {{bird:string,total:number,durationMin:number,avg:number,vistos:{n:number,ms:number}[],
 *          vistoStep:number,perMinute:number[],date:Date}} d
 * @returns {Promise<Blob>}
 */
export async function renderShareImage(d) {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  const pad = 72;

  // fundo
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 420, 40, W / 2, 420, 620);
  glow.addColorStop(0, 'rgba(43,179,154,0.22)');
  glow.addColorStop(1, 'rgba(43,179,154,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // cabeçalho: logo + marca + data
  const logo = await loadLogo();
  if (logo) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(pad + 60, 120, 60, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logo, pad, 60, 120, 120);
    ctx.restore();
  }
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = C.text;
  ctx.font = `800 46px ${FONT}`;
  ctx.fillText('Contador Strike', pad + 144, 112);
  ctx.fillStyle = C.muted;
  ctx.font = `600 30px ${FONT}`;
  ctx.fillText('CRIATÓRIO STRIKE', pad + 144, 156);
  ctx.textAlign = 'right';
  ctx.font = `500 30px ${FONT}`;
  ctx.fillText(d.date.toLocaleDateString('pt-BR'), W - pad, 112);
  ctx.textAlign = 'left';

  // nome do pássaro
  const name = (d.bird || '').trim() || 'Meu pássaro';
  ctx.fillStyle = C.text;
  const nameSize = fitFont(ctx, name, 800, 76, W - pad * 2);
  ctx.font = `800 ${nameSize}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.fillText(name, W / 2, 285);

  // número grande
  ctx.fillStyle = C.brand;
  const totalTxt = String(d.total);
  const bigSize = fitFont(ctx, totalTxt, 900, 290, W - pad * 2);
  ctx.font = `900 ${bigSize}px ${FONT}`;
  ctx.fillText(totalTxt, W / 2, 560);
  ctx.fillStyle = C.text;
  ctx.font = `700 50px ${FONT}`;
  ctx.fillText(`cantos em ${d.durationMin} minutos`, W / 2, 632);

  // destaque: melhor minuto
  const best = Math.max(0, ...d.perMinute);
  const bestIdx = best > 0 ? d.perMinute.indexOf(best) : -1;
  if (bestIdx >= 0) {
    const txt = `⚡ Melhor minuto: ${best} cantos (${bestIdx + 1}º min)`;
    const fs = fitFont(ctx, txt, 800, 36, W - pad * 2 - 80);
    ctx.font = `800 ${fs}px ${FONT}`;
    const pw = ctx.measureText(txt).width + 64;
    const px = (W - pw) / 2;
    roundRect(ctx, px, 662, pw, 64, 32);
    ctx.fillStyle = 'rgba(242,193,78,0.14)';
    ctx.fill();
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = C.accent;
    ctx.fillText(txt, W / 2, 706);
  }
  ctx.textAlign = 'left';

  // cartões: média e vistos
  const cardY = 760;
  const cardH = 140;
  const gap = 24;
  const cardW = (W - pad * 2 - gap) / 2;
  const first = d.vistos[0];
  const cards = [
    { label: 'MÉDIA POR MINUTO', value: d.avg.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }), accent: false },
    {
      label: `VISTOS (A CADA ${d.vistoStep})`,
      value: d.vistos.length ? `${d.vistos.length}  ·  1º ${clock(first.ms)}` : 'nenhum',
      accent: true,
    },
  ];
  cards.forEach((c, i) => {
    const x = pad + i * (cardW + gap);
    roundRect(ctx, x, cardY, cardW, cardH, 28);
    ctx.fillStyle = c.accent ? C.accent : C.surface;
    ctx.fill();
    if (!c.accent) { ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke(); }
    ctx.textAlign = 'center';
    ctx.fillStyle = c.accent ? C.accentInk : C.muted;
    ctx.font = `700 26px ${FONT}`;
    ctx.fillText(c.label, x + cardW / 2, cardY + 50);
    ctx.fillStyle = c.accent ? C.accentInk : C.text;
    const vs = fitFont(ctx, c.value, 800, 56, cardW - 40);
    ctx.font = `800 ${vs}px ${FONT}`;
    ctx.fillText(c.value, x + cardW / 2, cardY + 112);
  });
  ctx.textAlign = 'left';

  // gráfico minuto a minuto
  const chartTop = 962;
  const chartH = 180;
  const n = d.perMinute.length;
  const bGap = n > 10 ? 10 : 14;
  const bW = (W - pad * 2 - bGap * (n - 1)) / n;
  const max = Math.max(1, ...d.perMinute);
  ctx.fillStyle = C.muted;
  ctx.font = `700 24px ${FONT}`;
  ctx.fillText('CANTOS POR MINUTO', pad, chartTop - 18);
  d.perMinute.forEach((v, i) => {
    const x = pad + i * (bW + bGap);
    const h = Math.max(6, (v / max) * (chartH - 40));
    const y = chartTop + (chartH - 40) - h;
    roundRect(ctx, x, chartTop, bW, chartH - 40, 10);
    ctx.fillStyle = C.surface;
    ctx.fill();
    roundRect(ctx, x, y, bW, h, 10);
    ctx.fillStyle = i === bestIdx ? C.accent : C.brand;
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.fillStyle = C.muted;
    ctx.font = `600 ${n > 10 ? 20 : 24}px ${FONT}`;
    ctx.fillText(String(i + 1), x + bW / 2, chartTop + chartH - 6);
  });
  ctx.textAlign = 'left';

  // rodapé: chamada para baixar
  const footY = 1190;
  roundRect(ctx, pad, footY, W - pad * 2, 100, 26);
  ctx.fillStyle = C.surface;
  ctx.fill();
  ctx.textAlign = 'center';
  ctx.fillStyle = C.muted;
  ctx.font = `600 28px ${FONT}`;
  ctx.fillText('Conte os cantos do seu pássaro grátis:', W / 2, footY + 42);
  ctx.fillStyle = C.accent;
  ctx.font = `800 38px ${FONT}`;
  ctx.fillText('contadorstrike.app', W / 2, footY + 84);

  return new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('sem imagem'))), 'image/png');
  });
}
