const DATA_URL = "../data/cards.json";

const typeLabels = {
  Artefato: { pt: "Artefato", en: "Artifact" },
  Campeao: { pt: "Campeão", en: "Champion" },
  Milagre: { pt: "Milagre", en: "Miracle" },
  Pecado: { pt: "Pecado", en: "Sin" },
  Personagem: { pt: "Personagem", en: "Character" },
  Templo: { pt: "Templo", en: "Temple" },
  Territorio: { pt: "Território", en: "Territory" },
  Virtude: { pt: "Virtude", en: "Virtue" }
};

const typeOrder = [
  "Campeao",
  "Territorio",
  "Templo",
  "Personagem",
  "Milagre",
  "Artefato",
  "Virtude",
  "Pecado"
];

const typeCodes = {
  Artefato: "ART",
  Campeao: "CAM",
  Milagre: "MIL",
  Pecado: "PEC",
  Personagem: "PER",
  Templo: "TEM",
  Territorio: "TER",
  Virtude: "VIR"
};

const subtypeByType = {
  Artefato: { pt: "Relíquia", en: "Relic" },
  Campeao: { pt: "Ungido", en: "Anointed" },
  Milagre: { pt: "Intervenção", en: "Intervention" },
  Pecado: { pt: "Desvirtude", en: "Vice" },
  Personagem: { pt: "Aliado", en: "Ally" },
  Templo: { pt: "Estrutura", en: "Structure" },
  Territorio: { pt: "Campo", en: "Field" },
  Virtude: { pt: "Virtude moral", en: "Moral virtue" }
};

const functionsByType = {
  Artefato: [{ pt: "Ferramenta", en: "Tool" }, { pt: "Valor", en: "Value" }],
  Campeao: [{ pt: "Condição de vitória", en: "Win condition" }, { pt: "Pressão", en: "Pressure" }],
  Milagre: [{ pt: "Resposta", en: "Answer" }, { pt: "Virada", en: "Swing" }],
  Pecado: [{ pt: "Disrupção", en: "Disruption" }, { pt: "Risco", en: "Risk" }],
  Personagem: [{ pt: "Presença", en: "Presence" }, { pt: "Sinergia", en: "Synergy" }],
  Templo: [{ pt: "Suporte", en: "Support" }, { pt: "Motor", en: "Engine" }],
  Territorio: [{ pt: "Base", en: "Base" }, { pt: "Recursos", en: "Resources" }],
  Virtude: [{ pt: "Identidade", en: "Identity" }, { pt: "Aprimoramento", en: "Enhancement" }]
};

const archetypesByType = {
  Artefato: [{ pt: "Midrange", en: "Midrange" }, { pt: "Combo", en: "Combo" }],
  Campeao: [{ pt: "Midrange", en: "Midrange" }, { pt: "Controle", en: "Control" }],
  Milagre: [{ pt: "Controle", en: "Control" }, { pt: "Tempo", en: "Tempo" }],
  Pecado: [{ pt: "Disrupção", en: "Disruption" }, { pt: "Controle", en: "Control" }],
  Personagem: [{ pt: "Aggro", en: "Aggro" }, { pt: "Midrange", en: "Midrange" }],
  Templo: [{ pt: "Controle", en: "Control" }, { pt: "Valor", en: "Value" }],
  Territorio: [{ pt: "Base", en: "Base" }, { pt: "Ramp", en: "Ramp" }],
  Virtude: [{ pt: "Aggro", en: "Aggro" }, { pt: "Sinergia", en: "Synergy" }]
};

const copy = {
  pt: {
    all: "Todos",
    allFeminine: "Todas",
    loadingTitle: "Carregando cartas",
    loadingBody: "Buscando os dados da coleção Foundations.",
    errorTitle: "Não foi possível carregar as cartas",
    errorBody: "Confira se a página está sendo servida por um servidor local e se data/cards.json existe.",
    emptyTitle: "Nenhuma carta encontrada",
    emptyBody: "Tente reduzir a combinação de filtros ou buscar por outro termo.",
    results: "Resultados",
    showing: "Mostrando",
    of: "de",
    previous: "Anterior",
    next: "Próxima",
    cost: "Custo",
    noCost: "Sem custo definido",
    viewDetails: "Ver detalhes",
    noData: "A definir",
    cardText: "Texto da carta",
    reference: "Referência da carta",
    usage: "Utilização",
    rating: "Avaliação",
    decks: "Decks",
    deckTypes: "Tipos de deck",
    inclusion: "Inclusão",
    type: "Tipo",
    subtype: "Subtipo",
    functions: "Funções",
    set: "Coleção",
    number: "Número",
    imageAlt: "Imagem da carta",
    close: "Fechar detalhes"
  },
  en: {
    all: "All",
    allFeminine: "All",
    loadingTitle: "Loading cards",
    loadingBody: "Fetching the Foundations card data.",
    errorTitle: "Cards could not be loaded",
    errorBody: "Check that the page is running from a local server and that data/cards.json exists.",
    emptyTitle: "No cards found",
    emptyBody: "Try reducing the filter combination or searching for a different term.",
    results: "Results",
    showing: "Showing",
    of: "of",
    previous: "Prev",
    next: "Next",
    cost: "Cost",
    noCost: "No cost defined",
    viewDetails: "View details",
    noData: "TBD",
    cardText: "Card text",
    reference: "Card reference",
    usage: "Usage",
    rating: "Rating",
    decks: "Decks",
    deckTypes: "Deck types",
    inclusion: "Inclusion",
    type: "Type",
    subtype: "Subtype",
    functions: "Functions",
    set: "Set",
    number: "Number",
    imageAlt: "Card image",
    close: "Close details"
  }
};

const state = {
  currentPage: 1,
  itemsPerPage: 12,
  name: "",
  number: "",
  set: "all",
  type: "all",
  subtype: "all",
  function: "all",
  maxCost: null,
  text: "",
  sort: "rating-desc",
  lang: "pt"
};

const els = {
  header: document.getElementById("siteHeader"),
  mobileToggle: document.getElementById("mobileToggle"),
  primaryNav: document.getElementById("primaryNav"),
  cardsGrid: document.getElementById("cardsGrid"),
  resultCount: document.getElementById("resultCount"),
  pagination: document.getElementById("pagination"),
  nameFilter: document.getElementById("nameFilter"),
  numberFilter: document.getElementById("numberFilter"),
  setFilter: document.getElementById("setFilter"),
  typeFilter: document.getElementById("typeFilter"),
  subtypeFilter: document.getElementById("subtypeFilter"),
  functionFilter: document.getElementById("functionFilter"),
  costFilter: document.getElementById("costFilter"),
  costValue: document.getElementById("costValue"),
  textFilter: document.getElementById("textFilter"),
  sortSelect: document.getElementById("sortSelect"),
  clearFilters: document.getElementById("clearFilters"),
  drawer: document.getElementById("cardDrawer"),
  drawerBackdrop: document.getElementById("drawerBackdrop"),
  drawerClose: document.getElementById("drawerClose"),
  drawerContent: document.getElementById("drawerContent"),
  langButtons: document.querySelectorAll(".lang-btn")
};

let cardsData = [];
let cardsMeta = {};
let costBounds = { min: null, max: null };

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
    return value[state.lang] || value.pt || value.en || Object.values(value).find(Boolean) || "";
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

function getTypeRank(type) {
  const index = typeOrder.indexOf(type);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function labelForType(type) {
  return typeLabels[type]?.[state.lang] || type || t("noData");
}

function labelForValue(value) {
  if (!value || value === "A definir") return t("noData");
  return localize(value);
}

function getCardName(card) {
  return localize(card.name) || `${labelForType(card.type)} ${card.number}`;
}

function getCardCode(card) {
  const prefix = typeCodes[card.type] || "CRD";
  return `${prefix}-${card.number}`;
}

function toCost(value) {
  if (value === null || typeof value === "undefined" || value === "") return null;
  const cost = Number(value);
  return Number.isFinite(cost) ? cost : null;
}

function deriveCost(type, numericNumber) {
  const baseByType = {
    Campeao: 5,
    Territorio: 0,
    Templo: 2,
    Personagem: 2,
    Milagre: 3,
    Artefato: 2,
    Virtude: 1,
    Pecado: 2
  };
  const base = baseByType[type] ?? 2;
  const offset = numericNumber % 3;
  return Math.max(0, Math.min(8, base + offset));
}

function getDefaultSubtype(type) {
  return subtypeByType[type] || { pt: "A definir", en: "TBD" };
}

function getDefaultFunctions(type) {
  return functionsByType[type] || [{ pt: "A definir", en: "TBD" }];
}

function deriveRating(type, numericNumber) {
  const baseByType = {
    Campeao: 4.2,
    Territorio: 3.8,
    Templo: 3.9,
    Personagem: 3.5,
    Milagre: 3.7,
    Artefato: 3.6,
    Virtude: 3.8,
    Pecado: 3.4
  };
  const base = baseByType[type] || 3.2;
  const offset = ((numericNumber % 4) - 1) * 0.25;
  return Math.max(1, Math.min(5, Math.round((base + offset) * 2) / 2));
}

function deriveUsage(type, numericNumber, rating) {
  const baseDecks = {
    Campeao: 18,
    Territorio: 22,
    Templo: 14,
    Personagem: 16,
    Milagre: 15,
    Artefato: 13,
    Virtude: 17,
    Pecado: 11
  };
  const deckCount = (baseDecks[type] || 10) + (numericNumber % 7);
  const inclusion = Math.max(8, Math.min(92, Math.round(deckCount * 2.1 + rating * 7)));
  return {
    deckCount,
    inclusion,
    archetypes: archetypesByType[type] || [{ pt: "Aberto", en: "Open" }]
  };
}

function normalizeList(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeCard(card, defaults, index) {
  const merged = {
    ...defaults,
    ...card,
    images: {
      ...(defaults.images || {}),
      ...(card.images || {})
    },
    usage: {
      ...(defaults.usage || {}),
      ...(card.usage || {})
    }
  };

  const type = merged.type || "Carta";
  const number = String(merged.number || index + 1).padStart(3, "0");
  const numericNumber = Number(number.replace(/\D/g, "")) || index + 1;
  const cost = toCost(merged.cost) ?? deriveCost(type, numericNumber);
  const subtype = merged.subtype && merged.subtype !== "A definir" ? merged.subtype : getDefaultSubtype(type);
  const functions = normalizeList(merged.functions).length ? normalizeList(merged.functions) : getDefaultFunctions(type);
  const rating = Number(merged.rating) > 0 ? Number(merged.rating) : deriveRating(type, numericNumber);
  const usage = Number(merged.usage?.deckCount) > 0 ? merged.usage : deriveUsage(type, numericNumber, rating);
  const tags = [
    ...(Array.isArray(merged.tags) ? merged.tags : []),
    type,
    subtype,
    merged.set,
    ...functions,
    ...(usage.archetypes || [])
  ].filter(Boolean);

  return {
    ...merged,
    id: merged.id || `${String(merged.set || "set").toLowerCase()}-${String(type).toLowerCase()}-${number}`,
    number,
    collectionIndex: index + 1,
    numericNumber,
    type,
    subtype,
    functions,
    cost,
    rating,
    usage,
    tags
  };
}

function icon(name) {
  const paths = {
    decks: '<path d="M6 4h10a2 2 0 0 1 2 2v12H8a2 2 0 0 1-2-2V4Z"/><path d="M8 8h7"/><path d="M8 12h7"/>',
    chart: '<path d="M4 18V6"/><path d="M9 18v-7"/><path d="M14 18V9"/><path d="M19 18V4"/>',
    layers: '<path d="m12 3 8 4-8 4-8-4 8-4Z"/><path d="m4 12 8 4 8-4"/><path d="m4 17 8 4 8-4"/>',
    tag: '<path d="M20 10 12 2H4v8l8 8 8-8Z"/><path d="M7.5 7.5h.01"/>',
    star: '<path d="m12 3 2.7 5.47 6.03.88-4.36 4.25 1.03 6-5.4-2.84-5.4 2.84 1.03-6-4.36-4.25 6.03-.88L12 3Z"/>',
    text: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h10"/>'
  };
  return `<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.tag}</svg>`;
}

function formatFunctions(card) {
  return card.functions.map((item) => labelForValue(item)).filter(Boolean);
}

function formatArchetypes(card) {
  return normalizeList(card.usage?.archetypes).map((item) => labelForValue(item)).filter(Boolean);
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
  // els.resultCount.textContent = "0";
  els.pagination.innerHTML = "";
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
    case "rating-desc":
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0) || getCardName(a).localeCompare(getCardName(b), locale));
      break;
    default:
      sorted.sort((a, b) => a.collectionIndex - b.collectionIndex);
  }

  return sorted;
}

function getFilteredCards() {
  const name = normalizeSearch(state.name.trim());
  const number = normalizeSearch(state.number.trim());
  const text = normalizeSearch(state.text.trim());

  return sortCards(cardsData.filter((card) => {
    const matchesName = !name || normalizeSearch(card.name).includes(name);
    const matchesNumber = !number || normalizeSearch([card.number, getCardCode(card)]).includes(number);
    const matchesSet = state.set === "all" || card.set === state.set;
    const matchesType = state.type === "all" || card.type === state.type;
    const matchesSubtype = state.subtype === "all" || labelForValue(card.subtype) === state.subtype;
    const functionLabels = formatFunctions(card);
    const matchesFunction = state.function === "all" || functionLabels.includes(state.function);
    const matchesCost = state.maxCost === null || card.cost === null || card.cost <= state.maxCost;
    const matchesText = !text || normalizeSearch([card.text, card.reference, card.details, card.tags]).includes(text);

    return matchesName && matchesNumber && matchesSet && matchesType && matchesSubtype && matchesFunction && matchesCost && matchesText;
  }));
}

function getUniqueValues(field) {
  if (field === "subtype") {
    return [...new Set(cardsData.map((card) => labelForValue(card.subtype)).filter(Boolean))].sort();
  }
  if (field === "function") {
    return [...new Set(cardsData.flatMap(formatFunctions).filter(Boolean))].sort();
  }
  return [...new Set(cardsData.map((card) => card[field]).filter(Boolean))].sort((a, b) => {
    if (field === "type") return getTypeRank(a) - getTypeRank(b);
    return labelForValue(a).localeCompare(labelForValue(b), state.lang === "pt" ? "pt-BR" : "en-US");
  });
}

function populateSelect(select, values, allLabel, getLabel = labelForValue) {
  if (!select) return;
  const previous = select.value || "all";
  select.innerHTML = [
    `<option value="all">${escapeHtml(allLabel)}</option>`,
    ...values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(getLabel(value))}</option>`)
  ].join("");
  select.value = values.includes(previous) ? previous : "all";
}

function setupCostFilter() {
  const costs = cardsData.map((card) => card.cost).filter((cost) => cost !== null);
  const hasCosts = costs.length > 0;

  if (!hasCosts) {
    costBounds = { min: null, max: null };
    state.maxCost = null;
    els.costFilter.min = "0";
    els.costFilter.max = "0";
    els.costFilter.value = "0";
    els.costFilter.disabled = true;
    els.costFilter.closest(".filter-group")?.classList.add("is-disabled");
    els.costValue.textContent = t("noCost");
    return;
  }

  const min = Math.min(...costs);
  const max = Math.max(...costs);
  costBounds = { min, max };
  state.maxCost = state.maxCost ?? max;
  els.costFilter.min = String(min);
  els.costFilter.max = String(max);
  els.costFilter.value = String(state.maxCost);
  els.costFilter.disabled = false;
  els.costFilter.closest(".filter-group")?.classList.remove("is-disabled");
  els.costValue.textContent = String(state.maxCost);
}

function populateFilters() {
  populateSelect(els.setFilter, getUniqueValues("set"), t("allFeminine"));
  populateSelect(els.typeFilter, getUniqueValues("type"), t("all"), labelForType);
  populateSelect(els.subtypeFilter, getUniqueValues("subtype"), t("allFeminine"), (value) => value);
  populateSelect(els.functionFilter, getUniqueValues("function"), t("allFeminine"), (value) => value);
  setupCostFilter();
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

function renderCards() {
  const filtered = getFilteredCards();
  const start = (state.currentPage - 1) * state.itemsPerPage;
  const paginated = filtered.slice(start, start + state.itemsPerPage);

  // els.resultCount.textContent = String(filtered.length);

  if (!paginated.length) {
    setCatalogMessage("empty", t("emptyTitle"), t("emptyBody"));
    renderPagination(filtered.length);
    return;
  }

  els.cardsGrid.innerHTML = paginated.map((card) => {
    const name = getCardName(card);
    return `
      <button class="card-entry card-entry-button tilt-card" type="button" data-id="${escapeHtml(card.id)}" data-open-card="${escapeHtml(card.id)}" aria-label="${escapeHtml(`${t("viewDetails")}: ${name}`)}">
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

function getCardById(cardId) {
  return cardsData.find((item) => item.id === cardId);
}

function renderDetailMeta(card) {
  const meta = [
    [t("cost"), card.cost === null ? t("noData") : card.cost],
    [t("type"), labelForType(card.type)],
    [t("subtype"), labelForValue(card.subtype)],
    [t("set"), card.set],
    [t("number"), getCardCode(card)],
    [t("rating"), `★ ${card.rating.toFixed(1)}/5.0`]
  ];

  return meta.map(([label, value]) => `
    <article class="drawer-meta-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </article>
  `).join("");
}

function openDrawer(cardId) {
  const card = getCardById(cardId);
  if (!card) return;

  const name = getCardName(card);
  const image = card.images.card || card.images.art;
  const functions = formatFunctions(card);

  els.drawerContent.innerHTML = `
    <section class="detail-layout">
      <div class="detail-art">
        <img src="${escapeHtml(image)}" alt="${escapeHtml(`${t("imageAlt")}: ${name}`)}" />
      </div>
      <div class="detail-main">
        <div class="detail-heading">
          <span class="section-kicker">${escapeHtml(card.set)} · ${escapeHtml(getCardCode(card))}</span>
          <h2>${escapeHtml(name)}</h2>
        </div>

        <div class="drawer-meta">
          ${renderDetailMeta(card)}
        </div>

        <div class="drawer-section drawer-section--compact">
          <h3>${escapeHtml(t("functions"))}</h3>
          <div class="drawer-tags">
            ${functions.map((item) => `<span class="card-tag card-tag--function">${escapeHtml(item)}</span>`).join("")}
          </div>
        </div>

        <div class="drawer-section drawer-section--compact">
          <h3>${escapeHtml(t("cardText"))}</h3>
          <p>${escapeHtml(localize(card.text) || t("noData"))}</p>
        </div>

        <div class="drawer-section drawer-section--compact">
          <h3>${escapeHtml(t("reference"))}</h3>
          <p class="drawer-reference">${escapeHtml(localize(card.reference) || t("noData"))}</p>
        </div>
      </div>
      <aside class="detail-side">
        <h3>${escapeHtml(t("usage"))}</h3>
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
  state.number = els.numberFilter.value;
  state.set = els.setFilter.value;
  state.type = els.typeFilter.value;
  state.subtype = els.subtypeFilter.value;
  state.function = els.functionFilter.value;
  state.maxCost = els.costFilter.disabled ? null : Number(els.costFilter.value);
  state.text = els.textFilter.value;
  state.sort = els.sortSelect.value;
  state.currentPage = 1;
  els.costValue.textContent = els.costFilter.disabled ? t("noCost") : String(state.maxCost);
  renderCards();
}

function resetFilters() {
  state.name = "";
  state.number = "";
  state.set = "all";
  state.type = "all";
  state.subtype = "all";
  state.function = "all";
  state.text = "";
  state.sort = "rating-desc";
  state.currentPage = 1;
  state.maxCost = costBounds.max;

  els.nameFilter.value = "";
  els.numberFilter.value = "";
  els.setFilter.value = "all";
  els.typeFilter.value = "all";
  els.subtypeFilter.value = "all";
  els.functionFilter.value = "all";
  els.textFilter.value = "";
  els.sortSelect.value = "rating-desc";

  if (!els.costFilter.disabled && costBounds.max !== null) {
    els.costFilter.value = String(costBounds.max);
    els.costValue.textContent = String(costBounds.max);
  }

  renderCards();
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
  renderCards();
}

async function loadCards() {
  setCatalogMessage("loading", t("loadingTitle"), t("loadingBody"));

  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const payload = await response.json();
    cardsMeta = payload.meta || { set: payload.defaults?.deck?.pt || "Foundations" };
    cardsData = (payload.cards || []).map((card, index) => normalizeCard(card, payload.defaults || {}, index));

    populateFilters();
    renderCards();
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
  els.numberFilter,
  els.setFilter,
  els.typeFilter,
  els.subtypeFilter,
  els.functionFilter,
  els.costFilter,
  els.textFilter,
  els.sortSelect
].forEach((control) => {
  control?.addEventListener(control.tagName === "SELECT" ? "change" : "input", updateStateFromControls);
});

els.clearFilters.addEventListener("click", resetFilters);

els.cardsGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-open-card]");
  if (!button) return;
  openDrawer(button.dataset.openCard);
});

els.pagination.addEventListener("click", (event) => {
  const button = event.target.closest("[data-page]");
  if (!button || button.disabled) return;

  const value = button.dataset.page;
  if (value === "prev") state.currentPage -= 1;
  else if (value === "next") state.currentPage += 1;
  else state.currentPage = Number(value);

  renderCards();
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
