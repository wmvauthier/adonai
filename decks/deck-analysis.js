#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data");
const gameDir = path.join(dataDir, "game");
const refsDir = path.join(dataDir, "refs");
const decksPath = path.join(gameDir, "decks.json");

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function writeJson(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function list(value) {
  if (value === null || typeof value === "undefined") return [];
  return Array.isArray(value) ? value : [value];
}

function localize(value) {
  if (value === null || typeof value === "undefined") return "";
  if (Array.isArray(value)) return value.map(localize).filter(Boolean).join(", ");
  if (typeof value === "object") {
    if (value.name) return localize(value.name);
    if (value.label) return localize(value.label);
    return value.pt || value.en || Object.values(value).find(Boolean) || "";
  }
  return String(value);
}

function byId(items = []) {
  return new Map(items.map((item) => [Number(item.id), item]));
}

function normalizeNumber(value, fallback) {
  const match = String(value || "").match(/\d+/g);
  const raw = match && match.length ? match[match.length - 1] : String(fallback || 0);
  return raw.padStart(3, "0").slice(-3);
}

function normalizeCost(value) {
  const first = Array.isArray(value) ? value[0] : value;
  if (first === null || typeof first === "undefined" || first === "" || String(first).trim() === "-") return null;
  const cost = Number(first);
  return Number.isFinite(cost) ? cost : null;
}

function average(values) {
  const numeric = values.map(Number).filter(Number.isFinite);
  if (!numeric.length) return null;
  return Number((numeric.reduce((sum, value) => sum + value, 0) / numeric.length).toFixed(2));
}

function countBy(values) {
  return values.reduce((acc, value) => {
    if (!value) return acc;
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function topEntries(record, max = 8) {
  return Object.entries(record)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"))
    .slice(0, max)
    .map(([label, value]) => ({ label, value }));
}

function getTone(delta, lowerIsBetter = false) {
  if (!Number.isFinite(delta) || Math.abs(delta) < 0.01) return "neutral";
  const positive = lowerIsBetter ? delta < 0 : delta > 0;
  return positive ? "positive" : "negative";
}

function withFieldAverage(items, fieldAverages, lowerIsBetter = false) {
  return items.map((item) => {
    const fieldAverage = Number((fieldAverages[item.label] || 0).toFixed(2));
    const delta = Number((Number(item.value) - fieldAverage).toFixed(2));
    return {
      ...item,
      fieldAverage,
      delta,
      tone: getTone(delta, lowerIsBetter)
    };
  });
}

function loadReferenceData() {
  const collections = byId(readJson(path.join(refsDir, "collections.json")).collections);
  const types = byId(readJson(path.join(refsDir, "types.json")).types);
  const subtypes = byId(readJson(path.join(refsDir, "subtypes.json")).subtypes);
  const functions = byId(readJson(path.join(refsDir, "mechanics.json")).functions);
  const roles = byId(readJson(path.join(refsDir, "roles.json")).roles);
  const virtues = byId(readJson(path.join(gameDir, "virtues.json")).virtues);
  return { collections, types, subtypes, functions, roles, virtues };
}

function normalizeCards(cardsPayload, refs) {
  const defaults = cardsPayload.defaults || {};
  return list(cardsPayload.cards).map((card, index) => {
    const merged = { ...defaults, ...card };
    const collection = refs.collections.get(Number(merged.collection)) || { code: "FND" };
    const type = list(merged.type).map((id) => refs.types.get(Number(id))).filter(Boolean);
    const code = `${collection.code || "FND"}-${type[0]?.code || "CRD"}-${normalizeNumber(merged.number, index + 1)}`;
    return {
      ...merged,
      code,
      number: normalizeNumber(merged.number, index + 1),
      collection,
      type,
      subtype: list(merged.subtype).map((id) => refs.subtypes.get(Number(id))).filter(Boolean),
      functions: list(merged.functions).map((id) => refs.functions.get(Number(id))).filter(Boolean),
      virtues: list(merged.virtues).map((id) => refs.virtues.get(Number(id))).filter(Boolean),
      role: refs.roles.get(Number(merged.role)) || null,
      cost: normalizeCost(merged.cost),
      stats: {
        attack: merged.stats?.attack ?? null,
        resistance: merged.stats?.resistance ?? null
      }
    };
  });
}

function deckCards(deck, cardsByCode) {
  return list(deck.cards).map((id) => cardsByCode.get(id)).filter(Boolean);
}

function identityCards(deck, cardsByCode) {
  return [
    ...list(deck.identity?.champions),
    ...list(deck.identity?.territories),
    ...list(deck.identity?.temples)
  ].map((id) => cardsByCode.get(id)).filter(Boolean);
}

function rawAnalysis(deck, cardsByCode) {
  const cards = deckCards(deck, cardsByCode);
  const allCards = [...identityCards(deck, cardsByCode), ...cards];
  const costs = cards.map((card) => card.cost).filter(Number.isFinite);
  const attacks = cards.map((card) => Number(card.stats?.attack)).filter(Number.isFinite);
  const resistances = cards.map((card) => Number(card.stats?.resistance)).filter(Number.isFinite);

  const typeCounts = topEntries(countBy(cards.flatMap((card) => card.type.map((type) => localize(type.name)))));
  const functionCounts = topEntries(countBy(allCards.flatMap((card) => card.functions.map((fn) => localize(fn.name)))));
  const virtuePips = topEntries(countBy(allCards.flatMap((card) => card.virtues.map((virtue) => localize(virtue.name))))).map((item) => {
    const virtue = allCards.flatMap((card) => card.virtues).find((candidate) => localize(candidate.name) === item.label);
    return { id: virtue?.id || null, ...item };
  });

  const averageCostByType = typeCounts.map((item) => {
    const matching = cards.filter((card) => card.type.some((type) => localize(type.name) === item.label));
    return { label: item.label, value: average(matching.map((card) => card.cost)) || 0 };
  });
  const averageCostByFunction = functionCounts.map((item) => {
    const matching = allCards.filter((card) => card.functions.some((fn) => localize(fn.name) === item.label));
    return { label: item.label, value: average(matching.map((card) => card.cost)) || 0 };
  });

  const curve = [1, 2, 3, 4, 5, 6].map((cost) => ({
    cost,
    count: cards.filter((card) => card.cost === cost).length
  }));
  const sweetSpot = curve.reduce((best, item) => item.count > best.count ? item : best, curve[0])?.cost || null;

  return {
    summary: deck.analysis?.summary || { pt: "Análise gerada automaticamente.", en: "Automatically generated analysis." },
    tone: deck.analysis?.tone || "neutral",
    typeCounts,
    averageCostByType,
    functionCounts,
    averageCostByFunction,
    virtuePips,
    averages: {
      cost: { value: average(costs) || 0 },
      attack: { value: average(attacks) || 0 },
      resistance: { value: average(resistances) || 0 }
    },
    curve,
    sweetSpot
  };
}

function averageByLabel(analyses, field) {
  const buckets = {};
  analyses.forEach((analysis) => {
    list(analysis[field]).forEach((item) => {
      if (!buckets[item.label]) buckets[item.label] = [];
      buckets[item.label].push(Number(item.value));
    });
  });
  return Object.fromEntries(Object.entries(buckets).map(([label, values]) => [label, average(values) || 0]));
}

function applyComparisons(rawAnalyses) {
  const averages = {
    typeCounts: averageByLabel(rawAnalyses, "typeCounts"),
    averageCostByType: averageByLabel(rawAnalyses, "averageCostByType"),
    functionCounts: averageByLabel(rawAnalyses, "functionCounts"),
    averageCostByFunction: averageByLabel(rawAnalyses, "averageCostByFunction"),
    virtuePips: averageByLabel(rawAnalyses, "virtuePips"),
    curve: Object.fromEntries([1, 2, 3, 4, 5, 6].map((cost) => [
      String(cost),
      average(rawAnalyses.map((analysis) => analysis.curve.find((item) => item.cost === cost)?.count || 0)) || 0
    ])),
    cost: average(rawAnalyses.map((analysis) => analysis.averages.cost.value)) || 0,
    attack: average(rawAnalyses.map((analysis) => analysis.averages.attack.value)) || 0,
    resistance: average(rawAnalyses.map((analysis) => analysis.averages.resistance.value)) || 0
  };

  return rawAnalyses.map((analysis) => {
    const costDelta = Number((analysis.averages.cost.value - averages.cost).toFixed(2));
    const attackDelta = Number((analysis.averages.attack.value - averages.attack).toFixed(2));
    const resistanceDelta = Number((analysis.averages.resistance.value - averages.resistance).toFixed(2));
    return {
      ...analysis,
      typeCounts: withFieldAverage(analysis.typeCounts, averages.typeCounts),
      averageCostByType: withFieldAverage(analysis.averageCostByType, averages.averageCostByType, true),
      functionCounts: withFieldAverage(analysis.functionCounts, averages.functionCounts),
      averageCostByFunction: withFieldAverage(analysis.averageCostByFunction, averages.averageCostByFunction, true),
      virtuePips: withFieldAverage(analysis.virtuePips, averages.virtuePips),
      averages: {
        cost: { value: analysis.averages.cost.value, fieldAverage: averages.cost, delta: costDelta, tone: getTone(costDelta, true) },
        attack: { value: analysis.averages.attack.value, fieldAverage: averages.attack, delta: attackDelta, tone: getTone(attackDelta) },
        resistance: { value: analysis.averages.resistance.value, fieldAverage: averages.resistance, delta: resistanceDelta, tone: getTone(resistanceDelta) }
      },
      curve: analysis.curve.map((item) => {
        const fieldAverage = averages.curve[String(item.cost)] || 0;
        const delta = Number((item.count - fieldAverage).toFixed(2));
        return { ...item, fieldAverage, tone: getTone(delta) };
      })
    };
  });
}

function validateDeck(deck) {
  const errors = [];
  if (new Set(deck.cards).size !== deck.cards.length) errors.push(`${deck.id}: cartas repetidas em deck singleton`);
  if (deck.cards.length > 40) errors.push(`${deck.id}: deck principal possui ${deck.cards.length} cartas; máximo é 40`);
  ["champions", "territories", "temples"].forEach((zone) => {
    const values = list(deck.identity?.[zone]);
    if (!values.length) errors.push(`${deck.id}: identidade sem ${zone}`);
  });
  return errors;
}

function main() {
  const shouldWrite = process.argv.includes("--write");
  const refs = loadReferenceData();
  const cardsPayload = readJson(path.join(gameDir, "cards.json"));
  const decksPayload = readJson(decksPath);
  const cards = normalizeCards(cardsPayload, refs);
  const cardsByCode = new Map(cards.map((card) => [card.code, card]));
  const decks = list(decksPayload.decks);
  const errors = decks.flatMap(validateDeck);

  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
    if (!shouldWrite) return;
  }

  const raw = decks.map((deck) => rawAnalysis(deck, cardsByCode));
  const computed = applyComparisons(raw);
  const next = {
    ...decksPayload,
    updatedAt: new Date().toISOString().slice(0, 10),
    decks: decks.map((deck, index) => ({ ...deck, analysis: computed[index] }))
  };

  if (shouldWrite) {
    writeJson(decksPath, next);
    console.log(`Atualizado: ${path.relative(root, decksPath)}`);
  } else {
    console.log(`OK: ${decks.length} decks analisados. Use --write para atualizar data/game/decks.json.`);
  }
}

main();
