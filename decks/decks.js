const DECKS_URL = "../data/decks.json";
const CARDS_URL = "../data/cards.json";
const STORAGE_KEY = "adonai.decks.filters.v1";
const DECK_LANES = ["0-1", "2", "3", "4", "5", "6+"];
const COST_LAYOUT_TYPE_ORDER = ["PEC", "ART", "MIL", "PER"];
const TYPE_LAYOUT_LANES = {
  PER: "0-1",
  MIL: "2",
  ART: "3",
  PEC: "4"
};
const REFERENCE_URLS = {
  collections: "../data/collections.json",
  types: "../data/types.json",
  subtypes: "../data/subtypes.json",
  functions: "../data/functions.json",
  roles: "../data/roles.json",
  virtues: "../data/virtues.json"
};

const copy = {
  pt: {
    all: "Todos",
    allFeminine: "Todas",
    loadingTitle: "Carregando decks",
    loadingBody: "Buscando listas e análises do metagame.",
    errorTitle: "Não foi possível carregar os decks",
    errorBody: "Confira se a página está sendo servida por um servidor local e se os arquivos em data existem.",
    emptyTitle: "Nenhum deck encontrado",
    emptyBody: "Tente reduzir a combinação de filtros ou buscar por outro termo.",
    decksFound: "decks encontrados",
    noActiveFilters: "Nenhum filtro ativo",
    clearAllFilters: "Limpar todos os filtros",
    showing: "Mostrando",
    of: "de",
    previous: "Anterior",
    next: "Próxima",
    cards: "Cartas",
    avgCost: "Custo médio",
    avgAtk: "ATK médio",
    avgRes: "RES média",
    creator: "Criador",
    identity: "Identidade",
    champion: "Campeão",
    territory: "Território",
    temple: "Templo",
    analysis: "Análise",
    typeCounts: "Qtd. de cartas por tipo",
    costByType: "Custo médio por tipo",
    functionCounts: "Qtd. de cartas por função",
    costByFunction: "Custo médio por função",
    typesSummary: "Tipos",
    functionsSummary: "Funções",
    virtuePips: "Pips de característica",
    decklist: "Lista do deck",
    lanesView: "Raias",
    listView: "Lista",
    organizeByCost: "Reorganizar por custo",
    organizeByType: "Reorganizar por tipo",
    noData: "A definir"
  },
  en: {
    all: "All",
    allFeminine: "All",
    loadingTitle: "Loading decks",
    loadingBody: "Fetching decklists and metagame analysis.",
    errorTitle: "Decks could not be loaded",
    errorBody: "Check that the page is running from a local server and that the files in data exist.",
    emptyTitle: "No decks found",
    emptyBody: "Try reducing the filter combination or searching for another term.",
    decksFound: "decks found",
    noActiveFilters: "No active filters",
    clearAllFilters: "Clear all filters",
    showing: "Showing",
    of: "of",
    previous: "Prev",
    next: "Next",
    cards: "Cards",
    avgCost: "Avg cost",
    avgAtk: "Avg ATK",
    avgRes: "Avg RES",
    creator: "Creator",
    identity: "Identity",
    champion: "Champion",
    territory: "Territory",
    temple: "Temple",
    analysis: "Analysis",
    typeCounts: "Card count by type",
    costByType: "Average cost by type",
    functionCounts: "Card count by function",
    costByFunction: "Average cost by function",
    typesSummary: "Types",
    functionsSummary: "Functions",
    virtuePips: "Trait pips",
    decklist: "Decklist",
    lanesView: "Lanes",
    listView: "List",
    organizeByCost: "Sort by cost",
    organizeByType: "Sort by type",
    noData: "TBD"
  }
};

const state = {
  currentPage: 1,
  itemsPerPage: 9,
  name: "",
  creator: "",
  champion: "all",
  territory: "all",
  temple: "all",
  minAvgCost: null,
  maxAvgCost: null,
  minAvgPower: null,
  maxAvgPower: null,
  minAvgResistance: null,
  maxAvgResistance: null,
  virtuePipFilters: [
    { virtue: "all", min: null, max: null },
    { virtue: "all", min: null, max: null },
    { virtue: "all", min: null, max: null }
  ],
  sort: "name-asc",
  drawerView: "lanes",
  drawerLaneSort: "cost",
  lang: "pt"
};

const els = {
  header: document.getElementById("siteHeader"),
  mobileToggle: document.getElementById("mobileToggle"),
  primaryNav: document.getElementById("primaryNav"),
  decksGrid: document.getElementById("decksGrid"),
  resultsCount: document.getElementById("resultsCount"),
  activeFilters: document.getElementById("activeFilters"),
  pagination: document.getElementById("pagination"),
  nameFilter: document.getElementById("nameFilter"),
  creatorFilter: document.getElementById("creatorFilter"),
  championFilter: document.getElementById("championFilter"),
  territoryFilter: document.getElementById("territoryFilter"),
  templeFilter: document.getElementById("templeFilter"),
  minAvgCostFilter: document.getElementById("minAvgCostFilter"),
  maxAvgCostFilter: document.getElementById("maxAvgCostFilter"),
  avgCostValue: document.getElementById("avgCostValue"),
  minAvgPowerFilter: document.getElementById("minAvgPowerFilter"),
  maxAvgPowerFilter: document.getElementById("maxAvgPowerFilter"),
  avgPowerValue: document.getElementById("avgPowerValue"),
  minAvgResistanceFilter: document.getElementById("minAvgResistanceFilter"),
  maxAvgResistanceFilter: document.getElementById("maxAvgResistanceFilter"),
  avgResistanceValue: document.getElementById("avgResistanceValue"),
  virtuePipSelects: [0, 1, 2].map((index) => document.getElementById(`virtuePipSelect${index}`)),
  minVirtuePipFilters: [0, 1, 2].map((index) => document.getElementById(`minVirtuePipFilter${index}`)),
  maxVirtuePipFilters: [0, 1, 2].map((index) => document.getElementById(`maxVirtuePipFilter${index}`)),
  virtuePipValues: [0, 1, 2].map((index) => document.getElementById(`virtuePipValue${index}`)),
  virtuePipIcons: [0, 1, 2].map((index) => document.getElementById(`virtuePipIcon${index}`)),
  sortSelect: document.getElementById("sortSelect"),
  clearFilters: document.getElementById("clearFilters"),
  drawer: document.getElementById("deckDrawer"),
  drawerPanel: document.querySelector(".drawer-panel"),
  drawerBackdrop: document.getElementById("drawerBackdrop"),
  drawerClose: document.getElementById("drawerClose"),
  drawerContent: document.getElementById("drawerContent"),
  hoverPreview: document.getElementById("hoverPreview"),
  langButtons: document.querySelectorAll(".lang-btn")
};

let cardsData = [];
let decksData = [];
let references = {
  collections: new Map(),
  types: new Map(),
  subtypes: new Map(),
  functions: new Map(),
  roles: new Map(),
  virtues: new Map()
};
let activeDrawerFilter = null;
let avgBounds = {
  cost: { min: 0, max: 10 },
  power: { min: 0, max: 10 },
  resistance: { min: 0, max: 10 },
  virtuePips: { min: 0, max: 20 }
};

function t(key) {
  return copy[state.lang][key] || copy.pt[key] || key;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeList(value) {
  if (value === null || typeof value === "undefined") return [];
  return Array.isArray(value) ? value : [value];
}

function flattenValue(value) {
  if (value === null || typeof value === "undefined") return "";
  if (Array.isArray(value)) return value.map(flattenValue).join(" ");
  if (typeof value === "object") return Object.values(value).map(flattenValue).join(" ");
  return String(value);
}

function normalizeSearch(value) {
  return flattenValue(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function includesText(haystack, needle) {
  return normalizeSearch(haystack).includes(normalizeSearch(needle));
}

function localize(value) {
  if (value === null || typeof value === "undefined") return "";
  if (Array.isArray(value)) return value.map(localize).filter(Boolean).join(", ");
  if (typeof value === "object") {
    if (value.name) return localize(value.name);
    if (value.label) return localize(value.label);
    if (value.text) return localize(value.text);
    return value[state.lang] || value.pt || value.en || Object.values(value).find(Boolean) || "";
  }
  return String(value);
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function roundOne(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number * 10) / 10 : 0;
}

function clampRangePair(minValue, maxValue, bounds, step = 1) {
  let min = Number(minValue);
  let max = Number(maxValue);
  if (!Number.isFinite(min)) min = bounds.min;
  if (!Number.isFinite(max)) max = bounds.max;
  min = Math.max(bounds.min, Math.min(bounds.max, min));
  max = Math.max(bounds.min, Math.min(bounds.max, max));
  if (min > max) [min, max] = [max, min];
  if (step < 1) return { min: roundOne(min), max: roundOne(max) };
  return { min: Math.round(min), max: Math.round(max) };
}

function numbersEqual(a, b) {
  return Math.abs(Number(a) - Number(b)) < 0.0001;
}

function rangeMatchesBounds(min, max, bounds) {
  return numbersEqual(min, bounds.min) && numbersEqual(max, bounds.max);
}

function normalizeStateRanges() {
  const costRange = clampRangePair(state.minAvgCost, state.maxAvgCost, avgBounds.cost, 0.1);
  const powerRange = clampRangePair(state.minAvgPower, state.maxAvgPower, avgBounds.power, 0.1);
  const resistanceRange = clampRangePair(state.minAvgResistance, state.maxAvgResistance, avgBounds.resistance, 0.1);

  state.minAvgCost = costRange.min;
  state.maxAvgCost = costRange.max;
  state.minAvgPower = powerRange.min;
  state.maxAvgPower = powerRange.max;
  state.minAvgResistance = resistanceRange.min;
  state.maxAvgResistance = resistanceRange.max;
  state.virtuePipFilters = [0, 1, 2].map((index) => {
    const current = state.virtuePipFilters?.[index] || {};
    const range = clampRangePair(current.min, current.max, avgBounds.virtuePips, 1);
    return {
      virtue: current.virtue || "all",
      min: range.min,
      max: range.max
    };
  });
}

function mapById(items = []) {
  return new Map(items.map((item) => [Number(item.id), item]));
}

function resolveEntity(kind, value) {
  if (value === null || typeof value === "undefined" || value === "") return null;
  if (typeof value === "object" && !Array.isArray(value)) return value;
  return references[kind]?.get(Number(value)) || null;
}

function resolveEntities(kind, values) {
  return normalizeList(values)
    .map((value) => resolveEntity(kind, value))
    .filter(Boolean);
}

function normalizeCollection(value) {
  const resolved = resolveEntity("collections", value);
  if (resolved) {
    const code = String(localize(resolved.set) || resolved.code || "FND").toUpperCase();
    return {
      ...resolved,
      code,
      label: resolved.label || { pt: `${localize(resolved.name)} (${code})`, en: `${localize(resolved.name)} (${code})` }
    };
  }
  return { name: { pt: "Foundations", en: "Foundations" }, code: "FND", label: { pt: "Foundations (FND)", en: "Foundations (FND)" } };
}

function normalizeNumber(value, fallback) {
  const match = String(value || "").match(/\d+/g);
  const raw = match?.length ? match[match.length - 1] : String(fallback || 0);
  return raw.padStart(3, "0").slice(-3);
}

function normalizeCost(value) {
  const first = Array.isArray(value) ? value[0] : value;
  if (first === null || typeof first === "undefined" || first === "" || String(first).trim() === "-") return null;
  const cost = Number(first);
  return Number.isFinite(cost) ? cost : null;
}

function getPrimaryType(card) {
  return normalizeList(card.type)[0] || {};
}

function getCardCode(card) {
  const collectionCode = card.collection?.code || "FND";
  const primaryType = getPrimaryType(card);
  const typeCode = primaryType.code || localize(primaryType.name || primaryType).slice(0, 3).toUpperCase() || "CRD";
  return `${collectionCode}-${typeCode}-${card.number}`;
}

function getCardName(card) {
  return localize(card.name) || getCardCode(card);
}

function normalizeCard(card, defaults, index) {
  const merged = {
    ...defaults,
    ...card,
    collection: card.collection || defaults.collection,
    images: {
      ...(defaults.images || {}),
      ...(card.images || {})
    },
    usage: {
      ...(defaults.usage || {}),
      ...(card.usage || {})
    }
  };
  const collection = normalizeCollection(merged.collection);
  const type = resolveEntities("types", merged.type).length ? resolveEntities("types", merged.type) : normalizeList(merged.type);
  const subtype = resolveEntities("subtypes", merged.subtype).length ? resolveEntities("subtypes", merged.subtype) : normalizeList(merged.subtype);
  const functions = resolveEntities("functions", merged.functions).length ? resolveEntities("functions", merged.functions) : normalizeList(merged.functions);
  const virtues = resolveEntities("virtues", merged.virtues).length ? resolveEntities("virtues", merged.virtues) : normalizeList(merged.virtues);
  const role = resolveEntity("roles", merged.role) || merged.role;
  const number = normalizeNumber(merged.number, index + 1);
  const normalized = {
    ...merged,
    collection,
    number,
    numericNumber: Number(number),
    type,
    subtype,
    functions,
    virtues,
    role,
    cost: normalizeCost(merged.cost),
    stats: {
      attack: merged.stats?.attack ?? null,
      resistance: merged.stats?.resistance ?? null
    }
  };
  normalized.code = getCardCode(normalized);
  return normalized;
}

function resolveCards(ids = []) {
  return ids.map((id) => cardsData.find((card) => card.code === id)).filter(Boolean);
}

function formatMetric(value, digits = 1) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "-";
  return Number.isInteger(number) ? String(number) : number.toFixed(digits);
}

function cssUrl(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
}

function statusSymbol(name) {
  const symbols = {
    cost: "◆",
    sword: "⚔",
    shield: "⬟"
  };
  return `<span class="status-symbol" aria-hidden="true">${symbols[name] || "◆"}</span>`;
}

function toneForDelta(item, mode = "higher") {
  const delta = Number(item?.delta);
  if (!Number.isFinite(delta) || delta === 0) return "neutral";
  if (mode === "lower") return delta < 0 ? "positive" : "negative";
  return delta > 0 ? "positive" : "negative";
}

function getDeckName(deck) {
  return localize(deck.name) || deck.id;
}

function getDeckResolvedCards(deck) {
  return {
    champions: resolveCards(deck.identity?.champions),
    territories: resolveCards(deck.identity?.territories),
    temples: resolveCards(deck.identity?.temples),
    main: resolveCards(deck.cards)
  };
}

function getDeckIdentityCards(deck) {
  const resolved = getDeckResolvedCards(deck);
  return [...resolved.champions, ...resolved.territories, ...resolved.temples];
}

function getDeckAllCards(deck) {
  const resolved = getDeckResolvedCards(deck);
  return [...resolved.champions, ...resolved.territories, ...resolved.temples, ...resolved.main];
}

function getDeckAverage(deck, field) {
  if (field === "cost") return Number(deck.analysis?.averages?.cost?.value ?? 0);
  if (field === "power") return Number(deck.analysis?.averages?.attack?.value ?? 0);
  if (field === "resistance") return Number(deck.analysis?.averages?.resistance?.value ?? 0);
  return 0;
}

function getDeckVirtuePipCount(deck, virtueValue) {
  if (!virtueValue || virtueValue === "all") return 0;
  if (virtueValue === "__none") {
    return getDeckAllCards(deck).filter((card) => !getCardVirtueLabels(card).length).length;
  }
  const match = normalizeList(deck.analysis?.virtuePips).find((pip) => String(pip.id) === String(virtueValue) || pip.label === virtueValue);
  return Number(match?.value || 0);
}

function getCardTypeLabels(card) {
  return labelList(card.type);
}

function getCardFunctionLabels(card) {
  return labelList(card.functions);
}

function getCardVirtueLabels(card) {
  return labelList(card.virtues);
}

function getPrimaryTypeLabel(card) {
  return getCardTypeLabels(card)[0] || "";
}

function getTypeSortRank(card) {
  const order = ["Personagem", "Milagre", "Artefato", "Pecado"];
  const index = order.indexOf(getPrimaryTypeLabel(card));
  return index === -1 ? 999 : index;
}

function getPrimaryTypeCode(card) {
  return getPrimaryType(card).code || "";
}

function getCostLane(card) {
  const cost = Number(card.cost);
  if (!Number.isFinite(cost)) return "6+";
  if (cost <= 1) return "0-1";
  return cost >= 6 ? "6+" : String(Math.max(0, Math.floor(cost)));
}

function getTypeOrder(card, order = COST_LAYOUT_TYPE_ORDER) {
  const index = order.indexOf(getPrimaryTypeCode(card));
  return index >= 0 ? index : order.length;
}

function compareDeckCardNames(a, b) {
  return getCardName(a).localeCompare(getCardName(b), state.lang === "pt" ? "pt-BR" : "en-US") || a.code.localeCompare(b.code);
}

function compareCardsByCostLaneType(a, b) {
  return getTypeOrder(a) - getTypeOrder(b)
    || toNumber(a.cost, 999) - toNumber(b.cost, 999)
    || compareDeckCardNames(a, b);
}

function compareCardsByCostThenType(a, b) {
  return toNumber(a.cost, 999) - toNumber(b.cost, 999)
    || getTypeOrder(a) - getTypeOrder(b)
    || compareDeckCardNames(a, b);
}

function getTypeLayoutLane(card) {
  return TYPE_LAYOUT_LANES[getPrimaryTypeCode(card)] || "5";
}

function createEmptyDeckLanes(lanes = DECK_LANES) {
  return lanes.reduce((map, lane) => {
    map[lane] = [];
    return map;
  }, {});
}

function buildDeckLanes(cards, layout = "cost") {
  const lanes = layout === "type" ? createEmptyDeckLanes(DECK_LANES.filter((lane) => lane !== "6+")) : createEmptyDeckLanes();
  cards.forEach((card) => {
    const lane = layout === "type" ? getTypeLayoutLane(card) : getCostLane(card);
    if (!lanes[lane]) lanes[lane] = [];
    lanes[lane].push(card);
  });
  Object.keys(lanes).forEach((lane) => {
    lanes[lane].sort(layout === "type" ? compareCardsByCostThenType : compareCardsByCostLaneType);
  });
  return lanes;
}

function getLaneLabel(lane, layout = "cost") {
  if (layout !== "type") return lane;
  const labels = {
    "0-1": state.lang === "pt" ? "Personagens" : "Characters",
    "2": state.lang === "pt" ? "Milagres" : "Miracles",
    "3": state.lang === "pt" ? "Artefatos" : "Artifacts",
    "4": state.lang === "pt" ? "Pecados" : "Sins",
    "5": state.lang === "pt" ? "Demais" : "Other"
  };
  return labels[lane] || lane;
}

function sortDeckCards(cards) {
  return [...cards].sort((a, b) => {
    const typeDiff = getTypeSortRank(a) - getTypeSortRank(b);
    if (typeDiff) return typeDiff;
    const costDiff = (a.cost ?? 999) - (b.cost ?? 999);
    if (costDiff) return costDiff;
    return getCardName(a).localeCompare(getCardName(b), state.lang === "pt" ? "pt-BR" : "en-US");
  });
}

function cardMatchesDrawerFilter(card, filter) {
  if (!filter) return true;
  if (filter.kind === "type") return getCardTypeLabels(card).includes(filter.value);
  if (filter.kind === "function") return getCardFunctionLabels(card).includes(filter.value);
  if (filter.kind === "virtue") {
    const virtues = getCardVirtueLabels(card);
    return filter.value === "__none" ? virtues.length === 0 : virtues.includes(filter.value);
  }
  return true;
}

function labelList(values) {
  return normalizeList(values).map(localize).filter(Boolean);
}

function getDeckSearchCorpus(deck) {
  const allCards = getDeckAllCards(deck);
  return [
    deck.id,
    deck.name,
    deck.creator?.name,
    deck.analysis?.summary,
    allCards.map((card) => [card.name, card.type, card.subtype, card.functions, card.role, card.virtues])
  ];
}

function getDeckFilterValues(deck, field) {
  const cards = getDeckAllCards(deck);
  if (field === "champion") return labelList(getDeckResolvedCards(deck).champions.map((card) => card.name));
  if (field === "territory") return labelList(getDeckResolvedCards(deck).territories.map((card) => card.name));
  if (field === "temple") return labelList(getDeckResolvedCards(deck).temples.map((card) => card.name));
  if (field === "type") return cards.flatMap((card) => labelList(card.type));
  if (field === "function") return cards.flatMap((card) => labelList(card.functions));
  if (field === "role") return cards.map((card) => localize(card.role)).filter(Boolean);
  if (field === "virtue") return cards.flatMap((card) => labelList(card.virtues));
  return [];
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, state.lang === "pt" ? "pt-BR" : "en-US"));
}

function populateSelect(select, values, allLabel) {
  if (!select) return;
  const current = select.value || "all";
  select.innerHTML = `<option value="all">${escapeHtml(allLabel)}</option>${values
    .map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
    .join("")}`;
  select.value = values.includes(current) ? current : "all";
}

function setRangeControl(minInput, maxInput, label, bounds, stateMin, stateMax) {
  if (!minInput || !maxInput || !label) return;
  minInput.min = String(bounds.min);
  minInput.max = String(bounds.max);
  maxInput.min = String(bounds.min);
  maxInput.max = String(bounds.max);
  minInput.value = String(stateMin ?? bounds.min);
  maxInput.value = String(stateMax ?? bounds.max);
  label.textContent = `${minInput.value}-${maxInput.value}`;
}

function calculateFilterBounds() {
  const valuesFor = (field) => decksData.map((deck) => getDeckAverage(deck, field)).filter(Number.isFinite);
  const makeBounds = (values, fallbackMax, step = 1) => {
    if (!values.length) return { min: 0, max: fallbackMax };
    const min = step < 1 ? Math.floor(Math.min(...values) * 10) / 10 : Math.floor(Math.min(...values));
    const max = step < 1 ? Math.ceil(Math.max(...values) * 10) / 10 : Math.ceil(Math.max(...values));
    return { min, max: Math.max(max, min + step) };
  };
  const virtueValues = decksData.flatMap((deck) => normalizeList(deck.analysis?.virtuePips).map((pip) => Number(pip.value || 0)));
  avgBounds = {
    cost: makeBounds(valuesFor("cost"), 10, 0.1),
    power: makeBounds(valuesFor("power"), 10, 0.1),
    resistance: makeBounds(valuesFor("resistance"), 10, 0.1),
    virtuePips: makeBounds(virtueValues, 20, 1)
  };
}

function populateVirtuePipSelects() {
  const virtues = [...references.virtues.values()].map((virtue) => ({
    value: String(virtue.id),
    label: localize(virtue.name),
    image: virtue.images?.icon || "../assets/icons/00.webp"
  }));
  const options = [
    { value: "all", label: state.lang === "pt" ? "Escolha uma característica" : "Choose a trait", image: "../assets/icons/00.webp" },
    ...virtues,
    { value: "__none", label: state.lang === "pt" ? "Sem virtudes associadas" : "No associated virtues", image: "../assets/icons/00.webp" }
  ];
  els.virtuePipSelects.forEach((select, index) => {
    if (!select) return;
    const current = state.virtuePipFilters[index]?.virtue || select.value || "all";
    select.innerHTML = options.map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`).join("");
    select.value = options.some((option) => option.value === current) ? current : "all";
    const selected = options.find((option) => option.value === select.value) || options[0];
    if (els.virtuePipIcons[index]) els.virtuePipIcons[index].src = selected.image;
  });
}

function updateVirtuePipIcons() {
  els.virtuePipSelects.forEach((select, index) => {
    if (!select || !els.virtuePipIcons[index]) return;
    const virtue = references.virtues.get(Number(select.value));
    els.virtuePipIcons[index].src = select.value === "__none" || !virtue
      ? "../assets/icons/00.webp"
      : virtue.images?.icon || "../assets/icons/00.webp";
  });
}

function populateFilters() {
  populateSelect(els.championFilter, uniqueSorted(decksData.flatMap((deck) => getDeckFilterValues(deck, "champion"))), t("all"));
  populateSelect(els.territoryFilter, uniqueSorted(decksData.flatMap((deck) => getDeckFilterValues(deck, "territory"))), t("all"));
  populateSelect(els.templeFilter, uniqueSorted(decksData.flatMap((deck) => getDeckFilterValues(deck, "temple"))), t("all"));
  populateVirtuePipSelects();
  setRangeControl(els.minAvgCostFilter, els.maxAvgCostFilter, els.avgCostValue, avgBounds.cost, state.minAvgCost, state.maxAvgCost);
  setRangeControl(els.minAvgPowerFilter, els.maxAvgPowerFilter, els.avgPowerValue, avgBounds.power, state.minAvgPower, state.maxAvgPower);
  setRangeControl(els.minAvgResistanceFilter, els.maxAvgResistanceFilter, els.avgResistanceValue, avgBounds.resistance, state.minAvgResistance, state.maxAvgResistance);
  state.virtuePipFilters.forEach((filter, index) => {
    setRangeControl(
      els.minVirtuePipFilters[index],
      els.maxVirtuePipFilters[index],
      els.virtuePipValues[index],
      avgBounds.virtuePips,
      filter.min,
      filter.max
    );
  });
}

function deckMatchesSelect(deck, field, selected) {
  if (!selected || selected === "all") return true;
  return getDeckFilterValues(deck, field).some((value) => value === selected);
}

function filterDecks() {
  return decksData.filter((deck) => {
    if (state.name && !includesText(deck.name, state.name)) return false;
    if (state.creator && !includesText(deck.creator?.name, state.creator)) return false;
    if (!deckMatchesSelect(deck, "champion", state.champion)) return false;
    if (!deckMatchesSelect(deck, "territory", state.territory)) return false;
    if (!deckMatchesSelect(deck, "temple", state.temple)) return false;
    if (getDeckAverage(deck, "cost") < state.minAvgCost || getDeckAverage(deck, "cost") > state.maxAvgCost) return false;
    if (getDeckAverage(deck, "power") < state.minAvgPower || getDeckAverage(deck, "power") > state.maxAvgPower) return false;
    if (getDeckAverage(deck, "resistance") < state.minAvgResistance || getDeckAverage(deck, "resistance") > state.maxAvgResistance) return false;
    const matchesVirtuePips = state.virtuePipFilters.every((filter) => {
      if (!filter?.virtue || filter.virtue === "all") return true;
      const count = getDeckVirtuePipCount(deck, filter.virtue);
      return count >= filter.min && count <= filter.max;
    });
    if (!matchesVirtuePips) return false;
    return true;
  });
}

function sortDecks(decks) {
  const locale = state.lang === "pt" ? "pt-BR" : "en-US";
  const sorted = [...decks];
  sorted.sort((a, b) => {
    if (state.sort === "cards-desc") return b.cards.length - a.cards.length || getDeckName(a).localeCompare(getDeckName(b), locale);
    if (state.sort === "cost-asc") return toNumber(a.analysis?.averages?.cost?.value, 0) - toNumber(b.analysis?.averages?.cost?.value, 0);
    if (state.sort === "cost-desc") return toNumber(b.analysis?.averages?.cost?.value, 0) - toNumber(a.analysis?.averages?.cost?.value, 0);
    return getDeckName(a).localeCompare(getDeckName(b), locale);
  });
  return sorted;
}

function setCatalogMessage(title, body) {
  els.decksGrid.innerHTML = `
    <article class="empty-state">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(body)}</p>
    </article>
  `;
  els.pagination.innerHTML = "";
}

function renderResultsSummary(total) {
  if (!els.resultsCount) return;
  if (total === 0) {
    els.resultsCount.innerHTML = `<strong>${escapeHtml(t("emptyTitle"))}</strong><span>${escapeHtml(t("emptyBody"))}</span>`;
    return;
  }
  els.resultsCount.innerHTML = `${total} ${escapeHtml(t("decksFound"))}`;
}

function getActiveFilters() {
  const filters = [];
  if (state.name) filters.push({ key: "name", label: "Nome", value: state.name });
  if (state.creator) filters.push({ key: "creator", label: "Criador", value: state.creator });
  [
    ["champion", "Campeão"],
    ["territory", "Território"],
    ["temple", "Templo"]
  ].forEach(([key, label]) => {
    if (state[key] && state[key] !== "all") filters.push({ key, label, value: state[key] });
  });
  if (!rangeMatchesBounds(state.minAvgCost, state.maxAvgCost, avgBounds.cost)) {
    filters.push({ key: "avgCost", label: "Custo médio", value: `${state.minAvgCost}-${state.maxAvgCost}` });
  }
  if (!rangeMatchesBounds(state.minAvgPower, state.maxAvgPower, avgBounds.power)) {
    filters.push({ key: "avgPower", label: "Poder médio", value: `${state.minAvgPower}-${state.maxAvgPower}` });
  }
  if (!rangeMatchesBounds(state.minAvgResistance, state.maxAvgResistance, avgBounds.resistance)) {
    filters.push({ key: "avgResistance", label: "Resistência média", value: `${state.minAvgResistance}-${state.maxAvgResistance}` });
  }
  state.virtuePipFilters.forEach((filter, index) => {
    if (!filter?.virtue || filter.virtue === "all") return;
    const label = filter.virtue === "__none"
      ? "Sem virtudes"
      : localize(references.virtues.get(Number(filter.virtue))?.name) || filter.virtue;
    filters.push({ key: `virtuePip:${index}`, label, value: `${filter.min}-${filter.max}` });
  });
  return filters;
}

function clearFilter(key) {
  if (["name", "creator"].includes(key)) state[key] = "";
  else if (key === "avgCost") {
    state.minAvgCost = avgBounds.cost.min;
    state.maxAvgCost = avgBounds.cost.max;
  } else if (key === "avgPower") {
    state.minAvgPower = avgBounds.power.min;
    state.maxAvgPower = avgBounds.power.max;
  } else if (key === "avgResistance") {
    state.minAvgResistance = avgBounds.resistance.min;
    state.maxAvgResistance = avgBounds.resistance.max;
  } else if (key.startsWith("virtuePip:")) {
    const index = Number(key.split(":")[1]);
    state.virtuePipFilters[index] = { virtue: "all", min: avgBounds.virtuePips.min, max: avgBounds.virtuePips.max };
  }
  else state[key] = "all";
  state.currentPage = 1;
  syncControlsFromState();
  renderDecks();
}

function renderActiveFilters() {
  if (!els.activeFilters) return;
  const filters = getActiveFilters();
  if (!filters.length) {
    els.activeFilters.innerHTML = `<span class="active-filter-chip">${escapeHtml(t("noActiveFilters"))}</span>`;
    return;
  }
  els.activeFilters.innerHTML = `
    ${filters.map((filter) => `
      <span class="active-filter-chip">${escapeHtml(filter.label)}: ${escapeHtml(filter.value)}
        <button type="button" data-clear-filter="${escapeHtml(filter.key)}" aria-label="Remover filtro">×</button>
      </span>
    `).join("")}
    <button class="active-filter-clear" type="button" data-clear-all>${escapeHtml(t("clearAllFilters"))}</button>
  `;
}

function renderDeckCard(deck) {
  const identity = getDeckIdentityCards(deck);
  const pips = normalizeList(deck.analysis?.virtuePips).slice(0, 4);
  const avgCost = deck.analysis?.averages?.cost;
  const avgAtk = deck.analysis?.averages?.attack;
  const avgRes = deck.analysis?.averages?.resistance;
  const metricPills = [
    { symbol: "cost", value: formatMetric(avgCost?.value), tone: toneForDelta(avgCost, "lower"), label: t("avgCost") },
    { symbol: "sword", value: formatMetric(avgAtk?.value), tone: toneForDelta(avgAtk, "higher"), label: t("avgAtk") },
    { symbol: "shield", value: formatMetric(avgRes?.value), tone: toneForDelta(avgRes, "higher"), label: t("avgRes") }
  ];
  const virtuePills = pips.map((pip) => {
    const virtue = references.virtues.get(Number(pip.id));
    return {
      image: virtue?.images?.icon || "",
      value: String(pip.value ?? "-"),
      tone: toneForDelta(pip, "higher"),
      label: pip.label || ""
    };
  });
  const displayPills = [...metricPills, ...virtuePills].slice(0, 7);

  return `
    <article class="deck-entry">
      <button class="deck-entry-button" type="button" data-deck-id="${escapeHtml(deck.id)}">
        <div class="deck-entry-media">
          ${identity.map((card) => `
            <span class="identity-thumb">
              <img class="${isHorizontalCard(card) ? "deck-card-image--horizontal" : ""}" data-preview-image="${escapeHtml(card.images?.card || "")}" src="${escapeHtml(card.images?.card || "")}" alt="${escapeHtml(getCardName(card))}" loading="lazy" />
            </span>
          `).join("")}
        </div>
        <div class="deck-entry-body">
          <div class="deck-entry-kicker">
            <span>${escapeHtml(getDeckName(deck))}</span>
          </div>
          <div class="deck-pips deck-pips--seven">
            ${displayPills.map((pill) => `
              <span class="${pill.image ? "virtue-mark-compact" : "metric-mark"}" title="${escapeHtml(pill.label || "")}">
                ${pill.symbol ? statusSymbol(pill.symbol) : ""}
                ${pill.image ? `<img src="${escapeHtml(pill.image)}" alt="${escapeHtml(pill.label || "")}" loading="lazy" />` : ""}
                <span class="pip-badge pip-badge--${escapeHtml(pill.tone || "neutral")}">${escapeHtml(String(pill.value))}</span>
              </span>
            `).join("")}
          </div>
        </div>
      </button>
      <a class="deck-play-link" href="../play/?deck=${encodeURIComponent(deck.id)}">Jogar contra bot</a>
    </article>
  `;
}

function renderPagination(total) {
  if (!els.pagination) return;
  const totalPages = Math.max(1, Math.ceil(total / state.itemsPerPage));
  state.currentPage = Math.min(state.currentPage, totalPages);
  const start = total === 0 ? 0 : (state.currentPage - 1) * state.itemsPerPage + 1;
  const end = Math.min(total, state.currentPage * state.itemsPerPage);
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  els.pagination.innerHTML = `
    <div class="pagination-info">${escapeHtml(t("showing"))} ${start}-${end} ${escapeHtml(t("of"))} ${total}</div>
    <div class="pagination-controls">
      <button class="page-btn" type="button" data-page="${state.currentPage - 1}" ${state.currentPage === 1 ? "disabled" : ""}>${escapeHtml(t("previous"))}</button>
      ${pages.map((page) => `<button class="page-btn ${page === state.currentPage ? "is-active" : ""}" type="button" data-page="${page}">${page}</button>`).join("")}
      <button class="page-btn" type="button" data-page="${state.currentPage + 1}" ${state.currentPage === totalPages ? "disabled" : ""}>${escapeHtml(t("next"))}</button>
    </div>
  `;
}

function renderDecks() {
  const filtered = sortDecks(filterDecks());
  const total = filtered.length;
  renderResultsSummary(total);
  renderActiveFilters();
  renderPagination(total);

  if (!total) {
    setCatalogMessage(t("emptyTitle"), t("emptyBody"));
    saveUiState();
    return;
  }

  const start = (state.currentPage - 1) * state.itemsPerPage;
  const pageItems = filtered.slice(start, start + state.itemsPerPage);
  els.decksGrid.innerHTML = pageItems.map(renderDeckCard).join("");
  saveUiState();
}

function renderMetricRows(items, kind, mode) {
  const list = normalizeList(items);
  if (!list.length) return `<p>${escapeHtml(t("noData"))}</p>`;
  return `
    <div class="metric-list metric-list--pips">
      ${list.map((item) => {
        const isActive = activeDrawerFilter?.kind === kind && activeDrawerFilter?.value === item.label;
        return `
        <button class="analysis-metric ${isActive ? "is-active" : ""}" type="button" data-analysis-kind="${escapeHtml(kind)}" data-analysis-value="${escapeHtml(item.label || "")}" title="${escapeHtml(item.label || "")}">
          <strong>${escapeHtml(item.label)}</strong>
          <span class="pip-badge pip-badge--${escapeHtml(toneForDelta(item, mode))}">${escapeHtml(formatMetric(item.value))}</span>
        </button>
      `;
      }).join("")}
    </div>
  `;
}

function renderAnalysisCard(title, items, kind, mode) {
  return `
    <article class="analysis-card">
      <span class="section-kicker">${escapeHtml(title)}</span>
      ${renderMetricRows(items, kind, mode)}
    </article>
  `;
}

function mergeAnalysisMetrics(countItems, costItems) {
  const costsByLabel = new Map(normalizeList(costItems).map((item) => [item.label, item]));
  return normalizeList(countItems).map((countItem) => ({
    label: countItem.label,
    count: countItem,
    cost: costsByLabel.get(countItem.label)
  }));
}

function renderCombinedMetricRows(countItems, costItems, kind) {
  const rows = mergeAnalysisMetrics(countItems, costItems);
  if (!rows.length) return `<p>${escapeHtml(t("noData"))}</p>`;
  return `
    <div class="metric-list metric-list--combined">
      ${rows.map((row) => {
        const isActive = activeDrawerFilter?.kind === kind && activeDrawerFilter?.value === row.label;
        return `
          <button class="analysis-metric analysis-metric--combined ${isActive ? "is-active" : ""}" type="button" data-analysis-kind="${escapeHtml(kind)}" data-analysis-value="${escapeHtml(row.label || "")}" title="${escapeHtml(row.label || "")}">
            <strong>${escapeHtml(row.label)}</strong>
            <span class="metric-badges">
              <span class="pip-badge pip-badge--inline pip-badge--${escapeHtml(toneForDelta(row.count, "higher"))}">${escapeHtml(formatMetric(row.count?.value))}</span>
              <span class="pip-badge pip-badge--inline pip-badge--${escapeHtml(toneForDelta(row.cost, "lower"))}">${statusSymbol("cost")}${escapeHtml(formatMetric(row.cost?.value))}</span>
            </span>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function renderCombinedAnalysisCard(title, countItems, costItems, kind) {
  return `
    <article class="analysis-card">
      <span class="section-kicker">${escapeHtml(title)}</span>
      ${renderCombinedMetricRows(countItems, costItems, kind)}
    </article>
  `;
}

function isHorizontalCard(card) {
  return card?.code?.includes("-TER-") || card?.code?.includes("-TEM-");
}

function renderIdentitySection(deck) {
  const resolved = getDeckResolvedCards(deck);
  const identityCards = [...resolved.champions, ...resolved.territories, ...resolved.temples];
  return `
    <div class="identity-grid identity-grid--inline">
      ${identityCards.map((card) => `
        <figure class="identity-card identity-card--inline ${cardMatchesDrawerFilter(card, activeDrawerFilter) ? "" : "is-muted"}">
          <img class="deck-card-image ${isHorizontalCard(card) ? "deck-card-image--horizontal identity-card-image--large" : "identity-card-image--large"}" data-preview-image="${escapeHtml(card.images?.card || "")}" src="${escapeHtml(card.images?.card || "")}" alt="${escapeHtml(getCardName(card))}" loading="lazy" />
        </figure>
      `).join("")}
    </div>
  `;
}

function renderVirtuePips(deck) {
  const pips = normalizeList(deck.analysis?.virtuePips);
  const cards = getDeckAllCards(deck);
  const noVirtuesCount = cards.filter((card) => !getCardVirtueLabels(card).length).length;
  const allPips = [
    ...pips.map((pip) => ({ ...pip, filterValue: pip.label, image: references.virtues.get(Number(pip.id))?.images?.icon || "" })),
    {
      id: "__none",
      label: state.lang === "pt" ? "Sem virtudes associadas" : "No associated virtues",
      filterValue: "__none",
      value: noVirtuesCount,
      delta: noVirtuesCount,
      image: "../assets/icons/00.webp"
    }
  ];
  if (!allPips.length) return `<p>${escapeHtml(t("noData"))}</p>`;
  return `
    <div class="deck-pips deck-pips--analysis">
      ${allPips.map((pip) => {
        const isActive = activeDrawerFilter?.kind === "virtue" && activeDrawerFilter?.value === pip.filterValue;
        return `
          <button class="virtue-mark-compact virtue-mark-compact--drawer ${isActive ? "is-active" : ""}" type="button" data-analysis-kind="virtue" data-analysis-value="${escapeHtml(pip.filterValue || "")}" title="${escapeHtml(pip.label || "")}">
            ${pip.image ? `<img src="${escapeHtml(pip.image)}" alt="${escapeHtml(pip.label || "")}" loading="lazy" />` : ""}
            <span class="pip-badge pip-badge--${escapeHtml(toneForDelta(pip, "higher"))}">${escapeHtml(String(pip.value ?? "-"))}</span>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

function renderAverageStats(deck) {
  const avg = deck.analysis?.averages || {};
  return `
    <div class="deck-pips deck-pips--analysis">
      <span class="metric-mark metric-mark--drawer" title="${escapeHtml(t("avgCost"))}">
        ${statusSymbol("cost")}
        <span class="pip-badge pip-badge--${escapeHtml(toneForDelta(avg.cost, "lower"))}">${escapeHtml(formatMetric(avg.cost?.value))}</span>
      </span>
      <span class="metric-mark metric-mark--drawer" title="${escapeHtml(t("avgAtk"))}">
        ${statusSymbol("sword")}
        <span class="pip-badge pip-badge--${escapeHtml(toneForDelta(avg.attack, "higher"))}">${escapeHtml(formatMetric(avg.attack?.value))}</span>
      </span>
      <span class="metric-mark metric-mark--drawer" title="${escapeHtml(t("avgRes"))}">
        ${statusSymbol("shield")}
        <span class="pip-badge pip-badge--${escapeHtml(toneForDelta(avg.resistance, "higher"))}">${escapeHtml(formatMetric(avg.resistance?.value))}</span>
      </span>
    </div>
  `;
}

function renderDeckListControls() {
  return `
    <div class="drawer-deck-list-controls">
      <div class="drawer-deck-view-mode" role="group" aria-label="${escapeHtml(t("decklist"))}">
        <button type="button" class="${state.drawerView === "lanes" ? "is-active" : ""}" data-drawer-deck-view="lanes">${escapeHtml(t("lanesView"))}</button>
        <button type="button" class="${state.drawerView === "list" ? "is-active" : ""}" data-drawer-deck-view="list">${escapeHtml(t("listView"))}</button>
      </div>
      ${state.drawerView === "lanes" ? `
        <div class="drawer-deck-lane-actions">
          <button type="button" class="${state.drawerLaneSort === "cost" ? "is-active" : ""}" data-drawer-lane-sort="cost">${escapeHtml(t("organizeByCost"))}</button>
          <button type="button" class="${state.drawerLaneSort === "type" ? "is-active" : ""}" data-drawer-lane-sort="type">${escapeHtml(t("organizeByType"))}</button>
        </div>
      ` : ""}
    </div>
  `;
}

function renderDrawerDeckBoardCard(card) {
  return `
    <a class="drawer-board-card ${cardMatchesDrawerFilter(card, activeDrawerFilter) ? "" : "is-muted"}" href="../cards/?id=${encodeURIComponent(card.code)}" title="${escapeHtml(getCardName(card))}">
      <img class="deck-card-image" data-preview-image="${escapeHtml(card.images?.card || "")}" src="${escapeHtml(card.images?.card || "")}" alt="${escapeHtml(getCardName(card))}" loading="lazy" />
    </a>
  `;
}

function renderDrawerIdentitySlot(card, label) {
  return `
    <a class="drawer-identity-slot ${card ? "is-filled" : ""} ${card && isHorizontalCard(card) ? "is-landscape" : ""} ${card && !cardMatchesDrawerFilter(card, activeDrawerFilter) ? "is-muted" : ""}" ${card ? `href="../cards/?id=${encodeURIComponent(card.code)}"` : ""} title="${escapeHtml(card ? getCardName(card) : label)}">
      <span>${escapeHtml(label)}</span>
      ${card ? `<img class="deck-card-image ${isHorizontalCard(card) ? "deck-card-image--horizontal" : ""}" data-preview-image="${escapeHtml(card.images?.card || "")}" src="${escapeHtml(card.images?.card || "")}" alt="${escapeHtml(getCardName(card))}" loading="lazy" />` : `<strong>-</strong>`}
    </a>
  `;
}

function renderDrawerIdentityLane(deck) {
  const resolved = getDeckResolvedCards(deck);
  const champion = resolved.champions[0] || null;
  const temple = resolved.temples[0] || null;
  const territory = resolved.territories[0] || null;
  return `
    <section class="drawer-deck-lane drawer-deck-lane--identity" aria-label="${escapeHtml(t("identity"))}">
      <div class="drawer-identity-stack">
        ${renderDrawerIdentitySlot(champion, t("champion"))}
        ${renderDrawerIdentitySlot(temple, t("temple"))}
        ${renderDrawerIdentitySlot(territory, t("territory"))}
      </div>
    </section>
  `;
}

function renderDeckBoard(deck, cards) {
  const lanes = buildDeckLanes(cards, state.drawerLaneSort);
  const laneKeys = state.drawerLaneSort === "type" ? DECK_LANES.filter((lane) => lane !== "6+") : DECK_LANES;
  return `
    <div class="drawer-deck-board" aria-label="${escapeHtml(t("decklist"))}">
      ${renderDrawerIdentityLane(deck)}
      ${laneKeys.map((lane) => `
        <section class="drawer-deck-lane" data-lane="${escapeHtml(lane)}">
          <div class="drawer-deck-lane-label">
            <strong>${escapeHtml(getLaneLabel(lane, state.drawerLaneSort))}</strong>
            <span>${escapeHtml(String((lanes[lane] || []).length))}</span>
          </div>
          <div class="drawer-deck-lane-stack">
            ${(lanes[lane] || []).map(renderDrawerDeckBoardCard).join("")}
          </div>
        </section>
      `).join("")}
    </div>
  `;
}

function renderDeckGridList(deck, cards) {
  return `
    ${renderIdentitySection(deck)}
    <div class="deck-list-grid">
      ${cards.map((card) => `
        <a class="deck-list-item ${cardMatchesDrawerFilter(card, activeDrawerFilter) ? "" : "is-muted"}" href="../cards/?id=${encodeURIComponent(card.code)}" title="${escapeHtml(getCardName(card))}">
          <img class="deck-card-image" data-preview-image="${escapeHtml(card.images?.card || "")}" src="${escapeHtml(card.images?.card || "")}" alt="${escapeHtml(getCardName(card))}" loading="lazy" />
        </a>
      `).join("")}
    </div>
  `;
}

function renderDeckList(deck) {
  const cards = sortDeckCards(resolveCards(deck.cards));
  return `
    <section class="analysis-section" data-deck-list-section>
      <div class="deck-list-head">
        <span class="section-kicker">${escapeHtml(t("decklist"))}</span>
        ${renderDeckListControls()}
      </div>
      ${state.drawerView === "lanes" ? renderDeckBoard(deck, cards) : renderDeckGridList(deck, cards)}
    </section>
  `;
}

function openDrawer(deckId) {
  const deck = decksData.find((item) => item.id === deckId);
  if (!deck) return;
  activeDrawerFilter = null;

  const resolved = getDeckResolvedCards(deck);
  const background = resolved.champions[0]?.images?.art || resolved.champions[0]?.images?.card || resolved.main[0]?.images?.art || "";
  if (els.drawerPanel) els.drawerPanel.style.setProperty("--drawer-bg", `url("${cssUrl(background)}")`);
  els.drawerContent.dataset.deckId = deck.id;

  els.drawerContent.innerHTML = `
    <div class="deck-detail-layout">
      <aside class="deck-detail-side">
        <section class="analysis-section">
          <span class="section-kicker">${escapeHtml(t("analysis"))}</span>
          <span class="section-kicker section-kicker--sub">${escapeHtml(`${t("avgCost")} / ${t("avgAtk")} / ${t("avgRes")}`)}</span>
          ${renderAverageStats(deck)}
          <span class="section-kicker section-kicker--sub">${escapeHtml(t("virtuePips"))}</span>
          ${renderVirtuePips(deck)}
          <div class="analysis-grid">
            ${renderCombinedAnalysisCard(t("typesSummary"), deck.analysis?.typeCounts, deck.analysis?.averageCostByType, "type")}
            ${renderCombinedAnalysisCard(t("functionsSummary"), deck.analysis?.functionCounts, deck.analysis?.averageCostByFunction, "function")}
          </div>
        </section>
      </aside>
      <div class="deck-detail-main">
        <section class="deck-detail-heading">
          <span class="section-kicker">${escapeHtml(getDeckName(deck))}</span>
          <p>${escapeHtml(localize(deck.analysis?.summary))}</p>
        </section>
        ${renderDeckList(deck)}
      </div>
    </div>
  `;

  els.drawer.classList.add("is-open");
  els.drawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function refreshDrawerDeckList(deckId) {
  const deck = decksData.find((item) => item.id === deckId);
  if (!deck || !els.drawerContent) return;
  const deckListSection = els.drawerContent.querySelector("[data-deck-list-section]");
  if (deckListSection) deckListSection.outerHTML = renderDeckList(deck);
}

function updateActiveAnalysisMetrics() {
  els.drawerContent?.querySelectorAll("[data-analysis-kind]").forEach((button) => {
    const isActive = activeDrawerFilter
      && button.dataset.analysisKind === activeDrawerFilter.kind
      && button.dataset.analysisValue === activeDrawerFilter.value;
    button.classList.toggle("is-active", Boolean(isActive));
  });
}

function showHoverPreview(image, x, y) {
  if (!els.hoverPreview || !image) return;
  els.hoverPreview.innerHTML = `<img src="${escapeHtml(image)}" alt="" />`;
  const width = Math.min(300, Math.max(220, window.innerWidth * 0.24));
  const offset = 18;
  let left = x + offset;
  let top = y + offset;
  if (left + width > window.innerWidth - 12) left = x - width - offset;
  if (top + width * 1.35 > window.innerHeight - 12) top = window.innerHeight - (width * 1.35) - 12;
  els.hoverPreview.style.width = `${width}px`;
  els.hoverPreview.style.left = `${Math.max(8, left)}px`;
  els.hoverPreview.style.top = `${Math.max(8, top)}px`;
  els.hoverPreview.classList.add("is-visible");
}

function hideHoverPreview() {
  if (!els.hoverPreview) return;
  els.hoverPreview.classList.remove("is-visible");
}

function closeDrawer() {
  els.drawer.classList.remove("is-open");
  els.drawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function syncControlsFromState() {
  els.nameFilter.value = state.name;
  els.creatorFilter.value = state.creator;
  els.championFilter.value = state.champion;
  els.territoryFilter.value = state.territory;
  els.templeFilter.value = state.temple;
  els.sortSelect.value = state.sort;
  setRangeControl(els.minAvgCostFilter, els.maxAvgCostFilter, els.avgCostValue, avgBounds.cost, state.minAvgCost, state.maxAvgCost);
  setRangeControl(els.minAvgPowerFilter, els.maxAvgPowerFilter, els.avgPowerValue, avgBounds.power, state.minAvgPower, state.maxAvgPower);
  setRangeControl(els.minAvgResistanceFilter, els.maxAvgResistanceFilter, els.avgResistanceValue, avgBounds.resistance, state.minAvgResistance, state.maxAvgResistance);
  state.virtuePipFilters.forEach((filter, index) => {
    if (els.virtuePipSelects[index]) els.virtuePipSelects[index].value = filter.virtue;
    setRangeControl(
      els.minVirtuePipFilters[index],
      els.maxVirtuePipFilters[index],
      els.virtuePipValues[index],
      avgBounds.virtuePips,
      filter.min,
      filter.max
    );
  });
  updateVirtuePipIcons();
}

function updateStateFromControls() {
  state.name = els.nameFilter.value.trim();
  state.creator = els.creatorFilter.value.trim();
  state.champion = els.championFilter.value;
  state.territory = els.territoryFilter.value;
  state.temple = els.templeFilter.value;
  state.sort = els.sortSelect.value;
  const costRange = clampRangePair(els.minAvgCostFilter.value, els.maxAvgCostFilter.value, avgBounds.cost, 0.1);
  const powerRange = clampRangePair(els.minAvgPowerFilter.value, els.maxAvgPowerFilter.value, avgBounds.power, 0.1);
  const resistanceRange = clampRangePair(els.minAvgResistanceFilter.value, els.maxAvgResistanceFilter.value, avgBounds.resistance, 0.1);
  state.minAvgCost = costRange.min;
  state.maxAvgCost = costRange.max;
  state.minAvgPower = powerRange.min;
  state.maxAvgPower = powerRange.max;
  state.minAvgResistance = resistanceRange.min;
  state.maxAvgResistance = resistanceRange.max;
  state.virtuePipFilters = state.virtuePipFilters.map((filter, index) => {
    const range = clampRangePair(
      els.minVirtuePipFilters[index].value,
      els.maxVirtuePipFilters[index].value,
      avgBounds.virtuePips,
      1
    );
    return {
      virtue: els.virtuePipSelects[index].value,
      min: range.min,
      max: range.max
    };
  });
  state.currentPage = 1;
  syncControlsFromState();
  renderDecks();
}

function resetFilters() {
  Object.assign(state, {
    currentPage: 1,
    name: "",
    creator: "",
    champion: "all",
    territory: "all",
    temple: "all",
    minAvgCost: avgBounds.cost.min,
    maxAvgCost: avgBounds.cost.max,
    minAvgPower: avgBounds.power.min,
    maxAvgPower: avgBounds.power.max,
    minAvgResistance: avgBounds.resistance.min,
    maxAvgResistance: avgBounds.resistance.max,
    virtuePipFilters: [
      { virtue: "all", min: avgBounds.virtuePips.min, max: avgBounds.virtuePips.max },
      { virtue: "all", min: avgBounds.virtuePips.min, max: avgBounds.virtuePips.max },
      { virtue: "all", min: avgBounds.virtuePips.min, max: avgBounds.virtuePips.max }
    ]
  });
  syncControlsFromState();
  renderDecks();
}

function saveUiState() {
  try {
    const payload = {
      name: state.name,
      creator: state.creator,
      champion: state.champion,
      territory: state.territory,
      temple: state.temple,
      minAvgCost: state.minAvgCost,
      maxAvgCost: state.maxAvgCost,
      minAvgPower: state.minAvgPower,
      maxAvgPower: state.maxAvgPower,
      minAvgResistance: state.minAvgResistance,
      maxAvgResistance: state.maxAvgResistance,
      virtuePipFilters: state.virtuePipFilters,
      sort: state.sort,
      drawerView: state.drawerView,
      drawerLaneSort: state.drawerLaneSort
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("Could not persist deck filters", error);
  }
}

function restoreUiState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return;
    Object.assign(state, parsed, { currentPage: 1 });
    state.drawerView = parsed.drawerView === "list" ? "list" : "lanes";
    state.drawerLaneSort = parsed.drawerLaneSort === "type" ? "type" : "cost";
    state.virtuePipFilters = [0, 1, 2].map((index) => ({
      virtue: parsed.virtuePipFilters?.[index]?.virtue || "all",
      min: parsed.virtuePipFilters?.[index]?.min ?? avgBounds.virtuePips.min,
      max: parsed.virtuePipFilters?.[index]?.max ?? avgBounds.virtuePips.max
    }));
    normalizeStateRanges();
  } catch (error) {
    console.warn("Could not restore deck filters", error);
  }
}

function setLanguage(lang) {
  state.lang = lang;
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  els.langButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.lang === lang));
  document.querySelectorAll("[data-pt][data-en]").forEach((element) => {
    element.textContent = element.dataset[lang] || element.textContent;
  });
  populateFilters();
  syncControlsFromState();
  renderDecks();
}

function handleHeader() {
  if (!els.header) return;
  els.header.classList.toggle("is-scrolled", window.scrollY > 20);
}

function handleReveal() {
  const trigger = window.innerHeight * 0.9;
  document.querySelectorAll(".reveal").forEach((element) => {
    if (element.getBoundingClientRect().top < trigger) element.classList.add("is-visible");
  });
}

function bindEvents() {
  window.addEventListener("scroll", handleHeader, { passive: true });
  window.addEventListener("scroll", handleReveal, { passive: true });
  window.addEventListener("resize", handleReveal);
  els.mobileToggle?.addEventListener("click", () => {
    const isOpen = els.primaryNav.classList.toggle("is-open");
    els.mobileToggle.setAttribute("aria-expanded", String(isOpen));
  });
  els.langButtons.forEach((button) => button.addEventListener("click", () => setLanguage(button.dataset.lang || "pt")));
  [
    els.nameFilter,
    els.creatorFilter,
    els.championFilter,
    els.territoryFilter,
    els.templeFilter,
    els.minAvgCostFilter,
    els.maxAvgCostFilter,
    els.minAvgPowerFilter,
    els.maxAvgPowerFilter,
    els.minAvgResistanceFilter,
    els.maxAvgResistanceFilter,
    ...els.virtuePipSelects,
    ...els.minVirtuePipFilters,
    ...els.maxVirtuePipFilters,
    els.sortSelect
  ].forEach((control) => control?.addEventListener("input", updateStateFromControls));
  els.clearFilters?.addEventListener("click", resetFilters);
  els.decksGrid?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-deck-id]");
    if (button) openDrawer(button.dataset.deckId);
  });
  els.pagination?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-page]");
    if (!button || button.disabled) return;
    state.currentPage = Number(button.dataset.page);
    renderDecks();
  });
  els.activeFilters?.addEventListener("click", (event) => {
    const clearButton = event.target.closest("[data-clear-filter]");
    if (clearButton) clearFilter(clearButton.dataset.clearFilter);
    if (event.target.closest("[data-clear-all]")) resetFilters();
  });
  els.drawerBackdrop?.addEventListener("click", closeDrawer);
  els.drawerClose?.addEventListener("click", closeDrawer);
  els.drawerContent?.addEventListener("click", (event) => {
    const viewButton = event.target.closest("[data-drawer-deck-view]");
    if (viewButton) {
      state.drawerView = viewButton.dataset.drawerDeckView === "list" ? "list" : "lanes";
      saveUiState();
      refreshDrawerDeckList(els.drawerContent.dataset.deckId);
      return;
    }

    const laneSortButton = event.target.closest("[data-drawer-lane-sort]");
    if (laneSortButton) {
      state.drawerLaneSort = laneSortButton.dataset.drawerLaneSort === "type" ? "type" : "cost";
      state.drawerView = "lanes";
      saveUiState();
      refreshDrawerDeckList(els.drawerContent.dataset.deckId);
      return;
    }

    const metric = event.target.closest("[data-analysis-kind]");
    if (!metric) return;
    const nextFilter = {
      kind: metric.dataset.analysisKind,
      value: metric.dataset.analysisValue
    };
    const isSame = activeDrawerFilter?.kind === nextFilter.kind && activeDrawerFilter?.value === nextFilter.value;
    activeDrawerFilter = isSame ? null : nextFilter;
    updateActiveAnalysisMetrics();
    refreshDrawerDeckList(els.drawerContent.dataset.deckId);
  });
  document.addEventListener("pointermove", (event) => {
    const target = event.target.closest("[data-preview-image]");
    if (!target) return hideHoverPreview();
    showHoverPreview(target.getAttribute("data-preview-image"), event.clientX, event.clientY);
  }, { passive: true });
  document.addEventListener("pointerleave", hideHoverPreview);
  document.addEventListener("scroll", hideHoverPreview, { passive: true });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && els.drawer.classList.contains("is-open")) closeDrawer();
  });
}

async function loadJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}`);
  return response.json();
}

async function init() {
  bindEvents();
  handleHeader();
  handleReveal();
  setCatalogMessage(t("loadingTitle"), t("loadingBody"));

  try {
    const referenceEntries = Object.entries(REFERENCE_URLS);
    const [decksPayload, cardsPayload, ...referencePayloads] = await Promise.all([
      loadJson(DECKS_URL),
      loadJson(CARDS_URL),
      ...referenceEntries.map(([, url]) => loadJson(url))
    ]);

    const referenceData = Object.fromEntries(referenceEntries.map(([key], index) => [key, referencePayloads[index]]));
    references = {
      collections: mapById(referenceData.collections?.collections),
      types: mapById(referenceData.types?.types),
      subtypes: mapById(referenceData.subtypes?.subtypes),
      functions: mapById(referenceData.functions?.functions),
      roles: mapById(referenceData.roles?.roles),
      virtues: mapById(referenceData.virtues?.virtues)
    };

    cardsData = normalizeList(cardsPayload.cards).map((card, index) => normalizeCard(card, cardsPayload.defaults || {}, index));
    decksData = normalizeList(decksPayload.decks);
    calculateFilterBounds();
    state.minAvgCost = avgBounds.cost.min;
    state.maxAvgCost = avgBounds.cost.max;
    state.minAvgPower = avgBounds.power.min;
    state.maxAvgPower = avgBounds.power.max;
    state.minAvgResistance = avgBounds.resistance.min;
    state.maxAvgResistance = avgBounds.resistance.max;
    state.virtuePipFilters = state.virtuePipFilters.map(() => ({
      virtue: "all",
      min: avgBounds.virtuePips.min,
      max: avgBounds.virtuePips.max
    }));
    populateFilters();
    restoreUiState();
    syncControlsFromState();
    renderDecks();
  } catch (error) {
    console.error(error);
    renderResultsSummary(0);
    setCatalogMessage(t("errorTitle"), t("errorBody"));
  }
}

init();
