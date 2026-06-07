const DATA_URLS = {
  cards: "../data/cards.json",
  decks: "../data/decks.json",
  types: "../data/types.json",
  collections: "../data/collections.json"
};

const CARD_BACK_IMAGE = "../assets/logo/Fundo - Foundation.webp";
const BUILDER_STORAGE_KEY = "adonai.deckbuilder.v1";
const PLAY_STORAGE_KEY = "adonai.play.v1";
const BUILDER_DECK_ID = "BUILDER_CURRENT";
const MAIN_DECK_SIZE = 40;
const INITIAL_HAND_SIZE = 6;
const PHASES = ["prepare", "draw", "consecration", "preparation", "combat", "regroup"];
const PHASE_LABELS = {
  prepare: "Preparacao",
  draw: "Compra",
  consecration: "Consagracao",
  preparation: "Alistamento",
  combat: "Combate",
  regroup: "Reagrupamento"
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
  setupStatus: document.getElementById("setupStatus"),
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
  game: null,
  selected: null,
  lastConfig: null,
  soundEnabled: true,
  audio: null,
  dragPayload: null,
  pointerDrag: null,
  zoomTimer: null,
  zoomCardId: "",
  handExpanded: false,
  territorySnapshot: new Map(),
  autoPassTimer: null
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
  if (![...cards, ...identityIds].every((id) => app.cardByCode.has(id))) return "Deck possui cartas desconhecidas.";
  if (!cards.every((id) => isMainDeckCard(app.cardByCode.get(id)))) return "Deck principal possui carta de Identidade.";
  return "";
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

function updateSetupStatus() {
  const humanDeck = getDeckOption(els.humanDeckSelect.value);
  const botDeck = app.decks.find((deck) => deck.id === els.botDeckSelect.value);
  const humanError = validateDeck(humanDeck);
  const botError = validateDeck(botDeck);

  els.setupStatus.classList.remove("is-valid", "is-error");
  if (humanError || botError) {
    els.setupStatus.textContent = humanError || botError;
    els.setupStatus.classList.add("is-error");
    els.startGameButton.disabled = true;
    return;
  }

  els.setupStatus.textContent = `Pronto: ${getDeckName(humanDeck)} contra ${getDeckName(botDeck)}.`;
  els.setupStatus.classList.add("is-valid");
  els.startGameButton.disabled = false;
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
    territoryDamage: 0,
    maxTerritory: getTerritoryLife(deck.identity.territories[0]),
    spentEssence: 0,
    consecratedThisTurn: false,
    drewThisTurn: false
  };
  drawCards(player, INITIAL_HAND_SIZE);
  return player;
}

function getTerritoryLife(cardId) {
  const card = app.cardByCode.get(cardId);
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
  if (changed || force) showPhaseAlert(phase, playerId);
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
    stack: [],
    status: "active",
    winner: "",
    selectedUid: "",
    combat: createCombatState(),
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
  player.spentEssence = 0;
  player.consecratedThisTurn = false;
  player.drewThisTurn = false;
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

function canDraw(player) {
  return currentPhase(app.game) === "draw" && !player.drewThisTurn;
}

function canConsecrate(player, cardId) {
  return currentPhase(app.game) === "consecration" &&
    !player.consecratedThisTurn &&
    player.hand.includes(cardId);
}

function canPlayCard(player, cardId) {
  if (!player.hand.includes(cardId)) return false;
  const card = app.cardByCode.get(cardId);
  const phase = currentPhase(app.game);
  const typeCode = getCardTypeCode(card);

  if (phase === "preparation") {
    if (typeCode === "PEC") return true;
    return getCost(card) <= getAvailableEssence(player);
  }

  if ((phase === "combat" || phase === "regroup") && typeCode === "MIL") {
    return getCost(card) <= getAvailableEssence(player);
  }

  return false;
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

function scheduleHumanAutoPass(game) {
  clearHumanAutoPass();
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
  if (!canAct(playerId) || !canAttackWith(player, uid)) return false;
  if (!setAttackTarget(playerId, uid, target)) return false;
  const selected = new Set(getSelectedAttackers(player));
  selected.add(uid);
  game.combat.selectedAttackers = [...selected];
  playTone("soft");
  return true;
}

function toggleAttackSelection(playerId, uid) {
  const game = app.game;
  const player = getPlayer(game, playerId);
  if (!canAct(playerId) || !canAttackWith(player, uid)) return false;
  const selected = new Set(getSelectedAttackers(player));
  if (selected.has(uid)) {
    selected.delete(uid);
    delete game.combat.attackTargets[uid];
  } else {
    selected.add(uid);
    setAttackTarget(playerId, uid, getTerritoryAttackTarget(getOpponentId(playerId)));
  }
  game.combat.selectedAttackers = [...selected];
  playTone("soft");
  return true;
}

function applyDraw(playerId) {
  const game = app.game;
  const player = getPlayer(game, playerId);
  if (!canDraw(player)) return false;
  const drawn = drawCards(player, 2);
  const missing = 2 - drawn.length;
  player.drewThisTurn = true;
  addLog(game, `comprou ${drawn.length} carta${drawn.length === 1 ? "" : "s"}.`, player.label);
  if (missing > 0) dealTerritoryDamage(player, missing * 2, "compra impossivel");
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
  player.hand = player.hand.filter((id) => id !== cardId);
  player.essence.push(cardId);
  player.consecratedThisTurn = true;
  addLog(game, `consagrou ${getCardName(app.cardByCode.get(cardId))}.`, player.label);
  setGamePhase(game, "preparation", playerId);
  addLog(game, `entrou em ${PHASE_LABELS.preparation}.`, player.label);
  playTone("soft");
  return true;
}

function applyPlayCard(playerId, cardId) {
  const game = app.game;
  const player = getPlayer(game, playerId);
  if (!canPlayCard(player, cardId)) return false;

  const card = app.cardByCode.get(cardId);
  const cost = getCost(card);
  const typeCode = getCardTypeCode(card);
  if (typeCode === "PEC") {
    dealTerritoryDamage(player, cost, `custo de Pecado: ${getCardName(card)}`);
    checkGameEnd(game);
    if (game.status !== "active") return true;
  } else {
    player.spentEssence += cost;
  }
  player.hand = player.hand.filter((id) => id !== cardId);
  game.stack.unshift({ label: getCardName(card), owner: playerId, cardId });
  showPlayedCardAnimation(card, playerId);

  if (typeCode === "PER" || typeCode === "ART") {
    player.battlefield.push(createCardInstance(cardId, playerId));
    addLog(game, `jogou ${getCardName(card)} no campo.`, player.label);
  } else {
    resolveSimpleSpell(playerId, card);
    player.cemetery.push(cardId);
    addLog(game, `resolveu ${getCardName(card)} em modo simplificado.`, player.label);
  }

  setTimeout(() => {
    if (!app.game) return;
    app.game.stack = app.game.stack.filter((item) => item.label !== getCardName(card));
    renderGame();
  }, 1100);

  playTone(typeCode === "PEC" ? "hit" : "play");
  checkGameEnd(game);
  return true;
}

function resolveSimpleSpell(playerId, card) {
  const game = app.game;
  const player = getPlayer(game, playerId);
  const opponent = getOpponent(game, playerId);
  const typeCode = getCardTypeCode(card);

  if (typeCode === "MIL") {
    const drawn = drawCards(player, 1);
    if (drawn.length) addLog(game, "efeito simplificado: comprou 1 carta.", player.label);
    return;
  }

  if (typeCode === "PEC") {
    dealTerritoryDamage(opponent, 2, "Pecado simplificado");
    return;
  }

  addLog(game, "efeito ainda nao implementado; carta tratada como basica.", player.label);
}

function applyAttack(playerId, uid) {
  const game = app.game;
  const player = getPlayer(game, playerId);
  if (game.combat.awaitingBlockers || game.combat.resolving) return false;
  const selected = getSelectedAttackers(player);
  const targets = selected.length
    ? selected
    : uid ? [uid] : player.battlefield.filter((item) => canAttackWith(player, item.uid)).map((item) => item.uid);
  const declared = declareAttackers(playerId, targets);
  if (!declared.length) return false;
  startBlockDeclaration(playerId);
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

  if (defender.id === "human" && hasBlockOptions(attackerId)) {
    game.combat.awaitingBlockers = "human";
    game.combat.blockPromptAttackUid = getCombatAttackers(attackerId)[0]?.uid || "";
    addLog(game, "escolha bloqueadores para os ataques declarados.", defender.label);
    renderGame();
    return;
  }

  declareAutoBlockers(attackerId);
  renderGame();
  window.setTimeout(() => finishCombatAfterBlocks(attackerId), defender.id === "bot" ? 760 : 340);
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
    addLog(game, `bloqueios declarados: ${declarations.join("; ")}.`, defender.label);
  }
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
  if (currentAttackUid) {
    game.combat.blockers[currentAttackUid] = (game.combat.blockers[currentAttackUid] || []).filter((uid) => uid !== blockerUid);
  }

  if (currentAttackUid === attackerUid) {
    return true;
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
  window.setTimeout(() => finishCombatAfterBlocks(game.combat.attackerId), 520);
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
  return resolveDeclaredAttacks(attackerId);
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

    assignUnblockedCombatDamage(damageEvents, player, opponent, attacker, target);
  });

  renderGame();
  runCombatDamageSequence(game, playerId, damageEvents, attackers.length);
  return true;
}

function queueTerritoryDamage(events, playerId, amount, reason) {
  if (amount <= 0) return;
  events.push({ type: "territory", playerId, amount, reason });
}

function queueCharacterDamage(events, playerId, uid, amount, reason) {
  if (amount <= 0) return;
  events.push({ type: "character", playerId, uid, amount, reason });
}

function assignDamageToAttackTarget(events, attacker, target, amount, reason) {
  if (target.type === "territory") {
    queueTerritoryDamage(events, target.playerId, amount, reason);
    return;
  }
  const targetPlayer = getPlayer(app.game, target.playerId);
  const targetInstance = findBattlefieldInstance(targetPlayer, target.uid);
  if (targetInstance) queueCharacterDamage(events, target.playerId, target.uid, amount, reason);
}

function assignUnblockedCombatDamage(events, attackerPlayer, defender, attacker, target) {
  const attackerPower = getCharacterPower(attacker);
  const attackerCard = app.cardByCode.get(attacker.cardId);
  if (target.type === "territory") {
    queueTerritoryDamage(events, target.playerId, attackerPower, `${getCardName(attackerCard)} atacou sem bloqueio`);
    return;
  }

  const targetInstance = findBattlefieldInstance(defender, target.uid);
  if (!targetInstance) return;
  const targetCard = app.cardByCode.get(targetInstance.cardId);
  queueCharacterDamage(events, defender.id, targetInstance.uid, attackerPower, `${getCardName(attackerCard)} atacou diretamente`);
  queueCharacterDamage(events, attackerPlayer.id, attacker.uid, getCharacterPower(targetInstance), `${getCardName(targetCard)} revidou ataque direto`);
}

function assignBlockedCombatDamage(events, attackerPlayer, defender, attacker, blockers, target) {
  const attackerCard = app.cardByCode.get(attacker.cardId);
  const hasOverrun = cardHasKeyword(attackerCard, "SOBREPUJAR");
  let remainingPower = getCharacterPower(attacker);

  blockers.forEach((blocker) => {
    const blockerCard = app.cardByCode.get(blocker.cardId);
    queueCharacterDamage(events, attackerPlayer.id, attacker.uid, getCharacterPower(blocker), `${getCardName(blockerCard)} bloqueou`);
  });

  blockers.forEach((blocker, index) => {
    if (remainingPower <= 0) return;
    const isLast = index === blockers.length - 1;
    const lethal = getLethalDamageNeeded(blocker);
    const assigned = hasOverrun || !isLast ? Math.min(remainingPower, lethal) : remainingPower;
    queueCharacterDamage(events, defender.id, blocker.uid, assigned, `${getCardName(attackerCard)} causou dano ao bloqueador`);
    remainingPower -= assigned;
  });

  if (hasOverrun && remainingPower > 0) {
    assignDamageToAttackTarget(events, attacker, target, remainingPower, `${getCardName(attackerCard)} causou dano excedente`);
  }
}

function applyCombatDamageEvent(game, event) {
  if (event.type === "territory") {
    dealTerritoryDamage(getPlayer(game, event.playerId), event.amount, event.reason);
    return;
  }
  dealCharacterDamage(getPlayer(game, event.playerId), event.uid, event.amount, event.reason);
}

function applyCombatDamageEvents(game, events) {
  events.forEach((event) => applyCombatDamageEvent(game, event));
  destroyLethalCharacters(game);
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function runCombatDamageSequence(game, attackerId, events, attackerCount) {
  await wait(260);
  for (const event of events) {
    if (!app.game || app.game !== game || game.status !== "active") return;
    await animateCombatDamageEvent(event);
    applyCombatDamageEvent(game, event);
    renderGame();
    await wait(130);
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

async function animateCombatDamageEvent(event) {
  const target = getDamageEventElement(event);
  if (!target) {
    await wait(260);
    return;
  }
  const rect = target.getBoundingClientRect();
  const burst = document.createElement("div");
  burst.className = `combat-damage-burst is-${event.type}`;
  burst.textContent = `-${event.amount}`;
  burst.style.left = `${rect.left + rect.width / 2}px`;
  burst.style.top = `${rect.top + rect.height / 2}px`;
  document.body.appendChild(burst);
  playTone("hit");
  await wait(520);
  burst.remove();
}

function dealCharacterDamage(player, uid, amount, reason) {
  const instance = findBattlefieldInstance(player, uid);
  if (!instance || amount <= 0) return;
  const card = app.cardByCode.get(instance.cardId);
  if (cardHasKeyword(card, "INDESTRUTIVEL")) {
    addLog(app.game, `${getCardName(card)} preveniu ${amount} de dano por INDESTRUTIVEL.`);
    return;
  }
  instance.damage = Math.max(0, toNumber(instance.damage, 0) + amount);
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

function dealTerritoryDamage(player, amount, reason) {
  player.territoryDamage = Math.max(0, player.territoryDamage + Math.max(0, amount));
  addLog(app.game, `Territorio de ${player.label} recebeu ${amount} de dano (${reason}).`);
}

function applyNextPhase() {
  const game = app.game;
  if (!canAct("human")) return false;
  if (game.combat.awaitingBlockers || game.combat.resolving || game.combat.attackers.length) return false;
  clearHumanAutoPass();
  advancePhase(game);
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
  if (game.phaseIndex >= PHASES.length) {
    endTurn(game);
    return;
  }
  showPhaseAlert(currentPhase(game), game.activePlayer);
  addLog(game, `avancou de ${PHASE_LABELS[previous]} para ${PHASE_LABELS[currentPhase(game)]}.`, currentPlayer(game).label);
  renderGame();
}

function applyEndTurn() {
  if (!canAct("human")) return false;
  clearHumanAutoPass();
  endTurn(app.game);
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

function showResult(title, text) {
  clearHumanAutoPass();
  els.gameResultTitle.textContent = title;
  els.gameResultText.textContent = text;
  els.gameResult.classList.remove("is-hidden");
}

function showPhaseAlert(phase, playerId) {
  const player = app.game?.players?.[playerId];
  const champion = player ? app.cardByCode.get(player.identity.champion) : null;
  const avatar = champion ? getCardArt(champion) : "";
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
      <strong>${escapeHtml(PHASE_LABELS[phase] || phase)}</strong>
    </div>
  `;
  window.clearTimeout(overlay._hideTimer);
  overlay._hideTimer = window.setTimeout(() => {
    overlay.classList.remove("is-visible");
  }, 1300);
}

function showPlayedCardAnimation(card, playerId) {
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
      <span>${playerId === "human" ? "Voce jogou" : "Bot jogou"}</span>
      <img src="${escapeHtml(getCardImage(card))}" alt="${escapeHtml(getCardName(card))}" />
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
      <span>${playerId === "human" ? "Compra" : "Compra do bot"}</span>
      <div class="draw-animation-cards">
        ${isBotDraw
          ? cardIds.map((_, index) => `
            <img class="is-card-back" style="--draw-index:${index}" src="${escapeHtml(CARD_BACK_IMAGE)}" alt="Carta comprada pelo bot" />
          `).join("")
          : visibleCards.map((card, index) => `
            <img style="--draw-index:${index}" src="${escapeHtml(getCardImage(card))}" alt="${escapeHtml(getCardName(card))}" />
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
    advanceBotTo("combat");
    attackWithBot(bot, mode);
    renderGame();
  }, 5000);

  setTimeout(() => {
    if (!app.game || app.game !== game || app.game.status !== "active") return;
    endBotTurnWhenCombatIsReady(game);
  }, 6500);
}

function endBotTurnWhenCombatIsReady(game) {
  if (!app.game || app.game !== game || game.status !== "active" || game.activePlayer !== "bot") return;
  if (game.combat.awaitingBlockers || game.combat.resolving || game.combat.attackers.length) {
    window.setTimeout(() => endBotTurnWhenCombatIsReady(game), 520);
    return;
  }
  endTurn(game);
}

function advanceBotTo(phase) {
  const game = app.game;
  setGamePhase(game, phase, "bot");
  addLog(game, `entrou em ${PHASE_LABELS[phase]}.`, "Bot");
}

function chooseBotConsecration(bot, mode) {
  if (bot.consecratedThisTurn || !bot.hand.length) return "";
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

    const next = candidates.find((cardId) => canPlayCard(bot, cardId));
    if (next) {
      applyPlayCard("bot", next);
      playedCount += 1;
      played = mode === "test" ? false : getAvailableEssence(bot) > 0;
    }
  }
  return playedCount;
}

function attackWithBot(bot) {
  const attackers = bot.battlefield.filter((instance) => canAttackWith(bot, instance.uid));
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

function renderGame() {
  const game = app.game;
  if (!game) return;
  const human = game.players.human;
  const bot = game.players.bot;
  const selectedHandId = getSelectedHandCardId();
  const selectedBattlefieldUid = getSelectedBattlefieldUid();
  const phase = currentPhase(game);
  const selectedAttackers = new Set(game.combat.selectedAttackers || []);

  els.phaseIndicator.textContent = PHASE_LABELS[phase] || phase;
  els.phasePanel.classList.toggle("is-human-turn", game.activePlayer === "human");
  els.phasePanel.classList.toggle("is-bot-turn", game.activePlayer === "bot");
  els.phaseTracker.innerHTML = renderPhaseTracker(game);
  updateConsecrationHighlights(game, phase);
  updateBattlefieldWallpapers(human, bot);
  setHandExpanded(app.handExpanded);

  els.botArea.innerHTML = renderPlayerArea(bot, true);
  els.humanArea.innerHTML = renderPlayerArea(human, false);
  els.botBattlefield.innerHTML = renderBattlefield(bot, selectedBattlefieldUid);
  els.humanBattlefield.innerHTML = renderBattlefield(human, selectedBattlefieldUid, selectedAttackers);
  els.botEssence.innerHTML = renderEssence(bot, true);
  els.humanEssence.innerHTML = renderEssence(human);
  els.humanHand.style.setProperty("--hand-count", String(human.hand.length));
  els.humanHand.innerHTML = human.hand.map((cardId) => renderCardButton(cardId, {
    selected: selectedHandId === cardId,
    actionable: canAct("human") && (canConsecrate(human, cardId) || canPlayCard(human, cardId)),
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
  els.humanEssence?.closest(".essence-panel")?.classList.toggle("is-consecration-active", humanActive);
  els.botEssence?.closest(".essence-panel")?.classList.toggle("is-consecration-active", botActive);
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
  const activePhase = currentPhase(game);
  const ownerLabel = game.activePlayer === "human" ? "Seu turno" : "Turno do bot";
  return `
    <span class="phase-current">
      <small>${escapeHtml(ownerLabel)} - Turno ${game.turnNumber}</small>
      <strong>${escapeHtml(PHASE_LABELS[activePhase] || activePhase)}</strong>
    </span>
  `;
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

function renderPlayerArea(player, hideHand) {
  const territoryRemaining = Math.max(0, player.maxTerritory - player.territoryDamage);
  const dangerClass = territoryRemaining <= 8 ? " is-danger" : "";
  const previousTerritory = app.territorySnapshot.get(player.id);
  const damagedClass = Number.isFinite(previousTerritory) && territoryRemaining < previousTerritory ? " is-territory-hit" : "";
  app.territorySnapshot.set(player.id, territoryRemaining);
  const champion = app.cardByCode.get(player.identity.champion);
  const temple = app.cardByCode.get(player.identity.temple);
  const territory = app.cardByCode.get(player.identity.territory);
  const secondaryLabel = hideHand ? "Mao" : "Deck";
  const secondaryValue = hideHand ? player.hand.length : player.deck.length;
  const territoryLabels = getTerritoryCombatLabels(player.id);
  return `
    <div class="player-hud ${hideHand ? "player-hud--opponent" : "player-hud--human"}${dangerClass}${damagedClass}">
      <div class="hud-avatar">
        <img src="${escapeHtml(getCardArt(champion))}" alt="${escapeHtml(getCardName(champion))}" loading="lazy" />
      </div>
      <div class="hud-copy">
        <span>${hideHand ? "Oponente" : "Jogador"}</span>
        <strong>${escapeHtml(player.label)}</strong>
        <small>${escapeHtml(player.deckName)}</small>
      </div>
      <div class="hud-identity">
        ${[temple, territory].map((card) => `<img class="${isLandscapeCard(card) ? "is-landscape" : ""}" src="${escapeHtml(getCardImage(card))}" alt="${escapeHtml(getCardName(card))}" loading="lazy" />`).join("")}
      </div>
      <div class="hud-territory ${territoryLabels.length ? "is-attack-target" : ""}" data-territory-player="${escapeHtml(player.id)}">
        <span>Territorio</span>
        <strong>${territoryRemaining}</strong>
        <small>/${player.maxTerritory}</small>
        ${territoryLabels.length ? `<em>${escapeHtml(territoryLabels.join(" "))}</em>` : ""}
      </div>
      <div class="hud-mini-metrics">
        <div class="hud-mini-metric">
          <span>${escapeHtml(secondaryLabel)}</span>
          <strong>${secondaryValue}</strong>
        </div>
        <button class="hud-mini-metric hud-cemetery" type="button" data-cemetery-player="${escapeHtml(player.id)}">
          <span>Cemiterio</span>
          <strong>${player.cemetery.length}</strong>
        </button>
      </div>
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
        return renderCardButton(instance.cardId, {
          uid: instance.uid,
          exhausted: instance.exhausted,
          declared: instance.declaredAttacker,
          selected: selectedUid === instance.uid,
          attackSelected: selectedAttackers.has(instance.uid) || combatLabels.some((label) => label.startsWith("A")),
          attackTarget: combatLabels.some((label) => label.startsWith("T")),
          blocking: combatLabels.some((label) => label.startsWith("B")),
          combatLabels,
          damage: instance.damage || 0,
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
  const image = isFieldTile ? getCardArt(card) : getCardImage(card);
  const typeCode = getCardTypeCode(card);
  const isCharacter = typeCode === "PER";
  const attack = toNumber(card.stats?.attack, 0);
  const resistance = toNumber(card.stats?.resistance, 0);
  const damage = toNumber(options.damage, 0);
  const statusPips = [
    ...(options.combatLabels || []).map((label) => `<span title="Combate">${escapeHtml(label)}</span>`),
    options.declared && !(options.combatLabels || []).some((label) => label.startsWith("A")) ? `<span title="Atacante declarado">A</span>` : ""
  ].filter(Boolean).join("");
  const classes = [
    "play-card",
    isFieldTile ? "is-field-tile" : "",
    isFieldTile ? `is-field-type-${String(typeCode || "CRD").toLowerCase()}` : "",
    isLandscapeCard(card) ? "is-landscape" : "",
    options.selected ? "is-selected" : "",
    options.actionable ? "is-actionable-card" : "",
    options.attackSelected ? "is-attack-selected" : "",
    options.attackTarget ? "is-attack-target" : "",
    options.blocking ? "is-blocking-card" : "",
    damage > 0 ? "is-damaged" : "",
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

  return `
    <button class="${classes}" type="button" ${data} ${draggable} data-zoom-card="${escapeHtml(cardId)}" title="${escapeHtml(getCardName(card))}">
      <img src="${escapeHtml(image)}" alt="${escapeHtml(getCardName(card))}" loading="lazy" />
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
    return `
      <button class="essence-card ${isSpent ? "is-spent" : ""}" type="button" data-zoom-card="${escapeHtml(cardId)}" title="${escapeHtml(getCardName(card))}">
        <img src="${escapeHtml(getCardArt(card))}" alt="${escapeHtml(getCardName(card))}" loading="lazy" />
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
                <img src="${escapeHtml(getCardImage(card))}" alt="${escapeHtml(getCardName(card))}" loading="lazy" />
              </button>
            `;
          }).join("")
          : `<p class="zone-modal-empty">Nenhuma carta no cemiterio.</p>`}
      </div>
    </div>
  `;
  modal.classList.add("is-visible");
}

function hideZoneModal() {
  document.getElementById("zoneModal")?.classList.remove("is-visible");
}

function clearTransientOverlays() {
  ["phaseAlert", "playedCardAnimation", "drawAnimation", "interactionHint", "cardZoomPreview", "zoneModal", "blockPrompt"].forEach((id) => {
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
  const combatLocked = Boolean(app.game.combat.awaitingBlockers || app.game.combat.resolving || app.game.combat.attackers.length);
  const readyAttackers = human.battlefield.filter((instance) => canAttackWith(human, instance.uid));
  const selectedAttackers = getSelectedAttackers(human);
  const phase = currentPhase(app.game);
  const showAttack = humanTurn && phase === "combat" && !combatLocked;
  const showNextPhase = humanTurn && ["consecration", "preparation", "combat"].includes(phase) && !combatLocked;
  const showEndTurn = humanTurn && phase === "regroup" && !combatLocked;
  const visibleActionCount = [showAttack, showNextPhase, showEndTurn].filter(Boolean).length;

  els.drawButton.textContent = "Comprar 2";
  els.consecrateButton.textContent = "Consagrar";
  els.playCardButton.textContent = "Jogar";
  els.attackButton.textContent = selectedAttackers.length ? `Atacar ${selectedAttackers.length}` : "Enviar ataque";
  els.drawButton.hidden = true;
  els.consecrateButton.hidden = true;
  els.playCardButton.hidden = true;
  els.attackButton.hidden = !showAttack;
  els.nextPhaseButton.hidden = !showNextPhase;
  els.endTurnButton.hidden = !showEndTurn;
  els.actionGrid?.style.setProperty("--action-columns", String(Math.max(1, Math.min(2, visibleActionCount))));
  els.drawButton.disabled = !humanTurn || !canDraw(human);
  els.consecrateButton.disabled = !humanTurn || phase !== "consecration";
  els.playCardButton.disabled = !humanTurn || phase !== "preparation";
  els.attackButton.disabled = combatLocked || !humanTurn || phase !== "combat" || !readyAttackers.length || !selectedAttackers.length;
  els.nextPhaseButton.disabled = !showNextPhase;
  els.endTurnButton.disabled = !showEndTurn;
  if (els.concedeButton) els.concedeButton.disabled = !app.game || app.game.status !== "active";
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

  const attackerId = game.combat.attackerId;
  const attackerPlayer = getPlayer(game, attackerId);
  const defender = game.players.human;
  const attackers = getCombatAttackers(attackerId);
  const selectedAttackUid = attackers.some((instance) => instance.uid === game.combat.blockPromptAttackUid)
    ? game.combat.blockPromptAttackUid
    : attackers[0]?.uid || "";
  game.combat.blockPromptAttackUid = selectedAttackUid;
  const selectedAttacker = findBattlefieldInstance(attackerPlayer, selectedAttackUid);
  const blockers = defender.battlefield.filter((instance) => {
    const card = app.cardByCode.get(instance.cardId);
    return getCardTypeCode(card) === "PER";
  });

  modal.innerHTML = `
    <div class="block-prompt-panel" role="dialog" aria-modal="true" aria-label="Declarar bloqueadores">
      <div class="block-prompt-head">
        <strong>Declarar bloqueadores</strong>
        <span>${escapeHtml(formatAttackTarget(getAttackTarget(attackerId, selectedAttackUid)))}</span>
      </div>
      <div class="block-attack-list">
        ${attackers.map((attacker, index) => {
          const card = app.cardByCode.get(attacker.cardId);
          const assigned = getCombatBlockerNames(attacker.uid);
          return `
            <button class="${attacker.uid === selectedAttackUid ? "is-selected" : ""}" type="button" data-block-attack="${escapeHtml(attacker.uid)}">
              <span>A${index + 1}</span>
              <img src="${escapeHtml(getCardArt(card))}" alt="${escapeHtml(getCardName(card))}" />
              <strong>${escapeHtml(getCardName(card))}</strong>
              <small>${escapeHtml(formatAttackTarget(getAttackTarget(attackerId, attacker.uid)))}</small>
              ${assigned.length ? `<em>B: ${escapeHtml(assigned.join(", "))}</em>` : ""}
            </button>
          `;
        }).join("")}
      </div>
      <div class="blocker-list">
        ${blockers.length ? blockers.map((blocker) => {
          const card = app.cardByCode.get(blocker.cardId);
          const assignedAttack = getAssignedBlockerAttackUid(blocker.uid);
          const canBlockSelected = selectedAttacker && canBlockAttack(defender, blocker.uid, attackerPlayer, selectedAttackUid);
          return `
            <button class="${assignedAttack ? "is-assigned" : ""}" type="button" data-blocker="${escapeHtml(blocker.uid)}" ${canBlockSelected ? "" : "disabled"}>
              <img src="${escapeHtml(getCardArt(card))}" alt="${escapeHtml(getCardName(card))}" />
              <span>${escapeHtml(getCardName(card))}</span>
              <strong>${toNumber(card.stats?.attack, 0)}/${toNumber(card.stats?.resistance, 0)}</strong>
              ${assignedAttack ? `<em>B${attackers.findIndex((item) => item.uid === assignedAttack) + 1}</em>` : ""}
            </button>
          `;
        }).join("") : `<p>Nenhum Personagem preparado para bloquear.</p>`}
      </div>
      <div class="block-prompt-actions">
        <button type="button" data-skip-blocks>Sem bloqueios</button>
        <button type="button" data-confirm-blocks>Confirmar bloqueios</button>
      </div>
    </div>
  `;

  modal.classList.add("is-visible");
  modal.querySelectorAll("[data-block-attack]").forEach((button) => {
    button.addEventListener("click", () => {
      game.combat.blockPromptAttackUid = button.dataset.blockAttack;
      renderBlockPrompt(game);
      renderGame();
    });
  });
  modal.querySelectorAll("[data-blocker]").forEach((button) => {
    button.addEventListener("click", () => {
      if (toggleHumanBlocker(game.combat.blockPromptAttackUid, button.dataset.blocker)) {
        renderGame();
      }
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
  els.setupStatus.textContent = "Carregando dados...";
  const [cardsResponse, decksResponse, typesResponse, collectionsResponse] = await Promise.all([
    fetch(DATA_URLS.cards),
    fetch(DATA_URLS.decks),
    fetch(DATA_URLS.types),
    fetch(DATA_URLS.collections)
  ]);
  if (!cardsResponse.ok || !decksResponse.ok || !typesResponse.ok || !collectionsResponse.ok) {
    throw new Error("Nao foi possivel carregar os dados do jogo.");
  }

  const [cardsPayload, decksPayload, typesPayload, collectionsPayload] = await Promise.all([
    cardsResponse.json(),
    decksResponse.json(),
    typesResponse.json(),
    collectionsResponse.json()
  ]);

  app.typesById = new Map((typesPayload.types || []).map((type) => [Number(type.id), type]));
  app.collectionsById = new Map((collectionsPayload.collections || []).map((collection) => [Number(collection.id), collection]));
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
  });
  els.startGameButton.addEventListener("click", startGame);
  els.newGameButton?.addEventListener("click", showSetup);
  els.resetGameButton?.addEventListener("click", restartGame);
  els.resultNewGameButton.addEventListener("click", showSetup);
  els.soundToggleButton?.addEventListener("click", toggleSound);

  els.humanHand.addEventListener("click", (event) => {
    setHandExpanded(true);
    const button = event.target.closest("[data-hand-card]");
    if (!button) return;
    selectHandCard(button.dataset.handCard);
  });

  document.addEventListener("pointerdown", (event) => {
    if (!els.handDock || els.handDock.contains(event.target)) return;
    collapseHand();
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
    applyNextPhase();
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
  document.addEventListener("scroll", cleanupPointerDrag, true);
  window.addEventListener("blur", cleanupPointerDrag);

  document.addEventListener("dragstart", (event) => {
    const handCard = event.target.closest("[data-hand-card]");
    const battlefieldCard = event.target.closest("[data-battlefield-card]");
    if (handCard) {
      app.dragPayload = { zone: "hand", id: handCard.dataset.handCard };
    } else if (battlefieldCard) {
      app.dragPayload = { zone: "battlefield", id: battlefieldCard.dataset.battlefieldCard };
    } else {
      app.dragPayload = null;
      return;
    }
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", JSON.stringify(app.dragPayload));
  });

  document.addEventListener("dragend", () => {
    app.dragPayload = null;
    document.querySelectorAll(".is-drop-hover").forEach((node) => node.classList.remove("is-drop-hover"));
  });

  [els.humanBattlefield, humanEssencePanel, els.botArea, els.botBattlefield].forEach((zone) => {
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
    if (event.pointerType === "mouse") return;
    const handCard = event.target.closest("[data-hand-card]");
    const battlefieldCard = event.target.closest("[data-battlefield-card]");
    if (!handCard && !battlefieldCard) return;
    const cardId = handCard?.dataset.handCard || "";
    const uid = battlefieldCard?.dataset.battlefieldCard || "";
    const sourceCard = cardId || app.game?.players.human.battlefield.find((item) => item.uid === uid)?.cardId || "";
    if (!sourceCard) return;
    app.pointerDrag = {
      payload: handCard ? { zone: "hand", id: cardId } : { zone: "battlefield", id: uid },
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
      ghost: null,
      cardId: sourceCard
    };
  });

  document.addEventListener("pointermove", (event) => {
    const drag = app.pointerDrag;
    if (!drag) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (!drag.moved && drag.payload.zone === "hand" && Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.25) {
      app.pointerDrag = null;
      hideCardZoom();
      return;
    }
    if (!drag.moved && Math.hypot(dx, dy) < 10) return;
    event.preventDefault();
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
    const dropElement = drag.moved ? document.elementFromPoint(event.clientX, event.clientY) : null;
    const zone = dropElement?.closest(".essence-panel--human, #humanBattlefield, #botArea, #botBattlefield") || null;
    if (drag.ghost) drag.ghost.remove();
    document.querySelectorAll(".is-drop-hover").forEach((node) => node.classList.remove("is-drop-hover"));
    if (zone) handleDrop(zone, drag.payload, dropElement);
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
  zoom.innerHTML = `<img src="${escapeHtml(getCardImage(card))}" alt="${escapeHtml(getCardName(card))}" />`;
  zoom.classList.add("is-visible");
}

function hideCardZoom() {
  clearTimeout(app.zoomTimer);
  app.zoomTimer = null;
  app.zoomCardId = "";
  document.getElementById("cardZoomPreview")?.classList.remove("is-visible");
}

function cleanupPointerDrag() {
  if (app.pointerDrag?.ghost) app.pointerDrag.ghost.remove();
  app.pointerDrag = null;
  app.dragPayload = null;
  document.querySelectorAll(".is-drop-hover").forEach((node) => node.classList.remove("is-drop-hover"));
}

function createDragGhost(cardId) {
  const card = app.cardByCode.get(cardId);
  const ghost = document.createElement("div");
  ghost.className = "drag-ghost";
  ghost.innerHTML = `<img src="${escapeHtml(getCardImage(card))}" alt="" />`;
  return ghost;
}

function getDropZoneFromPoint(x, y) {
  const element = document.elementFromPoint(x, y);
  return element?.closest(".essence-panel--human, #humanBattlefield, #botArea, #botBattlefield");
}

function getAttackTargetFromDrop(zone, targetElement) {
  const opponentCard = targetElement?.closest?.("[data-bot-battlefield-card]");
  if (zone === els.botBattlefield && opponentCard) {
    const target = getCharacterAttackTarget("bot", opponentCard.dataset.botBattlefieldCard);
    if (isValidAttackTarget("human", target)) return target;
    showInteractionHint("Somente Personagens despreparados podem ser atacados diretamente.");
    return null;
  }
  if (zone === els.botArea || zone === els.botBattlefield) {
    return getTerritoryAttackTarget("bot");
  }
  return null;
}

function handleDrop(zone, payload, targetElement = null) {
  if (!payload || !app.game || app.game.status !== "active" || !canAct("human")) return;
  if (app.game.combat.awaitingBlockers || app.game.combat.resolving || app.game.combat.attackers.length) return;
  clearHumanAutoPass();
  let changed = false;

  if (payload.zone === "hand" && zone?.closest(".essence-panel--human")) {
    changed = applyConsecrate("human", payload.id);
  } else if (payload.zone === "hand" && zone === els.humanBattlefield) {
    changed = applyPlayCard("human", payload.id);
  } else if (payload.zone === "battlefield" && (zone === els.botArea || zone === els.botBattlefield)) {
    const target = getAttackTargetFromDrop(zone, targetElement);
    changed = target ? selectAttackTarget("human", payload.id, target) : false;
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
    els.setupStatus.textContent = error.message || "Nao foi possivel carregar o modo Play.";
    els.setupStatus.classList.add("is-error");
  }
}

init();
