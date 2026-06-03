const DATA_URLS = {
  cards: "../data/cards.json",
  decks: "../data/decks.json",
  types: "../data/types.json",
  functions: "../data/functions.json",
  collections: "../data/collections.json"
};

const STORAGE_KEY = "adonai.deckbuilder.v1";
const MAIN_DECK_SIZE = 40;
const TYPE_CODES = {
  champion: "CMP",
  territory: "TER",
  temple: "TEM"
};

const els = {
  header: document.getElementById("siteHeader"),
  mobileToggle: document.getElementById("mobileToggle"),
  primaryNav: document.getElementById("primaryNav"),
  langButtons: document.querySelectorAll(".lang-btn"),
  deckStatus: document.getElementById("deckStatus"),
  catalogCount: document.getElementById("catalogCount"),
  cardSearch: document.getElementById("cardSearch"),
  typeFilter: document.getElementById("typeFilter"),
  functionFilter: document.getElementById("functionFilter"),
  cardCatalog: document.getElementById("cardCatalog"),
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
  analysisGrid: document.getElementById("analysisGrid"),
  functionAnalysis: document.getElementById("functionAnalysis"),
  curveChart: document.getElementById("curveChart"),
  suggestionList: document.getElementById("suggestionList")
};

const state = {
  lang: "pt",
  search: "",
  type: "all",
  functionId: "all",
  identity: {
    champions: [],
    territories: [],
    temples: []
  },
  main: [],
  suggestions: []
};

let cards = [];
let decks = [];
let references = {
  types: new Map(),
  functions: new Map(),
  collections: new Map()
};
let cardById = new Map();
let fieldAverages = {
  avgCost: 0,
  avgAttack: 0,
  avgResistance: 0,
  functionCounts: new Map()
};
let deckFrequency = new Map();

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

function getCost(card) {
  return toNumber(card.cost, 0);
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
    identity: state.identity,
    main: state.main,
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
}

function restoreState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (saved.identity) state.identity = saved.identity;
    if (Array.isArray(saved.main)) state.main = saved.main;
    if (saved.speed) els.speedPreference.value = saved.speed;
    if (saved.mechanic) els.mechanicPreference.value = saved.mechanic;
    if (saved.required) els.requiredCards.value = saved.required;
    if (saved.banned) els.bannedCards.value = saved.banned;
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
}

function removeCard(id) {
  state.main = state.main.filter((item) => item !== id);
  Object.keys(state.identity).forEach((key) => {
    state.identity[key] = state.identity[key].filter((item) => item !== id);
  });
}

function renderFilters() {
  const typeOptions = Array.from(references.types.values())
    .map((type) => `<option value="${type.id}">${escapeHtml(localize(type.name))}</option>`)
    .join("");
  els.typeFilter.innerHTML = `<option value="all">Todos os tipos</option>${typeOptions}`;

  const functionOptions = Array.from(references.functions.values())
    .map((fn) => `<option value="${fn.id}">${escapeHtml(localize(fn.name))}</option>`)
    .join("");
  els.functionFilter.innerHTML = `<option value="all">Todas as funções</option>${functionOptions}`;
  els.mechanicPreference.innerHTML = `<option value="all">Qualquer mecânica</option>${functionOptions}`;
}

function getFilteredCards() {
  const bannedIds = getBannedIds();
  return cards.filter((card) => {
    const id = getCardId(card);
    if (isSelected(id)) return false;
    if (bannedIds.includes(id)) return false;
    if (state.type !== "all" && String((card.type || [])[0]) !== state.type) return false;
    if (state.functionId !== "all" && !(card.functions || []).map(String).includes(state.functionId)) return false;
    if (state.search) {
      const haystack = [
        getCardId(card),
        getCardName(card),
        card.text || "",
        getTypeLabel(card),
        getFunctionLabels(card).join(" ")
      ].join(" ");
      if (!normalizeSearch(haystack).includes(state.search)) return false;
    }
    return true;
  });
}

function renderCatalog() {
  const filtered = getFilteredCards();
  els.catalogCount.textContent = `${filtered.length}`;
  els.cardCatalog.innerHTML = filtered.map((card) => {
    const id = getCardId(card);
    return `
      <article class="catalog-card" data-card-id="${escapeHtml(id)}">
        <img src="${escapeHtml(getCardImage(card))}" alt="${escapeHtml(getCardName(card))}" loading="lazy" />
        <strong>${escapeHtml(getCardName(card))}</strong>
        <span>${escapeHtml(id)} · ${escapeHtml(getTypeLabel(card))}</span>
        <div class="catalog-card-actions">
          <button type="button" data-card-action="deck" data-card-id="${escapeHtml(id)}">Deck</button>
          <button type="button" data-card-action="required" data-card-id="${escapeHtml(id)}">Fixar</button>
          <button type="button" data-card-action="ban" data-card-id="${escapeHtml(id)}">Banir</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderCardTiny(card, fallback) {
  if (!card) return `<span>${escapeHtml(fallback || "-")}</span>`;
  return `<img src="${escapeHtml(getCardImage(card))}" alt="${escapeHtml(getCardName(card))}" loading="lazy" /><span>${escapeHtml(getCardName(card))}</span>`;
}

function renderIdentity() {
  const champion = cardById.get(state.identity.champions[0]);
  const territory = cardById.get(state.identity.territories[0]);
  const temple = cardById.get(state.identity.temples[0]);
  els.championSlot.innerHTML = renderCardTiny(champion, "-");
  els.territorySlot.innerHTML = renderCardTiny(territory, "-");
  els.templeSlot.innerHTML = renderCardTiny(temple, "-");
}

function renderDeckList() {
  els.mainCount.textContent = `${state.main.length}/${MAIN_DECK_SIZE}`;
  const groups = new Map();
  getMainCards()
    .sort((a, b) => getTypeLabel(a).localeCompare(getTypeLabel(b), "pt-BR") || getCost(a) - getCost(b) || getCardName(a).localeCompare(getCardName(b), "pt-BR"))
    .forEach((card) => {
      const label = getTypeLabel(card);
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(card);
    });

  if (!state.main.length) {
    els.deckList.innerHTML = `<div class="lore-empty"><p>Clique nas cartas para adicioná-las ao deck.</p></div>`;
    return;
  }

  els.deckList.innerHTML = Array.from(groups.entries()).map(([label, group]) => `
    <section class="deck-group">
      <h3>${escapeHtml(label)} · ${group.length}</h3>
      <div class="deck-group-cards">
      ${group.map((card) => {
        const id = getCardId(card);
        return `
          <button class="deck-row" type="button" data-remove-card="${escapeHtml(id)}">
            <img src="${escapeHtml(getCardImage(card))}" alt="${escapeHtml(getCardName(card))}" loading="lazy" />
            <div>
              <strong>${escapeHtml(getCardName(card))}</strong>
              <span>${escapeHtml(id)} · custo ${escapeHtml(getCost(card))}</span>
            </div>
            <span>×</span>
          </button>
        `;
      }).join("")}
      </div>
    </section>
  `).join("");
}

function analyzeDeck(cardList) {
  const list = cardList || getMainCards();
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
    typeCounts,
    functionCounts
  };
}

function buildCurve(list) {
  const curve = new Map();
  list.forEach((card) => {
    const cost = Math.max(0, Math.min(9, Math.floor(getCost(card))));
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

  const analyses = decks.map((deck) => analyzeDeck((deck.cards || []).map((id) => cardById.get(id)).filter(Boolean)));
  const total = analyses.length || 1;
  fieldAverages.avgCost = round(analyses.reduce((sum, item) => sum + item.avgCost, 0) / total);
  fieldAverages.avgAttack = round(analyses.reduce((sum, item) => sum + item.avgAttack, 0) / total);
  fieldAverages.avgResistance = round(analyses.reduce((sum, item) => sum + item.avgResistance, 0) / total);
  fieldAverages.functionCounts = new Map();
  analyses.forEach((analysis) => {
    analysis.functionCounts.forEach((value, key) => {
      fieldAverages.functionCounts.set(key, (fieldAverages.functionCounts.get(key) || 0) + value / total);
    });
  });
}

function renderStatus() {
  const identityOk = state.identity.champions.length === 1 && state.identity.territories.length === 1 && state.identity.temples.length === 1;
  const mainOk = state.main.length === MAIN_DECK_SIZE;
  const singletonOk = new Set(state.main).size === state.main.length;
  const valid = identityOk && mainOk && singletonOk;
  els.deckStatus.innerHTML = `
    <span class="status-chip ${identityOk ? "is-valid" : "is-warning"}">Identidade ${identityOk ? "3/3" : `${getIdentityCards().length}/3`}</span>
    <span class="status-chip ${mainOk ? "is-valid" : "is-warning"}">Deck ${state.main.length}/40</span>
    <span class="status-chip ${singletonOk ? "is-valid" : "is-warning"}">Singleton ${singletonOk ? "OK" : "Erro"}</span>
    <span class="status-chip ${valid ? "is-valid" : "is-warning"}">${valid ? "Válido" : "Incompleto"}</span>
  `;
}

function renderAnalysis() {
  const analysis = analyzeDeck();
  const diffCost = round(analysis.avgCost - fieldAverages.avgCost);
  const diffAtk = round(analysis.avgAttack - fieldAverages.avgAttack);
  const diffRes = round(analysis.avgResistance - fieldAverages.avgResistance);
  els.analysisGrid.innerHTML = `
    <article class="analysis-card"><span>Custo médio</span><strong>${renderCompareIndicator(diffCost, "lower")} ◆ ${analysis.avgCost}</strong><span>vs média ${formatDelta(diffCost)}</span></article>
    <article class="analysis-card"><span>ATK médio</span><strong>${renderCompareIndicator(diffAtk, "higher")} ⚔ ${analysis.avgAttack}</strong><span>vs média ${formatDelta(diffAtk)}</span></article>
    <article class="analysis-card"><span>RES média</span><strong>${renderCompareIndicator(diffRes, "higher")} ⬟ ${analysis.avgResistance}</strong><span>vs média ${formatDelta(diffRes)}</span></article>
  `;

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
    <div class="function-row">
      <strong>${escapeHtml(row.label)}</strong>
      <span>${renderCompareIndicator(round(row.value - row.avg), "higher")} ${row.value}</span>
    </div>
  `).join("") : `<div class="function-row"><strong>Sem funções no deck</strong><span>0</span></div>`;
  renderCurve(analysis.curve);
}

function renderIndicator(tone, symbol) {
  return `<i class="metric-indicator ${tone}">${escapeHtml(symbol)}</i>`;
}

function renderCompareIndicator(delta, preferredDirection) {
  if (delta === 0) return renderIndicator("neutral", "=");
  const isGood = preferredDirection === "lower" ? delta < 0 : delta > 0;
  return renderIndicator(isGood ? "good" : "bad", delta > 0 ? "↑" : "↓");
}

function formatDelta(delta) {
  if (delta === 0) return "=";
  return `${delta > 0 ? "+" : ""}${delta}`;
}

function renderCurve(curve) {
  const totals = Array.from(curve.values()).map((typeMap) => Array.from(typeMap.values()).reduce((sum, value) => sum + value, 0));
  const max = Math.max.apply(null, [1].concat(totals));
  const rows = [];
  for (let cost = 0; cost <= 9; cost += 1) {
    const typeMap = curve.get(cost) || new Map();
    const total = Array.from(typeMap.values()).reduce((sum, value) => sum + value, 0);
    const segments = Array.from(typeMap.entries()).map(([type, value]) => {
      const height = Math.max(5, (value / max) * 100);
      const cls = ["personagem", "milagre", "artefato", "pecado"].includes(type) ? type : "outro";
      return `<span class="curve-segment ${cls}" style="height:${height}%" title="${escapeHtml(type)} ${value}"></span>`;
    }).join("");
    rows.push(`
      <div class="curve-row">
        <strong>${cost}</strong>
        <div class="curve-track">${segments}</div>
        <span>${total}</span>
      </div>
    `);
  }
  els.curveChart.innerHTML = rows.join("");
}

function renderPickLists() {
  renderPickList(els.requiredList, getRequiredIds(), "required");
  renderPickList(els.bannedList, getBannedIds(), "banned");
}

function renderPickList(target, ids, kind) {
  target.innerHTML = ids.length ? ids.map((id) => {
    const card = cardById.get(id);
    return `
      <div class="pick-item">
        ${card ? `<img src="${escapeHtml(getCardImage(card))}" alt="${escapeHtml(getCardName(card))}" loading="lazy" />` : "<span></span>"}
        <strong>${escapeHtml(card ? getCardName(card) : id)}</strong>
        <button type="button" data-remove-pick="${escapeHtml(kind)}" data-card-id="${escapeHtml(id)}">×</button>
      </div>
    `;
  }).join("") : `<div class="pick-item"><strong>${kind === "required" ? "Nenhuma obrigatória" : "Nenhuma proibida"}</strong><span></span></div>`;
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
  ids.forEach((id) => {
    const card = cardById.get(id);
    if (!card) return;
    addCard(card);
  });
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
  state.main = state.main.filter((id) => id !== suggestion.remove);
  if (!state.main.includes(suggestion.add) && state.main.length < MAIN_DECK_SIZE) state.main.push(suggestion.add);
  state.suggestions.splice(index, 1);
  renderAll();
}

function renderSuggestions() {
  els.suggestionList.innerHTML = state.suggestions.length ? state.suggestions.map((suggestion, index) => {
    const remove = cardById.get(suggestion.remove);
    const add = cardById.get(suggestion.add);
    return `
      <div class="suggestion-row">
        ${remove ? `<img src="${escapeHtml(getCardImage(remove))}" alt="${escapeHtml(getCardName(remove))}" loading="lazy" />` : "<span></span>"}
        <strong>${escapeHtml(remove ? getCardName(remove) : suggestion.remove)} → ${escapeHtml(add ? getCardName(add) : suggestion.add)}</strong>
        ${add ? `<img src="${escapeHtml(getCardImage(add))}" alt="${escapeHtml(getCardName(add))}" loading="lazy" />` : "<span></span>"}
        <button type="button" data-apply-suggestion="${index}">Aplicar</button>
      </div>
    `;
  }).join("") : `<div class="suggestion-row"><strong>Nenhuma sugestão gerada</strong><span>-</span></div>`;
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
  els.functionFilter.addEventListener("change", () => {
    state.functionId = els.functionFilter.value;
    renderCatalog();
  });
  els.cardCatalog.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-card-action]");
    const cardElement = event.target.closest("[data-card-id]");
    if (!cardElement) return;
    const id = cardElement.dataset.cardId;
    const card = cardById.get(id);
    if (!card) return;
    const action = actionButton ? actionButton.dataset.cardAction : "deck";
    if (action === "ban") {
      removeCard(id);
      addTextId(els.bannedCards, id);
      removeTextId(els.requiredCards, id);
    } else {
      if (action === "required") addTextId(els.requiredCards, id);
      addCard(card);
    }
    renderAll();
  });
  els.deckList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-card]");
    if (!button) return;
    removeCard(button.dataset.removeCard);
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
    state.suggestions = [];
    renderAll();
  });
  els.generateDeck.addEventListener("click", generateDeck);
  els.completeDeck.addEventListener("click", completeDeck);
  els.improveDeck.addEventListener("click", improveDeck);
  [els.requiredList, els.bannedList].forEach((list) => {
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
  [els.speedPreference, els.mechanicPreference].forEach((input) => {
    input.addEventListener("input", saveState);
    input.addEventListener("change", saveState);
  });
  [els.requiredCards, els.bannedCards].forEach((input) => {
    input.addEventListener("input", renderAll);
    input.addEventListener("change", renderAll);
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
}

async function loadData() {
  els.cardCatalog.innerHTML = `<div class="lore-loading"><p>Carregando cartas...</p></div>`;
  const [cardsResponse, decksResponse, typesResponse, functionsResponse, collectionsResponse] = await Promise.all([
    fetch(DATA_URLS.cards),
    fetch(DATA_URLS.decks),
    fetch(DATA_URLS.types),
    fetch(DATA_URLS.functions),
    fetch(DATA_URLS.collections)
  ]);
  const [cardsPayload, decksPayload, typesPayload, functionsPayload, collectionsPayload] = await Promise.all([
    cardsResponse.json(),
    decksResponse.json(),
    typesResponse.json(),
    functionsResponse.json(),
    collectionsResponse.json()
  ]);
  references.types = toMap(typesPayload, "types");
  references.functions = toMap(functionsPayload, "functions");
  references.collections = toMap(collectionsPayload, "collections");
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
