// Desenhos simples das telas do celular para o passo a passo de instalação.
// O que a pessoa deve tocar fica com um contorno amarelo piscando (classe "hi").
// Cores vêm do styles.css (.ilu ...), então funcionam no tema claro e no escuro.

const shareIcon = (x, y) => `<g class="ic" transform="translate(${x - 9} ${y - 11})">`
  + '<path d="M6 8H3v12h12V8h-3"/><path d="M9 14V1M5 5l4-4 4 4"/></g>';
const addIcon = (x, y) => `<g class="ic" transform="translate(${x - 9} ${y - 9})">`
  + '<rect x="1" y="1" width="16" height="16" rx="4"/><path d="M9 5v8M5 9h8"/></g>';
const dots = (x, y, vertical = false) => [-7, 0, 7]
  .map((d) => `<circle class="dot" cx="${vertical ? x : x + d}" cy="${vertical ? y + d : y}" r="2.3"/>`).join('');
const hiCircle = (x, y, r) => `<circle class="hi" cx="${x}" cy="${y}" r="${r}"/>`;
const hiRect = (x, y, w, h, r = 10) => `<rect class="hi" x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`;
const svg = (h, body) => `<svg class="ilu" viewBox="0 0 260 ${h}" aria-hidden="true">${body}</svg>`;
const urlPill = (w = 182) => `<rect class="pill" x="12" y="10" width="${w}" height="34" rx="17"/>`
  + `<text x="${12 + w / 2}" y="32" text-anchor="middle" class="url">contadorstrike.app</text>`;
const menu = (rows) => svg(16 + rows.length * 38,
  '<rect class="card" x="1" y="1" width="258" height="' + (14 + rows.length * 38) + '" rx="14"/>'
  + rows.map(([label, on, icon], i) => {
    const y = 8 + i * 38;
    return (i ? `<line class="sep" x1="16" y1="${y}" x2="244" y2="${y}"/>` : '')
      + `<text x="18" y="${y + 24}" class="${on ? 'strong' : 'dim'}">${label}</text>`
      + (icon === 'share' ? shareIcon(236, y + 19) : icon === 'add' ? addIcon(236, y + 19) : '')
      + (on ? hiRect(6, y + 2, 248, 34) : '');
  }).join(''));

const ART = {
  // Safari 26: barra de baixo com o endereço e o botão ⋯
  bar26: () => svg(54, '<rect class="bar" width="260" height="54" rx="14"/>' + urlPill()
    + '<circle class="pill" cx="226" cy="27" r="17"/>' + dots(226, 27) + hiCircle(226, 27, 22)),
  menuShare: () => menu([['Compartilhar', true, 'share'], ['Adicionar aos Favoritos']]),
  sheetAdd: () => menu([['Copiar'], ['Adicionar à Tela de Início', true, 'add']]),
  confirm26: () => svg(96, '<rect class="card" x="1" y="1" width="258" height="94" rx="14"/>'
    + '<text x="16" y="30" class="dim">Cancelar</text><text x="242" y="30" text-anchor="end" class="link">Adicionar</text>'
    + hiRect(160, 9, 92, 30)
    + '<line class="sep" x1="16" y1="48" x2="244" y2="48"/>'
    + '<text x="16" y="76" class="strong">Abrir como App Web</text>'
    + '<rect class="on" x="198" y="60" width="46" height="26" rx="13"/><circle class="knob" cx="231" cy="73" r="10"/>'),
  confirm: () => svg(48, '<rect class="card" x="1" y="1" width="258" height="46" rx="14"/>'
    + '<text x="16" y="30" class="dim">Cancelar</text><text x="242" y="30" text-anchor="end" class="link">Adicionar</text>'
    + hiRect(160, 9, 92, 30)),
  // Safari antigo: barra de ferramentas embaixo com o Compartilhar no meio
  barOld: () => svg(52, '<rect class="bar" width="260" height="52" rx="14"/>'
    + '<g class="ic"><path d="M34 18l-8 8 8 8"/><path d="M78 18l8 8-8 8"/>'
    + '<path d="M172 17h10a4 4 0 014 4v15a3 3 0 00-3-3h-11z"/><rect x="216" y="18" width="14" height="14" rx="3"/><path d="M220 14h12a3 3 0 013 3v12"/></g>'
    + shareIcon(130, 27) + hiCircle(130, 26, 19)),
  // endereço em cima com o Compartilhar dentro (Chrome no iPhone, Safari no iPad)
  topShare: () => svg(54, '<rect class="bar" width="260" height="54" rx="14"/>' + urlPill(236)
    + shareIcon(226, 27) + hiCircle(226, 27, 19)),
  inappDots: () => svg(52, '<rect class="bar" width="260" height="52" rx="14"/>'
    + '<g class="ic"><path d="M18 20l12 12M30 20L18 32"/></g>'
    + '<text x="130" y="31" text-anchor="middle" class="url">contadorstrike.app</text>'
    + dots(234, 26) + hiCircle(234, 26, 19)),
  inappOpen: () => menu([['Abrir no navegador', true], ['Copiar link']]),
  androidDots: () => svg(54, '<rect class="bar" width="260" height="54" rx="14"/>' + urlPill(206)
    + dots(240, 27, true) + hiCircle(240, 27, 18)),
  androidInstall: () => menu([['Nova guia'], ['Instalar app', true]]),
  safariUrl: () => svg(54, '<rect class="bar" width="260" height="54" rx="14"/>' + urlPill(236)
    + hiRect(8, 6, 244, 42, 21)),
  installBtn: () => svg(50, '<rect class="accent" x="80" y="9" width="100" height="32" rx="16"/>'
    + '<text x="130" y="30" text-anchor="middle" class="accent-ink">⬇ Instalar</text>' + hiRect(74, 3, 112, 44, 22)),
};

/** @param {keyof typeof ART} name */
export function ilu(name) {
  return ART[name] ? ART[name]() : '';
}
