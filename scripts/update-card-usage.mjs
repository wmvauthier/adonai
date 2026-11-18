#!/usr/bin/env node
import { readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

function requireArray(value, label) {
  if (!Array.isArray(value)) throw new Error(`${label}: lista esperada.`);
  return value;
}

function referenceMap(payload, key) {
  const map = new Map();
  for (const item of requireArray(payload[key], key)) {
    if (!item || !item.code || map.has(item.id)) throw new Error(`${key}: referência inválida ou duplicada.`);
    map.set(item.id, item.code);
  }
  return map;
}

/** Each deck contributes one inclusion per card, regardless of copy count. */
export function calculateCardUsage(catalog, deckCatalog, collections, types) {
  const cards = requireArray(catalog.cards, 'cards');
  const decks = requireArray(deckCatalog.decks, 'decks');
  const sets = referenceMap(collections, 'collections');
  const kinds = referenceMap(types, 'types');
  const metrics = new Map();
  const codes = cards.map(card => {
    const set = sets.get(card.collection);
    const type = kinds.get(card.type?.[0]);
    if (!set || !type || !/^\d+$/.test(String(card.number))) throw new Error(`Carta com coleção, tipo ou número inválido: ${card.number}`);
    const code = `${set}-${type}-${String(card.number).padStart(3, '0')}`;
    if (metrics.has(code)) throw new Error(`Carta duplicada: ${code}`);
    metrics.set(code, { deckCount: 0, archetypes: new Set() });
    return code;
  });
  const ids = new Set();
  for (const deck of decks) {
    if (!deck || typeof deck.id !== 'string' || !deck.id.trim() || ids.has(deck.id)) throw new Error(`ID de deck inválido ou duplicado: ${deck?.id}`);
    ids.add(deck.id);
    const references = [...requireArray(deck.cards, `${deck.id}.cards`)];
    for (const group of ['champions', 'territories', 'temples']) {
      references.push(...requireArray(deck.identity?.[group], `${deck.id}.identity.${group}`));
    }
    const archetypes = deck.archetypes === undefined ? [] : requireArray(deck.archetypes, `${deck.id}.archetypes`);
    if (archetypes.some(value => typeof value !== 'string' || !value.trim())) throw new Error(`${deck.id}: arquétipos devem ser nomes não vazios.`);
    for (const code of new Set(references)) {
      const metric = metrics.get(code);
      if (!metric) throw new Error(`${deck.id}: carta inexistente ${code}. Nenhuma alteração foi gravada.`);
      metric.deckCount += 1;
      archetypes.forEach(value => metric.archetypes.add(value.trim()));
    }
  }
  const round = value => Math.round(value * 100) / 100;
  const updatedCards = cards.map((card, index) => {
    const metric = metrics.get(codes[index]);
    const fraction = decks.length ? metric.deckCount / decks.length : 0;
    return {
      ...card,
      rating: round(fraction * 5),
      usage: {
        ...card.usage,
        deckCount: metric.deckCount,
        inclusion: round(fraction * 100),
        archetypes: [...metric.archetypes].sort((a, b) => a.localeCompare(b, 'pt-BR')),
      },
    };
  });
  const changed = updatedCards.filter((card, index) => JSON.stringify(card) !== JSON.stringify(cards[index])).length;
  return { catalog: { ...catalog, cards: updatedCards }, changed, deckCount: decks.length };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('node scripts/update-card-usage.mjs [--dry-run]\nAtualiza rating e usage de cards.json com base em decks.json. --dry-run não grava arquivos.');
    return;
  }
  if (args.some(arg => arg !== '--dry-run')) throw new Error('Argumento desconhecido. Use --help.');
  const read = async path => JSON.parse(await readFile(resolve(projectRoot, path), 'utf8'));
  const inputs = await Promise.all([
    read('data/game/cards.json'), read('data/game/decks.json'),
    read('data/refs/collections.json'), read('data/refs/types.json'),
  ]);
  const result = calculateCardUsage(...inputs);
  console.log(`${result.deckCount} decks analisados; ${result.catalog.cards.length} cartas; ${result.changed} cartas com métricas alteradas.`);
  if (args.includes('--dry-run')) { console.log('Simulação: nenhum arquivo alterado.'); return; }
  if (!result.changed) { console.log('Métricas já atualizadas.'); return; }
  result.catalog.updatedAt = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Recife', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const target = resolve(projectRoot, 'data/game/cards.json');
  const temporary = `${target}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, `${JSON.stringify(result.catalog, null, 2)}\n`, { flag: 'wx' });
    await rename(temporary, target);
  } finally {
    await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; });
  }
  console.log('data/game/cards.json atualizado. Avaliação = inclusão nos decks × 5 (escala 0–5).');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
