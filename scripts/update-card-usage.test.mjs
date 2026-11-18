import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calculateCardUsage } from './update-card-usage.mjs';

const collections = { collections: [{ id: 1, code: 'DDG' }, { id: 2, code: 'TEC' }] };
const types = { types: [{ id: 1, code: 'PER' }, { id: 2, code: 'CMP' }, { id: 3, code: 'TEM' }, { id: 4, code: 'TER' }] };
const catalog = { cards: [
  { collection: 1, number: '001', type: [1], name: 'A', text: 'Preservar', rating: 0 },
  { collection: 2, number: '001', type: [1], name: 'B', rating: 5, usage: { deckCount: 9, inclusion: 100, archetypes: ['Antigo'] } },
  ...[2, 3, 4].map(type => ({ collection: 1, number: '001', type: [type] })),
] };
const identity = { champions: ['DDG-CMP-001'], temples: ['DDG-TEM-001'], territories: ['DDG-TER-001'] };
const decks = { decks: [
  { id: 'one', cards: ['DDG-PER-001', 'DDG-PER-001'], identity, archetypes: ['Controle'] },
  { id: 'two', cards: [], identity },
] };
const calculate = (d = decks, c = catalog) => calculateCardUsage(c, d, collections, types);

test('conta presença por deck, inclui identidade e distingue coleções', () => {
  const original = JSON.stringify(catalog);
  const { catalog: result } = calculate();
  assert.equal(result.cards[0].rating, 2.5);
  assert.deepEqual(result.cards[0].usage, { deckCount: 1, inclusion: 50, archetypes: ['Controle'] });
  assert.equal(result.cards[0].text, 'Preservar');
  assert.deepEqual(result.cards[1].usage, { deckCount: 0, inclusion: 0, archetypes: [] });
  result.cards.slice(2).forEach(card => { assert.equal(card.rating, 5); assert.equal(card.usage.deckCount, 2); });
  assert.equal(JSON.stringify(catalog), original);
  assert.equal(calculate(decks, result).changed, 0);
});
test('base vazia zera métricas sem NaN', () => {
  calculate({ decks: [] }).catalog.cards.forEach(card => {
    assert.equal(card.rating, 0);
    assert.equal(card.usage.inclusion, 0);
  });
});
test('recusa referências inválidas e decks duplicados', () => {
  assert.throws(() => calculate({ decks: [{ ...decks.decks[0], cards: ['DDG-PER-999'] }] }), /inexistente/);
  assert.throws(() => calculate({ decks: [decks.decks[0], decks.decks[0]] }), /duplicado/);
  assert.throws(() => calculate({ decks: [{ ...decks.decks[0], identity: {} }] }), /lista esperada/);
});
test('arredonda inclusão e nota sem arredondamento intermediário', () => {
  const result = calculate({ decks: [...decks.decks, { id: 'three', cards: [], identity }] });
  assert.equal(result.catalog.cards[0].usage.inclusion, 33.33);
  assert.equal(result.catalog.cards[0].rating, 1.67);
});
