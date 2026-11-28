// Histórico de rodas por pássaro, guardado só neste celular (localStorage).
// Regras puras (sem tela), testáveis em Node.

export const HISTORY_KEY = 'contador-cantos.historico';
export const MAX_ROUNDS = 2000;

/** "Marechal LMD", "marechal  lmd " e "MARÉCHAL LMD" são o mesmo pássaro. */
export function birdKey(name) {
  return String(name || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/\s+/g, ' ').trim();
}

export function emptyHistory() { return { v: 1, rounds: [] }; }

export function parseHistory(text) {
  try {
    const o = JSON.parse(text);
    if (o && o.v === 1 && Array.isArray(o.rounds)) return { v: 1, rounds: o.rounds.filter(isRound) };
  } catch { /* vazio ou estragado */ }
  return emptyHistory();
}

function isRound(r) {
  return !!r && typeof r.id === 'string' && typeof r.bird === 'string' && typeof r.key === 'string'
    && Number.isFinite(r.at) && (r.durationMin === 10 || r.durationMin === 15)
    && Number.isInteger(r.total) && r.total >= 0
    && Array.isArray(r.perMinute) && Array.isArray(r.vistos);
}

/** Registro de uma roda encerrada (só o resumo: total, por minuto e os vistos). */
export function roundFromSession(s, at, perMinute, vistos) {
  const key = birdKey(s.bird);
  if (!s.finished || !key || s.events.length === 0) return null;
  const ev = s.events;
  return {
    // a mesma roda nunca entra duas vezes (o app pode reabrir já encerrado)
    id: `${key}|${s.durationMin}|${ev.length}|${ev[0]}|${ev[ev.length - 1]}`,
    bird: s.bird.trim(), key, at, durationMin: s.durationMin, total: ev.length,
    perMinute, vistoStep: s.vistoStep, vistos: vistos.map((v) => v.ms),
  };
}

export function addRound(h, r) {
  if (!r || h.rounds.some((x) => x.id === r.id)) return h;
  return { ...h, rounds: [...h.rounds, r].slice(-MAX_ROUNDS) };
}

// a mesma roda, qualquer que seja o nome (id = "<ave>|<assinatura da roda>")
const sigOf = (id) => id.split('|').slice(-4).join('|');

/** Salva a roda; se ela já estava salva com outro nome (nome digitado/corrigido depois), troca o nome. */
export function upsertRound(h, r) {
  if (!r) return h;
  const sig = sigOf(r.id);
  const old = h.rounds.find((x) => sigOf(x.id) === sig);
  if (old && old.id === r.id) return h;
  const rest = h.rounds.filter((x) => sigOf(x.id) !== sig);
  return { ...h, rounds: [...rest, old ? { ...r, at: old.at } : r].slice(-MAX_ROUNDS) };
}

export function removeRound(h, id) { return { ...h, rounds: h.rounds.filter((r) => r.id !== id) }; }
export function removeBird(h, key) { return { ...h, rounds: h.rounds.filter((r) => r.key !== key) }; }

/** Rodas do pássaro, da mais nova para a mais antiga. */
export function roundsOf(h, name) {
  const key = birdKey(name);
  return key ? h.rounds.filter((r) => r.key === key).sort((a, b) => b.at - a.at) : [];
}

/** Recorde e média por tempo de roda (10 com 10, 15 com 15). `except` = roda que não entra na conta. */
export function summary(rounds, except = null) {
  const by = {};
  for (const r of rounds) {
    if (r.id === except) continue;
    const d = (by[r.durationMin] ??= { count: 0, best: 0, sum: 0 });
    d.count++; d.sum += r.total; d.best = Math.max(d.best, r.total);
  }
  for (const d of Object.values(by)) d.avg = Math.round(d.sum / d.count);
  return by;
}

/** Nomes já usados (o mais recente de cada pássaro), para sugerir ao digitar. */
export function knownBirds(h) {
  const seen = new Map();
  for (const r of [...h.rounds].sort((a, b) => b.at - a.at)) if (!seen.has(r.key)) seen.set(r.key, r.bird);
  return [...seen.values()];
}

/** Uma linha por ave (para a lista do botão Histórico), da usada mais recentemente para a mais antiga. */
export function birdsList(h) {
  const by = new Map();
  for (const r of h.rounds) {
    const b = by.get(r.key) ?? { key: r.key, bird: r.bird, count: 0, last: 0, best: {} };
    b.count++;
    if (r.at >= b.last) { b.last = r.at; b.bird = r.bird; }
    b.best[r.durationMin] = Math.max(b.best[r.durationMin] ?? 0, r.total);
    by.set(r.key, b);
  }
  return [...by.values()].sort((a, b) => b.last - a.last);
}

/** Rodas pela chave já normalizada. */
export function roundsByKey(h, key) {
  return h.rounds.filter((r) => r.key === key).sort((a, b) => b.at - a.at);
}

/** Como a roda que acabou de terminar se compara com as anteriores do mesmo tempo. */
export function compare(rounds, r) {
  const prev = summary(rounds, r.id)[r.durationMin];
  if (!prev) return { kind: 'first' };
  if (r.total > prev.best) return { kind: 'record', before: prev.best };
  return { kind: 'avg', diff: r.total - prev.avg, avg: prev.avg };
}
