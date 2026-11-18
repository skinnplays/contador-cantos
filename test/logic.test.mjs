import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as L from '../logic.js';

const M = L.MS_MIN;

test('conta cantos no minuto certo e desfaz o último', () => {
  let s = L.start(L.createSession(15), 0);
  s = L.addCanto(s, 10_000);
  s = L.addCanto(s, 20_000);
  s = L.addCanto(s, M + 5_000);
  assert.deepEqual(L.perMinute(s).slice(0, 3), [2, 1, 0]);
  s = L.removeCanto(s);
  assert.deepEqual(L.perMinute(s).slice(0, 3), [2, 0, 0]);
});

test('previsão = média × duração; antes de 30 s é inicial', () => {
  let s = L.start(L.createSession(15), 0);
  assert.equal(L.stats(s, 0).forecast, null);
  s = L.addCanto(s, 1_000);
  s = L.addCanto(s, 2_000);
  const early = L.stats(s, 2_000); // divide por 10 s, não por 2 s
  assert.equal(early.forecast, 180);
  assert.equal(early.provisional, true);
  const mid = L.stats(s, 20_000);
  assert.equal(mid.forecast, 90);
  assert.equal(mid.provisional, true);
  for (let i = 0; i < 8; i++) s = L.addCanto(s, 60_000);
  const st = L.stats(s, 2 * M); // 10 cantos em 2 min
  assert.equal(st.avg, 5);
  assert.equal(st.forecast, 75);
  assert.equal(st.provisional, false);
});

test('pausa congela o tempo', () => {
  let s = L.start(L.createSession(10), 1000);
  s = L.pause(s, 31_000);
  assert.equal(L.elapsedMs(s, 999_999), 30_000);
  s = L.start(s, 100_000);
  assert.equal(L.elapsedMs(s, 110_000), 40_000);
});

test('encerra no fim do tempo e bloqueia +1, mas permite −1', () => {
  let s = L.start(L.createSession(10), 0);
  s = L.addCanto(s, 5 * M);
  s = L.tick(s, 10 * M + 500);
  assert.equal(s.finished, true);
  assert.equal(L.isRunning(s), false);
  assert.equal(L.addCanto(s, 10 * M + 600).events.length, 1);
  assert.equal(L.removeCanto(s).events.length, 0);
  assert.deepEqual(L.stats(s, 0), { total: 1, avg: 0.1, forecast: 1, provisional: false });
});

test('canto no último instante vai para o último minuto', () => {
  const s = { ...L.createSession(10), events: [10 * M] };
  assert.equal(L.perMinute(s)[9], 1);
});

test('duração só muda antes de começar', () => {
  let s = L.createSession(15);
  s = L.setDuration(s, 10);
  assert.equal(s.durationMin, 10);
  s = L.start(s, 0);
  assert.equal(L.setDuration(s, 15).durationMin, 10);
  assert.equal(L.setDuration(L.createSession(15), 12).durationMin, 15);
});

test('vistos de 50 e de 60 com o tempo de cada um', () => {
  let s = L.start(L.createSession(15), 0);
  for (let i = 1; i <= 125; i++) s = L.addCanto(s, i * 1000);
  assert.deepEqual(L.vistos(s), [
    { n: 1, count: 50, ms: 50_000 },
    { n: 2, count: 100, ms: 100_000 },
  ]);
  assert.equal(L.cantosToNextVisto(s), 25);
  assert.equal(L.justReachedVisto(s), false);
  s = L.setVistoStep(s, 60);
  assert.deepEqual(L.vistos(s).map((v) => v.count), [60, 120]);
  assert.equal(L.cantosToNextVisto(s), 55);
  assert.equal(L.setVistoStep(s, 70).vistoStep, 60);
});

test('−1 desfaz um visto recém-batido', () => {
  let s = L.start(L.createSession(10), 0);
  for (let i = 1; i <= 50; i++) s = L.addCanto(s, i * 100);
  assert.equal(L.justReachedVisto(s), true);
  assert.equal(L.vistos(s).length, 1);
  s = L.removeCanto(s);
  assert.equal(L.vistos(s).length, 0);
  assert.equal(L.cantosToNextVisto(s), 1);
});

test('sessão antiga sem vistoStep ganha 50', () => {
  const { vistoStep, ...old } = L.createSession();
  assert.equal(L.isValid(old), true);
  assert.equal(L.normalize(old).vistoStep, 50);
});

test('valida sessão salva', () => {
  assert.equal(L.isValid(L.createSession()), true);
  assert.equal(L.isValid({ durationMin: 7 }), false);
  assert.equal(L.isValid(null), false);
});
