const DATA_URLS = {
  cards: "../data/cards.json",
  decks: "../data/decks.json",
  types: "../data/types.json",
  collections: "../data/collections.json",
  virtues: "../data/virtues.json"
};

const CARD_BACK_IMAGE = "../assets/logo/Fundo - Foundation.webp";
const BUILDER_STORAGE_KEY = "adonai.deckbuilder.v1";
const PLAY_STORAGE_KEY = "adonai.play.v1";
const BUILDER_DECK_ID = "BUILDER_CURRENT";
const MAIN_DECK_SIZE = 40;
const INITIAL_HAND_SIZE = 6;
const MAX_HAND_SIZE = 7;
const PHASES = ["prepare", "draw", "consecration", "preparation", "combat", "regroup", "discard"];
const PHASE_LABELS = {
  prepare: "Preparação",
  draw: "Compra",
  consecration: "Consagração",
  preparation: "Alistamento",
  combat: "Combate",
  regroup: "Reagrupamento",
  discard: "Descarte"
};
const TYPE_LABELS = {
  ART: "Artefato",
  CMP: "Campeao",
  MIL: "Milagre",
  PEC: "Pecado",
  PER: "Personagem",
  TEM: "Templo",
  TER: "Territorio"
};

const els = {
  setupView: document.getElementById("setupView"),
  gameView: document.getElementById("gameView"),
  humanDeckSelect: document.getElementById("humanDeckSelect"),
  botDeckSelect: document.getElementById("botDeckSelect"),
  botModeSelect: document.getElementById("botModeSelect"),
  setupMatchPreview: document.getElementById("setupMatchPreview"),
  startGameButton: document.getElementById("startGameButton"),
  newGameButton: document.getElementById("newGameButton"),
  resetGameButton: document.getElementById("resetGameButton"),
  soundToggleButton: document.getElementById("soundToggleButton"),
  botArea: document.getElementById("botArea"),
  humanArea: document.getElementById("humanArea"),
  botBattlefield: document.getElementById("botBattlefield"),
  humanBattlefield: document.getElementById("humanBattlefield"),
  phasePanel: document.getElementById("phasePanel"),
  phaseTracker: document.getElementById("phaseTracker"),
  phaseIndicator: document.getElementById("phaseIndicator"),
  phaseRoundDock: document.getElementById("phaseRoundDock"),
  botEssence: document.getElementById("botEssence"),
  humanEssence: document.getElementById("humanEssence"),
  gameLog: document.getElementById("gameLog"),
  handDock: document.querySelector(".hand-dock"),
  humanHand: document.getElementById("humanHand"),
  actionGrid: document.querySelector(".action-grid"),
  stackEdgePanel: document.getElementById("stackEdgePanel"),
  selectedCardPanel: document.getElementById("selectedCardPanel"),
  drawButton: document.getElementById("drawButton"),
  consecrateButton: document.getElementById("consecrateButton"),
  playCardButton: document.getElementById("playCardButton"),
  attackButton: document.getElementById("attackButton"),
  nextPhaseButton: document.getElementById("nextPhaseButton"),
  endTurnButton: document.getElementById("endTurnButton"),
  concedeButton: document.getElementById("concedeButton"),
  gameResult: document.getElementById("gameResult"),
  gameResultTitle: document.getElementById("gameResultTitle"),
  gameResultText: document.getElementById("gameResultText"),
  resultNewGameButton: document.getElementById("resultNewGameButton")
};

const app = {
  cards: [],
  decks: [],
  deckOptions: [],
  cardByCode: new Map(),
  typesById: new Map(),
  collectionsById: new Map(),
  virtues: [],
  virtuesById: new Map(),
  game: null,
  selected: null,
  expandedTemplePlayer: "",
  lastConfig: null,
  soundEnabled: true,
  audio: null,
  dragPayload: null,
  pointerDrag: null,
  zoomTimer: null,
  zoomCardId: "",
  handExpanded: false,
  territorySnapshot: new Map(),
  preloadedImages: new Set(),
  preloadPromises: new Map(),
  setupPreloadToken: 0,
  setupAssetsReady: false,
  autoPassTimer: null,
  blockReviewResume: null,
  priority: null
};

function localize(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.pt || value.en || "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cssUrl(value) {
  return String(value || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function toNumber(value, fallback = 0) {
  const first = Array.isArray(value) ? value[0] : value;
  if (first === null || typeof first === "undefined" || first === "" || String(first).trim() === "-") return fallback;
  const number = Number(first);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeNumber(value, fallback) {
  const number = Number(value);
  if (Number.isFinite(number)) return String(number).padStart(3, "0");
  return String(fallback).padStart(3, "0");
}

function getCollectionCode(collectionId) {
  const collection = app.collectionsById.get(Number(collectionId));
  return collection?.code || "FND";
}

function getTypeCodeFromIds(typeIds = []) {
  const primary = Array.isArray(typeIds) ? typeIds[0] : typeIds;
  const type = app.typesById.get(Number(primary));
  return type?.code || "CRD";
}

function getCardCode(card) {
  return `${getCollectionCode(card.collection)}-${getTypeCodeFromIds(card.type)}-${card.number}`;
}

function getCardName(card) {
  return localize(card?.name) || card?.code || "Carta";
}

function getCardTypeCode(card) {
  return card?.typeCode || getTypeCodeFromIds(card?.type);
}

function getCardTypeLabel(card) {
  const code = getCardTypeCode(card);
  return TYPE_LABELS[code] || code;
}

function getCardImage(card) {
  return card?.images?.card || "";
}

function getCardArt(card) {
  return card?.images?.art || getCardImage(card);
}

function getCost(card) {
  return toNumber(card?.cost, 0);
}

function getVirtueName(virtue) {
  return localize(virtue?.name) || `Virtude ${virtue?.id || ""}`.trim();
}

function getVirtueIcon(virtue) {
  return virtue?.images?.icon || virtue?.images?.item || "";
}

function createVirtueState() {
  return Object.fromEntries(app.virtues.map((virtue) => [String(virtue.id), 0]));
}

function getActiveVirtues(player) {
  const state = player?.virtues || {};
  return app.virtues
    .map((virtue) => ({ virtue, value: toNumber(state[String(virtue.id)], 0) }))
    .filter((item) => item.value > 0);
}

function getVirtueLevelData(virtue, level) {
  return (virtue?.levels || []).find((item) => Number(item.level) === Number(level)) || null;
}

function renderCardVirtuePips(card, limit = 4, options = {}) {
  const ids = Array.isArray(card?.virtues) ? card.virtues.slice(0, limit) : [];
  if (options.fixedSlots) {
    return Array.from({ length: limit }, (_, index) => {
      const id = ids[index];
      const virtue = app.virtuesById.get(Number(id));
      const isActive = Boolean(id);
      const icon = isActive ? getVirtueIcon(virtue) : "";
      const label = isActive ? getVirtueName(virtue) : `Espaco de virtude ${index + 1}`;
      return `
        <span class="hand-card-pip-slot ${isActive ? "is-filled" : "is-empty"}" aria-label="${escapeHtml(label)}">
          ${icon
            ? `<img src="${escapeHtml(icon)}" alt="${escapeHtml(label)}" loading="lazy" draggable="false" />`
            : isActive ? `<b>${escapeHtml(id)}</b>` : ""}
        </span>
      `;
    }).join("");
  }
  if (!ids.length) return "";
  return ids.map((id) => {
    const virtue = app.virtuesById.get(Number(id));
    const icon = getVirtueIcon(virtue);
    return icon
      ? `<img src="${escapeHtml(icon)}" alt="${escapeHtml(getVirtueName(virtue))}" loading="lazy" draggable="false" />`
      : `<span>${escapeHtml(id)}</span>`;
  }).join("");
}

function isLandscapeCard(card) {
  const code = getCardTypeCode(card);
  return code === "TER" || code === "TEM";
}

function isMainDeckCard(card) {
  return !["CMP", "TER", "TEM"].includes(getCardTypeCode(card));
}

function normalizeCard(card, defaults, index) {
  const merged = {
    ...defaults,
    ...card,
    images: {
      ...(defaults.images || {}),
      ...(card.images || {})
    },
    stats: {
      ...(defaults.stats || {}),
      ...(card.stats || {})
    }
  };
  merged.number = normalizeNumber(merged.number, index + 1);
  merged.cost = toNumber(merged.cost, 0);
  merged.typeCode = getTypeCodeFromIds(merged.type);
  merged.code = getCardCode(merged);
  return merged;
}

function readPlayStorage() {
  try {
    return JSON.parse(localStorage.getItem(PLAY_STORAGE_KEY) || "{}");
  } catch (error) {
    localStorage.removeItem(PLAY_STORAGE_KEY);
    return {};
  }
}

function writePlayStorage(patch) {
  const next = { ...readPlayStorage(), ...patch };
  localStorage.setItem(PLAY_STORAGE_KEY, JSON.stringify(next));
}

function getBuilderDeckOption() {
  let saved = null;
  try {
    saved = JSON.parse(localStorage.getItem(BUILDER_STORAGE_KEY) || "{}");
  } catch (error) {
    return null;
  }

  const identity = {
    champions: Array.isArray(saved.identity?.champions) ? saved.identity.champions.slice(0, 1) : [],
    territories: Array.isArray(saved.identity?.territories) ? saved.identity.territories.slice(0, 1) : [],
    temples: Array.isArray(saved.identity?.temples) ? saved.identity.temples.slice(0, 1) : []
  };
  const cards = Array.isArray(saved.main) ? saved.main.slice(0, MAIN_DECK_SIZE) : [];
  const allKnown = [...cards, ...identity.champions, ...identity.territories, ...identity.temples]
    .every((id) => app.cardByCode.has(id));
  const identityOk = identity.champions.length === 1 && identity.territories.length === 1 && identity.temples.length === 1;
  const mainOk = cards.length === MAIN_DECK_SIZE && new Set(cards).size === MAIN_DECK_SIZE;

  if (!allKnown || !identityOk || !mainOk) return null;

  return {
    id: BUILDER_DECK_ID,
    name: { pt: "Deckbuilder atual", en: "Current deckbuilder deck" },
    source: "builder",
    identity,
    cards
  };
}

function getDeckName(deck) {
  return localize(deck?.name) || deck?.id || "Deck";
}

function getDeckOption(deckId) {
  return app.deckOptions.find((deck) => deck.id === deckId) || app.deckOptions[0] || null;
}

function validateDeck(deck) {
  if (!deck) return "Deck nao encontrado.";
  const cards = Array.isArray(deck.cards) ? deck.cards : [];
  const reserve = Array.isArray(deck.reserve) ? deck.reserve : [];
  const identity = deck.identity || {};
  const identityIds = []
    .concat(identity.champions || [])
    .concat(identity.territories || [])
    .concat(identity.temples || []);

  if (cards.length !== MAIN_DECK_SIZE) return `Deck principal precisa ter ${MAIN_DECK_SIZE} cartas.`;
  if (new Set(cards).size !== cards.length) return "Deck principal precisa ser Singleton.";
  if ((identity.champions || []).length !== 1 || (identity.territories || []).length !== 1 || (identity.temples || []).length !== 1) {
    return "Identidade precisa ter Campeao, Territorio e Templo.";
  }
  if (![...cards, ...reserve, ...identityIds].every((id) => app.cardByCode.has(id))) return "Deck possui cartas desconhecidas.";
  if (!cards.every((id) => isMainDeckCard(app.cardByCode.get(id)))) return "Deck principal possui carta de Identidade.";
  return "";
}

function getDeckIdentityCards(deck) {
  const identity = deck?.identity || {};
  return {
    champion: app.cardByCode.get(identity.champions?.[0]),
    temple: app.cardByCode.get(identity.temples?.[0]),
    territory: app.cardByCode.get(identity.territories?.[0])
  };
}

function getDeckTypeCounts(deck) {
  const counts = { PER: 0, MIL: 0, ART: 0, PEC: 0 };
  (deck?.cards || []).forEach((cardId) => {
    const code = getCardTypeCode(app.cardByCode.get(cardId));
    if (Object.prototype.hasOwnProperty.call(counts, code)) counts[code] += 1;
  });
  return counts;
}

function renderBotModeSelector() {
  const options = Array.from(els.botModeSelect.options || []);
  return `
    <div class="setup-difficulty" role="group" aria-label="Dificuldade do bot">
      <span>Dificuldade</span>
      <div>
        ${options.map((option) => `
          <button class="${option.value === els.botModeSelect.value ? "is-active" : ""}" type="button" data-bot-mode="${escapeHtml(option.value)}">
            ${escapeHtml(option.textContent)}
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderSetupDeckPreview(deck, label, kind) {
  if (!deck) {
    return `
      <article class="setup-deck-card is-empty">
        <span>${escapeHtml(label)}</span>
        <strong>Deck indisponivel</strong>
      </article>
    `;
  }

  const { champion, temple, territory } = getDeckIdentityCards(deck);
  const counts = getDeckTypeCounts(deck);
  const wallpaper = getCardArt(territory);
  const wallpaperStyle = wallpaper ? `style="--setup-wallpaper:url(&quot;${escapeHtml(cssUrl(wallpaper))}&quot;)"` : "";
  return `
    <article class="setup-deck-card" ${wallpaperStyle}>
      <button class="setup-carousel-button setup-carousel-button--prev" type="button" data-setup-cycle="${escapeHtml(kind)}" data-direction="-1" aria-label="Deck anterior">‹</button>
      <button class="setup-carousel-button setup-carousel-button--next" type="button" data-setup-cycle="${escapeHtml(kind)}" data-direction="1" aria-label="Proximo deck">›</button>
      <div class="setup-deck-heading">
        <div class="setup-champion-avatar">
          ${champion ? `<img src="${escapeHtml(getCardArt(champion))}" alt="${escapeHtml(getCardName(champion))}" draggable="false" />` : ""}
        </div>
        <div>
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(getDeckName(deck))}</strong>
          ${champion ? `<small>${escapeHtml(getCardName(champion))}</small>` : ""}
        </div>
      </div>
      <div class="setup-identity-strip">
        ${temple ? `
          <figure>
            <img src="${escapeHtml(getCardImage(temple))}" alt="${escapeHtml(getCardName(temple))}" draggable="false" />
            <figcaption>Templo</figcaption>
          </figure>
        ` : ""}
        ${territory ? `
          <figure>
            <img src="${escapeHtml(getCardImage(territory))}" alt="${escapeHtml(getCardName(territory))}" draggable="false" />
            <figcaption>Territorio</figcaption>
          </figure>
        ` : ""}
      </div>
      <div class="setup-deck-facts">
        <span>${(deck.cards || []).length} cartas</span>
        <span>${counts.PER} Pers.</span>
        <span>${counts.MIL} Mil.</span>
        <span>${counts.ART} Art.</span>
        <span>${counts.PEC} Pec.</span>
      </div>
      ${kind === "bot" ? renderBotModeSelector() : ""}
    </article>
  `;
}

function updateSetupPreview(humanDeck, botDeck) {
  if (!els.setupMatchPreview) return;
  els.setupMatchPreview.innerHTML = `
    ${renderSetupDeckPreview(humanDeck, "Voce", "human")}
    <div class="setup-versus" aria-hidden="true">VS</div>
    ${renderSetupDeckPreview(botDeck, "Bot", "bot")}
  `;
}

function getDeckAssetUrls(deck) {
  const identity = deck?.identity || {};
  const ids = new Set([
    ...(deck?.cards || []),
    ...(deck?.reserve || []),
    ...(identity.champions || []),
    ...(identity.temples || []),
    ...(identity.territories || [])
  ]);
  const urls = [];
  ids.forEach((cardId) => {
    const card = app.cardByCode.get(cardId);
    [getCardImage(card), getCardArt(card)].forEach((url) => {
      if (url) urls.push(url);
    });
    (card?.virtues || []).forEach((virtueId) => {
      const virtue = app.virtuesById.get(Number(virtueId));
      [virtue?.images?.icon, virtue?.images?.item].forEach((url) => {
        if (url) urls.push(url);
      });
    });
  });
  return urls;
}

function preloadImageAsset(url) {
  if (!url || app.preloadedImages.has(url)) return Promise.resolve();
  if (app.preloadPromises.has(url)) return app.preloadPromises.get(url);
  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.loading = "eager";
    image.onload = () => {
      app.preloadedImages.add(url);
      app.preloadPromises.delete(url);
      resolve(url);
    };
    image.onerror = () => {
      app.preloadPromises.delete(url);
      reject(new Error(`Asset nao carregou: ${url}`));
    };
    image.src = url;
  });
  app.preloadPromises.set(url, promise);
  return promise;
}

function preloadDeckImages(...decks) {
  const urls = [...new Set(decks.flatMap(getDeckAssetUrls).filter(Boolean))];
  return Promise.all(urls.map(preloadImageAsset));
}

function populateDeckSelects() {
  const builderDeck = getBuilderDeckOption();
  app.deckOptions = builderDeck ? [builderDeck, ...app.decks] : [...app.decks];

  const options = app.deckOptions.map((deck) => {
    const label = deck.source === "builder" ? `${getDeckName(deck)} (local)` : getDeckName(deck);
    return `<option value="${escapeHtml(deck.id)}">${escapeHtml(label)}</option>`;
  }).join("");

  els.humanDeckSelect.innerHTML = options;
  els.botDeckSelect.innerHTML = app.decks.map((deck) => (
    `<option value="${escapeHtml(deck.id)}">${escapeHtml(getDeckName(deck))}</option>`
  )).join("");

  const params = new URLSearchParams(window.location.search);
  const saved = readPlayStorage();
  const requestedDeck = params.get("deck");
  const requestedSource = params.get("source");

  if (requestedSource === "deckbuilder" && builderDeck) {
    els.humanDeckSelect.value = BUILDER_DECK_ID;
  } else if (requestedDeck && getDeckOption(requestedDeck)) {
    els.humanDeckSelect.value = requestedDeck;
  } else if (saved.humanDeckId && getDeckOption(saved.humanDeckId)) {
    els.humanDeckSelect.value = saved.humanDeckId;
  }

  if (saved.botDeckId && app.decks.some((deck) => deck.id === saved.botDeckId)) {
    els.botDeckSelect.value = saved.botDeckId;
  } else if (app.decks[1]) {
    els.botDeckSelect.value = app.decks[1].id;
  }

  if (saved.botMode) els.botModeSelect.value = saved.botMode;
  updateSetupStatus();
}

function cycleSetupDeck(kind, direction) {
  const select = kind === "human" ? els.humanDeckSelect : els.botDeckSelect;
  const source = kind === "human" ? app.deckOptions : app.decks;
  if (!select || !source.length) return;
  const ids = source.map((deck) => deck.id);
  const currentIndex = Math.max(0, ids.indexOf(select.value));
  const nextIndex = (currentIndex + direction + ids.length) % ids.length;
  select.value = ids[nextIndex];
  writePlayStorage(kind === "human" ? { humanDeckId: select.value } : { botDeckId: select.value });
  updateSetupStatus();
}

async function updateSetupStatus() {
  const humanDeck = getDeckOption(els.humanDeckSelect.value);
  const botDeck = app.decks.find((deck) => deck.id === els.botDeckSelect.value);
  const humanError = validateDeck(humanDeck);
  const botError = validateDeck(botDeck);
  const error = humanError || botError;
  const token = ++app.setupPreloadToken;

  app.setupAssetsReady = false;
  updateSetupPreview(humanDeck, botDeck);
  els.startGameButton.disabled = true;
  if (error) {
    els.startGameButton.textContent = "Deck invalido";
    return;
  }

  els.startGameButton.textContent = "Carregando assets...";
  try {
    await preloadDeckImages(humanDeck, botDeck);
    if (token !== app.setupPreloadToken) return;
    app.setupAssetsReady = true;
    els.startGameButton.textContent = "Iniciar partida";
    els.startGameButton.disabled = false;
    updateSetupPreview(humanDeck, botDeck);
  } catch (error) {
    if (token !== app.setupPreloadToken) return;
    app.setupAssetsReady = false;
    els.startGameButton.textContent = "Assets incompletos";
    els.startGameButton.disabled = true;
  }
}

function createCardInstance(cardId, owner) {
  return {
    uid: `${owner}-${cardId}-${Math.random().toString(36).slice(2, 9)}`,
    cardId,
    owner,
    exhausted: false,
    declaredAttacker: false,
    damage: 0
  };
}

function createCombatState() {
  return {
    attackerId: "",
    attackers: [],
    selectedAttackers: [],
    attackTargets: {},
    blockers: {},
    awaitingBlockers: "",
    blockPromptAttackUid: "",
    selectedBlockerUid: "",
    selectedAttackerUid: "",
    step: "",
    resolving: false
  };
}

function shuffle(values, seedText) {
  const list = [...values];
  let seed = 0;
  String(seedText || Date.now()).split("").forEach((char) => {
    seed = (seed * 31 + char.charCodeAt(0)) >>> 0;
  });
  for (let index = list.length - 1; index > 0; index -= 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const swapIndex = seed % (index + 1);
    [list[index], list[swapIndex]] = [list[swapIndex], list[index]];
  }
  return list;
}

function drawCards(player, amount) {
  const drawn = [];
  for (let index = 0; index < amount; index += 1) {
    const cardId = player.deck.shift();
    if (!cardId) break;
    player.hand.push(cardId);
    drawn.push(cardId);
  }
  return drawn;
}

function createPlayer(id, label, deck, isBot = false) {
  const seed = `${deck.id}-${id}-${Date.now()}-${Math.random()}`;
  const player = {
    id,
    label,
    isBot,
    deckId: deck.id,
    deckName: getDeckName(deck),
    identity: {
      champion: deck.identity.champions[0],
      territory: deck.identity.territories[0],
      temple: deck.identity.temples[0]
    },
    deck: shuffle(deck.cards, seed),
    hand: [],
    battlefield: [],
    essence: [],
    cemetery: [],
    exile: [],
    reserve: Array.isArray(deck.reserve) ? [...deck.reserve] : [],
    virtues: createVirtueState(),
    territoryDamage: 0,
    maxTerritory: getTerritoryLife(deck.identity.territories[0]),
    spentEssence: 0,
    consecratedThisTurn: false,
    consecrationActionTaken: false,
    drewThisTurn: false,
    combatDeclaredThisTurn: false
  };
  drawCards(player, INITIAL_HAND_SIZE);
  return player;
}

function createMatchStats() {
  const playerStats = () => ({ human: 0, bot: 0 });
  return {
    cardsPlayed: playerStats(),
    cardsConsecrated: playerStats(),
    cardsDrawn: playerStats(),
    damageDealt: playerStats(),
    territoryDamageDealt: playerStats(),
    enemyTerritoryDamageDealt: playerStats(),
    ownTerritoryDamageDealt: playerStats(),
    characterDamageDealt: playerStats(),
    damageTaken: playerStats()
  };
}

function addPlayerStat(game, key, playerId, amount = 1) {
  if (!game?.stats?.[key] || !game.stats[key][playerId] && game.stats[key][playerId] !== 0) return;
  game.stats[key][playerId] += Math.max(0, toNumber(amount, 0));
}

function getTerritoryLife(cardId) {
  const card = app.cardByCode.get(cardId);
  const structured = [
    card?.stats?.life,
    card?.stats?.vida,
    card?.stats?.resistance,
    card?.life,
    card?.vida,
    card?.resistance
  ].map((value) => toNumber(value, 0)).find((value) => value > 0);
  if (structured) return structured;
  const text = String(card?.text || "");
  const match = text.match(/\b(2[0-9]|3[0-9])\b/);
  return match ? Number(match[1]) : 28;
}

function getAvailableEssence(player) {
  return Math.max(0, player.essence.length - player.spentEssence);
}

function getPlayer(game, playerId) {
  return game.players[playerId];
}

function getOpponentId(playerId) {
  return playerId === "human" ? "bot" : "human";
}

function getOpponent(game, playerId) {
  return getPlayer(game, getOpponentId(playerId));
}

function currentPlayer(game) {
  return getPlayer(game, game.activePlayer);
}

function currentPhase(game) {
  return PHASES[game.phaseIndex] || PHASES[0];
}

function setGamePhase(game, phase, playerId = game.activePlayer, force = false) {
  const phaseIndex = PHASES.indexOf(phase);
  if (phaseIndex < 0) return false;
  const changed = game.phaseIndex !== phaseIndex;
  game.phaseIndex = phaseIndex;
  if ((changed || force) && (phase === "prepare" || phase === "combat")) {
    showPhaseAlert(phase, playerId);
  }
  return true;
}

function addLog(game, message, actor = "") {
  game.log.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    actor,
    message
  });
  game.log = game.log.slice(0, 40);
}

function chooseStartingPlayer() {
  return Math.random() < 0.5 ? "human" : "bot";
}

function createGame(humanDeck, botDeck, botMode) {
  const startingPlayer = chooseStartingPlayer();
  const game = {
    id: `LOCAL-${Date.now()}`,
    players: {
      human: createPlayer("human", "Voce", humanDeck, false),
      bot: createPlayer("bot", "Bot", botDeck, true)
    },
    activePlayer: startingPlayer,
    startingPlayer,
    openingDrawSkipped: false,
    phaseIndex: 0,
    turnNumber: 1,
    turnsElapsed: 0,
    stack: [],
    status: "active",
    winner: "",
    selectedUid: "",
    combat: createCombatState(),
    priorityPasses: {},
    stats: createMatchStats(),
    botMode,
    config: {
      humanDeckId: humanDeck.id,
      botDeckId: botDeck.id,
      botMode
    },
    log: []
  };
  addLog(game, `Partida iniciada: ${getDeckName(humanDeck)} contra ${getDeckName(botDeck)}.`);
  addLog(game, `Sorteio: ${currentPlayer(game).label} comeca a partida.`);
  addLog(game, "Prototipo local: compra, consagracao e combate foram aproximados das regras atuais.");
  return game;
}

function beginTurn(game) {
  const player = currentPlayer(game);
  game.turnsElapsed = toNumber(game.turnsElapsed, 0) + 1;
  player.spentEssence = 0;
  player.consecratedThisTurn = false;
  player.consecrationActionTaken = false;
  player.drewThisTurn = false;
  player.combatDeclaredThisTurn = false;
  player.battlefield.forEach((instance) => {
    instance.exhausted = false;
    instance.declaredAttacker = false;
  });
  game.combat = createCombatState();
  setGamePhase(game, "prepare", player.id, true);
  addLog(game, `preparou permanentes e Essencias.`, player.label);
  setTimeout(() => {
    if (!app.game || app.game !== game || game.status !== "active" || game.activePlayer !== player.id) return;
    if (currentPhase(game) !== "prepare") return;
    if (player.id === game.startingPlayer && !game.openingDrawSkipped) {
      game.openingDrawSkipped = true;
      player.drewThisTurn = true;
      setGamePhase(game, "consecration", player.id);
      addLog(game, "nao comprou no primeiro turno da partida.", player.label);
      addLog(game, `entrou em ${PHASE_LABELS.consecration}.`, player.label);
      renderGame();
      return;
    }
    setGamePhase(game, "draw", player.id);
    addLog(game, `entrou em ${PHASE_LABELS.draw}.`, player.label);
    renderGame();
    setTimeout(() => {
      if (!app.game || app.game !== game || game.status !== "active" || game.activePlayer !== player.id) return;
      if (currentPhase(game) !== "draw") return;
      applyDraw(player.id);
      renderGame();
    }, 1450);
  }, 1350);
}

function startGame() {
  if (!app.setupAssetsReady) return;
  const humanDeck = getDeckOption(els.humanDeckSelect.value);
  const botDeck = app.decks.find((deck) => deck.id === els.botDeckSelect.value);
  const humanError = validateDeck(humanDeck);
  const botError = validateDeck(botDeck);
  if (humanError || botError) {
    updateSetupStatus();
    return;
  }

  app.lastConfig = {
    humanDeckId: humanDeck.id,
    botDeckId: botDeck.id,
    botMode: els.botModeSelect.value
  };
  writePlayStorage(app.lastConfig);
  app.game = createGame(humanDeck, botDeck, els.botModeSelect.value);
  app.selected = null;
  app.expandedTemplePlayer = "";
  app.territorySnapshot.clear();
  clearHumanAutoPass();
  collapseHand();
  clearTransientOverlays();
  els.setupView.classList.add("is-hidden");
  els.gameView.classList.remove("is-hidden");
  beginTurn(app.game);
  playTone("start");
  renderGame();
  if (app.game.activePlayer === "bot") scheduleBotTurn(app.game);
}

function restartGame() {
  if (!app.lastConfig) return;
  const humanDeck = getDeckOption(app.lastConfig.humanDeckId);
  const botDeck = app.decks.find((deck) => deck.id === app.lastConfig.botDeckId);
  if (!humanDeck || !botDeck) return;
  app.game = createGame(humanDeck, botDeck, app.lastConfig.botMode || "basic");
  app.selected = null;
  app.expandedTemplePlayer = "";
  app.territorySnapshot.clear();
  clearHumanAutoPass();
  collapseHand();
  clearTransientOverlays();
  els.gameResult.classList.add("is-hidden");
  beginTurn(app.game);
  renderGame();
  if (app.game.activePlayer === "bot") scheduleBotTurn(app.game);
}

function showSetup() {
  app.game = null;
  app.selected = null;
  app.expandedTemplePlayer = "";
  app.territorySnapshot.clear();
  clearHumanAutoPass();
  collapseHand();
  clearTransientOverlays();
  els.gameResult.classList.add("is-hidden");
  els.gameView.classList.add("is-hidden");
  els.setupView.classList.remove("is-hidden");
  populateDeckSelects();
}

function canAct(playerId) {
  return app.game && app.game.status === "active" && app.game.activePlayer === playerId;
}

function getPriorityKey(game, key) {
  return `${game.id}:${game.turnNumber}:${game.activePlayer}:${currentPhase(game)}:${key}`;
}

function isHumanPriorityOpen() {
  return Boolean(app.priority?.waiting && app.priority.game === app.game && app.game?.status === "active");
}

function hasHumanPriorityPlay(game = app.game) {
  if (!game || game.status !== "active") return false;
  if (game.combat.awaitingBlockers || game.combat.resolving) return false;
  return game.players.human.hand.some((cardId) => {
    const card = app.cardByCode.get(cardId);
    return getCardTypeCode(card) === "MIL" &&
      ["combat", "regroup"].includes(currentPhase(game)) &&
      getCost(card) <= getAvailableEssence(game.players.human);
  });
}

function requestHumanPriority(game, key, label, resume) {
  if (!game || game.status !== "active") return false;
  const passKey = getPriorityKey(game, key);
  if (game.priorityPasses[passKey] || !hasHumanPriorityPlay(game)) return false;
  game.combat.step = getPriorityStepLabel(key);
  app.priority = { game, key: passKey, label, resume, waiting: true };
  addLog(game, label, "Prioridade");
  renderGame();
  return true;
}

function requestOrContinueHumanPriority(game, key, label, resume) {
  if (!requestHumanPriority(game, key, label, resume)) resume();
}

function getPriorityStepLabel(key) {
  if (key.includes("combat-start")) return "priority-combat-start";
  if (key.includes("after-attackers")) return "priority-after-attackers";
  if (key.includes("after-blockers")) return "priority-after-blockers";
  if (key.includes("before-damage")) return "priority-before-damage";
  if (key.includes("before-phase")) return "priority-before-phase";
  return "priority";
}

function passHumanPriority() {
  const priority = app.priority;
  if (!priority?.waiting || priority.game !== app.game) return false;
  priority.game.priorityPasses[priority.key] = true;
  app.priority = null;
  priority.resume();
  return true;
}

function canDraw(player) {
  return currentPhase(app.game) === "draw" && !player.drewThisTurn;
}

function canConsecrate(player, cardId) {
  return currentPhase(app.game) === "consecration" &&
    !player.consecrationActionTaken &&
    player.hand.includes(cardId);
}

function canProfane(player, index) {
  return currentPhase(app.game) === "consecration" &&
    !player.consecrationActionTaken &&
    Number.isInteger(index) &&
    index >= 0 &&
    index < player.essence.length;
}

function getHandOverflow(player) {
  return Math.max(0, (player?.hand?.length || 0) - MAX_HAND_SIZE);
}

function canDiscardForHandLimit(player, cardId) {
  return app.game?.status === "active" &&
    app.game.activePlayer === player?.id &&
    currentPhase(app.game) === "discard" &&
    getHandOverflow(player) > 0 &&
    player.hand.includes(cardId);
}

function canPlayCard(player, cardId) {
  if (!player.hand.includes(cardId)) return false;
  const card = app.cardByCode.get(cardId);
  const phase = currentPhase(app.game);
  const typeCode = getCardTypeCode(card);
  const isOwnTurn = app.game.activePlayer === player.id;

  if (!isOwnTurn) {
    return isHumanPriorityOpen() &&
      player.id === "human" &&
      typeCode === "MIL" &&
      ["preparation", "combat", "regroup"].includes(phase) &&
      getCost(card) <= getAvailableEssence(player);
  }

  if (phase === "preparation") {
    if (typeCode === "PEC") return true;
    return getCost(card) <= getAvailableEssence(player);
  }

  if ((phase === "combat" || phase === "regroup") && typeCode === "MIL") {
    return getCost(card) <= getAvailableEssence(player);
  }

  return false;
}

function canBotSurviveSinCost(bot, cardId) {
  const card = app.cardByCode.get(cardId);
  if (getCardTypeCode(card) !== "PEC") return true;
  return bot.territoryDamage + getCost(card) < bot.maxTerritory;
}

function canAttackWith(player, uid) {
  if (currentPhase(app.game) !== "combat") return false;
  const instance = player.battlefield.find((item) => item.uid === uid);
  if (!instance || instance.exhausted || instance.declaredAttacker) return false;
  const card = app.cardByCode.get(instance.cardId);
  return getCardTypeCode(card) === "PER";
}

function normalizeKeywordText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function cardHasKeyword(card, keyword) {
  const normalizedKeyword = normalizeKeywordText(keyword);
  return normalizeKeywordText(card?.text)
    .split(/\n/)
    .flatMap((line) => line.split(/[,;]/))
    .map((part) => part.trim())
    .some((part) => part === normalizedKeyword);
}

function getCharacterPower(instance) {
  const card = app.cardByCode.get(instance?.cardId);
  return Math.max(0, toNumber(card?.stats?.attack, 0));
}

function getCharacterResistance(instance) {
  const card = app.cardByCode.get(instance?.cardId);
  return Math.max(0, toNumber(card?.stats?.resistance, 0));
}

function getLethalDamageNeeded(instance) {
  return Math.max(0, getCharacterResistance(instance) - toNumber(instance?.damage, 0));
}

function getTerritoryAttackTarget(playerId) {
  return { type: "territory", playerId };
}

function getCharacterAttackTarget(playerId, uid) {
  return { type: "character", playerId, uid };
}

function findBattlefieldInstance(player, uid) {
  return player?.battlefield.find((instance) => instance.uid === uid) || null;
}

function getAttackTarget(attackerId, attackerUid) {
  const game = app.game;
  const target = game?.combat?.attackTargets?.[attackerUid];
  return target || getTerritoryAttackTarget(getOpponentId(attackerId));
}

function isValidAttackTarget(attackerId, target) {
  if (!app.game || !target || target.playerId === attackerId) return false;
  const defender = getPlayer(app.game, target.playerId);
  if (!defender) return false;
  if (target.type === "territory") return true;
  if (target.type !== "character") return false;
  const instance = findBattlefieldInstance(defender, target.uid);
  if (!instance || !instance.exhausted) return false;
  const card = app.cardByCode.get(instance.cardId);
  return getCardTypeCode(card) === "PER";
}

function canBlockWith(player, uid) {
  if (currentPhase(app.game) !== "combat") return false;
  const instance = findBattlefieldInstance(player, uid);
  if (!instance || instance.exhausted) return false;
  const card = app.cardByCode.get(instance.cardId);
  return getCardTypeCode(card) === "PER";
}

function canBlockAttack(defender, blockerUid, attacker, attackerUid) {
  if (!canBlockWith(defender, blockerUid)) return false;
  const attackerInstance = findBattlefieldInstance(attacker, attackerUid);
  if (!attackerInstance) return false;
  const attackerCard = app.cardByCode.get(attackerInstance.cardId);
  return !cardHasKeyword(attackerCard, "IMBLOQUEAVEL");
}

function formatAttackTarget(target) {
  if (!target) return "alvo indefinido";
  const player = getPlayer(app.game, target.playerId);
  if (target.type === "territory") return `Territorio de ${player?.label || "oponente"}`;
  const instance = findBattlefieldInstance(player, target.uid);
  const card = app.cardByCode.get(instance?.cardId);
  return card ? getCardName(card) : "Personagem";
}

function setAttackTarget(attackerId, attackerUid, target) {
  if (!isValidAttackTarget(attackerId, target)) return false;
  app.game.combat.attackTargets[attackerUid] = target;
  return true;
}

function hasPlayableAlistamento(player) {
  return player.hand.some((cardId) => canPlayCard(player, cardId));
}

function hasPlayableMiracle(player) {
  return player.hand.some((cardId) => {
    const card = app.cardByCode.get(cardId);
    return getCardTypeCode(card) === "MIL" && canPlayCard(player, cardId);
  });
}

function hasCombatAttack(player) {
  if (player.combatDeclaredThisTurn) return false;
  return player.battlefield.some((instance) => canAttackWith(player, instance.uid));
}

function getHumanAutoPassReason(game) {
  if (!game || game.status !== "active" || game.activePlayer !== "human") return "";
  if (game.stack.length) return "";
  if (game.combat.awaitingBlockers || game.combat.resolving || game.combat.attackers.length) return "";

  const human = game.players.human;
  const phase = currentPhase(game);

  if (phase === "preparation" && !hasPlayableAlistamento(human)) {
    return "sem jogadas disponiveis no Alistamento";
  }

  if (phase === "combat" && !hasPlayableMiracle(human) && !hasCombatAttack(human)) {
    return "sem ataques ou Milagres disponiveis no Combate";
  }

  if (phase === "regroup" && !hasPlayableMiracle(human)) {
    return "sem Milagres disponiveis no Reagrupamento";
  }

  return "";
}

function clearHumanAutoPass() {
  if (app.autoPassTimer) window.clearTimeout(app.autoPassTimer);
  app.autoPassTimer = null;
}

function schedulePriorityAutoPass(game) {
  if (!isHumanPriorityOpen() || app.priority.game !== game || hasHumanPriorityPlay(game)) return;
  clearHumanAutoPass();
  const key = app.priority.key;
  app.autoPassTimer = window.setTimeout(() => {
    if (!isHumanPriorityOpen() || app.priority.key !== key || app.priority.game !== game) return;
    addLog(game, "autoPass: sem jogadas disponiveis na prioridade.", "Sistema");
    passHumanPriority();
    renderGame();
  }, 760);
}

function scheduleHumanAutoPass(game) {
  clearHumanAutoPass();
  if (isHumanPriorityOpen()) {
    schedulePriorityAutoPass(game);
    return;
  }
  const reason = getHumanAutoPassReason(game);
  if (!reason) return;

  const phase = currentPhase(game);
  app.autoPassTimer = window.setTimeout(() => {
    if (!app.game || app.game !== game || game.status !== "active") return;
    if (game.activePlayer !== "human" || currentPhase(game) !== phase) return;

    const latestReason = getHumanAutoPassReason(game);
    if (!latestReason) return;

    addLog(game, `autoPass: ${latestReason}.`, "Sistema");
    advancePhase(game);
  }, 950);
}

function getSelectedAttackers(player) {
  const selected = app.game?.combat?.selectedAttackers || [];
  return selected.filter((uid) => canAttackWith(player, uid));
}

function selectAttackTarget(playerId, uid, target = getTerritoryAttackTarget(getOpponentId(playerId))) {
  const game = app.game;
  const player = getPlayer(game, playerId);
  if (!canAct(playerId) || player.combatDeclaredThisTurn || !canAttackWith(player, uid)) return false;
  if (!setAttackTarget(playerId, uid, target)) return false;
  const selected = new Set(getSelectedAttackers(player));
  selected.add(uid);
  game.combat.selectedAttackers = [...selected];
  game.combat.selectedAttackerUid = uid;
  playTone("soft");
  return true;
}

function toggleAttackSelection(playerId, uid) {
  const game = app.game;
  const player = getPlayer(game, playerId);
  if (!canAct(playerId) || player.combatDeclaredThisTurn || !canAttackWith(player, uid)) return false;
  const selected = new Set(getSelectedAttackers(player));
  if (selected.has(uid)) {
    selected.delete(uid);
    delete game.combat.attackTargets[uid];
    if (game.combat.selectedAttackerUid === uid) game.combat.selectedAttackerUid = selected.values().next().value || "";
  } else {
    selected.add(uid);
    setAttackTarget(playerId, uid, getTerritoryAttackTarget(getOpponentId(playerId)));
    game.combat.selectedAttackerUid = uid;
  }
  game.combat.selectedAttackers = [...selected];
  playTone("soft");
  return true;
}

function getSelectedHumanAttackerUid() {
  const game = app.game;
  if (!game || game.activePlayer !== "human" || currentPhase(game) !== "combat") return "";
  if (game.combat.awaitingBlockers || game.combat.resolving || game.combat.attackers.length) return "";
  const uid = game.combat.selectedAttackerUid;
  return uid && canAttackWith(game.players.human, uid) && getSelectedAttackers(game.players.human).includes(uid) ? uid : "";
}

function isHumanAttackTargetAvailable(target) {
  const attackerUid = getSelectedHumanAttackerUid();
  return Boolean(attackerUid && isValidAttackTarget("human", target));
}

function chooseHumanAttackTarget(target) {
  const attackerUid = getSelectedHumanAttackerUid();
  if (!attackerUid) {
    showInteractionHint("Selecione um Personagem atacante primeiro.");
    return false;
  }
  if (!isValidAttackTarget("human", target)) {
    showInteractionHint("Esse alvo nao pode ser atacado agora.");
    return false;
  }
  const changed = selectAttackTarget("human", attackerUid, target);
  if (changed) renderGame();
  return changed;
}

function applyDraw(playerId) {
  const game = app.game;
  const player = getPlayer(game, playerId);
  if (!canDraw(player)) return false;
  const drawn = drawCards(player, 2);
  const missing = 2 - drawn.length;
  player.drewThisTurn = true;
  addPlayerStat(game, "cardsDrawn", playerId, drawn.length);
  addLog(game, `comprou ${drawn.length} carta${drawn.length === 1 ? "" : "s"}.`, player.label);
  if (missing > 0) dealTerritoryDamage(player, missing * 2, "compra impossivel", playerId);
  playTone("draw");
  checkGameEnd(game);
  const finishDraw = () => {
    if (!app.game || app.game !== game || game.status !== "active" || game.activePlayer !== playerId) return;
    setGamePhase(game, "consecration", playerId);
    addLog(game, `entrou em ${PHASE_LABELS.consecration}.`, player.label);
    renderGame();
  };
  if (drawn.length) {
    showDrawAnimation(drawn, playerId, finishDraw);
  } else {
    finishDraw();
  }
  return true;
}

function applyConsecrate(playerId, cardId) {
  const game = app.game;
  const player = getPlayer(game, playerId);
  if (!canConsecrate(player, cardId)) return false;
  const card = app.cardByCode.get(cardId);
  player.hand = player.hand.filter((id) => id !== cardId);
  player.essence.push(cardId);
  player.consecratedThisTurn = true;
  player.consecrationActionTaken = true;
  addPlayerStat(game, "cardsConsecrated", playerId);
  addLog(game, `consagrou ${getCardName(card)}.`, player.label);
  showConsecratedCardAnimation(card, playerId);
  setGamePhase(game, "preparation", playerId);
  addLog(game, `entrou em ${PHASE_LABELS.preparation}.`, player.label);
  playTone("soft");
  return true;
}

function applyProfane(playerId, index) {
  const game = app.game;
  const player = getPlayer(game, playerId);
  const essenceIndex = Number(index);
  if (!canProfane(player, essenceIndex)) return false;
  const [cardId] = player.essence.splice(essenceIndex, 1);
  if (!cardId) return false;
  const spentReduction = essenceIndex < player.spentEssence ? 1 : 0;
  player.spentEssence = Math.max(0, Math.min(player.spentEssence - spentReduction, player.essence.length));
  player.hand.push(cardId);
  player.consecrationActionTaken = true;
  const card = app.cardByCode.get(cardId);
  addLog(game, `profanou ${getCardName(card)}.`, player.label);
  showCardActionAnimation(card, playerId, playerId === "human" ? "Voce profanou" : "Bot profanou");
  setGamePhase(game, "preparation", playerId);
  addLog(game, `entrou em ${PHASE_LABELS.preparation}.`, player.label);
  playTone("soft");
  return true;
}

function discardCardFromHand(player, cardId) {
  const index = player.hand.indexOf(cardId);
  if (index < 0) return "";
  const [discardedCardId] = player.hand.splice(index, 1);
  if (discardedCardId) player.cemetery.push(discardedCardId);
  return discardedCardId || "";
}

function chooseBotDiscardCard(bot) {
  return [...bot.hand].sort((a, b) => {
    const cardA = app.cardByCode.get(a);
    const cardB = app.cardByCode.get(b);
    const typePriority = { MIL: 0, PEC: 1, ART: 2, PER: 3 };
    const typeDelta = (typePriority[getCardTypeCode(cardA)] ?? 4) - (typePriority[getCardTypeCode(cardB)] ?? 4);
    if (typeDelta !== 0) return typeDelta;
    return getCost(cardB) - getCost(cardA);
  })[0] || bot.hand[0] || "";
}

function finishDiscardCheck(game, playerId) {
  if (!game || game !== app.game || game.status !== "active" || game.activePlayer !== playerId) return;
  const player = getPlayer(game, playerId);
  if (getHandOverflow(player) > 0) {
    renderGame();
    return;
  }
  addLog(game, `ficou com ${player.hand.length}/${MAX_HAND_SIZE} cartas na mao.`, player.label);
  window.setTimeout(() => {
    if (!app.game || app.game !== game || game.status !== "active" || game.activePlayer !== playerId || currentPhase(game) !== "discard") return;
    endTurn(game);
  }, playerId === "human" ? 420 : 280);
}

function applyDiscardForHandLimit(playerId, cardId) {
  const game = app.game;
  const player = getPlayer(game, playerId);
  if (!canDiscardForHandLimit(player, cardId)) return false;
  const discardedCardId = discardCardFromHand(player, cardId);
  if (!discardedCardId) return false;
  const card = app.cardByCode.get(discardedCardId);
  app.selected = null;
  addLog(game, `descartou ${getCardName(card)} para respeitar o limite de mao.`, player.label);
  showCardActionAnimation(card, playerId, playerId === "human" ? "Voce descartou" : "Bot descartou");
  playTone("soft");
  finishDiscardCheck(game, playerId);
  return true;
}

function autoDiscardToHandLimit(game, playerId) {
  if (!game || game !== app.game || game.status !== "active" || game.activePlayer !== playerId || currentPhase(game) !== "discard") return;
  const player = getPlayer(game, playerId);
  while (getHandOverflow(player) > 0) {
    const cardId = chooseBotDiscardCard(player);
    if (!cardId) break;
    const discardedCardId = discardCardFromHand(player, cardId);
    const card = app.cardByCode.get(discardedCardId);
    addLog(game, `descartou ${getCardName(card)} para respeitar o limite de mao.`, player.label);
  }
  finishDiscardCheck(game, playerId);
}

function applyPlayCard(playerId, cardId) {
  const game = app.game;
  const player = getPlayer(game, playerId);
  if (!canPlayCard(player, cardId)) return false;

  const card = app.cardByCode.get(cardId);
  const cost = getCost(card);
  const typeCode = getCardTypeCode(card);
  if (typeCode === "PEC") {
    dealTerritoryDamage(player, cost, `custo de Pecado: ${getCardName(card)}`, playerId);
    checkGameEnd(game);
    if (game.status !== "active") return true;
  } else {
    player.spentEssence += cost;
  }
  player.hand = player.hand.filter((id) => id !== cardId);
  addPlayerStat(game, "cardsPlayed", playerId);
  showPlayedCardAnimation(card, playerId);

  if (typeCode === "PER" || typeCode === "ART") {
    player.battlefield.push(createCardInstance(cardId, playerId));
    addLog(game, `jogou ${getCardName(card)} no campo.`, player.label);
  } else {
    resolveSimpleSpell(playerId, card);
    player.cemetery.push(cardId);
    addLog(game, `resolveu ${getCardName(card)} em modo simplificado.`, player.label);
  }

  playTone(typeCode === "PEC" ? "hit" : "play");
  checkGameEnd(game);
  return true;
}

function resolveSimpleSpell(playerId, card) {
  const game = app.game;
  const player = getPlayer(game, playerId);
  const typeCode = getCardTypeCode(card);

  if (typeCode === "MIL") {
    const drawn = drawCards(player, 1);
    if (drawn.length) {
      addPlayerStat(game, "cardsDrawn", playerId, drawn.length);
      addLog(game, "efeito simplificado: comprou 1 carta.", player.label);
    }
    return;
  }

  if (typeCode === "PEC") {
    addLog(game, "Pecado sem efeito generico; apenas o custo foi pago.", player.label);
    return;
  }

  addLog(game, "efeito ainda nao implementado; carta tratada como basica.", player.label);
}

function applyAttack(playerId, uid) {
  const game = app.game;
  const player = getPlayer(game, playerId);
  if (game.combat.awaitingBlockers || game.combat.resolving) return false;
  if (player.combatDeclaredThisTurn) {
    if (playerId === "human") showInteractionHint("Todos os ataques deste combate ja foram declarados.");
    return false;
  }
  const selected = getSelectedAttackers(player);
  const targets = selected.length
    ? selected
    : uid ? [uid] : player.battlefield.filter((item) => canAttackWith(player, item.uid)).map((item) => item.uid);
  const declared = declareAttackers(playerId, targets);
  if (!declared.length) return false;
  game.combat.step = "attackers-declared";
  const continueToBlocks = () => startBlockDeclaration(playerId);
  requestOrContinueHumanPriority(game, `after-attackers:${game.combat.attackers.join(",")}`, "Prioridade depois da declaracao de atacantes.", continueToBlocks);
  return true;
}

function declareAttackers(playerId, uids) {
  const game = app.game;
  const player = getPlayer(game, playerId);
  const declared = [];
  game.combat.attackerId = playerId;
  uids.forEach((uid) => {
    if (!canAttackWith(player, uid)) return;
    const target = getAttackTarget(playerId, uid);
    if (!setAttackTarget(playerId, uid, target)) return;
    const instance = player.battlefield.find((item) => item.uid === uid);
    if (!instance) return;
    instance.exhausted = true;
    instance.declaredAttacker = true;
    if (!game.combat.attackers.includes(uid)) game.combat.attackers.push(uid);
    declared.push(instance);
  });
  game.combat.selectedAttackers = [];
  if (declared.length) {
    player.combatDeclaredThisTurn = true;
    const summary = declared
      .map((instance) => `${getCardName(app.cardByCode.get(instance.cardId))} -> ${formatAttackTarget(getAttackTarget(playerId, instance.uid))}`)
      .join("; ");
    addLog(game, `declarou ${declared.length} atacante${declared.length === 1 ? "" : "s"}: ${summary}.`, player.label);
    playTone("soft");
  }
  return declared;
}

function getCombatAttackers(attackerId = app.game?.combat?.attackerId || app.game?.activePlayer) {
  const game = app.game;
  const attackerPlayer = getPlayer(game, attackerId);
  return attackerPlayer.battlefield.filter((instance) => game.combat.attackers.includes(instance.uid));
}

function hasBlockOptions(attackerId) {
  const game = app.game;
  const attackerPlayer = getPlayer(game, attackerId);
  const defender = getOpponent(game, attackerId);
  const blockers = defender.battlefield.filter((instance) => canBlockWith(defender, instance.uid));
  if (!blockers.length) return false;
  return getCombatAttackers(attackerId).some((attacker) =>
    blockers.some((blocker) => canBlockAttack(defender, blocker.uid, attackerPlayer, attacker.uid))
  );
}

function startBlockDeclaration(attackerId) {
  const game = app.game;
  const defender = getOpponent(game, attackerId);
  game.combat.step = "blockers";

  if (defender.id === "human" && hasBlockOptions(attackerId)) {
    game.combat.awaitingBlockers = "human";
    game.combat.blockPromptAttackUid = getCombatAttackers(attackerId)[0]?.uid || "";
    addLog(game, "escolha bloqueadores para os ataques declarados.", defender.label);
    renderGame();
    return;
  }

  const declaredBlockers = declareAutoBlockers(attackerId);
  renderGame();
  if (defender.id === "bot" && declaredBlockers) {
    window.setTimeout(() => showBotBlockReview(attackerId, () => continueCombatAfterBlocks(attackerId)), 360);
    return;
  }
  window.setTimeout(() => continueCombatAfterBlocks(attackerId), defender.id === "bot" ? 760 : 340);
}

function chooseAutoBlockers(attackerPlayer, defender, attackerInstance, availableBlockers) {
  if (!availableBlockers.length || !canBlockAttack(defender, availableBlockers[0]?.uid, attackerPlayer, attackerInstance.uid)) return [];
  const attackerPower = getCharacterPower(attackerInstance);
  if (attackerPower <= 0) return [];
  const attackerLethal = Math.max(1, getLethalDamageNeeded(attackerInstance));
  const sorted = [...availableBlockers].sort((a, b) => {
    const powerDiff = getCharacterPower(b) - getCharacterPower(a);
    if (powerDiff) return powerDiff;
    return getCharacterResistance(a) - getCharacterResistance(b);
  });
  const chosen = [];
  let blockingPower = 0;
  for (const blocker of sorted) {
    if (!canBlockAttack(defender, blocker.uid, attackerPlayer, attackerInstance.uid)) continue;
    chosen.push(blocker);
    blockingPower += getCharacterPower(blocker);
    if (blockingPower >= attackerLethal) break;
    if (chosen.length >= 3) break;
  }
  return chosen;
}

function declareAutoBlockers(attackerId) {
  const game = app.game;
  const attackerPlayer = getPlayer(game, attackerId);
  const defender = getOpponent(game, attackerId);
  const attackers = attackerPlayer.battlefield.filter((instance) => game.combat.attackers.includes(instance.uid));
  let availableBlockers = defender.battlefield.filter((instance) => canBlockWith(defender, instance.uid));
  const declarations = [];

  attackers.forEach((attackerInstance) => {
    const blockers = chooseAutoBlockers(attackerPlayer, defender, attackerInstance, availableBlockers);
    if (!blockers.length) return;
    game.combat.blockers[attackerInstance.uid] = blockers.map((blocker) => blocker.uid);
    blockers.forEach((blocker) => {
      blocker.exhausted = true;
      availableBlockers = availableBlockers.filter((item) => item.uid !== blocker.uid);
    });
    declarations.push(`${getCardName(app.cardByCode.get(attackerInstance.cardId))} bloqueado por ${blockers.map((blocker) => getCardName(app.cardByCode.get(blocker.cardId))).join(", ")}`);
  });

  if (declarations.length) {
    game.combat.step = "blockers-declared";
    addLog(game, `bloqueios declarados: ${declarations.join("; ")}.`, defender.label);
  }
  return declarations.length;
}

function getAssignedBlockerAttackUid(blockerUid) {
  const blockers = app.game?.combat?.blockers || {};
  return Object.keys(blockers).find((attackerUid) => blockers[attackerUid].includes(blockerUid)) || "";
}

function toggleHumanBlocker(attackerUid, blockerUid) {
  const game = app.game;
  if (!game || game.combat.awaitingBlockers !== "human") return false;
  const attackerPlayer = getPlayer(game, game.combat.attackerId);
  const defender = game.players.human;
  if (!canBlockAttack(defender, blockerUid, attackerPlayer, attackerUid)) return false;

  const currentAttackUid = getAssignedBlockerAttackUid(blockerUid);
  if (currentAttackUid === attackerUid) {
    game.combat.blockers[attackerUid] = (game.combat.blockers[attackerUid] || []).filter((uid) => uid !== blockerUid);
    if (!game.combat.blockers[attackerUid].length) delete game.combat.blockers[attackerUid];
    return true;
  }

  if (currentAttackUid) {
    game.combat.blockers[currentAttackUid] = (game.combat.blockers[currentAttackUid] || []).filter((uid) => uid !== blockerUid);
  }

  const nextBlockers = new Set(game.combat.blockers[attackerUid] || []);
  nextBlockers.add(blockerUid);
  game.combat.blockers[attackerUid] = [...nextBlockers];
  return true;
}

function clearHumanBlockers() {
  if (!app.game) return;
  app.game.combat.blockers = {};
}

function exhaustDeclaredBlockers(defender) {
  const blockerUids = new Set(Object.values(app.game.combat.blockers || {}).flat());
  blockerUids.forEach((uid) => {
    const blocker = findBattlefieldInstance(defender, uid);
    if (blocker) blocker.exhausted = true;
  });
}

function finishHumanBlocks() {
  const game = app.game;
  if (!game || game.combat.awaitingBlockers !== "human") return false;
  exhaustDeclaredBlockers(game.players.human);
  game.combat.awaitingBlockers = "";
  hideBlockPrompt();
  renderGame();
  window.setTimeout(() => continueCombatAfterBlocks(game.combat.attackerId), 520);
  return true;
}

function skipHumanBlocks() {
  clearHumanBlockers();
  return finishHumanBlocks();
}

function finishCombatAfterBlocks(attackerId) {
  const game = app.game;
  if (!game || game.status !== "active") return false;
  if (game.combat.awaitingBlockers || game.combat.resolving) return false;
  if (game.combat.attackerId && game.combat.attackerId !== attackerId) return false;
  game.combat.step = "damage";
  return resolveDeclaredAttacks(attackerId);
}

function continueCombatAfterBlocks(attackerId) {
  const game = app.game;
  if (!game || game.status !== "active") return false;
  if (game.combat.awaitingBlockers || game.combat.resolving) return false;
  if (game.combat.attackerId && game.combat.attackerId !== attackerId) return false;
  requestOrContinueHumanPriority(game, `after-blockers:${game.combat.attackers.join(",")}`, "Prioridade depois da declaracao de bloqueadores.", () => {
    requestOrContinueHumanPriority(game, `before-damage:${game.combat.attackers.join(",")}`, "Prioridade antes do dano de combate.", () => {
      finishCombatAfterBlocks(attackerId);
    });
  });
  return true;
}

function hasDeclaredBlockers(game) {
  return Object.values(game?.combat?.blockers || {}).some((blockerUids) => blockerUids.length);
}

function showBotBlockReview(attackerId, onContinue) {
  const game = app.game;
  if (!game || game.status !== "active" || game.combat.attackerId !== attackerId || !hasDeclaredBlockers(game)) {
    onContinue();
    return;
  }

  const attackerPlayer = getPlayer(game, attackerId);
  const defender = getOpponent(game, attackerId);
  if (defender.id !== "bot") {
    onContinue();
    return;
  }

  let modal = document.getElementById("botBlockReview");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "botBlockReview";
    modal.className = "block-prompt block-review";
    document.body.appendChild(modal);
  }

  game.combat.step = "blockers-declared";
  app.blockReviewResume = () => {
    hideBotBlockReview();
    onContinue();
  };

  const attackers = getCombatAttackers(attackerId);
  const canRespond = hasHumanPriorityPlay(game);
  modal.innerHTML = `
    <div class="block-prompt-panel block-review-panel" role="dialog" aria-modal="true" aria-label="Bloqueios do bot">
      <div class="block-prompt-head">
        <strong>Bloqueios do bot</strong>
        <span>${canRespond
          ? "Confira os bloqueios. Ao continuar, voce recebe prioridade para responder."
          : "Confira os bloqueios antes do dano de combate."}</span>
      </div>
      <div class="block-lanes">
        ${attackers.map((attacker, index) => {
          const target = getAttackTarget(attackerId, attacker.uid);
          const assignedBlockers = (game.combat.blockers[attacker.uid] || [])
            .map((blockerUid) => findBattlefieldInstance(defender, blockerUid))
            .filter(Boolean);
          return `
            <div class="block-lane is-readonly">
              <div class="block-lane-attacker">
                ${renderBlockMiniCard(attackerPlayer, attacker, `A${index + 1}`)}
              </div>
              <div class="block-lane-center">
                <div class="block-lane-slot">
                  ${assignedBlockers.length
                    ? assignedBlockers.map((blocker, blockerIndex) => renderBlockMiniCard(defender, blocker, `B${blockerIndex + 1}`, {
                      assigned: true
                    })).join("")
                    : `<span class="block-lane-empty">Sem bloqueio</span>`}
                </div>
              </div>
              <div class="block-lane-target">
                ${renderBlockTargetCard(target)}
              </div>
            </div>
          `;
        }).join("")}
      </div>
      <div class="block-prompt-actions">
        <button type="button" data-confirm-bot-blocks>${canRespond ? "Responder aos bloqueios" : "Continuar para dano"}</button>
      </div>
    </div>
  `;

  modal.classList.add("is-visible");
  modal.querySelector("[data-confirm-bot-blocks]")?.addEventListener("click", () => {
    const resume = app.blockReviewResume;
    app.blockReviewResume = null;
    resume?.();
  }, { once: true });
}

function hideBotBlockReview() {
  document.getElementById("botBlockReview")?.classList.remove("is-visible");
}

function resolveDeclaredAttacks(playerId) {
  const game = app.game;
  const player = getPlayer(game, playerId);
  const opponent = getOpponent(game, playerId);
  const attackers = player.battlefield.filter((instance) => game.combat.attackers.includes(instance.uid));
  if (!attackers.length) return false;
  if (game.combat.resolving) return false;
  game.combat.resolving = true;

  const damageEvents = [];
  const directCharacterGroups = new Map();
  attackers.forEach((attacker) => {
    const target = getAttackTarget(playerId, attacker.uid);
    const blockerUids = game.combat.blockers[attacker.uid] || [];
    const blockers = blockerUids
      .map((blockerUid) => findBattlefieldInstance(opponent, blockerUid))
      .filter(Boolean);

    if (blockers.length) {
      assignBlockedCombatDamage(damageEvents, player, opponent, attacker, blockers, target);
      return;
    }

    if (target.type === "character") {
      const key = `${target.playerId}:${target.uid}`;
      if (!directCharacterGroups.has(key)) {
        directCharacterGroups.set(key, { target, attackers: [] });
      }
      directCharacterGroups.get(key).attackers.push(attacker);
      return;
    }

    assignUnblockedCombatDamage(damageEvents, player, opponent, attacker, target);
  });

  directCharacterGroups.forEach((group) => {
    assignDirectCharacterGroupDamage(damageEvents, player, opponent, group.target, group.attackers);
  });

  renderGame();
  runCombatDamageSequence(game, playerId, damageEvents, attackers.length);
  return true;
}

function queueTerritoryDamage(events, playerId, amount, reason, meta = {}) {
  if (amount <= 0) return;
  events.push({ type: "territory", playerId, amount, reason, ...meta });
}

function queueCharacterDamage(events, playerId, uid, amount, reason, meta = {}) {
  if (amount <= 0) return;
  events.push({ type: "character", playerId, uid, amount, reason, ...meta });
}

function getCombatBatch(id) {
  return `combat:${id}`;
}

function getDamageSource(playerId, uid) {
  return { playerId, uid };
}

function assignDamageToAttackTarget(events, attackerPlayer, attacker, target, amount, reason, meta = {}) {
  if (target.type === "territory") {
    queueTerritoryDamage(events, target.playerId, amount, reason, {
      ...meta,
      source: getDamageSource(attackerPlayer.id, attacker.uid)
    });
    return;
  }
  const targetPlayer = getPlayer(app.game, target.playerId);
  const targetInstance = findBattlefieldInstance(targetPlayer, target.uid);
  if (targetInstance) {
    queueCharacterDamage(events, target.playerId, target.uid, amount, reason, {
      ...meta,
      source: getDamageSource(attackerPlayer.id, attacker.uid)
    });
  }
}

function assignUnblockedCombatDamage(events, attackerPlayer, defender, attacker, target) {
  const attackerPower = getCharacterPower(attacker);
  const attackerCard = app.cardByCode.get(attacker.cardId);
  const batch = getCombatBatch(attacker.uid);
  if (target.type === "territory") {
    queueTerritoryDamage(events, target.playerId, attackerPower, `${getCardName(attackerCard)} atacou sem bloqueio`, {
      batch,
      source: getDamageSource(attackerPlayer.id, attacker.uid)
    });
    return;
  }

  const targetInstance = findBattlefieldInstance(defender, target.uid);
  if (!targetInstance) return;
  const targetCard = app.cardByCode.get(targetInstance.cardId);
  queueCharacterDamage(events, defender.id, targetInstance.uid, attackerPower, `${getCardName(attackerCard)} atacou diretamente`, {
    batch,
    source: getDamageSource(attackerPlayer.id, attacker.uid)
  });
  queueCharacterDamage(events, attackerPlayer.id, attacker.uid, getCharacterPower(targetInstance), `${getCardName(targetCard)} revidou ataque direto`, {
    batch,
    source: getDamageSource(defender.id, targetInstance.uid)
  });
}

function distributeRetaliationDamage(targetInstance, attackers) {
  let remaining = getCharacterPower(targetInstance);
  if (remaining <= 0) return [];
  const ordered = [...attackers].sort((a, b) => {
    const lethalDiff = getLethalDamageNeeded(a) - getLethalDamageNeeded(b);
    if (lethalDiff) return lethalDiff;
    return getCharacterPower(b) - getCharacterPower(a);
  });
  const assignments = [];
  ordered.forEach((attacker) => {
    if (remaining <= 0) return;
    const lethal = Math.max(1, getLethalDamageNeeded(attacker));
    const amount = Math.min(remaining, lethal);
    assignments.push({ attacker, amount });
    remaining -= amount;
  });
  return assignments;
}

function assignDirectCharacterGroupDamage(events, attackerPlayer, defender, target, attackers) {
  const targetInstance = findBattlefieldInstance(defender, target.uid);
  if (!targetInstance) return;
  const targetCard = app.cardByCode.get(targetInstance.cardId);
  const batch = getCombatBatch(target.uid);

  attackers.forEach((attacker) => {
    const attackerCard = app.cardByCode.get(attacker.cardId);
    queueCharacterDamage(events, defender.id, targetInstance.uid, getCharacterPower(attacker), `${getCardName(attackerCard)} atacou diretamente`, {
      batch,
      source: getDamageSource(attackerPlayer.id, attacker.uid)
    });
  });

  distributeRetaliationDamage(targetInstance, attackers).forEach(({ attacker, amount }) => {
    queueCharacterDamage(events, attackerPlayer.id, attacker.uid, amount, `${getCardName(targetCard)} distribuiu dano de retaliacao`, {
      batch,
      source: getDamageSource(defender.id, targetInstance.uid)
    });
  });
}

function assignBlockedCombatDamage(events, attackerPlayer, defender, attacker, blockers, target) {
  const attackerCard = app.cardByCode.get(attacker.cardId);
  const hasOverrun = cardHasKeyword(attackerCard, "SOBREPUJAR");
  let remainingPower = getCharacterPower(attacker);
  const batch = getCombatBatch(attacker.uid);

  blockers.forEach((blocker) => {
    const blockerCard = app.cardByCode.get(blocker.cardId);
    queueCharacterDamage(events, attackerPlayer.id, attacker.uid, getCharacterPower(blocker), `${getCardName(blockerCard)} bloqueou`, {
      batch,
      source: getDamageSource(defender.id, blocker.uid)
    });
  });

  blockers.forEach((blocker, index) => {
    if (remainingPower <= 0) return;
    const isFirst = index === 0;
    const isLast = index === blockers.length - 1;
    const lethal = getLethalDamageNeeded(blocker);
    const assigned = isFirst || isLast || !hasOverrun ? remainingPower : Math.min(remainingPower, lethal);
    queueCharacterDamage(events, defender.id, blocker.uid, assigned, `${getCardName(attackerCard)} causou dano ao bloqueador`, {
      batch,
      source: getDamageSource(attackerPlayer.id, attacker.uid)
    });
    remainingPower -= assigned;
  });

  if (hasOverrun && remainingPower > 0) {
    assignDamageToAttackTarget(events, attackerPlayer, attacker, target, remainingPower, `${getCardName(attackerCard)} causou dano excedente`, { batch });
  }
}

function applyCombatDamageEvent(game, event) {
  if (event.type === "territory") {
    dealTerritoryDamage(getPlayer(game, event.playerId), event.amount, event.reason, event.source?.playerId || "");
    return;
  }
  dealCharacterDamage(getPlayer(game, event.playerId), event.uid, event.amount, event.reason, event.source?.playerId || "");
}

function applyCombatDamageEvents(game, events) {
  events.forEach((event) => applyCombatDamageEvent(game, event));
  destroyLethalCharacters(game);
}

function clearDamageFlashFlags(game) {
  Object.values(game.players).forEach((player) => {
    player.battlefield.forEach((instance) => {
      instance.damageFlash = false;
    });
  });
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function runCombatDamageSequence(game, attackerId, events, attackerCount) {
  await wait(260);
  const batches = groupDamageEvents(events);
  for (const batch of batches) {
    if (!app.game || app.game !== game || game.status !== "active") return;
    await animateCombatDamageEvents(batch);
    batch.forEach((event) => applyCombatDamageEvent(game, event));
    renderGame();
    await wait(360);
    clearDamageFlashFlags(game);
    renderGame();
    await wait(80);
  }

  const dying = getLethalCharacterRefs(game);
  if (dying.length) {
    dying.forEach(({ instance }) => {
      instance.dying = true;
    });
    renderGame();
    await wait(620);
  }

  destroyLethalCharacters(game);
  clearCombatAfterDamage(game, getPlayer(game, attackerId));
  addLog(game, `dano de combate resolvido com ${attackerCount} atacante${attackerCount === 1 ? "" : "s"}.`, getPlayer(game, attackerId).label);
  playTone("hit");
  checkGameEnd(game);
  renderGame();
}

function groupDamageEvents(events) {
  const makeBatches = (items, prefix) => {
    const batches = [];
    const batchIndexes = new Map();
    items.forEach((event, index) => {
      const key = `${prefix}:${event.batch || `event:${index}`}`;
      if (!batchIndexes.has(key)) {
        batchIndexes.set(key, batches.length);
        batches.push([]);
      }
      batches[batchIndexes.get(key)].push(event);
    });
    return batches;
  };
  const characterEvents = events.filter((event) => event.type !== "territory");
  const territoryEvents = events.filter((event) => event.type === "territory");
  return [
    ...makeBatches(characterEvents, "character"),
    ...makeBatches(territoryEvents, "territory")
  ];
}

function getBattlefieldCardElement(playerId, uid) {
  const attr = playerId === "human" ? "data-battlefield-card" : "data-bot-battlefield-card";
  return document.querySelector(`[${attr}="${escapeAttributeSelector(uid)}"]`);
}

function escapeAttributeSelector(value) {
  return String(value || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function getDamageEventElement(event) {
  if (event.type === "territory") {
    return document.querySelector(`[data-territory-player="${escapeAttributeSelector(event.playerId)}"]`);
  }
  return getBattlefieldCardElement(event.playerId, event.uid);
}

async function animateCombatDamageEvents(events) {
  const bursts = [];
  const shaking = new Set();
  events.forEach((event) => {
    const target = getDamageEventElement(event);
    const source = event.source ? getBattlefieldCardElement(event.source.playerId, event.source.uid) : null;
    [target, source].filter(Boolean).forEach((element) => {
      element.classList.add("is-combat-shaking");
      shaking.add(element);
    });
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const burst = document.createElement("div");
    burst.className = `combat-damage-burst is-${event.type}`;
    burst.textContent = `-${event.amount}`;
    burst.style.left = `${rect.left + rect.width / 2}px`;
    burst.style.top = `${rect.top + rect.height / 2}px`;
    document.body.appendChild(burst);
    bursts.push(burst);
  });
  playTone("hit");
  await wait(events.some((event) => getDamageEventElement(event)) ? 560 : 260);
  bursts.forEach((burst) => burst.remove());
  shaking.forEach((element) => element.classList.remove("is-combat-shaking"));
}

function dealCharacterDamage(player, uid, amount, reason, sourcePlayerId = "") {
  const instance = findBattlefieldInstance(player, uid);
  if (!instance || amount <= 0) return;
  const card = app.cardByCode.get(instance.cardId);
  if (cardHasKeyword(card, "INDESTRUTIVEL")) {
    addLog(app.game, `${getCardName(card)} preveniu ${amount} de dano por INDESTRUTIVEL.`);
    return;
  }
  instance.damage = Math.max(0, toNumber(instance.damage, 0) + amount);
  instance.damageFlash = true;
  addPlayerStat(app.game, "damageTaken", player.id, amount);
  if (sourcePlayerId) {
    addPlayerStat(app.game, "damageDealt", sourcePlayerId, amount);
    addPlayerStat(app.game, "characterDamageDealt", sourcePlayerId, amount);
  }
  addLog(app.game, `${getCardName(card)} recebeu ${amount} de dano (${reason}).`, player.label);
}

function destroyLethalCharacters(game) {
  Object.values(game.players).forEach((player) => {
    const survivors = [];
    player.battlefield.forEach((instance) => {
      const card = app.cardByCode.get(instance.cardId);
      if (getCardTypeCode(card) !== "PER") {
        survivors.push(instance);
        return;
      }
      const resistance = getCharacterResistance(instance);
      const lethalByDamage = toNumber(instance.damage, 0) >= resistance && resistance > 0;
      const zeroResistance = resistance <= 0;
      if (lethalByDamage && cardHasKeyword(card, "INDESTRUTIVEL")) {
        survivors.push(instance);
        return;
      }
      if (lethalByDamage || zeroResistance) {
        player.cemetery.push(instance.cardId);
        addLog(game, `${getCardName(card)} foi destruido por dano.`, player.label);
        return;
      }
      survivors.push(instance);
    });
    player.battlefield = survivors;
  });
}

function getLethalCharacterRefs(game) {
  const refs = [];
  Object.values(game.players).forEach((player) => {
    player.battlefield.forEach((instance) => {
      const card = app.cardByCode.get(instance.cardId);
      if (getCardTypeCode(card) !== "PER") return;
      const resistance = getCharacterResistance(instance);
      const lethalByDamage = toNumber(instance.damage, 0) >= resistance && resistance > 0;
      const zeroResistance = resistance <= 0;
      if (lethalByDamage && cardHasKeyword(card, "INDESTRUTIVEL")) return;
      if (lethalByDamage || zeroResistance) refs.push({ player, instance });
    });
  });
  return refs;
}

function clearCombatAfterDamage(game, attackerPlayer) {
  attackerPlayer.battlefield.forEach((instance) => {
    instance.declaredAttacker = false;
  });
  game.combat = {
    ...createCombatState(),
    selectedAttackers: []
  };
}

function dealTerritoryDamage(player, amount, reason, sourcePlayerId = "") {
  player.territoryDamage = Math.max(0, player.territoryDamage + Math.max(0, amount));
  addPlayerStat(app.game, "damageTaken", player.id, amount);
  if (sourcePlayerId) {
    addPlayerStat(app.game, "damageDealt", sourcePlayerId, amount);
    addPlayerStat(app.game, "territoryDamageDealt", sourcePlayerId, amount);
    addPlayerStat(app.game, sourcePlayerId === player.id ? "ownTerritoryDamageDealt" : "enemyTerritoryDamageDealt", sourcePlayerId, amount);
  }
  addLog(app.game, `Territorio de ${player.label} recebeu ${amount} de dano (${reason}).`);
}

function applyNextPhase() {
  const game = app.game;
  if (!canAct("human")) return false;
  if (game.combat.awaitingBlockers || game.combat.resolving || game.combat.attackers.length) return false;
  const phase = currentPhase(game);
  const doAdvance = () => {
    clearHumanAutoPass();
    advancePhase(game);
  };
  requestOrContinueHumanPriority(game, `before-phase:${phase}`, "Prioridade antes da passagem de etapa.", doAdvance);
  return true;
}

function advancePhase(game) {
  if (game.status !== "active") return;
  const previous = currentPhase(game);
  if (previous === "combat" && game.combat.attackers.length) {
    resolveDeclaredAttacks(game.activePlayer);
    if (game.status !== "active") {
      renderGame();
      return;
    }
  } else if (previous === "combat") {
    game.combat = createCombatState();
  }
  game.phaseIndex += 1;
  if (currentPhase(game) === "discard") {
    enterDiscardStepOrEndTurn(game);
    return;
  }
  if (game.phaseIndex >= PHASES.length) {
    enterDiscardStepOrEndTurn(game);
    return;
  }
  const enteredCombat = previous === "preparation" && currentPhase(game) === "combat";
  if (enteredCombat) {
    game.combat.step = "attackers";
    showPhaseAlert("combat", game.activePlayer);
  }
  addLog(game, `avancou de ${PHASE_LABELS[previous]} para ${PHASE_LABELS[currentPhase(game)]}.`, currentPlayer(game).label);
  renderGame();
  if (enteredCombat) {
    requestHumanPriority(game, "combat-start", "Prioridade no inicio do Combate.", () => {
      game.combat.step = "attackers";
      renderGame();
    });
  }
}

function applyEndTurn() {
  if (!canAct("human")) return false;
  clearHumanAutoPass();
  enterDiscardStepOrEndTurn(app.game);
  return true;
}

function enterDiscardStepOrEndTurn(game) {
  if (!game || game.status !== "active") return false;
  const player = currentPlayer(game);
  if (getHandOverflow(player) <= 0) {
    endTurn(game);
    return true;
  }
  const alreadyDiscarding = currentPhase(game) === "discard";
  setGamePhase(game, "discard", player.id);
  app.selected = null;
  clearHumanAutoPass();
  if (!alreadyDiscarding) {
    addLog(game, `precisa descartar ${getHandOverflow(player)} carta${getHandOverflow(player) === 1 ? "" : "s"} para ficar com ${MAX_HAND_SIZE} na mao.`, player.label);
  }
  renderGame();
  if (player.isBot) {
    window.setTimeout(() => autoDiscardToHandLimit(game, player.id), 720);
  }
  return true;
}

function endTurn(game) {
  game.activePlayer = getOpponentId(game.activePlayer);
  if (game.activePlayer === "human") game.turnNumber += 1;
  addLog(game, `turno passou para ${currentPlayer(game).label}.`);
  beginTurn(game);
  renderGame();

  if (game.activePlayer === "bot") {
    scheduleBotTurn(game);
  }
}

function scheduleBotTurn(game, delay = null) {
  const effectiveDelay = Number.isFinite(delay) ? delay : game.openingDrawSkipped ? 3400 : 1850;
  setTimeout(() => {
    if (!app.game || app.game !== game || game.status !== "active" || game.activePlayer !== "bot") return;
    runBotTurn();
  }, effectiveDelay);
}

function concede() {
  if (!app.game || app.game.status !== "active") return;
  app.game.status = "finished";
  app.game.winner = "bot";
  addLog(app.game, "concedeu a partida.", "Voce");
  playTone("end");
  renderGame();
  showResult("Derrota", "Voce concedeu a partida.");
}

function checkGameEnd(game) {
  Object.values(game.players).forEach((player) => {
    if (game.status !== "active") return;
    if (player.territoryDamage >= player.maxTerritory) {
      game.status = "finished";
      game.winner = getOpponentId(player.id);
      addLog(game, `${player.label} perdeu o Territorio.`);
    }
  });

  if (game.status === "finished") {
    const winner = getPlayer(game, game.winner);
    playTone(game.winner === "human" ? "win" : "end");
    showResult(game.winner === "human" ? "Vitoria" : "Derrota", `${winner.label} venceu a partida.`);
  }
}

function renderResultPlayerLine(player, isWinner) {
  const champion = app.cardByCode.get(player.identity.champion);
  const territoryRemaining = Math.max(0, player.maxTerritory - player.territoryDamage);
  return `
    <div class="result-player-line ${isWinner ? "is-winner" : ""}">
      <img src="${escapeHtml(getCardArt(champion))}" alt="${escapeHtml(getCardName(champion))}" draggable="false" />
      <div>
        <span>${isWinner ? "Vencedor" : "Jogador"}</span>
        <strong>${escapeHtml(player.label)}</strong>
        <small>${territoryRemaining}/${player.maxTerritory} territorio</small>
      </div>
    </div>
  `;
}

function renderResultMetric(label, humanValue, botValue) {
  return `
    <div class="result-metric">
      <span>${escapeHtml(label)}</span>
      <div class="result-metric-head">
        <small>Voce</small>
        <small>Oponente</small>
      </div>
      <div class="result-metric-values">
        <strong>${escapeHtml(humanValue)}</strong>
        <strong>${escapeHtml(botValue)}</strong>
      </div>
    </div>
  `;
}

function renderResultMatchMetric(label, value, caption = "Partida") {
  return `
    <div class="result-metric result-metric--solo">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(caption)}</small>
    </div>
  `;
}

function showResult(title, text) {
  clearHumanAutoPass();
  const game = app.game;
  if (!game) {
    els.gameResult.innerHTML = `
      <div class="result-panel">
        <span class="section-kicker">Resultado</span>
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(text)}</p>
        <button type="button" data-result-new-game>Nova partida</button>
      </div>
    `;
    els.gameResult.classList.remove("is-hidden");
    return;
  }

  const human = game.players.human;
  const bot = game.players.bot;
  const winner = game.winner ? getPlayer(game, game.winner) : human;
  const winnerChampion = app.cardByCode.get(winner.identity.champion);
  const winnerTerritory = app.cardByCode.get(winner.identity.territory);
  const wallpaper = getCardArt(winnerTerritory);
  const wallpaperStyle = wallpaper ? `style="--result-wallpaper:url(&quot;${escapeHtml(cssUrl(wallpaper))}&quot;)"` : "";
  const stats = game.stats || createMatchStats();

  els.gameResult.innerHTML = `
    <div class="result-panel result-panel--rich ${game.winner === "human" ? "is-victory" : "is-defeat"}" ${wallpaperStyle}>
      <div class="result-hero">
        <img class="result-avatar" src="${escapeHtml(getCardArt(winnerChampion))}" alt="${escapeHtml(getCardName(winnerChampion))}" draggable="false" />
        <div>
          <span class="section-kicker">Resultado</span>
          <strong>${escapeHtml(title)}</strong>
          <p>${escapeHtml(text)}</p>
          <small>${escapeHtml(getCardName(winnerChampion))} - ${escapeHtml(winner.deckName)}</small>
        </div>
      </div>

      <div class="result-scoreboard">
        ${renderResultPlayerLine(human, game.winner === "human")}
        ${renderResultPlayerLine(bot, game.winner === "bot")}
      </div>

      <div class="result-stats">
        ${renderResultMatchMetric("Turnos", game.turnsElapsed || game.turnNumber)}
        ${renderResultMetric("Dano causado", stats.damageDealt.human, stats.damageDealt.bot)}
        ${renderResultMetric("Dano ao territorio inimigo", stats.enemyTerritoryDamageDealt.human, stats.enemyTerritoryDamageDealt.bot)}
        ${renderResultMetric("Dano ao proprio territorio", stats.ownTerritoryDamageDealt.human, stats.ownTerritoryDamageDealt.bot)}
        ${renderResultMetric("Cartas jogadas", stats.cardsPlayed.human, stats.cardsPlayed.bot)}
        ${renderResultMetric("Consagracoes", stats.cardsConsecrated.human, stats.cardsConsecrated.bot)}
        ${renderResultMetric("Cartas Compradas", stats.cardsDrawn.human, stats.cardsDrawn.bot)}
      </div>

      <button type="button" data-result-new-game>Nova partida</button>
    </div>
  `;
  els.gameResult.classList.remove("is-hidden");
}

function showPhaseAlert(phase, playerId) {
  const player = app.game?.players?.[playerId];
  const champion = player ? app.cardByCode.get(player.identity.champion) : null;
  const avatar = champion ? getCardArt(champion) : "";
  const label = PHASE_LABELS[phase] || phase;
  let overlay = document.getElementById("phaseAlert");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "phaseAlert";
    overlay.className = "phase-alert";
    document.body.appendChild(overlay);
  }
  overlay.className = `phase-alert is-visible ${playerId === "human" ? "is-human-phase" : "is-bot-phase"}`;
  overlay.innerHTML = `
    <div class="phase-alert-card">
      ${avatar ? `<img class="phase-alert-avatar" src="${escapeHtml(avatar)}" alt="${escapeHtml(getCardName(champion))}" />` : ""}
      <span>${escapeHtml(player?.label || "Turno")}</span>
      <strong>${escapeHtml(label)}</strong>
    </div>
  `;
  window.clearTimeout(overlay._hideTimer);
  overlay._hideTimer = window.setTimeout(() => {
    overlay.classList.remove("is-visible");
  }, 1300);
}

function showPlayedCardAnimation(card, playerId) {
  showCardActionAnimation(card, playerId, playerId === "human" ? "Voce jogou" : "Bot jogou");
}

function showConsecratedCardAnimation(card, playerId) {
  showCardActionAnimation(card, playerId, playerId === "human" ? "Voce consagrou" : "Bot consagrou");
}

function showCardActionAnimation(card, playerId, label) {
  if (!card) return;
  let overlay = document.getElementById("playedCardAnimation");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "playedCardAnimation";
    overlay.className = "played-card-animation";
    document.body.appendChild(overlay);
  }
  overlay.className = `played-card-animation is-visible ${playerId === "human" ? "is-human-play" : "is-bot-play"}`;
  overlay.innerHTML = `
    <div class="played-card-panel">
      <span>${escapeHtml(label)}</span>
      <img src="${escapeHtml(getCardImage(card))}" alt="${escapeHtml(getCardName(card))}" draggable="false" />
      <strong>${escapeHtml(getCardName(card))}</strong>
      <small>${escapeHtml(getCardTypeLabel(card))} - custo ${getCost(card)}</small>
    </div>
  `;
  window.clearTimeout(overlay._hideTimer);
  overlay._hideTimer = window.setTimeout(() => {
    overlay.classList.remove("is-visible");
  }, 1520);
}

function showDrawAnimation(cardIds, playerId, onComplete = () => {}) {
  if (!cardIds.length) return;
  const visibleCards = cardIds.map((cardId) => app.cardByCode.get(cardId)).filter(Boolean);
  const isBotDraw = playerId !== "human";
  const requiresConfirm = !isBotDraw;
  let overlay = document.getElementById("drawAnimation");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "drawAnimation";
    overlay.className = "draw-animation";
    document.body.appendChild(overlay);
  }
  overlay.className = `draw-animation is-visible ${playerId === "human" ? "is-human-draw" : "is-bot-draw"} ${requiresConfirm ? "requires-confirm" : ""}`;
  overlay.innerHTML = `
    <div class="draw-animation-inner">
      <div class="draw-animation-cards">
        ${isBotDraw
          ? cardIds.map((_, index) => `
            <img class="is-card-back" style="--draw-index:${index}" src="${escapeHtml(CARD_BACK_IMAGE)}" alt="Carta comprada pelo bot" draggable="false" />
          `).join("")
          : visibleCards.map((card, index) => `
            <img style="--draw-index:${index}" src="${escapeHtml(getCardImage(card))}" alt="${escapeHtml(getCardName(card))}" draggable="false" />
          `).join("")}
      </div>
      ${requiresConfirm ? `<button type="button" class="draw-confirm-button" data-draw-confirm>Continuar</button>` : ""}
    </div>
  `;
  const finish = () => {
    overlay.classList.remove("is-visible", "requires-confirm");
    onComplete();
  };
  window.clearTimeout(overlay._hideTimer);
  if (requiresConfirm) {
    overlay.querySelector("[data-draw-confirm]")?.addEventListener("click", finish, { once: true });
  } else {
    overlay._hideTimer = window.setTimeout(finish, 1250);
  }
}

function runBotTurn() {
  const game = app.game;
  if (!game || game.status !== "active" || game.activePlayer !== "bot") return;
  const bot = game.players.bot;
  const mode = game.botMode || "basic";

  setTimeout(() => {
    if (!app.game || app.game !== game || app.game.status !== "active") return;
    const consecrateId = chooseBotConsecration(bot, mode);
    if (consecrateId) applyConsecrate("bot", consecrateId);
    if (currentPhase(app.game) === "consecration") {
      advanceBotTo("preparation");
    }
    renderGame();
  }, 820);

  setTimeout(() => {
    if (!app.game || app.game !== game || app.game.status !== "active") return;
    if (currentPhase(app.game) !== "preparation") advanceBotTo("preparation");
    playBotCards(bot, mode, 1);
    renderGame();
  }, 1820);

  setTimeout(() => {
    if (!app.game || app.game !== game || app.game.status !== "active") return;
    if (currentPhase(app.game) !== "preparation") return;
    playBotCards(bot, mode, 1);
    renderGame();
  }, 2820);

  setTimeout(() => {
    if (!app.game || app.game !== game || app.game.status !== "active") return;
    if (currentPhase(app.game) !== "preparation") return;
    playBotCards(bot, mode, 1);
    renderGame();
  }, 3820);

  setTimeout(() => {
    if (!app.game || app.game !== game || app.game.status !== "active") return;
    const continueToCombat = () => {
      if (!app.game || app.game !== game || app.game.status !== "active") return;
      advanceBotTo("combat");
      renderGame();
      requestOrContinueHumanPriority(game, "combat-start", "Prioridade no inicio do Combate.", () => {
        if (!app.game || app.game !== game || app.game.status !== "active") return;
        attackWithBot(bot, mode);
        renderGame();
      });
    };
    continueToCombat();
  }, 5000);

  setTimeout(() => {
    if (!app.game || app.game !== game || app.game.status !== "active") return;
    endBotTurnWhenCombatIsReady(game);
  }, 6500);
}

function endBotTurnWhenCombatIsReady(game) {
  if (!app.game || app.game !== game || game.status !== "active" || game.activePlayer !== "bot") return;
  if (isHumanPriorityOpen() || game.combat.awaitingBlockers || game.combat.resolving || game.combat.attackers.length) {
    window.setTimeout(() => endBotTurnWhenCombatIsReady(game), 520);
    return;
  }
  if (requestHumanPriority(game, "before-end", "Voce recebeu prioridade antes do fim do turno do bot.", () => {
    endBotTurnWhenCombatIsReady(game);
  })) return;
  enterDiscardStepOrEndTurn(game);
}

function advanceBotTo(phase) {
  const game = app.game;
  setGamePhase(game, phase, "bot");
  addLog(game, `entrou em ${PHASE_LABELS[phase]}.`, "Bot");
}

function chooseBotConsecration(bot, mode) {
  if (bot.consecrationActionTaken || !bot.hand.length) return "";
  const sorted = [...bot.hand].sort((a, b) => {
    const cardA = app.cardByCode.get(a);
    const cardB = app.cardByCode.get(b);
    if (mode === "aggressive") return getCost(cardB) - getCost(cardA);
    return getCost(cardA) - getCost(cardB);
  });
  return sorted[0] || "";
}

function playBotCards(bot, mode, maxCards = Infinity) {
  let played = true;
  let playedCount = 0;
  while (played && playedCount < maxCards) {
    played = false;
    const candidates = [...bot.hand].sort((a, b) => {
      const cardA = app.cardByCode.get(a);
      const cardB = app.cardByCode.get(b);
      const typeBoostA = getCardTypeCode(cardA) === "PER" ? -0.5 : 0;
      const typeBoostB = getCardTypeCode(cardB) === "PER" ? -0.5 : 0;
      return (getCost(cardA) + typeBoostA) - (getCost(cardB) + typeBoostB);
    });

    const next = candidates.find((cardId) => canPlayCard(bot, cardId) && canBotSurviveSinCost(bot, cardId));
    if (next) {
      applyPlayCard("bot", next);
      playedCount += 1;
      played = mode === "test" ? false : getAvailableEssence(bot) > 0;
    }
  }
  return playedCount;
}

function attackWithBot(bot) {
  const botHasTrick = hasPlayableMiracle(bot);
  const attackers = bot.battlefield.filter((instance) => (
    canAttackWith(bot, instance.uid) && (getCharacterPower(instance) > 0 || botHasTrick)
  ));
  attackers.forEach((instance) => {
    selectAttackTarget("bot", instance.uid, chooseBotAttackTarget(instance));
  });
  if (attackers.length && app.game?.status === "active") {
    applyAttack("bot");
  }
}

function chooseBotAttackTarget(attacker) {
  const human = app.game.players.human;
  const attackerPower = getCharacterPower(attacker);
  const vulnerableCharacters = human.battlefield
    .filter((instance) => {
      const card = app.cardByCode.get(instance.cardId);
      return instance.exhausted && getCardTypeCode(card) === "PER";
    })
    .sort((a, b) => {
      const killableA = getLethalDamageNeeded(a) <= attackerPower ? -1 : 0;
      const killableB = getLethalDamageNeeded(b) <= attackerPower ? -1 : 0;
      if (killableA !== killableB) return killableA - killableB;
      return getLethalDamageNeeded(a) - getLethalDamageNeeded(b);
    });
  if (vulnerableCharacters.length && Math.random() < 0.55) {
    return getCharacterAttackTarget("human", vulnerableCharacters[0].uid);
  }
  return getTerritoryAttackTarget("human");
}

function selectHandCard(cardId) {
  if (currentPhase(app.game) === "discard" && canDiscardForHandLimit(app.game.players.human, cardId)) {
    app.selected = null;
    showInteractionHint("Arraste uma carta da mao para o seu Cemiterio.");
    renderGame();
    return;
  }
  app.selected = { zone: "hand", id: cardId };
  renderGame();
}

function selectBattlefieldCard(uid) {
  app.selected = { zone: "battlefield", id: uid };
  renderGame();
}

function getSelectedHandCardId() {
  return app.selected?.zone === "hand" ? app.selected.id : "";
}

function getSelectedBattlefieldUid() {
  return app.selected?.zone === "battlefield" ? app.selected.id : "";
}

function setHandExpanded(expanded) {
  app.handExpanded = Boolean(expanded);
  els.handDock?.classList.toggle("is-hand-expanded", app.handExpanded);
  els.handDock?.setAttribute("aria-expanded", String(app.handExpanded));
}

function collapseHand() {
  setHandExpanded(false);
}

function reorderHandCard(cardId, targetCardId = "") {
  const hand = app.game?.players?.human?.hand;
  if (!hand || !cardId || !hand.includes(cardId)) return false;
  const fromIndex = hand.indexOf(cardId);
  const [moved] = hand.splice(fromIndex, 1);
  const targetIndex = targetCardId && hand.includes(targetCardId) ? hand.indexOf(targetCardId) : hand.length;
  hand.splice(targetIndex, 0, moved);
  playTone("soft");
  return true;
}

function renderGame() {
  const game = app.game;
  if (!game) return;
  const human = game.players.human;
  const bot = game.players.bot;
  const selectedHandId = getSelectedHandCardId();
  const selectedBattlefieldUid = getSelectedBattlefieldUid();
  const phase = currentPhase(game);
  const selectedAttackers = new Set(game.combat.selectedAttackers || []);

  els.gameView.classList.toggle("is-consecration-focus", phase === "consecration");
  els.phaseIndicator.textContent = getPhaseDisplayLabel(game);
  els.phasePanel.classList.toggle("is-human-turn", game.activePlayer === "human");
  els.phasePanel.classList.toggle("is-bot-turn", game.activePlayer === "bot");
  els.phasePanel.classList.toggle("is-discard-phase", phase === "discard");
  els.phaseTracker.innerHTML = renderPhaseTracker(game);
  if (els.phaseRoundDock) els.phaseRoundDock.innerHTML = renderPhaseRoundCard(game);
  updateConsecrationHighlights(game, phase);
  updateBattlefieldWallpapers(human, bot);
  setHandExpanded(app.handExpanded);

  els.botArea.innerHTML = renderPlayerArea(bot, true);
  els.humanArea.innerHTML = renderPlayerArea(human, false);
  els.botBattlefield.innerHTML = renderBattlefield(bot, selectedBattlefieldUid);
  els.humanBattlefield.innerHTML = renderBattlefield(human, selectedBattlefieldUid, selectedAttackers);
  els.botEssence.innerHTML = renderEssence(bot, true);
  els.humanEssence.innerHTML = renderEssence(human);
  updatePhaseFocusHighlights(game, phase);
  els.humanHand.style.setProperty("--hand-count", String(human.hand.length));
  els.humanHand.innerHTML = human.hand.map((cardId) => renderCardButton(cardId, {
    selected: selectedHandId === cardId,
    actionable: (canAct("human") || isHumanPriorityOpen()) && (canConsecrate(human, cardId) || canPlayCard(human, cardId) || canDiscardForHandLimit(human, cardId)),
    zone: "hand"
  })).join("");
  els.gameLog.innerHTML = `${renderCombatSummary(game)}${game.log.map((entry) => `
    <div class="log-entry">${entry.actor ? `<strong>${escapeHtml(entry.actor)}:</strong> ` : ""}${escapeHtml(entry.message)}</div>
  `).join("")}`;

  renderStackEdgePanel(game);
  renderSelectedPanel();
  renderActionState();
  renderBlockPrompt(game);
  scheduleHumanAutoPass(game);
}

function updateConsecrationHighlights(game, phase) {
  const humanActive = game.activePlayer === "human" && phase === "consecration";
  const botActive = game.activePlayer === "bot" && phase === "consecration";
  const humanPanel = els.humanEssence?.closest(".essence-panel");
  const botPanel = els.botEssence?.closest(".essence-panel");
  humanPanel?.classList.toggle("is-consecration-active", humanActive);
  botPanel?.classList.toggle("is-consecration-active", botActive);
  humanPanel?.closest(".player-dock-shell")?.classList.toggle("is-consecration-active", humanActive);
  botPanel?.closest(".player-dock-shell")?.classList.toggle("is-consecration-active", botActive);
}

function updatePhaseFocusHighlights(game, phase) {
  const territoryPhases = ["preparation", "combat", "regroup"];
  const humanFocus = game.activePlayer === "human" && territoryPhases.includes(phase);
  const botFocus = game.activePlayer === "bot" && territoryPhases.includes(phase);
  const combatFocus = phase === "combat";
  els.humanBattlefield?.classList.toggle("is-territory-phase-active", combatFocus || humanFocus);
  els.botBattlefield?.classList.toggle("is-territory-phase-active", combatFocus || botFocus);
  els.humanArea?.querySelector("[data-territory-player='human']")?.classList.toggle("is-phase-focus", humanFocus);
  els.botArea?.querySelector("[data-territory-player='bot']")?.classList.toggle("is-phase-focus", botFocus);
}

function updateBattlefieldWallpapers(human, bot) {
  [
    [els.humanBattlefield, human],
    [els.botBattlefield, bot]
  ].forEach(([zone, player]) => {
    const territory = app.cardByCode.get(player.identity.territory);
    const image = getCardArt(territory);
    if (!zone || !image) return;
    zone.style.setProperty("--territory-bg", `url("${cssUrl(image)}")`);
  });

  [
    [els.humanEssence, human],
    [els.botEssence, bot]
  ].forEach(([zone, player]) => {
    const temple = app.cardByCode.get(player.identity.temple);
    const image = getCardArt(temple);
    const panel = zone?.closest(".essence-panel");
    if (!panel || !image) return;
    panel.style.setProperty("--temple-bg", `url("${cssUrl(image)}")`);
  });
}

function renderStackEdgePanel(game) {
  if (!els.stackEdgePanel) return;
  if (!game.stack.length) {
    els.stackEdgePanel.classList.remove("is-visible");
    els.stackEdgePanel.innerHTML = "";
    return;
  }
  els.stackEdgePanel.classList.add("is-visible");
  els.stackEdgePanel.innerHTML = `
    <span>Pilha</span>
    ${game.stack.map((item) => {
      const card = app.cardByCode.get(item.cardId);
      const owner = item.owner === "human" ? "Voce" : "Bot";
      return `
        <div class="stack-edge-card">
          ${card ? `<img src="${escapeHtml(getCardArt(card))}" alt="${escapeHtml(getCardName(card))}" />` : ""}
          <div>
            <strong>${escapeHtml(item.label)}</strong>
            <small>${escapeHtml(owner)}</small>
          </div>
        </div>
      `;
    }).join("")}
  `;
}

function renderPhaseTracker(game) {
  const ownerLabel = game.activePlayer === "human" ? "Seu turno" : "Turno do bot";
  const helper = getPhaseHelper(game);
  return `
    <span class="phase-current">
      <small>${escapeHtml(ownerLabel)} · Turno ${game.turnNumber}</small>
      <strong>${escapeHtml(getPhaseDisplayLabel(game))}</strong>
      ${helper ? `<em>${escapeHtml(helper)}</em>` : ""}
    </span>
  `;
}

function renderPhaseRoundCard(game) {
  const helper = getPhaseHelper(game);
  const brief = getPhaseBrief(game, helper);
  return `
    <span class="phase-round-card">
      <i aria-hidden="true"></i>
      <span>
        <strong>${escapeHtml(brief.title)}</strong>
        <small>${escapeHtml(brief.text)}</small>
      </span>
      <em>Fase <b>${escapeHtml(brief.progress)}</b></em>
    </span>
  `;
}

function getPhaseBrief(game, helper = "") {
  const phase = currentPhase(game);
  const structuralPhases = PHASES.filter((item) => item !== "discard");
  const phaseIndex = structuralPhases.indexOf(phase);
  const progress = phaseIndex >= 0 ? `${phaseIndex + 1}/${structuralPhases.length}` : `${structuralPhases.length}/${structuralPhases.length}`;
  const defaults = {
    prepare: {
      title: "Etapa estrutural da rodada",
      text: "Prepare suas cartas e Essências antes da compra."
    },
    draw: {
      title: "Etapa estrutural da rodada",
      text: "Compre as cartas previstas para o turno."
    },
    consecration: {
      title: "Etapa estrutural da rodada",
      text: "Consagre forças na Essência ou profane para recuperá-las."
    },
    preparation: {
      title: "Etapa principal da rodada",
      text: "Jogue cartas, equipe personagens e organize seu campo."
    },
    combat: {
      title: "Etapa de combate",
      text: helper || "Declare ataques, bloqueios, respostas e resolva dano."
    },
    regroup: {
      title: "Etapa final da rodada",
      text: "Resolva o fim do turno e verifique o limite de mão."
    },
    discard: {
      title: "Ajuste de mão",
      text: helper || `Descarte até ficar com ${MAX_HAND_SIZE} cartas na mão.`
    }
  };
  return { ...(defaults[phase] || defaults.prepare), progress };
}

function getPhaseHelper(game) {
  const phase = currentPhase(game);
  if (phase !== "discard") {
    const helpers = {
      prepare: "Prepare permanentes e Essências antes da compra.",
      draw: "Compre as cartas do turno.",
      consecration: "Consagre da mão, profane da Essência ou omita a ação.",
      preparation: "Jogue cartas, equipe personagens ou ative habilidades.",
      regroup: "Finalize efeitos do turno e verifique o limite de mão."
    };
    if (phase === "combat") {
      const combatHelpers = {
        attackers: "Selecione atacantes e escolha alvos.",
        "attackers-declared": "Ataques declarados. Aguarde respostas.",
        blockers: "Defina bloqueadores para os ataques.",
        "blockers-declared": "Bloqueios declarados. Aguarde respostas.",
        "priority-before-damage": "Última janela antes do dano.",
        damage: "Dano simultâneo de combate."
      };
      return combatHelpers[game.combat.step] || "Resolva declarações, respostas e dano.";
    }
    return helpers[phase] || "";
  }
  const player = currentPlayer(game);
  const overflow = getHandOverflow(player);
  if (overflow <= 0) return `Limite de mao: ${MAX_HAND_SIZE}`;
  return `Descarte ${overflow} carta${overflow === 1 ? "" : "s"} para ficar com ${MAX_HAND_SIZE} na mao.`;
}

function getPhaseDisplayLabel(game) {
  const phase = currentPhase(game);
  if (phase !== "combat") return PHASE_LABELS[phase] || phase;
  const labels = {
    attackers: "Declaração de atacantes",
    "attackers-declared": "Atacantes declarados",
    blockers: "Declaração de bloqueadores",
    "blockers-declared": "Bloqueadores declarados",
    "priority-combat-start": "Combate",
    "priority-after-attackers": "Atacantes declarados",
    "priority-after-blockers": "Bloqueadores declarados",
    "priority-before-damage": "Antes do dano",
    "priority-before-phase": "Combate",
    damage: "Dano de combate",
    priority: "Combate"
  };
  return labels[game.combat.step] || PHASE_LABELS.combat;
}

function getCombatOrderUids() {
  const combat = app.game?.combat || {};
  if (combat.attackers?.length) return combat.attackers;
  return combat.selectedAttackers || [];
}

function getCombatRoleLabels(playerId, uid, selectedAttackers = new Set()) {
  const game = app.game;
  if (!game) return [];
  const labels = [];
  const attackUids = getCombatOrderUids();
  const selectedOnly = !game.combat.attackers.length;
  const attackerIndex = attackUids.indexOf(uid);
  if (attackerIndex >= 0 && (game.combat.attackers.includes(uid) || selectedAttackers.has(uid))) {
    labels.push(`${selectedOnly ? "A?" : "A"}${attackerIndex + 1}`);
  }

  attackUids.forEach((attackerUid, index) => {
    const target = game.combat.attackTargets[attackerUid];
    if (target?.type === "character" && target.playerId === playerId && target.uid === uid) {
      labels.push(`T${index + 1}`);
    }
    if ((game.combat.blockers[attackerUid] || []).includes(uid)) {
      labels.push(`B${index + 1}`);
    }
  });

  return labels;
}

function getCombatSlotForCard(playerId, uid) {
  const game = app.game;
  if (!game) return 0;
  const attackUids = getCombatOrderUids();
  const ownAttackIndex = attackUids.indexOf(uid);
  if (ownAttackIndex >= 0) return ownAttackIndex + 1;

  for (let index = 0; index < attackUids.length; index += 1) {
    const attackerUid = attackUids[index];
    const target = game.combat.attackTargets[attackerUid];
    if (target?.type === "character" && target.playerId === playerId && target.uid === uid) return index + 1;
    if ((game.combat.blockers[attackerUid] || []).includes(uid)) return index + 1;
  }
  return 0;
}

function getTerritoryCombatLabels(playerId) {
  const game = app.game;
  if (!game) return [];
  return getCombatOrderUids()
    .map((attackerUid, index) => game.combat.attackTargets[attackerUid]?.type === "territory" &&
      game.combat.attackTargets[attackerUid].playerId === playerId ? `T${index + 1}` : "")
    .filter(Boolean);
}

function getCombatBlockerNames(attackerUid) {
  const game = app.game;
  const defender = getOpponent(game, game.combat.attackerId || game.activePlayer);
  return (game.combat.blockers[attackerUid] || [])
    .map((blockerUid) => findBattlefieldInstance(defender, blockerUid))
    .filter(Boolean)
    .map((blocker) => getCardName(app.cardByCode.get(blocker.cardId)));
}

function renderCombatSummary(game) {
  const attackUids = getCombatOrderUids();
  if (!attackUids.length) return "";
  const attackerId = game.combat.attackerId || game.activePlayer;
  const attackerPlayer = getPlayer(game, attackerId);
  const lines = attackUids.map((uid, index) => {
    const attacker = findBattlefieldInstance(attackerPlayer, uid);
    if (!attacker) return "";
    const target = getAttackTarget(attackerId, uid);
    const blockers = getCombatBlockerNames(uid);
    return `
      <span>
        <strong>A${index + 1}</strong>
        ${escapeHtml(getCardName(app.cardByCode.get(attacker.cardId)))} -> ${escapeHtml(formatAttackTarget(target))}
        ${blockers.length ? `<em>B${index + 1}: ${escapeHtml(blockers.join(", "))}</em>` : ""}
      </span>
    `;
  }).join("");
  return `<div class="combat-summary">${lines}</div>`;
}

function renderDockMetricIcon(icon) {
  const icons = {
    hand: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4h9.5a2 2 0 0 1 2 2v12.5"/><path d="M4.5 7.5h10a2 2 0 0 1 2 2v10h-10a2 2 0 0 1-2-2z"/></svg>`,
    deck: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h11v14H7z"/><path d="M4 8h11v11"/><path d="M10 2h8v3"/></svg>`,
    virtues: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.2 5.5L20 11l-5.8 2.5L12 21l-2.2-7.5L4 11l5.8-2.5z"/></svg>`,
    cemetery: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 17v3h8v-3"/><path d="M6 11a6 6 0 1 1 12 0c0 3-2 5-6 5s-6-2-6-5z"/><path d="M9 11h.1M15 11h.1"/><path d="m11 14 1-1 1 1"/></svg>`,
    reserve: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 21 12 12 21 3 12z"/><path d="M12 7 17 12 12 17 7 12z"/></svg>`
  };
  return icons[icon] || "";
}

function renderDockMetric({ label, value, icon = "", button = false, attrs = "", extraClass = "", subtitle = "" }) {
  const tag = button ? "button" : "div";
  return `
    <${tag} class="dock-metric ${extraClass}" ${button ? "type=\"button\"" : ""} ${attrs}>
      ${icon ? `<i class="dock-metric-icon">${renderDockMetricIcon(icon)}</i>` : ""}
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      ${subtitle ? `<small>${escapeHtml(subtitle)}</small>` : ""}
    </${tag}>
  `;
}

function renderIdentityTile(player, card, kind, attrs = "") {
  if (!card) return "";
  const isTerritory = kind === "territory";
  const isChampion = kind === "champion";
  const isTemple = kind === "temple";
  const remaining = isTerritory ? Math.max(0, player.maxTerritory - player.territoryDamage) : 0;
  const currentValue = isTerritory ? remaining : isTemple ? getAvailableEssence(player) : "";
  const totalValue = isTerritory ? player.maxTerritory : isTemple ? player.essence.length : "";
  const labels = isTerritory ? getTerritoryCombatLabels(player.id) : [];
  const attackTargetClass = isTerritory && isHumanAttackTargetAvailable(getTerritoryAttackTarget(player.id)) ? " is-click-attack-target" : "";
  const damagedClass = isTerritory && labels.length ? " is-attack-target" : "";
  const image = getCardArt(card);
  const label = kind === "champion" ? "Campeao" : kind === "territory" ? "Territorio" : "Templo";
  const marker = isTerritory || isTemple
    ? `<strong class="identity-dock-value"><span>${escapeHtml(currentValue)}</span><small>/${escapeHtml(totalValue)}</small></strong>`
    : "";
  return `
    <button class="identity-dock-tile identity-dock-tile--${escapeHtml(kind)}${damagedClass}${attackTargetClass}" type="button" ${attrs}>
      <img class="${isLandscapeCard(card) ? "is-landscape" : ""}" src="${escapeHtml(image)}" alt="${escapeHtml(getCardName(card))}" loading="lazy" draggable="false" />
      <span>${escapeHtml(label)}</span>
      ${marker}
      ${labels.length ? `<em>${escapeHtml(labels.join(" "))}</em>` : ""}
    </button>
  `;
}

function renderTempleDockExpansion(player, temple) {
  const cards = player.essence || [];
  return `
    <div class="identity-dock-expanded">
      <button class="identity-dock-close" type="button" data-close-temple-dock aria-label="Fechar">×</button>
      <div class="identity-dock-essences" aria-label="Cartas consagradas de ${escapeHtml(player.label)}">
        ${cards.length
          ? cards.map((cardId) => {
            const card = app.cardByCode.get(cardId);
            return `
              <button class="identity-dock-essence" type="button" data-zoom-card="${escapeHtml(cardId)}" title="${escapeHtml(getCardName(card))}">
                <img src="${escapeHtml(getCardArt(card))}" alt="${escapeHtml(getCardName(card))}" loading="lazy" draggable="false" />
              </button>
            `;
          }).join("")
          : `<span class="identity-dock-empty">Nenhuma carta consagrada.</span>`}
      </div>
    </div>
  `;
}

function renderPlayerArea(player, hideHand) {
  const territoryRemaining = Math.max(0, player.maxTerritory - player.territoryDamage);
  const dangerClass = territoryRemaining <= 8 ? " is-danger" : "";
  const previousTerritory = app.territorySnapshot.get(player.id);
  const damagedClass = Number.isFinite(previousTerritory) && territoryRemaining < previousTerritory ? " is-territory-hit" : "";
  app.territorySnapshot.set(player.id, territoryRemaining);
  const champion = app.cardByCode.get(player.identity.champion);
  const temple = app.cardByCode.get(player.identity.temple);
  const territory = app.cardByCode.get(player.identity.territory);
  const discardTargetClass = player.id === "human" && app.game?.activePlayer === "human" && currentPhase(app.game) === "discard" && getHandOverflow(player) > 0
    ? " is-discard-drop-target"
    : "";
  const activeVirtues = getActiveVirtues(player);
  const templeExpanded = app.expandedTemplePlayer === player.id;
  const identityMarkup = `
    <div class="player-dock-identity ${templeExpanded ? "is-expanded" : ""}">
      ${templeExpanded
        ? renderTempleDockExpansion(player, temple)
        : `
          ${renderIdentityTile(player, champion, "champion", `data-zoom-card="${escapeHtml(player.identity.champion)}"`)}
          ${renderIdentityTile(player, territory, "territory", `data-territory-player="${escapeHtml(player.id)}" data-zoom-card="${escapeHtml(player.identity.territory)}"`)}
          ${renderIdentityTile(player, temple, "temple", `data-temple-player="${escapeHtml(player.id)}" data-zoom-card="${escapeHtml(player.identity.temple)}"`)}
        `}
    </div>
  `;
  const metricsMarkup = `
    <div class="player-dock-metrics">
      ${renderDockMetric({ label: "Mão", value: player.hand.length, icon: "hand" })}
      ${renderDockMetric({ label: "Deck", value: player.deck.length, icon: "deck" })}
      ${renderDockMetric({
        label: "Virtudes",
        value: activeVirtues.length ? activeVirtues.map((item) => item.value).join("/") : "0",
        icon: "virtues",
        button: true,
        attrs: `data-virtues-player="${escapeHtml(player.id)}"`,
        extraClass: activeVirtues.length ? "is-active" : ""
      })}
      ${renderDockMetric({
        label: "Cemitério",
        value: player.cemetery.length,
        icon: "cemetery",
        button: true,
        attrs: `data-cemetery-player="${escapeHtml(player.id)}"`,
        extraClass: `hud-cemetery${discardTargetClass}`
      })}
      ${renderDockMetric({
        label: "Reserva",
        value: player.reserve?.length || 0,
        icon: "reserve",
        button: player.id === "human",
        attrs: player.id === "human" ? `data-reserve-player="${escapeHtml(player.id)}"` : ""
      })}
    </div>
  `;
  return `
    <div class="player-dock ${hideHand ? "player-dock--opponent" : "player-dock--human"}${dangerClass}${damagedClass}">
      <div class="player-dock-label">
        <span>${hideHand ? "Oponente" : "Você"}</span>
        <strong>${escapeHtml(player.label)}</strong>
      </div>
      ${hideHand ? `${identityMarkup}${metricsMarkup}` : `${metricsMarkup}${identityMarkup}`}
    </div>
  `;
}

function renderBattlefield(player, selectedUid, selectedAttackers = new Set()) {
  if (!player.battlefield.length) return "";
  const frontLine = [];
  const supportLine = [];
  player.battlefield.forEach((instance) => {
    const card = app.cardByCode.get(instance.cardId);
    if (getCardTypeCode(card) === "PER") {
      frontLine.push(instance);
      return;
    }
    supportLine.push(instance);
  });
  const renderLine = (instances, name) => `
    <div class="battlefield-line battlefield-line--${name}">
      ${instances.map((instance) => {
        const combatLabels = getCombatRoleLabels(player.id, instance.uid, selectedAttackers);
        const target = getCharacterAttackTarget(player.id, instance.uid);
        return renderCardButton(instance.cardId, {
          uid: instance.uid,
          exhausted: instance.exhausted,
          declared: instance.declaredAttacker,
          selected: selectedUid === instance.uid,
          attackSelected: selectedAttackers.has(instance.uid) || combatLabels.some((label) => label.startsWith("A")),
          attackTarget: combatLabels.some((label) => label.startsWith("T")),
          blocking: combatLabels.some((label) => label.startsWith("B")),
          attackTargetable: isHumanAttackTargetAvailable(target),
          combatLabels,
          damage: instance.damage || 0,
          damageFlash: instance.damageFlash,
          dying: instance.dying,
          zone: player.id === "human" ? "battlefield" : "bot-battlefield"
        });
      }).join("")}
    </div>
  `;
  const rows = player.id === "human"
    ? [renderLine(frontLine, "front"), renderLine(supportLine, "support")]
    : [renderLine(supportLine, "support"), renderLine(frontLine, "front")];
  return rows.join("");
}

function renderCardButton(cardId, options = {}) {
  const card = app.cardByCode.get(cardId);
  if (!card) return "";
  const isFieldTile = options.zone === "battlefield" || options.zone === "bot-battlefield";
  const isHandTile = options.zone === "hand";
  const image = isFieldTile || isHandTile ? getCardArt(card) : getCardImage(card);
  const typeCode = getCardTypeCode(card);
  const isCharacter = typeCode === "PER";
  const attack = toNumber(card.stats?.attack, 0);
  const resistance = toNumber(card.stats?.resistance, 0);
  const damage = toNumber(options.damage, 0);
  const virtuePips = isHandTile
    ? renderCardVirtuePips(card, 5, { fixedSlots: true })
    : renderCardVirtuePips(card);
  const statusPips = [
    ...(options.combatLabels || []).map((label) => `<span title="Combate">${escapeHtml(label)}</span>`),
    options.declared && !(options.combatLabels || []).some((label) => label.startsWith("A")) ? `<span title="Atacante declarado">A</span>` : ""
  ].filter(Boolean).join("");
  const classes = [
    "play-card",
    isFieldTile ? "is-field-tile" : "",
    isHandTile ? "is-hand-tile" : "",
    isFieldTile ? `is-field-type-${String(typeCode || "CRD").toLowerCase()}` : "",
    isHandTile ? `is-hand-type-${String(typeCode || "CRD").toLowerCase()}` : "",
    isLandscapeCard(card) ? "is-landscape" : "",
    options.selected ? "is-selected" : "",
    options.actionable ? "is-actionable-card" : "",
    options.attackSelected ? "is-attack-selected" : "",
    options.attackTarget ? "is-attack-target" : "",
    options.attackTargetable ? "is-click-attack-target" : "",
    options.blocking ? "is-blocking-card" : "",
    damage > 0 ? "is-damaged" : "",
    options.damageFlash ? "is-damage-flash" : "",
    options.dying ? "is-dying-card" : "",
    options.exhausted ? "is-exhausted" : "",
    options.declared ? "is-declared-attacker" : ""
  ].filter(Boolean).join(" ");
  const data = options.zone === "hand"
    ? `data-hand-card="${escapeHtml(cardId)}"`
    : options.zone === "battlefield"
      ? `data-battlefield-card="${escapeHtml(options.uid)}"`
      : options.zone === "bot-battlefield"
        ? `data-bot-battlefield-card="${escapeHtml(options.uid)}"`
        : "";
  const draggable = options.zone === "hand" || options.zone === "battlefield" ? "draggable=\"true\"" : "";
  const style = "";

  return `
    <button class="${classes}" type="button" ${data} ${draggable} ${style} data-zoom-card="${escapeHtml(cardId)}" title="${escapeHtml(getCardName(card))}">
      <img class="card-main-art" src="${escapeHtml(image)}" alt="${escapeHtml(getCardName(card))}" loading="lazy" draggable="false" />
      ${isHandTile ? `<span class="hand-card-cost">${escapeHtml(getCost(card))}</span>` : ""}
      ${isHandTile && virtuePips ? `<span class="hand-card-pips">${virtuePips}</span>` : ""}
      ${isHandTile ? `<span class="card-type-gem card-type-gem--${String(typeCode || "CRD").toLowerCase()}"></span>` : ""}
      ${isHandTile && isCharacter ? `<span class="hand-card-stats">${attack}/${resistance}</span>` : ""}
      ${isFieldTile && statusPips ? `<span class="field-card-pips">${statusPips}</span>` : ""}
      ${isFieldTile && isCharacter ? `<span class="field-card-stats">${attack}/${resistance}</span>` : ""}
      ${isFieldTile && isCharacter && damage > 0 ? `<span class="field-card-damage">${damage}</span>` : ""}
    </button>
  `;
}

function renderEssence(player, compact = false) {
  if (!player.essence.length) {
    return "";
  }
  return player.essence.map((cardId, index) => {
    const card = app.cardByCode.get(cardId);
    const isSpent = index < player.spentEssence;
    const actionable = player.id === "human" && canProfane(player, index);
    const typeCode = getCardTypeCode(card);
    return `
      <button class="essence-card is-essence-type-${String(typeCode || "CRD").toLowerCase()} ${isSpent ? "is-spent" : ""} ${actionable ? "is-actionable-essence" : ""}" type="button" data-essence-index="${index}" data-zoom-card="${escapeHtml(cardId)}" title="${escapeHtml(getCardName(card))}">
        <img class="card-main-art" src="${escapeHtml(getCardArt(card))}" alt="${escapeHtml(getCardName(card))}" loading="lazy" draggable="false" />
      </button>
    `;
  }).join("");
}

function showCemeteryModal(playerId) {
  const player = app.game?.players?.[playerId];
  if (!player) return;
  let modal = document.getElementById("zoneModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "zoneModal";
    modal.className = "zone-modal";
    document.body.appendChild(modal);
  }
  const cards = [...player.cemetery].reverse();
  modal.innerHTML = `
    <div class="zone-modal-panel" role="dialog" aria-modal="true" aria-label="Cemiterio de ${escapeHtml(player.label)}">
      <div class="zone-modal-head">
        <div>
          <span>Zona de cemiterio</span>
          <strong>${escapeHtml(player.label)} - ${cards.length} carta${cards.length === 1 ? "" : "s"}</strong>
        </div>
        <button type="button" data-close-zone-modal>Fechar</button>
      </div>
      <div class="zone-modal-grid">
        ${cards.length
          ? cards.map((cardId) => {
            const card = app.cardByCode.get(cardId);
            if (!card) return "";
            return `
              <button class="zone-modal-card" type="button" data-zoom-card="${escapeHtml(cardId)}" title="${escapeHtml(getCardName(card))}">
                <img src="${escapeHtml(getCardImage(card))}" alt="${escapeHtml(getCardName(card))}" loading="lazy" draggable="false" />
              </button>
            `;
          }).join("")
          : `<p class="zone-modal-empty">Nenhuma carta no cemiterio.</p>`}
      </div>
    </div>
  `;
  modal.classList.add("is-visible");
}

function showReserveModal(playerId) {
  const player = app.game?.players?.[playerId];
  if (!player) return;
  let modal = document.getElementById("zoneModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "zoneModal";
    modal.className = "zone-modal";
    document.body.appendChild(modal);
  }
  const cards = player.reserve || [];
  const canReveal = player.id === "human";
  modal.innerHTML = `
    <div class="zone-modal-panel zone-modal-panel--reserve" role="dialog" aria-modal="true" aria-label="Reserva de ${escapeHtml(player.label)}">
      <div class="zone-modal-head">
        <div>
          <span>Zona de reserva</span>
          <strong>${escapeHtml(player.label)} - ${cards.length} carta${cards.length === 1 ? "" : "s"}</strong>
        </div>
        <button type="button" data-close-zone-modal>Fechar</button>
      </div>
      <div class="zone-modal-grid">
        ${cards.length
          ? cards.map((cardId) => {
            const card = app.cardByCode.get(cardId);
            return canReveal
              ? `
                <button class="zone-modal-card" type="button" data-zoom-card="${escapeHtml(cardId)}" title="${escapeHtml(getCardName(card))}">
                  <img src="${escapeHtml(getCardImage(card))}" alt="${escapeHtml(getCardName(card))}" loading="lazy" draggable="false" />
                </button>
              `
              : `
                <div class="zone-modal-card is-card-back" title="Carta da Reserva">
                  <img src="${escapeHtml(CARD_BACK_IMAGE)}" alt="Carta oculta da Reserva" loading="lazy" draggable="false" />
                </div>
              `;
          }).join("")
          : `<p class="zone-modal-empty">Nenhuma carta na Reserva.</p>`}
      </div>
    </div>
  `;
  modal.classList.add("is-visible");
}

function showVirtuesModal(playerId) {
  const player = app.game?.players?.[playerId];
  if (!player) return;
  let modal = document.getElementById("zoneModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "zoneModal";
    modal.className = "zone-modal";
    document.body.appendChild(modal);
  }
  const state = player.virtues || {};
  modal.innerHTML = `
    <div class="zone-modal-panel zone-modal-panel--virtues" role="dialog" aria-modal="true" aria-label="Virtudes de ${escapeHtml(player.label)}">
      <div class="zone-modal-head">
        <div>
          <span>Eixos morais</span>
          <strong>${escapeHtml(player.label)}</strong>
        </div>
        <button type="button" data-close-zone-modal>Fechar</button>
      </div>
      <div class="virtue-modal-grid">
        ${app.virtues.map((virtue) => {
          const value = toNumber(state[String(virtue.id)], 0);
          const level = getVirtueLevelData(virtue, value);
          const icon = getVirtueIcon(virtue);
          return `
            <article class="virtue-modal-card ${value > 0 ? "is-active" : ""}">
              <div class="virtue-modal-head">
                ${icon ? `<img src="${escapeHtml(icon)}" alt="${escapeHtml(getVirtueName(virtue))}" loading="lazy" draggable="false" />` : ""}
                <div>
                  <span>${virtue.polarity === "vice" ? "Desvirtude" : "Virtude"}</span>
                  <strong>${escapeHtml(getVirtueName(virtue))}</strong>
                </div>
                <b>${value > 0 ? `Nv${value}` : "0"}</b>
              </div>
              <p>${escapeHtml(value > 0 ? localize(level?.text) : localize(virtue.flavor) || "Nenhum efeito ativo.")}</p>
              ${value > 0 && level ? `<small>${escapeHtml(localize(level.title))}</small>` : `<small>Neutro</small>`}
            </article>
          `;
        }).join("")}
      </div>
    </div>
  `;
  modal.classList.add("is-visible");
}

function hideZoneModal() {
  document.getElementById("zoneModal")?.classList.remove("is-visible");
}

function clearTransientOverlays() {
  app.blockReviewResume = null;
  ["phaseAlert", "playedCardAnimation", "drawAnimation", "interactionHint", "cardZoomPreview", "zoneModal", "blockPrompt", "botBlockReview"].forEach((id) => {
    document.getElementById(id)?.classList.remove("is-visible");
  });
  document.querySelectorAll(".combat-damage-burst").forEach((node) => node.remove());
  cleanupPointerDrag();
}

function showInteractionHint(message) {
  let hint = document.getElementById("interactionHint");
  if (!hint) {
    hint = document.createElement("div");
    hint.id = "interactionHint";
    hint.className = "interaction-hint";
    document.body.appendChild(hint);
  }
  hint.textContent = message;
  hint.classList.add("is-visible");
  window.clearTimeout(hint._hideTimer);
  hint._hideTimer = window.setTimeout(() => {
    hint.classList.remove("is-visible");
  }, 1500);
}

function renderSelectedPanel() {
  const handId = getSelectedHandCardId();
  const battlefieldUid = getSelectedBattlefieldUid();
  let card = handId ? app.cardByCode.get(handId) : null;
  let detail = "";
  const human = app.game.players.human;
  const discardOverflow = currentPhase(app.game) === "discard" ? getHandOverflow(human) : 0;

  if (discardOverflow > 0 && canAct("human")) {
    els.selectedCardPanel.innerHTML = "";
    return;
  }

  if (battlefieldUid) {
    const instance = app.game.players.human.battlefield.find((item) => item.uid === battlefieldUid);
    card = instance ? app.cardByCode.get(instance.cardId) : null;
    const state = instance?.exhausted ? "Despreparada" : "Preparada";
    detail = instance?.damage ? `${state} - dano ${instance.damage}` : state;
  } else if (card) {
    detail = `${getCardTypeLabel(card)} - custo ${getCost(card)}`;
  }

  if (!card) {
    els.selectedCardPanel.innerHTML = "<span>Carta selecionada</span><strong>Nenhuma</strong>";
    return;
  }

  els.selectedCardPanel.innerHTML = `
    <span>Carta selecionada</span>
    <strong>${escapeHtml(getCardName(card))}</strong>
    <small>${escapeHtml(detail)}</small>
  `;
}

function renderActionState() {
  const human = app.game.players.human;
  const humanTurn = canAct("human");
  const priorityOpen = isHumanPriorityOpen();
  const combatLocked = Boolean(app.game.combat.awaitingBlockers || app.game.combat.resolving || app.game.combat.attackers.length);
  const readyAttackers = human.battlefield.filter((instance) => canAttackWith(human, instance.uid));
  const selectedAttackers = getSelectedAttackers(human);
  const phase = currentPhase(app.game);
  const showAttack = !priorityOpen && humanTurn && phase === "combat" && !combatLocked && !human.combatDeclaredThisTurn;
  const showNextPhase = priorityOpen || (humanTurn && ["consecration", "preparation", "combat"].includes(phase) && !combatLocked);
  const showEndTurn = !priorityOpen && humanTurn && phase === "regroup" && !combatLocked;
  const visibleActionCount = [showAttack, showNextPhase, showEndTurn].filter(Boolean).length;

  els.drawButton.textContent = "Comprar 2";
  els.consecrateButton.textContent = "Consagrar";
  els.playCardButton.textContent = "Jogar";
  els.attackButton.textContent = selectedAttackers.length ? `Atacar ${selectedAttackers.length}` : "Enviar ataque";
  els.nextPhaseButton.textContent = getNextActionLabel(app.game, priorityOpen);
  els.attackButton.dataset.actionSubtitle = selectedAttackers.length ? "Confirmar todos os atacantes" : "Selecione atacantes no campo";
  els.nextPhaseButton.dataset.actionSubtitle = getNextActionSubtitle(app.game, priorityOpen);
  els.endTurnButton.dataset.actionSubtitle = "Passar a vez ao oponente";
  els.drawButton.hidden = true;
  els.consecrateButton.hidden = true;
  els.playCardButton.hidden = true;
  els.attackButton.hidden = !showAttack;
  els.nextPhaseButton.hidden = !showNextPhase;
  els.endTurnButton.hidden = !showEndTurn;
  els.nextPhaseButton.classList.toggle("is-priority-button", priorityOpen);
  els.actionGrid?.style.setProperty("--action-columns", String(Math.max(1, Math.min(2, visibleActionCount))));
  els.drawButton.disabled = !humanTurn || !canDraw(human);
  els.consecrateButton.disabled = !humanTurn || phase !== "consecration";
  els.playCardButton.disabled = !humanTurn || phase !== "preparation";
  els.attackButton.disabled = combatLocked || !humanTurn || phase !== "combat" || !readyAttackers.length || !selectedAttackers.length;
  els.nextPhaseButton.disabled = !showNextPhase;
  els.endTurnButton.disabled = !showEndTurn;
  if (els.concedeButton) els.concedeButton.disabled = !app.game || app.game.status !== "active";
}

function getNextActionSubtitle(game, priorityOpen = false) {
  if (priorityOpen) return "Não fazer nada nesta janela";
  const phase = currentPhase(game);
  const subtitles = {
    prepare: "Continuar para a compra",
    draw: "Continuar para a Consagração",
    consecration: "Omitir a ação estrutural",
    preparation: "Avançar para o Combate",
    combat: game.combat?.step === "attackers-declared" ? "Abrir declaração de bloqueadores" : "Encerrar a etapa de Combate",
    regroup: "Finalizar o turno"
  };
  return subtitles[phase] || "Continuar a partida";
}

function getNextActionLabel(game, priorityOpen = false) {
  if (priorityOpen) return "Passar prioridade";
  const phase = currentPhase(game);
  const nextLabels = {
    prepare: "Ir para compra",
    draw: "Ir para consagracao",
    consecration: "Nao quero consagrar",
    preparation: "Ir para combate",
    combat: game.combat?.step === "attackers-declared" ? "Ir para bloqueadores" : "Nao quero atacar",
    regroup: "Encerrar turno"
  };
  return nextLabels[phase] || "Avancar etapa";
}

function renderBlockMiniCard(player, instance, label, options = {}) {
  const card = app.cardByCode.get(instance?.cardId);
  if (!card) return "";
  const typeCode = getCardTypeCode(card);
  const damage = toNumber(instance.damage, 0);
  const isCharacter = typeCode === "PER";
  const classes = [
    "block-mini-card",
    `is-type-${String(typeCode || "CRD").toLowerCase()}`,
    instance.exhausted ? "is-exhausted" : "",
    options.assigned ? "is-assigned" : "",
    options.selected ? "is-selected" : "",
    options.disabled ? "is-disabled" : ""
  ].filter(Boolean).join(" ");
  const draggable = "";
  const data = options.blocker ? `data-blocker="${escapeHtml(instance.uid)}"` : "";
  return `
    <div class="${classes}" role="button" tabindex="0" ${data} ${draggable} ${options.disabled ? "aria-disabled=\"true\"" : ""} title="${escapeHtml(getCardName(card))}">
      <img src="${escapeHtml(getCardArt(card))}" alt="${escapeHtml(getCardName(card))}" draggable="false" />
      <span class="block-mini-label">${escapeHtml(label)}</span>
      ${isCharacter ? `<strong class="block-mini-stats">${toNumber(card.stats?.attack, 0)}/${toNumber(card.stats?.resistance, 0)}</strong>` : ""}
      ${isCharacter && damage > 0 ? `<em class="block-mini-damage">${damage}</em>` : ""}
    </div>
  `;
}

function renderBlockTargetCard(target, label = "T") {
  const player = getPlayer(app.game, target.playerId);
  if (!player) return "";
  if (target.type === "territory") {
    const territory = app.cardByCode.get(player.identity.territory);
    const remaining = Math.max(0, player.maxTerritory - player.territoryDamage);
    return `
      <div class="block-mini-card is-target is-territory-target" title="Territorio de ${escapeHtml(player.label)}">
        <img src="${escapeHtml(getCardArt(territory))}" alt="Territorio de ${escapeHtml(player.label)}" draggable="false" />
        <span class="block-mini-label">${escapeHtml(label)}</span>
        <strong class="block-mini-stats">${remaining}/${player.maxTerritory}</strong>
      </div>
    `;
  }
  const targetInstance = findBattlefieldInstance(player, target.uid);
  return renderBlockMiniCard(player, targetInstance, label, { assigned: true });
}

function bindBlockPromptDrag(modal) {
  if (modal._blockPromptDragBound) return;
  modal._blockPromptDragBound = true;
  modal.addEventListener("dragover", (event) => {
    const lane = event.target.closest("[data-block-attack]");
    if (!lane || app.dragPayload?.zone !== "blocker") return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    lane.classList.add("is-drop-hover");
  });
  modal.addEventListener("dragleave", (event) => {
    const lane = event.target.closest("[data-block-attack]");
    if (lane && !lane.contains(event.relatedTarget)) lane.classList.remove("is-drop-hover");
  });
  modal.addEventListener("drop", (event) => {
    const lane = event.target.closest("[data-block-attack]");
    if (!lane || app.dragPayload?.zone !== "blocker") return;
    event.preventDefault();
    lane.classList.remove("is-drop-hover");
    if (toggleHumanBlocker(lane.dataset.blockAttack, app.dragPayload.id)) {
      app.dragPayload = null;
      renderGame();
    }
  });
  modal.addEventListener("click", (event) => {
    const blocker = event.target.closest("[data-blocker]");
    if (blocker) {
      event.stopPropagation();
      const assignedAttackUid = getAssignedBlockerAttackUid(blocker.dataset.blocker);
      if (assignedAttackUid) {
        app.game.combat.blockers[assignedAttackUid] = (app.game.combat.blockers[assignedAttackUid] || [])
          .filter((uid) => uid !== blocker.dataset.blocker);
        if (!app.game.combat.blockers[assignedAttackUid].length) delete app.game.combat.blockers[assignedAttackUid];
        app.game.combat.selectedBlockerUid = "";
        renderGame();
        return;
      }
      app.game.combat.selectedBlockerUid = blocker.dataset.blocker;
      renderGame();
      return;
    }
    const lane = event.target.closest("[data-block-attack]");
    const selectedBlockerUid = app.game?.combat?.selectedBlockerUid || "";
    if (!lane || !selectedBlockerUid) return;
    if (toggleHumanBlocker(lane.dataset.blockAttack, selectedBlockerUid)) {
      app.game.combat.selectedBlockerUid = "";
      renderGame();
    }
  });
}

function renderBlockPrompt(game) {
  let modal = document.getElementById("blockPrompt");
  if (game?.combat?.awaitingBlockers !== "human") {
    modal?.classList.remove("is-visible");
    return;
  }

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "blockPrompt";
    modal.className = "block-prompt";
    document.body.appendChild(modal);
  }
  bindBlockPromptDrag(modal);

  const attackerId = game.combat.attackerId;
  const attackerPlayer = getPlayer(game, attackerId);
  const defender = game.players.human;
  const attackers = getCombatAttackers(attackerId);
  const selectedAttackUid = attackers.some((instance) => instance.uid === game.combat.blockPromptAttackUid)
    ? game.combat.blockPromptAttackUid
    : attackers[0]?.uid || "";
  game.combat.blockPromptAttackUid = selectedAttackUid;
  const blockers = defender.battlefield.filter((instance) => canBlockWith(defender, instance.uid));
  const assignedBlockerUids = new Set(Object.values(game.combat.blockers || {}).flat());
  const unassignedBlockers = blockers.filter((blocker) => !assignedBlockerUids.has(blocker.uid));

  modal.innerHTML = `
      <div class="block-prompt-panel" role="dialog" aria-modal="true" aria-label="Declarar bloqueadores">
        <div class="block-prompt-head">
          <strong>Declarar bloqueadores</strong>
          <span>Clique em um Personagem e depois na raia do atacante. Clique em um bloqueador alocado para remove-lo.</span>
        </div>
      <div class="block-lanes">
        ${attackers.map((attacker, index) => {
          const target = getAttackTarget(attackerId, attacker.uid);
          const assignedBlockers = (game.combat.blockers[attacker.uid] || [])
            .map((blockerUid) => findBattlefieldInstance(defender, blockerUid))
            .filter(Boolean);
          return `
            <div class="block-lane" data-block-attack="${escapeHtml(attacker.uid)}">
              <div class="block-lane-attacker">
                ${renderBlockMiniCard(attackerPlayer, attacker, `A${index + 1}`)}
              </div>
              <div class="block-lane-center">
                <div class="block-lane-slot">
                  ${assignedBlockers.length
                    ? assignedBlockers.map((blocker, blockerIndex) => renderBlockMiniCard(defender, blocker, `B${blockerIndex + 1}`, {
                      blocker: true,
                      assigned: true,
                      selected: game.combat.selectedBlockerUid === blocker.uid
                    })).join("")
                    : `<span class="block-lane-empty">Clique aqui apos escolher um bloqueador</span>`}
                </div>
              </div>
              <div class="block-lane-target">
                ${renderBlockTargetCard(target)}
              </div>
            </div>
          `;
        }).join("")}
      </div>
      <div class="blocker-pool" aria-label="Nao bloqueadores">
        <span class="blocker-pool-title">Nao bloqueadores</span>
        ${unassignedBlockers.length
          ? unassignedBlockers.map((blocker) => renderBlockMiniCard(defender, blocker, "", {
            blocker: true,
            selected: game.combat.selectedBlockerUid === blocker.uid
          })).join("")
          : `<p>Nenhum Personagem preparado disponivel.</p>`}
      </div>
      <div class="block-prompt-actions">
        <button type="button" data-skip-blocks>Sem bloqueios</button>
        <button type="button" data-confirm-blocks>Confirmar bloqueios</button>
      </div>
    </div>
  `;

  modal.classList.add("is-visible");
  modal.querySelectorAll("[data-blocker]").forEach((button) => {
    button.addEventListener("dragstart", (event) => {
      if (button.getAttribute("aria-disabled") === "true") {
        event.preventDefault();
        return;
      }
      app.dragPayload = { zone: "blocker", id: button.dataset.blocker };
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", JSON.stringify(app.dragPayload));
    });
  });
  modal.querySelector("[data-confirm-blocks]")?.addEventListener("click", finishHumanBlocks);
  modal.querySelector("[data-skip-blocks]")?.addEventListener("click", skipHumanBlocks);
}

function hideBlockPrompt() {
  document.getElementById("blockPrompt")?.classList.remove("is-visible");
}

function playTone(kind) {
  if (!app.soundEnabled || !window.AudioContext && !window.webkitAudioContext) return;
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!app.audio) app.audio = new AudioContextCtor();
  const ctx = app.audio;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const tones = {
    start: [220, .08],
    draw: [440, .05],
    soft: [330, .05],
    play: [520, .06],
    hit: [150, .08],
    win: [660, .12],
    end: [120, .1]
  };
  const [frequency, duration] = tones[kind] || tones.soft;
  oscillator.frequency.value = frequency;
  oscillator.type = kind === "hit" || kind === "end" ? "sawtooth" : "sine";
  gain.gain.setValueAtTime(.045, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
}

function toggleSound() {
  app.soundEnabled = !app.soundEnabled;
  if (els.soundToggleButton) {
    els.soundToggleButton.textContent = app.soundEnabled ? "Som ligado" : "Som desligado";
    els.soundToggleButton.setAttribute("aria-pressed", String(!app.soundEnabled));
  }
  writePlayStorage({ soundEnabled: app.soundEnabled });
}

async function loadData() {
  els.startGameButton.textContent = "Carregando dados...";
  const [cardsResponse, decksResponse, typesResponse, collectionsResponse, virtuesResponse] = await Promise.all([
    fetch(DATA_URLS.cards),
    fetch(DATA_URLS.decks),
    fetch(DATA_URLS.types),
    fetch(DATA_URLS.collections),
    fetch(DATA_URLS.virtues)
  ]);
  if (!cardsResponse.ok || !decksResponse.ok || !typesResponse.ok || !collectionsResponse.ok || !virtuesResponse.ok) {
    throw new Error("Nao foi possivel carregar os dados do jogo.");
  }

  const [cardsPayload, decksPayload, typesPayload, collectionsPayload, virtuesPayload] = await Promise.all([
    cardsResponse.json(),
    decksResponse.json(),
    typesResponse.json(),
    collectionsResponse.json(),
    virtuesResponse.json()
  ]);

  app.typesById = new Map((typesPayload.types || []).map((type) => [Number(type.id), type]));
  app.collectionsById = new Map((collectionsPayload.collections || []).map((collection) => [Number(collection.id), collection]));
  app.virtues = virtuesPayload.virtues || [];
  app.virtuesById = new Map(app.virtues.map((virtue) => [Number(virtue.id), virtue]));
  app.cards = (cardsPayload.cards || []).map((card, index) => normalizeCard(card, cardsPayload.defaults || {}, index));
  app.cardByCode = new Map(app.cards.map((card) => [card.code, card]));
  app.decks = decksPayload.decks || [];

  const saved = readPlayStorage();
  if (typeof saved.soundEnabled === "boolean") {
    app.soundEnabled = saved.soundEnabled;
    if (els.soundToggleButton) els.soundToggleButton.textContent = app.soundEnabled ? "Som ligado" : "Som desligado";
  }
  populateDeckSelects();
}

function bindEvents() {
  els.humanDeckSelect.addEventListener("change", () => {
    writePlayStorage({ humanDeckId: els.humanDeckSelect.value });
    updateSetupStatus();
  });
  els.botDeckSelect.addEventListener("change", () => {
    writePlayStorage({ botDeckId: els.botDeckSelect.value });
    updateSetupStatus();
  });
  els.botModeSelect.addEventListener("change", () => {
    writePlayStorage({ botMode: els.botModeSelect.value });
    updateSetupStatus();
  });
  els.setupMatchPreview?.addEventListener("click", (event) => {
    const cycleButton = event.target.closest("[data-setup-cycle]");
    if (cycleButton) {
      cycleSetupDeck(cycleButton.dataset.setupCycle, Number(cycleButton.dataset.direction) || 1);
      return;
    }
    const modeButton = event.target.closest("[data-bot-mode]");
    if (modeButton) {
      els.botModeSelect.value = modeButton.dataset.botMode;
      writePlayStorage({ botMode: els.botModeSelect.value });
      updateSetupPreview(getDeckOption(els.humanDeckSelect.value), app.decks.find((deck) => deck.id === els.botDeckSelect.value));
    }
  });
  els.startGameButton.addEventListener("click", startGame);
  els.newGameButton?.addEventListener("click", showSetup);
  els.resetGameButton?.addEventListener("click", restartGame);
  els.resultNewGameButton?.addEventListener("click", showSetup);
  els.gameResult.addEventListener("click", (event) => {
    if (event.target.closest("[data-result-new-game]")) showSetup();
  });
  els.soundToggleButton?.addEventListener("click", toggleSound);

  els.humanHand.addEventListener("click", (event) => {
    setHandExpanded(true);
    const button = event.target.closest("[data-hand-card]");
    if (!button) return;
    selectHandCard(button.dataset.handCard);
  });

  document.addEventListener("pointerdown", (event) => {
    if (event.target.closest("[data-essence-index]")) return;
    if (!els.handDock || els.handDock.contains(event.target)) return;
    collapseHand();
    if (app.selected?.zone === "hand") {
      app.selected = null;
      renderGame();
    }
  });

  document.addEventListener("contextmenu", (event) => {
    if (event.target.closest(".play-card, .essence-card, .identity-dock-tile, .identity-dock-essence, .zone-modal-card, .combat-resolution-chip, .block-prompt, #cardZoomPreview, .played-card-animation, .draw-animation")) {
      event.preventDefault();
    }
  });

  els.humanBattlefield.addEventListener("click", (event) => {
    const button = event.target.closest("[data-battlefield-card]");
    if (!button) return;
    if (canAct("human") && currentPhase(app.game) === "combat" && toggleAttackSelection("human", button.dataset.battlefieldCard)) {
      app.selected = null;
      renderGame();
      return;
    }
    selectBattlefieldCard(button.dataset.battlefieldCard);
  });
  els.botBattlefield.addEventListener("click", (event) => {
    const button = event.target.closest("[data-bot-battlefield-card]");
    if (!button) return;
    if (chooseHumanAttackTarget(getCharacterAttackTarget("bot", button.dataset.botBattlefieldCard))) {
      app.selected = null;
    }
  });
  els.botArea.addEventListener("click", (event) => {
    if (!event.target.closest("[data-territory-player='bot']")) return;
    if (chooseHumanAttackTarget(getTerritoryAttackTarget("bot"))) {
      app.selected = null;
    }
  });

  els.drawButton.addEventListener("click", () => {
    if (applyDraw("human")) renderGame();
  });
  els.consecrateButton.addEventListener("click", () => {
    showInteractionHint("Arraste uma carta da mao para Suas Essencias.");
  });
  els.playCardButton.addEventListener("click", () => {
    showInteractionHint("Arraste uma carta da mao para Seu campo.");
  });
  els.attackButton.addEventListener("click", () => {
    if (applyAttack("human")) {
      app.selected = null;
      renderGame();
    }
  });
  els.nextPhaseButton.addEventListener("click", () => {
    if (isHumanPriorityOpen()) {
      passHumanPriority();
    } else {
      applyNextPhase();
    }
    renderGame();
  });
  els.endTurnButton.addEventListener("click", applyEndTurn);
  els.concedeButton?.addEventListener("click", concede);
  document.addEventListener("click", (event) => {
    const closeButton = event.target.closest("[data-close-zone-modal]");
    if (closeButton || event.target.id === "zoneModal") {
      hideZoneModal();
      return;
    }
    if (event.target.closest("[data-close-temple-dock]")) {
      app.expandedTemplePlayer = "";
      renderGame();
      return;
    }
    const templeButton = event.target.closest("[data-temple-player]");
    if (templeButton) {
      app.expandedTemplePlayer = app.expandedTemplePlayer === templeButton.dataset.templePlayer ? "" : templeButton.dataset.templePlayer;
      renderGame();
      return;
    }
    const virtuesButton = event.target.closest("[data-virtues-player]");
    if (virtuesButton) {
      showVirtuesModal(virtuesButton.dataset.virtuesPlayer);
      return;
    }
    const reserveButton = event.target.closest("[data-reserve-player]");
    if (reserveButton) {
      showReserveModal(reserveButton.dataset.reservePlayer);
      return;
    }
    const cemeteryButton = event.target.closest("[data-cemetery-player]");
    if (!cemeteryButton) return;
    showCemeteryModal(cemeteryButton.dataset.cemeteryPlayer);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") hideZoneModal();
  });
  bindDragAndDrop();
}

function bindDragAndDrop() {
  const humanEssencePanel = els.humanEssence?.closest(".essence-panel");
  document.addEventListener("pointerdown", (event) => {
    const zoomTarget = event.target.closest("[data-zoom-card]");
    if (!zoomTarget) return;
    const cardId = zoomTarget.dataset.zoomCard;
    clearTimeout(app.zoomTimer);
    app.zoomCardId = cardId;
    app.zoomTimer = setTimeout(() => {
      if (app.pointerDrag?.cardId === cardId) app.pointerDrag.longPress = true;
      if (app.zoomCardId === cardId) showCardZoom(cardId);
    }, 360);
  });

  document.addEventListener("pointermove", (event) => {
    if (!app.pointerDrag?.moved) return;
    hideCardZoom();
  });

  ["pointerup", "pointercancel", "scroll"].forEach((eventName) => {
    document.addEventListener(eventName, hideCardZoom, true);
  });
  document.addEventListener("pointercancel", cleanupPointerDrag, true);
  document.addEventListener("scroll", () => {
    if (app.pointerDrag?.payload?.zone === "essence") return;
    cleanupPointerDrag();
  }, true);
  window.addEventListener("blur", cleanupPointerDrag);

  document.addEventListener("dragstart", (event) => {
    const handCard = event.target.closest("[data-hand-card]");
    const battlefieldCard = event.target.closest("[data-battlefield-card]");
    const essenceCard = event.target.closest("[data-essence-index]");
    const blockerCard = event.target.closest("[data-blocker]");
    if (handCard) {
      app.dragPayload = { zone: "hand", id: handCard.dataset.handCard };
    } else if (battlefieldCard) {
      app.dragPayload = { zone: "battlefield", id: battlefieldCard.dataset.battlefieldCard };
    } else if (essenceCard) {
      if (!canProfane(app.game.players.human, Number(essenceCard.dataset.essenceIndex))) {
        event.preventDefault();
        app.dragPayload = null;
        return;
      }
      app.dragPayload = { zone: "essence", index: Number(essenceCard.dataset.essenceIndex), id: essenceCard.dataset.zoomCard };
    } else if (blockerCard) {
      if (blockerCard.getAttribute("aria-disabled") === "true") {
        event.preventDefault();
        app.dragPayload = null;
        return;
      }
      app.dragPayload = { zone: "blocker", id: blockerCard.dataset.blocker };
    } else {
      app.dragPayload = null;
      return;
    }
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", JSON.stringify(app.dragPayload));
    setNativeDragImage(event, getDragPreviewCardId(app.dragPayload));
  });

  document.addEventListener("dragend", () => {
    app.dragPayload = null;
    document.querySelectorAll(".is-drop-hover").forEach((node) => node.classList.remove("is-drop-hover"));
  });

  document.addEventListener("dragover", (event) => {
    const zone = event.target.closest("[data-cemetery-player='human']");
    if (!zone || !canDropHandCardToHumanCemetery(app.dragPayload)) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    zone.classList.add("is-drop-hover");
  });

  document.addEventListener("dragleave", (event) => {
    const zone = event.target.closest("[data-cemetery-player='human']");
    if (zone && !zone.contains(event.relatedTarget)) zone.classList.remove("is-drop-hover");
  });

  document.addEventListener("drop", (event) => {
    const zone = event.target.closest("[data-cemetery-player='human']");
    if (!zone || !canDropHandCardToHumanCemetery(app.dragPayload)) return;
    event.preventDefault();
    event.stopPropagation();
    zone.classList.remove("is-drop-hover");
    handleDrop(zone, app.dragPayload, event.target);
    app.dragPayload = null;
  });

  [els.humanBattlefield, humanEssencePanel, els.botArea, els.botBattlefield, els.humanHand, els.handDock].forEach((zone) => {
    zone?.addEventListener("dragover", (event) => {
      if (!app.dragPayload) return;
      event.preventDefault();
      zone.classList.add("is-drop-hover");
    });
    zone?.addEventListener("dragleave", (event) => {
      if (!zone.contains(event.relatedTarget)) zone.classList.remove("is-drop-hover");
    });
    zone?.addEventListener("drop", (event) => {
      event.preventDefault();
      zone.classList.remove("is-drop-hover");
      handleDrop(zone, app.dragPayload, event.target);
      app.dragPayload = null;
    });
  });

  document.addEventListener("pointerdown", (event) => {
    const blockerCard = event.target.closest("[data-blocker]");
    const essenceCard = event.target.closest("[data-essence-index]");
    if (event.pointerType === "mouse" && !blockerCard && !essenceCard) return;
    const handCard = event.target.closest("[data-hand-card]");
    const battlefieldCard = event.target.closest("[data-battlefield-card]");
    if (blockerCard) return;
    if (blockerCard?.getAttribute("aria-disabled") === "true") return;
    if (!handCard && !battlefieldCard && !blockerCard && !essenceCard) return;
    const cardId = handCard?.dataset.handCard || "";
    const uid = battlefieldCard?.dataset.battlefieldCard || "";
    const essenceIndex = essenceCard ? Number(essenceCard.dataset.essenceIndex) : -1;
    const blockerUid = blockerCard?.dataset.blocker || "";
    const sourceCard = cardId ||
      app.game?.players.human.battlefield.find((item) => item.uid === uid)?.cardId ||
      app.game?.players.human.essence[essenceIndex] ||
      app.game?.players.human.battlefield.find((item) => item.uid === blockerUid)?.cardId ||
      "";
    if (essenceCard && !canProfane(app.game.players.human, essenceIndex)) return;
    if (!sourceCard) return;
    const sourceElement = handCard || essenceCard || battlefieldCard || blockerCard;
    if (essenceCard) event.preventDefault();
    try {
      sourceElement?.setPointerCapture?.(event.pointerId);
    } catch (error) {
      // Some browsers refuse capture when the source was re-rendered mid-event.
    }
    app.pointerDrag = {
      payload: handCard
        ? { zone: "hand", id: cardId }
        : essenceCard
          ? { zone: "essence", index: essenceIndex, id: sourceCard }
          : blockerCard
          ? { zone: "blocker", id: blockerUid }
          : { zone: "battlefield", id: uid },
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      longPress: false,
      ghost: null,
      cardId: sourceCard,
      pointerId: event.pointerId,
      sourceElement
    };
  });

  document.addEventListener("pointermove", (event) => {
    const drag = app.pointerDrag;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    const isEssenceDrag = drag.payload.zone === "essence";
    if (isEssenceDrag) event.preventDefault();
    if (!drag.longPress && !drag.moved && drag.payload.zone === "hand" && Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      releasePointerDragCapture(drag);
      app.pointerDrag = null;
      hideCardZoom();
      return;
    }
    if (!drag.moved && Math.hypot(dx, dy) < (isEssenceDrag ? 4 : 10)) return;
    if (!isEssenceDrag) event.preventDefault();
    drag.moved = true;
    hideCardZoom();
    if (!drag.ghost) {
      drag.ghost = createDragGhost(drag.cardId);
      document.body.appendChild(drag.ghost);
    }
    drag.ghost.style.transform = `translate(${event.clientX - 38}px, ${event.clientY - 52}px)`;
    const zone = getDropZoneFromPoint(event.clientX, event.clientY);
    document.querySelectorAll(".is-drop-hover").forEach((node) => {
      if (node !== zone) node.classList.remove("is-drop-hover");
    });
    zone?.classList.add("is-drop-hover");
  }, { passive: false });

  document.addEventListener("pointerup", (event) => {
    const drag = app.pointerDrag;
    if (!drag) return;
    if (drag.moved) event.preventDefault();
    const dropElement = drag.moved ? document.elementFromPoint(event.clientX, event.clientY) : null;
    const zone = dropElement?.closest(".essence-panel--human, #humanBattlefield, #botArea, #botBattlefield, #humanHand, .hand-dock, [data-cemetery-player='human'], [data-block-attack]") || null;
    if (drag.ghost) drag.ghost.remove();
    document.querySelectorAll(".is-drop-hover").forEach((node) => node.classList.remove("is-drop-hover"));
    if (zone) handleDrop(zone, drag.payload, dropElement);
    releasePointerDragCapture(drag);
    app.pointerDrag = null;
  });
}

function showCardZoom(cardId) {
  const card = app.cardByCode.get(cardId);
  if (!card) return;
  let zoom = document.getElementById("cardZoomPreview");
  if (!zoom) {
    zoom = document.createElement("div");
    zoom.id = "cardZoomPreview";
    zoom.className = "card-zoom-preview";
    document.body.appendChild(zoom);
  }
  zoom.innerHTML = `<img src="${escapeHtml(getCardImage(card))}" alt="${escapeHtml(getCardName(card))}" draggable="false" />`;
  zoom.classList.add("is-visible");
}

function hideCardZoom() {
  clearTimeout(app.zoomTimer);
  app.zoomTimer = null;
  app.zoomCardId = "";
  document.getElementById("cardZoomPreview")?.classList.remove("is-visible");
}

function cleanupPointerDrag() {
  releasePointerDragCapture(app.pointerDrag);
  if (app.pointerDrag?.ghost) app.pointerDrag.ghost.remove();
  app.pointerDrag = null;
  app.dragPayload = null;
  document.querySelectorAll(".is-drop-hover").forEach((node) => node.classList.remove("is-drop-hover"));
}

function releasePointerDragCapture(drag) {
  if (!drag?.sourceElement || typeof drag.pointerId === "undefined") return;
  try {
    if (drag.sourceElement.hasPointerCapture?.(drag.pointerId)) {
      drag.sourceElement.releasePointerCapture(drag.pointerId);
    }
  } catch (error) {
    // Capture can already be gone after pointercancel, blur, or a browser-native interruption.
  }
}

function createDragGhost(cardId) {
  const card = app.cardByCode.get(cardId);
  const ghost = document.createElement("div");
  ghost.className = "drag-ghost";
  ghost.innerHTML = `<img src="${escapeHtml(getCardArt(card))}" alt="" />`;
  return ghost;
}

function getDragPreviewCardId(payload) {
  if (!payload || !app.game) return "";
  if (payload.zone === "hand" || payload.zone === "essence") return payload.id;
  if (payload.zone === "battlefield") {
    return app.game.players.human.battlefield.find((item) => item.uid === payload.id)?.cardId || "";
  }
  if (payload.zone === "blocker") {
    return app.game.players.human.battlefield.find((item) => item.uid === payload.id)?.cardId || "";
  }
  return "";
}

function setNativeDragImage(event, cardId) {
  const card = app.cardByCode.get(cardId);
  if (!card || !event.dataTransfer?.setDragImage) return;
  const ghost = document.createElement("div");
  ghost.className = "native-drag-preview";
  ghost.innerHTML = `<img src="${escapeHtml(getCardArt(card))}" alt="" />`;
  document.body.appendChild(ghost);
  event.dataTransfer.setDragImage(ghost, 38, 52);
  window.setTimeout(() => ghost.remove(), 0);
}

function getDropZoneFromPoint(x, y) {
  const element = document.elementFromPoint(x, y);
  return element?.closest(".essence-panel--human, #humanBattlefield, #botArea, #botBattlefield, #humanHand, .hand-dock, [data-cemetery-player='human'], [data-block-attack]");
}

function isHumanHandDropZone(zone) {
  return zone === els.humanHand || zone === els.handDock || zone?.id === "humanHand" || zone?.classList?.contains("hand-dock");
}

function isHumanCemeteryDropZone(zone) {
  return zone?.matches?.("[data-cemetery-player='human']");
}

function canDropHandCardToHumanCemetery(payload) {
  return payload?.zone === "hand" && canDiscardForHandLimit(app.game?.players?.human, payload.id);
}

function handleDrop(zone, payload, targetElement = null) {
  if (!payload || !app.game || app.game.status !== "active") return;
  if (payload.zone === "blocker" && zone?.matches?.("[data-block-attack]")) {
    if (toggleHumanBlocker(zone.dataset.blockAttack, payload.id)) {
      app.dragPayload = null;
      renderGame();
    }
    return;
  }
  if (payload.zone === "hand" && isHumanCemeteryDropZone(zone)) {
    if (applyDiscardForHandLimit("human", payload.id)) {
      collapseHand();
      renderGame();
    }
    return;
  }
  if (payload.zone === "hand" && isHumanHandDropZone(zone)) {
    const targetCardId = targetElement?.closest?.("[data-hand-card]")?.dataset.handCard || "";
    if (targetCardId !== payload.id && reorderHandCard(payload.id, targetCardId)) {
      app.selected = { zone: "hand", id: payload.id };
      renderGame();
    }
    return;
  }
  if (payload.zone === "essence" && isHumanHandDropZone(zone)) {
    if (applyProfane("human", payload.index)) {
      app.selected = null;
      collapseHand();
      renderGame();
    }
    return;
  }

  const humanCanAct = canAct("human") || isHumanPriorityOpen();
  if (!humanCanAct) return;
  if (app.game.combat.awaitingBlockers || app.game.combat.resolving) return;
  if (!isHumanPriorityOpen() && app.game.combat.attackers.length) return;
  clearHumanAutoPass();
  let changed = false;

  if (!isHumanPriorityOpen() && payload.zone === "hand" && zone?.closest(".essence-panel--human")) {
    changed = applyConsecrate("human", payload.id);
  } else if (payload.zone === "hand" && zone === els.humanBattlefield) {
    changed = applyPlayCard("human", payload.id);
  }

  if (changed) {
    if (payload.zone === "hand") collapseHand();
    app.selected = null;
    renderGame();
  }
}

async function init() {
  bindEvents();
  try {
    await loadData();
  } catch (error) {
    els.startGameButton.textContent = error.message || "Erro ao carregar";
    els.startGameButton.disabled = true;
  }
}

init();
