const DATA_URLS = {
  cards: "../data/game/cards.json",
  decks: "../data/game/decks.json",
  types: "../data/refs/types.json",
  subtypes: "../data/refs/subtypes.json",
  functions: "../data/refs/mechanics.json",
  collections: "../data/refs/collections.json",
  virtues: "../data/game/virtues.json"
};

const STORAGE_KEY = "adonai.deckbuilder.v1";
const MAIN_DECK_SIZE = 40;
const TYPE_CODES = {
  champion: "CMP",
  territory: "TER",
  temple: "TEM"
};
const BASE_DECK_LANES = ["0-1", "2", "3", "4", "5", "6+"];
const COST_LAYOUT_TYPE_ORDER = ["PEC", "ART", "MIL", "PER"];
const TYPE_LAYOUT_LANES = {
  PER: "0-1",
  MIL: "2",
  ART: "3",
  PEC: "4"
};

const els = {
  header: document.getElementById("siteHeader"),
  mobileToggle: document.getElementById("mobileToggle"),
  primaryNav: document.getElementById("primaryNav"),
  langButtons: document.querySelectorAll(".lang-btn"),
  deckStatus: document.getElementById("deckStatus"),
  cardSearch: document.getElementById("cardSearch"),
  typeFilter: document.getElementById("typeFilter"),
  subtypeFilter: document.getElementById("subtypeFilter"),
  functionFilter: document.getElementById("functionFilter"),
  costMinFilter: document.getElementById("costMinFilter"),
  costMaxFilter: document.getElementById("costMaxFilter"),
  attackMinFilter: document.getElementById("attackMinFilter"),
  attackMaxFilter: document.getElementById("attackMaxFilter"),
  resistanceMinFilter: document.getElementById("resistanceMinFilter"),
  resistanceMaxFilter: document.getElementById("resistanceMaxFilter"),
  costMinValue: document.getElementById("costMinValue"),
  costMaxValue: document.getElementById("costMaxValue"),
  attackMinValue: document.getElementById("attackMinValue"),
  attackMaxValue: document.getElementById("attackMaxValue"),
  resistanceMinValue: document.getElementById("resistanceMinValue"),
  resistanceMaxValue: document.getElementById("resistanceMaxValue"),
  virtueFilterList: document.getElementById("virtueFilterList"),
  cardCatalog: document.getElementById("cardCatalog"),
  cardsToggle: document.getElementById("cardsToggle"),
  mainCount: document.getElementById("mainCount"),
  championSlot: document.getElementById("championSlot"),
  territorySlot: document.getElementById("territorySlot"),
  templeSlot: document.getElementById("templeSlot"),
  deckList: document.getElementById("deckList"),
  exportDeck: document.getElementById("exportDeck"),
  importDeck: document.getElementById("importDeck"),
  clearDeck: document.getElementById("clearDeck"),
  deckText: document.getElementById("deckText"),
  speedPreference: document.getElementById("speedPreference"),
  mechanicPreference: document.getElementById("mechanicPreference"),
  requiredCards: document.getElementById("requiredCards"),
  bannedCards: document.getElementById("bannedCards"),
  requiredList: document.getElementById("requiredList"),
  bannedList: document.getElementById("bannedList"),
  generateDeck: document.getElementById("generateDeck"),
  completeDeck: document.getElementById("completeDeck"),
  improveDeck: document.getElementById("improveDeck"),
  playDeck: document.getElementById("playDeck"),
  filtersToggle: document.getElementById("filtersToggle"),
  chartsToggle: document.getElementById("chartsToggle"),
  assistantToggle: document.getElementById("assistantToggle"),
  analysisGrid: document.getElementById("analysisGrid"),
  functionAnalysis: document.getElementById("functionAnalysis"),
  curveChart: document.getElementById("curveChart"),
  curveSummary: document.getElementById("curveSummary"),
  virtueAffinity: document.getElementById("virtueAffinity"),
  suggestionList: document.getElementById("suggestionList")
};

const state = {
  lang: "pt",
  search: "",
  type: "all",
  subtype: "all",
  functionId: "all",
  costMin: "0",
  costMax: "6",
  attackMin: "0",
  attackMax: "10",
  resistanceMin: "0",
  resistanceMax: "30",
  virtues: [],
  filtersHidden: false,
  cardsHidden: false,
  chartsHidden: false,
  assistantHidden: false,
  identity: {
    champions: [],
    territories: [],
    temples: []
  },
  main: [],
  deckLayout: {
    mode: "free",
    activeCardId: "",
    laneOrder: [],
    lanes: {}
  },
  suggestions: [],
  selectedFunctionId: "",
  activeCatalogId: ""
};

let cards = [];
let decks = [];
let references = {
  types: new Map(),
  subtypes: new Map(),
  functions: new Map(),
  collections: new Map(),
  virtues: new Map()
};
let cardById = new Map();
let fieldAverages = {
  avgCost: 0,
  avgAttack: 0,
  avgResistance: 0,
  functionCounts: new Map(),
  virtueCounts: new Map()
};
let deckFrequency = new Map();
let activeDragPayload = null;

function escapeHtml(value) {
  return String(value === null || typeof value === "undefined" ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function localize(value) {
  if (value === null || typeof value === "undefined") return "";
  if (Array.isArray(value)) return value.map(localize).filter(Boolean).join(", ");
  if (typeof value === "object") {
    if (value[state.lang]) return value[state.lang];
    if (value.pt) return value.pt;
    if (value.en) return value.en;
    if (value.name) return localize(value.name);
    return "";
  }
  return String(value);
}

function normalizeSearch(value) {
  return String(value === null || typeof value === "undefined" ? "" : value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function toMap(payload, key) {
  return new Map((payload[key] || []).map((item) => [item.id, item]));
}

function toNumber(value, fallback) {
  const number = Number(Array.isArray(value) ? value[0] : value);
  return Number.isFinite(number) ? number : fallback;
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function getType(card) {
  return references.types.get((card.type || [])[0]) || null;
}

function getTypeCode(card) {
  const type = getType(card);
  return type && type.code ? type.code : "CRD";
}

function getTypeLabel(card) {
  const type = getType(card);
  return localize(type && type.name) || getTypeCode(card);
}

function getCollectionCode(card) {
  const collection = references.collections.get(card.collection || 1);
  return collection && collection.code ? collection.code : "FND";
}

function getCardId(card) {
  return `${getCollectionCode(card)}-${getTypeCode(card)}-${card.number}`;
}

function getCardName(card) {
  return localize(card.name);
}

function getAssetTypeName(card) {
  const type = getType(card);
  return type && type.name && type.name.pt ? type.name.pt : "Personagem";
}

function getCardImage(card) {
  if (card.images && card.images.card) return card.images.card;
  return `../assets/cards/${getAssetTypeName(card)} - Foundations-${Number(card.number)}.webp`;
}

function cardHasFunction(card, functionId) {
  return Boolean(functionId) && (card.functions || []).map(String).includes(String(functionId));
}

function getFunctionFocusClass(card) {
  if (!state.selectedFunctionId || !card) return "";
  return cardHasFunction(card, state.selectedFunctionId) ? "is-function-match" : "is-function-dimmed";
}

function getCost(card) {
  return toNumber(card.cost, 0);
}

function getCostLane(card) {
  if (getCost(card) <= 1) return "0-1";
  return getCost(card) >= 6 ? "6+" : String(Math.max(0, Math.floor(getCost(card))));
}

function getTypeOrder(card, order = COST_LAYOUT_TYPE_ORDER) {
  const index = order.indexOf(getTypeCode(card));
  return index >= 0 ? index : order.length;
}

function compareCardNames(a, b) {
  return getCardName(a).localeCompare(getCardName(b), "pt-BR") || getCardId(a).localeCompare(getCardId(b));
}

function compareCardsByCostLaneType(aId, bId) {
  const a = cardById.get(aId);
  const b = cardById.get(bId);
  if (!a || !b) return a ? -1 : b ? 1 : 0;
  return getTypeOrder(a) - getTypeOrder(b) || getCost(a) - getCost(b) || compareCardNames(a, b);
}

function compareCardsByCostThenType(aId, bId) {
  const a = cardById.get(aId);
  const b = cardById.get(bId);
  if (!a || !b) return a ? -1 : b ? 1 : 0;
  return getCost(a) - getCost(b) || getTypeOrder(a) - getTypeOrder(b) || compareCardNames(a, b);
}

function getTypeLayoutLane(card) {
  return TYPE_LAYOUT_LANES[getTypeCode(card)] || "5";
}

function getDefaultLaneOrder() {
  return BASE_DECK_LANES.slice();
}

function normalizeLaneOrder(layout) {
  const input = Array.isArray(layout && layout.laneOrder)
    ? layout.laneOrder.map(String)
    : getDefaultLaneOrder();
  const seen = new Set();
  const order = [];
  input.forEach((lane) => {
    if (!lane || seen.has(lane)) return;
    seen.add(lane);
    order.push(lane);
  });
  if (layout && layout.lanes && typeof layout.lanes === "object") {
    Object.keys(layout.lanes).forEach((lane) => {
      if (!lane || seen.has(lane) || !Array.isArray(layout.lanes[lane]) || !layout.lanes[lane].length) return;
      seen.add(lane);
      order.push(lane);
    });
  }
  return order;
}

function getDeckLaneOrder() {
  return normalizeLaneOrder(state.deckLayout);
}

function getDeckLaneInsertIndex(lane, laneOrder = state.deckLayout.laneOrder || []) {
  const baseIndex = BASE_DECK_LANES.indexOf(lane);
  if (baseIndex < 0) return laneOrder.length;
  const nextBaseIndex = laneOrder.findIndex((item) => {
    const itemIndex = BASE_DECK_LANES.indexOf(item);
    return itemIndex > baseIndex;
  });
  return nextBaseIndex >= 0 ? nextBaseIndex : laneOrder.length;
}

function ensureDeckLane(lane, insertIndex) {
  if (!lane) return;
  if (!state.deckLayout || !state.deckLayout.lanes) state.deckLayout = normalizeDeckLayout(state.deckLayout);
  if (!Array.isArray(state.deckLayout.lanes[lane])) state.deckLayout.lanes[lane] = [];
  if (state.deckLayout.laneOrder.includes(lane)) return;
  const rawIndex = Number(insertIndex);
  const fallbackIndex = getDeckLaneInsertIndex(lane);
  const index = Math.max(0, Math.min(Number.isFinite(rawIndex) ? rawIndex : fallbackIndex, state.deckLayout.laneOrder.length));
  state.deckLayout.laneOrder.splice(index, 0, lane);
}

function pruneEmptyDeckLanes() {
  if (!state.deckLayout || !state.deckLayout.lanes) return;
  const laneOrder = getDeckLaneOrder();
  state.deckLayout.laneOrder = laneOrder.filter((lane) => (state.deckLayout.lanes[lane] || []).length);
  Object.keys(state.deckLayout.lanes).forEach((lane) => {
    if (!state.deckLayout.laneOrder.includes(lane)) delete state.deckLayout.lanes[lane];
  });
}

function cleanDeckLayout() {
  syncDeckLayoutWithMain();
  pruneEmptyDeckLanes();
}

function createEmptyDeckLanes(laneOrder = getDefaultLaneOrder()) {
  return laneOrder.reduce((lanes, lane) => {
    lanes[lane] = [];
    return lanes;
  }, {});
}

function normalizeDeckLayout(layout) {
  const laneOrder = normalizeLaneOrder(layout);
  const lanes = createEmptyDeckLanes(laneOrder);
  if (layout && layout.lanes && typeof layout.lanes === "object") {
    laneOrder.forEach((lane) => {
      lanes[lane] = Array.isArray(layout.lanes[lane]) ? layout.lanes[lane].filter((id) => typeof id === "string") : [];
    });
  }
  return {
    mode: layout && layout.mode === "curve" ? "curve" : "free",
    activeCardId: layout && typeof layout.activeCardId === "string" ? layout.activeCardId : "",
    laneOrder,
    lanes
  };
}

function resetDeckLayoutByCost() {
  const laneOrder = getDefaultLaneOrder();
  const lanes = createEmptyDeckLanes(laneOrder);
  state.main.forEach((id) => {
    const card = cardById.get(id);
    if (!card) return;
    lanes[getCostLane(card)].push(id);
  });
  laneOrder.forEach((lane) => {
    lanes[lane].sort(compareCardsByCostLaneType);
  });
  state.deckLayout = {
    mode: "curve",
    activeCardId: "",
    laneOrder,
    lanes
  };
  pruneEmptyDeckLanes();
}

function resetDeckLayoutByType() {
  const laneOrder = getDefaultLaneOrder();
  const lanes = createEmptyDeckLanes(laneOrder);
  state.main.forEach((id) => {
    const card = cardById.get(id);
    if (!card) return;
    lanes[getTypeLayoutLane(card)].push(id);
  });
  laneOrder.forEach((lane) => {
    lanes[lane].sort(compareCardsByCostThenType);
  });
  state.deckLayout = {
    mode: "free",
    activeCardId: "",
    laneOrder,
    lanes
  };
  pruneEmptyDeckLanes();
}

function createCustomDeckLane(insertIndex) {
  state.deckLayout = normalizeDeckLayout(state.deckLayout);
  const laneOrder = getDeckLaneOrder();
  const rawIndex = Number(insertIndex);
  const index = Math.max(0, Math.min(Number.isFinite(rawIndex) ? rawIndex : laneOrder.length, laneOrder.length));
  const lane = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  laneOrder.splice(index, 0, lane);
  state.deckLayout.laneOrder = laneOrder;
  state.deckLayout.lanes[lane] = [];
  state.deckLayout.mode = "free";
  return lane;
}

function getLaneInsertIndexFromPoint(event) {
  const board = els.deckList.querySelector(".deck-board");
  if (!board) return getDeckLaneOrder().length;
  const lanes = [...board.querySelectorAll(".deck-lane:not(.deck-lane--identity)")];
  const lane = lanes.find((item) => {
    const rect = item.getBoundingClientRect();
    return event.clientX < rect.left + rect.width / 2;
  });
  return lane ? Math.max(0, lanes.indexOf(lane)) : lanes.length;
}

function syncDeckLayoutWithMain() {
  state.deckLayout = normalizeDeckLayout(state.deckLayout);
  const laneOrder = getDeckLaneOrder();
  const mainSet = new Set(state.main);
  const seen = new Set();

  laneOrder.forEach((lane) => {
    state.deckLayout.lanes[lane] = state.deckLayout.lanes[lane].filter((id) => {
      if (!mainSet.has(id) || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  });

  state.main.forEach((id) => {
    if (seen.has(id)) return;
    const card = cardById.get(id);
    if (!card) return;
    const lane = getCostLane(card);
    ensureDeckLane(lane);
    state.deckLayout.lanes[lane].push(id);
    seen.add(id);
  });

  if (!mainSet.has(state.deckLayout.activeCardId)) state.deckLayout.activeCardId = "";
}

function addCardToDeckLayout(id, preferredLane) {
  syncDeckLayoutWithMain();
  const card = cardById.get(id);
  if (!card) return;
  const laneOrder = getDeckLaneOrder();
  const lane = laneOrder.includes(preferredLane) ? preferredLane : getCostLane(card);
  ensureDeckLane(lane);
  laneOrder.forEach((key) => {
    state.deckLayout.lanes[key] = state.deckLayout.lanes[key].filter((item) => item !== id);
  });
  state.deckLayout.lanes[lane].push(id);
  pruneEmptyDeckLanes();
}

function moveCardInDeckLayout(id, lane, beforeId = "") {
  syncDeckLayoutWithMain();
  const laneOrder = getDeckLaneOrder();
  if (!laneOrder.includes(lane) || !state.main.includes(id)) return;
  laneOrder.forEach((key) => {
    state.deckLayout.lanes[key] = state.deckLayout.lanes[key].filter((item) => item !== id);
  });
  const target = state.deckLayout.lanes[lane];
  const beforeIndex = beforeId ? target.indexOf(beforeId) : -1;
  if (beforeIndex >= 0) target.splice(beforeIndex, 0, id);
  else target.push(id);
  state.deckLayout.mode = "free";
  pruneEmptyDeckLanes();
}

function getAttack(card) {
  return toNumber(card.stats && card.stats.attack, 0);
}

function getResistance(card) {
  return toNumber(card.stats && card.stats.resistance, 0);
}

function getFunctionLabels(card) {
  return (card.functions || [])
    .map((id) => references.functions.get(id))
    .filter(Boolean)
    .map((item) => localize(item.name));
}

function getVirtue(card) {
  return (card.virtues || []).map((id) => references.virtues.get(Number(id))).filter(Boolean);
}

function countVirtues(list) {
  const counts = new Map();
  list.forEach((card) => {
    (card.virtues || []).forEach((id) => counts.set(Number(id), (counts.get(Number(id)) || 0) + 1));
  });
  return counts;
}

function passesNumericRange(value, min, max) {
  if (min !== "all" && value < Number(min)) return false;
  if (max !== "all" && value > Number(max)) return false;
  return true;
}

function formatCostBucket(value) {
  return Number(value) >= 6 ? "6+" : String(value);
}

function clampRangeValue(value, fallback, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return String(Math.max(0, Math.min(max, number)));
}

function renderRangeValues() {
  els.costMinFilter.value = state.costMin;
  els.costMaxFilter.value = state.costMax;
  els.attackMinFilter.value = state.attackMin;
  els.attackMaxFilter.value = state.attackMax;
  els.resistanceMinFilter.value = state.resistanceMin;
  els.resistanceMaxFilter.value = state.resistanceMax;
  els.costMinValue.textContent = formatCostBucket(state.costMin);
  els.costMaxValue.textContent = formatCostBucket(state.costMax);
  els.attackMinValue.textContent = state.attackMin;
  els.attackMaxValue.textContent = state.attackMax;
  els.resistanceMinValue.textContent = state.resistanceMin;
  els.resistanceMaxValue.textContent = state.resistanceMax;
  renderRangeFill(els.costMinFilter, els.costMaxFilter, 6);
  renderRangeFill(els.attackMinFilter, els.attackMaxFilter, 10);
  renderRangeFill(els.resistanceMinFilter, els.resistanceMaxFilter, 30);
}

function renderRangeFill(minInput, maxInput, max) {
  const control = minInput.closest(".range-control");
  if (!control) return;
  const left = (Number(minInput.value) / max) * 100;
  const right = (Number(maxInput.value) / max) * 100;
  control.style.setProperty("--range-left", `${left}%`);
  control.style.setProperty("--range-right", `${right}%`);
}

function syncRangePair(changedKey, minKey, maxKey) {
  if (Number(state[minKey]) <= Number(state[maxKey])) return;
  if (changedKey === minKey) state[maxKey] = state[minKey];
  else state[minKey] = state[maxKey];
}

function isIdentityCard(card) {
  const code = getTypeCode(card);
  return code === TYPE_CODES.champion || code === TYPE_CODES.territory || code === TYPE_CODES.temple;
}

function getIdentityKey(card) {
  const code = getTypeCode(card);
  if (code === TYPE_CODES.champion) return "champions";
  if (code === TYPE_CODES.territory) return "territories";
  if (code === TYPE_CODES.temple) return "temples";
  return "";
}

function getMainCards() {
  return state.main.map((id) => cardById.get(id)).filter(Boolean);
}

function getIdentityCards() {
  return [].concat(state.identity.champions, state.identity.territories, state.identity.temples)
    .map((id) => cardById.get(id))
    .filter(Boolean);
}

function getAnalysisCards() {
  return getIdentityCards().concat(getMainCards());
}

function isSelected(id) {
  return state.main.includes(id) ||
    state.identity.champions.includes(id) ||
    state.identity.territories.includes(id) ||
    state.identity.temples.includes(id);
}

function getRequiredIds() {
  return parseIds(els.requiredCards.value);
}

function getBannedIds() {
  return parseIds(els.bannedCards.value);
}

function setTextIds(textarea, ids) {
  textarea.value = Array.from(new Set(ids)).join("\n");
}

function addTextId(textarea, id) {
  const ids = parseIds(textarea.value);
  if (!ids.includes(id)) ids.push(id);
  setTextIds(textarea, ids);
}

function removeTextId(textarea, id) {
  setTextIds(textarea, parseIds(textarea.value).filter((item) => item !== id));
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    filters: {
      search: els.cardSearch.value,
      type: state.type,
      subtype: state.subtype,
      functionId: state.functionId,
      costMin: state.costMin,
      costMax: state.costMax,
      attackMin: state.attackMin,
      attackMax: state.attackMax,
      resistanceMin: state.resistanceMin,
      resistanceMax: state.resistanceMax,
      virtues: state.virtues
    },
    filtersHidden: state.filtersHidden,
    cardsHidden: state.cardsHidden,
    chartsHidden: state.chartsHidden,
    assistantHidden: state.assistantHidden,
    identity: state.identity,
    main: state.main,
    deckLayout: state.deckLayout,
    selectedFunctionId: state.selectedFunctionId,
    speed: els.speedPreference.value,
    mechanic: els.mechanicPreference.value,
    required: els.requiredCards.value,
    banned: els.bannedCards.value
  }));
}

function enforceDeckConstraints() {
  const bannedIds = getBannedIds();
  state.main = state.main.filter((id, index, list) => !bannedIds.includes(id) && list.indexOf(id) === index);
  Object.keys(state.identity).forEach((key) => {
    state.identity[key] = state.identity[key].filter((id) => !bannedIds.includes(id)).slice(0, 1);
  });
  cleanDeckLayout();
}

function restoreState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (saved.identity) state.identity = saved.identity;
    if (Array.isArray(saved.main)) state.main = saved.main;
    if (saved.deckLayout) state.deckLayout = normalizeDeckLayout(saved.deckLayout);
    if (saved.speed) els.speedPreference.value = saved.speed;
    if (saved.mechanic) els.mechanicPreference.value = saved.mechanic;
    if (saved.required) els.requiredCards.value = saved.required;
    if (saved.banned) els.bannedCards.value = saved.banned;
    if (saved.filters) {
      state.search = normalizeSearch(saved.filters.search || "");
      state.type = saved.filters.type || "all";
      state.subtype = saved.filters.subtype || "all";
      state.functionId = saved.filters.functionId || "all";
      state.costMin = clampRangeValue(saved.filters.costMin, "0", 6);
      state.costMax = clampRangeValue(saved.filters.costMax, "6", 6);
      state.attackMin = clampRangeValue(saved.filters.attackMin, "0", 10);
      state.attackMax = clampRangeValue(saved.filters.attackMax, "10", 10);
      state.resistanceMin = clampRangeValue(saved.filters.resistanceMin, "0", 30);
      state.resistanceMax = String(saved.filters.resistanceMax) === "10" ? "30" : clampRangeValue(saved.filters.resistanceMax, "30", 30);
      state.virtues = Array.isArray(saved.filters.virtues) ? saved.filters.virtues.map(String) : [];
      els.cardSearch.value = saved.filters.search || "";
      els.typeFilter.value = state.type;
      els.subtypeFilter.value = state.subtype;
      els.functionFilter.value = state.functionId;
      els.costMinFilter.value = state.costMin;
      els.costMaxFilter.value = state.costMax;
      els.attackMinFilter.value = state.attackMin;
      els.attackMaxFilter.value = state.attackMax;
      els.resistanceMinFilter.value = state.resistanceMin;
      els.resistanceMaxFilter.value = state.resistanceMax;
    }
    state.filtersHidden = Boolean(saved.filtersHidden);
    state.cardsHidden = Boolean(saved.cardsHidden);
    state.chartsHidden = Boolean(saved.chartsHidden);
    state.assistantHidden = Boolean(saved.assistantHidden);
    state.selectedFunctionId = saved.selectedFunctionId ? String(saved.selectedFunctionId) : "";
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function addCard(card) {
  const id = getCardId(card);
  if (isIdentityCard(card)) {
    const key = getIdentityKey(card);
    state.identity[key] = [id];
    return;
  }
  if (state.main.includes(id) || state.main.length >= MAIN_DECK_SIZE) return;
  state.main.push(id);
  addCardToDeckLayout(id);
}

function handleCardAction(id, action) {
  const card = cardById.get(id);
  if (!card) return;
  if (action === "ban") {
    removeCard(id);
    addTextId(els.bannedCards, id);
    removeTextId(els.requiredCards, id);
    return;
  }
  if (action === "required") {
    addTextId(els.requiredCards, id);
    removeTextId(els.bannedCards, id);
    addCard(card);
    return;
  }
  addCard(card);
}

function handleDropAction(payload, zone, beforeId = "") {
  const id = payload.id;
  const source = payload.source || "";
  const card = cardById.get(id);
  if (!card) return;
  if (zone === "remove") {
    if (source === "required") removeTextId(els.requiredCards, id);
    else if (source === "banned") removeTextId(els.bannedCards, id);
    else removeCard(id);
    return;
  }
  if (zone === "required") {
    removeTextId(els.bannedCards, id);
    handleCardAction(id, "required");
    return;
  }
  if (zone === "banned") {
    removeTextId(els.requiredCards, id);
    handleCardAction(id, "ban");
    return;
  }
  if (zone && zone.startsWith("identity-")) {
    const key = zone.replace("identity-", "");
    if (getIdentityKey(card) === key) {
      removeTextId(els.bannedCards, id);
      state.identity[key] = [id];
    }
    return;
  }
  if (zone === "deck") {
    if (source === "banned") removeTextId(els.bannedCards, id);
    addCard(card);
    return;
  }
  if (zone && zone.startsWith("deck-new-lane-")) {
    if (isIdentityCard(card)) return;
    if (!state.main.includes(id)) {
      if (state.main.length >= MAIN_DECK_SIZE) return;
      state.main.push(id);
    }
    const lane = createCustomDeckLane(zone.replace("deck-new-lane-", ""));
    if (source === "banned") removeTextId(els.bannedCards, id);
    moveCardInDeckLayout(id, lane, beforeId);
    return;
  }
  if (zone && zone.startsWith("deck-lane-")) {
    const lane = zone.replace("deck-lane-", "");
    if (isIdentityCard(card)) return;
    if (source === "banned") removeTextId(els.bannedCards, id);
    if (!state.main.includes(id)) {
      if (state.main.length >= MAIN_DECK_SIZE) return;
      state.main.push(id);
    }
    moveCardInDeckLayout(id, lane, beforeId);
    return;
  }
  handleCardAction(id, "deck");
}

function setDragPayload(event, id, source) {
  if (!event.dataTransfer || !id) return false;
  activeDragPayload = { id, source };
  event.dataTransfer.setData("application/json", JSON.stringify({ id, source }));
  event.dataTransfer.setData("text/plain", id);
  event.dataTransfer.effectAllowed = source === "catalog" ? "copyMove" : "move";
  document.body.classList.add("is-dragging-card");
  return true;
}

function getDragPayload(event) {
  if (!event.dataTransfer) return { id: "", source: "" };
  try {
    const parsed = JSON.parse(event.dataTransfer.getData("application/json") || "{}");
    if (parsed && parsed.id) return parsed;
  } catch (error) {
    return { id: event.dataTransfer.getData("text/plain"), source: "" };
  }
  return { id: event.dataTransfer.getData("text/plain"), source: "" };
}

function clearDragPayload() {
  activeDragPayload = null;
  document.body.classList.remove("is-dragging-card");
  document.querySelectorAll(".is-drag-over").forEach((item) => item.classList.remove("is-drag-over"));
}

function removeCard(id) {
  state.main = state.main.filter((item) => item !== id);
  if (state.deckLayout && state.deckLayout.lanes) {
    getDeckLaneOrder().forEach((lane) => {
      state.deckLayout.lanes[lane] = (state.deckLayout.lanes[lane] || []).filter((item) => item !== id);
    });
    if (state.deckLayout.activeCardId === id) state.deckLayout.activeCardId = "";
    pruneEmptyDeckLanes();
  }
  Object.keys(state.identity).forEach((key) => {
    state.identity[key] = state.identity[key].filter((item) => item !== id);
  });
}

function renderAssistantState() {
  const layout = document.querySelector(".deckbuilder-layout");
  const catalogPanel = document.querySelector(".catalog-panel");
  if (layout) {
    layout.classList.toggle("is-assistant-hidden", state.assistantHidden);
    layout.classList.toggle("is-catalog-hidden", state.filtersHidden && state.cardsHidden);
  }
  if (catalogPanel) catalogPanel.classList.toggle("is-cards-hidden", state.cardsHidden);
  document.body.classList.toggle("is-filters-hidden", state.filtersHidden);
  document.body.classList.toggle("is-charts-hidden", state.chartsHidden);
  if (els.filtersToggle) {
    renderToggleButton(els.filtersToggle, state.filtersHidden, "filtros");
    els.filtersToggle.setAttribute("aria-expanded", String(!state.filtersHidden));
  }
  if (els.chartsToggle) {
    renderToggleButton(els.chartsToggle, state.chartsHidden, "gráficos");
    els.chartsToggle.setAttribute("aria-expanded", String(!state.chartsHidden));
  }
  if (els.assistantToggle) {
    renderToggleButton(els.assistantToggle, state.assistantHidden, "assistente");
    els.assistantToggle.setAttribute("aria-expanded", String(!state.assistantHidden));
  }
  if (els.cardsToggle) {
    renderToggleButton(els.cardsToggle, state.cardsHidden, "cartas");
    els.cardsToggle.setAttribute("aria-expanded", String(!state.cardsHidden));
  }
}

function renderToggleButton(button, isHidden, label) {
  const action = isHidden ? "Mostrar" : "Ocultar";
  const icon = isHidden ? "+" : "−";
  button.innerHTML = `<span class="toggle-icon" aria-hidden="true">${icon}</span><span>${action} ${escapeHtml(label)}</span>`;
}

function renderFilters() {
  const typeOptions = Array.from(references.types.values())
    .map((type) => `<option value="${type.id}">${escapeHtml(localize(type.name))}</option>`)
    .join("");
  els.typeFilter.innerHTML = `<option value="all">Todos os tipos</option>${typeOptions}`;

  const subtypeOptions = Array.from(references.subtypes.values())
    .map((subtype) => `<option value="${subtype.id}">${escapeHtml(localize(subtype.name))}</option>`)
    .join("");
  els.subtypeFilter.innerHTML = `<option value="all">Todos os subtipos</option>${subtypeOptions}`;

  const functionOptions = Array.from(references.functions.values())
    .map((fn) => `<option value="${fn.id}">${escapeHtml(localize(fn.name))}</option>`)
    .join("");
  els.functionFilter.innerHTML = `<option value="all">Todas as funções</option>${functionOptions}`;
  els.mechanicPreference.innerHTML = `<option value="all">Qualquer mecânica</option>${functionOptions}`;

  els.costMinFilter.value = state.costMin;
  els.costMaxFilter.value = state.costMax;
  els.attackMinFilter.value = state.attackMin;
  els.attackMaxFilter.value = state.attackMax;
  els.resistanceMinFilter.value = state.resistanceMin;
  els.resistanceMaxFilter.value = state.resistanceMax;
  renderRangeValues();

  els.virtueFilterList.innerHTML = Array.from(references.virtues.values()).map((virtue) => `
    <button class="virtue-filter" type="button" data-virtue-filter="${virtue.id}" title="${escapeHtml(localize(virtue.name))}">
      <img src="${escapeHtml(virtue.images && virtue.images.icon ? virtue.images.icon : "../assets/icons/00.webp")}" alt="" loading="lazy" />
      <span>${escapeHtml(localize(virtue.name))}</span>
    </button>
  `).join("");
}

function getFilteredCards() {
  const bannedIds = getBannedIds();
  return cards.filter((card) => {
    const id = getCardId(card);
    if (isSelected(id)) return false;
    if (bannedIds.includes(id)) return false;
    if (state.type !== "all" && String((card.type || [])[0]) !== state.type) return false;
    if (state.subtype !== "all" && !(card.subtype || []).map(String).includes(state.subtype)) return false;
    if (state.functionId !== "all" && !(card.functions || []).map(String).includes(state.functionId)) return false;
    if (!passesNumericRange(Math.min(6, getCost(card)), state.costMin, state.costMax)) return false;
    if (!passesNumericRange(getAttack(card), state.attackMin, state.attackMax)) return false;
    if (!passesNumericRange(getResistance(card), state.resistanceMin, state.resistanceMax)) return false;
    if (state.virtues.length) {
      const cardVirtues = (card.virtues || []).map(String);
      if (!state.virtues.every((id) => cardVirtues.includes(id))) return false;
    }
    if (state.search) {
      const haystack = [
        getCardId(card),
        getCardName(card),
        card.text || "",
        getTypeLabel(card),
        getFunctionLabels(card).join(" "),
        getVirtue(card).map((item) => localize(item.name)).join(" ")
      ].join(" ");
      if (!normalizeSearch(haystack).includes(state.search)) return false;
    }
    return true;
  });
}

function renderCatalog() {
  const filtered = getFilteredCards();
  renderRangeValues();
  if (!filtered.length) {
    els.cardCatalog.innerHTML = `<div class="lore-empty"><p>Nenhuma carta encontrada.</p><span>Reduza os filtros ou altere os valores de custo, ATK, RES e virtudes.</span></div>`;
    renderVirtueFilters();
    if (cards.length) saveState();
    return;
  }
  els.cardCatalog.innerHTML = filtered.map((card) => {
    const id = getCardId(card);
    const isActive = state.activeCatalogId === id;
    const functionFocusClass = getFunctionFocusClass(card);
    return `
      <article class="catalog-card ${isActive ? "is-actions-open" : ""} ${functionFocusClass}" data-card-id="${escapeHtml(id)}" draggable="true" title="${escapeHtml(getCardName(card))}">
        <img src="${escapeHtml(getCardImage(card))}" alt="${escapeHtml(getCardName(card))}" loading="lazy" />
        <div class="catalog-card-actions" aria-hidden="${isActive ? "false" : "true"}">
          <button type="button" data-card-action="deck" data-card-id="${escapeHtml(id)}">Deck</button>
          <button type="button" data-card-action="required" data-card-id="${escapeHtml(id)}">Fixar</button>
          <button type="button" data-card-action="ban" data-card-id="${escapeHtml(id)}">Proibir</button>
          <button type="button" data-card-action="close" data-card-id="${escapeHtml(id)}">Fechar</button>
        </div>
      </article>
    `;
  }).join("");
  renderVirtueFilters();
  if (cards.length) saveState();
}

function renderVirtueFilters() {
  els.virtueFilterList.querySelectorAll("[data-virtue-filter]").forEach((button) => {
    button.classList.toggle("is-active", state.virtues.includes(button.dataset.virtueFilter));
  });
}

function renderCardTiny(card, fallback) {
  if (!card) return `<span>${escapeHtml(fallback || "-")}</span>`;
  const imageClass = getTypeCode(card) === TYPE_CODES.territory || getTypeCode(card) === TYPE_CODES.temple ? " class=\"is-landscape\"" : "";
  return `<img${imageClass} src="${escapeHtml(getCardImage(card))}" alt="${escapeHtml(getCardName(card))}" loading="lazy" /><span>${escapeHtml(getCardName(card))}</span>`;
}

function renderIdentity() {
  const champion = cardById.get(state.identity.champions[0]);
  const territory = cardById.get(state.identity.territories[0]);
  const temple = cardById.get(state.identity.temples[0]);
  els.championSlot.innerHTML = renderCardTiny(champion, "-");
  els.territorySlot.innerHTML = renderCardTiny(territory, "-");
  els.templeSlot.innerHTML = renderCardTiny(temple, "-");
  document.querySelector('[data-remove-identity="champions"]').dataset.cardId = champion ? getCardId(champion) : "";
  document.querySelector('[data-remove-identity="territories"]').dataset.cardId = territory ? getCardId(territory) : "";
  document.querySelector('[data-remove-identity="temples"]').dataset.cardId = temple ? getCardId(temple) : "";
}

function renderDeckList() {
  if (els.mainCount) els.mainCount.textContent = `${state.main.length}/${MAIN_DECK_SIZE}`;
  cleanDeckLayout();
  const laneOrder = getDeckLaneOrder();
  const lanes = laneOrder.map((lane, index) => {
    const ids = state.deckLayout.lanes[lane] || [];
    return `
      ${index === 0 ? `<div class="deck-lane-insert" data-lane-insert="0" aria-label="Criar raia aqui"></div>` : ""}
      <section class="deck-lane" data-lane="${escapeHtml(lane)}">
        <div class="deck-lane-stack">
          ${ids.map((id, index) => renderDeckBoardCard(id, lane, index)).join("")}
        </div>
      </section>
      <div class="deck-lane-insert" data-lane-insert="${index + 1}" aria-label="Criar raia aqui"></div>
    `;
  }).join("");

  els.deckList.innerHTML = `
    <div class="deck-board-tools">
      <div class="deck-layout-mode" role="group" aria-label="Modo de organização do deck">
        <button type="button" class="${state.deckLayout.mode === "free" ? "is-active" : ""}" data-deck-layout-mode="free">Livre</button>
        <button type="button" class="${state.deckLayout.mode === "curve" ? "is-active" : ""}" data-deck-layout-mode="curve">Curva</button>
      </div>
      <div class="deck-layout-actions">
        <button class="deck-layout-reset" type="button" data-deck-layout-reset>Reorganizar por custo</button>
        <button class="deck-layout-reset" type="button" data-deck-layout-type>Reorganizar por tipo</button>
      </div>
    </div>
    <div class="deck-board" aria-label="Deck principal organizado em raias">
      ${renderIdentityLane()}
      ${lanes}
    </div>
  `;
  requestAnimationFrame(syncDeckBoardLaneHeights);
}

function syncDeckBoardLaneHeights() {
  const board = els.deckList.querySelector(".deck-board");
  if (!board) return;
  const lanes = [...board.querySelectorAll(".deck-lane")];
  if (!lanes.length) return;

  lanes.forEach((lane) => {
    lane.style.minHeight = "";
  });

  const boardHeight = board.clientHeight || 0;
  const maxHeight = lanes.reduce((max, lane) => {
    const laneTop = lane.getBoundingClientRect().top;
    const items = [...lane.querySelectorAll(".deck-board-card, .identity-board-slot")];
    const contentBottom = items.reduce((bottom, item) => {
      return Math.max(bottom, item.getBoundingClientRect().bottom - laneTop);
    }, 0);
    return Math.max(max, contentBottom + 20, boardHeight);
  }, boardHeight);

  lanes.forEach((lane) => {
    lane.style.minHeight = `${Math.ceil(maxHeight)}px`;
  });
}

function renderIdentityLane() {
  return `
    <section class="deck-lane deck-lane--identity" aria-label="Identidade">
      <div class="identity-lane-stack">
        ${renderIdentityLaneSlot("champions", "Campeão")}
        ${renderIdentityLaneSlot("temples", "Templo")}
        ${renderIdentityLaneSlot("territories", "Território")}
      </div>
    </section>
  `;
}

function renderIdentityLaneSlot(key, label) {
  const id = state.identity[key][0] || "";
  const card = id ? cardById.get(id) : null;
  const isLandscape = card && (getTypeCode(card) === TYPE_CODES.territory || getTypeCode(card) === TYPE_CODES.temple);
  const functionFocusClass = getFunctionFocusClass(card);
  return `
    <button class="identity-board-slot ${card ? "is-filled" : ""} ${isLandscape ? "is-landscape" : ""} ${functionFocusClass}" type="button" data-remove-identity="${escapeHtml(key)}" data-drop-zone="identity-${escapeHtml(key)}" data-card-id="${escapeHtml(id)}">
      <span>${escapeHtml(label)}</span>
      ${card ? `<img src="${escapeHtml(getCardImage(card))}" alt="${escapeHtml(getCardName(card))}" loading="lazy" />` : `<strong>-</strong>`}
    </button>
  `;
}

function renderDeckBoardCard(id, lane, index) {
  const card = cardById.get(id);
  if (!card) return "";
  const isActive = state.deckLayout.activeCardId === id;
  const functionFocusClass = getFunctionFocusClass(card);
  return `
    <article class="deck-board-card ${isActive ? "is-actions-open" : ""} ${functionFocusClass}" data-remove-card="${escapeHtml(id)}" data-deck-card="${escapeHtml(id)}" data-lane="${escapeHtml(lane)}" data-index="${index}" draggable="true">
      <img src="${escapeHtml(getCardImage(card))}" alt="${escapeHtml(getCardName(card))}" loading="lazy" />
      <div class="deck-board-card-actions" aria-hidden="${isActive ? "false" : "true"}">
        <div>
          <button type="button" data-deck-card-action="remove" data-card-id="${escapeHtml(id)}">Remover</button>
          <button type="button" data-deck-card-action="required" data-card-id="${escapeHtml(id)}">Fixar</button>
          <button type="button" data-deck-card-action="ban" data-card-id="${escapeHtml(id)}">Proibir</button>
        </div>
      </div>
    </article>
  `;
}

function analyzeDeck(cardList) {
  const list = cardList || getAnalysisCards();
  const total = list.length || 1;
  const functionCounts = new Map();
  const typeCounts = new Map();
  let cost = 0;
  let attack = 0;
  let resistance = 0;

  list.forEach((card) => {
    cost += getCost(card);
    attack += getAttack(card);
    resistance += getResistance(card);
    const type = getTypeLabel(card);
    typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
    (card.functions || []).forEach((id) => functionCounts.set(id, (functionCounts.get(id) || 0) + 1));
  });

  return {
    avgCost: round(cost / total),
    avgAttack: round(attack / total),
    avgResistance: round(resistance / total),
    curve: buildCurve(list),
    virtueCounts: countVirtues(list),
    typeCounts,
    functionCounts
  };
}

function buildCurve(list) {
  const curve = new Map();
  list.forEach((card) => {
    const cardCost = Math.max(0, Math.min(6, Math.floor(getCost(card))));
    const cost = cardCost <= 1 ? "0-1" : cardCost;
    if (!curve.has(cost)) curve.set(cost, new Map());
    const type = normalizeSearch(getTypeLabel(card)).split(" ")[0] || "outro";
    curve.get(cost).set(type, (curve.get(cost).get(type) || 0) + 1);
  });
  return curve;
}

function calculateFieldAverages() {
  deckFrequency = new Map();
  decks.forEach((deck) => {
    (deck.cards || []).concat(deck.identity ? [].concat(deck.identity.champions || [], deck.identity.territories || [], deck.identity.temples || []) : [])
      .forEach((id) => deckFrequency.set(id, (deckFrequency.get(id) || 0) + 1));
  });

  const analyses = decks.map((deck) => analyzeDeck((deck.cards || [])
    .map((id) => cardById.get(id))
    .filter(Boolean)));
  const total = analyses.length || 1;
  fieldAverages.avgCost = round(analyses.reduce((sum, item) => sum + item.avgCost, 0) / total);
  fieldAverages.avgAttack = round(analyses.reduce((sum, item) => sum + item.avgAttack, 0) / total);
  fieldAverages.avgResistance = round(analyses.reduce((sum, item) => sum + item.avgResistance, 0) / total);
  fieldAverages.functionCounts = new Map();
  fieldAverages.virtueCounts = new Map();
  analyses.forEach((analysis) => {
    analysis.functionCounts.forEach((value, key) => {
      fieldAverages.functionCounts.set(key, (fieldAverages.functionCounts.get(key) || 0) + value / total);
    });
    analysis.virtueCounts.forEach((value, key) => {
      fieldAverages.virtueCounts.set(key, (fieldAverages.virtueCounts.get(key) || 0) + value / total);
    });
  });
}

function renderStatus() {
  const identityOk = state.identity.champions.length === 1 && state.identity.territories.length === 1 && state.identity.temples.length === 1;
  const mainOk = state.main.length === MAIN_DECK_SIZE;
  const singletonOk = new Set(state.main).size === state.main.length;
  const valid = identityOk && mainOk && singletonOk;
  els.deckStatus.innerHTML = `
    ${renderStatusChip(identityOk, "Identidade", identityOk ? "3/3" : `${getIdentityCards().length}/3`)}
    ${renderStatusChip(mainOk, "Deck", `${state.main.length}/40`)}
    ${renderStatusChip(singletonOk, "Singleton", singletonOk ? "OK" : "Erro")}
    ${renderStatusChip(valid, valid ? "Válido" : "Incompleto", "")}
  `;
}

function renderStatusChip(isValid, label, value) {
  const icon = isValid ? "✓" : "!";
  return `<span class="status-chip ${isValid ? "is-valid" : "is-warning"}"><span class="status-icon" aria-hidden="true">${icon}</span>${escapeHtml(label)}${value ? ` <strong>${escapeHtml(value)}</strong>` : ""}</span>`;
}

function renderAnalysis() {
  const analysis = analyzeDeck();
  const curveAnalysis = analyzeDeck(getMainCards());

  const rows = Array.from(analysis.functionCounts.entries())
    .map(([id, value]) => ({
      id,
      value,
      avg: round(fieldAverages.functionCounts.get(id) || 0),
      label: localize((references.functions.get(id) || {}).name) || `Função ${id}`
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 18);

  els.functionAnalysis.innerHTML = rows.length ? rows.map((row) => `
    <button class="function-chip ${String(row.id) === state.selectedFunctionId ? "is-active" : ""}" type="button" data-function-focus="${escapeHtml(String(row.id))}" title="${escapeHtml(row.label)}" aria-pressed="${String(row.id) === state.selectedFunctionId ? "true" : "false"}">
      <strong>${escapeHtml(row.label)}</strong>
      <span>${renderCompareIndicator(round(row.value - row.avg), "higher")} ${row.value}</span>
    </button>
  `).join("") : `<span class="function-chip is-empty"><strong>Sem funções</strong><span>0</span></span>`;
  renderCurve(curveAnalysis.curve, curveAnalysis.avgCost, {
    avgAttack: curveAnalysis.avgAttack,
    avgResistance: curveAnalysis.avgResistance
  });
  renderVirtueAffinity(analysis.virtueCounts);
}

function renderIndicator(tone, symbol) {
  return `<i class="metric-indicator ${tone}">${escapeHtml(symbol)}</i>`;
}

function renderCompareIndicator(delta, preferredDirection) {
  if (delta === 0) return renderIndicator("neutral", "=");
  const isGood = preferredDirection === "lower" ? delta < 0 : delta > 0;
  return renderIndicator(isGood ? "good" : "bad", delta > 0 ? "↑" : "↓");
}

function getSweetSpot() {
  if (els.speedPreference.value === "any") return null;
  if (els.speedPreference.value === "fast") return [0, 3];
  if (els.speedPreference.value === "slow") return [3, 6];
  return [2, 4];
}

function renderCurve(curve, avgCost, metrics = {}) {
  const totals = Array.from(curve.values()).map((typeMap) => Array.from(typeMap.values()).reduce((sum, value) => sum + value, 0));
  const max = Math.max.apply(null, [1].concat(totals));
  const rows = [];
  const sweetSpot = getSweetSpot();
  const averageBucket = Math.max(0, Math.min(6, Math.round(avgCost)));
  els.curveSummary.innerHTML = `
    <span>Custo: <strong>${escapeHtml(avgCost)}</strong></span>
    <span>Poder: <strong>${escapeHtml(metrics.avgAttack ?? 0)}</strong></span>
    <span>Resistência: <strong>${escapeHtml(metrics.avgResistance ?? 0)}</strong></span>
    ${sweetSpot ? `<span>Sweet spot: <strong>${sweetSpot[0]}-${sweetSpot[1] === 6 ? "6+" : sweetSpot[1]}</strong></span>` : ""}
  `;
  ["0-1", 2, 3, 4, 5, 6].forEach((cost) => {
    const typeMap = curve.get(cost) || new Map();
    const total = Array.from(typeMap.values()).reduce((sum, value) => sum + value, 0);
    const segments = Array.from(typeMap.entries()).map(([type, value]) => {
      const height = Math.max(5, (value / max) * 100);
      const cls = ["personagem", "milagre", "artefato", "pecado"].includes(type) ? type : "outro";
      return `<span class="curve-segment ${cls}" style="height:${height}%" title="${escapeHtml(type)} ${value}"></span>`;
    }).join("");
    const numericCost = cost === "0-1" ? 1 : cost;
    rows.push(`
      <div class="curve-row ${sweetSpot && numericCost >= sweetSpot[0] && numericCost <= sweetSpot[1] ? "is-sweetspot" : ""} ${numericCost === averageBucket ? "is-average" : ""}">
        <strong>${cost === 6 ? "6+" : cost}</strong>
        <div class="curve-track">${segments}</div>
        ${numericCost === averageBucket ? '<em class="curve-average-marker">média</em>' : ""}
        <span>${total}</span>
      </div>
    `);
  });
  els.curveChart.innerHTML = rows.join("");
}

function renderVirtueAffinity(counts) {
  const rows = Array.from(references.virtues.values()).map((virtue) => ({
    id: Number(virtue.id),
    label: localize(virtue.name),
    icon: virtue.images && virtue.images.icon ? virtue.images.icon : "../assets/icons/00.webp",
    value: counts.get(Number(virtue.id)) || 0,
    avg: round(fieldAverages.virtueCounts.get(Number(virtue.id)) || 0)
  })).filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, "pt-BR"));
  els.virtueAffinity.innerHTML = rows.length ? rows.map((item) => `
    <span class="virtue-mark-compact" title="${escapeHtml(item.label)} · média ${escapeHtml(item.avg)}">
      <img src="${escapeHtml(item.icon)}" alt="${escapeHtml(item.label)}" loading="lazy" />
      <span class="pip-badge pip-badge--${escapeHtml(toneForValue(item.value, item.avg))}">${escapeHtml(item.value)}</span>
    </span>
  `).join("") : `<span class="function-chip"><strong>Sem pips</strong><span>0</span></span>`;
}

function toneForValue(value, avg) {
  if (value > avg) return "positive";
  if (value < avg) return "negative";
  return "neutral";
}

function renderPickLists() {
  renderPickList(els.requiredList, getRequiredIds(), "required");
  renderPickList(els.bannedList, getBannedIds(), "banned");
}

function renderPickList(target, ids, kind) {
  target.innerHTML = ids.length ? ids.map((id) => {
    const card = cardById.get(id);
    return `
      <div class="pick-item" draggable="true" data-pick-source="${escapeHtml(kind)}" data-pick-card="${escapeHtml(id)}">
        ${card ? `<img src="${escapeHtml(getCardImage(card))}" alt="${escapeHtml(getCardName(card))}" loading="lazy" />` : "<span></span>"}
        <strong>${escapeHtml(card ? getCardName(card) : id)}</strong>
        <button type="button" data-remove-pick="${escapeHtml(kind)}" data-card-id="${escapeHtml(id)}">×</button>
      </div>
    `;
  }).join("") : `<div class="pick-item is-empty"><strong>${kind === "required" ? "Nenhuma obrigatória" : "Nenhuma proibida"}</strong></div>`;
}

function parseIds(text) {
  const matches = String(text || "").match(/[A-Z]{3}-[A-Z]{3}-\d{3}/g);
  return matches ? Array.from(new Set(matches)) : [];
}

function exportDeckText() {
  const lines = [];
  ["champions", "territories", "temples"].forEach((key) => {
    state.identity[key].forEach((id) => {
      const card = cardById.get(id);
      if (card) lines.push(`- [${id}] ${getCardName(card)}`);
    });
  });
  lines.push("");
  state.main.forEach((id) => {
    const card = cardById.get(id);
    if (card) lines.push(`- [${id}] ${getCardName(card)}`);
  });
  els.deckText.value = lines.join("\n");
}

function importDeckText() {
  const ids = parseIds(els.deckText.value);
  state.identity = { champions: [], territories: [], temples: [] };
  state.main = [];
  state.deckLayout = normalizeDeckLayout();
  ids.forEach((id) => {
    const card = cardById.get(id);
    if (!card) return;
    addCard(card);
  });
  resetDeckLayoutByCost();
  renderAll();
}

function scoreCard(card, mechanicId, speed, requiredIds, bannedIds) {
  const id = getCardId(card);
  if (bannedIds.includes(id)) return -9999;
  let score = 0;
  const cost = getCost(card);
  if (requiredIds.includes(id)) score += 500;
  if (mechanicId !== "all" && (card.functions || []).map(String).includes(mechanicId)) score += 80;
  if (speed === "fast") score += Math.max(0, 7 - cost) * 8;
  if (speed === "mid") score += Math.max(0, 5 - Math.abs(cost - 3)) * 7;
  if (speed === "slow") score += cost * 6 + getAttack(card) + getResistance(card);
  score += (card.rating || 0) * 4;
  score += (card.usage && card.usage.deckCount ? card.usage.deckCount : 0);
  score += (deckFrequency.get(id) || 0) * 12;
  return score;
}

function generateDeck() {
  const requiredIds = parseIds(els.requiredCards.value);
  const bannedIds = parseIds(els.bannedCards.value);
  const mechanicId = els.mechanicPreference.value;
  const speed = els.speedPreference.value;
  state.identity = { champions: [], territories: [], temples: [] };
  state.main = [];
  state.deckLayout = normalizeDeckLayout();

  requiredIds.forEach((id) => {
    const card = cardById.get(id);
    if (card && !bannedIds.includes(id)) addCard(card);
  });

  fillMissingIdentity(mechanicId, speed, requiredIds, bannedIds);

  const pool = cards
    .filter((card) => !isIdentityCard(card))
    .sort((a, b) => scoreCard(b, mechanicId, speed, requiredIds, bannedIds) - scoreCard(a, mechanicId, speed, requiredIds, bannedIds));
  pool.forEach((card) => {
    if (state.main.length < MAIN_DECK_SIZE) addCard(card);
  });
  state.suggestions = [];
  resetDeckLayoutByCost();
  renderAll();
}

function fillMissingIdentity(mechanicId, speed, requiredIds, bannedIds) {
  ["champions", "territories", "temples"].forEach((key) => {
    if (state.identity[key].length) return;
    const code = key === "champions" ? TYPE_CODES.champion : key === "territories" ? TYPE_CODES.territory : TYPE_CODES.temple;
    const best = cards
      .filter((card) => getTypeCode(card) === code)
      .filter((card) => !bannedIds.includes(getCardId(card)))
      .sort((a, b) => scoreCard(b, mechanicId, speed, requiredIds, bannedIds) - scoreCard(a, mechanicId, speed, requiredIds, bannedIds))[0];
    if (best) addCard(best);
  });
}

function completeDeck() {
  const requiredIds = getRequiredIds();
  const bannedIds = getBannedIds();
  const mechanicId = els.mechanicPreference.value;
  const speed = els.speedPreference.value;

  requiredIds.forEach((id) => {
    const card = cardById.get(id);
    if (card && !bannedIds.includes(id) && !isSelected(id)) addCard(card);
  });

  fillMissingIdentity(mechanicId, speed, requiredIds, bannedIds);

  const pool = cards
    .filter((card) => !isIdentityCard(card))
    .filter((card) => !state.main.includes(getCardId(card)) && !bannedIds.includes(getCardId(card)))
    .sort((a, b) => scoreCard(b, mechanicId, speed, requiredIds, bannedIds) - scoreCard(a, mechanicId, speed, requiredIds, bannedIds));
  pool.forEach((card) => {
    if (state.main.length < MAIN_DECK_SIZE) addCard(card);
  });
  resetDeckLayoutByCost();
  renderAll();
}

function improveDeck() {
  const mechanicId = els.mechanicPreference.value;
  const speed = els.speedPreference.value;
  const requiredIds = parseIds(els.requiredCards.value);
  const bannedIds = parseIds(els.bannedCards.value);
  const current = getMainCards();
  const candidates = cards
    .filter((card) => !isIdentityCard(card) && !state.main.includes(getCardId(card)))
    .sort((a, b) => scoreCard(b, mechanicId, speed, requiredIds, bannedIds) - scoreCard(a, mechanicId, speed, requiredIds, bannedIds));
  const weakest = current
    .filter((card) => !requiredIds.includes(getCardId(card)))
    .sort((a, b) => scoreCard(a, mechanicId, speed, requiredIds, bannedIds) - scoreCard(b, mechanicId, speed, requiredIds, bannedIds));
  state.suggestions = weakest.slice(0, 5).map((removeCardItem, index) => ({
    remove: getCardId(removeCardItem),
    add: candidates[index] ? getCardId(candidates[index]) : ""
  })).filter((item) => item.add);
  renderSuggestions();
}

function applySuggestion(index) {
  const suggestion = state.suggestions[index];
  if (!suggestion) return;
  if (suggestion.remove) removeCard(suggestion.remove);
  const card = cardById.get(suggestion.add);
  if (card && !state.main.includes(suggestion.add) && state.main.length < MAIN_DECK_SIZE) addCard(card);
  state.suggestions.splice(index, 1);
  renderAll();
}

function getApparentMechanicId() {
  if (els.mechanicPreference.value !== "all") return els.mechanicPreference.value;
  const counts = new Map();
  getAnalysisCards().forEach((card) => {
    (card.functions || []).forEach((id) => counts.set(String(id), (counts.get(String(id)) || 0) + 1));
  });
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "all";
}

function getSuggestionSpeed() {
  return els.speedPreference.value === "any" ? "mid" : els.speedPreference.value;
}

function buildIncompleteSuggestions() {
  if (state.main.length >= MAIN_DECK_SIZE) return [];
  const requiredIds = getRequiredIds();
  const bannedIds = getBannedIds();
  const mechanicId = getApparentMechanicId();
  const speed = getSuggestionSpeed();
  return cards
    .filter((card) => !isIdentityCard(card))
    .filter((card) => !state.main.includes(getCardId(card)) && !bannedIds.includes(getCardId(card)))
    .sort((a, b) => scoreCard(b, mechanicId, speed, requiredIds, bannedIds) - scoreCard(a, mechanicId, speed, requiredIds, bannedIds))
    .slice(0, Math.min(8, MAIN_DECK_SIZE - state.main.length))
    .map((card) => ({
      add: getCardId(card),
      reason: mechanicId === "all" ? "Completa a curva" : `Sinergia: ${localize((references.functions.get(Number(mechanicId)) || {}).name) || "mecânica"}`
    }));
}

function renderSuggestions() {
  const bannedIds = getBannedIds();
  state.suggestions = state.suggestions.filter((suggestion) => {
    if (!suggestion.add || !cardById.has(suggestion.add)) return false;
    if (state.main.length >= MAIN_DECK_SIZE && !suggestion.remove) return false;
    if (state.main.includes(suggestion.add) || bannedIds.includes(suggestion.add)) return false;
    return !suggestion.remove || state.main.includes(suggestion.remove);
  });

  if (!state.suggestions.length && state.main.length < MAIN_DECK_SIZE) {
    state.suggestions = buildIncompleteSuggestions();
  }

  els.suggestionList.innerHTML = state.suggestions.length ? state.suggestions.map((suggestion, index) => {
    const remove = cardById.get(suggestion.remove);
    const add = cardById.get(suggestion.add);
    return `
      <div class="suggestion-row">
        ${remove ? `<img src="${escapeHtml(getCardImage(remove))}" alt="${escapeHtml(getCardName(remove))}" loading="lazy" />` : add ? `<img src="${escapeHtml(getCardImage(add))}" alt="${escapeHtml(getCardName(add))}" loading="lazy" />` : "<span></span>"}
        <strong>${remove ? "Trocar carta" : "Adicionar carta"}</strong>
        ${remove && add ? `<img src="${escapeHtml(getCardImage(add))}" alt="${escapeHtml(getCardName(add))}" loading="lazy" />` : "<span></span>"}
        <span>${escapeHtml(suggestion.reason || (remove ? "Troca sugerida" : "Inserção sugerida"))}</span>
        <button type="button" data-apply-suggestion="${index}">Aplicar</button>
      </div>
    `;
  }).join("") : `<div class="suggestion-row is-empty"><strong>Nenhuma sugestão gerada</strong></div>`;
}

function getBeforeDeckCardId(event, laneElement, draggedId) {
  const cardsInLane = [...laneElement.querySelectorAll("[data-deck-card]")]
    .filter((item) => item.dataset.deckCard !== draggedId);
  const target = cardsInLane.find((item) => {
    const rect = item.getBoundingClientRect();
    return event.clientY < rect.top + rect.height / 2;
  });
  return target ? target.dataset.deckCard : "";
}

function renderAll() {
  enforceDeckConstraints();
  renderCatalog();
  renderIdentity();
  renderDeckList();
  renderStatus();
  renderAnalysis();
  renderPickLists();
  renderSuggestions();
  renderAssistantState();
  handleReveal();
  saveState();
}

function handleReveal() {
  const trigger = window.innerHeight * 0.92;
  document.querySelectorAll(".reveal").forEach((element) => {
    if (element.getBoundingClientRect().top < trigger) element.classList.add("is-visible");
  });
}

function bindEvents() {
  if (els.mobileToggle) {
    els.mobileToggle.addEventListener("click", () => {
      const isOpen = els.primaryNav.classList.toggle("is-open");
      els.mobileToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  if (els.primaryNav) {
    els.primaryNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        els.primaryNav.classList.remove("is-open");
        if (els.mobileToggle) els.mobileToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  els.cardSearch.addEventListener("input", () => {
    state.search = normalizeSearch(els.cardSearch.value);
    renderCatalog();
  });
  els.typeFilter.addEventListener("change", () => {
    state.type = els.typeFilter.value;
    renderCatalog();
  });
  els.subtypeFilter.addEventListener("change", () => {
    state.subtype = els.subtypeFilter.value;
    renderCatalog();
  });
  els.functionFilter.addEventListener("change", () => {
    state.functionId = els.functionFilter.value;
    renderCatalog();
  });
  [
    ["costMin", els.costMinFilter, "costMin", "costMax"],
    ["costMax", els.costMaxFilter, "costMin", "costMax"],
    ["attackMin", els.attackMinFilter, "attackMin", "attackMax"],
    ["attackMax", els.attackMaxFilter, "attackMin", "attackMax"],
    ["resistanceMin", els.resistanceMinFilter, "resistanceMin", "resistanceMax"],
    ["resistanceMax", els.resistanceMaxFilter, "resistanceMin", "resistanceMax"]
  ].forEach(([key, input, minKey, maxKey]) => {
    input.addEventListener("input", () => {
      state[key] = input.value;
      if (minKey && maxKey) syncRangePair(key, minKey, maxKey);
      renderRangeValues();
      renderCatalog();
    });
    input.addEventListener("change", () => {
      state[key] = input.value;
      if (minKey && maxKey) syncRangePair(key, minKey, maxKey);
      renderRangeValues();
      renderCatalog();
    });
  });
  els.virtueFilterList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-virtue-filter]");
    if (!button) return;
    const id = button.dataset.virtueFilter;
    state.virtues = state.virtues.includes(id) ? state.virtues.filter((item) => item !== id) : state.virtues.concat(id);
    renderCatalog();
  });
  els.cardCatalog.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-card-action]");
    const cardElement = event.target.closest("[data-card-id]");
    if (!cardElement) return;
    const id = cardElement.dataset.cardId;
    const action = actionButton ? actionButton.dataset.cardAction : "deck";
    if (!actionButton) {
      state.activeCatalogId = state.activeCatalogId === id ? "" : id;
      renderCatalog();
      return;
    }
    if (action === "close") {
      state.activeCatalogId = "";
      renderCatalog();
      return;
    }
    handleCardAction(id, action);
    state.activeCatalogId = "";
    renderAll();
  });
  els.cardCatalog.addEventListener("dragstart", (event) => {
    const cardElement = event.target.closest("[data-card-id]");
    if (!cardElement || !event.dataTransfer) return;
    setDragPayload(event, cardElement.dataset.cardId, "catalog");
  });
  els.deckList.addEventListener("dragstart", (event) => {
    const identitySlot = event.target.closest(".identity-board-slot[data-card-id]");
    if (identitySlot && identitySlot.dataset.cardId) {
      if (!setDragPayload(event, identitySlot.dataset.cardId, "identity")) event.preventDefault();
      return;
    }
    const row = event.target.closest("[data-remove-card]");
    if (!row || !event.dataTransfer) return;
    setDragPayload(event, row.dataset.removeCard, "deck");
  });
  document.querySelectorAll("[data-remove-identity]").forEach((button) => {
    button.setAttribute("draggable", "true");
    button.addEventListener("dragstart", (event) => {
      if (!setDragPayload(event, button.dataset.cardId, "identity")) {
        event.preventDefault();
        return;
      }
    });
  });
  document.querySelectorAll("[data-drop-zone]").forEach((zone) => {
    zone.addEventListener("dragover", (event) => {
      event.preventDefault();
      zone.classList.add("is-drag-over");
      if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    });
    zone.addEventListener("dragleave", () => {
      zone.classList.remove("is-drag-over");
    });
    zone.addEventListener("drop", (event) => {
      event.preventDefault();
      event.stopPropagation();
      zone.classList.remove("is-drag-over");
      const payload = getDragPayload(event);
      if (!payload.id) return;
      handleDropAction(payload, zone.dataset.dropZone);
      clearDragPayload();
      renderAll();
    });
  });
  document.addEventListener("dragover", (event) => {
    if (!activeDragPayload) return;
    event.preventDefault();
  });
  document.addEventListener("drop", (event) => {
    if (!activeDragPayload) return;
    if (event.target.closest("[data-drop-zone]")) return;
    if (event.target.closest("[data-lane-insert]")) return;
    if (event.target.closest(".deck-board")) return;
    event.preventDefault();
    if (["deck", "identity"].includes(activeDragPayload.source)) {
      removeCard(activeDragPayload.id);
      renderAll();
    }
    clearDragPayload();
  });
  document.addEventListener("dragend", clearDragPayload);
  els.deckList.addEventListener("dragover", (event) => {
    const insertZone = event.target.closest("[data-lane-insert]");
    if (insertZone && activeDragPayload) {
      event.preventDefault();
      event.stopPropagation();
      insertZone.classList.add("is-drag-over");
      if (event.dataTransfer) event.dataTransfer.dropEffect = activeDragPayload.source === "catalog" ? "copy" : "move";
      return;
    }
    const identitySlot = event.target.closest(".identity-board-slot");
    if (identitySlot && activeDragPayload) {
      event.preventDefault();
      event.stopPropagation();
      identitySlot.classList.add("is-drag-over");
      if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
      return;
    }
    const lane = event.target.closest(".deck-lane");
    if (!lane || !activeDragPayload) return;
    event.preventDefault();
    event.stopPropagation();
    lane.classList.add("is-drag-over");
    if (event.dataTransfer) event.dataTransfer.dropEffect = activeDragPayload.source === "catalog" ? "copy" : "move";
  }, true);
  els.deckList.addEventListener("dragleave", (event) => {
    const insertZone = event.target.closest("[data-lane-insert]");
    if (insertZone && !insertZone.contains(event.relatedTarget)) {
      event.stopPropagation();
      insertZone.classList.remove("is-drag-over");
      return;
    }
    const identitySlot = event.target.closest(".identity-board-slot");
    if (identitySlot && !identitySlot.contains(event.relatedTarget)) {
      event.stopPropagation();
      identitySlot.classList.remove("is-drag-over");
      return;
    }
    const lane = event.target.closest(".deck-lane");
    if (!lane || lane.contains(event.relatedTarget)) return;
    event.stopPropagation();
    lane.classList.remove("is-drag-over");
  }, true);
  els.deckList.addEventListener("drop", (event) => {
    const insertZone = event.target.closest("[data-lane-insert]");
    if (insertZone) {
      event.preventDefault();
      event.stopPropagation();
      insertZone.classList.remove("is-drag-over");
      const payload = getDragPayload(event);
      if (!payload.id) return;
      handleDropAction(payload, `deck-new-lane-${insertZone.dataset.laneInsert}`);
      clearDragPayload();
      renderAll();
      return;
    }
    const identitySlot = event.target.closest(".identity-board-slot");
    if (identitySlot) {
      event.preventDefault();
      event.stopPropagation();
      identitySlot.classList.remove("is-drag-over");
      const payload = getDragPayload(event);
      if (!payload.id) return;
      handleDropAction(payload, identitySlot.dataset.dropZone);
      clearDragPayload();
      renderAll();
      return;
    }
    const lane = event.target.closest(".deck-lane");
    if (!lane || !lane.dataset.lane) {
      const board = event.target.closest(".deck-board");
      if (!board) return;
      event.preventDefault();
      event.stopPropagation();
      const payload = getDragPayload(event);
      if (!payload.id) return;
      handleDropAction(payload, `deck-new-lane-${getLaneInsertIndexFromPoint(event)}`);
      clearDragPayload();
      renderAll();
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    lane.classList.remove("is-drag-over");
    const payload = getDragPayload(event);
    if (!payload.id) return;
    const beforeId = getBeforeDeckCardId(event, lane, payload.id);
    handleDropAction(payload, `deck-lane-${lane.dataset.lane}`, beforeId);
    clearDragPayload();
    renderAll();
  }, true);
  els.deckList.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-deck-card-action]");
    if (actionButton) {
      const id = actionButton.dataset.cardId;
      if (actionButton.dataset.deckCardAction === "remove") removeCard(id);
      if (actionButton.dataset.deckCardAction === "required") {
        addTextId(els.requiredCards, id);
        removeTextId(els.bannedCards, id);
      }
      if (actionButton.dataset.deckCardAction === "ban") {
        removeCard(id);
        addTextId(els.bannedCards, id);
        removeTextId(els.requiredCards, id);
      }
      state.deckLayout.activeCardId = "";
      renderAll();
      return;
    }

    const modeButton = event.target.closest("[data-deck-layout-mode]");
    if (modeButton) {
      state.deckLayout.mode = modeButton.dataset.deckLayoutMode;
      if (state.deckLayout.mode === "curve") resetDeckLayoutByCost();
      renderAll();
      return;
    }

    if (event.target.closest("[data-deck-layout-reset]")) {
      resetDeckLayoutByCost();
      renderAll();
      return;
    }

    if (event.target.closest("[data-deck-layout-type]")) {
      resetDeckLayoutByType();
      renderAll();
      return;
    }

    const identitySlot = event.target.closest(".identity-board-slot[data-remove-identity]");
    if (identitySlot) {
      state.identity[identitySlot.dataset.removeIdentity] = [];
      renderAll();
      return;
    }

    const card = event.target.closest("[data-deck-card]");
    if (!card) return;
    state.deckLayout.activeCardId = state.deckLayout.activeCardId === card.dataset.deckCard ? "" : card.dataset.deckCard;
    renderAll();
  });
  document.querySelectorAll("[data-remove-identity]").forEach((button) => {
    button.addEventListener("click", () => {
      state.identity[button.dataset.removeIdentity] = [];
      renderAll();
    });
  });
  els.exportDeck.addEventListener("click", exportDeckText);
  els.importDeck.addEventListener("click", importDeckText);
  els.clearDeck.addEventListener("click", () => {
    state.identity = { champions: [], territories: [], temples: [] };
    state.main = [];
    state.deckLayout = normalizeDeckLayout();
    state.suggestions = [];
    renderAll();
  });
  els.generateDeck.addEventListener("click", generateDeck);
  els.completeDeck.addEventListener("click", completeDeck);
  els.improveDeck.addEventListener("click", improveDeck);
  els.playDeck?.addEventListener("click", () => {
    saveState();
    window.location.href = "../play/?source=deckbuilder";
  });
  els.filtersToggle.addEventListener("click", () => {
    state.filtersHidden = !state.filtersHidden;
    renderAll();
  });
  els.cardsToggle?.addEventListener("click", () => {
    state.cardsHidden = !state.cardsHidden;
    renderAll();
  });
  els.chartsToggle.addEventListener("click", () => {
    state.chartsHidden = !state.chartsHidden;
    renderAll();
  });
  els.assistantToggle.addEventListener("click", () => {
    state.assistantHidden = !state.assistantHidden;
    renderAll();
  });
  [els.requiredList, els.bannedList].forEach((list) => {
    list.addEventListener("dragstart", (event) => {
      const item = event.target.closest("[data-pick-card]");
      if (!item) return;
      setDragPayload(event, item.dataset.pickCard, item.dataset.pickSource);
    });
    list.addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-pick]");
      if (!button) return;
      const textarea = button.dataset.removePick === "required" ? els.requiredCards : els.bannedCards;
      removeTextId(textarea, button.dataset.cardId);
      renderAll();
    });
  });
  els.suggestionList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-apply-suggestion]");
    if (!button) return;
    applySuggestion(Number(button.dataset.applySuggestion));
  });
  els.functionAnalysis.addEventListener("click", (event) => {
    const button = event.target.closest("[data-function-focus]");
    if (!button) return;
    const id = button.dataset.functionFocus;
    state.selectedFunctionId = state.selectedFunctionId === id ? "" : id;
    renderAll();
  });
  [els.speedPreference, els.mechanicPreference].forEach((input) => {
    input.addEventListener("input", () => {
      state.suggestions = [];
      renderAll();
    });
    input.addEventListener("change", () => {
      state.suggestions = [];
      renderAll();
    });
  });
  [els.requiredCards, els.bannedCards].forEach((input) => {
    input.addEventListener("input", () => {
      state.suggestions = [];
      renderAll();
    });
    input.addEventListener("change", () => {
      state.suggestions = [];
      renderAll();
    });
  });
  els.langButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.lang = button.dataset.lang;
      document.documentElement.lang = state.lang === "pt" ? "pt-BR" : "en";
      els.langButtons.forEach((item) => item.classList.toggle("is-active", item.dataset.lang === state.lang));
      renderAll();
    });
  });
  window.addEventListener("scroll", () => {
    if (els.header) els.header.classList.toggle("is-scrolled", window.scrollY > 20);
    handleReveal();
  });
  window.addEventListener("resize", syncDeckBoardLaneHeights);
}

async function loadData() {
  els.cardCatalog.innerHTML = `<div class="lore-loading"><p>Carregando cartas...</p></div>`;
  const [cardsResponse, decksResponse, typesResponse, subtypesResponse, functionsResponse, collectionsResponse, virtuesResponse] = await Promise.all([
    fetch(DATA_URLS.cards),
    fetch(DATA_URLS.decks),
    fetch(DATA_URLS.types),
    fetch(DATA_URLS.subtypes),
    fetch(DATA_URLS.functions),
    fetch(DATA_URLS.collections),
    fetch(DATA_URLS.virtues)
  ]);
  const [cardsPayload, decksPayload, typesPayload, subtypesPayload, functionsPayload, collectionsPayload, virtuesPayload] = await Promise.all([
    cardsResponse.json(),
    decksResponse.json(),
    typesResponse.json(),
    subtypesResponse.json(),
    functionsResponse.json(),
    collectionsResponse.json(),
    virtuesResponse.json()
  ]);
  references.types = toMap(typesPayload, "types");
  references.subtypes = toMap(subtypesPayload, "subtypes");
  references.functions = toMap(functionsPayload, "functions");
  references.collections = toMap(collectionsPayload, "collections");
  references.virtues = toMap(virtuesPayload, "virtues");
  cards = (cardsPayload.cards || []).map((card) => Object.assign({}, cardsPayload.defaults || {}, card));
  cardById = new Map(cards.map((card) => [getCardId(card), card]));
  decks = decksPayload.decks || [];
  calculateFieldAverages();
  renderFilters();
  restoreState();
  renderAll();
}

bindEvents();
window.addEventListener("load", () => {
  if (els.header) els.header.classList.toggle("is-scrolled", window.scrollY > 20);
  handleReveal();
  loadData().catch((error) => {
    console.error(error);
    els.cardCatalog.innerHTML = `<div class="lore-empty"><p>Não foi possível carregar o deckbuilder.</p></div>`;
  });
});
