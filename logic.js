// Regras do contador, sem dependência de tela (testáveis em Node).
// A sessão guarda o momento de cada canto (ms desde o início da prova),
// assim "−1" desfaz exatamente o último toque e a tabela por minuto é derivada.

export const MS_MIN = 60_000;
export const DURATIONS = [10, 15];

export const VISTO_STEPS = [50, 60];

export function createSession(durationMin = 15, bird = '', vistoStep = 50) {
  return { durationMin, bird, vistoStep, events: [], elapsedBefore: 0, startedAt: null, finished: false };
}

export function isValid(o) {
  return !!o && typeof o === 'object'
    && DURATIONS.includes(o.durationMin)
    && (o.vistoStep === undefined || VISTO_STEPS.includes(o.vistoStep))
    && typeof o.bird === 'string'
    && Array.isArray(o.events) && o.events.every((e) => Number.isFinite(e) && e >= 0)
    && Number.isFinite(o.elapsedBefore) && o.elapsedBefore >= 0
    && (o.startedAt === null || Number.isFinite(o.startedAt))
    && typeof o.finished === 'boolean';
}

const durationMs = (s) => s.durationMin * MS_MIN;

export const isRunning = (s) => s.startedAt !== null;

export function elapsedMs(s, now) {
  const e = s.elapsedBefore + (s.startedAt !== null ? Math.max(0, now - s.startedAt) : 0);
  return Math.min(e, durationMs(s));
}

export const hasStarted = (s) => s.elapsedBefore > 0 || s.startedAt !== null || s.events.length > 0;

export function start(s, now) {
  if (s.finished || s.startedAt !== null) return s;
  return { ...s, startedAt: now };
}

export function pause(s, now) {
  if (s.startedAt === null) return s;
  return { ...s, elapsedBefore: elapsedMs(s, now), startedAt: null };
}

// Encerra a sessão quando o tempo acaba.
export function tick(s, now) {
  if (s.startedAt !== null && elapsedMs(s, now) >= durationMs(s)) {
    return { ...s, elapsedBefore: durationMs(s), startedAt: null, finished: true };
  }
  return s;
}

export function addCanto(s, now) {
  if (s.finished) return s;
  return { ...s, events: [...s.events, elapsedMs(s, now)] };
}

export function removeCanto(s) {
  if (s.events.length === 0) return s;
  return { ...s, events: s.events.slice(0, -1) };
}

export function setDuration(s, durationMin) {
  if (!DURATIONS.includes(durationMin) || hasStarted(s)) return s;
  return { ...s, durationMin };
}

// Sessões salvas antes dos vistos existirem não têm vistoStep.
export function normalize(o) {
  return VISTO_STEPS.includes(o.vistoStep) ? o : { ...o, vistoStep: 50 };
}

export function setVistoStep(s, vistoStep) {
  if (!VISTO_STEPS.includes(vistoStep)) return s;
  return { ...s, vistoStep };
}

// Cada visto = o canto de número step, 2×step, 3×step… e o tempo de prova em que ele aconteceu.
export function vistos(s) {
  const out = [];
  for (let n = 1; n * s.vistoStep <= s.events.length; n++) {
    out.push({ n, count: n * s.vistoStep, ms: s.events[n * s.vistoStep - 1] });
  }
  return out;
}

export function cantosToNextVisto(s) {
  return s.vistoStep - (s.events.length % s.vistoStep);
}

// true quando o último canto registrado completou um visto.
export function justReachedVisto(s) {
  return s.events.length > 0 && s.events.length % s.vistoStep === 0;
}

export function setBird(s, bird) {
  return { ...s, bird: String(bird).slice(0, 40) };
}

export function minuteIndex(s, ms) {
  return Math.min(Math.floor(ms / MS_MIN), s.durationMin - 1);
}

export function perMinute(s) {
  const arr = new Array(s.durationMin).fill(0);
  for (const e of s.events) arr[minuteIndex(s, e)] += 1;
  return arr;
}

// Antes de 30 s a estimativa é "inicial" (mostrada em cinza na tela), porque oscila muito.
export const MIN_ELAPSED_FOR_ESTIMATE = 30_000;
// Nos primeiros segundos, divide por no mínimo 10 s para evitar previsões absurdas
// (ex.: 2 cantos em 1 s virariam 1.800 cantos em 15 min).
export const MIN_DIVISOR_MS = 10_000;

export function stats(s, now) {
  const total = s.events.length;
  const elapsed = elapsedMs(s, now);
  if (s.finished) {
    return { total, avg: total / s.durationMin, forecast: total, provisional: false };
  }
  if (elapsed === 0 && total === 0) return { total, avg: null, forecast: null, provisional: true };
  const avg = total / (Math.max(elapsed, MIN_DIVISOR_MS) / MS_MIN);
  return {
    total,
    avg,
    forecast: Math.round(avg * s.durationMin),
    provisional: elapsed < MIN_ELAPSED_FOR_ESTIMATE,
  };
}
