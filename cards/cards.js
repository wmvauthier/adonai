const DATA_URL = "../data/game/cards.json";
const RULINGS_URL = "../data/game/rulings.json";
const STORAGE_KEY = "adonai.cards.filters.v1";
const REFERENCE_URLS = {
  collections: "../data/refs/collections.json",
  types: "../data/refs/types.json",
  subtypes: "../data/refs/subtypes.json",
  functions: "../data/refs/mechanics.json",
  roles: "../data/refs/roles.json",
  virtues: "../data/game/virtues.json",
  bible: "../data/content/bible.json"
};

const typeOrder = ["Campeão", "Território", "Templo", "Personagem", "Milagre", "Artefato", "Pecado"];

const copy = {
  pt: {
    all: "Todos",
    allFeminine: "Todas",
    loadingTitle: "Carregando cartas",
    loadingBody: "Buscando os dados da coleção Foundations.",
    errorTitle: "Não foi possível carregar as cartas",
    errorBody: "Confira se a página está sendo servida por um servidor local e se os arquivos em data existem.",
    emptyTitle: "Nenhuma carta encontrada",
    emptyBody: "Tente reduzir a combinação de filtros ou buscar por outro termo.",
    emptyQueryTitle: "Nenhum resultado para a busca",
    emptyQueryBody: "Tente simplificar a query ou remover um dos termos.",
    clearQuery: "Limpar query",
    clearAllFilters: "Limpar todos os filtros",
    emptyActiveFilters: "Filtros ativos",
    resultsFound: "cartas encontradas",
    noActiveFilters: "Nenhum filtro ativo",
    showing: "Mostrando",
    of: "de",
    previous: "Anterior",
    next: "Próxima",
    cost: "Custo",
    noCost: "Sem custo definido",
    viewDetails: "Ver detalhes",
    noData: "A definir",
    cardText: "Rulings",
    reference: "Referência da carta",
    specificRuling: "Ruling da carta",
    usage: "Utilização",
    rating: "Avaliação",
    decks: "Decks",
    inclusion: "Inclusão",
    type: "Tipo",
    subtype: "Subtipo",
    functions: "Funções",
    virtues: "Virtudes",
    noVirtues: "Sem virtudes associadas",
    collection: "Coleção",
    identification: "Identificação",
    status: "Status",
    attack: "Ataque",
    resistance: "Resistência",
    imageAlt: "Imagem da carta",
    close: "Fechar detalhes",
    viewStandard: "Padrão",
    viewCompact: "Compacto",
    copyQuery: "Copiar query",
    copied: "Copiado!"
  },
  en: {
    all: "All",
    allFeminine: "All",
    loadingTitle: "Loading cards",
    loadingBody: "Fetching the Foundations card data.",
    errorTitle: "Cards could not be loaded",
    errorBody: "Check that the page is running from a local server and that the files in data exist.",
    emptyTitle: "No cards found",
    emptyBody: "Try reducing the filter combination or searching for a different term.",
    emptyQueryTitle: "No results for this search",
    emptyQueryBody: "Try simplifying the query or removing one term.",
    clearQuery: "Clear query",
    clearAllFilters: "Clear all filters",
    emptyActiveFilters: "Active filters",
    resultsFound: "cards found",
    noActiveFilters: "No active filters",
    showing: "Showing",
    of: "of",
    previous: "Prev",
    next: "Next",
    cost: "Cost",
    noCost: "No cost defined",
    viewDetails: "View details",
    noData: "TBD",
    cardText: "Rulings",
    reference: "Card reference",
    specificRuling: "Card ruling",
    usage: "Usage",
    rating: "Rating",
    decks: "Decks",
    inclusion: "Inclusion",
    type: "Type",
    subtype: "Subtype",
    functions: "Functions",
    virtues: "Virtues",
    noVirtues: "No associated virtues",
    collection: "Collection",
    identification: "Identification",
    status: "Status",
    attack: "Attack",
    resistance: "Resistance",
    imageAlt: "Card image",
    close: "Close details",
    viewStandard: "Standard",
    viewCompact: "Compact",
    copyQuery: "Copy query",
    copied: "Copied!"
  }
};

const state = {
  currentPage: 1,
  itemsPerPage: 24,
  name: "",
  cardNumber: "",
  number: "",
  set: "all",
  type: "all",
  subtype: "all",
  function: "all",
  role: "all",
  virtue: "all",
  minCost: null,
  maxCost: null,
  minAttack: null,
  maxAttack: null,
  minResistance: null,
  maxResistance: null,
  text: "",
  query: "",
  sort: "rating-desc",
  viewMode: "standard",
  lang: "pt"
};
let isApplyingUrlState = false;

const els = {
  header: document.getElementById("siteHeader"),
  mobileToggle: document.getElementById("mobileToggle"),
  primaryNav: document.getElementById("primaryNav"),
  cardsGrid: document.getElementById("cardsGrid"),
  resultsCount: document.getElementById("resultsCount"),
  activeFilters: document.getElementById("activeFilters"),
  pagination: document.getElementById("pagination"),
  nameFilter: document.getElementById("nameFilter"),
  cardNumberFilter: document.getElementById("cardNumberFilter"),
  numberFilter: document.getElementById("numberFilter"),
  setFilter: document.getElementById("setFilter"),
  typeFilter: document.getElementById("typeFilter"),
  subtypeFilter: document.getElementById("subtypeFilter"),
  functionFilter: document.getElementById("functionFilter"),
  roleFilter: document.getElementById("roleFilter"),
  virtueFilter: document.getElementById("virtueFilter"),
  minCostFilter: document.getElementById("minCostFilter"),
  maxCostFilter: document.getElementById("maxCostFilter"),
  costValue: document.getElementById("costValue"),
  minAttackFilter: document.getElementById("minAttackFilter"),
  maxAttackFilter: document.getElementById("maxAttackFilter"),
  attackValue: document.getElementById("attackValue"),
  minResistanceFilter: document.getElementById("minResistanceFilter"),
  maxResistanceFilter: document.getElementById("maxResistanceFilter"),
  resistanceValue: document.getElementById("resistanceValue"),
  textFilter: document.getElementById("textFilter"),
  queryFilter: document.getElementById("queryFilter"),
  queryLegendList: document.getElementById("queryLegendList"),
  querySuggestions: document.getElementById("querySuggestions"),
  copyQueryBtn: document.getElementById("copyQueryBtn"),
  sortSelect: document.getElementById("sortSelect"),
  viewStandardBtn: document.getElementById("viewStandardBtn"),
  viewCompactBtn: document.getElementById("viewCompactBtn"),
  clearFilters: document.getElementById("clearFilters"),
  drawer: document.getElementById("cardDrawer"),
  drawerPanel: document.querySelector(".drawer-panel"),
  drawerBackdrop: document.getElementById("drawerBackdrop"),
  drawerClose: document.getElementById("drawerClose"),
  drawerContent: document.getElementById("drawerContent"),
  hoverPreview: document.getElementById("hoverPreview"),
  langButtons: document.querySelectorAll(".lang-btn")
};

let cardsData = [];
let cardsMeta = {};
let rulingBase = { type: [], subtype: [], effect: [], keyword: [] };
let referenceData = {
  collections: new Map(),
  types: new Map(),
  subtypes: new Map(),
  functions: new Map(),
  roles: new Map(),
  virtues: new Map(),
  bible: new Map()
};
let costBounds = { min: null, max: null };
let attackBounds = { min: null, max: null };
let resistanceBounds = { min: null, max: null };
let querySuggestionState = null;

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

function localize(value) {
  if (value === null || typeof value === "undefined") return "";
  if (Array.isArray(value)) return value.map(localize).filter(Boolean).join(", ");
  if (typeof value === "object") {
    if (value.name) return localize(value.name);
    if (value.label) return localize(value.label);
    if (value.text) return localize(value.text);
    if (value.citation) return localize(value.citation);
    return value[state.lang] || value.pt || value.en || Object.values(value).find(Boolean) || "";
  }
  return String(value);
}

function structuralValue(value) {
  if (value === null || typeof value === "undefined") return "";
  if (Array.isArray(value)) return structuralValue(value[0]);
  if (typeof value === "object") {
    if (value.name) return structuralValue(value.name);
    if (value.label) return structuralValue(value.label);
    if (value.text) return structuralValue(value.text);
    if (value.citation) return structuralValue(value.citation);
    return value.pt || value.en || Object.values(value).find(Boolean) || "";
  }
  return String(value);
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

function normalizeRuleText(value) {
  return normalizeSearch(value)
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeList(value) {
  if (value === null || typeof value === "undefined") return [];
  return Array.isArray(value) ? value : [value];
}

function labelForValue(value) {
  if (!value || value === "A definir") return t("noData");
  return localize(value);
}

function labelForType(value) {
  return labelForValue(value) || t("noData");
}

function getTypeRank(type) {
  const key = structuralValue(type);
  const normalized = key === "Campeao" ? "Campeão" : key === "Territorio" ? "Território" : key;
  const index = typeOrder.indexOf(normalized);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function toCost(value) {
  if (value === null || typeof value === "undefined" || value === "") return null;
  if (Array.isArray(value)) return toCost(value[0]);
  if (String(value).trim() === "-") return null;
  const cost = Number(value);
  return Number.isFinite(cost) ? cost : null;
}

function normalizeCost(value) {
  const first = Array.isArray(value) ? value[0] : value;
  if (first === null || typeof first === "undefined" || first === "") {
    return { value: null, label: t("noCost") };
  }
  if (String(first).trim() === "-") {
    return { value: null, label: "-" };
  }
  const numeric = toCost(first);
  return {
    value: numeric,
    label: numeric === null ? String(first) : String(numeric)
  };
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getCardName(card) {
  return localize(card.name) || `${labelForType(card.type?.[0])} ${card.number}`;
}

function normalizeNumber(value, fallback) {
  const match = String(value || "").match(/\d+/g);
  const raw = match?.length ? match[match.length - 1] : String(fallback || 0);
  return raw.padStart(3, "0").slice(-3);
}

function mapById(items = []) {
  return new Map(items.map((item) => [Number(item.id), item]));
}

function mapByStringId(items = []) {
  return new Map(items.map((item) => [String(item.id), item]));
}

function setReferenceData(payloads) {
  referenceData = {
    collections: mapById(payloads.collections?.collections),
    types: mapById(payloads.types?.types),
    subtypes: mapById(payloads.subtypes?.subtypes),
    functions: mapById(payloads.functions?.functions),
    roles: mapById(payloads.roles?.roles),
    virtues: mapById(payloads.virtues?.virtues),
    bible: mapByStringId(payloads.bible?.books)
  };
}

function resolveEntity(kind, value) {
  if (value === null || typeof value === "undefined" || value === "") return null;
  if (typeof value === "object" && !Array.isArray(value)) return value;
  return referenceData[kind]?.get(Number(value)) || null;
}

function resolveEntities(kind, values) {
  return normalizeList(values)
    .map((value) => resolveEntity(kind, value))
    .filter(Boolean);
}

function resolveBible(value) {
  if (!value) return null;
  if (typeof value === "object" && !Array.isArray(value)) return value;
  return String(value).trim().toUpperCase();
}

function parseBibleReference(reference) {
  const match = String(reference || "").trim().toUpperCase().match(/^(([1-3][A-Z]{2})|([A-Z]{3}))\s+(\d+):(\d+)(?:-(\d+))?$/);
  if (!match) return null;
  const bookCode = match[1];
  const chapterRaw = match[4];
  const verseStartRaw = match[5];
  const verseEndRaw = match[6];
  const chapter = Number(chapterRaw);
  const verseStart = Number(verseStartRaw);
  const verseEnd = verseEndRaw ? Number(verseEndRaw) : verseStart;
  if (!Number.isFinite(chapter) || !Number.isFinite(verseStart) || !Number.isFinite(verseEnd) || verseEnd < verseStart) return null;
  return { bookCode, chapter, verseStart, verseEnd };
}

function resolveBibleReference(reference) {
  const parsed = parseBibleReference(reference);
  if (!parsed) return null;
  const book = referenceData.bible.get(parsed.bookCode);
  if (!book) return null;

  const chapter = book.chapters?.[String(parsed.chapter)];
  if (!chapter) return null;

  const verses = [];
  for (let verse = parsed.verseStart; verse <= parsed.verseEnd; verse += 1) {
    const line = chapter[String(verse)];
    if (!line) continue;
    const text = localize(line);
    if (text) verses.push(text);
  }
  if (!verses.length) return null;

  const citation = `${localize(book.name)} ${parsed.chapter}:${parsed.verseStart}${parsed.verseEnd > parsed.verseStart ? `-${parsed.verseEnd}` : ""}`;
  return {
    citation,
    text: verses.join(" ")
  };
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

  if (value && typeof value === "object" && !Array.isArray(value)) {
    const name = value.name || value.pt || value.label || "Foundations";
    const code = String(value.code || "FND").toUpperCase();
    return {
      name,
      code,
      label: value.label || `${name} (${code})`
    };
  }

  const text = String(value || "Foundations (FND)");
  const match = text.match(/^(.+?)\s*\(([A-Za-z0-9]{3})\)$/);
  if (match) {
    return {
      name: match[1].trim(),
      code: match[2].toUpperCase(),
      label: `${match[1].trim()} (${match[2].toUpperCase()})`
    };
  }

  return {
    name: text,
    code: "FND",
    label: `${text} (FND)`
  };
}

function getCollectionLabel(card) {
  return localize(card.collection?.label) || `${localize(card.collection?.name) || "Foundations"} (${card.collection?.code || "FND"})`;
}

function getPrimaryType(card) {
  return structuralValue(normalizeList(card.type)[0]);
}

function getCardCode(card) {
  const collectionCode = card.collection?.code || "FND";
  const primaryType = normalizeList(card.type)[0] || {};
  const type = getPrimaryType(card);
  const typeCode = primaryType.code || type.slice(0, 3).toUpperCase() || "CRD";
  return `${collectionCode}-${typeCode}-${card.number}`;
}

function cssUrl(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"');
}

function normalizeCard(card, defaults, index) {
  const merged = {
    ...defaults,
    ...card,
    collection: card.collection || defaults.collection || cardsMeta.collection,
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
  const reference = resolveBible(merged.reference) || merged.reference;
  const rulings = normalizeList(merged.rulings).map((item) => String(item)).filter(Boolean);
  const text = String(localize(merged.text) || merged.text || "");
  const number = normalizeNumber(merged.number, index + 1);
  const cost = normalizeCost(merged.cost);
  const usage = {
    deckCount: toNumber(merged.usage?.deckCount, 0),
    inclusion: toNumber(merged.usage?.inclusion, 0),
    archetypes: normalizeList(merged.usage?.archetypes)
  };

  return {
    ...merged,
    collection,
    number,
    collectionIndex: index + 1,
    numericNumber: Number(number),
    type,
    subtype,
    functions,
    virtues,
    role,
    reference,
    rulings,
    text,
    cost: cost.value,
    costLabel: cost.label,
    rating: toNumber(merged.rating, 0),
    usage
  };
}

function icon(name) {
  const paths = {
    decks: '<path d="M6 4h10a2 2 0 0 1 2 2v12H8a2 2 0 0 1-2-2V4Z"/><path d="M8 8h7"/><path d="M8 12h7"/>',
    chart: '<path d="M4 18V6"/><path d="M9 18v-7"/><path d="M14 18V9"/><path d="M19 18V4"/>',
    layers: '<path d="m12 3 8 4-8 4-8-4 8-4Z"/><path d="m4 12 8 4 8-4"/><path d="m4 17 8 4 8-4"/>',
    cost: '<circle cx="12" cy="12" r="7"/><path d="M12 5v14"/><path d="M5 12h14"/>',
    sword: '<path d="m14.5 4.5 5 5"/><path d="m12 7 5 5"/><path d="m3 21 7-7"/><path d="m8 16 3 3"/><path d="m11 13 2 2"/>',
    shield: '<path d="M12 3 5 6v5c0 5 3.5 8.5 7 10 3.5-1.5 7-5 7-10V6l-7-3Z"/>'
  };
  return `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.layers}</svg>`;
}

function formatList(values) {
  return normalizeList(values).map((item) => labelForValue(item)).filter(Boolean);
}

function formatFunctions(card) {
  return formatList(card.functions);
}

function formatVirtues(card) {
  return formatList(card.virtues);
}

function formatVirtueItems(card) {
  return normalizeList(card.virtues).map((item) => {
    const label = labelForValue(item);
    const image = item && typeof item === "object" && !Array.isArray(item) ? item.images?.icon || item.images?.item || item.image : "";
    return { label, image };
  }).filter((item) => item.label);
}

function formatArchetypes(card) {
  return formatList(card.usage?.archetypes);
}

function formatReference(card) {
  if (!card.reference) return "";
  const resolved = resolveBibleReference(card.reference);
  if (resolved?.text) {
    return `${resolved.text} - ${resolved.citation}`;
  }
  return localize(card.reference);
}

function formatReferenceParts(card) {
  if (!card.reference) return { text: "", citation: "" };
  const resolved = resolveBibleReference(card.reference);
  if (resolved?.text) return { text: resolved.text, citation: resolved.citation };
  return { text: localize(card.reference), citation: "" };
}

function handleHeader() {
  if (!els.header) return;
  els.header.classList.toggle("is-scrolled", window.scrollY > 20);
}

function handleReveal() {
  const trigger = window.innerHeight * 0.9;
  document.querySelectorAll(".reveal").forEach((element) => {
    if (element.getBoundingClientRect().top < trigger) {
      element.classList.add("is-visible");
    }
  });
}

function setCatalogMessage(kind, title, body) {
  const modifier = kind ? ` empty-state--${kind}` : "";
  els.cardsGrid.innerHTML = `
    <article class="empty-state${modifier}">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(body)}</p>
    </article>
  `;
  els.pagination.innerHTML = "";
}

function serializeUiState() {
  return {
    name: state.name,
    cardNumber: state.cardNumber,
    number: state.number,
    set: state.set,
    type: state.type,
    subtype: state.subtype,
    function: state.function,
    role: state.role,
    virtue: state.virtue,
    minCost: state.minCost,
    maxCost: state.maxCost,
    minAttack: state.minAttack,
    maxAttack: state.maxAttack,
    minResistance: state.minResistance,
    maxResistance: state.maxResistance,
    text: state.text,
    query: state.query,
    sort: state.sort,
    viewMode: state.viewMode
  };
}

function saveUiState() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeUiState()));
  } catch (error) {
    console.warn("Could not persist filters in localStorage", error);
  }
}

function readStoredState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch (error) {
    console.warn("Could not read filters from localStorage", error);
    return null;
  }
}

function hasUrlState() {
  return new URLSearchParams(window.location.search).toString().length > 0;
}


function sortCards(cards) {
  const sorted = [...cards];
  const locale = state.lang === "pt" ? "pt-BR" : "en-US";

  switch (state.sort) {
    case "name-asc":
      sorted.sort((a, b) => getCardName(a).localeCompare(getCardName(b), locale));
      break;
    case "cost-asc":
      sorted.sort((a, b) => (a.cost ?? 999) - (b.cost ?? 999) || getCardName(a).localeCompare(getCardName(b), locale));
      break;
    case "cost-desc":
      sorted.sort((a, b) => (b.cost ?? -1) - (a.cost ?? -1) || getCardName(a).localeCompare(getCardName(b), locale));
      break;
    case "number-asc":
      sorted.sort((a, b) => getCardCode(a).localeCompare(getCardCode(b), locale));
      break;
    case "rating-desc":
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0) || getCardName(a).localeCompare(getCardName(b), locale));
      break;
    default:
      sorted.sort((a, b) => a.collectionIndex - b.collectionIndex);
  }

  return sorted;
}

function tokenizeQuery(query) {
  const tokens = [];
  let current = "";
  let quote = "";

  for (const char of query.trim()) {
    if ((char === '"' || char === "'") && quote === "") {
      quote = char;
      current += char;
      continue;
    }

    if (char === quote) {
      quote = "";
      current += char;
      continue;
    }

    if (/\s/.test(char) && quote === "") {
      if (current) tokens.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  if (current) tokens.push(current);
  return tokens;
}

function cleanQueryValue(value) {
  const text = String(value || "").trim();
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) {
    return text.slice(1, -1);
  }
  return text;
}

function parseQueryToken(token) {
  let raw = token.trim();
  const negated = raw.startsWith("-");
  if (negated) raw = raw.slice(1);

  const match = raw.match(/^([a-zA-ZçÇãÃõÕáÁéÉíÍóÓúÚêÊâÂ]+)(<=|>=|!=|=|<|>|:)(.*)$/);
  if (!match) {
    return { negated, key: "any", operator: ":", value: cleanQueryValue(raw) };
  }

  return {
    negated,
    key: normalizeSearch(match[1]),
    operator: match[2],
    value: cleanQueryValue(match[3])
  };
}

function getActiveQueryTokenContext(query, caretIndex) {
  const start = query.lastIndexOf(" ", Math.max(0, caretIndex - 1)) + 1;
  const after = query.slice(caretIndex);
  const nextSpace = after.indexOf(" ");
  const end = nextSpace === -1 ? query.length : caretIndex + nextSpace;
  const token = query.slice(start, end);
  const raw = token.trim();
  if (!raw) return null;

  const match = raw.match(/^(-)?([a-zA-ZçÇãÃõÕáÁéÉíÍóÓúÚêÊâÂ]+)(<=|>=|!=|=|<|>|:)(.*)$/);
  if (!match) return null;

  return {
    start,
    end,
    token,
    negated: Boolean(match[1]),
    rawKey: match[2],
    key: normalizeSearch(match[2]),
    operator: match[3],
    value: cleanQueryValue(match[4])
  };
}

function extractTypeFilters(query) {
  return tokenizeQuery(query)
    .map(parseQueryToken)
    .filter((token) => !token.negated && [":", "="].includes(token.operator) && ["t", "type", "types"].includes(token.key))
    .map((token) => token.value)
    .filter(Boolean);
}

function subtypeOptionsByTypeContext(query) {
  const typeFilters = extractTypeFilters(query);
  if (!typeFilters.length) return getUniqueValues("subtype");

  const filtered = cardsData.filter((card) => {
    const labels = formatList(card.type);
    return typeFilters.some((filterValue) => labels.some((label) => includesText(label, filterValue)));
  });

  return uniqueSorted(filtered.flatMap((card) => formatList(card.subtype)));
}

function getReferenceOptions() {
  return uniqueSorted(cardsData.map((card) => String(card.reference || "").trim()).filter(Boolean));
}

function getQueryValueOptions(key, fullQuery) {
  if (["t", "type", "types"].includes(key)) return getUniqueValues("type");
  if (["st", "subtype", "subtypes"].includes(key)) return subtypeOptionsByTypeContext(fullQuery);
  if (["fn", "function", "functions", "funcao", "funcoes"].includes(key)) return getUniqueValues("function");
  if (["role", "roles"].includes(key)) return getUniqueValues("role");
  if (["v", "virtue", "virtudes", "virtude", "virtues"].includes(key)) return getUniqueValues("virtue");
  if (["set", "collection", "collections", "e"].includes(key)) return getUniqueValues("set");
  if (["ref", "reference", "flavor"].includes(key)) return getReferenceOptions();
  return [];
}

function hideQuerySuggestions() {
  querySuggestionState = null;
  if (els.querySuggestions) {
    els.querySuggestions.hidden = true;
    els.querySuggestions.innerHTML = "";
  }
  if (els.queryLegendList) els.queryLegendList.hidden = false;
}

function setActiveSuggestion(index) {
  if (!els.querySuggestions || els.querySuggestions.hidden) return;
  const buttons = [...els.querySuggestions.querySelectorAll("[data-query-option]")];
  if (!buttons.length) return;
  const safeIndex = ((index % buttons.length) + buttons.length) % buttons.length;
  querySuggestionState.activeIndex = safeIndex;
  querySuggestionState.activeOption = buttons[safeIndex]?.dataset.queryOption || "";
  buttons.forEach((button, idx) => {
    button.classList.toggle("is-active", idx === safeIndex);
  });
}

function buildQueryWithSuggestion(option, baseQuery = els.queryFilter?.value || "", context = querySuggestionState) {
  if (!context) return baseQuery;
  const { start, end, rawKey } = context;
  const prefix = baseQuery.slice(0, start);
  const suffix = baseQuery.slice(end);
  const replacement = `${rawKey}:${option}`;
  const joinSuffix = suffix.startsWith(" ") || suffix === "" ? suffix : ` ${suffix}`;
  const candidate = `${prefix}${replacement}${joinSuffix}`.trim();
  return candidate;
}

function suggestionProducesResults(option, context, fullQuery) {
  const query = buildQueryWithSuggestion(option, fullQuery, context);
  if (!query) return false;
  return cardsData.some((card) => matchesAdvancedQuery(card, query));
}

function applySuggestion(option) {
  if (!querySuggestionState || !els.queryFilter) return;

  const next = buildQueryWithSuggestion(option).trim();

  els.queryFilter.value = next ? `${next} ` : "";
  const caret = els.queryFilter.value.length;
  els.queryFilter.setSelectionRange(caret, caret);
  hideQuerySuggestions();
  updateStateFromControls();
}

function renderQuerySuggestions(options, context) {
  if (!els.querySuggestions || !els.queryLegendList) return;
  if (!options.length) {
    hideQuerySuggestions();
    return;
  }

  const previousOption = querySuggestionState?.activeOption || "";
  querySuggestionState = { ...context, activeIndex: 0, activeOption: "" };
  els.queryLegendList.hidden = true;
  els.querySuggestions.hidden = false;
  els.querySuggestions.innerHTML = options.slice(0, 60)
    .map((option) => `<button class="query-suggestion" type="button" data-query-option="${escapeHtml(option)}">${escapeHtml(option)}</button>`)
    .join("");
  const preferredIndex = options.findIndex((option) => option === previousOption);
  setActiveSuggestion(preferredIndex >= 0 ? preferredIndex : 0);
}

function updateQuerySuggestions() {
  if (!els.queryFilter) return;

  const query = els.queryFilter.value;
  const caret = els.queryFilter.selectionStart ?? query.length;
  const context = getActiveQueryTokenContext(query, caret);

  if (!context || context.negated || ![":", "="].includes(context.operator)) {
    hideQuerySuggestions();
    return;
  }

  const allOptions = getQueryValueOptions(context.key, query);
  if (!allOptions.length) {
    hideQuerySuggestions();
    return;
  }

  const filteredText = context.value
    ? allOptions.filter((item) => includesText(item, context.value))
    : allOptions;

  const filteredValid = filteredText.filter((item) => suggestionProducesResults(item, context, query));
  renderQuerySuggestions(filteredValid, context);
}

function includesText(haystack, needle) {
  return normalizeSearch(haystack).includes(normalizeSearch(needle));
}

function compareNumber(actual, operator, expected) {
  const left = Number(actual);
  const right = Number(expected);
  if (!Number.isFinite(left) || !Number.isFinite(right)) return false;

  switch (operator) {
    case "<": return left < right;
    case "<=": return left <= right;
    case ">": return left > right;
    case ">=": return left >= right;
    case "!=": return left !== right;
    default: return left === right;
  }
}

function queryFieldValue(card, key) {
  const typeLine = [card.type, card.subtype].map(flattenValue).join(" ");
  const oracleText = [card.text, card.rulings];
  const referenceText = formatReference(card);
  const allText = [
    card.name,
    card.text,
    card.rulings,
    referenceText,
    card.role,
    card.type,
    card.subtype,
    card.functions,
    card.virtues,
    getCollectionLabel(card),
    getCardCode(card),
    card.number
  ];

  const fields = {
    any: allText,
    n: card.name,
    name: card.name,
    o: oracleText,
    oracle: oracleText,
    text: oracleText,
    ruling: card.rulings,
    rulings: card.rulings,
    t: typeLine,
    type: card.type,
    types: card.type,
    st: card.subtype,
    subtype: card.subtype,
    subtypes: card.subtype,
    fn: card.functions,
    function: card.functions,
    functions: card.functions,
    funcao: card.functions,
    funcoes: card.functions,
    v: card.virtues,
    virtue: card.virtues,
    virtues: card.virtues,
    virtude: card.virtues,
    virtudes: card.virtues,
    ref: [referenceText, card.reference],
    reference: [referenceText, card.reference],
    flavor: [referenceText, card.reference],
    e: [card.collection?.code, card.collection?.name, getCollectionLabel(card)],
    set: [card.collection?.code, card.collection?.name, getCollectionLabel(card)],
    collection: [card.collection?.code, card.collection?.name, getCollectionLabel(card)],
    collections: [card.collection?.code, card.collection?.name, getCollectionLabel(card)],
    cn: card.number,
    number: card.number,
    id: getCardCode(card),
    code: getCardCode(card),
    role: card.role,
    roles: card.role,
    is: allText
  };

  return fields[key] ?? fields.any;
}

function matchesQueryToken(card, token) {
  const numericFields = {
    c: card.cost,
    cost: card.cost,
    mana: card.cost,
    mv: card.cost,
    cmc: card.cost,
    manavalue: card.cost,
    rating: card.rating,
    decks: card.usage?.deckCount,
    deckcount: card.usage?.deckCount,
    usage: card.usage?.inclusion,
    inclusion: card.usage?.inclusion,
    attack: card.stats?.attack,
    atk: card.stats?.attack,
    resistance: card.stats?.resistance,
    res: card.stats?.resistance,
    defense: card.stats?.resistance,
    def: card.stats?.resistance
  };

  let matched;
  if (Object.prototype.hasOwnProperty.call(numericFields, token.key)) {
    matched = compareNumber(numericFields[token.key], token.operator, token.value);
  } else {
    const value = queryFieldValue(card, token.key);
    matched = token.operator === "!="
      ? !includesText(value, token.value)
      : includesText(value, token.value);
  }

  return token.negated ? !matched : matched;
}

function matchesAdvancedQuery(card, query) {
  if (!query.trim()) return true;
  return tokenizeQuery(query).map(parseQueryToken).every((token) => matchesQueryToken(card, token));
}

function getFilteredCards() {
  const name = normalizeSearch(state.name.trim());
  const cardNumber = normalizeSearch(state.cardNumber.trim());
  const number = normalizeSearch(state.number.trim());
  const text = normalizeSearch(state.text.trim());

  return sortCards(cardsData.filter((card) => {
    const typeLabels = formatList(card.type);
    const subtypeLabels = formatList(card.subtype);
    const functionLabels = formatFunctions(card);
    const roleLabel = labelForValue(card.role);
    const virtueLabels = formatVirtues(card);
    const matchesName = !name || normalizeSearch(card.name).includes(name);
    const matchesCardNumber = !cardNumber || normalizeSearch(card.number).includes(cardNumber);
    const matchesNumber = !number || normalizeSearch(getCardCode(card)).includes(number);
    const matchesSet = state.set === "all" || getCollectionLabel(card) === state.set;
    const matchesType = state.type === "all" || typeLabels.includes(state.type);
    const matchesSubtype = state.subtype === "all" || subtypeLabels.includes(state.subtype);
    const matchesFunction = state.function === "all" || functionLabels.includes(state.function);
    const matchesRole = state.role === "all" || roleLabel === state.role;
    const matchesVirtue = state.virtue === "all"
      || (state.virtue === "__none" && virtueLabels.length === 0)
      || virtueLabels.includes(state.virtue);
    const matchesCost = card.cost === null || ((state.minCost === null || card.cost >= state.minCost) && (state.maxCost === null || card.cost <= state.maxCost));
    const attack = card.stats?.attack;
    const resistance = card.stats?.resistance;
    const matchesAttack = attack === null || typeof attack === "undefined" || ((state.minAttack === null || Number(attack) >= state.minAttack) && (state.maxAttack === null || Number(attack) <= state.maxAttack));
    const matchesResistance = resistance === null || typeof resistance === "undefined" || ((state.minResistance === null || Number(resistance) >= state.minResistance) && (state.maxResistance === null || Number(resistance) <= state.maxResistance));
    const matchesText = !text || normalizeSearch([card.text, card.rulings, formatReference(card), card.virtues]).includes(text);
    const matchesQuery = matchesAdvancedQuery(card, state.query);

    return matchesName && matchesCardNumber && matchesNumber && matchesSet && matchesType && matchesSubtype && matchesFunction && matchesRole && matchesVirtue && matchesCost && matchesAttack && matchesResistance && matchesText && matchesQuery;
  }));
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, state.lang === "pt" ? "pt-BR" : "en-US"));
}

function getUniqueValues(field) {
  if (field === "type") {
    return uniqueSorted(cardsData.flatMap((card) => formatList(card.type))).sort((a, b) => getTypeRank(a) - getTypeRank(b));
  }
  if (field === "subtype") return uniqueSorted(cardsData.flatMap((card) => formatList(card.subtype)));
  if (field === "function") return uniqueSorted(cardsData.flatMap(formatFunctions));
  if (field === "role") return uniqueSorted(cardsData.map((card) => labelForValue(card.role)));
  if (field === "virtue") return uniqueSorted(cardsData.flatMap(formatVirtues));
  if (field === "set") return uniqueSorted(cardsData.map(getCollectionLabel));
  return uniqueSorted(cardsData.map((card) => labelForValue(card[field])));
}

function populateSelect(select, values, allLabel, getLabel = (value) => value) {
  if (!select) return;
  const previous = select.value || "all";
  select.innerHTML = [
    `<option value="all">${escapeHtml(allLabel)}</option>`,
    ...values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(getLabel(value))}</option>`)
  ].join("");
  select.value = values.includes(previous) ? previous : "all";
}

function populateVirtueFilter() {
  if (!els.virtueFilter) return;
  const values = getUniqueValues("virtue");
  const previous = els.virtueFilter.value || "all";
  els.virtueFilter.innerHTML = [
    `<option value="all">${escapeHtml(t("allFeminine"))}</option>`,
    `<option value="__none">${escapeHtml(t("noVirtues"))}</option>`,
    ...values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`)
  ].join("");
  els.virtueFilter.value = previous === "__none" || values.includes(previous) ? previous : "all";
}

function setupCostFilter() {
  const costs = cardsData.map((card) => card.cost).filter((cost) => cost !== null);
  const hasCosts = costs.length > 0;

  if (!hasCosts) {
    costBounds = { min: null, max: null };
    state.minCost = null;
    state.maxCost = null;
    [els.minCostFilter, els.maxCostFilter].forEach((input) => {
      input.min = "0";
      input.max = "0";
      input.value = "0";
      input.disabled = true;
      input.closest(".filter-group")?.classList.add("is-disabled");
    });
    els.costValue.textContent = t("noCost");
    return;
  }

  const min = Math.min(...costs);
  const max = Math.max(...costs);
  costBounds = { min, max };
  state.minCost = state.minCost ?? min;
  state.maxCost = state.maxCost ?? max;
  [els.minCostFilter, els.maxCostFilter].forEach((input) => {
    input.min = String(min);
    input.max = String(max);
    input.disabled = false;
    input.closest(".filter-group")?.classList.remove("is-disabled");
  });
  els.minCostFilter.value = String(state.minCost);
  els.maxCostFilter.value = String(state.maxCost);
  els.costValue.textContent = `${state.minCost}-${state.maxCost}`;
}

function setupAttackFilter() {
  const attacks = cardsData.map((card) => card.stats?.attack).filter((attack) => attack !== null && typeof attack !== "undefined");
  const hasAttack = attacks.length > 0;

  if (!hasAttack) {
    attackBounds = { min: null, max: null };
    state.minAttack = null;
    state.maxAttack = null;
    [els.minAttackFilter, els.maxAttackFilter].forEach((input) => {
      input.min = "0";
      input.max = "0";
      input.value = "0";
      input.disabled = true;
      input.closest(".filter-group")?.classList.add("is-disabled");
    });
    els.attackValue.textContent = t("noData");
    return;
  }

  const min = Math.min(...attacks);
  const max = Math.max(...attacks);
  attackBounds = { min, max };
  state.minAttack = state.minAttack ?? min;
  state.maxAttack = state.maxAttack ?? max;
  [els.minAttackFilter, els.maxAttackFilter].forEach((input) => {
    input.min = String(min);
    input.max = String(max);
    input.disabled = false;
    input.closest(".filter-group")?.classList.remove("is-disabled");
  });
  els.minAttackFilter.value = String(state.minAttack);
  els.maxAttackFilter.value = String(state.maxAttack);
  els.attackValue.textContent = `${state.minAttack}-${state.maxAttack}`;
}

function setupResistanceFilter() {
  const resistances = cardsData.map((card) => card.stats?.resistance).filter((resistance) => resistance !== null && typeof resistance !== "undefined");
  const hasResistance = resistances.length > 0;

  if (!hasResistance) {
    resistanceBounds = { min: null, max: null };
    state.minResistance = null;
    state.maxResistance = null;
    [els.minResistanceFilter, els.maxResistanceFilter].forEach((input) => {
      input.min = "0";
      input.max = "0";
      input.value = "0";
      input.disabled = true;
      input.closest(".filter-group")?.classList.add("is-disabled");
    });
    els.resistanceValue.textContent = t("noData");
    return;
  }

  const min = Math.min(...resistances);
  const max = Math.max(...resistances);
  resistanceBounds = { min, max };
  state.minResistance = state.minResistance ?? min;
  state.maxResistance = state.maxResistance ?? max;
  [els.minResistanceFilter, els.maxResistanceFilter].forEach((input) => {
    input.min = String(min);
    input.max = String(max);
    input.disabled = false;
    input.closest(".filter-group")?.classList.remove("is-disabled");
  });
  els.minResistanceFilter.value = String(state.minResistance);
  els.maxResistanceFilter.value = String(state.maxResistance);
  els.resistanceValue.textContent = `${state.minResistance}-${state.maxResistance}`;
}

function populateFilters() {
  populateSelect(els.setFilter, getUniqueValues("set"), t("allFeminine"));
  populateSelect(els.typeFilter, getUniqueValues("type"), t("all"));
  populateSelect(els.subtypeFilter, getUniqueValues("subtype"), t("allFeminine"));
  populateSelect(els.functionFilter, getUniqueValues("function"), t("allFeminine"));
  populateSelect(els.roleFilter, getUniqueValues("role"), t("all"));
  populateVirtueFilter();
  setupCostFilter();
  setupAttackFilter();
  setupResistanceFilter();
}

function renderUsageCard(card, large = false) {
  const archetypes = formatArchetypes(card);
  const inclusion = Number(card.usage?.inclusion) || 0;
  const sizeClass = large ? " usage-panel--large" : "";

  return `
    <div class="usage-panel${sizeClass}" style="--usage:${inclusion}%">
      <div class="usage-stat">
        ${icon("decks")}
        <span>${escapeHtml(t("decks"))}</span>
        <strong>${escapeHtml(card.usage?.deckCount ?? 0)}</strong>
      </div>
      <div class="usage-stat">
        ${icon("chart")}
        <span>${escapeHtml(t("inclusion"))}</span>
        <strong>${inclusion}%</strong>
      </div>
      <div class="usage-bar" aria-label="${escapeHtml(`${t("inclusion")}: ${inclusion}%`)}"><span></span></div>
      <div class="usage-archetypes">
        ${archetypes.map((item) => `<span>${icon("layers")}${escapeHtml(item)}</span>`).join("")}
      </div>
    </div>
  `;
}

function renderStatusSummary(card) {
  const primaryType = normalizeSearch(getPrimaryType(card));
  const isChampion = primaryType === normalizeSearch("Campeão") || primaryType === normalizeSearch("Campeao");
  const isTemple = primaryType === normalizeSearch("Templo");
  const isTerritory = primaryType === normalizeSearch("Território") || primaryType === normalizeSearch("Territorio");

  if (isChampion || isTemple) {
    return "-";
  }

  const parts = [];
  const hasCost = !isTerritory
    && card.cost !== null
    && typeof card.cost !== "undefined"
    && String(card.costLabel || "").trim() !== ""
    && String(card.costLabel || "").trim() !== "-";
  if (hasCost) {
    parts.push(`◆ ${t("cost")} ${card.costLabel}`);
  }
  const attack = card.stats?.attack;
  const resistance = card.stats?.resistance;
  if (!isTerritory && attack !== null && typeof attack !== "undefined") {
    parts.push(`⚔ ATK ${attack}`);
  }
  if (resistance !== null && typeof resistance !== "undefined") {
    parts.push(`⬟ RES ${resistance}`);
  }
  return escapeHtml(parts.join(" / ") || "-");
}

function getMaxRange(field) {
  if (field === "cost") return costBounds.max;
  if (field === "attack") return attackBounds.max;
  if (field === "resistance") return resistanceBounds.max;
  return null;
}

function getMinRange(field) {
  if (field === "cost") return costBounds.min;
  if (field === "attack") return attackBounds.min;
  if (field === "resistance") return resistanceBounds.min;
  return null;
}

function activeFilterChips() {
  const chips = [];
  if (state.name.trim()) chips.push({ key: "name", label: "Nome", value: state.name.trim() });
  if (state.cardNumber.trim()) chips.push({ key: "cardNumber", label: "Número", value: state.cardNumber.trim() });
  if (state.number.trim()) chips.push({ key: "number", label: "Identificação", value: state.number.trim() });
  if (state.text.trim()) chips.push({ key: "text", label: "Texto", value: state.text.trim() });
  if (state.set !== "all") chips.push({ key: "set", label: "Coleção", value: state.set });
  if (state.type !== "all") chips.push({ key: "type", label: "Tipo", value: state.type });
  if (state.subtype !== "all") chips.push({ key: "subtype", label: "Subtipo", value: state.subtype });
  if (state.function !== "all") chips.push({ key: "function", label: "Função", value: state.function });
  if (state.role !== "all") chips.push({ key: "role", label: "Role", value: state.role });
  if (state.virtue !== "all") chips.push({ key: "virtue", label: "Virtude", value: state.virtue === "__none" ? t("noVirtues") : state.virtue });
  if (state.query.trim()) chips.push({ key: "query", label: "Query", value: state.query.trim() });
  if (state.minCost !== null && state.maxCost !== null && (state.minCost !== getMinRange("cost") || state.maxCost !== getMaxRange("cost"))) chips.push({ key: "cost", label: "Custo", value: `${state.minCost}-${state.maxCost}` });
  if (state.minAttack !== null && state.maxAttack !== null && (state.minAttack !== getMinRange("attack") || state.maxAttack !== getMaxRange("attack"))) chips.push({ key: "attack", label: "Ataque", value: `${state.minAttack}-${state.maxAttack}` });
  if (state.minResistance !== null && state.maxResistance !== null && (state.minResistance !== getMinRange("resistance") || state.maxResistance !== getMaxRange("resistance"))) chips.push({ key: "resistance", label: "Resistência", value: `${state.minResistance}-${state.maxResistance}` });
  return chips;
}

function renderFilterSummary(total) {
  if (els.resultsCount) {
    if (total === 0) {
      const hasQuery = Boolean(state.query.trim());
      const title = hasQuery ? t("emptyQueryTitle") : t("emptyTitle");
      const body = hasQuery ? t("emptyQueryBody") : t("emptyBody");
      els.resultsCount.innerHTML = `
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(body)}</span>
      `;
    } else {
      els.resultsCount.textContent = `${total} ${t("resultsFound")}`;
    }
  }

  if (!els.activeFilters) return;
  const chips = activeFilterChips();
  if (!chips.length) {
    els.activeFilters.innerHTML = `<span class="active-filter-chip">${escapeHtml(t("noActiveFilters"))}</span>`;
    return;
  }

  const clearAll = `<button class="active-filter-clear" type="button" data-empty-action="clear-all">${escapeHtml(t("clearAllFilters"))}</button>`;
  const clearQuery = state.query.trim()
    ? `<button class="active-filter-clear" type="button" data-empty-action="clear-query">${escapeHtml(t("clearQuery"))}</button>`
    : "";

  els.activeFilters.innerHTML = `
    ${total === 0 ? `${clearAll}${clearQuery}` : ""}
    ${chips.map((chip) => `
    <span class="active-filter-chip">
      <span>${escapeHtml(`${chip.label}: ${chip.value}`)}</span>
      <button type="button" data-remove-filter="${escapeHtml(chip.key)}" aria-label="Remover ${escapeHtml(chip.label)}">×</button>
    </span>
    `).join("")}
  `;
}

function renderCards() {
  const filtered = getFilteredCards();
  renderFilterSummary(filtered.length);
  const start = (state.currentPage - 1) * state.itemsPerPage;
  const paginated = filtered.slice(start, start + state.itemsPerPage);

  if (!paginated.length) {
    els.cardsGrid.innerHTML = "";
    renderPagination(filtered.length);
    return;
  }

  els.cardsGrid.innerHTML = paginated.map((card) => {
    const name = getCardName(card);
    const code = getCardCode(card);
    return `
      <button class="card-entry card-entry-button tilt-card" type="button" data-open-card="${escapeHtml(code)}" aria-label="${escapeHtml(`${t("viewDetails")}: ${name}`)}">
        <span class="card-entry-media">
          <img src="${escapeHtml(card.images.card)}" alt="${escapeHtml(`${t("imageAlt")}: ${name}`)}" loading="lazy" />
        </span>
      </button>
    `;
  }).join("");

  bindTilt();
  renderPagination(filtered.length);
  handleReveal();
}

function applyViewMode() {
  if (!els.cardsGrid) return;
  els.cardsGrid.classList.toggle("is-compact", state.viewMode === "compact");
  els.viewStandardBtn?.classList.toggle("is-active", state.viewMode === "standard");
  els.viewCompactBtn?.classList.toggle("is-active", state.viewMode === "compact");
}

function clampRange(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return max;
  return Math.max(min, Math.min(max, number));
}

function syncUrlFromState() {
  if (isApplyingUrlState) return;
  const params = new URLSearchParams();
  if (state.name.trim()) params.set("name", state.name.trim());
  if (state.cardNumber.trim()) params.set("cn", state.cardNumber.trim());
  if (state.number.trim()) params.set("id", state.number.trim());
  if (state.text.trim()) params.set("text", state.text.trim());
  if (state.set !== "all") params.set("set", state.set);
  if (state.type !== "all") params.set("type", state.type);
  if (state.subtype !== "all") params.set("subtype", state.subtype);
  if (state.function !== "all") params.set("fn", state.function);
  if (state.role !== "all") params.set("role", state.role);
  if (state.virtue !== "all") params.set("virtue", state.virtue);
  if (state.query.trim()) params.set("q", state.query.trim());
  if (state.sort !== "rating-desc") params.set("sort", state.sort);
  if (state.viewMode !== "standard") params.set("view", state.viewMode);

  if (state.minCost !== null && costBounds.min !== null && state.minCost !== costBounds.min) params.set("costMin", String(state.minCost));
  if (state.maxCost !== null && costBounds.max !== null && state.maxCost !== costBounds.max) params.set("costMax", String(state.maxCost));
  if (state.minAttack !== null && attackBounds.min !== null && state.minAttack !== attackBounds.min) params.set("atkMin", String(state.minAttack));
  if (state.maxAttack !== null && attackBounds.max !== null && state.maxAttack !== attackBounds.max) params.set("atkMax", String(state.maxAttack));
  if (state.minResistance !== null && resistanceBounds.min !== null && state.minResistance !== resistanceBounds.min) params.set("resMin", String(state.minResistance));
  if (state.maxResistance !== null && resistanceBounds.max !== null && state.maxResistance !== resistanceBounds.max) params.set("resMax", String(state.maxResistance));
  if (state.currentPage > 1) params.set("page", String(state.currentPage));

  const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`;
  window.history.replaceState({}, "", next);
}

function applyUrlStateToControls() {
  const params = new URLSearchParams(window.location.search);
  if (!params.toString()) return;

  isApplyingUrlState = true;
  const assignSelectValue = (select, value, fallback = "all") => {
    if (!select || !value) return;
    const hasOption = [...select.options].some((option) => option.value === value);
    select.value = hasOption ? value : fallback;
  };

  els.nameFilter.value = params.get("name") || "";
  if (els.cardNumberFilter) els.cardNumberFilter.value = params.get("cn") || "";
  els.numberFilter.value = params.get("id") || "";
  els.textFilter.value = params.get("text") || "";
  if (els.queryFilter) els.queryFilter.value = params.get("q") || "";
  assignSelectValue(els.setFilter, params.get("set"));
  assignSelectValue(els.typeFilter, params.get("type"));
  assignSelectValue(els.subtypeFilter, params.get("subtype"));
  assignSelectValue(els.functionFilter, params.get("fn"));
  assignSelectValue(els.roleFilter, params.get("role"));
  assignSelectValue(els.virtueFilter, params.get("virtue"));
  assignSelectValue(els.sortSelect, params.get("sort"), "rating-desc");
  const viewMode = params.get("view");
  state.viewMode = viewMode === "compact" ? "compact" : "standard";
  applyViewMode();

  if (!els.maxCostFilter.disabled && costBounds.max !== null) {
    const min = Number(els.minCostFilter.min);
    const max = Number(els.maxCostFilter.max);
    els.minCostFilter.value = String(params.get("costMin") ? clampRange(params.get("costMin"), min, max) : min);
    els.maxCostFilter.value = String(params.get("costMax") ? clampRange(params.get("costMax"), min, max) : max);
    els.costValue.textContent = `${els.minCostFilter.value}-${els.maxCostFilter.value}`;
  }
  if (!els.maxAttackFilter.disabled && attackBounds.max !== null) {
    const min = Number(els.minAttackFilter.min);
    const max = Number(els.maxAttackFilter.max);
    els.minAttackFilter.value = String(params.get("atkMin") ? clampRange(params.get("atkMin"), min, max) : min);
    els.maxAttackFilter.value = String(params.get("atkMax") ? clampRange(params.get("atkMax"), min, max) : max);
    els.attackValue.textContent = `${els.minAttackFilter.value}-${els.maxAttackFilter.value}`;
  }
  if (!els.maxResistanceFilter.disabled && resistanceBounds.max !== null) {
    const min = Number(els.minResistanceFilter.min);
    const max = Number(els.maxResistanceFilter.max);
    els.minResistanceFilter.value = String(params.get("resMin") ? clampRange(params.get("resMin"), min, max) : min);
    els.maxResistanceFilter.value = String(params.get("resMax") ? clampRange(params.get("resMax"), min, max) : max);
    els.resistanceValue.textContent = `${els.minResistanceFilter.value}-${els.maxResistanceFilter.value}`;
  }

  const requestedPage = Number(params.get("page"));
  updateStateFromControls();
  if (Number.isFinite(requestedPage) && requestedPage > 1) {
    state.currentPage = requestedPage;
    renderCards();
  }
  isApplyingUrlState = false;
}

function applyStoredStateToControls() {
  const saved = readStoredState();
  if (!saved) return false;

  const assignSelectValue = (select, value, fallback = "all") => {
    if (!select || !value) return;
    const hasOption = [...select.options].some((option) => option.value === value);
    select.value = hasOption ? value : fallback;
  };

  isApplyingUrlState = true;
  els.nameFilter.value = String(saved.name || "");
  if (els.cardNumberFilter) els.cardNumberFilter.value = String(saved.cardNumber || "");
  els.numberFilter.value = String(saved.number || "");
  els.textFilter.value = String(saved.text || "");
  if (els.queryFilter) els.queryFilter.value = String(saved.query || "");
  assignSelectValue(els.setFilter, saved.set);
  assignSelectValue(els.typeFilter, saved.type);
  assignSelectValue(els.subtypeFilter, saved.subtype);
  assignSelectValue(els.functionFilter, saved.function);
  assignSelectValue(els.roleFilter, saved.role);
  assignSelectValue(els.virtueFilter, saved.virtue);
  assignSelectValue(els.sortSelect, saved.sort, "rating-desc");
  state.viewMode = saved.viewMode === "compact" ? "compact" : "standard";
  applyViewMode();

  if (!els.maxCostFilter.disabled && costBounds.max !== null) {
    const min = Number(els.minCostFilter.min);
    const max = Number(els.maxCostFilter.max);
    const minValue = Number(saved.minCost);
    const maxValue = Number(saved.maxCost);
    els.minCostFilter.value = String(Number.isFinite(minValue) ? clampRange(minValue, min, max) : min);
    els.maxCostFilter.value = String(Number.isFinite(maxValue) ? clampRange(maxValue, min, max) : max);
    els.costValue.textContent = `${els.minCostFilter.value}-${els.maxCostFilter.value}`;
  }
  if (!els.maxAttackFilter.disabled && attackBounds.max !== null) {
    const min = Number(els.minAttackFilter.min);
    const max = Number(els.maxAttackFilter.max);
    const minValue = Number(saved.minAttack);
    const maxValue = Number(saved.maxAttack);
    els.minAttackFilter.value = String(Number.isFinite(minValue) ? clampRange(minValue, min, max) : min);
    els.maxAttackFilter.value = String(Number.isFinite(maxValue) ? clampRange(maxValue, min, max) : max);
    els.attackValue.textContent = `${els.minAttackFilter.value}-${els.maxAttackFilter.value}`;
  }
  if (!els.maxResistanceFilter.disabled && resistanceBounds.max !== null) {
    const min = Number(els.minResistanceFilter.min);
    const max = Number(els.maxResistanceFilter.max);
    const minValue = Number(saved.minResistance);
    const maxValue = Number(saved.maxResistance);
    els.minResistanceFilter.value = String(Number.isFinite(minValue) ? clampRange(minValue, min, max) : min);
    els.maxResistanceFilter.value = String(Number.isFinite(maxValue) ? clampRange(maxValue, min, max) : max);
    els.resistanceValue.textContent = `${els.minResistanceFilter.value}-${els.maxResistanceFilter.value}`;
  }

  updateStateFromControls();
  isApplyingUrlState = false;
  syncUrlFromState();
  return true;
}

function hideHoverPreview() {
  if (!els.hoverPreview) return;
  els.hoverPreview.classList.remove("is-visible");
  els.hoverPreview.innerHTML = "";
}

function moveHoverPreview(event) {
  if (!els.hoverPreview || !els.hoverPreview.classList.contains("is-visible")) return;
  const margin = 16;
  const width = els.hoverPreview.offsetWidth || 280;
  const height = els.hoverPreview.offsetHeight || 380;
  let x = event.clientX + margin;
  let y = event.clientY + margin;
  if (x + width > window.innerWidth - margin) x = event.clientX - width - margin;
  if (y + height > window.innerHeight - margin) y = window.innerHeight - height - margin;
  if (y < margin) y = margin;
  els.hoverPreview.style.left = `${x}px`;
  els.hoverPreview.style.top = `${y}px`;
}

function showHoverPreview(cardCode, event) {
  if (!els.hoverPreview || window.innerWidth <= 1024 || state.viewMode !== "compact") return;
  const card = getCardByCode(cardCode);
  if (!card || !card.images?.card) return;
  const name = getCardName(card);
  els.hoverPreview.innerHTML = `
    <img src="${escapeHtml(card.images.card)}" alt="${escapeHtml(name)}" loading="lazy" />
    <div class="hover-preview-meta">
      <strong>${escapeHtml(name)}</strong>
      <span>${escapeHtml(getCardCode(card))}</span>
    </div>
  `;
  els.hoverPreview.classList.add("is-visible");
  moveHoverPreview(event);
}

function removeActiveFilter(key) {
  if (key === "name") els.nameFilter.value = "";
  if (key === "cardNumber" && els.cardNumberFilter) els.cardNumberFilter.value = "";
  if (key === "number") els.numberFilter.value = "";
  if (key === "text") els.textFilter.value = "";
  if (key === "set") els.setFilter.value = "all";
  if (key === "type") els.typeFilter.value = "all";
  if (key === "subtype") els.subtypeFilter.value = "all";
  if (key === "function") els.functionFilter.value = "all";
  if (key === "role" && els.roleFilter) els.roleFilter.value = "all";
  if (key === "virtue" && els.virtueFilter) els.virtueFilter.value = "all";
  if (key === "query" && els.queryFilter) els.queryFilter.value = "";
  if (key === "cost" && !els.maxCostFilter.disabled && costBounds.max !== null) {
    els.minCostFilter.value = String(costBounds.min);
    els.maxCostFilter.value = String(costBounds.max);
  }
  if (key === "attack" && !els.maxAttackFilter.disabled && attackBounds.max !== null) {
    els.minAttackFilter.value = String(attackBounds.min);
    els.maxAttackFilter.value = String(attackBounds.max);
  }
  if (key === "resistance" && !els.maxResistanceFilter.disabled && resistanceBounds.max !== null) {
    els.minResistanceFilter.value = String(resistanceBounds.min);
    els.maxResistanceFilter.value = String(resistanceBounds.max);
  }
  updateStateFromControls();
}

function renderPagination(totalItems) {
  const totalPages = Math.max(1, Math.ceil(totalItems / state.itemsPerPage));
  if (state.currentPage > totalPages) state.currentPage = totalPages;

  const pageButtons = Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    return `<button class="page-btn ${page === state.currentPage ? "is-active" : ""}" type="button" data-page="${page}">${page}</button>`;
  }).join("");

  const start = totalItems === 0 ? 0 : (state.currentPage - 1) * state.itemsPerPage + 1;
  const end = Math.min(state.currentPage * state.itemsPerPage, totalItems);

  els.pagination.innerHTML = `
    <div class="pagination-info">${escapeHtml(t("showing"))} ${start}-${end} ${escapeHtml(t("of"))} ${totalItems}</div>
    <div class="pagination-controls">
      <button class="page-btn" type="button" data-page="prev" ${state.currentPage === 1 ? "disabled" : ""}>${escapeHtml(t("previous"))}</button>
      ${pageButtons}
      <button class="page-btn" type="button" data-page="next" ${state.currentPage === totalPages ? "disabled" : ""}>${escapeHtml(t("next"))}</button>
    </div>
  `;
}

function getCardByCode(cardCode) {
  return cardsData.find((item) => getCardCode(item) === cardCode);
}

function renderDetailMeta(card) {
  const meta = [
    ["identification", t("identification"), getCardCode(card)],
    ["type", t("type"), formatList(card.type).join(", ") || t("noData")],
    ["subtype", t("subtype"), formatList(card.subtype).join(", ") || t("noData")],
    ["status", t("status"), renderStatusSummary(card), true],
    ["collection", t("collection"), getCollectionLabel(card)],
    ["rating", t("rating"), `★ ${card.rating.toFixed(1)}/5.0`]
  ];

  return meta.map(([key, label, value, raw]) => `
    <article class="drawer-meta-card drawer-meta-card--${escapeHtml(key)}">
      <span>${escapeHtml(label)}</span>
      <strong>${raw ? value : escapeHtml(value)}</strong>
    </article>
  `).join("");
}

function renderTagGroup(items, modifier) {
  return items.map((item) => `<span class="card-tag ${modifier}">${escapeHtml(item)}</span>`).join("");
}

function renderVirtueImages(card) {
  const virtues = formatVirtueItems(card);
  if (!virtues.length) {
    return `<span class="card-tag card-tag--empty">${escapeHtml(t("noVirtues"))}</span>`;
  }

  return virtues.map((virtue) => `
    <figure class="virtue-mark" title="${escapeHtml(virtue.label)}">
      ${virtue.image ? `<img src="${escapeHtml(virtue.image)}" alt="${escapeHtml(virtue.label)}" loading="lazy" />` : ""}
      <figcaption class="sr-only">${escapeHtml(virtue.label)}</figcaption>
    </figure>
  `).join("");
}

function normalizeRulingEntries(kind) {
  return normalizeList(rulingBase[kind]).map((entry) => {
    const key = entry.type || entry.subtype || entry.effect || entry.keyword || entry.match || entry.title || "";
    return {
      ...entry,
      key,
      title: entry.title || key,
      forms: normalizeList(entry.forms),
      rulings: normalizeList(entry.rulings || entry.ruling).map((item) => String(item)).filter(Boolean)
    };
  }).filter((entry) => entry.key && entry.rulings.length);
}

function normalizedIncludes(haystack, needle) {
  const target = normalizeRuleText(needle);
  if (!target) return false;
  return normalizeRuleText(haystack).includes(target);
}

function normalizedEquals(left, right) {
  return normalizeRuleText(left) === normalizeRuleText(right);
}

function normalizedHasPhrase(haystack, needle) {
  const source = ` ${normalizeRuleText(haystack)} `;
  const target = normalizeRuleText(needle);
  if (!target) return false;
  return source.includes(` ${target} `);
}

function keywordForms(keyword) {
  const normalized = normalizeRuleText(keyword);
  const forms = [keyword];
  if (normalized.endsWith("ar")) {
    const root = normalized.slice(0, -2);
    forms.push(
      `${root}ar`,
      `${root}ado`,
      `${root}ada`,
      `${root}acao`,
      `${root}acoes`,
      `${root}ando`,
      `${root}ei`,
      `${root}e`,
      `${root}ou`,
      `${root}a`,
      `${root}am`
    );
  }
  return forms;
}

function cardRulingText(card) {
  return flattenValue(card.text);
}

function matchingRulingEntries(card, kind) {
  const typeValues = normalizeList(card.type).flatMap((value) => [localize(value), structuralValue(value), flattenValue(value)]);
  const subtypeValues = normalizeList(card.subtype).flatMap((value) => [localize(value), structuralValue(value), flattenValue(value)]);
  const text = cardRulingText(card);
  const primaryType = normalizeSearch(getPrimaryType(card));
  const identityTypes = [normalizeSearch("Campeão"), normalizeSearch("Campeao"), normalizeSearch("Templo"), normalizeSearch("Território"), normalizeSearch("Territorio")];

  return normalizeRulingEntries(kind).filter((entry) => {
    if (kind === "type") return typeValues.some((value) => normalizedEquals(value, entry.key));
    if (kind === "subtype") return subtypeValues.some((value) => normalizedEquals(value, entry.key));
    if (identityTypes.includes(primaryType)) return false;
    if (kind === "effect") return normalizedHasPhrase(text, entry.key);
    if (kind === "keyword") {
      const forms = [...entry.forms, ...keywordForms(entry.keyword || entry.key)];
      return forms.some((form) => normalizedHasPhrase(text, form));
    }
    return false;
  });
}

function getRulingGroups(card) {
  const groups = [];
  if (card.rulings?.length) {
    groups.push({
      title: "",
      generic: false,
      rulings: card.rulings
    });
  }

  ["type", "subtype", "effect", "keyword"].forEach((kind) => {
    matchingRulingEntries(card, kind).forEach((entry) => {
      groups.push({
        title: String(entry.title || "").toUpperCase(),
        generic: true,
        rulings: entry.rulings
      });
    });
  });

  return groups;
}

function renderRulings(card) {
  const groups = getRulingGroups(card);
  if (!groups.length) {
    return `<p>${escapeHtml(t("noData"))}</p>`;
  }

  return `
    <div class="ruling-groups">
      ${groups.map((group) => `
        <article class="ruling-group">
          ${group.generic ? `<strong>${escapeHtml(group.title)}</strong>` : ""}
          <ul>
            ${group.rulings.map((ruling) => `<li>${escapeHtml(ruling)}</li>`).join("")}
          </ul>
        </article>
      `).join("")}
    </div>
  `;
}

function openDrawer(cardCode) {
  const card = getCardByCode(cardCode);
  if (!card) return;

  const name = getCardName(card);
  const image = card.images.card || card.images.art;
  const backgroundImage = card.images.art || image;
  const functions = formatFunctions(card);
  const referenceParts = formatReferenceParts(card);
  const reference = referenceParts.text
    ? `<span class="drawer-reference-text">"${escapeHtml(referenceParts.text)}"</span>${referenceParts.citation ? ` - <span class="drawer-reference-citation">${escapeHtml(referenceParts.citation)}</span>` : ""}`
    : escapeHtml(t("noData"));

  els.drawerPanel?.style.setProperty("--drawer-bg", `url("${cssUrl(backgroundImage)}")`);
  els.drawerContent.innerHTML = `
    <section class="detail-layout">
      <div class="detail-art">
        <img src="${escapeHtml(image)}" alt="${escapeHtml(`${t("imageAlt")}: ${name}`)}" />
      </div>
      <div class="detail-main">
        <div class="detail-heading">
          <span class="section-kicker">${escapeHtml(name)}</span>
        </div>

        <div class="drawer-section drawer-section--compact">
          <h3>${escapeHtml(t("cardText"))}</h3>
          ${renderRulings(card)}
          <p class="drawer-reference">${reference}</p>
        </div>
      </div>
      <aside class="detail-side">
        <div class="drawer-meta">
          ${renderDetailMeta(card)}
        </div>
        <div class="drawer-section drawer-section--compact">
          <h3>${escapeHtml(t("functions"))}</h3>
          <div class="drawer-tags">
            ${renderTagGroup(functions, "card-tag--function")}
          </div>
        </div>
        <div class="drawer-section drawer-section--compact">
          <h3>${escapeHtml(t("virtues"))}</h3>
          <div class="virtue-grid">
            ${renderVirtueImages(card)}
          </div>
        </div>
        <div class="drawer-section drawer-section--compact">
          <h3>${escapeHtml(t("usage"))}</h3>
        </div>
        ${renderUsageCard(card, true)}
        <div class="detail-mini-chart" style="--usage:${Number(card.usage?.inclusion) || 0}%">
          <span style="--h:68%"></span>
          <span style="--h:42%"></span>
          <span style="--h:86%"></span>
          <span style="--h:55%"></span>
          <span style="--h:74%"></span>
        </div>
      </aside>
    </section>
  `;

  els.drawer.classList.add("is-open");
  els.drawer.setAttribute("aria-hidden", "false");
  els.drawerClose.setAttribute("aria-label", t("close"));
  document.body.style.overflow = "hidden";
}

function closeDrawer() {
  els.drawer.classList.remove("is-open");
  els.drawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  els.drawerPanel?.style.removeProperty("--drawer-bg");
}

function bindTilt() {
  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      if (window.innerWidth < 900) return;
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 5;
      const rotateX = ((y / rect.height) - 0.5) * -5;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

function updateStateFromControls() {
  state.name = els.nameFilter.value;
  state.cardNumber = els.cardNumberFilter?.value || "";
  state.number = els.numberFilter.value;
  state.set = els.setFilter.value;
  state.type = els.typeFilter.value;
  state.subtype = els.subtypeFilter.value;
  state.function = els.functionFilter.value;
  state.role = els.roleFilter?.value || "all";
  state.virtue = els.virtueFilter?.value || "all";
  state.minCost = els.minCostFilter.disabled ? null : Math.min(Number(els.minCostFilter.value), Number(els.maxCostFilter.value));
  state.maxCost = els.maxCostFilter.disabled ? null : Math.max(Number(els.minCostFilter.value), Number(els.maxCostFilter.value));
  state.minAttack = els.minAttackFilter.disabled ? null : Math.min(Number(els.minAttackFilter.value), Number(els.maxAttackFilter.value));
  state.maxAttack = els.maxAttackFilter.disabled ? null : Math.max(Number(els.minAttackFilter.value), Number(els.maxAttackFilter.value));
  state.minResistance = els.minResistanceFilter.disabled ? null : Math.min(Number(els.minResistanceFilter.value), Number(els.maxResistanceFilter.value));
  state.maxResistance = els.maxResistanceFilter.disabled ? null : Math.max(Number(els.minResistanceFilter.value), Number(els.maxResistanceFilter.value));
  state.text = els.textFilter.value;
  state.query = els.queryFilter?.value || "";
  state.sort = els.sortSelect.value;
  state.viewMode = els.viewCompactBtn?.classList.contains("is-active") ? "compact" : "standard";
  state.currentPage = 1;
  els.costValue.textContent = els.maxCostFilter.disabled ? t("noCost") : `${state.minCost}-${state.maxCost}`;
  els.attackValue.textContent = els.maxAttackFilter.disabled ? t("noData") : `${state.minAttack}-${state.maxAttack}`;
  els.resistanceValue.textContent = els.maxResistanceFilter.disabled ? t("noData") : `${state.minResistance}-${state.maxResistance}`;
  renderCards();
  applyViewMode();
  syncUrlFromState();
  saveUiState();
  updateQuerySuggestions();
}

function resetFilters() {
  state.name = "";
  state.cardNumber = "";
  state.number = "";
  state.set = "all";
  state.type = "all";
  state.subtype = "all";
  state.function = "all";
  state.role = "all";
  state.virtue = "all";
  state.text = "";
  state.query = "";
  state.sort = "rating-desc";
  state.currentPage = 1;
  state.minCost = costBounds.min;
  state.maxCost = costBounds.max;
  state.minAttack = attackBounds.min;
  state.maxAttack = attackBounds.max;
  state.minResistance = resistanceBounds.min;
  state.maxResistance = resistanceBounds.max;

  els.nameFilter.value = "";
  if (els.cardNumberFilter) els.cardNumberFilter.value = "";
  els.numberFilter.value = "";
  els.setFilter.value = "all";
  els.typeFilter.value = "all";
  els.subtypeFilter.value = "all";
  els.functionFilter.value = "all";
  if (els.roleFilter) els.roleFilter.value = "all";
  if (els.virtueFilter) els.virtueFilter.value = "all";
  els.textFilter.value = "";
  if (els.queryFilter) els.queryFilter.value = "";
  els.sortSelect.value = "rating-desc";

  if (!els.maxCostFilter.disabled && costBounds.max !== null) {
    els.minCostFilter.value = String(costBounds.min);
    els.maxCostFilter.value = String(costBounds.max);
    els.costValue.textContent = `${costBounds.min}-${costBounds.max}`;
  }
  if (!els.maxAttackFilter.disabled && attackBounds.max !== null) {
    els.minAttackFilter.value = String(attackBounds.min);
    els.maxAttackFilter.value = String(attackBounds.max);
    els.attackValue.textContent = `${attackBounds.min}-${attackBounds.max}`;
  }
  if (!els.maxResistanceFilter.disabled && resistanceBounds.max !== null) {
    els.minResistanceFilter.value = String(resistanceBounds.min);
    els.maxResistanceFilter.value = String(resistanceBounds.max);
    els.resistanceValue.textContent = `${resistanceBounds.min}-${resistanceBounds.max}`;
  }

  renderCards();
  applyViewMode();
  syncUrlFromState();
  saveUiState();
  hideQuerySuggestions();
}

function applyLanguage(lang) {
  state.lang = lang;
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";

  document.querySelectorAll("[data-pt]").forEach((node) => {
    const value = node.dataset[lang];
    if (typeof value === "undefined") return;
    if (node.tagName === "INPUT") {
      node.placeholder = value;
    } else {
      node.textContent = value;
    }
  });

  els.langButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
  });

  populateFilters();
  state.set = els.setFilter.value;
  state.type = els.typeFilter.value;
  state.subtype = els.subtypeFilter.value;
  state.function = els.functionFilter.value;
  state.role = els.roleFilter?.value || "all";
  state.virtue = els.virtueFilter?.value || "all";
  state.minCost = els.minCostFilter.disabled ? null : Number(els.minCostFilter.value);
  state.maxCost = els.maxCostFilter.disabled ? null : Number(els.maxCostFilter.value);
  state.minAttack = els.minAttackFilter.disabled ? null : Number(els.minAttackFilter.value);
  state.maxAttack = els.maxAttackFilter.disabled ? null : Number(els.maxAttackFilter.value);
  state.minResistance = els.minResistanceFilter.disabled ? null : Number(els.minResistanceFilter.value);
  state.maxResistance = els.maxResistanceFilter.disabled ? null : Number(els.maxResistanceFilter.value);
  if (els.copyQueryBtn) {
    els.copyQueryBtn.textContent = t("copyQuery");
    els.copyQueryBtn.classList.remove("is-copied");
  }
  renderCards();
  applyViewMode();
  saveUiState();
  updateQuerySuggestions();
}

async function loadCards() {
  setCatalogMessage("loading", t("loadingTitle"), t("loadingBody"));

  try {
    const referenceEntries = Object.entries(REFERENCE_URLS);
    const [cardsResponse, rulingsResponse, ...referenceResponses] = await Promise.all([
      fetch(DATA_URL),
      fetch(RULINGS_URL),
      ...referenceEntries.map(([, url]) => fetch(url))
    ]);
    if (!cardsResponse.ok) throw new Error(`HTTP ${cardsResponse.status}`);
    if (!rulingsResponse.ok) throw new Error(`HTTP ${rulingsResponse.status}`);
    const failedReference = referenceResponses.find((response) => !response.ok);
    if (failedReference) throw new Error(`HTTP ${failedReference.status}`);

    const payload = await cardsResponse.json();
    const rulingsPayload = await rulingsResponse.json();
    const referencePayloads = await Promise.all(referenceResponses.map((response) => response.json()));
    setReferenceData(Object.fromEntries(referenceEntries.map(([key], index) => [key, referencePayloads[index]])));

    cardsMeta = payload.meta || {};
    rulingBase = rulingsPayload.rulings || { type: [], subtype: [], effect: [], keyword: [] };
    cardsData = (payload.cards || []).map((card, index) => normalizeCard(card, payload.defaults || {}, index));

    populateFilters();
    if (hasUrlState()) {
      applyUrlStateToControls();
    } else if (!applyStoredStateToControls()) {
      renderCards();
      applyViewMode();
      syncUrlFromState();
    }
  } catch (error) {
    console.error(error);
    setCatalogMessage("error", t("errorTitle"), t("errorBody"));
  }
}

els.mobileToggle?.addEventListener("click", () => {
  const isOpen = els.primaryNav.classList.toggle("is-open");
  els.mobileToggle.setAttribute("aria-expanded", String(isOpen));
});

els.primaryNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    els.primaryNav.classList.remove("is-open");
    els.mobileToggle?.setAttribute("aria-expanded", "false");
  });
});

[
  els.nameFilter,
  els.cardNumberFilter,
  els.numberFilter,
  els.setFilter,
  els.typeFilter,
  els.subtypeFilter,
  els.functionFilter,
  els.roleFilter,
  els.virtueFilter,
  els.minCostFilter,
  els.maxCostFilter,
  els.minAttackFilter,
  els.maxAttackFilter,
  els.minResistanceFilter,
  els.maxResistanceFilter,
  els.textFilter,
  els.queryFilter,
  els.sortSelect
].forEach((control) => {
  control?.addEventListener(control.tagName === "SELECT" ? "change" : "input", updateStateFromControls);
});

els.queryFilter?.addEventListener("focus", updateQuerySuggestions);
els.queryFilter?.addEventListener("click", updateQuerySuggestions);
els.queryFilter?.addEventListener("keydown", (event) => {
  if (!querySuggestionState || els.querySuggestions.hidden) return;

  const options = [...els.querySuggestions.querySelectorAll("[data-query-option]")];
  if (!options.length) return;

  if (event.key === "ArrowRight") {
    event.preventDefault();
    setActiveSuggestion((querySuggestionState.activeIndex || 0) + 1);
    return;
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    setActiveSuggestion((querySuggestionState.activeIndex || 0) - 1);
    return;
  }

  if (event.key === "Tab") {
    const active = options[querySuggestionState.activeIndex || 0] || options[0];
    if (active) {
      event.preventDefault();
      applySuggestion(active.dataset.queryOption);
    }
  }
});

els.querySuggestions?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-query-option]");
  if (!button) return;
  applySuggestion(button.dataset.queryOption);
});

els.copyQueryBtn?.addEventListener("click", async () => {
  const value = (els.queryFilter?.value || "").trim();
  if (!value) return;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    } else {
      const temp = document.createElement("textarea");
      temp.value = value;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      temp.remove();
    }
    els.copyQueryBtn.textContent = t("copied");
    els.copyQueryBtn.classList.add("is-copied");
    setTimeout(() => {
      els.copyQueryBtn.textContent = t("copyQuery");
      els.copyQueryBtn.classList.remove("is-copied");
    }, 1200);
  } catch (error) {
    console.error("Copy query failed", error);
  }
});

els.viewStandardBtn?.addEventListener("click", () => {
  state.viewMode = "standard";
  applyViewMode();
  hideHoverPreview();
  saveUiState();
  syncUrlFromState();
});

els.viewCompactBtn?.addEventListener("click", () => {
  state.viewMode = "compact";
  applyViewMode();
  saveUiState();
  syncUrlFromState();
});

els.clearFilters.addEventListener("click", resetFilters);

els.cardsGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-open-card]");
  if (!button) return;
  openDrawer(button.dataset.openCard);
});

els.cardsGrid.addEventListener("mouseenter", (event) => {
  const button = event.target.closest("[data-open-card]");
  if (!button) return;
  showHoverPreview(button.dataset.openCard, event);
}, true);

els.cardsGrid.addEventListener("mousemove", (event) => {
  const button = event.target.closest("[data-open-card]");
  if (!button) {
    hideHoverPreview();
    return;
  }
  if (!els.hoverPreview?.classList.contains("is-visible")) {
    showHoverPreview(button.dataset.openCard, event);
    return;
  }
  moveHoverPreview(event);
});

els.cardsGrid.addEventListener("mouseleave", hideHoverPreview);

els.activeFilters?.addEventListener("click", (event) => {
  const emptyAction = event.target.closest("[data-empty-action]");
  if (emptyAction) {
    if (emptyAction.dataset.emptyAction === "clear-query" && els.queryFilter) {
      els.queryFilter.value = "";
      updateStateFromControls();
      return;
    }
    if (emptyAction.dataset.emptyAction === "clear-all") {
      resetFilters();
      return;
    }
  }

  const button = event.target.closest("[data-remove-filter]");
  if (!button) return;
  removeActiveFilter(button.dataset.removeFilter);
});

els.pagination.addEventListener("click", (event) => {
  const button = event.target.closest("[data-page]");
  if (!button || button.disabled) return;

  const value = button.dataset.page;
  if (value === "prev") state.currentPage -= 1;
  else if (value === "next") state.currentPage += 1;
  else state.currentPage = Number(value);

  renderCards();
  saveUiState();
  syncUrlFromState();
  window.scrollTo({ top: els.cardsGrid.offsetTop - 120, behavior: "smooth" });
});

els.drawerBackdrop.addEventListener("click", closeDrawer);
els.drawerClose.addEventListener("click", closeDrawer);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeDrawer();
});

els.langButtons.forEach((button) => {
  button.addEventListener("click", () => applyLanguage(button.dataset.lang));
});

window.addEventListener("scroll", () => {
  handleHeader();
  handleReveal();
});

window.addEventListener("load", () => {
  handleHeader();
  handleReveal();
  loadCards();
});

window.addEventListener("pageshow", () => {
  syncUrlFromState();
});
