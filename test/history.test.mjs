import test from 'node:test';
import assert from 'node:assert/strict';
import * as H from '../history.js';

const sess = (bird, n, durationMin = 15, finished = true) => ({
  durationMin, bird, vistoStep: 50, events: Array.from({ length: n }, (_, i) => 1000 + i * 3000), elapsedBefore: 0, startedAt: null, finished,
});
const rodada = (bird, n, at, d = 15) => H.roundFromSession(sess(bird, n, d), at, [], []);

test('mesmo pássaro com maiúsculas, acentos e espaços diferentes', () => {
  assert.equal(H.birdKey('  Maréchal   LMD '), H.birdKey('marechal lmd'));
});

test('só salva roda encerrada, com nome e com cantos', () => {
  assert.equal(H.roundFromSession(sess('Rajada', 10, 15, false), 1, [], []), null);
  assert.equal(H.roundFromSession(sess('', 10), 1, [], []), null);
  assert.equal(H.roundFromSession(sess('Rajada', 0), 1, [], []), null);
  assert.equal(rodada('Rajada', 10, 1).total, 10);
});

test('a mesma roda não entra duas vezes', () => {
  let h = H.emptyHistory();
  h = H.addRound(h, rodada('Rajada', 40, 1));
  h = H.addRound(h, rodada('Rajada', 40, 2));
  assert.equal(h.rounds.length, 1);
});

test('recorde e média separados por tempo de roda', () => {
  let h = H.emptyHistory();
  for (const [n, d, at] of [[100, 15, 1], [120, 15, 2], [80, 10, 3]]) h = H.addRound(h, rodada('Rajada', n, at, d));
  const sm = H.summary(H.roundsOf(h, 'rajada'));
  assert.deepEqual([sm[15].best, sm[15].avg, sm[10].best], [120, 110, 80]);
});

test('compara a roda nova com as anteriores', () => {
  let h = H.emptyHistory();
  h = H.addRound(h, rodada('Rajada', 100, 1));
  const nova = rodada('Rajada', 130, 2);
  h = H.addRound(h, nova);
  assert.deepEqual(H.compare(H.roundsOf(h, 'Rajada'), nova), { kind: 'record', before: 100 });
  const fraca = rodada('Rajada', 90, 3);
  h = H.addRound(h, fraca);
  assert.equal(H.compare(H.roundsOf(h, 'Rajada'), fraca).kind, 'avg');
});

test('lista de aves: mais recente primeiro, com recorde por tempo de roda', () => {
  let h = H.emptyHistory();
  h = H.addRound(h, rodada('Rajada', 100, 1));
  h = H.addRound(h, rodada('Xerife', 90, 5, 10));
  h = H.addRound(h, rodada('rajada', 120, 9));
  const l = H.birdsList(h);
  assert.deepEqual(l.map((b) => [b.bird, b.count, b.best[15] ?? null]), [['rajada', 2, 120], ['Xerife', 1, null]]);
});

test('histórico estragado vira vazio, e apagar funciona', () => {
  assert.deepEqual(H.parseHistory('{lixo'), H.emptyHistory());
  let h = H.addRound(H.emptyHistory(), rodada('Rajada', 5, 1));
  h = H.addRound(h, rodada('Xerife', 5, 2));
  assert.deepEqual(H.knownBirds(h), ['Xerife', 'Rajada']);
  assert.equal(H.removeBird(h, 'rajada').rounds.length, 1);
});
