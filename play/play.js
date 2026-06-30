const DATA_URLS = {
  cards: "../data/game/cards.json",
  decks: "../data/game/decks.json",
  types: "../data/refs/types.json",
  collections: "../data/refs/collections.json",
  virtues: "../data/game/virtues.json",
  engineTriggers: "../data/engine/triggers.json",
  engineActions: "../data/engine/effect_actions.json",
  engineKeywords: "../data/engine/keywords.json",
  engineAbilities: "../data/engine/abilities.json",
  engineAbilityLinks: "../data/engine/ability_links.json"
};

const CARD_BACK_IMAGE = "../assets/logo/Fundo - Foundation.webp";
const ESSENCE_ICON_IMAGE = "../assets/icons/00.webp";
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
const EDGE_EVENT_TTL_MS = 4200;
const EDGE_EVENT_MAX_ITEMS = 3;
const INTERNAL_TOKEN_CARDS = [
  {
    code: "TOKEN-INCENSE",
    typeCode: "ART",
    token: true,
    cost: 0,
    name: {
      pt: "Incenso",
      en: "Incense"
    },
    subtypes: ["Incenso"],
    text: "{T}, renuncie esta ficha: Gere {E}.",
    images: {
      card: "../assets/tokens/cards/Artefato - Foundations-24.webp",
      art: "../assets/tokens/imgs/Artefato - Foundations-24 - img.webp"
    },
    stats: {}
  },
  {
    code: "TOKEN-SOLDIER-ISRAELITE",
    typeCode: "PER",
    token: true,
    cost: 0,
    name: {
      pt: "Soldado Israelita",
      en: "Israelite Soldier"
    },
    subtypes: ["Soldado"],
    text: "Ficha de personagem Soldado Israelita 0/2.",
    images: {
      card: "../assets/tokens/cards/Personagem - Foundations-21.webp",
      art: "../assets/tokens/imgs/Personagem - Foundations-21 - img.webp"
    },
    stats: {
      attack: 0,
      resistance: 2
    }
  },
  {
    code: "TOKEN-SOLDIER-PHILISTINE",
    typeCode: "PER",
    token: true,
    cost: 0,
    name: {
      pt: "Soldado Filisteu",
      en: "Philistine Soldier"
    },
    subtypes: ["Soldado"],
    text: "Ficha de personagem Soldado Filisteu 1/1.",
    images: {
      card: "../assets/tokens/cards/Personagem - Foundations-22.webp",
      art: "../assets/tokens/imgs/Personagem - Foundations-22 - img.webp"
    },
    stats: {
      attack: 1,
      resistance: 1
    }
  },
  {
    code: "TOKEN-REBEL",
    typeCode: "PER",
    token: true,
    cost: 0,
    name: {
      pt: "Rebelde",
      en: "Rebel"
    },
    subtypes: ["Rebelde"],
    text: "Ficha de personagem Rebelde 1/1.",
    images: {
      card: "../assets/tokens/cards/Personagem - Foundations-23.webp",
      art: "../assets/tokens/imgs/Personagem - Foundations-23 - img.webp"
    },
    stats: {
      attack: 1,
      resistance: 1
    }
  }
];
const VIRTUE_AXIS_DISPLAY_ORDER = [6, 1, 7, 4, 3, 5, 2];
const VIRTUE_IDS = {
  faith: 1,
  doubt: 2,
  temperance: 3,
  lackOfControl: 4,
  justice: 5,
  iniquity: 6,
  fortitude: 7,
  cowardice: 8,
  hope: 9,
  despair: 10,
  prudence: 11,
  folly: 12,
  charity: 13,
  egoism: 14
};
const TEMPLE_IDS = {
  renewedCovenant: "FND-TEM-049",
  judgment: "FND-TEM-050",
  presence: "FND-TEM-051",
  hiddenSin: "FND-TEM-052"
};
const EQUIPMENT_IDS = {
  sling: "FND-ART-037",
  harp: "FND-ART-038",
  sword: "FND-ART-039",
  crown: "FND-ART-040"
};

function getVirtueAxisSortWeight(axis) {
  const normalized = Number(axis);
  const index = VIRTUE_AXIS_DISPLAY_ORDER.indexOf(normalized);
  return index >= 0 ? index : VIRTUE_AXIS_DISPLAY_ORDER.length + normalized;
}

function getSortedVirtueAxes() {
  return [...new Set(app.virtues.map((virtue) => Number(virtue.axis)).filter(Boolean))]
    .sort((a, b) => getVirtueAxisSortWeight(a) - getVirtueAxisSortWeight(b));
}

function sortVirtuesByDisplayOrder(items, getVirtue = (value) => value) {
  return [...items].sort((left, right) => {
    const leftVirtue = getVirtue(left);
    const rightVirtue = getVirtue(right);
    const axisDiff = getVirtueAxisSortWeight(leftVirtue?.axis) - getVirtueAxisSortWeight(rightVirtue?.axis);
    if (axisDiff) return axisDiff;
    return Number(leftVirtue?.id || 0) - Number(rightVirtue?.id || 0);
  });
}

const els = {
  setupView: document.getElementById("setupView"),
  gameView: document.getElementById("gameView"),
  humanDeckSelect: document.getElementById("humanDeckSelect"),
  botDeckSelect: document.getElementById("botDeckSelect"),
  botModeSelect: document.getElementById("botModeSelect"),
  setupMatchPreview: document.getElementById("setupMatchPreview"),
  startGameButton: document.getElementById("startGameButton"),
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
  actionDock: document.querySelector(".action-dock"),
  actionGrid: document.querySelector(".action-grid"),
  stackEdgePanel: document.getElementById("stackEdgePanel"),
  selectedCardPanel: document.getElementById("selectedCardPanel"),
  drawButton: document.getElementById("drawButton"),
  consecrateButton: document.getElementById("consecrateButton"),
  playCardButton: document.getElementById("playCardButton"),
  attackButton: document.getElementById("attackButton"),
  nextPhaseButton: document.getElementById("nextPhaseButton"),
  endTurnButton: document.getElementById("endTurnButton"),
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
  engine: {
    triggers: [],
    triggerById: new Map(),
    actions: [],
    actionById: new Map(),
    keywords: [],
    keywordById: new Map(),
    abilities: [],
    abilityById: new Map(),
    abilityLinks: [],
    abilityLinksBySource: new Map()
  },
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
  virtueFeedback: new Map(),
  virtueFeedbackTimers: new Map(),
  statFeedbackTimers: new Map(),
  preloadedImages: new Set(),
  preloadPromises: new Map(),
  setupPreloadToken: 0,
  setupAssetsReady: false,
  startingGame: false,
  resultViewingBoard: false,
  isLocalDebugHost: window.location.hostname === "127.0.0.1",
  virtueDebugEnabled: false,
  drawAnimationPending: false,
  edgeEvents: [],
  edgeEventTimers: new Map(),
  edgeEventSeq: 0,
  autoPassTimer: null,
  blockReviewResume: null,
  priority: null,
  pendingEngineChoice: null,
  pendingMoralChoice: null,
  pendingVirtueDebug: null,
  decisionBattlefieldView: false
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

const MODAL_EXIT_ANIMATION_MS = 180;
let viewportDensityFrame = 0;
let modalRenderObserver = null;

function getViewportDensity() {
  const width = window.innerWidth || document.documentElement.clientWidth || 0;
  const height = window.innerHeight || document.documentElement.clientHeight || 0;
  const aspect = height > 0 ? width / height : 1;
  const coarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches || false;
  const finePointer = window.matchMedia?.("(pointer: fine)")?.matches || false;
  return {
    width,
    height,
    aspect,
    compact: width < 860,
    short: height < 740,
    veryShort: height < 620,
    wide: width >= 1180 && aspect >= 1.35,
    landscape: width > height,
    portrait: height >= width,
    coarsePointer,
    finePointer: finePointer || !coarsePointer
  };
}

function updateViewportDensityState() {
  const view = els.gameView;
  if (!view) return;
  const viewport = getViewportDensity();
  view.dataset.viewportWidth = String(Math.round(viewport.width));
  view.dataset.viewportHeight = String(Math.round(viewport.height));
  view.classList.toggle("is-viewport-compact", viewport.compact);
  view.classList.toggle("is-viewport-short", viewport.short);
  view.classList.toggle("is-viewport-very-short", viewport.veryShort);
  view.classList.toggle("is-viewport-wide", viewport.wide);
  view.classList.toggle("is-viewport-landscape", viewport.landscape);
  view.classList.toggle("is-viewport-portrait", viewport.portrait);
  view.classList.toggle("is-coarse-pointer", viewport.coarsePointer);
  view.classList.toggle("is-fine-pointer", viewport.finePointer);
}

function scheduleViewportDensityUpdate() {
  if (viewportDensityFrame) window.cancelAnimationFrame(viewportDensityFrame);
  viewportDensityFrame = window.requestAnimationFrame(() => {
    viewportDensityFrame = 0;
    updateViewportDensityState();
  });
}

function syncFeedbackOverlayState() {
  const view = els.gameView;
  if (!view) return;
  const hasVisibleOverlay = Boolean(document.querySelector(".zone-modal.is-visible, .block-prompt.is-visible, .game-result:not(.is-hidden), .played-card-animation.is-visible, .draw-animation.is-visible, .reveal-animation.is-visible, .pulverize-animation.is-visible, .phase-alert.is-visible"));
  view.classList.toggle("is-feedback-overlay-active", hasVisibleOverlay);
}

function showModalElement(modal) {
  if (!modal) return;
  window.clearTimeout(modal._modalExitTimer);
  updateOverlayStateClasses(modal);
  modal.classList.remove("is-closing");
  modal.classList.remove("is-modal-updating");
  modal.classList.add("is-visible");
  modal.dataset.modalOpening = "true";
  window.setTimeout(() => {
    if (modal.classList.contains("is-visible")) modal.dataset.modalRendered = "true";
    delete modal.dataset.modalOpening;
  }, 0);
  syncFeedbackOverlayState();
}

function hideModalElement(modal, extraClasses = []) {
  if (!modal) return;
  window.clearTimeout(modal._modalExitTimer);
  if (extraClasses.length) modal.classList.remove(...extraClasses);
  if (!modal.classList.contains("is-visible")) {
    modal.classList.remove("is-closing", "is-modal-updating");
    delete modal.dataset.modalRendered;
    delete modal.dataset.modalOpening;
    return;
  }
  modal.classList.add("is-closing");
  modal.classList.remove("is-visible", "is-modal-updating");
  delete modal.dataset.modalRendered;
  delete modal.dataset.modalOpening;
  modal._modalExitTimer = window.setTimeout(() => {
    modal.classList.remove("is-closing");
    syncFeedbackOverlayState();
  }, MODAL_EXIT_ANIMATION_MS);
  syncFeedbackOverlayState();
}

function setZoneModalVisibleForRender(modal) {
  if (!modal) return;
  const isInternalUpdate = modal.classList.contains("is-visible") &&
    modal.dataset.modalRendered === "true" &&
    modal.dataset.modalOpening !== "true";
  modal.className = `zone-modal is-visible${isInternalUpdate ? " is-modal-updating" : ""}`;
}

function hideModalById(id, extraClasses = []) {
  hideModalElement(document.getElementById(id), extraClasses);
}

function updateOverlayStateClasses(modal) {
  if (!modal) return;
  const panel = modal.querySelector(".zone-modal-panel, .block-prompt-panel, .result-panel");
  const modalStateClasses = [
    "is-decision-modal",
    "is-field-view-modal",
    "is-moral-modal",
    "is-virtue-modal",
    "is-engine-modal",
    "is-card-choice-modal",
    "is-stack-choice-modal",
    "is-pregame-modal",
    "is-gallery-modal",
    "is-blocking-modal"
  ];
  modal.classList.remove(...modalStateClasses);
  if (!panel) return;
  const classList = panel.classList;
  const isEngine = [...classList].some((className) => className.includes("engine"));
  modal.classList.toggle("is-decision-modal", panel.dataset.decisionModal === "true");
  modal.classList.toggle("is-field-view-modal", modal.id === "fieldViewModal");
  modal.classList.toggle("is-moral-modal", classList.contains("zone-modal-panel--moral-choice"));
  modal.classList.toggle("is-virtue-modal", classList.contains("zone-modal-panel--virtues") || classList.contains("zone-modal-panel--virtue-debug"));
  modal.classList.toggle("is-engine-modal", isEngine);
  modal.classList.toggle("is-card-choice-modal", classList.contains("zone-modal-panel--engine-card-choice") || classList.contains("zone-modal-panel--engine-target-choice"));
  modal.classList.toggle("is-stack-choice-modal", classList.contains("zone-modal-panel--engine-stack-choice"));
  modal.classList.toggle("is-pregame-modal", classList.contains("zone-modal-panel--pregame-reduction") || classList.contains("zone-modal-panel--pregame-mulligan"));
  modal.classList.toggle("is-gallery-modal", Boolean(panel.querySelector(".zone-modal-grid")));
  modal.classList.toggle("is-blocking-modal", classList.contains("block-prompt-panel"));
}

function observeModalRenders() {
  if (modalRenderObserver || typeof MutationObserver === "undefined") return;
  modalRenderObserver = new MutationObserver((mutations) => {
    const modal = document.getElementById("zoneModal");
    if (!modal || !modal.classList.contains("is-visible")) return;
    const changedModal = mutations.some((mutation) => {
      const target = mutation.target;
      if (target === modal) return true;
      if (target instanceof Element && target.closest("#zoneModal")) return true;
      return [...mutation.addedNodes].some((node) => node === modal || (node instanceof Element && (node.id === "zoneModal" || node.closest("#zoneModal"))));
    });
    if (!changedModal) return;
    const alreadyRendered = modal.dataset.modalRendered === "true" && modal.dataset.modalOpening !== "true";
    modal.classList.toggle("is-modal-updating", alreadyRendered);
    modal.dataset.modalRendered = "true";
    updateOverlayStateClasses(modal);
    syncFeedbackOverlayState();
  });
  modalRenderObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function getModalElement(id = "zoneModal") {
  let modal = document.getElementById(id);
  if (!modal) {
    modal = document.createElement("div");
    modal.id = id;
    modal.className = "zone-modal";
    document.body.appendChild(modal);
  }
  return modal;
}

function hasPendingChoiceWork() {
  return Boolean(app.pendingEngineChoice || app.pendingMoralChoice || app.pendingVirtueDebug);
}

function canInspectBattlefieldDuringChoice() {
  const type = app.pendingEngineChoice?.type || "";
  return Boolean(
    app.game &&
    app.game.status === "active" &&
    hasPendingChoiceWork() &&
    type !== "pregame-reduction" &&
    type !== "pregame-mulligan"
  );
}

function clearDecisionBattlefieldView() {
  app.decisionBattlefieldView = false;
  document.getElementById("decisionReturnButton")?.remove();
  hideModalById("fieldViewModal");
  document.getElementById("zoneModal")?.classList.remove("is-battlefield-view");
}

function closeDecisionModal(overlay) {
  hideModalElement(overlay, ["is-battlefield-view"]);
  clearDecisionBattlefieldView();
}

function showDecisionReturnButton() {
  let button = document.getElementById("decisionReturnButton");
  if (!button) {
    button = document.createElement("button");
    button.id = "decisionReturnButton";
    button.className = "decision-return-button";
    button.type = "button";
    button.dataset.returnToDecision = "true";
    button.textContent = "Voltar à escolha";
    document.body.appendChild(button);
  }
}

function enterDecisionBattlefieldView() {
  if (!canInspectBattlefieldDuringChoice()) return false;
  const overlay = document.getElementById("zoneModal");
  if (!overlay) return false;
  app.decisionBattlefieldView = true;
  overlay.classList.add("is-battlefield-view");
  hideModalElement(overlay);
  renderGame();
  return true;
}

function returnToDecisionModal() {
  const overlay = document.getElementById("zoneModal");
  if (!overlay || !hasPendingChoiceWork()) return false;
  hideModalById("fieldViewModal");
  document.getElementById("decisionReturnButton")?.remove();
  app.decisionBattlefieldView = false;
  overlay.classList.remove("is-battlefield-view");
  showModalElement(overlay);
  renderGame();
  return true;
}

function getInformationalModalElement() {
  return getModalElement(app.decisionBattlefieldView ? "fieldViewModal" : "zoneModal");
}

function hideFieldViewModal() {
  hideModalById("fieldViewModal");
}

function decorateDecisionModal(overlay) {
  if (!overlay || !canInspectBattlefieldDuringChoice()) return;
  const panel = overlay.querySelector(".zone-modal-panel");
  const head = overlay.querySelector(".zone-modal-head");
  if (!panel || !head || head.querySelector("[data-view-battlefield]")) return;
  panel.dataset.decisionModal = "true";
  const button = document.createElement("button");
  button.type = "button";
  button.className = "zone-modal-view-board";
  button.dataset.viewBattlefield = "true";
  button.textContent = "Ver campo de batalha";
  head.appendChild(button);
}

function createEngineRegistry(payloads = {}) {
  const triggers = payloads.triggers?.triggers || [];
  const actions = payloads.actions?.actions || [];
  const keywords = payloads.keywords?.keywords || [];
  const abilities = payloads.abilities?.abilities || [];
  const abilityLinks = payloads.abilityLinks?.links || [];
  const abilityLinksBySource = new Map();

  abilityLinks.forEach((link) => {
    const key = getAbilitySourceKey(link);
    if (!abilityLinksBySource.has(key)) abilityLinksBySource.set(key, []);
    abilityLinksBySource.get(key).push(link);
  });

  return {
    triggers,
    triggerById: new Map(triggers.map((trigger) => [trigger.id, trigger])),
    actions,
    actionById: new Map(actions.map((action) => [action.id, action])),
    keywords,
    keywordById: new Map(keywords.flatMap((keyword) => {
      const ids = [keyword.id, ...(keyword.aliases || [])].filter(Boolean);
      return ids.map((id) => [normalizeKeywordText(id), keyword]);
    })),
    abilities,
    abilityById: new Map(abilities.map((ability) => [ability.id, ability])),
    abilityLinks,
    abilityLinksBySource
  };
}

function getAbilitySourceKey(link) {
  return [
    link?.sourceType || "",
    link?.sourceId || "",
    link?.level || "",
    link?.zone || ""
  ].join(":");
}

function getSourceCandidateKey(source) {
  return [
    source?.sourceType || "",
    source?.sourceId || "",
    source?.level || "",
    source?.zone || ""
  ].join(":");
}

function getActiveAbilitySources(game) {
  if (!game) return [];
  const sources = [];

  Object.values(game.players).forEach((player) => {
    getActiveVirtues(player).forEach(({ virtue, value }) => {
      sources.push({
        sourceType: "virtue",
        sourceId: virtue.id,
        level: value,
        zone: "",
        controllerId: player.id,
        label: `${getVirtueName(virtue)} Nv${value}`,
        icon: getVirtueIcon(virtue)
      });
    });

    player.battlefield.forEach((instance) => {
      const card = app.cardByCode.get(instance.cardId);
      sources.push({
        sourceType: "card",
        sourceId: instance.cardId,
        zone: "battlefield",
        controllerId: player.id,
        instanceUid: instance.uid,
        cardId: instance.cardId,
        label: getCardName(card)
      });
    });

    ["champion", "territory", "temple"].forEach((identityKind) => {
      const cardId = player.identity?.[identityKind];
      const card = app.cardByCode.get(cardId);
      if (!cardId || !card) return;
      sources.push({
        sourceType: "card",
        sourceId: cardId,
        zone: "identity",
        identityKind,
        controllerId: player.id,
        cardId,
        label: getCardName(card)
      });
    });
  });

  (game.effects || []).forEach((effect) => {
    if (!effect?.abilityId) return;
    sources.push({
      sourceType: "effect",
      sourceId: effect.id,
      zone: "effect",
      controllerId: effect.controllerId,
      effectId: effect.id,
      label: effect.label || "Efeito temporario"
    });
  });

  return sources;
}

function getEventAbilitySources(game, triggerId, payload = {}) {
  if (!game || !payload.cardId || !payload.playerId) return [];
  if (!["card.played", "card.resolved", "permanent.leaves_battlefield"].includes(triggerId)) return [];
  const card = app.cardByCode.get(payload.cardId);
  if (!card) return [];
  if (triggerId === "permanent.leaves_battlefield") {
    return [
      {
        sourceType: "card",
        sourceId: payload.cardId,
        zone: "leaves",
        controllerId: payload.playerId,
        instanceUid: payload.instanceUid,
        cardId: payload.cardId,
        label: getCardName(card),
        icon: getCardArt(card)
      }
    ];
  }
  return [
    {
      sourceType: "card",
      sourceId: payload.cardId,
      zone: triggerId === "card.played" ? "stack" : "resolution",
      controllerId: payload.playerId,
      cardId: payload.cardId,
      label: getCardName(card),
      icon: getCardArt(card)
    }
  ];
}

function findAbilityLinksForSource(source) {
  const links = [];
  const exact = app.engine.abilityLinksBySource.get(getSourceCandidateKey(source)) || [];
  links.push(...exact);

  const generic = app.engine.abilityLinks.filter((link) =>
    link.sourceType === source.sourceType &&
    String(link.sourceId) === String(source.sourceId) &&
    (!link.level || Number(link.level) === Number(source.level || 0)) &&
    (!link.zone || link.zone === source.zone)
  );

  generic.forEach((link) => {
    if (!links.includes(link)) links.push(link);
  });

  return links;
}

function cardHasEngineTag(card, tag, zone = "battlefield") {
  if (!card?.code || !tag) return false;
  return findAbilityLinksForSource({
    sourceType: "card",
    sourceId: card.code,
    zone
  }).some((link) => {
    const ability = app.engine.abilityById.get(link.abilityId);
    return Array.isArray(ability?.tags) && ability.tags.includes(tag);
  });
}

function hasEngineAbilityForSource(source, triggerId) {
  return findAbilityLinksForSource(source).some((link) => {
    const ability = app.engine.abilityById.get(link.abilityId);
    return ability?.trigger === triggerId;
  });
}

function hasCardResolutionAbility(cardId, playerId) {
  return hasEngineAbilityForSource({
    sourceType: "card",
    sourceId: cardId,
    zone: "resolution",
    controllerId: playerId,
    cardId
  }, "card.resolved");
}

function getCardResolutionStackObjects(cardId, playerId) {
  const game = app.game;
  const trigger = app.engine.triggerById.get("card.resolved");
  const card = app.cardByCode.get(cardId);
  if (!game || !trigger || !card) return [];
  const source = {
    sourceType: "card",
    sourceId: cardId,
    zone: "resolution",
    controllerId: playerId,
    cardId,
    label: getCardName(card),
    icon: getCardArt(card)
  };
  const payload = {
    game,
    playerId,
    cardId,
    cardType: getCardTypeCode(card),
    result: ["PER", "ART"].includes(getCardTypeCode(card)) ? "battlefield" : "cemetery"
  };
  return findAbilityLinksForSource(source)
    .map((link) => {
      const ability = app.engine.abilityById.get(link.abilityId);
      if (!ability || ability.trigger !== "card.resolved") return null;
      if (!evaluateAbilityCondition(ability, source, payload)) return null;
      return {
        id: `playability-${cardId}-${ability.id}`,
        type: "ability",
        label: localize(ability.label) || source.label || ability.id,
        owner: source.controllerId,
        controllerId: source.controllerId,
        cardId,
        triggerId: trigger.id,
        abilityId: ability.id,
        ability,
        source,
        payload,
        optional: Boolean(ability.optional)
      };
    })
    .filter(Boolean)
    .filter((stackObject) => isEngineStackObjectViable(stackObject));
}

function canResolveCardWhenPlayed(cardId, playerId) {
  if (!hasCardResolutionAbility(cardId, playerId)) return true;
  return getCardResolutionStackObjects(cardId, playerId).length > 0;
}

function createCardPlayStackObject(game, playerId, cardId) {
  const card = app.cardByCode.get(cardId);
  if (!game || !card) return null;
  const typeCode = getCardTypeCode(card);
  return {
    id: `play-${cardId}-${playerId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type: "play",
    label: getCardName(card),
    owner: playerId,
    controllerId: playerId,
    cardId,
    triggerId: "card.played",
    source: {
      sourceType: "card",
      sourceId: cardId,
      zone: "stack",
      controllerId: playerId,
      cardId,
      label: getCardName(card),
      icon: getCardArt(card)
    },
    payload: {
      game,
      playerId,
      cardId,
      cardType: typeCode
    }
  };
}

function collectEngineStackObjects(triggerId, payload = {}) {
  const trigger = app.engine.triggerById.get(triggerId);
  if (!trigger) return [];
  const game = payload.game || app.game;
  if (!game || game.status !== "active") return [];
  const stackObjects = [];
  const consumedDelayedEffects = new Set();

  [...getActiveAbilitySources(game), ...getEventAbilitySources(game, triggerId, payload)].forEach((source) => {
    findAbilityLinksForSource(source).forEach((link) => {
      const ability = app.engine.abilityById.get(link.abilityId);
      if (!ability || ability.trigger !== triggerId) return;
      if (isEngineOncePerTurnConsumed(game, ability, source)) return;
      if (!evaluateAbilityCondition(ability, source, payload)) return;
      const stackObject = createEngineStackObject(game, trigger, ability, source, payload);
      if (!stackObject) return;
      if (!isEngineStackObjectViable(stackObject)) return;
      consumeEngineOncePerTurn(game, ability, source);
      stackObjects.push(stackObject);
    });
  });

  (game.effects || []).forEach((effect) => {
    if (effect.type !== "delayedAbility" || effect.trigger !== triggerId) return;
    const ability = effect.ability;
    const source = effect.source || {
      sourceType: "effect",
      sourceId: effect.id,
      controllerId: effect.controllerId,
      label: effect.label || "Efeito temporario"
    };
    if (!ability || !evaluateAbilityCondition(ability, source, payload)) return;
    const stackObject = createEngineStackObject(game, trigger, ability, source, payload);
    if (!stackObject) return;
    if (!isEngineStackObjectViable(stackObject)) return;
    stackObject.delayedEffectId = effect.id;
    stackObject.suppressTriggerFeedback = Boolean(effect.suppressTriggerFeedback);
    stackObjects.push(stackObject);
    consumedDelayedEffects.add(effect.id);
  });

  if (consumedDelayedEffects.size) {
    game.effects = game.effects.filter((effect) => !consumedDelayedEffects.has(effect.id));
  }

  return stackObjects;
}

function emitGameEvent(triggerId, payload = {}, options = {}) {
  const game = payload.game || app.game;
  const stackObjects = collectEngineStackObjects(triggerId, payload);
  const queued = [];

  stackObjects.forEach((stackObject) => {
    const ability = stackObject.ability || app.engine.abilityById.get(stackObject.abilityId);
    if (stackObject.source?.sourceType === "virtue" && !stackObject.suppressTriggerFeedback) {
      markVirtueTriggered(stackObject.controllerId, stackObject.source.sourceId);
    }
    if (ability?.kind === "replacement" || ability?.usesStack === false || options.resolveImmediately) {
      if (ability?.kind === "replacement") {
        void flashImmediateStackObject(game, stackObject);
      }
      resolveEngineStackObject(game, stackObject);
      return;
    }
    game.stack.push(stackObject);
    queued.push(stackObject);
    addLog(game, `${stackObject.label} foi colocada na pilha.`, "Pilha");
    if (triggerId !== "stack.object_added") {
      emitGameEvent("stack.object_added", { game, stackObject }, { resolveImmediately: true });
    }
  });

  if (queued.length) {
    renderGame();
    scheduleStackResolution(game);
  }

  return queued;
}

async function resolveImmediateGameEvent(triggerId, payload = {}) {
  const game = payload.game || app.game;
  const stackObjects = collectEngineStackObjects(triggerId, payload);
  for (const stackObject of stackObjects) {
    const ability = stackObject.ability || app.engine.abilityById.get(stackObject.abilityId);
    if (stackObject.source?.sourceType === "virtue" && !stackObject.suppressTriggerFeedback) {
      markVirtueTriggered(stackObject.controllerId, stackObject.source.sourceId);
    }
    if (ability?.kind === "replacement") {
      await flashImmediateStackObject(game, stackObject);
    }
    await resolveEngineStackObject(game, stackObject);
  }
  if (stackObjects.length) {
    renderGame();
  }
  return stackObjects;
}

async function flashImmediateStackObject(game, stackObject, duration = 520) {
  if (!game || game !== app.game || game.status !== "active" || !stackObject) return;
  stackObject.immediateVisual = true;
  game.stack.push(stackObject);
  addLog(game, `${stackObject.label} esta sendo aplicada.`, "Pilha");
  playTone("soft");
  renderGame();
  await wait(duration);
  game.stack = game.stack.filter((object) => object.id !== stackObject.id);
  renderGame();
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

function cardMatchesTypeFilter(card, filter = {}) {
  if (!card) return false;
  const typeFilter = filter.type || filter.types;
  if (!typeFilter) return true;
  return (Array.isArray(typeFilter) ? typeFilter : [typeFilter])
    .map(String)
    .includes(String(getCardTypeCode(card)));
}

function cardHasSubtype(card, expectedSubtype) {
  if (!card || typeof expectedSubtype === "undefined" || expectedSubtype === null) return false;
  const expected = (Array.isArray(expectedSubtype) ? expectedSubtype : [expectedSubtype])
    .map((value) => normalizeKeywordText(value))
    .filter(Boolean);
  if (!expected.length) return false;
  const actual = [
    ...(Array.isArray(card.subtype) ? card.subtype : []),
    ...(Array.isArray(card.subtypes) ? card.subtypes : [])
  ].map((value) => normalizeKeywordText(value));
  return expected.some((value) => actual.includes(value));
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

function getPendingPlayCostDiscount(player, card) {
  if (!player || !card || getCardTypeCode(card) === "PEC") return 0;
  return (app.game?.effects || [])
    .filter((effect) => effect.type === "nextPlayCostDiscount" && effect.controllerId === player.id)
    .reduce((sum, effect) => sum + toNumber(effect.amount, 0), 0);
}

function getEffectivePlayCost(player, card) {
  const baseCost = getCost(card);
  if (getCardTypeCode(card) === "PEC") return baseCost;
  return Math.max(0, baseCost - getPendingPlayCostDiscount(player, card));
}

function getEssencePool(player) {
  return Math.max(0, toNumber(player?.essencePool, 0));
}

function getReadyEssenceCount(player) {
  return Math.max(0, (player?.essence?.length || 0) - toNumber(player?.spentEssence, 0));
}

function getTotalEssenceCapacity(player) {
  return (player?.essence?.length || 0) + getEssencePool(player);
}

function consumePendingPlayCostDiscount(player) {
  const game = app.game;
  if (!game?.effects?.length || !player) return 0;
  let consumed = 0;
  const consumedIds = new Set();
  game.effects.forEach((effect) => {
    if (effect.type !== "nextPlayCostDiscount" || effect.controllerId !== player.id) return;
    consumed += toNumber(effect.amount, 0);
    consumedIds.add(effect.id);
  });
  if (consumedIds.size) {
    game.effects = game.effects.filter((effect) => !consumedIds.has(effect.id));
  }
  return consumed;
}

function getVirtueName(virtue) {
  return localize(virtue?.name) || `${virtue?.id || ""}`.trim();
}

function getVirtueIcon(virtue) {
  return virtue?.images?.icon || virtue?.images?.item || "";
}

function getVirtueArtwork(virtue) {
  if (!virtue) return "";
  return virtue.images?.img ||
    virtue.images?.art ||
    virtue.images?.background ||
    `../assets/virtudes/imgs/Virtudes - Foundations-${Number(virtue.id)} - img.webp`;
}

function getVirtueCardImage(virtue) {
  if (!virtue) return "";
  return virtue.images?.card ||
    virtue.images?.full ||
    `../assets/virtudes/cards/Virtudes - Foundations-${Number(virtue.id)}.webp`;
}

function getVirtueVisualAssets(virtue) {
  return [
    virtue?.images?.icon,
    virtue?.images?.item,
    getVirtueArtwork(virtue),
    getVirtueCardImage(virtue)
  ].filter(Boolean);
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

function getVirtueById(id) {
  return app.virtuesById.get(Number(id)) || null;
}

function getVirtueValue(player, id) {
  return toNumber(player?.virtues?.[String(id)], 0);
}

function hasVirtueLevel(player, id, level = 1) {
  return getVirtueValue(player, id) >= level;
}

function setVirtueValue(player, id, value) {
  if (!player?.virtues) return;
  player.virtues[String(id)] = Math.max(0, Math.min(4, toNumber(value, 0)));
}

function getVirtuesByPolarity(polarity) {
  return app.virtues.filter((virtue) => virtue.polarity === polarity);
}

function getVirtueAxis(value) {
  const virtue = typeof value === "object" ? value : getVirtueById(value);
  return Number(virtue?.axis || 0);
}

function getVirtueFeedbackKey(playerId, axis) {
  return `${playerId}:${axis}`;
}

function getVirtueFeedback(playerId, axis) {
  return app.virtueFeedback.get(getVirtueFeedbackKey(playerId, axis)) || null;
}

function clearVirtueFeedback(key) {
  if (!key) return;
  const timer = app.virtueFeedbackTimers.get(key);
  if (timer) {
    window.clearTimeout(timer);
    app.virtueFeedbackTimers.delete(key);
  }
  if (app.virtueFeedback.delete(key) && app.game) renderGame();
}

function clearAllVirtueFeedback() {
  app.virtueFeedbackTimers.forEach((timer) => window.clearTimeout(timer));
  app.virtueFeedbackTimers.clear();
  app.virtueFeedback.clear();
}

function getStatFeedbackKey(playerId, uid) {
  return `${playerId || ""}::${uid || ""}`;
}

function clearStatFeedback(key, shouldRender = true) {
  const entry = app.statFeedbackTimers.get(key);
  if (entry?.timer) window.clearTimeout(entry.timer);
  app.statFeedbackTimers.delete(key);
  const [fallbackPlayerId, fallbackUid] = key.split("::");
  const playerId = entry?.playerId || fallbackPlayerId;
  const uid = entry?.uid || fallbackUid;
  const instance = app.game?.players?.[playerId]?.battlefield?.find((item) => item.uid === uid);
  if (instance?.statFeedback) {
    delete instance.statFeedback;
    if (shouldRender && app.game) renderGame();
  }
}

function clearAllStatFeedback() {
  app.statFeedbackTimers.forEach((entry, key) => {
    if (entry?.timer) window.clearTimeout(entry.timer);
    const [fallbackPlayerId, fallbackUid] = key.split("::");
    const playerId = entry?.playerId || fallbackPlayerId;
    const uid = entry?.uid || fallbackUid;
    const instance = app.game?.players?.[playerId]?.battlefield?.find((item) => item.uid === uid);
    if (instance?.statFeedback) delete instance.statFeedback;
  });
  app.statFeedbackTimers.clear();
}

function markPositiveStatFeedback(refs, powerDelta = 0, resistanceDelta = 0) {
  const power = toNumber(powerDelta, 0);
  const resistance = toNumber(resistanceDelta, 0);
  if (power <= 0 && resistance <= 0) return 0;
  const uniqueRefs = new Map();
  (refs || []).forEach(({ playerId, instance }) => {
    if (!playerId || !instance?.uid) return;
    uniqueRefs.set(getStatFeedbackKey(playerId, instance.uid), { playerId, instance });
  });
  if (!uniqueRefs.size) return 0;
  const label = `${formatSignedStat(power)}/${formatSignedStat(resistance)}`;
  uniqueRefs.forEach(({ playerId, instance }, key) => {
    clearStatFeedback(key, false);
    instance.statFeedback = {
      tone: "buff",
      label,
      power,
      resistance
    };
    const timer = window.setTimeout(() => clearStatFeedback(key), 1320);
    app.statFeedbackTimers.set(key, { timer, playerId, uid: instance.uid });
  });
  playTone("buff");
  if (app.game) renderGame();
  return uniqueRefs.size;
}

function setVirtueFeedback(playerId, virtueId, feedback) {
  const axis = getVirtueAxis(virtueId);
  if (!playerId || !axis) return;
  const key = getVirtueFeedbackKey(playerId, axis);
  clearVirtueFeedback(key);
  app.virtueFeedback.set(key, {
    axis,
    virtueId: Number(virtueId),
    tone: feedback?.tone || "neutral",
    marker: feedback?.marker || "trigger"
  });
  const timer = window.setTimeout(() => clearVirtueFeedback(key), 1380);
  app.virtueFeedbackTimers.set(key, timer);
  if (app.game) renderGame();
}

function markVirtueTriggered(playerId, virtueId) {
  setVirtueFeedback(playerId, virtueId, {
    tone: "neutral",
    marker: "trigger"
  });
}

function markVirtueChange(playerId, change) {
  if (!playerId || !change || change.before === change.after) return;
  const increased = change.after > change.before;
  const positive = change.virtue?.polarity === "virtue" ? increased : !increased;
  setVirtueFeedback(playerId, change.virtue?.id, {
    tone: positive ? "positive" : "negative",
    marker: increased ? "up" : "down"
  });
}

function markMoralResultFeedback(playerId, result) {
  (result?.changes || []).forEach((change, index) => {
    window.setTimeout(() => markVirtueChange(playerId, change), index * 420);
  });
}

function applyMoralShift(player, targetId, delta = 1) {
  const source = getVirtueById(targetId);
  const amount = Math.abs(toNumber(delta, 0));
  if (!player || !source || amount <= 0) return null;
  const direction = delta >= 0 ? source : getVirtueById(source.oppositeId);
  if (!direction) return null;
  const opposite = getVirtueById(direction.oppositeId);
  const before = new Map(app.virtues.map((virtue) => [Number(virtue.id), getVirtueValue(player, virtue.id)]));
  let remaining = amount;

  if (opposite) {
    const oppositeValue = getVirtueValue(player, opposite.id);
    const reduction = Math.min(oppositeValue, remaining);
    if (reduction > 0) {
      setVirtueValue(player, opposite.id, oppositeValue - reduction);
      remaining -= reduction;
    }
  }

  if (remaining > 0) {
    const current = getVirtueValue(player, direction.id);
    setVirtueValue(player, direction.id, current + remaining);
  }

  const changes = app.virtues
    .map((virtue) => ({
      virtue,
      before: before.get(Number(virtue.id)) || 0,
      after: getVirtueValue(player, virtue.id)
    }))
    .filter((item) => item.before !== item.after);

  return changes.length ? { direction, source, changes } : null;
}

function simulateMoralShiftValues(player, targetId, delta = 1) {
  const source = getVirtueById(targetId);
  const amount = Math.abs(toNumber(delta, 0));
  const state = new Map(app.virtues.map((virtue) => [Number(virtue.id), getVirtueValue(player, virtue.id)]));
  if (!source || amount <= 0) return state;
  const direction = delta >= 0 ? source : getVirtueById(source.oppositeId);
  if (!direction) return state;
  const opposite = getVirtueById(direction.oppositeId);
  let remaining = amount;

  if (opposite) {
    const oppositeValue = state.get(Number(opposite.id)) || 0;
    const reduction = Math.min(oppositeValue, remaining);
    if (reduction > 0) {
      state.set(Number(opposite.id), oppositeValue - reduction);
      remaining -= reduction;
    }
  }

  if (remaining > 0) {
    const current = state.get(Number(direction.id)) || 0;
    state.set(Number(direction.id), Math.max(0, Math.min(4, current + remaining)));
  }

  return state;
}

function getMoralChoicePreview(player, targetId, delta = 1) {
  const afterState = simulateMoralShiftValues(player, targetId, delta);
  const changed = app.virtues
    .map((virtue) => ({
      virtue,
      before: getVirtueValue(player, virtue.id),
      after: afterState.get(Number(virtue.id)) || 0
    }))
    .filter((item) => item.before !== item.after);
  const gained = changed.find((item) => item.after > item.before && item.after > 0);
  const relevant = gained || changed[0];
  if (!relevant) {
    return {
      title: "Sem alteração",
      text: "Esta escolha não altera nenhum nível moral neste momento."
    };
  }
  const level = getVirtueLevelData(relevant.virtue, relevant.after);
  if (gained) {
    return {
      title: `${getVirtueName(relevant.virtue)} Nv${relevant.after}`,
      text: localize(level?.text) || localize(relevant.virtue.flavor) || "Efeito ainda sem descrição."
    };
  }
  if (relevant.after > 0) {
    return {
      title: `${getVirtueName(relevant.virtue)} ficará em Nv${relevant.after}`,
      text: localize(level?.text) || localize(relevant.virtue.flavor) || "Efeito ainda sem descrição."
    };
  }
  return {
    title: `${getVirtueName(relevant.virtue)} ficará neutra`,
    text: "Nenhum efeito ativo permanecerá neste eixo depois desta escolha."
  };
}

function moralChoiceWouldChange(player, targetId, delta = 1) {
  const afterState = simulateMoralShiftValues(player, targetId, delta);
  return app.virtues.some((virtue) => getVirtueValue(player, virtue.id) !== (afterState.get(Number(virtue.id)) || 0));
}

function formatMoralChange(change) {
  const name = getVirtueName(change.virtue);
  return `${name} ${change.before}->${change.after}`;
}

function serializeMoralChanges(changes = []) {
  return changes.map((change) => ({
    virtueId: Number(change.virtue?.id || 0),
    virtueName: getVirtueName(change.virtue),
    before: change.before,
    after: change.after
  }));
}

function emitMoralChangedEvent(game, player, result, reason) {
  if (!result?.changes?.length) return;
  markMoralResultFeedback(player.id, result);
  emitGameEvent("moral.changed", {
    game,
    playerId: player.id,
    changes: serializeMoralChanges(result.changes),
    reason
  });
}

function addMoralShiftLog(game, player, result, context) {
  if (!result?.changes?.length) return;
  const summary = result.changes.map(formatMoralChange).join(", ");
  addLog(game, `${context}: ${summary}.`, player.label);
  emitMoralChangedEvent(game, player, result, context);
}

function formatMoralResultForAlert(result) {
  if (!result?.changes?.length) return "";
  return result.changes
    .map((change) => `${getVirtueName(change.virtue)} ${change.before}->${change.after}`)
    .join(" · ");
}

function getPrimaryMoralChange(result) {
  if (!result?.changes?.length) return null;
  const activeGain = result.changes.find((change) => change.after > change.before && change.after > 0);
  return activeGain || result.changes.find((change) => change.after > 0) || result.changes[0];
}

function getMoralResultAlertData(result) {
  const change = getPrimaryMoralChange(result);
  if (!change) return null;
  const increased = change.after > change.before;
  const positive = change.virtue?.polarity === "virtue" ? increased : !increased;
  return {
    virtueId: change.virtue.id,
    virtueName: getVirtueName(change.virtue),
    icon: getVirtueIcon(change.virtue),
    cardImage: getVirtueCardImage(change.virtue),
    before: change.before,
    after: change.after,
    direction: increased ? "up" : "down",
    tone: positive ? "positive" : "negative",
    label: `${getVirtueName(change.virtue)} Nv${change.after}`
  };
}

function applyCardMoralPips(playerId, card) {
  const game = app.game;
  const player = getPlayer(game, playerId);
  const ids = Array.isArray(card?.virtues) ? card.virtues : [];
  const changes = [];
  ids.forEach((id) => {
    const result = applyMoralShift(player, id, 1);
    if (result?.changes?.length) changes.push(...result.changes.map(formatMoralChange));
    emitMoralChangedEvent(game, player, result, `marcas morais de ${getCardName(card)}`);
  });
  if (changes.length) {
    addLog(game, `marcas morais de ${getCardName(card)}: ${changes.join(", ")}.`, player.label);
  }
}

function buildMoralChoice(player, sourceVirtue, targetId, delta, detail) {
  const target = getVirtueById(targetId);
  if (!sourceVirtue || !target) return null;
  const current = getVirtueValue(player, sourceVirtue.id);
  const targetCurrent = getVirtueValue(player, target.id);
  const amount = Math.abs(toNumber(delta, 0));
  const direction = `${delta >= 0 ? "+" : "-"}${amount}`;
  const preview = getMoralChoicePreview(player, target.id, delta);
  return {
    sourceId: sourceVirtue.id,
    targetId: target.id,
    delta,
    title: getVirtueName(sourceVirtue),
    subtitle: detail || `${getVirtueName(target)} ${direction}`,
    meta: `Atual ${current}${sourceVirtue.id === target.id ? "" : ` · ${getVirtueName(target)} ${targetCurrent}`}`,
    effectTitle: preview.title,
    effectText: preview.text,
    icon: getVirtueIcon(sourceVirtue)
  };
}

function sortMoralChoices(choices = []) {
  return [...choices].sort((left, right) => {
    const leftVirtue = getVirtueById(left.sourceId || left.targetId);
    const rightVirtue = getVirtueById(right.sourceId || right.targetId);
    const axisDiff = getVirtueAxisSortWeight(leftVirtue?.axis) - getVirtueAxisSortWeight(rightVirtue?.axis);
    if (axisDiff) return axisDiff;
    return Number(leftVirtue?.id || 0) - Number(rightVirtue?.id || 0);
  });
}

function getConsecrationMoralChoices(player, amount = 1) {
  const delta = Math.max(1, toNumber(amount, 1));
  const activeVices = getVirtuesByPolarity("vice").filter((virtue) => getVirtueValue(player, virtue.id) > 0);
  if (activeVices.length) {
    const lowest = Math.min(...activeVices.map((virtue) => getVirtueValue(player, virtue.id)));
    return sortMoralChoices(activeVices
      .filter((virtue) => getVirtueValue(player, virtue.id) === lowest)
      .map((virtue) => buildMoralChoice(player, virtue, virtue.oppositeId, delta, `Redimir para ${getVirtueName(getVirtueById(virtue.oppositeId))} +${delta}`))
      .filter(Boolean));
  }

  const activeVirtues = getVirtuesByPolarity("virtue")
    .filter((virtue) => getVirtueValue(player, virtue.id) > 0 && getVirtueValue(player, virtue.id) < 4);
  if (activeVirtues.length) {
    const highest = Math.max(...activeVirtues.map((virtue) => getVirtueValue(player, virtue.id)));
    return sortMoralChoices(activeVirtues
      .filter((virtue) => getVirtueValue(player, virtue.id) === highest)
      .map((virtue) => buildMoralChoice(player, virtue, virtue.id, delta, `${getVirtueName(virtue)} +${delta}`))
      .filter(Boolean));
  }

  return sortMoralChoices(getVirtuesByPolarity("virtue")
    .filter((virtue) => getVirtueValue(player, virtue.id) < 4)
    .map((virtue) => buildMoralChoice(player, virtue, virtue.id, delta, `${getVirtueName(virtue)} +${delta}`))
    .filter(Boolean));
}

function getFlexibleMoralChoices(player, amount = 1) {
  const delta = Math.max(1, toNumber(amount, 1));
  return sortMoralChoices(app.virtues.flatMap((virtue) => ([
    buildMoralChoice(player, virtue, virtue.id, delta, `${getVirtueName(virtue)} +${delta}`),
    buildMoralChoice(player, virtue, virtue.id, -delta, `${getVirtueName(virtue)} -${delta}`)
  ]))
    .filter(Boolean)
    .filter((choice) => moralChoiceWouldChange(player, choice.targetId, choice.delta)));
}

function getProfanationMoralChoices(player) {
  const activeVirtues = getVirtuesByPolarity("virtue").filter((virtue) => getVirtueValue(player, virtue.id) > 0);
  if (activeVirtues.length) {
    const lowest = Math.min(...activeVirtues.map((virtue) => getVirtueValue(player, virtue.id)));
    return sortMoralChoices(activeVirtues
      .filter((virtue) => getVirtueValue(player, virtue.id) === lowest)
      .map((virtue) => buildMoralChoice(player, virtue, virtue.id, -2, `${getVirtueName(virtue)} -2`))
      .filter(Boolean));
  }

  const activeVices = getVirtuesByPolarity("vice")
    .filter((virtue) => getVirtueValue(player, virtue.id) > 0 && getVirtueValue(player, virtue.id) < 4);
  if (activeVices.length) {
    const highest = Math.max(...activeVices.map((virtue) => getVirtueValue(player, virtue.id)));
    return sortMoralChoices(activeVices
      .filter((virtue) => getVirtueValue(player, virtue.id) === highest)
      .map((virtue) => buildMoralChoice(player, virtue, virtue.id, 2, `${getVirtueName(virtue)} +2`))
      .filter(Boolean));
  }

  return sortMoralChoices(getVirtuesByPolarity("vice")
    .filter((virtue) => getVirtueValue(player, virtue.id) < 4)
    .map((virtue) => buildMoralChoice(player, virtue, virtue.id, 2, `${getVirtueName(virtue)} +2`))
    .filter(Boolean));
}

function queueMoralChoice(player, title, description, choices, context, onComplete) {
  const validChoices = sortMoralChoices(choices.filter(Boolean));
  if (!validChoices.length) {
    onComplete?.(null);
    return;
  }
  if (player.id !== "human" || validChoices.length === 1) {
    const choice = validChoices[0];
    const result = applyMoralShift(player, choice.targetId, choice.delta);
    addMoralShiftLog(app.game, player, result, context);
    onComplete?.(result);
    return;
  }
  showMoralChoiceModal({
    playerId: player.id,
    title,
    description,
    choices: validChoices,
    context,
    onComplete
  });
}

function queueConsecrationMoralAdjustment(player, onComplete, amount = 1) {
  queueMoralChoice(
    player,
    "Escolha moral da Consagração",
    "Escolha uma das opções possíveis pelas regras de Consagração.",
    getConsecrationMoralChoices(player, amount),
    "Consagração",
    onComplete
  );
}

function queueConsecrationMoralAdjustmentAsync(player, amount = 1) {
  return new Promise((resolve) => queueConsecrationMoralAdjustment(player, resolve, amount));
}

function playerHasTemple(player, templeId) {
  const currentTempleId = player?.identity?.temple || "";
  const currentTemple = app.cardByCode.get(currentTempleId);
  return Boolean(currentTempleId === templeId || currentTemple?.code === templeId);
}

function queueConsecrationSinMoralAdjustment(player) {
  const activeVices = getVirtuesByPolarity("vice").filter((virtue) => getVirtueValue(player, virtue.id) > 0);
  if (!activeVices.length) return Promise.resolve(null);
  const lowest = Math.min(...activeVices.map((virtue) => getVirtueValue(player, virtue.id)));
  const choices = activeVices
    .filter((virtue) => getVirtueValue(player, virtue.id) === lowest)
    .map((virtue) => buildMoralChoice(
      player,
      virtue,
      virtue.oppositeId,
      2,
      `Redimir para ${getVirtueName(getVirtueById(virtue.oppositeId))} +2`
    ))
    .filter(Boolean);
  return new Promise((resolve) => queueMoralChoice(
    player,
    "Consagração de Pecado",
    "Escolha uma Desvirtude ativa de menor valor para redimir pelo efeito do Pecado consagrado.",
    choices,
    "Consagração de Pecado",
    resolve
  ));
}

function queueProfanationMoralAdjustment(player, onComplete) {
  queueMoralChoice(
    player,
    "Escolha moral da Profanação",
    "Escolha uma das opções possíveis pelas regras de Profanação.",
    getProfanationMoralChoices(player),
    "Profanação",
    onComplete
  );
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
    ${app.isLocalDebugHost ? `
      <label class="setup-debug-toggle">
        <input type="checkbox" data-toggle-virtue-debug ${app.virtueDebugEnabled ? "checked" : ""} />
        <span>Teste manual de virtudes na Preparação</span>
      </label>
    ` : ""}
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
      getVirtueVisualAssets(virtue).forEach((url) => {
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
  const tokenUrls = INTERNAL_TOKEN_CARDS.flatMap((card) => [getCardImage(card), getCardArt(card)]);
  const virtueUrls = app.virtues.flatMap(getVirtueVisualAssets);
  const urls = [...new Set([...decks.flatMap(getDeckAssetUrls), ...tokenUrls, ...virtueUrls].filter(Boolean))];
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

  els.startGameButton.textContent = "Carregando";
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
    els.startGameButton.textContent = "Carregando";
    els.startGameButton.disabled = true;
  }
}

function createCardInstance(cardId, owner) {
  return {
    uid: `${owner}-${cardId}-${Math.random().toString(36).slice(2, 9)}`,
    cardId,
    owner,
    attachedTo: "",
    exhausted: false,
    declaredAttacker: false,
    damage: 0
  };
}

function getTokenCardId(tokenId) {
  const normalized = normalizeKeywordText(tokenId);
  if (normalized === "INCENSE" || normalized === "INCENSO") return "TOKEN-INCENSE";
  if (normalized === "SOLDIER_ISRAELITE" || normalized === "SOLDADO_ISRAELITA") return "TOKEN-SOLDIER-ISRAELITE";
  if (normalized === "SOLDIER_PHILISTINE" || normalized === "SOLDADO_FILISTEU") return "TOKEN-SOLDIER-PHILISTINE";
  if (normalized === "REBEL" || normalized === "REBELDE") return "TOKEN-REBEL";
  return tokenId;
}

function createTokenInstance(tokenId, owner, state = {}) {
  const cardId = getTokenCardId(tokenId);
  if (!app.cardByCode.has(cardId)) return null;
  return {
    ...createCardInstance(cardId, owner),
    token: true,
    tokenId,
    tokenQuantity: 1,
    exhausted: Boolean(state.exhausted || state.tapped || state.desativada)
  };
}

function getTokenQuantity(instance) {
  return Math.max(1, toNumber(instance?.tokenQuantity, 1));
}

function isIncenseTokenInstance(instance) {
  return isIncenseTokenCard(app.cardByCode.get(instance?.cardId));
}

function findIncenseTokenStack(player, state = {}) {
  const exhausted = Boolean(state.exhausted || state.tapped || state.desativada);
  return (player?.battlefield || []).find((instance) => (
    isIncenseTokenInstance(instance) &&
    Boolean(instance.exhausted) === exhausted
  )) || null;
}

function addIncenseTokensToBattlefield(player, amount = 1, state = {}) {
  if (!player) return null;
  const quantity = Math.max(1, toNumber(amount, 1));
  let instance = findIncenseTokenStack(player, state);
  if (!instance) {
    instance = createTokenInstance("incense", player.id, state);
    if (!instance) return null;
    instance.tokenQuantity = quantity;
    player.battlefield.push(instance);
    return instance;
  }
  instance.tokenQuantity = getTokenQuantity(instance) + quantity;
  return instance;
}

function normalizeIncenseTokenStacks(player) {
  if (!player?.battlefield?.length) return;
  const stacks = new Map();
  player.battlefield = player.battlefield.filter((instance) => {
    if (!isIncenseTokenInstance(instance)) return true;
    const key = Boolean(instance.exhausted) ? "exhausted" : "ready";
    const existing = stacks.get(key);
    if (!existing) {
      instance.token = true;
      instance.tokenId = instance.tokenId || "incense";
      instance.tokenQuantity = getTokenQuantity(instance);
      stacks.set(key, instance);
      return true;
    }
    existing.tokenQuantity = getTokenQuantity(existing) + getTokenQuantity(instance);
    return false;
  });
}

function normalizeAllIncenseTokenStacks(game = app.game) {
  Object.values(game?.players || {}).forEach(normalizeIncenseTokenStacks);
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

function createShuffleSeed(label = "shuffle") {
  const cryptoObj = window.crypto || window.msCrypto;
  const now = typeof performance !== "undefined" && typeof performance.now === "function" ? performance.now() : 0;
  const entropy = [Date.now(), now, Math.random(), label];
  if (cryptoObj?.getRandomValues) {
    const values = new Uint32Array(4);
    cryptoObj.getRandomValues(values);
    entropy.push([...values].join("-"));
  }
  return entropy.join(":");
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

function applyDeckShortageDamage(player, missingCards, reason = "fadiga") {
  const shortage = Math.max(0, toNumber(missingCards, 0));
  if (!player || shortage <= 0) return 0;
  const totalDamage = shortage * 2;
  dealTerritoryDamage(player, totalDamage, reason, "", { damageType: "fatigue" });
  checkGameEnd(app.game);
  return totalDamage;
}

function drawCardsWithFatigue(player, amount, reason = "fadiga por compra impossivel") {
  const drawn = drawCards(player, amount);
  const missing = Math.max(0, toNumber(amount, 0) - drawn.length);
  const fatigueDamage = missing > 0 ? applyDeckShortageDamage(player, missing, reason) : 0;
  return { drawn, missing, fatigueDamage };
}

function pulverizeCards(player, amount, reason = "fadiga por pulverizacao impossivel") {
  const milled = [];
  const total = Math.max(0, toNumber(amount, 0));
  for (let index = 0; index < total; index += 1) {
    const cardId = player?.deck?.shift?.();
    if (!cardId) break;
    player.cemetery.push(cardId);
    milled.push(cardId);
  }
  const missing = Math.max(0, total - milled.length);
  const fatigueDamage = missing > 0 ? applyDeckShortageDamage(player, missing, reason) : 0;
  return { milled, missing, fatigueDamage };
}

function createPlayer(id, label, deck, isBot = false) {
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
    deck: [...deck.cards],
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
    essencePool: 0,
    territoryDamageTakenThisTurn: 0,
    characterDamageTakenThisTurn: 0,
    cardsPlayedThisTurn: 0,
    consecratedThisTurn: false,
    consecrationActionTaken: false,
    drewThisTurn: false,
    combatDeclaredThisTurn: false,
    championCovered: false
  };
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
  return getReadyEssenceCount(player) + getEssencePool(player);
}

function getReadyEssenceGeneratorInstances(player) {
  return (player?.battlefield || [])
    .filter((instance) => !instance.exhausted && isEssenceGeneratorInstance(instance));
}

function getPotentialGeneratedEssence(player) {
  return getReadyEssenceGeneratorInstances(player)
    .reduce((total, instance) => total + (isIncenseTokenInstance(instance) ? getTokenQuantity(instance) : 1), 0);
}

function getPotentialAvailableEssence(player) {
  return getAvailableEssence(player) + getPotentialGeneratedEssence(player);
}

function ensureGeneratedEssenceForCost(player, amount) {
  const cost = Math.max(0, toNumber(amount, 0));
  if (!player || getAvailableEssence(player) >= cost) return true;
  const generators = getReadyEssenceGeneratorInstances(player)
    .flatMap((instance) => Array.from({
      length: isIncenseTokenInstance(instance) ? getTokenQuantity(instance) : 1
    }, () => instance));
  for (const generator of generators) {
    if (getAvailableEssence(player) >= cost) break;
    activateEssenceGeneratorForPayment(player, generator);
  }
  return getAvailableEssence(player) >= cost;
}

function clearEssencePool(player) {
  if (!player) return 0;
  const cleared = getEssencePool(player);
  player.essencePool = 0;
  return cleared;
}

function clearAllEssencePools(game) {
  Object.values(game?.players || {}).forEach(clearEssencePool);
}

function generateEssence(player, amount = 1, options = {}) {
  if (!player) return 0;
  const generated = Math.max(0, toNumber(amount, 0));
  player.essencePool = getEssencePool(player) + generated;
  if (generated > 0 && options.animate !== false) {
    showEssenceBurst(player.id, generated, options.kind || "gain", options.sourceUid || "");
  }
  return generated;
}

function spendEssenceCost(player, amount) {
  const cost = Math.max(0, toNumber(amount, 0));
  if (!player || getAvailableEssence(player) < cost) return null;
  const poolSpent = Math.min(getEssencePool(player), cost);
  player.essencePool = Math.max(0, getEssencePool(player) - poolSpent);
  const physicalSpent = cost - poolSpent;
  if (physicalSpent > 0) {
    player.spentEssence = Math.min(player.essence.length, toNumber(player.spentEssence, 0) + physicalSpent);
  }
  if (cost > 0) showEssenceBurst(player.id, cost, "spend");
  return { poolSpent, physicalSpent };
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

function getPhaseBeginTriggerId(phase) {
  return {
    prepare: "phase.prepare.begin",
    draw: "phase.draw.begin",
    consecration: "phase.consecration.begin",
    preparation: "phase.preparation.begin",
    combat: "phase.combat.begin",
    regroup: "phase.regroup.begin",
    discard: "phase.discard.begin"
  }[phase] || "";
}

function emitPhaseBeginEvent(game, phase, playerId = game.activePlayer) {
  const triggerId = getPhaseBeginTriggerId(phase);
  if (!triggerId) return [];
  return emitGameEvent(triggerId, {
    game,
    playerId,
    phase,
    handLimit: MAX_HAND_SIZE
  });
}

function waitForEngineStack(game, callback) {
  if (!game || game !== app.game || game.status !== "active") {
    callback?.();
    return;
  }
  if (hasBlockingEngineWork(game)) {
    window.setTimeout(() => waitForEngineStack(game, callback), 220);
    return;
  }
  callback();
}

function waitForEngineStackAsync(game) {
  return new Promise((resolve) => {
    if (!game || game !== app.game || game.status !== "active") {
      resolve();
      return;
    }
    waitForEngineStack(game, resolve);
  });
}

function setGamePhase(game, phase, playerId = game.activePlayer, force = false) {
  const phaseIndex = PHASES.indexOf(phase);
  if (phaseIndex < 0) return false;
  const changed = game.phaseIndex !== phaseIndex;
  game.phaseIndex = phaseIndex;
  if ((changed || force) && phase === "prepare") {
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

function hasBlockingEngineWork(game = app.game) {
  return Boolean(
    game &&
    game.status === "active" &&
    (
      game.stackResolving ||
      game.stack.length ||
      app.pendingEngineChoice ||
      app.pendingMoralChoice ||
      app.pendingVirtueDebug
    )
  );
}

function hasPendingEngineChoiceWork() {
  return Boolean(app.pendingEngineChoice || app.pendingMoralChoice || app.pendingVirtueDebug);
}

function hasBlockingBotWork(game = app.game) {
  return Boolean(
    hasBlockingEngineWork(game) ||
    isHumanPriorityOpen() ||
    game?.combat?.awaitingBlockers ||
    game?.combat?.resolving
  );
}

function chooseStartingPlayer() {
  return Math.random() < 0.5 ? "human" : "bot";
}

function createGame(humanDeck, botDeck, botMode, options = {}) {
  const startingPlayer = chooseStartingPlayer();
  const game = {
    id: `LOCAL-${Date.now()}-${createShuffleSeed("game").slice(-12)}`,
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
    stackResolving: false,
    effects: [],
    engineEventSeq: 0,
    engineOncePerTurn: {},
    engineTurnBudgets: {},
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
      botMode,
      virtueDebugEnabled: Boolean(options.virtueDebugEnabled)
    },
    log: []
  };
  addLog(game, `Partida iniciada: ${getDeckName(humanDeck)} contra ${getDeckName(botDeck)}.`);
  addLog(game, `Sorteio: ${currentPlayer(game).label} comeca a partida.`);
  addLog(game, "Prototipo local: compra, consagracao e combate foram aproximados das regras atuais.");
  return game;
}

function applyDeckReductionDecision(player, reserveIndexes = []) {
  if (!player?.deck?.length) return { kept: 0, reserved: 0 };
  const reserveSet = new Set(reserveIndexes.map(Number));
  const nextDeck = [];
  const movedToReserve = [];
  player.deck.forEach((cardId, index) => {
    if (reserveSet.has(index)) {
      movedToReserve.push(cardId);
    } else {
      nextDeck.push(cardId);
    }
  });
  player.deck = nextDeck;
  player.reserve.push(...movedToReserve);
  return { kept: nextDeck.length, reserved: movedToReserve.length };
}

function showPreGameReductionModal(player) {
  if (!player || player.id !== "human") return Promise.resolve([]);
  return new Promise((resolve) => {
    let overlay = document.getElementById("zoneModal");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "zoneModal";
      overlay.className = "zone-modal";
      document.body.appendChild(overlay);
    }
    const selected = new Set();
    const minDeckSize = Math.min(30, player.deck.length);
    const maxReserve = Math.max(0, player.deck.length - minDeckSize);
    app.pendingEngineChoice = { type: "pregame-reduction", title: "Redução do baralho" };

    const render = () => {
      const deckCount = player.deck.length - selected.size;
      const valid = deckCount >= minDeckSize && deckCount <= player.deck.length;
      setZoneModalVisibleForRender(overlay);
      overlay.innerHTML = `
        <div class="zone-modal-panel zone-modal-panel--pregame-reduction" role="dialog" aria-modal="true" aria-label="Redução do baralho">
          <div class="zone-modal-head">
            <div>
              <span>Pré-jogo</span>
              <b>Redução do baralho</b>
            </div>
          </div>
          <p class="zone-modal-description">Escolha até ${maxReserve} carta${maxReserve === 1 ? "" : "s"} para mover para a Reserva. O baralho de partida deve ficar com ${minDeckSize} a ${player.deck.length} cartas.</p>
          <div class="zone-modal-grid pregame-card-grid">
            ${player.deck.map((cardId, index) => {
              const card = app.cardByCode.get(cardId);
              const active = selected.has(index);
              return `
                <button class="zone-modal-card pregame-card-choice ${active ? "is-selected" : ""}" type="button" data-pregame-reduction-card="${index}" title="${escapeHtml(getCardName(card))}">
                  <img src="${escapeHtml(getCardImage(card))}" alt="${escapeHtml(getCardName(card))}" draggable="false" />
                  <span>${active ? "Reserva" : "Deck"}</span>
                </button>
              `;
            }).join("")}
          </div>
          <div class="zone-modal-actions zone-modal-actions--pregame">
            <button type="button" data-pregame-reduction-skip>Manter ${player.deck.length}</button>
            <button type="button" class="primary-action" data-pregame-reduction-confirm ${valid ? "" : "disabled"}>
              Confirmar ${deckCount}/${player.deck.length}
            </button>
          </div>
        </div>
      `;

      overlay.querySelectorAll("[data-pregame-reduction-card]").forEach((button) => {
        button.addEventListener("click", () => {
          const index = toNumber(button.dataset.pregameReductionCard, -1);
          if (selected.has(index)) {
            selected.delete(index);
          } else if (selected.size < maxReserve) {
            selected.add(index);
          }
          render();
        }, { once: true });
      });
      overlay.querySelector("[data-pregame-reduction-skip]")?.addEventListener("click", () => {
        hideModalElement(overlay);
        app.pendingEngineChoice = null;
        resolve([]);
      }, { once: true });
      overlay.querySelector("[data-pregame-reduction-confirm]")?.addEventListener("click", () => {
        if (!valid) return;
        hideModalElement(overlay);
        app.pendingEngineChoice = null;
        resolve([...selected]);
      }, { once: true });
    };

    render();
  });
}

function showPreGameMulliganModal(player, attempt) {
  if (!player || player.id !== "human") return Promise.resolve([]);
  return new Promise((resolve) => {
    let overlay = document.getElementById("zoneModal");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "zoneModal";
      overlay.className = "zone-modal";
      document.body.appendChild(overlay);
    }
    const handSnapshot = player.hand.map((cardId, index) => ({ cardId, index }));
    const selected = new Set();
    app.pendingEngineChoice = { type: "pregame-mulligan", title: "Mulligan" };

    const render = () => {
      setZoneModalVisibleForRender(overlay);
      overlay.innerHTML = `
        <div class="zone-modal-panel zone-modal-panel--pregame-mulligan" role="dialog" aria-modal="true" aria-label="Mulligan">
          <div class="zone-modal-head">
            <div>
              <span>Pré-jogo</span>
              <b>Mulligan ${attempt}/3</b>
            </div>
          </div>
          <p class="zone-modal-description">Escolha qualquer quantidade de cartas para devolver, embaralhar e comprar novamente. Você também pode manter esta mão.</p>
          <div class="zone-modal-grid pregame-card-grid">
            ${handSnapshot.map(({ cardId, index }) => {
              const card = app.cardByCode.get(cardId);
              const active = selected.has(index);
              return `
                <button class="zone-modal-card pregame-card-choice ${active ? "is-selected" : ""}" type="button" data-pregame-mulligan-card="${index}" title="${escapeHtml(getCardName(card))}">
                  <img src="${escapeHtml(getCardImage(card))}" alt="${escapeHtml(getCardName(card))}" draggable="false" />
                  <span>${active ? "Trocar" : "Manter"}</span>
                </button>
              `;
            }).join("")}
          </div>
          <div class="zone-modal-actions zone-modal-actions--pregame">
            <button type="button" data-pregame-mulligan-keep>Manter mão</button>
            <button type="button" class="primary-action" data-pregame-mulligan-confirm ${selected.size ? "" : "disabled"}>
              Mulligan (${selected.size})
            </button>
          </div>
        </div>
      `;

      overlay.querySelectorAll("[data-pregame-mulligan-card]").forEach((button) => {
        button.addEventListener("click", () => {
          const index = toNumber(button.dataset.pregameMulliganCard, -1);
          if (selected.has(index)) selected.delete(index);
          else selected.add(index);
          render();
        }, { once: true });
      });
      overlay.querySelector("[data-pregame-mulligan-keep]")?.addEventListener("click", () => {
        hideModalElement(overlay);
        app.pendingEngineChoice = null;
        resolve([]);
      }, { once: true });
      overlay.querySelector("[data-pregame-mulligan-confirm]")?.addEventListener("click", () => {
        if (!selected.size) return;
        hideModalElement(overlay);
        app.pendingEngineChoice = null;
        resolve([...selected]);
      }, { once: true });
    };

    render();
  });
}

function applyPartialMulligan(player, selectedIndexes, game, attempt) {
  const selected = new Set(selectedIndexes.map(Number));
  if (!player || !selected.size) return 0;
  const returned = [];
  player.hand = player.hand.filter((cardId, index) => {
    if (!selected.has(index)) return true;
    returned.push(cardId);
    return false;
  });
  if (!returned.length) return 0;
  player.deck.push(...returned);
  player.deck = shuffle(player.deck, createShuffleSeed(`${game.id}-${player.id}-mulligan-${attempt}`));
  drawCards(player, returned.length);
  return returned.length;
}

async function runPregameProcedures(game) {
  if (!game) return;
  const human = game.players.human;
  const bot = game.players.bot;
  const reserveIndexes = await showPreGameReductionModal(human);
  const humanReduction = applyDeckReductionDecision(human, reserveIndexes);
  const botReduction = applyDeckReductionDecision(bot, []);
  addLog(game, `reduziu o baralho para ${humanReduction.kept} carta${humanReduction.kept === 1 ? "" : "s"} e ${humanReduction.reserved} na Reserva.`, human.label);
  addLog(game, `manteve ${botReduction.kept} carta${botReduction.kept === 1 ? "" : "s"} no baralho principal.`, bot.label);
  human.deck = shuffle(human.deck, createShuffleSeed(`${game.id}-human-pregame-shuffle`));
  bot.deck = shuffle(bot.deck, createShuffleSeed(`${game.id}-bot-pregame-shuffle`));
  drawCards(human, INITIAL_HAND_SIZE);
  drawCards(bot, INITIAL_HAND_SIZE);
  renderGame();

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const selected = await showPreGameMulliganModal(human, attempt);
    if (!selected.length) break;
    const changed = applyPartialMulligan(human, selected, game, attempt);
    addLog(game, `realizou mulligan parcial com ${changed} carta${changed === 1 ? "" : "s"}.`, human.label);
    renderGame();
  }
}

function beginTurn(game) {
  const player = currentPlayer(game);
  game.turnsElapsed = toNumber(game.turnsElapsed, 0) + 1;
  game.engineOncePerTurn = {};
  game.engineTurnBudgets = {};
  Object.values(game.players).forEach((turnPlayer) => {
    turnPlayer.territoryDamageTakenThisTurn = 0;
    turnPlayer.characterDamageTakenThisTurn = 0;
    turnPlayer.cardsPlayedThisTurn = 0;
    clearEssencePool(turnPlayer);
  });
  player.spentEssence = 0;
  player.consecratedThisTurn = false;
  player.consecrationActionTaken = false;
  player.drewThisTurn = false;
  player.combatDeclaredThisTurn = false;
  player.championCovered = false;
  player.battlefield.forEach((instance) => {
    if (!isCowardiceReadyLocked(player, instance)) {
      instance.exhausted = false;
    }
    instance.declaredAttacker = false;
  });
  emitGameEvent("turn.begin", {
    game,
    playerId: player.id,
    turnNumber: game.turnNumber
  });
  game.combat = createCombatState();
  setGamePhase(game, "prepare", player.id, true);
  renderGame();
  setTimeout(() => {
    waitForPrepareDebug(game, player.id, () => {
      if (!app.game || app.game !== game || game.status !== "active" || game.activePlayer !== player.id) return;
      if (currentPhase(game) !== "prepare") return;
      emitPhaseBeginEvent(game, "prepare", player.id);
      addLog(game, `preparou permanentes e Essencias.`, player.label);
      renderGame();
      waitForEngineStack(game, () => {
        if (!app.game || app.game !== game || game.status !== "active" || game.activePlayer !== player.id) return;
        if (currentPhase(game) !== "prepare") return;
        if (player.id === game.startingPlayer && !game.openingDrawSkipped) {
          game.openingDrawSkipped = true;
          player.drewThisTurn = true;
          setGamePhase(game, "consecration", player.id);
          emitPhaseBeginEvent(game, "consecration", player.id);
          addLog(game, "nao comprou no primeiro turno da partida.", player.label);
          addLog(game, `entrou em ${PHASE_LABELS.consecration}.`, player.label);
          renderGame();
          return;
        }
        setGamePhase(game, "draw", player.id);
        emitPhaseBeginEvent(game, "draw", player.id);
        addLog(game, `entrou em ${PHASE_LABELS.draw}.`, player.label);
        renderGame();
        setTimeout(() => {
          if (!app.game || app.game !== game || game.status !== "active" || game.activePlayer !== player.id) return;
          if (currentPhase(game) !== "draw") return;
          waitForEngineStack(game, () => {
            if (!app.game || app.game !== game || game.status !== "active" || game.activePlayer !== player.id) return;
            if (currentPhase(game) !== "draw") return;
            void applyDraw(player.id).then((applied) => {
              if (applied && app.game === game) renderGame();
            });
          });
        }, 1900);
      });
    });
  }, 1800);
}

async function startGame() {
  if (!app.setupAssetsReady) return;
  if (app.startingGame) return;
  app.startingGame = true;
  const humanDeck = getDeckOption(els.humanDeckSelect.value);
  const botDeck = app.decks.find((deck) => deck.id === els.botDeckSelect.value);
  const humanError = validateDeck(humanDeck);
  const botError = validateDeck(botDeck);
  if (humanError || botError) {
    updateSetupStatus();
    app.startingGame = false;
    return;
  }

  try {
    app.lastConfig = {
      humanDeckId: humanDeck.id,
      botDeckId: botDeck.id,
      botMode: els.botModeSelect.value,
      virtueDebugEnabled: app.isLocalDebugHost && app.virtueDebugEnabled
    };
    writePlayStorage(app.lastConfig);
    app.game = createGame(humanDeck, botDeck, els.botModeSelect.value, {
      virtueDebugEnabled: app.isLocalDebugHost && app.virtueDebugEnabled
    });
    app.selected = null;
    app.expandedTemplePlayer = "";
    app.resultViewingBoard = false;
    app.territorySnapshot.clear();
    clearHumanAutoPass();
    collapseHand();
    clearTransientOverlays();
    els.setupView.classList.add("is-hidden");
    els.gameView.classList.remove("is-hidden");
    renderGame();
    await runPregameProcedures(app.game);
    emitGameEvent("game.start", { game: app.game });
    beginTurn(app.game);
    playTone("shuffle");
    window.setTimeout(() => playTone("start"), 180);
    renderGame();
    if (app.game.activePlayer === "bot") scheduleBotTurn(app.game);
  } finally {
    app.startingGame = false;
  }
}

function showSetup() {
  app.game = null;
  app.selected = null;
  app.expandedTemplePlayer = "";
  app.resultViewingBoard = false;
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
  return app.game &&
    app.game.status === "active" &&
    app.game.activePlayer === playerId &&
    !hasBlockingEngineWork(app.game);
}

function getPriorityKey(game, key) {
  return `${game.id}:${game.turnNumber}:${game.activePlayer}:${currentPhase(game)}:${key}`;
}

function isHumanPriorityOpen() {
  return Boolean(app.priority?.waiting && app.priority.game === app.game && app.game?.status === "active");
}

function isPureEssenceGeneratorAbility(ability) {
  if (!ability) return false;
  if ((ability.tags || []).includes("essence_generator")) return true;
  const actions = ability.actions || [];
  return actions.length > 0 && actions.every((action) => action?.effect === "generate_essence");
}

const PRIORITY_ABILITY_MARKERS = new Set([
  "INESPERADO",
  "INSTANT",
  "PRIORIDADE",
  "PRIORITY",
  "REATIVO",
  "REACTION",
  "RESPOSTA",
  "RESPONSE"
]);

function abilityCanUsePriorityTiming(ability) {
  if (!ability) return false;
  const markers = [
    ability.timing,
    ability.speed,
    ability.window,
    ...(ability.tags || [])
  ];
  return markers.some((marker) => PRIORITY_ABILITY_MARKERS.has(normalizeKeywordText(marker)));
}

function hasNonGeneratorPermanentAction(player, options = {}) {
  if (!player) return false;
  const includeEquipment = options.includeEquipment !== false;
  if (canUseChampionAction(player)) return true;
  return player.battlefield.some((instance) => (
    getViableActivatedAbilitiesForPermanent(player, instance)
      .some(({ ability }) => !isPureEssenceGeneratorAbility(ability)) ||
    (includeEquipment && canAttachEquipmentFromBattlefield(player, instance))
  ));
}

function hasHumanPriorityPermanentAction(game = app.game) {
  const human = game?.players?.human;
  if (!human) return false;
  const hasPriorityAbility = (entries) => entries.some(({ ability }) => (
    !isPureEssenceGeneratorAbility(ability) && abilityCanUsePriorityTiming(ability)
  ));
  if (hasPriorityAbility(getViableActivatedAbilitiesForChampion(human))) return true;
  return human.battlefield.some((instance) => (
    hasPriorityAbility(getViableActivatedAbilitiesForPermanent(human, instance))
  ));
}

function hasHumanPriorityPlay(game = app.game) {
  if (!game || game.status !== "active") return false;
  if (hasPendingEngineChoiceWork()) return false;
  if (game.combat.awaitingBlockers || game.combat.resolving) return false;
  if (hasHumanPriorityPermanentAction(game)) {
    return true;
  }
  return game.players.human.hand.some((cardId) => canPlayCardInPriorityWindow(game.players.human, cardId, game));
}

function cardCanUseMiracleTiming(card) {
  return getCardTypeCode(card) === "MIL" || cardHasKeyword(card, "INESPERADO");
}

function canPlayCardInPriorityWindow(player, cardId, game = app.game) {
  if (!game || !player?.hand?.includes(cardId)) return false;
  const card = app.cardByCode.get(cardId);
  if (!cardCanUseMiracleTiming(card)) return false;
  const hasWindow = isHumanPriorityOpen() || game.stack.length > 0 || ["combat", "regroup"].includes(currentPhase(game));
  if (!hasWindow) return false;
  if (getEffectivePlayCost(player, card) > getPotentialAvailableEssence(player)) return false;
  return canResolveCardWhenPlayed(cardId, player.id);
}

function hasPlayableCardInCurrentActionWindow(player, game = app.game) {
  if (!game || game.status !== "active" || !player) return false;
  if (player.id === "human" && isHumanPriorityOpen()) {
    return player.hand.some((cardId) => canPlayCardInPriorityWindow(player, cardId, game));
  }
  if (game.activePlayer !== player.id) return false;
  return player.hand.some((cardId) => canPlayCard(player, cardId));
}

function hasHumanEssenceGeneratorPurpose(player, game = app.game) {
  if (!player || player.id !== "human") return true;
  return hasPlayableCardInCurrentActionWindow(player, game) || hasNonGeneratorPermanentAction(player);
}

function requestHumanPriority(game, key, label, resume) {
  if (!game || game.status !== "active") return false;
  const passKey = getPriorityKey(game, key);
  if (game.priorityPasses[passKey] || !hasHumanPriorityPlay(game)) return false;
  game.combat.step = getPriorityStepLabel(key);
  app.priority = { game, key: passKey, label, resume, waiting: true };
  emitGameEvent("priority.window_opened", {
    game,
    playerId: "human",
    reason: label
  });
  addLog(game, label, "Prioridade");
  renderGame();
  schedulePriorityAutoPass(game);
  return true;
}

function requestOrContinueHumanPriority(game, key, label, resume) {
  if (hasBlockingEngineWork(game)) {
    waitForEngineStack(game, () => requestOrContinueHumanPriority(game, key, label, resume));
    return;
  }
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
  const priorityOpen = isHumanPriorityOpen();
  if (!priorityOpen && hasBlockingEngineWork(app.game)) return false;
  if (!player.hand.includes(cardId)) return false;
  const card = app.cardByCode.get(cardId);
  const phase = currentPhase(app.game);
  const typeCode = getCardTypeCode(card);
  const isOwnTurn = app.game.activePlayer === player.id;
  const canResolve = canResolveCardWhenPlayed(cardId, player.id);
  if (!canResolve) return false;

  if (priorityOpen) {
    return app.priority?.game === app.game &&
      player.id === "human" &&
      cardCanUseMiracleTiming(card) &&
      canPlayCardInPriorityWindow(player, cardId, app.game);
  }

  if (!isOwnTurn) return false;

  if (phase === "preparation") {
    if (typeCode === "PEC") return true;
    return getEffectivePlayCost(player, card) <= getPotentialAvailableEssence(player);
  }

  if ((phase === "combat" || phase === "regroup") && cardCanUseMiracleTiming(card)) {
    return getEffectivePlayCost(player, card) <= getPotentialAvailableEssence(player);
  }

  return false;
}

function canBotSurviveSinCost(bot, cardId) {
  const card = app.cardByCode.get(cardId);
  if (getCardTypeCode(card) !== "PEC") return true;
  return bot.territoryDamage + getCost(card) < bot.maxTerritory;
}

function isIncenseTokenCard(card) {
  return card?.code === "TOKEN-INCENSE" || normalizeKeywordText(getCardName(card)) === "INCENSO";
}

function isBethlehemPastorCard(card) {
  return card?.code === "FND-PER-013" || cardHasEngineTag(card, "essence_generator");
}

function isEssenceGeneratorInstance(instance) {
  const card = app.cardByCode.get(instance?.cardId);
  return isIncenseTokenCard(card) || isBethlehemPastorCard(card);
}

function isEquipmentCard(card) {
  if (!card || card.token || isIncenseTokenCard(card)) return false;
  if (Object.values(EQUIPMENT_IDS).includes(card.code)) return true;
  return getCardTypeCode(card) === "ART" && normalizeKeywordText(card.text).includes("EQUIPAVEL");
}

function isEquipmentInstance(instance) {
  return isEquipmentCard(app.cardByCode.get(instance?.cardId));
}

function findBattlefieldEntryByUid(game, uid) {
  if (!game || !uid) return null;
  for (const player of Object.values(game.players)) {
    const instance = findBattlefieldInstance(player, uid);
    if (instance) return { playerId: player.id, player, instance };
  }
  return null;
}

function getAttachedEquipmentInstances(instance, game = app.game) {
  if (!instance || !game) return [];
  return Object.values(game.players)
    .flatMap((player) => player.battlefield.map((equipment) => ({ player, equipment })))
    .filter(({ equipment }) => isEquipmentInstance(equipment) && equipment.attachedTo === instance.uid)
    .map(({ player, equipment }) => ({ playerId: player.id, player, instance: equipment }));
}

function isCharacterEquipped(instance, game = app.game) {
  return getAttachedEquipmentInstances(instance, game).length > 0;
}

function getEquipmentAttachmentTarget(equipment, game = app.game) {
  if (!equipment?.attachedTo) return null;
  return findBattlefieldEntryByUid(game, equipment.attachedTo);
}

function cardRejectsEquipment(card) {
  const text = normalizeKeywordText(card?.text);
  return cardHasEngineTag(card, "reject_equipment") || text.includes("NAO PODE TER EQUIPAMENTOS ANEXADOS");
}

function canAttachEquipmentTo(equipment, target, equipmentControllerId = "", targetControllerId = equipmentControllerId) {
  if (!equipment || !target || equipment.uid === target.uid) return false;
  const equipmentCard = app.cardByCode.get(equipment.cardId);
  const targetCard = app.cardByCode.get(target.cardId);
  if (!isEquipmentCard(equipmentCard)) return false;
  if (getCardTypeCode(targetCard) !== "PER") return false;
  if (equipmentControllerId && targetControllerId && equipmentControllerId !== targetControllerId) return false;
  if (cardRejectsEquipment(targetCard)) return false;
  if (equipment.cardId === EQUIPMENT_IDS.sword && equipment.attachedTo !== target.uid && getCharacterPower(target) < 4) return false;
  return true;
}

function detachEquipmentInstance(equipment) {
  if (!equipment?.attachedTo) return false;
  equipment.attachedTo = "";
  return true;
}

function attachEquipmentTo(game, equipmentRef, targetRef) {
  if (!game || !equipmentRef?.instance || !targetRef?.instance) return false;
  if (!canAttachEquipmentTo(equipmentRef.instance, targetRef.instance, equipmentRef.playerId, targetRef.playerId)) return false;
  equipmentRef.instance.attachedTo = targetRef.instance.uid;
  const equipmentCard = app.cardByCode.get(equipmentRef.instance.cardId);
  const targetCard = app.cardByCode.get(targetRef.instance.cardId);
  addLog(game, `${getCardName(equipmentCard)} foi anexado a ${getCardName(targetCard)}.`, getPlayer(game, equipmentRef.playerId)?.label || "Engine");
  enforceEquipmentState(game);
  return true;
}

function cleanupAttachmentsForLeaving(game, uid) {
  if (!game || !uid) return;
  Object.values(game.players).forEach((player) => {
    player.battlefield.forEach((instance) => {
      if (instance.uid === uid && isEquipmentInstance(instance)) instance.attachedTo = "";
      if (isEquipmentInstance(instance) && instance.attachedTo === uid) instance.attachedTo = "";
    });
  });
}

function enforceEquipmentState(game = app.game) {
  if (!game) return;
  Object.values(game.players).forEach((player) => {
    player.battlefield.forEach((equipment) => {
      if (!isEquipmentInstance(equipment) || !equipment.attachedTo) return;
      const targetRef = findBattlefieldEntryByUid(game, equipment.attachedTo);
      if (!targetRef || !canAttachEquipmentTo(equipment, targetRef.instance, player.id, targetRef.playerId)) {
        const card = app.cardByCode.get(equipment.cardId);
        equipment.attachedTo = "";
        addLog(game, `${getCardName(card)} foi desanexado por regra de estado.`, player.label);
      }
    });
  });
}

function getEquipmentStatBonusForCharacter(instance) {
  const bonuses = { power: 0, resistance: 0 };
  if (!instance) return bonuses;
  if (instance.cardId === "FND-PER-001" && isCharacterEquipped(instance)) {
    bonuses.power += 1;
  }
  getAttachedEquipmentInstances(instance).forEach(({ instance: equipment }) => {
    if (equipment.cardId === EQUIPMENT_IDS.sword) {
      bonuses.power += 2;
    }
    if (equipment.cardId === EQUIPMENT_IDS.crown) {
      bonuses.power += 2;
      bonuses.resistance += 2;
    }
  });
  return bonuses;
}

function getEquipmentGrantedKeywords(instance) {
  const keywords = [];
  getAttachedEquipmentInstances(instance).forEach(({ instance: equipment }) => {
    if (equipment.cardId === EQUIPMENT_IDS.sword) keywords.push("SOBREPUJAR");
  });
  return keywords;
}

function canActivateEssenceGenerator(player, uid) {
  const game = app.game;
  if (!game || game.status !== "active" || !player || hasBlockingEngineWork(game)) return false;
  if (game.combat.awaitingBlockers || game.combat.resolving) return false;
  const instance = player.battlefield.find((item) => item.uid === uid);
  if (!instance || instance.exhausted || !isEssenceGeneratorInstance(instance)) return false;
  const card = app.cardByCode.get(instance.cardId);
  if (!isIncenseTokenCard(card)) return false;
  const phase = currentPhase(game);
  const hasTurnAccess = game.activePlayer === player.id && ["preparation", "combat", "regroup"].includes(phase);
  const hasPriorityAccess = player.id === "human" && isHumanPriorityOpen();
  if (!hasTurnAccess && !hasPriorityAccess) return false;
  if (player.id === "human" && isBethlehemPastorCard(card) && phase === "combat" && !hasPriorityAccess) return false;
  if (player.id === "human" && !hasHumanEssenceGeneratorPurpose(player, game)) return false;
  return true;
}

function removeBattlefieldInstance(player, uid) {
  const index = player?.battlefield?.findIndex((instance) => instance.uid === uid) ?? -1;
  if (index < 0) return null;
  const [instance] = player.battlefield.splice(index, 1);
  return instance || null;
}

function consumeIncenseTokenInstance(player, uid) {
  const instance = player?.battlefield?.find((item) => item.uid === uid);
  if (!instance || !isIncenseTokenInstance(instance)) return null;
  const quantity = getTokenQuantity(instance);
  if (quantity > 1) {
    instance.tokenQuantity = quantity - 1;
    return { instance, removed: false };
  }
  const removed = removeBattlefieldInstance(player, uid);
  return removed ? { instance: removed, removed: true } : null;
}

function applyActivateEssenceGenerator(playerId, uid) {
  const game = app.game;
  const player = getPlayer(game, playerId);
  if (!canActivateEssenceGenerator(player, uid)) return false;
  const instance = player.battlefield.find((item) => item.uid === uid);
  const card = app.cardByCode.get(instance.cardId);
  const isIncense = isIncenseTokenCard(card);
  if (isIncense) {
    const consumed = consumeIncenseTokenInstance(player, uid);
    if (!consumed) return false;
    emitGameEvent("permanent.leaves_battlefield", {
      game,
      playerId,
      instanceUid: consumed.instance.uid,
      cardId: consumed.instance.cardId,
      destination: "void"
    });
    addLog(game, `renunciou ${getCardName(card)}.`, player.label);
  } else {
    instance.exhausted = true;
  }
  generateEssence(player, 1, { animate: false });
  showEssenceBurst(player.id, 1, "gain", uid);
  addLog(game, `${getCardName(card)} gerou 1 {E}.`, player.label);
  playTone("soft");
  return true;
}

function activateEssenceGeneratorForPayment(player, instance) {
  const game = app.game;
  if (!game || !player || !instance || instance.exhausted || !isEssenceGeneratorInstance(instance)) return false;
  const card = app.cardByCode.get(instance.cardId);
  const isIncense = isIncenseTokenCard(card);
  if (isIncense) {
    const consumed = consumeIncenseTokenInstance(player, instance.uid);
    if (!consumed) return false;
    emitGameEvent("permanent.leaves_battlefield", {
      game,
      playerId: player.id,
      instanceUid: consumed.instance.uid,
      cardId: consumed.instance.cardId,
      destination: "void"
    });
    addLog(game, `renunciou ${getCardName(card)} para pagar custos.`, player.label);
  } else {
    instance.exhausted = true;
    addLog(game, `despreparou ${getCardName(card)} para pagar custos.`, player.label);
  }
  generateEssence(player, 1, { animate: false });
  showEssenceBurst(player.id, 1, "gain", instance.uid);
  playTone("soft");
  return true;
}

function getPermanentAbilitySource(player, instance) {
  const card = app.cardByCode.get(instance?.cardId);
  if (!player || !instance || !card) return null;
  return {
    sourceType: "card",
    sourceId: instance.cardId,
    zone: "battlefield",
    controllerId: player.id,
    instanceUid: instance.uid,
    cardId: instance.cardId,
    label: getCardName(card),
    icon: getCardArt(card)
  };
}

function getChampionAbilitySource(player) {
  const cardId = player?.identity?.champion;
  const card = app.cardByCode.get(cardId);
  if (!player || !cardId || !card) return null;
  return {
    sourceType: "card",
    sourceId: cardId,
    zone: "identity",
    identityKind: "champion",
    controllerId: player.id,
    cardId,
    label: getCardName(card),
    icon: getCardArt(card)
  };
}

function getActivatedAbilitiesForPermanent(player, instance) {
  const source = getPermanentAbilitySource(player, instance);
  if (!source) return [];
  return findAbilityLinksForSource(source)
    .map((link) => app.engine.abilityById.get(link.abilityId))
    .filter((ability) => ability?.kind === "activated")
    .map((ability) => ({ ability, source }));
}

function getActivatedAbilitiesForChampion(player) {
  const source = getChampionAbilitySource(player);
  if (!source) return [];
  return findAbilityLinksForSource(source)
    .map((link) => app.engine.abilityById.get(link.abilityId))
    .filter((ability) => ability?.kind === "activated")
    .map((ability) => ({ ability, source }));
}

function createActivatedStackObject(game, ability, source) {
  return createEngineStackObject(game, { id: "activated.ability" }, ability, source, {
    game,
    playerId: source.controllerId,
    activated: true
  });
}

function getViableActivatedAbilitiesForPermanent(player, instance) {
  if (!player || !instance) return [];
  return getActivatedAbilitiesForPermanent(player, instance)
    .map(({ ability, source }) => ({ ability, source, stackObject: createActivatedStackObject(app.game, ability, source) }))
    .filter(({ ability, source, stackObject }) => evaluateAbilityCondition(ability, source, stackObject?.payload || {}))
    .filter(({ stackObject }) => isEngineStackObjectViable(stackObject));
}

function getViableActivatedAbilitiesForChampion(player) {
  if (!player || player.championCovered) return [];
  return getActivatedAbilitiesForChampion(player)
    .map(({ ability, source }) => ({ ability, source, stackObject: createActivatedStackObject(app.game, ability, source) }))
    .filter(({ ability, source, stackObject }) => evaluateAbilityCondition(ability, source, stackObject?.payload || {}))
    .filter(({ stackObject }) => isEngineStackObjectViable(stackObject));
}

function hasBlockingActionSelectionWork(game, player) {
  if (!game || game.status !== "active") return true;
  if (hasPendingEngineChoiceWork()) return true;
  if (player?.id === "human" && isHumanPriorityOpen()) return false;
  return Boolean(game.stackResolving || game.stack.length);
}

function canUseChampionAction(player) {
  const game = app.game;
  if (!player || !game || game.status !== "active" || player.championCovered || hasBlockingActionSelectionWork(game, player)) return false;
  if (game.combat.awaitingBlockers || game.combat.resolving) return false;
  const phase = currentPhase(game);
  const hasTurnAccess = game.activePlayer === player.id && ["preparation", "combat", "regroup"].includes(phase);
  const hasPriorityAccess = player.id === "human" && isHumanPriorityOpen();
  if (!hasTurnAccess && !hasPriorityAccess) return false;
  return getViableActivatedAbilitiesForChampion(player).length > 0;
}

function canReequipEquipmentTo(equipment, target, equipmentControllerId = "", targetControllerId = equipmentControllerId) {
  return canAttachEquipmentTo(equipment, target, equipmentControllerId, targetControllerId) && !target?.exhausted;
}

function canAttachEquipmentFromBattlefield(player, instance) {
  if (!player || !instance || !isEquipmentInstance(instance)) return false;
  const game = app.game;
  if (!game || game.activePlayer !== player.id || currentPhase(game) !== "preparation") return false;
  if (isHumanPriorityOpen() || game.stackResolving || game.stack.length) return false;
  return player.battlefield.some((target) => (
    target.uid !== instance.uid && canReequipEquipmentTo(instance, target, player.id, player.id)
  ));
}

function canUsePermanentAction(player, instance) {
  if (!player || !instance) return false;
  if (canActivateEssenceGenerator(player, instance.uid)) return true;
  const game = app.game;
  if (!game || game.status !== "active" || hasBlockingActionSelectionWork(game, player)) return false;
  if (game.combat.awaitingBlockers || game.combat.resolving) return false;
  const phase = currentPhase(game);
  const hasTurnAccess = game.activePlayer === player.id && ["preparation", "combat", "regroup"].includes(phase);
  const hasPriorityAccess = player.id === "human" && isHumanPriorityOpen();
  if (!hasTurnAccess && !hasPriorityAccess) return false;
  const viableAbilities = getViableActivatedAbilitiesForPermanent(player, instance);
  if (viableAbilities.length) {
    const generatorOnly = viableAbilities.every(({ ability }) => isPureEssenceGeneratorAbility(ability));
    if (player.id === "human" && generatorOnly && !hasHumanEssenceGeneratorPurpose(player, game)) return false;
    return true;
  }
  return canAttachEquipmentFromBattlefield(player, instance);
}

function getChampionCoverCostIndex(stackObject) {
  if (stackObject?.source?.identityKind !== "champion") return -1;
  const ability = stackObject.ability || app.engine.abilityById.get(stackObject.abilityId);
  return (ability?.costs || []).findIndex((cost) => cost?.effect === "cover_champion");
}

function payChampionCoverCostOnActivation(game, stackObject) {
  const costIndex = getChampionCoverCostIndex(stackObject);
  if (costIndex < 0) return true;
  const ability = stackObject.ability || app.engine.abilityById.get(stackObject.abilityId);
  const cost = ability?.costs?.[costIndex];
  const player = getPlayer(game, getStackPlayerId(cost?.player || "controller", stackObject));
  if (!player || player.championCovered) return false;
  player.championCovered = true;
  stackObject.activationPaidCostIndexes = [
    ...new Set([...(stackObject.activationPaidCostIndexes || []), costIndex])
  ];
  addLog(game, "encobriu seu Campeao.", player.label);
  playTone("soft");
  return true;
}

function queueActivatedAbility(stackObject) {
  const game = app.game;
  if (!game || !stackObject) return false;
  const ability = stackObject.ability || app.engine.abilityById.get(stackObject.abilityId);
  if (!payChampionCoverCostOnActivation(game, stackObject)) {
    showInteractionHint("Campeao ja esta encoberto.");
    renderGame();
    return false;
  }
  if (ability?.usesStack === false) {
    void resolveEngineStackObject(game, stackObject).then(() => {
      if (app.game === game) renderGame();
    });
    return true;
  }
  game.stack.push(stackObject);
  addLog(game, `${stackObject.label} foi colocada na pilha.`, "Pilha");
  emitGameEvent("stack.object_added", { game, stackObject }, { resolveImmediately: true });
  renderGame();
  scheduleStackResolution(game);
  return true;
}

async function chooseEquipmentAttachmentTarget(player, equipment, options = {}) {
  const requiresPrepared = Boolean(options.requiresPrepared);
  const refs = player.battlefield
    .filter((target) => requiresPrepared
      ? canReequipEquipmentTo(equipment, target, player.id, player.id)
      : canAttachEquipmentTo(equipment, target, player.id, player.id))
    .map((instance) => ({ playerId: player.id, instance }));
  if (!refs.length) return null;
  if (player.id !== "human") return chooseBotEngineTargetRef(refs, "attach");
  return showEngineTargetChoiceModal({
    title: "Anexar equipamento",
    description: requiresPrepared
      ? `Escolha um Personagem preparado para despreparar e anexar ${getCardName(app.cardByCode.get(equipment.cardId))}.`
      : `Escolha um Personagem para anexar ${getCardName(app.cardByCode.get(equipment.cardId))}.`,
    refs,
    kind: "attach",
    visualOnly: true,
    showStats: true,
    allowCancel: true,
    autoSelectSingle: false
  });
}

async function promptEquipmentAttachmentOnEntry(game, playerId, equipment) {
  await wait(playerId === "human" ? 240 : 420);
  if (!app.game || app.game !== game || game.status !== "active") return;
  const player = getPlayer(game, playerId);
  const liveEquipment = findBattlefieldInstance(player, equipment?.uid);
  if (!player || !liveEquipment || !isEquipmentInstance(liveEquipment) || liveEquipment.attachedTo) return;
  const target = await chooseEquipmentAttachmentTarget(player, liveEquipment);
  if (!app.game || app.game !== game || game.status !== "active") return;
  const currentEquipment = findBattlefieldInstance(player, liveEquipment.uid);
  if (!target || !currentEquipment || currentEquipment.attachedTo) {
    renderGame();
    return;
  }
  attachEquipmentTo(game, { playerId, instance: currentEquipment }, target);
  renderGame();
}

async function applyAttachEquipmentToTarget(playerId, equipmentUid, targetUid) {
  const game = app.game;
  const player = getPlayer(game, playerId);
  if (!player || (!canAct(playerId) && !isHumanPriorityOpen())) return false;
  const equipment = findBattlefieldInstance(player, equipmentUid);
  const target = findBattlefieldInstance(player, targetUid);
  if (!equipment || !target) return false;
  const attached = attachEquipmentTo(game, { playerId, instance: equipment }, { playerId, instance: target });
  if (attached) renderGame();
  return attached;
}

function showChampionAbilityChoiceModal(player, activations) {
  const options = (activations || []).filter((activation) => activation?.stackObject);
  if (!options.length) return Promise.resolve(null);
  if (options.length === 1) return Promise.resolve(options[0]);
  return new Promise((resolve) => {
    let overlay = document.getElementById("zoneModal");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "zoneModal";
      overlay.className = "zone-modal";
      document.body.appendChild(overlay);
    }
    const champion = app.cardByCode.get(player.identity.champion);
    app.pendingEngineChoice = { type: "champion-ability", title: "Habilidade de Campeão" };
    setZoneModalVisibleForRender(overlay);
    overlay.innerHTML = `
      <div class="zone-modal-panel zone-modal-panel--engine-choice" role="dialog" aria-modal="true" aria-label="Habilidade de Campeão">
        <div class="zone-modal-head">
          <div>
            <span>Campeão</span>
            <b>${escapeHtml(getCardName(champion))}</b>
          </div>
        </div>
        <div class="zone-modal-actions zone-modal-actions--choice">
          ${options.map(({ stackObject }, index) => `
            <button type="button" data-champion-ability-choice="${index}">
              <strong>${escapeHtml(stackObject.label)}</strong>
              <small>${escapeHtml(getStackObjectEffectDescription(stackObject))}</small>
            </button>
          `).join("")}
        </div>
      </div>
    `;
    decorateDecisionModal(overlay);
    overlay.querySelectorAll("[data-champion-ability-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        closeDecisionModal(overlay);
        app.pendingEngineChoice = null;
        resolve(options[toNumber(button.dataset.championAbilityChoice, 0)] || null);
      }, { once: true });
    });
  });
}

async function applyActivatePermanentAction(playerId, uid) {
  const game = app.game;
  const player = getPlayer(game, playerId);
  if (!player) return false;
  if (canActivateEssenceGenerator(player, uid)) return applyActivateEssenceGenerator(playerId, uid);
  const instance = findBattlefieldInstance(player, uid);
  if (!canUsePermanentAction(player, instance)) return false;
  const activated = getViableActivatedAbilitiesForPermanent(player, instance)[0];
  if (activated?.stackObject) {
    return queueActivatedAbility(activated.stackObject);
  }
  if (isEquipmentInstance(instance)) {
    const target = await chooseEquipmentAttachmentTarget(player, instance, { requiresPrepared: true });
    if (!target) return false;
    const liveTarget = findBattlefieldInstance(player, target.instance?.uid);
    if (!liveTarget || !canReequipEquipmentTo(instance, liveTarget, playerId, playerId)) return false;
    liveTarget.exhausted = true;
    addLog(game, `${getCardName(app.cardByCode.get(liveTarget.cardId))} foi despreparado para equipar.`, player.label);
    const attached = attachEquipmentTo(game, { playerId, instance }, { playerId, instance: liveTarget });
    if (attached) renderGame();
    return attached;
  }
  return false;
}

async function applyActivateChampionAction(playerId) {
  const game = app.game;
  const player = getPlayer(game, playerId);
  if (!canUseChampionAction(player)) return false;
  const activations = getViableActivatedAbilitiesForChampion(player);
  const activated = player.id === "human"
    ? await showChampionAbilityChoiceModal(player, activations)
    : activations[0];
  if (!activated?.stackObject) return false;
  return queueActivatedAbility(activated.stackObject);
}

function isBotChampionActivationAcceptable(player, stackObject) {
  const remainingTerritory = Math.max(0, toNumber(player?.maxTerritory, 0) - toNumber(player?.territoryDamage, 0));
  const actions = [
    ...(stackObject?.ability?.costs || []),
    ...(stackObject?.ability?.actions || [])
  ];
  return !actions.some((action) => {
    if (action?.effect !== "deal_damage") return false;
    const amount = getActionAmount(action.amount, 0);
    const refs = getEngineTargetRefs(action.target, stackObject, { ignoreCount: true });
    return refs.some((ref) => ref.territory && ref.playerId === player.id && amount >= remainingTerritory);
  });
}

function activateBotChampionIfUseful(player) {
  if (!player || player.id !== "bot" || !canUseChampionAction(player)) return false;
  const activated = getViableActivatedAbilitiesForChampion(player)
    .find(({ stackObject }) => isBotChampionActivationAcceptable(player, stackObject));
  if (!activated?.stackObject) return false;
  return queueActivatedAbility(activated.stackObject);
}

function isDamagedCharacterInstance(instance) {
  const card = app.cardByCode.get(instance?.cardId);
  return getCardTypeCode(card) === "PER" && toNumber(instance?.damage, 0) > 0;
}

function isCowardiceReadyLocked(player, instance) {
  return getVirtueValue(player, VIRTUE_IDS.cowardice) === 4 && isDamagedCharacterInstance(instance);
}

function canAttackWith(player, uid) {
  if (currentPhase(app.game) !== "combat") return false;
  const instance = player.battlefield.find((item) => item.uid === uid);
  if (!instance || instance.exhausted || instance.declaredAttacker) return false;
  if (getVirtueValue(player, VIRTUE_IDS.cowardice) === 3 && isDamagedCharacterInstance(instance)) return false;
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
  const keywordDefinition = app.engine.keywordById.get(normalizedKeyword);
  const accepted = new Set([
    normalizedKeyword,
    ...(keywordDefinition ? [keywordDefinition.id, ...(keywordDefinition.aliases || [])].map(normalizeKeywordText) : [])
  ]);
  return normalizeKeywordText(card?.text)
    .split(/\n/)
    .flatMap((line) => line.split(/[,;]/))
    .map((part) => part.trim())
    .some((part) => accepted.has(part));
}

function instanceHasKeyword(instance, keyword) {
  const card = app.cardByCode.get(instance?.cardId);
  if (cardHasKeyword(card, keyword)) return true;
  const normalizedKeyword = normalizeKeywordText(keyword);
  if (getEquipmentGrantedKeywords(instance).some((granted) => normalizeKeywordText(granted) === normalizedKeyword)) return true;
  return (app.game?.effects || []).some((effect) =>
    effect.type === "keyword" &&
    normalizeKeywordText(effect.keyword) === normalizedKeyword &&
    effectTargetsInstance(effect, instance)
  );
}

function effectTargetsInstance(effect, instance) {
  if (!effect?.target || !instance) return false;
  if (effect.target.uid !== instance.uid) return false;
  if (!effect.target.playerId) return true;
  const controller = getInstanceController(instance);
  return effect.target.playerId === instance.owner || effect.target.playerId === controller?.id;
}

function getInstanceController(instance) {
  if (!instance || !app.game) return null;
  return getInstanceControllerInGame(app.game, instance.uid);
}

function getInstanceControllerInGame(game, uid) {
  if (!game || !uid) return null;
  return Object.values(game.players).find((player) => player.battlefield.some((item) => item.uid === uid)) || null;
}

function hasDaviKingStaticBuff(player, instance) {
  if (!player || !instance) return false;
  return player.battlefield.some((item) => item.uid !== instance.uid && item.cardId === "FND-PER-002");
}

function isProtectedFromStackController(instance, playerId, stackObject) {
  if (!instance || !stackObject?.controllerId || stackObject.controllerId === playerId) return false;
  return (app.game?.effects || []).some((effect) =>
    effect.type === "cantBeTargetedByOpponents" &&
    effectTargetsInstance(effect, { uid: instance.uid, owner: playerId })
  );
}

function getCharacterPower(instance) {
  const card = app.cardByCode.get(instance?.cardId);
  let power = toNumber(card?.stats?.attack, 0);
  if (hasDaviKingStaticBuff(getInstanceController(instance), instance)) power += 1;
  power += getEquipmentStatBonusForCharacter(instance).power;
  (app.game?.effects || []).forEach((effect) => {
    if (effect.type === "modifyStats" && effectTargetsInstance(effect, instance)) {
      power += toNumber(effect.power, 0);
    }
  });
  return Math.max(0, power);
}

function getCharacterResistance(instance) {
  const card = app.cardByCode.get(instance?.cardId);
  let resistance = toNumber(card?.stats?.resistance, 0);
  if (hasDaviKingStaticBuff(getInstanceController(instance), instance)) resistance += 1;
  resistance += getEquipmentStatBonusForCharacter(instance).resistance;
  (app.game?.effects || []).forEach((effect) => {
    if (effect.type === "setBaseResistance" && effectTargetsInstance(effect, instance)) {
      resistance = toNumber(effect.value, resistance);
    }
  });
  (app.game?.effects || []).forEach((effect) => {
    if (effect.type === "modifyStats" && effectTargetsInstance(effect, instance)) {
      resistance += toNumber(effect.resistance, 0);
    }
  });
  return Math.max(0, resistance);
}

function formatSignedStat(value) {
  const normalized = toNumber(value, 0);
  return normalized > 0 ? `+${normalized}` : `${normalized}`;
}

function getCharacterStatModifier(instance) {
  const card = app.cardByCode.get(instance?.cardId);
  if (!card || getCardTypeCode(card) !== "PER") return null;
  const basePower = toNumber(card.stats?.attack, 0);
  const baseResistance = toNumber(card.stats?.resistance, 0);
  const powerDelta = getCharacterPower(instance) - basePower;
  const resistanceDelta = getCharacterResistance(instance) - baseResistance;
  if (!powerDelta && !resistanceDelta) return null;
  return {
    powerDelta,
    resistanceDelta,
    label: `${formatSignedStat(powerDelta)}/${formatSignedStat(resistanceDelta)}`,
    tone: powerDelta < 0 || resistanceDelta < 0 ? "debuff" : "buff"
  };
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
  return canBlockWithOptions(player, uid);
}

function canPotentiallyBlockWith(player, uid) {
  return canBlockWithOptions(player, uid, {
    allowExhausted: hasVirtueLevel(player, VIRTUE_IDS.charity, 4)
  });
}

function canBlockWithOptions(player, uid, options = {}) {
  if (currentPhase(app.game) !== "combat") return false;
  const instance = findBattlefieldInstance(player, uid);
  if (!instance || (instance.exhausted && !options.allowExhausted)) return false;
  const card = app.cardByCode.get(instance.cardId);
  return getCardTypeCode(card) === "PER";
}

function canBlockAttack(defender, blockerUid, attacker, attackerUid) {
  const attackerInstance = findBattlefieldInstance(attacker, attackerUid);
  if (!attackerInstance) return false;
  const target = getAttackTarget(attacker.id, attackerUid);
  const targetsDefenderCharacter = target?.type === "character" && target.playerId === defender.id;
  if (targetsDefenderCharacter && hasVirtueLevel(defender, VIRTUE_IDS.egoism, 4)) return false;
  if (!canBlockWithOptions(defender, blockerUid, {
    allowExhausted: targetsDefenderCharacter && hasVirtueLevel(defender, VIRTUE_IDS.charity, 4)
  })) return false;
  return !instanceHasKeyword(attackerInstance, "IMBLOQUEAVEL");
}

function getMinimumBlockersRequired(attackerInstance) {
  const card = app.cardByCode.get(attackerInstance?.cardId);
  const text = normalizeKeywordText(card?.text);
  if (text.includes("NAO PODE SER BLOQUEADO EXCETO POR DOIS OU MAIS PERSONAGENS")) return 2;
  return 1;
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

function hasAvailablePermanentAction(player) {
  return hasNonGeneratorPermanentAction(player);
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
  if (app.pendingMoralChoice) return "";
  if (game.stack.length) return "";
  if (game.combat.awaitingBlockers || game.combat.resolving || game.combat.attackers.length) return "";

  const human = game.players.human;
  const phase = currentPhase(game);

  if (phase === "preparation" && !hasPlayableAlistamento(human) && !hasAvailablePermanentAction(human)) {
    return "sem jogadas disponiveis no Alistamento";
  }

  if (phase === "combat" && !hasPlayableMiracle(human) && !hasCombatAttack(human) && !hasAvailablePermanentAction(human)) {
    return "sem ataques ou Milagres disponiveis no Combate";
  }

  if (phase === "regroup" && !hasPlayableMiracle(human) && !hasAvailablePermanentAction(human)) {
    return "sem Milagres disponiveis no Reagrupamento";
  }

  return "";
}

function getEngineSourceInstance(source, game = app.game) {
  if (!source?.instanceUid || !game) return null;
  const player = getPlayer(game, source.controllerId);
  return findBattlefieldInstance(player, source.instanceUid);
}

function evaluateNumericRule(value, rule) {
  if (!rule || typeof rule !== "object") return true;
  const number = toNumber(value, 0);
  if (Number.isFinite(rule.gte) && number < rule.gte) return false;
  if (Number.isFinite(rule.gt) && number <= rule.gt) return false;
  if (Number.isFinite(rule.lte) && number > rule.lte) return false;
  if (Number.isFinite(rule.lt) && number >= rule.lt) return false;
  if (Number.isFinite(rule.eq) && number !== rule.eq) return false;
  return true;
}

function matchesConditionValue(value, expected) {
  const accepted = Array.isArray(expected) ? expected : [expected];
  return accepted.map(String).includes(String(value || ""));
}

function getEventSourceControllerId(payload = {}) {
  return payload.source?.playerId || payload.source?.controllerId || "";
}

function getEventTargetControllerId(payload = {}) {
  const target = payload.target || payload.damageTarget || {};
  return target.playerId || target.controllerId || "";
}

function getEventTargetType(payload = {}) {
  const target = payload.target || payload.damageTarget || {};
  return target.type || "";
}

function getEventAttackers(payload = {}, game = app.game) {
  const attacker = getPlayer(game, payload.attackerId);
  return (payload.attackers || [])
    .map((item) => findBattlefieldInstance(attacker, item.uid))
    .filter(Boolean);
}

function consumeOncePerTurnCondition(game, source, ability, condition) {
  if (!condition.oncePerTurn) return true;
  const scope = condition.oncePerTurn === true ? ability.id : condition.oncePerTurn;
  const key = `${source.controllerId}:${ability.id}:${scope}`;
  game.engineOncePerTurn ||= {};
  if (game.engineOncePerTurn[key]) return false;
  game.engineOncePerTurn[key] = true;
  return true;
}

function getCurrentPreventedAmount(damageEvent) {
  if (damageEvent?.preventedAmount === "all") return toNumber(damageEvent.amount, 0);
  return toNumber(damageEvent?.preventedAmount, 0);
}

function getEngineTurnBudgetRemaining(game, stackObject, action, fallbackAmount) {
  const budget = action.turnBudget;
  if (!budget) return fallbackAmount;
  const maxBudget = getActionAmount(budget.amount, fallbackAmount);
  const scope = budget.scope || action.effect || stackObject.abilityId;
  const key = `${stackObject.controllerId}:${stackObject.abilityId}:${scope}`;
  game.engineTurnBudgets ||= {};
  return Math.max(0, maxBudget - toNumber(game.engineTurnBudgets[key], 0));
}

function spendEngineTurnBudget(game, stackObject, action, amount) {
  if (!action.turnBudget || amount <= 0) return;
  const scope = action.turnBudget.scope || action.effect || stackObject.abilityId;
  const key = `${stackObject.controllerId}:${stackObject.abilityId}:${scope}`;
  game.engineTurnBudgets ||= {};
  game.engineTurnBudgets[key] = toNumber(game.engineTurnBudgets[key], 0) + amount;
}

function evaluateAbilityCondition(ability, source, payload = {}) {
  const condition = ability?.condition || {};
  const game = payload.game || app.game;
  if (!game) return false;

  if (condition.sourceIsEventPermanent) {
    if (payload.instanceUid && payload.instanceUid !== source.instanceUid) return false;
    if (payload.cardId && payload.cardId !== source.cardId) return false;
  }

  if (condition.sourceIsNotEventPermanent) {
    if (payload.instanceUid && payload.instanceUid === source.instanceUid) return false;
    if (!payload.instanceUid && payload.cardId && payload.cardId === source.cardId) return false;
  }

  if (condition.activePlayer === "controller" && game.activePlayer !== source.controllerId) return false;
  if (condition.activePlayer === "opponent" && game.activePlayer === source.controllerId) return false;

  if (condition.moralRequirement) {
    const requirement = condition.moralRequirement;
    const controller = getPlayer(game, source.controllerId);
    if (!controller || getVirtueValue(controller, requirement.virtueId) < toNumber(requirement.level, 1)) return false;
  }

  if (condition.eventPlayer === "controller" && payload.playerId !== source.controllerId) return false;
  if (condition.eventPlayer === "opponent" && payload.playerId === source.controllerId) return false;

  if (condition.eventCardType) {
    const eventCard = app.cardByCode.get(payload.cardId);
    if (!matchesConditionValue(getCardTypeCode(eventCard), condition.eventCardType)) return false;
  }

  if (condition.damageType && !matchesConditionValue(payload.damageType, condition.damageType)) return false;

  if (condition.sourceController) {
    const eventSourceController = getEventSourceControllerId(payload);
    if (!eventSourceController) return false;
    if (condition.sourceController === "controller" && eventSourceController !== source.controllerId) return false;
    if (condition.sourceController === "opponent" && eventSourceController === source.controllerId) return false;
  }

  if (condition.targetController) {
    const eventTargetController = getEventTargetControllerId(payload);
    if (!eventTargetController) return false;
    if (condition.targetController === "controller" && eventTargetController !== source.controllerId) return false;
    if (condition.targetController === "opponent" && eventTargetController === source.controllerId) return false;
  }

  if (condition.targetType && !matchesConditionValue(getEventTargetType(payload), condition.targetType)) return false;

  if (condition.controllerTerritoryDamagedThisTurn) {
    const controller = getPlayer(game, source.controllerId);
    if (!controller || toNumber(controller.territoryDamageTakenThisTurn, 0) <= 0) return false;
  }

  if (condition.controllerHandSize) {
    const controller = getPlayer(game, source.controllerId);
    if (!evaluateNumericRule(controller?.hand?.length || 0, condition.controllerHandSize)) return false;
  }

  if (condition.controllerDeckSize) {
    const controller = getPlayer(game, source.controllerId);
    if (!evaluateNumericRule(controller?.deck?.length || 0, condition.controllerDeckSize)) return false;
  }

  if (condition.controllerCardsPlayedThisTurn) {
    const controller = getPlayer(game, source.controllerId);
    if (!evaluateNumericRule(controller?.cardsPlayedThisTurn || 0, condition.controllerCardsPlayedThisTurn)) return false;
  }

  if (condition.attacker === "controller" && payload.attackerId !== source.controllerId) return false;
  if (condition.attacker === "opponent" && payload.attackerId === source.controllerId) return false;

  if (condition.sourceIsEventAttacker) {
    if (payload.attackerId !== source.controllerId) return false;
    const isSourceAttacker = (payload.attackers || []).some((attacker) => attacker.uid === source.instanceUid);
    if (!isSourceAttacker) return false;
  }

  if (condition.attackerCount) {
    if (!evaluateNumericRule((payload.attackers || []).length, condition.attackerCount)) return false;
  }

  if (condition.damagedAttackerCount) {
    const damagedAttackers = getEventAttackers(payload, game).filter(isDamagedCharacterInstance);
    if (!evaluateNumericRule(damagedAttackers.length, condition.damagedAttackerCount)) return false;
  }

  if (condition.targetIsSource) {
    const target = payload.target || payload.damageTarget || {};
    if (target.uid && target.uid !== source.instanceUid) return false;
    if (target.playerId && target.playerId !== source.controllerId) return false;
  }

  if (condition.sourceExhausted) {
    const instance = getEngineSourceInstance(source, game);
    if (!instance?.exhausted) return false;
  }

  if (condition.sourceEquipped) {
    const instance = getEngineSourceInstance(source, game);
    if (!instance || !isCharacterEquipped(instance, game)) return false;
  }

  if (condition.sourceAttached) {
    const instance = getEngineSourceInstance(source, game);
    if (!instance?.attachedTo) return false;
  }

  if (condition.sourceType) {
    const sourceInstance = getEngineSourceInstance(source, game);
    const sourceCard = app.cardByCode.get(payload.source?.cardId || sourceInstance?.cardId || source.cardId);
    const expectedType = condition.sourceType === "character" ? "PER" : condition.sourceType;
    const eventSourceType = payload.source?.type || getCardTypeCode(sourceCard);
    if (eventSourceType !== expectedType) return false;
  }

  if (condition.sourceSubtype) {
    const sourceInstance = payload.source?.uid
      ? findBattlefieldInstance(getPlayer(game, payload.source.playerId), payload.source.uid)
      : getEngineSourceInstance(source, game);
    const sourceCard = app.cardByCode.get(payload.source?.cardId || sourceInstance?.cardId || source.cardId);
    if (!cardHasSubtype(sourceCard, condition.sourceSubtype)) return false;
  }

  if (condition.sourcePower) {
    const sourceInstance = payload.source?.uid
      ? findBattlefieldInstance(getPlayer(game, payload.source.playerId), payload.source.uid)
      : getEngineSourceInstance(source, game);
    const sourcePower = sourceInstance ? getCharacterPower(sourceInstance) : toNumber(payload.source?.power, 0);
    if (!evaluateNumericRule(sourcePower, condition.sourcePower)) return false;
  }

  if (!consumeOncePerTurnCondition(game, source, ability, condition)) return false;

  return true;
}

function createEngineStackObject(game, trigger, ability, source, payload = {}) {
  if (!game || !ability || !source) return null;
  const cardId = source.cardId || payload.cardId || "";
  return {
    id: `stack-${Date.now()}-${++game.engineEventSeq}`,
    type: "ability",
    label: localize(ability.label) || source.label || ability.id,
    owner: source.controllerId,
    controllerId: source.controllerId,
    cardId,
    triggerId: trigger.id,
    abilityId: ability.id,
    ability,
    source,
    payload,
    optional: Boolean(ability.optional)
  };
}

function getEngineOncePerTurnKey(game, ability, source) {
  return [
    game.turnNumber,
    source.controllerId,
    source.instanceUid || source.identityKind || source.sourceId,
    ability.id
  ].join(":");
}

function isEngineOncePerTurnConsumed(game, ability, source) {
  if (!ability?.oncePerTurn) return false;
  const key = getEngineOncePerTurnKey(game, ability, source);
  return Boolean(game.engineOncePerTurn?.[key]);
}

function consumeEngineOncePerTurn(game, ability, source) {
  if (!ability?.oncePerTurn) return;
  const key = getEngineOncePerTurnKey(game, ability, source);
  game.engineOncePerTurn ||= {};
  game.engineOncePerTurn[key] = true;
}

function scheduleStackResolution(game) {
  if (!game || game !== app.game || game.stackResolving || !game.stack.length) return;
  if (app.drawAnimationPending || document.getElementById("drawAnimation")?.classList.contains("is-visible")) {
    window.setTimeout(() => scheduleStackResolution(game), 320);
    return;
  }
  game.stackResolving = true;
  window.setTimeout(() => resolveEngineStackLoop(game), 1040);
}

function requestStackPriorityBeforeResolve(game, stackObject) {
  return new Promise((resolve) => {
    if (!game || game !== app.game || game.status !== "active" || !stackObject) {
      resolve();
      return;
    }
    game.stackPrioritySeq = toNumber(game.stackPrioritySeq, 0) + 1;
    const label = `Prioridade antes de resolver ${stackObject.label}.`;
    if (!requestHumanPriority(game, `stack:${stackObject.id}:${game.stackPrioritySeq}`, label, resolve)) {
      resolve();
    }
  });
}

async function resolveEngineStackLoop(game) {
  while (app.game === game && game.status === "active" && game.stack.length) {
    const stackObject = game.stack[game.stack.length - 1];
    await requestStackPriorityBeforeResolve(game, stackObject);
    if (app.game !== game || game.status !== "active") return;
    const currentTop = game.stack[game.stack.length - 1];
    if (!currentTop || currentTop.id !== stackObject.id) continue;
    game.stack.pop();
    renderGame();
    await wait(860);
    await resolveEngineStackObject(game, stackObject);
    applyStateBasedActions(game);
    renderGame();
    await wait(620);
  }
  if (game) {
    game.stackResolving = false;
    if (app.game === game && game.status === "active") renderGame();
  }
}

async function resolveCardPlayStackObject(game, stackObject) {
  if (!game || !stackObject?.cardId) return false;
  const playerId = stackObject.controllerId;
  const player = getPlayer(game, playerId);
  const card = app.cardByCode.get(stackObject.cardId);
  if (!player || !card) return false;
  const cardId = stackObject.cardId;
  const typeCode = getCardTypeCode(card);
  const hasResolvedAbility = hasCardResolutionAbility(cardId, playerId);
  let enteredPermanent = null;

  if (typeCode === "PER" || typeCode === "ART") {
    const instance = createCardInstance(cardId, playerId);
    enteredPermanent = instance;
    player.battlefield.push(instance);
    addLog(game, `${getCardName(card)} resolveu e entrou no campo.`, player.label);
    emitGameEvent("permanent.enters_battlefield", {
      game,
      playerId,
      instanceUid: instance.uid,
      cardId
    });
  } else {
    player.cemetery.push(cardId);
    addLog(game, `resolveu ${getCardName(card)}.`, player.label);
  }

  const resolvedObjects = await resolveImmediateGameEvent("card.resolved", {
    game,
    playerId,
    cardId,
    stackObjectId: stackObject.id,
    result: typeCode === "PER" || typeCode === "ART" ? "battlefield" : "cemetery"
  });
  if (typeCode !== "PER" && typeCode !== "ART" && !resolvedObjects.length) {
    if (hasResolvedAbility) {
      addLog(game, `${getCardName(card)} nao encontrou alvos ou condicoes validas para resolver.`, player.label);
    } else {
      resolveSimpleSpell(playerId, card);
    }
  }
  applyCardMoralAfterEngineResolution(game, playerId, card);
  checkGameEnd(game);
  if (enteredPermanent && isEquipmentInstance(enteredPermanent)) {
    void promptEquipmentAttachmentOnEntry(game, playerId, enteredPermanent);
  }
  return true;
}

async function resolveEngineStackObject(game, stackObject) {
  if (!game || !stackObject) return false;
  if (stackObject.type === "play") {
    return resolveCardPlayStackObject(game, stackObject);
  }
  const ability = stackObject.ability || app.engine.abilityById.get(stackObject.abilityId);
  if (!ability) return false;

  if (stackObject.optional) {
    const shouldResolve = await chooseOptionalAbilityResolution(stackObject);
    if (!shouldResolve) {
      addLog(game, `${stackObject.label} nao foi resolvida.`, stackObject.controllerId === "human" ? "Voce" : "Bot");
      return false;
    }
  }

  const paidActivationCostIndexes = new Set(stackObject.activationPaidCostIndexes || []);
  for (const [index, cost] of (ability.costs || []).entries()) {
    if (paidActivationCostIndexes.has(index)) continue;
    const paid = await executeEngineAction(cost, stackObject, { isCost: true });
    if (paid === false) {
      addLog(game, `${stackObject.label} nao teve custo pago.`, "Pilha");
      return false;
    }
  }

  for (const action of ability.actions || []) {
    const actionResolved = await executeEngineAction(action, stackObject);
    if (actionResolved === false && action.stopResolutionOnFail) {
      addLog(game, `${stackObject.label} nao resolveu porque uma acao obrigatoria falhou.`, "Pilha");
      return false;
    }
  }

  addLog(game, `${stackObject.label} resolveu.`, "Pilha");
  if (stackObject.triggerId !== "stack.object_resolved") {
    emitGameEvent("stack.object_resolved", { game, stackObject }, { resolveImmediately: true });
  }
  return true;
}

function chooseOptionalAbilityResolution(stackObject) {
  if (stackObject.controllerId !== "human") return Promise.resolve(chooseBotOptionalAbility(stackObject));
  const sourceLabel = getStackObjectSourceLabel(stackObject);
  return showEngineChoiceModal({
    title: stackObject.label,
    description: "Esta habilidade e opcional. Deseja resolver este efeito?",
    effectText: getStackObjectEffectDescription(stackObject),
    sourceLabel,
    sourceIcon: getStackObjectSourceIcon(stackObject),
    confirmText: "Resolver",
    cancelText: "Nao resolver"
  });
}

function getStackObjectSourceLabel(stackObject) {
  const source = stackObject?.source || {};
  if (source.label) return source.label;
  if (source.sourceType === "virtue") {
    const virtue = getVirtueById(source.sourceId);
    return virtue ? `${getVirtueName(virtue)} Nv${source.level || ""}`.trim() : "Virtude";
  }
  if (source.cardId || source.sourceId) {
    const card = app.cardByCode.get(source.cardId || source.sourceId);
    return getCardName(card);
  }
  return source.sourceType === "effect" ? "Efeito temporario" : "Fonte desconhecida";
}

function getStackObjectSourceIcon(stackObject) {
  const source = stackObject?.source || {};
  if (source.icon) return source.icon;
  if (source.sourceType === "virtue") return getVirtueIcon(getVirtueById(source.sourceId));
  if (source.cardId || source.sourceId) return getCardArt(app.cardByCode.get(source.cardId || source.sourceId));
  return "";
}

function getStackObjectEffectDescription(stackObject) {
  const ability = stackObject?.ability || app.engine.abilityById.get(stackObject?.abilityId);
  const explicit = localize(ability?.description) || localize(ability?.text);
  if (explicit) return explicit;
  const source = stackObject?.source || {};
  if (source.sourceType === "virtue") {
    const virtue = getVirtueById(source.sourceId);
    const level = getVirtueLevelData(virtue, source.level);
    const text = localize(level?.text);
    if (text) return text;
  }
  const actionText = describeEngineActionList([...(ability?.costs || []), ...(ability?.actions || [])]);
  return actionText || stackObject?.label || "Efeito sem descricao.";
}

function describeEngineActionList(actions) {
  return (actions || [])
    .map(describeEngineAction)
    .filter(Boolean)
    .join(" ");
}

function describeEngineAmount(value, fallback = "") {
  if (value === "$choice") return "a quantidade escolhida";
  if (Number.isFinite(Number(value))) return String(Number(value));
  return fallback;
}

function describeEngineAction(action) {
  if (!action) return "";
  const amount = describeEngineAmount(action.amount, "X");
  if (localize(action.description)) return localize(action.description);
  if (action.effect === "put_cards_from_hand_on_bottom") return `Coloque ${amount} carta${amount === "1" ? "" : "s"} da mao no fundo do baralho.`;
  if (action.effect === "put_cards_from_hand_on_top") return `Coloque ${amount} carta${amount === "1" ? "" : "s"} da mao no topo do baralho.`;
  if (action.effect === "draw_cards") return `Compre ${amount} carta${amount === "1" ? "" : "s"}.`;
  if (action.effect === "pulverize") return `Pulverize ${amount} carta${amount === "1" ? "" : "s"}.`;
  if (action.effect === "tap_essence") return `Desative ${amount} Essencia${amount === "1" ? "" : "s"}.`;
  if (action.effect === "untap_essence") return `Ative ${amount} Essencia${amount === "1" ? "" : "s"}.`;
  if (action.effect === "generate_essence") return `Gere ${amount} {E}.`;
  if (action.effect === "counter_stack_object") {
    return action.target?.objectType === "play"
      ? "Anule uma jogada alvo na pilha."
      : "Anule uma jogada ou habilidade na pilha.";
  }
  if (action.effect === "reduce_next_cost") return `A próxima carta custa ${amount} Essência${amount === "1" ? "" : "s"} a menos.`;
  if (action.effect === "cover_champion") return "Encubra seu Campeao como custo desta habilidade.";
  if (action.effect === "discard_cards") return `Descarte ${amount} carta${amount === "1" ? "" : "s"}.`;
  if (action.effect === "create_token") return `Crie ${amount || "1"} ficha${amount === "1" ? "" : "s"}.`;
  if (action.effect === "return_permanent_to_hand") return "Retorne um permanente para a mao de seu dono.";
  if (action.effect === "move_cemetery_card_to_hand") return "Retorne uma carta do cemiterio para a mao.";
  if (action.effect === "search_library_to_top") return "Busque uma carta no baralho e coloque-a no topo.";
  if (action.effect === "search_library_or_reserve_to_hand") return "Busque uma carta no baralho ou na Reserva e coloque-a na mao.";
  if (action.effect === "top_cards_to_hand_bottom") return "Olhe cartas do topo, coloque uma na mao e o restante no fundo.";
  if (action.effect === "top_lowest_type_to_hand_bottom") return "Revele cartas do topo, coloque uma carta de menor custo do tipo indicado na mão e o restante no fundo.";
  if (action.effect === "reorder_top_cards") return "Reordene cartas do topo do baralho.";
  if (action.effect === "renounce_permanent") return "Renuncie um permanente.";
  if (action.effect === "grant_keyword") return `Conceda ${escapeHtml(action.keyword || "palavra-chave")} ate o Reagrupamento.`;
  if (action.effect === "protect_from_opponents") return "O alvo nao pode ser alvo de jogadas ou habilidades dos oponentes neste turno.";
  if (action.effect === "prevent_damage_to_character") return "Previna todo o dano que seria causado a um Personagem neste turno.";
  if (action.effect === "heal_territory") return `Cure ${amount} de dano do Territorio.`;
  if (action.effect === "heal_character") return `Cure ${amount} de dano de um Personagem.`;
  if (action.effect === "deal_damage") return `Cause ${amount} de dano.`;
  if (action.effect === "modify_damage_amount") return `Modifique o dano atual em ${formatSignedStat(action.amount)}.`;
  if (action.effect === "distribute_healing") return `Distribua ${amount} de cura entre alvos validos.`;
  if (action.effect === "distribute_damage") return `Distribua ${amount} de dano entre alvos validos.`;
  if (action.effect === "modify_power_resistance") {
    return `Modifique um Personagem em ${formatSignedStat(action.power)}/${formatSignedStat(action.resistance)}.`;
  }
  if (action.effect === "set_base_resistance") return `Altere a resistencia base para ${describeEngineAmount(action.value, "X")}.`;
  if (action.effect === "adjust_moral") return "Ajuste uma virtude ou desvirtude.";
  if (action.effect === "adjust_moral_choice") return "Escolha uma Virtude ou Desvirtude para ajustar.";
  if (action.effect === "adjust_moral_flexible") return "Escolha uma característica para receber +1 ou -1.";
  if (action.effect === "fight") return "Dois Personagens lutam entre si.";
  if (action.effect === "reveal_lower_cost_character_from_hand_then_heal") return "Revele um Personagem de custo menor da mão e cure seu Território.";
  if (action.effect === "create_temp_effect") {
    const temp = action.temporaryEffect || {};
    if (temp.action === "modify_event_amount") {
      const delta = describeEngineAmount(temp.amount, "X");
      const operation = temp.operation === "add" ? "adicione" : "modifique";
      return `${operation} ${delta} carta${delta === "1" ? "" : "s"} a esta compra.`;
    }
    if (temp.actions || temp.costs) return describeEngineActionList([...(temp.costs || []), ...(temp.actions || [])]);
    return "Crie um efeito temporario.";
  }
  if (action.effect === "choose_effect_bundle") return "Escolha uma das formas validas de resolver este efeito.";
  return localize(action.label) || String(action.effect || "").replace(/_/g, " ");
}

function chooseBotOptionalAbility(stackObject) {
  const abilityId = stackObject?.abilityId || "";
  if (abilityId.includes("doubt") || abilityId.includes("despair") || abilityId.includes("vice")) return false;
  return true;
}

function showEngineChoiceModal({ title, description, confirmText, cancelText, effectText = "", sourceLabel = "", sourceIcon = "" }) {
  return new Promise((resolve) => {
    let overlay = document.getElementById("zoneModal");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "zoneModal";
      overlay.className = "zone-modal";
      document.body.appendChild(overlay);
    }
    app.pendingEngineChoice = { type: "confirm", title };
    setZoneModalVisibleForRender(overlay);
    overlay.innerHTML = `
      <div class="zone-modal-panel zone-modal-panel--engine-choice" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
        <div class="zone-modal-head">
          <div>
            <span>Pilha</span>
          </div>
        </div>
        ${(effectText || sourceLabel) ? `
          <div class="engine-choice-source">
            ${sourceIcon ? `<img src="${escapeHtml(sourceIcon)}" alt="${escapeHtml(sourceLabel || title)}" draggable="false" />` : ""}
            <span>
              ${sourceLabel ? `<small>Origem</small><strong>${escapeHtml(sourceLabel)}</strong>` : ""}
              ${effectText ? `<small>Efeito</small><em>${escapeHtml(effectText)}</em>` : ""}
            </span>
          </div>
        ` : ""}
        <div class="zone-modal-actions">
          <button type="button" class="primary-action" data-engine-choice="confirm">${escapeHtml(confirmText)}</button>
          <button type="button" data-engine-choice="cancel">${escapeHtml(cancelText)}</button>
        </div>
      </div>
    `;
    decorateDecisionModal(overlay);
    overlay.querySelectorAll("[data-engine-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        closeDecisionModal(overlay);
        app.pendingEngineChoice = null;
        resolve(button.dataset.engineChoice === "confirm");
      }, { once: true });
    });
  });
}

function showEngineHandChoiceModal(player, amount, { title, description, confirmText }) {
  return new Promise((resolve) => {
    let overlay = document.getElementById("zoneModal");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "zoneModal";
      overlay.className = "zone-modal";
      document.body.appendChild(overlay);
    }
    app.pendingEngineChoice = { type: "hand", title };
    const handSnapshot = player.hand.map((cardId, index) => ({ cardId, index }));
    const selected = new Set();
    const render = () => {
      setZoneModalVisibleForRender(overlay);
      overlay.innerHTML = `
        <div class="zone-modal-panel zone-modal-panel--engine-card-choice" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
          <div class="zone-modal-head">
            <div>
              <span>Escolha</span>
              <b>${escapeHtml(title)}</b>
            </div>
          </div>
          <p class="zone-modal-description">${escapeHtml(description)}</p>
          <div class="zone-modal-grid engine-card-choice-grid">
            ${handSnapshot.map(({ cardId, index }) => {
              const card = app.cardByCode.get(cardId);
              const active = selected.has(index);
              return `
                <button class="zone-modal-card engine-card-choice ${active ? "is-selected" : ""}" type="button" data-engine-card-choice="${index}">
                  <img src="${escapeHtml(getCardImage(card))}" alt="${escapeHtml(getCardName(card))}" draggable="false" />
                </button>
              `;
            }).join("")}
          </div>
          <div class="zone-modal-actions">
            <button type="button" class="primary-action" data-engine-card-confirm ${selected.size === amount ? "" : "disabled"}>
              ${escapeHtml(confirmText)} (${selected.size}/${amount})
            </button>
          </div>
        </div>
      `;
      decorateDecisionModal(overlay);
      overlay.querySelectorAll("[data-engine-card-choice]").forEach((button) => {
        button.addEventListener("click", () => {
          const index = Number(button.dataset.engineCardChoice);
          if (selected.has(index)) {
            selected.delete(index);
          } else if (selected.size < amount) {
            selected.add(index);
          }
          render();
        }, { once: true });
      });
      overlay.querySelector("[data-engine-card-confirm]")?.addEventListener("click", () => {
        if (selected.size !== amount) return;
        closeDecisionModal(overlay);
        app.pendingEngineChoice = null;
        resolve(handSnapshot.filter((item) => selected.has(item.index)).map((item) => item.cardId).filter(Boolean));
      }, { once: true });
    };
    render();
  });
}

function showEngineSingleCardChoiceModal({ title, description, entries, confirmText = "Escolher" }) {
  const availableEntries = (entries || []).filter((entry) => entry?.cardId && app.cardByCode.has(entry.cardId));
  if (!availableEntries.length) return Promise.resolve(null);
  if (availableEntries.length === 1) return Promise.resolve(availableEntries[0]);
  return new Promise((resolve) => {
    let overlay = document.getElementById("zoneModal");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "zoneModal";
      overlay.className = "zone-modal";
      document.body.appendChild(overlay);
    }
    app.pendingEngineChoice = { type: "single-card", title };
    let selectedIndex = -1;
    const render = () => {
      setZoneModalVisibleForRender(overlay);
      overlay.innerHTML = `
        <div class="zone-modal-panel zone-modal-panel--engine-card-choice" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
          <div class="zone-modal-head">
            <div>
              <span>Escolha</span>
              <b>${escapeHtml(title)}</b>
            </div>
          </div>
          <p class="zone-modal-description">${escapeHtml(description)}</p>
          <div class="zone-modal-grid engine-card-choice-grid">
            ${availableEntries.map((entry, index) => {
              const card = app.cardByCode.get(entry.cardId);
              return `
                <button class="zone-modal-card engine-card-choice ${selectedIndex === index ? "is-selected" : ""}" type="button" data-engine-single-card-choice="${index}">
                  <img src="${escapeHtml(getCardImage(card))}" alt="${escapeHtml(getCardName(card))}" draggable="false" />
                  ${entry.meta ? `<small>${escapeHtml(entry.meta)}</small>` : ""}
                </button>
              `;
            }).join("")}
          </div>
          <div class="zone-modal-actions">
            <button type="button" class="primary-action" data-engine-single-card-confirm ${selectedIndex >= 0 ? "" : "disabled"}>
              ${escapeHtml(confirmText)}
            </button>
          </div>
        </div>
      `;
      decorateDecisionModal(overlay);
      overlay.querySelectorAll("[data-engine-single-card-choice]").forEach((button) => {
        button.addEventListener("click", () => {
          selectedIndex = toNumber(button.dataset.engineSingleCardChoice, -1);
          render();
        }, { once: true });
      });
      overlay.querySelector("[data-engine-single-card-confirm]")?.addEventListener("click", () => {
        if (selectedIndex < 0) return;
        closeDecisionModal(overlay);
        app.pendingEngineChoice = null;
        resolve(availableEntries[selectedIndex] || null);
      }, { once: true });
    };
    render();
  });
}

function showEngineDeckReviewModal(player, cardIds, { title, description, maxCemetery = 0, allowBottom = true }) {
  if (!Array.isArray(cardIds) || !cardIds.length) return Promise.resolve(null);
  return new Promise((resolve) => {
    let overlay = document.getElementById("zoneModal");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "zoneModal";
      overlay.className = "zone-modal";
      document.body.appendChild(overlay);
    }

    app.pendingEngineChoice = { type: "deck-review", title };
    const state = {
      top: cardIds.map((_, index) => index),
      bottom: [],
      cemetery: [],
      selectedIndex: -1
    };

    const removeIndex = (collection, index) => {
      const position = collection.indexOf(index);
      if (position >= 0) collection.splice(position, 1);
    };

    const removeEverywhere = (index) => {
      removeIndex(state.top, index);
      removeIndex(state.bottom, index);
      removeIndex(state.cemetery, index);
    };

    const moveTo = (index, target, beforeIndex = -1) => {
      if (target === "bottom" && !allowBottom) return;
      if (target === "cemetery" && maxCemetery <= 0) return;
      if (target === "cemetery" && !state.cemetery.includes(index) && state.cemetery.length >= maxCemetery) return;
      if (index === beforeIndex) return;
      removeEverywhere(index);
      const collection = state[target];
      const beforePosition = collection.indexOf(beforeIndex);
      if (beforePosition >= 0) {
        collection.splice(beforePosition, 0, index);
      } else {
        collection.push(index);
      }
      state.selectedIndex = -1;
      render();
    };

    const moveInside = (target, index, delta) => {
      const collection = state[target];
      const position = collection.indexOf(index);
      const next = position + delta;
      if (position < 0 || next < 0 || next >= collection.length) return;
      [collection[position], collection[next]] = [collection[next], collection[position]];
      render();
    };

    const renderPile = (target, label) => {
      const indexes = state[target];
      const emptyLabel = target === "top"
        ? "Arraste cartas para o topo."
        : target === "bottom"
          ? "Arraste cartas para o fundo."
          : "Arraste cartas para o cemiterio.";
      return `
        <section class="engine-review-pile engine-review-pile--${target}" data-engine-review-section="${target}">
          <button type="button" class="engine-review-pile-head" data-engine-review-target="${target}">
            <strong>${escapeHtml(label)}</strong>
            <span>${indexes.length}</span>
          </button>
          <div class="engine-review-pile-cards" data-engine-review-drop="${target}">
            ${indexes.length ? indexes.map((index, position) => {
              const cardId = cardIds[index];
              const card = app.cardByCode.get(cardId);
              return `
                <article
                  class="engine-review-card ${state.selectedIndex === index ? "is-selected" : ""}"
                  draggable="true"
                  data-engine-review-card="${index}"
                  data-engine-review-card-zone="${target}"
                  data-zoom-card="${escapeHtml(cardId)}"
                  title="${escapeHtml(getCardName(card))}"
                >
                  <img src="${escapeHtml(getCardArt(card))}" alt="${escapeHtml(getCardName(card))}" draggable="false" />
                </article>
              `;
            }).join("") : `<p>${emptyLabel}</p>`}
          </div>
        </section>
      `;
    };

    const render = () => {
      setZoneModalVisibleForRender(overlay);
      overlay.innerHTML = `
        <div class="zone-modal-panel zone-modal-panel--engine-deck-review" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
          <div class="zone-modal-head">
            <div>
              <span>Revisar topo</span>
              <b>${escapeHtml(title)}</b>
            </div>
          </div>
          <p class="zone-modal-description">${escapeHtml(description)}</p>
          <div class="engine-review-grid">
            ${renderPile("top", "Topo do baralho")}
            ${allowBottom ? renderPile("bottom", "Fundo do baralho") : ""}
            ${maxCemetery > 0 ? renderPile("cemetery", `Cemiterio (${state.cemetery.length}/${maxCemetery})`) : ""}
          </div>
          <div class="zone-modal-actions zone-modal-actions--engine-review">
            <button type="button" class="primary-action" data-engine-review-confirm>Confirmar ordenacao</button>
          </div>
        </div>
      `;
      decorateDecisionModal(overlay);

      overlay.querySelectorAll("[data-engine-review-card]").forEach((cardNode) => {
        cardNode.addEventListener("click", () => {
          const index = toNumber(cardNode.dataset.engineReviewCard, -1);
          state.selectedIndex = state.selectedIndex === index ? -1 : index;
          render();
        }, { once: true });
        cardNode.addEventListener("dragstart", (event) => {
          const index = toNumber(cardNode.dataset.engineReviewCard, -1);
          state.selectedIndex = index;
          event.dataTransfer?.setData("text/plain", String(index));
          if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
          overlay.classList.add("is-engine-review-dragging");
        }, { once: true });
        cardNode.addEventListener("dragend", () => {
          overlay.classList.remove("is-engine-review-dragging");
        }, { once: true });
        cardNode.addEventListener("dragover", (event) => {
          event.preventDefault();
          event.stopPropagation();
          cardNode.classList.add("is-drop-before");
        });
        cardNode.addEventListener("dragleave", () => {
          cardNode.classList.remove("is-drop-before");
        });
        cardNode.addEventListener("drop", (event) => {
          event.preventDefault();
          event.stopPropagation();
          cardNode.classList.remove("is-drop-before");
          overlay.classList.remove("is-engine-review-dragging");
          const index = toNumber(event.dataTransfer?.getData("text/plain"), -1);
          const beforeIndex = toNumber(cardNode.dataset.engineReviewCard, -1);
          const target = cardNode.dataset.engineReviewCardZone || "top";
          if (index < 0 || beforeIndex < 0) return;
          moveTo(index, target, beforeIndex);
        });
      });

      overlay.querySelectorAll("[data-engine-review-target]").forEach((button) => {
        button.addEventListener("click", () => {
          if (state.selectedIndex < 0) return;
          moveTo(state.selectedIndex, button.dataset.engineReviewTarget);
        }, { once: true });
      });

      overlay.querySelectorAll("[data-engine-review-order]").forEach((button) => {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          moveInside(
            button.dataset.engineReviewPile,
            toNumber(button.dataset.engineReviewOrder, 0),
            toNumber(button.dataset.engineReviewShift, 0)
          );
        }, { once: true });
      });

      overlay.querySelectorAll("[data-engine-review-move]").forEach((button) => {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          moveTo(
            toNumber(button.dataset.engineReviewMove, -1),
            button.dataset.engineReviewMoveTarget
          );
        }, { once: true });
      });

      overlay.querySelectorAll("[data-engine-review-drop]").forEach((zone) => {
        zone.addEventListener("dragover", (event) => {
          event.preventDefault();
          zone.classList.add("is-drop-target");
        });
        zone.addEventListener("dragleave", () => {
          zone.classList.remove("is-drop-target");
        });
        zone.addEventListener("drop", (event) => {
          event.preventDefault();
          zone.classList.remove("is-drop-target");
          overlay.classList.remove("is-engine-review-dragging");
          const index = toNumber(event.dataTransfer?.getData("text/plain"), -1);
          if (index < 0) return;
          moveTo(index, zone.dataset.engineReviewDrop);
        });
      });

      overlay.querySelector("[data-engine-review-confirm]")?.addEventListener("click", () => {
        closeDecisionModal(overlay);
        app.pendingEngineChoice = null;
        resolve({
          top: state.top.map((index) => cardIds[index]),
          bottom: state.bottom.map((index) => cardIds[index]),
          cemetery: state.cemetery.map((index) => cardIds[index])
        });
      }, { once: true });
    };

    render();
  });
}

function showEngineAmountChoiceModal({ title, description, min, max, confirmPrefix = "Escolher" }) {
  const values = Array.from({ length: Math.max(0, max - min + 1) }, (_, index) => min + index);
  if (values.length === 1) return Promise.resolve(values[0]);
  return new Promise((resolve) => {
    let overlay = document.getElementById("zoneModal");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "zoneModal";
      overlay.className = "zone-modal";
      document.body.appendChild(overlay);
    }
    app.pendingEngineChoice = { type: "amount", title };
    setZoneModalVisibleForRender(overlay);
    overlay.innerHTML = `
      <div class="zone-modal-panel zone-modal-panel--engine-choice" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
        <div class="zone-modal-head">
          <div>
            <span>Escolha</span>
            <b>${escapeHtml(title)}</b>
          </div>
        </div>
        <p class="zone-modal-description">${escapeHtml(description)}</p>
        <div class="zone-modal-actions zone-modal-actions--choice">
          ${values.map((value) => `
            <button type="button" data-engine-amount-choice="${value}">${escapeHtml(`${confirmPrefix} ${value}`)}</button>
          `).join("")}
        </div>
      </div>
    `;
    decorateDecisionModal(overlay);
    overlay.querySelectorAll("[data-engine-amount-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        closeDecisionModal(overlay);
        app.pendingEngineChoice = null;
        resolve(toNumber(button.dataset.engineAmountChoice, min));
      }, { once: true });
    });
  });
}

async function chooseEngineAmount(action, stackObject) {
  const config = action?.chooseAmount;
  if (!config) return null;
  const min = Math.max(0, toNumber(config.min, 0));
  const max = Math.max(min, toNumber(config.max, min));
  if (stackObject.controllerId !== "human") {
    return config.botStrategy === "min" ? min : max;
  }
  return showEngineAmountChoiceModal({
    title: localize(config.title) || stackObject.label,
    description: localize(config.description) || "Escolha um valor para esta habilidade.",
    min,
    max,
    confirmPrefix: localize(config.confirmPrefix) || "Escolher"
  });
}

function resolveChoiceTemplate(template, choiceValue) {
  if (choiceValue === null || typeof choiceValue === "undefined") return template;
  if (Array.isArray(template)) return template.map((item) => resolveChoiceTemplate(item, choiceValue));
  if (template && typeof template === "object") {
    return Object.fromEntries(Object.entries(template).map(([key, value]) => [key, resolveChoiceTemplate(value, choiceValue)]));
  }
  return template === "$choice" ? choiceValue : template;
}

function getEngineRefKey(ref) {
  if (!ref) return "";
  if (ref.territory) return `territory:${ref.playerId}`;
  if (ref.instance?.uid) return `character:${ref.playerId}:${ref.instance.uid}`;
  return "";
}

function getEngineRefCard(ref) {
  if (!ref) return null;
  if (ref.territory) {
    const player = getPlayer(app.game, ref.playerId);
    return app.cardByCode.get(player?.identity?.territory);
  }
  return app.cardByCode.get(ref.instance?.cardId);
}

function getEngineRefLabel(ref) {
  if (!ref) return "";
  if (ref.territory) {
    const player = getPlayer(app.game, ref.playerId);
    return `Território de ${player?.label || ref.playerId}`;
  }
  return getCardName(getEngineRefCard(ref));
}

function getEngineRefMeta(ref, kind = "target") {
  if (!ref) return "";
  const player = getPlayer(app.game, ref.playerId);
  if (ref.territory) {
    const remaining = Math.max(0, player.maxTerritory - player.territoryDamage);
    return kind === "heal"
      ? `${player?.label || ref.playerId} · dano atual ${player.territoryDamage}`
      : `${player?.label || ref.playerId} · Vida ${remaining}/${player.maxTerritory}`;
  }
  const owner = player?.label || ref.playerId || "Jogador";
  const card = getEngineRefCard(ref);
  if (getCardTypeCode(card) !== "PER") {
    return `${owner} · ${getCardTypeLabel(card)}${ref.instance?.exhausted ? " · despreparado" : ""}`;
  }
  const attack = getCharacterPower(ref.instance);
  const resistance = getCharacterResistance(ref.instance);
  const damage = toNumber(ref.instance?.damage, 0);
  const state = ref.instance?.exhausted ? "despreparado" : "preparado";
  return `${owner} · ${attack}/${resistance} · dano ${damage} · ${state}`;
}

function getEngineHealingCapacity(ref) {
  if (!ref) return 0;
  if (ref.territory) {
    const player = getPlayer(app.game, ref.playerId);
    return Math.max(0, toNumber(player?.territoryDamage, 0));
  }
  return Math.max(0, toNumber(ref.instance?.damage, 0));
}

function getEngineDamageCapacity(ref, total) {
  if (!ref) return 0;
  if (ref.territory) {
    const player = getPlayer(app.game, ref.playerId);
    return Math.max(1, Math.min(total, Math.max(1, player.maxTerritory - player.territoryDamage)));
  }
  return Math.max(1, Math.min(total, getLethalDamageNeeded(ref.instance) || total));
}

function chooseBotEngineTargetRef(refs, kind = "target") {
  if (!refs.length) return null;
  const sorted = [...refs].sort((left, right) => {
    if (kind === "heal") {
      if (left.territory !== right.territory) return left.territory ? -1 : 1;
      return getEngineHealingCapacity(right) - getEngineHealingCapacity(left);
    }
    if (kind === "buff") {
      if (left.territory !== right.territory) return left.territory ? 1 : -1;
      const leftScore = getCharacterPower(left.instance) + getCharacterResistance(left.instance);
      const rightScore = getCharacterPower(right.instance) + getCharacterResistance(right.instance);
      return rightScore - leftScore;
    }
    if (kind === "self-damage") {
      if (left.territory !== right.territory) return left.territory ? 1 : -1;
      return getLethalDamageNeeded(left.instance) - getLethalDamageNeeded(right.instance);
    }
    return 0;
  });
  return sorted[0] || null;
}

function chooseBotEngineTargetRefForStack(stackObject, refs, kind = "target") {
  if (!refs.length) return null;
  const controllerId = stackObject?.controllerId || "";
  const opponentId = controllerId ? getOpponentId(controllerId) : "";
  const scored = refs.map((ref) => {
    let score = 0;
    if (kind === "damage") {
      if (ref.playerId === opponentId) score += 100;
      if (!ref.territory) score += 20;
      score += getCharacterPower(ref.instance) * 2;
      score -= getLethalDamageNeeded(ref.instance);
    } else if (kind === "buff") {
      if (ref.playerId === controllerId) score += 100;
      if (ref.territory) score -= 50;
      score += getCharacterPower(ref.instance) + getCharacterResistance(ref.instance);
    } else if (kind === "heal") {
      if (ref.playerId === controllerId) score += 100;
      score += getEngineHealingCapacity(ref) * 4;
      if (ref.territory) score += 10;
    } else if (kind === "self-damage") {
      if (ref.playerId === controllerId) score += 100;
      score -= getEngineDamageCapacity(ref, 99);
    } else if (kind === "bounce" || kind === "destroy") {
      if (ref.playerId === opponentId) score += 100;
      if (ref.playerId === controllerId) score -= 80;
      score += getCharacterPower(ref.instance) + getCharacterResistance(ref.instance);
    } else if (kind === "control") {
      if (ref.playerId === opponentId) score += 120;
      if (ref.playerId === controllerId) score -= 100;
      score += getCharacterPower(ref.instance) * 2 + getCharacterResistance(ref.instance);
      if (ref.instance?.exhausted) score -= 2;
    } else if (kind === "renounce") {
      if (ref.playerId === controllerId) score += 20;
      score -= getCharacterPower(ref.instance) + getCharacterResistance(ref.instance);
    }
    return { ref, score };
  });
  scored.sort((left, right) => right.score - left.score);
  return scored[0]?.ref || chooseBotEngineTargetRef(refs, kind);
}

function scoreBotDeckReviewCard(player, cardId) {
  const card = app.cardByCode.get(cardId);
  if (!card) return -999;
  const typeCode = getCardTypeCode(card);
  const availableEssence = getAvailableEssence(player);
  const cost = getCost(card);
  let score = 0;
  if (typeCode === "PER") score += 4;
  if (typeCode === "MIL") score += 3;
  if (typeCode === "ART") score += 2;
  if (typeCode === "PEC") score -= 1;
  if (cost <= availableEssence + 1) score += 5;
  score -= cost * 0.35;
  score += toNumber(card.stats?.attack, 0) * .12;
  score += toNumber(card.stats?.resistance, 0) * .08;
  return score;
}

function chooseBotDeckReviewPlan(player, cardIds, maxCemetery = 0) {
  const ranked = [...cardIds].map((cardId) => ({
    cardId,
    score: scoreBotDeckReviewCard(player, cardId)
  }));
  const cemetery = [];
  if (maxCemetery > 0 && ranked.length > 1) {
    const worst = [...ranked].sort((left, right) => left.score - right.score).slice(0, maxCemetery);
    worst.forEach((entry) => cemetery.push(entry.cardId));
  }
  const remaining = ranked.filter((entry) => !cemetery.includes(entry.cardId)).sort((left, right) => right.score - left.score);
  const keepOnTop = Math.min(remaining.length, Math.max(1, Math.min(2, Math.ceil(remaining.length / 2))));
  return {
    top: remaining.slice(0, keepOnTop).map((entry) => entry.cardId),
    bottom: remaining.slice(keepOnTop).map((entry) => entry.cardId),
    cemetery
  };
}

function applyDeckReviewDecision(player, decision = {}) {
  const top = Array.isArray(decision.top) ? decision.top.filter(Boolean) : [];
  const bottom = Array.isArray(decision.bottom) ? decision.bottom.filter(Boolean) : [];
  const cemetery = Array.isArray(decision.cemetery) ? decision.cemetery.filter(Boolean) : [];
  const reviewedCount = top.length + bottom.length + cemetery.length;
  if (!reviewedCount) return { reviewedCount: 0, top: [], bottom: [], cemetery: [] };
  player.deck.splice(0, reviewedCount);
  cemetery.forEach((cardId) => player.cemetery.push(cardId));
  player.deck = [...top, ...player.deck, ...bottom];
  return { reviewedCount, top, bottom, cemetery };
}

function getFilteredDeckEntries(player, filter = {}) {
  return (player?.deck || [])
    .map((cardId, index) => ({ cardId, index, zone: "deck" }))
    .filter((entry) => cardMatchesTypeFilter(app.cardByCode.get(entry.cardId), filter));
}

function getFilteredReserveEntries(player, filter = {}) {
  return (player?.reserve || [])
    .map((cardId, index) => ({ cardId, index, zone: "reserve" }))
    .filter((entry) => cardMatchesTypeFilter(app.cardByCode.get(entry.cardId), filter));
}

function getFilteredCemeteryEntries(player, filter = {}) {
  return (player?.cemetery || [])
    .map((cardId, index) => ({ cardId, index, zone: "cemetery" }))
    .filter((entry) => {
      const card = app.cardByCode.get(entry.cardId);
      return card && !card.token && cardMatchesTypeFilter(card, filter);
    });
}

function chooseBotCardEntry(entries, player) {
  return [...entries]
    .sort((left, right) => scoreBotDeckReviewCard(player, right.cardId) - scoreBotDeckReviewCard(player, left.cardId))[0] || null;
}

function removeBattlefieldCardToZone(game, playerId, instance, destination) {
  const controller = getPlayer(game, playerId);
  if (!controller || !instance) return false;
  const card = app.cardByCode.get(instance.cardId);
  const owner = getPlayer(game, instance.owner) || controller;
  const isToken = Boolean(instance.token || card?.token);
  const finalDestination = isToken ? "void" : destination;
  if (isIncenseTokenCard(card) && getTokenQuantity(instance) > 1) {
    instance.tokenQuantity = getTokenQuantity(instance) - 1;
    emitGameEvent("permanent.leaves_battlefield", {
      game,
      playerId,
      instanceUid: instance.uid,
      cardId: instance.cardId,
      destination: finalDestination
    });
    if (destination === "cemetery") {
      emitGameEvent("permanent.dies", {
        game,
        playerId,
        instanceUid: instance.uid,
        cardId: instance.cardId
      });
    }
    return true;
  }
  cleanupAttachmentsForLeaving(game, instance.uid);
  controller.battlefield = controller.battlefield.filter((item) => item.uid !== instance.uid);
  if (!isToken && destination === "hand") owner.hand.push(instance.cardId);
  if (!isToken && destination === "cemetery") owner.cemetery.push(instance.cardId);
  emitGameEvent("permanent.leaves_battlefield", {
    game,
    playerId,
    instanceUid: instance.uid,
    cardId: instance.cardId,
    destination: finalDestination
  });
  if (destination === "cemetery") {
    emitGameEvent("permanent.dies", {
      game,
      playerId,
      instanceUid: instance.uid,
      cardId: instance.cardId
    });
  }
  return true;
}

function isEngineActionViable(action, stackObject) {
  if (!action) return false;
  const game = stackObject?.payload?.game || app.game;
  if (!game) return false;

  if (action.effect === "heal_territory") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    return toNumber(player?.territoryDamage, 0) > 0;
  }

  if (action.effect === "heal_character") {
    return getEngineTargetRefs(action.target, stackObject, { ignoreCount: true }).some((ref) => getEngineHealingCapacity(ref) > 0);
  }

  if (action.effect === "deal_damage") {
    return getEngineTargetRefs(action.target, stackObject, { ignoreCount: true }).length > 0;
  }

  if (action.effect === "cover_champion") {
    const player = getPlayer(game, getStackPlayerId(action.player || "controller", stackObject));
    return Boolean(player && !player.championCovered);
  }

  if (action.effect === "counter_stack_object") {
    return getEngineStackTargetRefs(action.target || { zone: "stack", controller: "all" }, stackObject, { ignoreCount: true }).length > 0;
  }

  if (action.effect === "destroy_permanent") {
    return getEngineTargetRefs(action.target, stackObject, { ignoreCount: true }).length > 0;
  }

  if (action.effect === "attach_equipment") {
    const equipmentRefs = getEngineTargetRefs(action.equipment || "source", stackObject, { ignoreCount: true });
    const targetRefs = getEngineTargetRefs(action.target, stackObject, { ignoreCount: true });
    return equipmentRefs.some((equipmentRef) =>
      targetRefs.some((targetRef) => canAttachEquipmentTo(equipmentRef.instance, targetRef.instance, equipmentRef.playerId, targetRef.playerId))
    );
  }

  if (action.effect === "detach_equipment") {
    return getEngineTargetRefs(action.equipment || action.target || "source", stackObject, { ignoreCount: true })
      .some((ref) => ref.instance?.attachedTo);
  }

  if (action.effect === "destroy_if_power_gte_else_damage") {
    return getEngineTargetRefs(action.target, stackObject, { ignoreCount: true }).length > 0;
  }

  if (action.effect === "adjust_moral_choice") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    const maxBefore = Number.isFinite(action.maxBefore) ? action.maxBefore : Infinity;
    const minBefore = Number.isFinite(action.minBefore) ? action.minBefore : -Infinity;
    const polarities = action.polarity === "all" ? ["virtue", "vice"] : [action.polarity || "virtue"];
    return Boolean(player) && app.virtues.some((virtue) => (
      polarities.includes(virtue.polarity) &&
      getVirtueValue(player, virtue.id) < maxBefore &&
      getVirtueValue(player, virtue.id) >= minBefore
    ));
  }

  if (action.effect === "adjust_moral_flexible") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    return Boolean(player) && getFlexibleMoralChoices(player, getActionAmount(action.amount, 1)).length > 0;
  }

  if (action.effect === "tap" || action.effect === "untap") {
    return getEngineTargetRefs(action.target, stackObject, { ignoreCount: true })
      .some((ref) => Boolean(ref.instance) && Boolean(ref.instance.exhausted) !== (action.effect === "tap"));
  }

  if (["return_permanent_to_hand", "gain_control", "grant_keyword", "protect_from_opponents", "prevent_damage_to_character"].includes(action.effect)) {
    return getEngineTargetRefs(action.target, stackObject, { ignoreCount: true }).length > 0;
  }

  if (action.effect === "renounce_permanent") {
    const players = action.player === "all"
      ? Object.values(game.players)
      : [getPlayer(game, getStackPlayerId(action.player, stackObject))].filter(Boolean);
    return players.some((player) => player.battlefield.some((instance) => {
      const card = app.cardByCode.get(instance.cardId);
      return cardMatchesTypeFilter(card, action.filter || action.target || {});
    }));
  }

  if (action.effect === "tap_essence") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    const amount = getActionAmount(action.amount, 0);
    const available = getReadyEssenceCount(player);
    return action.upTo ? Boolean(player) : available >= amount;
  }

  if (action.effect === "untap_essence") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    return toNumber(player?.spentEssence, 0) > 0;
  }

  if (action.effect === "generate_essence") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    return Boolean(player) && getActionAmount(action.amount, 0) > 0;
  }

  if (action.effect === "discard_cards") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    const amount = getActionAmount(action.amount, 0);
    const handSize = player?.hand?.length || 0;
    return Boolean(player) && amount > 0 && (action.upTo ? true : handSize >= amount);
  }

  if (action.effect === "put_cards_from_hand_on_bottom" || action.effect === "put_cards_from_hand_on_top") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    const amount = getActionAmount(action.amount, 0);
    return Boolean(player) && amount > 0 && (action.upTo ? player.hand.length > 0 : player.hand.length >= amount);
  }

  if (action.effect === "create_token") {
    return app.cardByCode.has(getTokenCardId(action.tokenId));
  }

  if (action.effect === "prevent_damage") {
    const damageEvent = stackObject.payload?.damageEvent;
    if (!damageEvent) return false;
    const remainingDamage = Math.max(0, toNumber(damageEvent.amount, 0) - getCurrentPreventedAmount(damageEvent));
    if (remainingDamage <= 0) return false;
    if (action.amount === "all" && !action.turnBudget) return true;
    const requestedAmount = action.amount === "all" ? remainingDamage : getActionAmount(action.amount, 0);
    const budgetRemaining = getEngineTurnBudgetRemaining(game, stackObject, action, requestedAmount);
    return Math.min(remainingDamage, requestedAmount, budgetRemaining) > 0;
  }

  if (action.effect === "distribute_healing") {
    return getEngineDistributionCandidates(action.targets || [], stackObject, "heal").length > 0;
  }

  if (action.effect === "distribute_damage") {
    return getEngineDistributionCandidates(action.targets || [], stackObject, "damage").length > 0;
  }

  if (action.effect === "review_top_cards") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    return Boolean(player?.deck?.length);
  }

  if (action.effect === "reorder_top_cards") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    return Boolean(player?.deck?.length);
  }

  if (action.effect === "top_cards_to_hand_bottom") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    return Boolean(player?.deck?.length);
  }

  if (action.effect === "top_lowest_type_to_hand_bottom") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    return Boolean(player?.deck?.length);
  }

  if (action.effect === "fight") {
    const leftRefs = getEngineTargetRefs(action.sourceTarget || action.left || action.target, stackObject, { ignoreCount: true });
    const rightRefs = getEngineTargetRefs(action.target || action.right, stackObject, { ignoreCount: true });
    return leftRefs.some((left) => rightRefs.some((right) => left.instance && right.instance && left.instance.uid !== right.instance.uid));
  }

  if (action.effect === "reveal_lower_cost_character_from_hand_then_heal") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    if (!player) return false;
    const maxControlledCost = player.battlefield
      .filter((instance) => getCardTypeCode(app.cardByCode.get(instance.cardId)) === "PER")
      .reduce((max, instance) => Math.max(max, getCost(app.cardByCode.get(instance.cardId))), -Infinity);
    return Number.isFinite(maxControlledCost) && player.hand.some((cardId) => {
      const card = app.cardByCode.get(cardId);
      return getCardTypeCode(card) === "PER" && getCost(card) < maxControlledCost;
    });
  }

  if (action.effect === "move_cemetery_card_to_hand") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    return getFilteredCemeteryEntries(player, action.filter || {}).length > 0;
  }

  if (action.effect === "search_library_to_top") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    return getFilteredDeckEntries(player, action.filter || {}).length > 0;
  }

  if (action.effect === "search_library_or_reserve_to_hand") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    return getFilteredDeckEntries(player, action.filter || {}).length > 0 ||
      getFilteredReserveEntries(player, action.filter || {}).length > 0;
  }

  if (action.effect === "choose_effect_bundle") {
    return (action.choices || []).some((choice) => isEngineChoiceValid(choice, stackObject));
  }

  return true;
}

function isEngineStackObjectViable(stackObject) {
  const ability = stackObject?.ability || app.engine.abilityById.get(stackObject?.abilityId);
  const costs = ability?.costs || [];
  if (costs.some((cost) => !isEngineActionViable(cost, stackObject))) return false;
  const actions = ability?.actions || [];
  if (!actions.length) return true;
  const actionResults = actions.map((action) => isEngineActionViable(action, stackObject));
  return ability?.requiresAllActions ? actionResults.every(Boolean) : actionResults.some(Boolean);
}

function isEngineChoiceValid(choice, stackObject) {
  const costs = Array.isArray(choice?.costs) ? choice.costs : [];
  const actions = Array.isArray(choice?.actions) ? choice.actions : [];
  if (costs.some((cost) => !isEngineActionViable(cost, stackObject))) return false;
  if (!actions.length) return false;
  return actions.some((action) => isEngineActionViable(action, stackObject));
}

function renderEngineTargetChoiceVisual(ref, kind, { visualOnly = false, showStats = false } = {}) {
  const card = getEngineRefCard(ref);
  if (!card) return "";
  const instance = ref?.instance || null;
  const isCharacter = instance && getCardTypeCode(card) === "PER";
  const damage = toNumber(instance?.damage, 0);
  const statModifier = isCharacter ? getCharacterStatModifier(instance) : null;
  const equipment = isCharacter ? getAttachedEquipmentInstances(instance) : [];
  return `
    <span class="engine-target-choice-art ${isCharacter ? "is-character" : ""}">
      <img src="${escapeHtml(getCardArt(card))}" alt="${escapeHtml(getEngineRefLabel(ref))}" draggable="false" />
      ${showStats && isCharacter ? `<strong class="engine-target-choice-stats ${statModifier ? `is-${statModifier.tone}` : ""}">${getCharacterPower(instance)}/${getCharacterResistance(instance)}</strong>` : ""}
      ${showStats && isCharacter ? `<em class="engine-target-choice-damage ${damage > 0 ? "" : "is-empty"}">${damage}</em>` : ""}
      ${showStats && equipment.length ? `
        <span class="engine-target-choice-equipment" aria-label="Equipamentos anexados">
          ${equipment.map(({ instance: equipmentInstance }) => {
            const equipmentCard = app.cardByCode.get(equipmentInstance.cardId);
            return `<img src="${escapeHtml(getCardArt(equipmentCard))}" alt="${escapeHtml(getCardName(equipmentCard))}" draggable="false" />`;
          }).join("")}
        </span>
      ` : ""}
    </span>
    ${visualOnly ? `
      <span class="engine-target-choice-caption">
        <strong>${escapeHtml(getEngineRefLabel(ref))}</strong>
        <small>${escapeHtml(getEngineRefMeta(ref, kind))}</small>
      </span>
    ` : `
      <strong>${escapeHtml(getEngineRefLabel(ref))}</strong>
      <small>${escapeHtml(getEngineRefMeta(ref, kind))}</small>
    `}
  `;
}

function showEngineTargetChoiceModal({
  title,
  description,
  refs,
  kind = "target",
  visualOnly = false,
  showStats = false,
  allowCancel = false,
  autoSelectSingle = true
}) {
  if (!refs.length) return Promise.resolve(null);
  if (refs.length === 1 && autoSelectSingle && !allowCancel) return Promise.resolve(refs[0]);
  const targetShowStats = showStats || refs.some((ref) => ref.instance || ref.territory);
  return new Promise((resolve) => {
    let overlay = document.getElementById("zoneModal");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "zoneModal";
      overlay.className = "zone-modal";
      document.body.appendChild(overlay);
    }
    app.pendingEngineChoice = { type: "target", title };
    setZoneModalVisibleForRender(overlay);
    overlay.innerHTML = `
      <div class="zone-modal-panel zone-modal-panel--engine-target-choice ${visualOnly ? "is-visual-only" : ""}" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
        <div class="zone-modal-head">
          <div>
            <span>Escolha</span>
            <b>${escapeHtml(title)}</b>
          </div>
        </div>
        <p class="zone-modal-description">${escapeHtml(description)}</p>
        <div class="zone-modal-grid engine-target-choice-grid">
          ${refs.map((ref, index) => {
            return `
              <button class="zone-modal-card engine-target-choice-card" type="button" data-engine-target-choice="${index}">
                ${renderEngineTargetChoiceVisual(ref, kind, { visualOnly, showStats: targetShowStats })}
              </button>
            `;
          }).join("")}
        </div>
        ${allowCancel ? `
          <div class="zone-modal-actions zone-modal-actions--target-choice">
            <button type="button" data-engine-target-cancel>Nao anexar</button>
          </div>
        ` : ""}
      </div>
    `;
    decorateDecisionModal(overlay);
    overlay.querySelectorAll("[data-engine-target-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        closeDecisionModal(overlay);
        app.pendingEngineChoice = null;
        resolve(refs[toNumber(button.dataset.engineTargetChoice, 0)] || null);
      }, { once: true });
    });
    overlay.querySelector("[data-engine-target-cancel]")?.addEventListener("click", () => {
      closeDecisionModal(overlay);
      app.pendingEngineChoice = null;
      resolve(null);
    }, { once: true });
  });
}

function getEngineStackTargetRefs(targetSpec = {}, stackObject, options = {}) {
  const game = stackObject?.payload?.game || app.game;
  if (!game?.stack?.length) return [];
  const controller = targetSpec.controller || "all";
  const objectTypes = targetSpec.objectType || targetSpec.objectTypes;
  const allowedTypes = objectTypes
    ? (Array.isArray(objectTypes) ? objectTypes : [objectTypes]).map(String)
    : [];
  let refs = game.stack
    .map((item, index) => ({ stackObject: item, stackIndex: index }))
    .filter((ref) => ref.stackObject?.id !== stackObject?.id);
  if (allowedTypes.length) {
    refs = refs.filter((ref) => allowedTypes.includes(String(ref.stackObject.type || "ability")));
  }
  if (controller === "controller") {
    refs = refs.filter((ref) => ref.stackObject.controllerId === stackObject.controllerId);
  } else if (controller === "opponent") {
    refs = refs.filter((ref) => ref.stackObject.controllerId !== stackObject.controllerId);
  }
  if (targetSpec.excludeSourceCard) {
    refs = refs.filter((ref) => ref.stackObject.cardId !== stackObject.cardId);
  }
  if (options.ignoreCount) return refs;
  return targetSpec.count === "all" ? refs : refs.slice(0, toNumber(targetSpec.count, 1));
}

function showEngineStackChoiceModal({ title, description, refs }) {
  if (!refs.length) return Promise.resolve(null);
  if (refs.length === 1) return Promise.resolve(refs[0]);
  return new Promise((resolve) => {
    let overlay = document.getElementById("zoneModal");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "zoneModal";
      overlay.className = "zone-modal";
      document.body.appendChild(overlay);
    }
    app.pendingEngineChoice = { type: "stack-target", title };
    setZoneModalVisibleForRender(overlay);
    overlay.innerHTML = `
      <div class="zone-modal-panel zone-modal-panel--engine-stack-choice" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
        <div class="zone-modal-head">
          <div>
            <span>Escolha</span>
            <b>${escapeHtml(title)}</b>
          </div>
        </div>
        <p class="zone-modal-description">${escapeHtml(description)}</p>
        <div class="engine-stack-choice-list">
          ${refs.map((ref, index) => {
            const item = ref.stackObject;
            const controller = getPlayer(app.game, item.controllerId);
            const icon = getStackObjectSourceIcon(item);
            return `
              <button type="button" class="engine-stack-choice-card" data-engine-stack-target="${index}">
                ${icon ? `<img src="${escapeHtml(icon)}" alt="" draggable="false" />` : ""}
                <span>
                  <strong>${escapeHtml(item.label || "Objeto na pilha")}</strong>
                  <small>${escapeHtml(controller?.label || item.controllerId || "Controlador")}</small>
                </span>
              </button>
            `;
          }).join("")}
        </div>
      </div>
    `;
    decorateDecisionModal(overlay);
    overlay.querySelectorAll("[data-engine-stack-target]").forEach((button) => {
      button.addEventListener("click", () => {
        closeDecisionModal(overlay);
        app.pendingEngineChoice = null;
        resolve(refs[toNumber(button.dataset.engineStackTarget, 0)] || null);
      }, { once: true });
    });
  });
}

function chooseBotStackTargetRef(refs, controllerId) {
  return [...refs].sort((left, right) => {
    const leftOwn = left.stackObject.controllerId === controllerId ? 1 : 0;
    const rightOwn = right.stackObject.controllerId === controllerId ? 1 : 0;
    if (leftOwn !== rightOwn) return leftOwn - rightOwn;
    return right.stackIndex - left.stackIndex;
  })[0] || null;
}

async function chooseEngineStackTargetRef(action, stackObject) {
  const refs = getEngineStackTargetRefs(action.target || { zone: "stack", controller: "all" }, stackObject, {
    ignoreCount: Boolean(action.target?.choice)
  });
  if (!refs.length) return null;
  if (stackObject.controllerId !== "human") return chooseBotStackTargetRef(refs, stackObject.controllerId);
  return showEngineStackChoiceModal({
    title: stackObject.label,
    description: localize(action.description) || "Escolha um objeto na pilha para anular.",
    refs
  });
}

function playerControlsSubtype(player, subtype) {
  if (!player) return false;
  return player.battlefield.some((instance) => {
    const card = app.cardByCode.get(instance.cardId);
    return getCardTypeCode(card) === "PER" && cardHasSubtype(card, subtype);
  });
}

function canPayEssenceTax(player, amount) {
  return Boolean(player) && getPotentialAvailableEssence(player) >= Math.max(0, toNumber(amount, 0));
}

function payEssenceTax(player, amount) {
  const cost = Math.max(0, toNumber(amount, 0));
  if (cost <= 0) return true;
  if (!ensureGeneratedEssenceForCost(player, cost)) return false;
  const payment = spendEssenceCost(player, cost);
  return Boolean(payment);
}

function counterStackObject(game, targetObject, sourceLabel = "efeito") {
  if (!game || !targetObject) return false;
  const targetIndex = game.stack.findIndex((item) => item.id === targetObject.id);
  if (targetIndex < 0) return false;
  const [countered] = game.stack.splice(targetIndex, 1);
  if (!countered) return false;
  if (countered.type === "play" && countered.cardId) {
    const owner = getPlayer(game, countered.owner || countered.controllerId);
    if (owner) owner.cemetery.push(countered.cardId);
  }
  addLog(game, `${countered.label} foi anulada por ${sourceLabel}.`, "Pilha");
  playTone("soft");
  renderGame();
  return true;
}

async function chooseEngineTargetRefs(action, stackObject, kind = "target") {
  const targetSpec = action?.target;
  if (!targetSpec) return [];
  const choiceKey = targetSpec.choiceKey || action.choiceKey || "";
  if (choiceKey && stackObject.choiceCache?.[choiceKey]) {
    return [stackObject.choiceCache[choiceKey]];
  }
  const refs = getEngineTargetRefs(targetSpec, stackObject, { ignoreCount: Boolean(targetSpec.choice) });
  if (!targetSpec.choice) return refs;
  const requestedCount = targetSpec.count === "all" ? refs.length : Math.max(1, toNumber(targetSpec.count, 1));
  if (!refs.length) return [];
  if (requestedCount !== 1) return refs.slice(0, requestedCount);
  if (stackObject.controllerId !== "human") {
    const chosen = chooseBotEngineTargetRefForStack(stackObject, refs, kind);
    if (chosen && choiceKey) {
      stackObject.choiceCache ||= {};
      stackObject.choiceCache[choiceKey] = chosen;
    }
    return chosen ? [chosen] : [];
  }
  const visualTargetKinds = new Set(["attach", "control", "buff", "bounce"]);
  const statTargetKinds = new Set(["attach", "control"]);
  const chosen = await showEngineTargetChoiceModal({
    title: stackObject.label,
    description: kind === "heal"
      ? "Escolha um alvo para receber a cura."
      : kind === "buff"
        ? "Escolha um Personagem para receber o bônus."
        : kind === "destroy"
          ? "Escolha um alvo para destruir."
          : kind === "control"
            ? "Escolha um Personagem para tomar o controle ate o fim do turno."
            : "Escolha um alvo para receber o dano.",
    refs,
    kind,
    visualOnly: visualTargetKinds.has(kind),
    showStats: statTargetKinds.has(kind)
  });
  if (chosen && choiceKey) {
    stackObject.choiceCache ||= {};
    stackObject.choiceCache[choiceKey] = chosen;
  }
  return chosen ? [chosen] : [];
}

function showEngineBundleChoiceModal({ title, description, choices }) {
  if (!choices.length) return Promise.resolve(null);
  if (choices.length === 1) return Promise.resolve(choices[0]);
  return new Promise((resolve) => {
    let overlay = document.getElementById("zoneModal");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "zoneModal";
      overlay.className = "zone-modal";
      document.body.appendChild(overlay);
    }
    app.pendingEngineChoice = { type: "bundle", title };
    setZoneModalVisibleForRender(overlay);
    overlay.innerHTML = `
      <div class="zone-modal-panel zone-modal-panel--engine-choice" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
        <div class="zone-modal-head">
          <div>
            <span>Escolha</span>
            <b>${escapeHtml(title)}</b>
          </div>
        </div>
        <p class="zone-modal-description">${escapeHtml(description)}</p>
        <div class="zone-modal-actions zone-modal-actions--choice">
          ${choices.map((choice, index) => `
            <button type="button" data-engine-bundle-choice="${index}">
              ${escapeHtml(localize(choice.label) || choice.id || `Opcao ${index + 1}`)}
            </button>
          `).join("")}
        </div>
      </div>
    `;
    decorateDecisionModal(overlay);
    overlay.querySelectorAll("[data-engine-bundle-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        closeDecisionModal(overlay);
        app.pendingEngineChoice = null;
        resolve(choices[toNumber(button.dataset.engineBundleChoice, 0)] || null);
      }, { once: true });
    });
  });
}

async function chooseEngineEffectBundle(action, stackObject) {
  const validChoices = (action.choices || []).filter((choice) => isEngineChoiceValid(choice, stackObject));
  if (!validChoices.length) return null;
  if (stackObject.controllerId !== "human") return validChoices[0];
  return showEngineBundleChoiceModal({
    title: stackObject.label,
    description: localize(action.description) || "Escolha como deseja resolver esta habilidade.",
    choices: validChoices
  });
}

function getEngineDistributionCandidates(targets, stackObject, kind = "heal") {
  const unique = new Map();
  (targets || []).forEach((targetSpec) => {
    getEngineTargetRefs(targetSpec, stackObject, { ignoreCount: true }).forEach((ref) => {
      const key = getEngineRefKey(ref);
      if (!key) return;
      if (kind === "heal" && getEngineHealingCapacity(ref) <= 0) return;
      unique.set(key, ref);
    });
  });
  return [...unique.values()];
}

function chooseBotDistribution(candidates, total, kind = "heal") {
  const allocations = [];
  if (!candidates.length || total <= 0) return allocations;
  const ordered = [...candidates].sort((left, right) => {
    if (kind === "heal") {
      if (left.territory !== right.territory) return left.territory ? -1 : 1;
      return getEngineHealingCapacity(right) - getEngineHealingCapacity(left);
    }
    if (left.territory !== right.territory) return left.territory ? 1 : -1;
    return getEngineDamageCapacity(left, total) - getEngineDamageCapacity(right, total);
  });
  let remaining = total;
  ordered.forEach((ref) => {
    if (remaining <= 0) return;
    const capacity = kind === "heal" ? getEngineHealingCapacity(ref) : getEngineDamageCapacity(ref, total);
    const amount = Math.min(remaining, Math.max(0, capacity));
    if (amount <= 0) return;
    allocations.push({ ref, amount });
    remaining -= amount;
  });
  return allocations;
}

function showEngineDistributionModal({ title, description, candidates, total, kind = "heal" }) {
  if (!candidates.length || total <= 0) return Promise.resolve([]);
  if (candidates.length === 1) {
    const only = candidates[0];
    const amount = kind === "heal"
      ? Math.min(total, getEngineHealingCapacity(only))
      : total;
    return Promise.resolve(amount > 0 ? [{ ref: only, amount }] : []);
  }
  return new Promise((resolve) => {
    let overlay = document.getElementById("zoneModal");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "zoneModal";
      overlay.className = "zone-modal";
      document.body.appendChild(overlay);
    }
    const allocations = new Map(candidates.map((ref) => [getEngineRefKey(ref), 0]));
    app.pendingEngineChoice = { type: "distribution", title };

    const render = () => {
      const spent = [...allocations.values()].reduce((sum, value) => sum + value, 0);
      setZoneModalVisibleForRender(overlay);
      overlay.innerHTML = `
        <div class="zone-modal-panel zone-modal-panel--engine-distribution" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
          <div class="zone-modal-head">
            <div>
              <span>Distribuição</span>
              <b>${escapeHtml(title)}</b>
            </div>
          </div>
          <p class="zone-modal-description">${escapeHtml(description)}</p>
          <div class="engine-distribution-grid">
            ${candidates.map((ref, index) => {
              const key = getEngineRefKey(ref);
              const allocated = allocations.get(key) || 0;
              const capacity = kind === "heal" ? getEngineHealingCapacity(ref) : getEngineDamageCapacity(ref, total);
              return `
                <article class="engine-distribution-card">
                  ${renderEngineTargetChoiceVisual(ref, kind, { visualOnly: true, showStats: true })}
                  <div class="engine-distribution-controls">
                    <button type="button" data-engine-distribution-minus="${index}" ${allocated <= 0 ? "disabled" : ""}>-</button>
                    <span>${allocated}</span>
                    <button type="button" data-engine-distribution-plus="${index}" ${(spent >= total || allocated >= capacity) ? "disabled" : ""}>+</button>
                  </div>
                </article>
              `;
            }).join("")}
          </div>
          <div class="zone-modal-actions">
            <button type="button" class="primary-action" data-engine-distribution-confirm ${spent === total ? "" : "disabled"}>
              Confirmar (${spent}/${total})
            </button>
          </div>
        </div>
      `;
      decorateDecisionModal(overlay);
      overlay.querySelectorAll("[data-engine-distribution-minus]").forEach((button) => {
        button.addEventListener("click", () => {
          const ref = candidates[toNumber(button.dataset.engineDistributionMinus, 0)];
          const key = getEngineRefKey(ref);
          allocations.set(key, Math.max(0, (allocations.get(key) || 0) - 1));
          render();
        }, { once: true });
      });
      overlay.querySelectorAll("[data-engine-distribution-plus]").forEach((button) => {
        button.addEventListener("click", () => {
          const ref = candidates[toNumber(button.dataset.engineDistributionPlus, 0)];
          const key = getEngineRefKey(ref);
          const capacity = kind === "heal" ? getEngineHealingCapacity(ref) : getEngineDamageCapacity(ref, total);
          allocations.set(key, Math.min(capacity, (allocations.get(key) || 0) + 1));
          render();
        }, { once: true });
      });
      overlay.querySelector("[data-engine-distribution-confirm]")?.addEventListener("click", () => {
        closeDecisionModal(overlay);
        app.pendingEngineChoice = null;
        resolve(candidates
          .map((ref) => ({ ref, amount: allocations.get(getEngineRefKey(ref)) || 0 }))
          .filter((entry) => entry.amount > 0));
      }, { once: true });
    };

    render();
  });
}

function getStackPlayerId(value, stackObject) {
  if (!value || value === "controller") return stackObject.controllerId;
  if (value === "active") return stackObject.payload?.game?.activePlayer || app.game.activePlayer;
  if (value === "opponent") return getOpponentId(stackObject.controllerId);
  if (value === "eventPlayer") return stackObject.payload?.playerId || stackObject.controllerId;
  return value;
}

function getActionAmount(value, fallback = 0) {
  if (value === "all") return Number.POSITIVE_INFINITY;
  return toNumber(value, fallback);
}

function getEngineTargetRefs(targetSpec, stackObject, options = {}) {
  const game = stackObject.payload?.game || app.game;
  if (!game || !targetSpec) return [];

  if (targetSpec === "source") {
    const instance = getEngineSourceInstance(stackObject.source, game);
    return instance ? [{ playerId: stackObject.source.controllerId, instance }] : [];
  }

  if (targetSpec === "attachedCharacter" || targetSpec.zone === "attachedCharacter") {
    const equipment = getEngineSourceInstance(stackObject.source, game);
    const targetRef = getEquipmentAttachmentTarget(equipment, game);
    if (!targetRef) return [];
    const card = app.cardByCode.get(targetRef.instance.cardId);
    if (targetSpec.type && getCardTypeCode(card) !== targetSpec.type) return [];
    return [{ playerId: targetRef.playerId, instance: targetRef.instance }];
  }

  if (targetSpec === "damageSource") {
    const damageSource = stackObject.payload?.source;
    if (!damageSource?.playerId || !damageSource?.uid) return [];
    const instance = findBattlefieldInstance(getPlayer(game, damageSource.playerId), damageSource.uid);
    return instance ? [{ playerId: damageSource.playerId, instance }] : [];
  }

  if (targetSpec === "damageTarget") {
    const damageTarget = stackObject.payload?.target || stackObject.payload?.damageTarget;
    if (!damageTarget?.playerId || !damageTarget?.uid) return [];
    const instance = findBattlefieldInstance(getPlayer(game, damageTarget.playerId), damageTarget.uid);
    return instance ? [{ playerId: damageTarget.playerId, instance }] : [];
  }

  if (targetSpec === "eventPermanent" || targetSpec.zone === "eventPermanent") {
    const playerId = stackObject.payload?.playerId;
    const instanceUid = stackObject.payload?.instanceUid;
    if (!playerId || !instanceUid) return [];
    const instance = findBattlefieldInstance(getPlayer(game, playerId), instanceUid);
    if (!instance) return [];
    const card = app.cardByCode.get(instance.cardId);
    if (targetSpec.type && getCardTypeCode(card) !== targetSpec.type) return [];
    return [{ playerId, instance }];
  }

  if (targetSpec === "eventAttackers" || targetSpec.zone === "eventAttackers") {
    const attackerId = stackObject.payload?.attackerId || stackObject.controllerId;
    const attacker = getPlayer(game, attackerId);
    let refs = (stackObject.payload?.attackers || [])
      .map((item) => findBattlefieldInstance(attacker, item.uid))
      .filter(Boolean)
      .map((instance) => ({ playerId: attackerId, instance }));
    if (targetSpec.type) {
      refs = refs.filter(({ instance }) => getCardTypeCode(app.cardByCode.get(instance.cardId)) === targetSpec.type);
    }
    if (targetSpec.damaged) {
      refs = refs.filter(({ instance }) => isDamagedCharacterInstance(instance));
    }
    if (targetSpec.power) {
      refs = refs.filter(({ instance }) => evaluateNumericRule(getCharacterPower(instance), targetSpec.power));
    }
    if (targetSpec.resistance) {
      refs = refs.filter(({ instance }) => evaluateNumericRule(getCharacterResistance(instance), targetSpec.resistance));
    }
    if (options.ignoreCount) return refs;
    return targetSpec.count === "all" ? refs : refs.slice(0, toNumber(targetSpec.count, refs.length));
  }

  if (targetSpec.zone === "battlefield") {
    const controller = targetSpec.controller === "opponent" ? getOpponentId(stackObject.controllerId) : getStackPlayerId(targetSpec.controller, stackObject);
    const players = controller === "all"
      ? Object.values(game.players)
      : [getPlayer(game, controller)].filter(Boolean);
    const refs = [];
    players.forEach((player) => {
      player.battlefield.forEach((instance) => {
        const card = app.cardByCode.get(instance.cardId);
        if (targetSpec.type && getCardTypeCode(card) !== targetSpec.type) return;
        if (targetSpec.excludeSource && stackObject.source?.instanceUid === instance.uid && stackObject.source?.controllerId === player.id) return;
        if (targetSpec.choice && isProtectedFromStackController(instance, player.id, stackObject)) return;
        if (typeof targetSpec.exhausted === "boolean" && Boolean(instance.exhausted) !== targetSpec.exhausted) return;
        if (targetSpec.power && !evaluateNumericRule(getCharacterPower(instance), targetSpec.power)) return;
        if (targetSpec.resistance && !evaluateNumericRule(getCharacterResistance(instance), targetSpec.resistance)) return;
        if (targetSpec.damaged && toNumber(instance.damage, 0) <= 0) return;
        refs.push({ playerId: player.id, instance });
      });
    });
    if (options.ignoreCount) return refs;
    return targetSpec.count === "all" ? refs : refs.slice(0, toNumber(targetSpec.count, 1));
  }

  if (targetSpec.zone === "territory") {
    const controller = targetSpec.controller === "opponent" ? getOpponentId(stackObject.controllerId) : getStackPlayerId(targetSpec.controller, stackObject);
    const players = controller === "all"
      ? Object.values(game.players)
      : [getPlayer(game, controller)].filter(Boolean);
    const refs = players.map((player) => ({ playerId: player.id, territory: true }));
    if (options.ignoreCount) return refs;
    return targetSpec.count === "all" ? refs : refs.slice(0, toNumber(targetSpec.count, 1));
  }

  return [];
}

function moveHandCardsToDeck(player, selected, placement = "bottom") {
  const moved = [];
  selected.forEach((cardId) => {
    const index = player.hand.indexOf(cardId);
    if (index >= 0) moved.push(player.hand.splice(index, 1)[0]);
  });
  if (placement === "top") {
    [...moved].reverse().forEach((cardId) => player.deck.unshift(cardId));
    return moved;
  }
  moved.forEach((cardId) => player.deck.push(cardId));
  return moved;
}

async function executeEngineAction(action, stackObject, options = {}) {
  const game = stackObject.payload?.game || app.game;
  const effectId = action.effect;

  if (effectId === "cover_champion") {
    const player = getPlayer(game, getStackPlayerId(action.player || "controller", stackObject));
    if (!player || player.championCovered) return false;
    player.championCovered = true;
    addLog(game, "encobriu seu Campeao.", player.label);
    renderGame();
    return true;
  }

  if (effectId === "draw_cards") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    const { drawn, missing, fatigueDamage } = drawCardsWithFatigue(player, getActionAmount(action.amount, 0));
    addPlayerStat(game, "cardsDrawn", player.id, drawn.length);
    addLog(game, `comprou ${drawn.length} carta${drawn.length === 1 ? "" : "s"} por efeito.`, player.label);
    if (missing > 0) addLog(game, `sofreu fadiga por nao conseguir comprar ${missing} carta${missing === 1 ? "" : "s"}.`, player.label);
    if (fatigueDamage > 0) {
      renderGame();
      await animateResolutionEvents([{ type: "territory", playerId: player.id, amount: fatigueDamage }], "damage");
    }
    return true;
  }

  if (effectId === "put_cards_from_hand_on_bottom") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    const requestedAmount = getActionAmount(action.amount, 0);
    if (Number.isFinite(requestedAmount) && player.hand.length < requestedAmount) return false;
    const amount = Math.min(requestedAmount, player.hand.length);
    if (amount <= 0) return false;
    const selected = player.id === "human" && action.choice === "manual"
      ? await showEngineHandChoiceModal(player, amount, {
        title: stackObject.label,
        description: `Escolha ${amount} carta${amount === 1 ? "" : "s"} da sua mao para colocar no fundo do baralho.`,
        confirmText: "Colocar no fundo"
      })
      : player.id === "human"
        ? player.hand.slice(0, amount)
        : chooseBotCardsForBottom(player, amount);
    const moved = moveHandCardsToDeck(player, selected, "bottom");
    addLog(game, `colocou ${moved.length} carta${moved.length === 1 ? "" : "s"} no fundo do baralho.`, player.label);
    return moved.length === amount;
  }

  if (effectId === "put_cards_from_hand_on_top") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    const requestedAmount = getActionAmount(action.amount, 0);
    if (Number.isFinite(requestedAmount) && player.hand.length < requestedAmount) return false;
    const amount = Math.min(requestedAmount, player.hand.length);
    if (amount <= 0) return false;
    const selected = player.id === "human" && action.choice === "manual"
      ? await showEngineHandChoiceModal(player, amount, {
        title: stackObject.label,
        description: `Escolha ${amount} carta${amount === 1 ? "" : "s"} da sua mao para colocar no topo do baralho.`,
        confirmText: "Colocar no topo"
      })
      : player.id === "human"
        ? player.hand.slice(0, amount)
        : chooseBotCardsForBottom(player, amount);
    const moved = moveHandCardsToDeck(player, selected, "top");
    addLog(game, `colocou ${moved.length} carta${moved.length === 1 ? "" : "s"} no topo do baralho.`, player.label);
    return moved.length === amount;
  }

  if (effectId === "review_top_cards") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    const amount = Math.min(getActionAmount(action.amount, 0), player?.deck?.length || 0);
    if (!player || amount <= 0) return false;
    const topCards = player.deck.slice(0, amount);
    const maxCemetery = Math.max(0, toNumber(action.maxCemetery, 0));
    const decision = player.id === "human"
      ? await showEngineDeckReviewModal(player, topCards, {
        title: stackObject.label,
        description: localize(action.description) || "Revise o topo do seu baralho, organize o topo e o fundo e envie ate uma carta ao cemiterio quando permitido.",
        maxCemetery
      })
      : chooseBotDeckReviewPlan(player, topCards, maxCemetery);
    if (!decision) return false;
    const result = applyDeckReviewDecision(player, decision);
    if (!result.reviewedCount) return false;
    addLog(
      game,
      `revisou ${result.reviewedCount} carta${result.reviewedCount === 1 ? "" : "s"} do topo (${result.top.length} topo, ${result.bottom.length} fundo${result.cemetery.length ? `, ${result.cemetery.length} cemiterio` : ""}).`,
      player.label
    );
    renderGame();
    return true;
  }

  if (effectId === "reorder_top_cards") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    const amount = Math.min(getActionAmount(action.amount, 0), player?.deck?.length || 0);
    if (!player || amount <= 0) return false;
    const topCards = player.deck.slice(0, amount);
    const decision = player.id === "human"
      ? await showEngineDeckReviewModal(player, topCards, {
        title: stackObject.label,
        description: localize(action.description) || "Reordene as cartas do topo do seu baralho.",
        maxCemetery: 0,
        allowBottom: false
      })
      : { top: [...topCards].sort((a, b) => scoreBotDeckReviewCard(player, b) - scoreBotDeckReviewCard(player, a)), bottom: [], cemetery: [] };
    if (!decision) return false;
    const result = applyDeckReviewDecision(player, decision);
    addLog(game, `reordenou ${result.top.length} carta${result.top.length === 1 ? "" : "s"} do topo.`, player.label);
    renderGame();
    return result.reviewedCount > 0;
  }

  if (effectId === "top_cards_to_hand_bottom") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    const amount = Math.min(getActionAmount(action.amount, 0), player?.deck?.length || 0);
    if (!player || amount <= 0) return false;
    const topCards = player.deck.slice(0, amount);
    const entries = topCards.map((cardId, index) => ({ cardId, index, zone: "top" }));
    const chosen = player.id === "human"
      ? await showEngineSingleCardChoiceModal({
        title: stackObject.label,
        description: localize(action.description) || "Escolha uma carta para colocar na mão. O restante irá para o fundo do baralho.",
        entries,
        confirmText: "Colocar na mão"
      })
      : chooseBotCardEntry(entries, player);
    if (!chosen) return false;
    player.deck.splice(0, amount);
    const chosenCardId = topCards[chosen.index];
    player.hand.push(chosenCardId);
    topCards.forEach((cardId, index) => {
      if (index !== chosen.index) player.deck.push(cardId);
    });
    addLog(game, `colocou ${getCardName(app.cardByCode.get(chosenCardId))} na mao pelo topo do baralho.`, player.label);
    renderGame();
    return true;
  }

  if (effectId === "top_lowest_type_to_hand_bottom") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    const amount = Math.min(getActionAmount(action.amount, 0), player?.deck?.length || 0);
    if (!player || amount <= 0) return false;
    const topCards = player.deck.slice(0, amount);
    await showRevealCardsAnimation(topCards, player.id, {
      title: stackObject.label,
      detail: `${player.label} revelou ${amount} carta${amount === 1 ? "" : "s"} do topo.`
    });
    const typeFilter = action.filter?.type || action.type || "PER";
    const matching = topCards
      .map((cardId, index) => ({ cardId, index, zone: "top" }))
      .filter((entry) => cardMatchesTypeFilter(app.cardByCode.get(entry.cardId), { type: typeFilter }));
    const minimumCost = matching.reduce((min, entry) => Math.min(min, getCost(app.cardByCode.get(entry.cardId))), Infinity);
    const candidates = matching.filter((entry) => getCost(app.cardByCode.get(entry.cardId)) === minimumCost);
    const chosen = candidates.length
      ? player.id === "human"
        ? await showEngineSingleCardChoiceModal({
          title: stackObject.label,
          description: localize(action.description) || "Escolha uma carta de menor custo entre as reveladas para colocar na mão.",
          entries: candidates.map((entry) => ({ ...entry, meta: `Custo ${getCost(app.cardByCode.get(entry.cardId))}` })),
          confirmText: "Colocar na mão"
        })
        : chooseBotCardEntry(candidates, player)
      : null;
    player.deck.splice(0, amount);
    if (chosen) {
      const chosenCardId = topCards[chosen.index];
      player.hand.push(chosenCardId);
      topCards.forEach((cardId, index) => {
        if (index !== chosen.index) player.deck.push(cardId);
      });
      addLog(game, `revelou ${amount} carta${amount === 1 ? "" : "s"} e colocou ${getCardName(app.cardByCode.get(chosenCardId))} na mao.`, player.label);
    } else {
      topCards.forEach((cardId) => player.deck.push(cardId));
      addLog(game, `revelou ${amount} carta${amount === 1 ? "" : "s"}, mas nao encontrou carta valida.`, player.label);
    }
    renderGame();
    return true;
  }

  if (effectId === "move_cemetery_card_to_hand") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    const entries = getFilteredCemeteryEntries(player, action.filter || {});
    const chosen = player?.id === "human"
      ? await showEngineSingleCardChoiceModal({
        title: stackObject.label,
        description: localize(action.description) || "Escolha uma carta do seu cemitério para retornar à mão.",
        entries,
        confirmText: "Retornar"
      })
      : chooseBotCardEntry(entries, player);
    if (!player || !chosen) return false;
    const [cardId] = player.cemetery.splice(chosen.index, 1);
    if (!cardId) return false;
    player.hand.push(cardId);
    addLog(game, `retornou ${getCardName(app.cardByCode.get(cardId))} do cemiterio para a mao.`, player.label);
    renderGame();
    return true;
  }

  if (effectId === "search_library_to_top") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    const entries = getFilteredDeckEntries(player, action.filter || {});
    const chosen = player?.id === "human"
      ? await showEngineSingleCardChoiceModal({
        title: stackObject.label,
        description: localize(action.description) || "Escolha uma carta do seu baralho para colocar no topo.",
        entries,
        confirmText: "Colocar no topo"
      })
      : chooseBotCardEntry(entries, player);
    if (!player || !chosen) return false;
    const [cardId] = player.deck.splice(chosen.index, 1);
    if (!cardId) return false;
    if (!action.secret) {
      await showRevealCardsAnimation([cardId], player.id, {
        title: stackObject.label,
        detail: `${player.label} revelou a carta buscada.`
      });
    }
    if (action.shuffleAfter) player.deck = shuffle(player.deck, `${game.id}-${game.turnNumber}-${stackObject.abilityId}`);
    player.deck.unshift(cardId);
    addLog(game, `buscou ${getCardName(app.cardByCode.get(cardId))} e colocou no topo do baralho.`, player.label);
    renderGame();
    return true;
  }

  if (effectId === "search_library_or_reserve_to_hand") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    const entries = [
      ...getFilteredDeckEntries(player, action.filter || {}),
      ...getFilteredReserveEntries(player, action.filter || {})
    ].map((entry) => ({ ...entry, meta: entry.zone === "reserve" ? "Reserva" : "Baralho" }));
    const chosen = player?.id === "human"
      ? await showEngineSingleCardChoiceModal({
        title: stackObject.label,
        description: localize(action.description) || "Escolha uma carta do seu baralho ou da Reserva para colocar na mão.",
        entries,
        confirmText: "Colocar na mão"
      })
      : chooseBotCardEntry(entries, player);
    if (!player || !chosen) return false;
    const zone = chosen.zone === "reserve" ? player.reserve : player.deck;
    const [cardId] = zone.splice(chosen.index, 1);
    if (!cardId) return false;
    if (!action.secret) {
      await showRevealCardsAnimation([cardId], player.id, {
        title: stackObject.label,
        detail: `${player.label} revelou a carta buscada.`
      });
    }
    if (chosen.zone === "deck" && action.shuffleAfter !== false) {
      player.deck = shuffle(player.deck, `${game.id}-${game.turnNumber}-${stackObject.abilityId}`);
    }
    player.hand.push(cardId);
    addLog(game, `buscou ${getCardName(app.cardByCode.get(cardId))} e colocou na mao.`, player.label);
    renderGame();
    return true;
  }

  if (effectId === "pulverize") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    const amount = getActionAmount(action.amount, 0);
    if (!player || amount <= 0) return false;
    const { milled, missing, fatigueDamage } = pulverizeCards(player, amount);
    addLog(game, `pulverizou ${milled.length} carta${milled.length === 1 ? "" : "s"}.`, player.label);
    if (missing > 0) addLog(game, `sofreu fadiga por nao conseguir pulverizar ${missing} carta${missing === 1 ? "" : "s"}.`, player.label);
    renderGame();
    if (milled.length) {
      await showPulverizeAnimation(milled, player.id);
    }
    if (fatigueDamage > 0) {
      await animateResolutionEvents([{ type: "territory", playerId: player.id, amount: fatigueDamage }], "damage");
    }
    return true;
  }

  if (effectId === "tap_essence") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    const requestedAmount = getActionAmount(action.amount, 0);
    const amount = action.upTo
      ? Math.min(requestedAmount, getReadyEssenceCount(player))
      : requestedAmount;
    if (!player) return false;
    if (amount <= 0) return action.upTo ? true : false;
    if (getReadyEssenceCount(player) < amount) return false;
    player.spentEssence = Math.min(player.essence.length, toNumber(player.spentEssence, 0) + amount);
    showEssenceBurst(player.id, amount, "spend");
    addLog(game, `desativou ${amount} Essencia${amount === 1 ? "" : "s"}.`, player.label);
    return true;
  }

  if (effectId === "untap_essence") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    const requestedAmount = getActionAmount(action.amount, 0);
    const amount = Math.min(requestedAmount, toNumber(player?.spentEssence, 0));
    if (!player || amount <= 0) return action.upTo ? true : false;
    player.spentEssence = Math.max(0, toNumber(player.spentEssence, 0) - amount);
    addLog(game, `ativou ${amount} Essencia${amount === 1 ? "" : "s"}.`, player.label);
    return true;
  }

  if (effectId === "generate_essence") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    const amount = getActionAmount(action.amount, 0);
    const generated = generateEssence(player, amount, {
      sourceUid: stackObject.source?.instanceUid || ""
    });
    if (generated <= 0) return false;
    addLog(game, `gerou ${generated} {E}.`, player.label);
    return true;
  }

  if (effectId === "reduce_next_cost") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    const amount = getActionAmount(action.amount, 0);
    if (!player || amount <= 0) return false;
    createTemporaryEffect(game, {
      controllerId: player.id,
      type: "nextPlayCostDiscount",
      amount,
      duration: action.duration || "until_regroup",
      source: stackObject.source,
      label: stackObject.label
    });
    addLog(game, `a próxima carta de ${player.label} custa ${amount} Essência${amount === 1 ? "" : "s"} a menos.`, "Engine");
    return true;
  }

  if (effectId === "discard_cards") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    const requestedAmount = getActionAmount(action.amount, 0);
    if (!player || requestedAmount <= 0) return false;
    const amount = action.upTo ? Math.min(requestedAmount, player.hand.length) : requestedAmount;
    if (amount <= 0) return Boolean(action.upTo);
    if (player.hand.length < amount) return false;
    const selected = action.choice === "random"
      ? shuffle([...player.hand], `${game.id}-${game.engineEventSeq}-${stackObject.abilityId}`).slice(0, amount)
      : player.id === "human" && action.choice === "manual"
        ? await showEngineHandChoiceModal(player, amount, {
          title: stackObject.label,
          description: `Escolha ${amount} carta${amount === 1 ? "" : "s"} da sua mao para descartar.`,
          confirmText: "Descartar"
        })
        : Array.from({ length: amount }, () => chooseBotDiscardCard(player)).filter(Boolean);
    const discarded = selected
      .map((cardId) => discardCardFromHand(player, cardId))
      .filter(Boolean);
    if (discarded.length < amount) return false;
    addLog(game, `descartou ${discarded.length} carta${discarded.length === 1 ? "" : "s"}.`, player.label);
    return true;
  }

  if (effectId === "create_token") {
    const player = getPlayer(game, getStackPlayerId(action.controller || action.player, stackObject));
    if (!player) return false;
    const amount = Math.max(1, getActionAmount(action.amount, 1));
    const created = [];
    const tokenCard = app.cardByCode.get(getTokenCardId(action.tokenId));
    if (isIncenseTokenCard(tokenCard)) {
      const instance = addIncenseTokensToBattlefield(player, amount, action.state || {});
      if (!instance) return false;
      for (let index = 0; index < amount; index += 1) {
        emitGameEvent("permanent.enters_battlefield", {
          game,
          playerId: player.id,
          instanceUid: instance.uid,
          cardId: instance.cardId,
          tokenId: instance.tokenId,
          tokenQuantity: getTokenQuantity(instance)
        });
      }
      addLog(game, `criou ${amount} ficha${amount === 1 ? "" : "s"} de ${getCardName(tokenCard)}.`, player.label);
      return true;
    }
    for (let index = 0; index < amount; index += 1) {
      const instance = createTokenInstance(action.tokenId, player.id, action.state || {});
      if (!instance) continue;
      player.battlefield.push(instance);
      created.push(instance);
      if (action.combatTarget === "same_as_source_attacker" && stackObject.source?.instanceUid) {
        const sourceTarget = getAttackTarget(player.id, stackObject.source.instanceUid);
        if (sourceTarget && game.combat?.attackerId === player.id && game.combat.attackers.includes(stackObject.source.instanceUid)) {
          instance.exhausted = true;
          instance.declaredAttacker = true;
          game.combat.attackers.push(instance.uid);
          game.combat.attackTargets[instance.uid] = { ...sourceTarget };
        }
      }
      emitGameEvent("permanent.enters_battlefield", {
        game,
        playerId: player.id,
        instanceUid: instance.uid,
        cardId: instance.cardId,
        tokenId: instance.tokenId
      });
    }
    if (!created.length) return false;
    addLog(game, `criou ${created.length} ficha${created.length === 1 ? "" : "s"} de ${getCardName(app.cardByCode.get(created[0].cardId))}.`, player.label);
    return true;
  }

  if (effectId === "heal_territory") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    const amount = getActionAmount(action.amount, 0);
    const healed = Math.min(amount, player.territoryDamage);
    player.territoryDamage = Math.max(0, player.territoryDamage - healed);
    if (healed > 0) {
      renderGame();
      addLog(game, `curou ${healed} de dano do territorio.`, player.label);
      emitGameEvent("heal.applied", {
        game,
        source: stackObject.source,
        target: { type: "territory", playerId: player.id },
        amount: healed
      }, { resolveImmediately: true });
      await animateResolutionEvents([{ type: "territory", playerId: player.id, amount: healed }], "heal");
    }
    return true;
  }

  if (effectId === "heal_character") {
    const healedEvents = [];
    const refs = await chooseEngineTargetRefs(action, stackObject, "heal");
    refs.forEach(({ playerId, instance }) => {
      const amount = getActionAmount(action.amount, 0);
      const healed = Math.min(amount, toNumber(instance.damage, 0));
      instance.damage = Math.max(0, toNumber(instance.damage, 0) - healed);
      if (healed > 0) {
        addLog(game, `curou ${healed} de dano de ${getCardName(app.cardByCode.get(instance.cardId))}.`, getPlayer(game, playerId).label);
        emitGameEvent("heal.applied", {
          game,
          source: stackObject.source,
          target: { type: "character", playerId, uid: instance.uid, cardId: instance.cardId },
          amount: healed
        }, { resolveImmediately: true });
        healedEvents.push({ type: "character", playerId, uid: instance.uid, amount: healed });
      }
    });
    if (healedEvents.length) {
      renderGame();
      await animateResolutionEvents(healedEvents, "heal");
    }
    return true;
  }

  if (effectId === "choose_effect_bundle") {
    const choice = await chooseEngineEffectBundle(action, stackObject);
    if (!choice) {
      addLog(game, `${stackObject.label} nao encontrou escolha valida.`, "Engine");
      return false;
    }
    for (const nestedCost of choice.costs || []) {
      const paid = await executeEngineAction(nestedCost, stackObject, { isCost: true });
      if (paid === false) return false;
    }
    for (const nestedAction of choice.actions || []) {
      await executeEngineAction(nestedAction, stackObject, options);
    }
    return true;
  }

  if (effectId === "tap" || effectId === "untap") {
    const exhausted = effectId === "tap";
    getEngineTargetRefs(action.target, stackObject).forEach(({ instance }) => {
      instance.exhausted = exhausted;
    });
    return true;
  }

  if (effectId === "attach_equipment") {
    const equipmentRefs = getEngineTargetRefs(action.equipment || "source", stackObject, { ignoreCount: true });
    const targetRefs = action.target?.choice
      ? await chooseEngineTargetRefs(action, stackObject, "attach")
      : getEngineTargetRefs(action.target, stackObject, { ignoreCount: true });
    let attached = 0;
    equipmentRefs.forEach((equipmentRef) => {
      const targetRef = targetRefs.find((candidate) =>
        canAttachEquipmentTo(equipmentRef.instance, candidate.instance, equipmentRef.playerId, candidate.playerId)
      );
      if (targetRef && attachEquipmentTo(game, equipmentRef, targetRef)) attached += 1;
    });
    if (attached) {
      renderGame();
      playTone("soft");
    }
    return attached > 0;
  }

  if (effectId === "detach_equipment") {
    const refs = getEngineTargetRefs(action.equipment || action.target || "source", stackObject, { ignoreCount: true });
    let detached = 0;
    refs.forEach(({ playerId, instance }) => {
      if (!instance?.attachedTo) return;
      const card = app.cardByCode.get(instance.cardId);
      if (detachEquipmentInstance(instance)) {
        detached += 1;
        addLog(game, `${getCardName(card)} foi desanexado.`, getPlayer(game, playerId)?.label || "Engine");
      }
    });
    if (detached) {
      destroyLethalCharacters(game);
      checkGameEnd(game);
      renderGame();
    }
    return detached > 0;
  }

  if (effectId === "return_permanent_to_hand") {
    const refs = await chooseEngineTargetRefs(action, stackObject, "bounce");
    refs.forEach(({ playerId, instance }) => {
      const card = app.cardByCode.get(instance.cardId);
      const returned = removeBattlefieldCardToZone(game, playerId, instance, "hand");
      if (returned) addLog(game, `${getCardName(card)} retornou para a mao de seu dono.`, getPlayer(game, playerId).label);
    });
    destroyLethalCharacters(game);
    checkGameEnd(game);
    renderGame();
    return refs.length > 0;
  }

  if (effectId === "gain_control") {
    const refs = await chooseEngineTargetRefs(action, stackObject, "control");
    let moved = 0;
    refs.forEach(({ playerId, instance }) => {
      const currentController = getPlayer(game, playerId);
      const newController = getPlayer(game, getStackPlayerId(action.controller || action.player || "controller", stackObject));
      if (!currentController || !newController || !instance) return;
      const card = app.cardByCode.get(instance.cardId);
      if (currentController.id !== newController.id) {
        currentController.battlefield = currentController.battlefield.filter((item) => item.uid !== instance.uid);
        newController.battlefield.push(instance);
        createTemporaryEffect(game, {
          controllerId: stackObject.controllerId,
          type: "temporaryControl",
          target: { uid: instance.uid, playerId: instance.owner },
          previousControllerId: currentController.id,
          newControllerId: newController.id,
          duration: action.duration || "until_regroup",
          source: stackObject.source,
          label: stackObject.label
        });
        moved += 1;
        addLog(game, `${newController.label} ganhou controle de ${getCardName(card)} ate o Reagrupamento.`, "Engine");
      }
      if (action.untapAfter || action.readyAfter) {
        instance.exhausted = false;
        addLog(game, `${getCardName(card)} foi preparado.`, newController.label);
      }
    });
    renderGame();
    return refs.length > 0 && (moved > 0 || Boolean(action.untapAfter || action.readyAfter));
  }

  if (effectId === "renounce_permanent") {
    const players = action.player === "all"
      ? Object.values(game.players)
      : [getPlayer(game, getStackPlayerId(action.player, stackObject))].filter(Boolean);
    let renounced = 0;
    for (const player of players) {
      const refs = player.battlefield
        .filter((instance) => cardMatchesTypeFilter(app.cardByCode.get(instance.cardId), action.filter || action.target || {}))
        .map((instance) => ({ playerId: player.id, instance }));
      const chosen = player.id === "human"
        ? await showEngineTargetChoiceModal({
          title: stackObject.label,
          description: localize(action.description) || "Escolha um permanente para renunciar.",
          refs,
          kind: "destroy"
        })
        : chooseBotEngineTargetRefForStack(stackObject, refs, "renounce");
      if (!chosen) continue;
      const card = app.cardByCode.get(chosen.instance.cardId);
      if (removeBattlefieldCardToZone(game, chosen.playerId, chosen.instance, "cemetery")) {
        renounced += 1;
        addLog(game, `renunciou ${getCardName(card)}.`, getPlayer(game, chosen.playerId).label);
      }
    }
    destroyLethalCharacters(game);
    checkGameEnd(game);
    renderGame();
    if (renounced > 0) await wait(360);
    return renounced > 0;
  }

  if (effectId === "modify_power_resistance") {
    const refs = await chooseEngineTargetRefs(action, stackObject, "buff");
    const power = toNumber(action.power, 0);
    const resistance = toNumber(action.resistance, 0);
    refs.forEach(({ playerId, instance }) => {
      createTemporaryEffect(game, {
        controllerId: stackObject.controllerId,
        type: "modifyStats",
        target: { playerId, uid: instance.uid },
        power,
        resistance,
        duration: action.duration || "until_regroup",
        source: stackObject.source,
        label: stackObject.label
      });
    });
    if (refs.length) {
      addLog(game, `${stackObject.label}: ${formatSignedStat(power)}/${formatSignedStat(resistance)} ate o Reagrupamento.`, "Engine");
      if (!markPositiveStatFeedback(refs, power, resistance)) renderGame();
    }
    return refs.length > 0;
  }

  if (effectId === "grant_keyword") {
    const refs = await chooseEngineTargetRefs(action, stackObject, "buff");
    refs.forEach(({ playerId, instance }) => {
      createTemporaryEffect(game, {
        controllerId: stackObject.controllerId,
        type: "keyword",
        target: { playerId, uid: instance.uid },
        keyword: action.keyword,
        duration: action.duration || "until_regroup",
        source: stackObject.source,
        label: stackObject.label
      });
      addLog(game, `${getCardName(app.cardByCode.get(instance.cardId))} recebeu ${action.keyword} ate o Reagrupamento.`, getPlayer(game, playerId).label);
    });
    renderGame();
    return refs.length > 0;
  }

  if (effectId === "protect_from_opponents") {
    const refs = await chooseEngineTargetRefs(action, stackObject, "buff");
    refs.forEach(({ playerId, instance }) => {
      createTemporaryEffect(game, {
        controllerId: stackObject.controllerId,
        type: "cantBeTargetedByOpponents",
        target: { playerId, uid: instance.uid },
        duration: action.duration || "until_regroup",
        source: stackObject.source,
        label: stackObject.label
      });
      addLog(game, `${getCardName(app.cardByCode.get(instance.cardId))} nao pode ser alvo dos oponentes ate o Reagrupamento.`, getPlayer(game, playerId).label);
    });
    renderGame();
    return refs.length > 0;
  }

  if (effectId === "prevent_damage_to_character") {
    const refs = await chooseEngineTargetRefs(action, stackObject, "buff");
    refs.forEach(({ playerId, instance }) => {
      createTemporaryEffect(game, {
        controllerId: stackObject.controllerId,
        type: "preventDamageToInstance",
        target: { playerId, uid: instance.uid },
        duration: action.duration || "until_regroup",
        source: stackObject.source,
        label: stackObject.label
      });
      addLog(game, `${getCardName(app.cardByCode.get(instance.cardId))} teve dano prevenido ate o Reagrupamento.`, getPlayer(game, playerId).label);
    });
    renderGame();
    return refs.length > 0;
  }

  if (effectId === "set_base_resistance") {
    const refs = await chooseEngineTargetRefs(action, stackObject, "target");
    refs.forEach(({ playerId, instance }) => {
      createTemporaryEffect(game, {
        controllerId: stackObject.controllerId,
        type: "setBaseResistance",
        target: { playerId, uid: instance.uid },
        value: toNumber(action.value, 0),
        duration: action.duration || "until_regroup",
        source: stackObject.source,
        label: stackObject.label
      });
    });
    return refs.length > 0;
  }

  if (effectId === "deal_damage") {
    const amount = getActionAmount(action.amount, 0);
    const refs = await chooseEngineTargetRefs(action, stackObject, action.damageAsCost ? "self-damage" : "damage");
    for (const ref of refs) {
      if (ref.territory) {
        await applyEffectDamageEvent(game, {
          type: "territory",
          playerId: ref.playerId,
          amount,
          reason: stackObject.label,
          source: stackObject.source,
          damageType: action.damageType || "effect",
          damageAsCost: Boolean(action.damageAsCost)
        });
        continue;
      }
      await applyEffectDamageEvent(game, {
        type: "character",
        playerId: ref.playerId,
        uid: ref.instance.uid,
        amount,
        reason: stackObject.label,
        source: stackObject.source,
        damageType: action.damageType || "effect",
        damageAsCost: Boolean(action.damageAsCost)
      });
    }
    destroyLethalCharacters(game);
    checkGameEnd(game);
    return true;
  }

  if (effectId === "distribute_healing") {
    const total = getActionAmount(action.amount, 0);
    const candidates = getEngineDistributionCandidates(action.targets || [], stackObject, "heal");
    const allocations = stackObject.controllerId === "human"
      ? await showEngineDistributionModal({
        title: stackObject.label,
        description: localize(action.description) || "Distribua a cura entre os alvos válidos.",
        candidates,
        total,
        kind: "heal"
      })
      : chooseBotDistribution(candidates, total, "heal");
    const healedEvents = [];
    allocations.forEach(({ ref, amount }) => {
      if (amount <= 0) return;
      if (ref.territory) {
        const player = getPlayer(game, ref.playerId);
        const healed = Math.min(amount, player.territoryDamage);
        player.territoryDamage = Math.max(0, player.territoryDamage - healed);
        if (healed > 0) {
          addLog(game, `curou ${healed} de dano do territorio.`, player.label);
          emitGameEvent("heal.applied", {
            game,
            source: stackObject.source,
            target: { type: "territory", playerId: player.id },
            amount: healed
          }, { resolveImmediately: true });
          healedEvents.push({ type: "territory", playerId: player.id, amount: healed });
        }
        return;
      }
      const healed = Math.min(amount, toNumber(ref.instance.damage, 0));
      ref.instance.damage = Math.max(0, toNumber(ref.instance.damage, 0) - healed);
      if (healed > 0) {
        addLog(game, `curou ${healed} de dano de ${getCardName(app.cardByCode.get(ref.instance.cardId))}.`, getPlayer(game, ref.playerId).label);
        emitGameEvent("heal.applied", {
          game,
          source: stackObject.source,
          target: { type: "character", playerId: ref.playerId, uid: ref.instance.uid, cardId: ref.instance.cardId },
          amount: healed
        }, { resolveImmediately: true });
        healedEvents.push({ type: "character", playerId: ref.playerId, uid: ref.instance.uid, amount: healed });
      }
    });
    if (healedEvents.length) {
      renderGame();
      await animateResolutionEvents(healedEvents, "heal");
    }
    return healedEvents.length > 0;
  }

  if (effectId === "distribute_damage") {
    const total = getActionAmount(action.amount, 0);
    const candidates = getEngineDistributionCandidates(action.targets || [], stackObject, "damage");
    const allocations = stackObject.controllerId === "human"
      ? await showEngineDistributionModal({
        title: stackObject.label,
        description: localize(action.description) || "Distribua o dano entre os alvos válidos.",
        candidates,
        total,
        kind: "damage"
      })
      : chooseBotDistribution(candidates, total, "damage");
    for (const { ref, amount } of allocations) {
      if (amount <= 0) continue;
      if (ref.territory) {
        await applyEffectDamageEvent(game, {
          type: "territory",
          playerId: ref.playerId,
          amount,
          reason: stackObject.label,
          source: stackObject.source,
          damageType: action.damageType || "effect",
          damageAsCost: Boolean(action.damageAsCost)
        });
        continue;
      }
      await applyEffectDamageEvent(game, {
        type: "character",
        playerId: ref.playerId,
        uid: ref.instance.uid,
        amount,
        reason: stackObject.label,
        source: stackObject.source,
        damageType: action.damageType || "effect",
        damageAsCost: Boolean(action.damageAsCost)
      });
    }
    destroyLethalCharacters(game);
    checkGameEnd(game);
    return allocations.length > 0;
  }

  if (effectId === "counter_stack_object") {
    const targetRef = await chooseEngineStackTargetRef(action, stackObject);
    if (!targetRef?.stackObject) return false;
    const targetObject = game.stack.find((item) => item.id === targetRef.stackObject.id);
    if (!targetObject) return false;
    const targetController = getPlayer(game, targetObject.controllerId);
    const tax = toNumber(action.unlessControllerPays ?? action.tax ?? 0, 0);
    const bypassSubtype = action.paymentBypassIfControllerControlsSubtype ?? action.ignorePaymentIfControllerControlsSubtype;
    const controllerBypassesTax = typeof bypassSubtype !== "undefined" &&
      playerControlsSubtype(getPlayer(game, stackObject.controllerId), bypassSubtype);

    if (!controllerBypassesTax && tax > 0 && canPayEssenceTax(targetController, tax)) {
      const shouldPay = targetController.id === "human"
        ? await showEngineChoiceModal({
          title: stackObject.label,
          description: `${targetObject.label} seria anulada. Pagar ${tax} {E} para impedir?`,
          confirmText: `Pagar ${tax}`,
          cancelText: "Deixar anular",
          effectText: localize(action.description) || getStackObjectEffectDescription(stackObject),
          sourceLabel: targetObject.label,
          sourceIcon: getStackObjectSourceIcon(targetObject)
        })
        : Boolean(targetController) && targetObject.controllerId === targetController.id;
      if (shouldPay && payEssenceTax(targetController, tax)) {
        addLog(game, `${targetController.label} pagou ${tax} {E}; ${targetObject.label} nao foi anulada.`, "Pilha");
        return true;
      }
    }

    return counterStackObject(game, targetObject, stackObject.label);
  }

  if (effectId === "prevent_damage") {
    const damageEvent = stackObject.payload?.damageEvent;
    if (!damageEvent) return false;
    const remainingDamage = Math.max(0, toNumber(damageEvent.amount, 0) - getCurrentPreventedAmount(damageEvent));
    if (remainingDamage <= 0) return false;
    if (action.amount === "all" && !action.turnBudget) {
      damageEvent.preventedAmount = "all";
      return true;
    }
    const requestedAmount = action.amount === "all" ? remainingDamage : getActionAmount(action.amount, 0);
    const budgetRemaining = getEngineTurnBudgetRemaining(game, stackObject, action, requestedAmount);
    const prevented = Math.min(remainingDamage, requestedAmount, budgetRemaining);
    if (prevented <= 0) return false;
    damageEvent.preventedAmount = Math.min(damageEvent.amount, getCurrentPreventedAmount(damageEvent) + prevented);
    spendEngineTurnBudget(game, stackObject, action, prevented);
    return true;
  }

  if (effectId === "modify_damage_amount") {
    const damageEvent = stackObject.payload?.damageEvent;
    if (!damageEvent) return false;
    damageEvent.amount = Math.max(0, toNumber(damageEvent.amount, 0) + getActionAmount(action.amount, 0));
    return true;
  }

  if (effectId === "replace_damage") {
    const damageEvent = stackObject.payload?.damageEvent;
    if (!damageEvent) return false;
    damageEvent.amount = getActionAmount(action.amount, damageEvent.amount);
    return true;
  }

  if (effectId === "create_temp_effect") {
    const choiceValue = await chooseEngineAmount(action, stackObject);
    const resolvedTemporaryEffect = resolveChoiceTemplate(action.temporaryEffect, choiceValue);
    if ((resolvedTemporaryEffect?.actions || resolvedTemporaryEffect?.costs) && resolvedTemporaryEffect?.trigger) {
      createTemporaryEffect(game, {
        controllerId: stackObject.controllerId,
        type: "delayedAbility",
        duration: action.duration || resolvedTemporaryEffect.duration || "next_event",
        trigger: resolvedTemporaryEffect.trigger,
        ability: {
          id: `delayed-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          kind: resolvedTemporaryEffect.kind || "triggered",
          trigger: resolvedTemporaryEffect.trigger,
          usesStack: resolvedTemporaryEffect.usesStack !== false,
          optional: Boolean(resolvedTemporaryEffect.optional),
          label: resolvedTemporaryEffect.label || stackObject.label,
          condition: resolvedTemporaryEffect.condition || {},
          costs: resolvedTemporaryEffect.costs || [],
          actions: resolvedTemporaryEffect.actions || []
        },
        source: stackObject.source,
        label: localize(resolvedTemporaryEffect.label) || stackObject.label,
        suppressTriggerFeedback: Boolean(resolvedTemporaryEffect.suppressTriggerFeedback)
      });
      return true;
    }
    createTemporaryEffect(game, {
      controllerId: stackObject.controllerId,
      type: "eventModifier",
      duration: action.duration || "until_regroup",
      temporaryEffect: resolvedTemporaryEffect,
      source: stackObject.source,
      label: stackObject.label
    });
    return true;
  }

  if (effectId === "adjust_moral") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    const result = applyMoralShift(player, action.virtueId, action.delta);
    addMoralShiftLog(game, player, result, stackObject.label);
    return true;
  }

  if (effectId === "adjust_moral_choice") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    if (!player) return false;
    const maxBefore = Number.isFinite(action.maxBefore) ? action.maxBefore : Infinity;
    const minBefore = Number.isFinite(action.minBefore) ? action.minBefore : -Infinity;
    const delta = toNumber(action.delta, 1);
    const polarities = action.polarity === "all" ? ["virtue", "vice"] : [action.polarity || "virtue"];
    const choices = app.virtues
      .filter((virtue) => polarities.includes(virtue.polarity))
      .filter((virtue) => getVirtueValue(player, virtue.id) < maxBefore && getVirtueValue(player, virtue.id) >= minBefore)
      .map((virtue) => buildMoralChoice(player, virtue, virtue.id, delta, `${getVirtueName(virtue)} ${delta >= 0 ? "+" : ""}${delta}`))
      .filter((choice) => choice && moralChoiceWouldChange(player, choice.targetId, choice.delta))
      .filter(Boolean);
    const result = await new Promise((resolve) => queueMoralChoice(
      player,
      stackObject.label,
      localize(action.description) || "Escolha uma Virtude para ajustar.",
      choices,
      stackObject.label,
      resolve
    ));
    return Boolean(result?.changes?.length);
  }

  if (effectId === "adjust_moral_flexible") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    if (!player) return false;
    const choices = getFlexibleMoralChoices(player, getActionAmount(action.amount, 1));
    const result = await new Promise((resolve) => queueMoralChoice(
      player,
      stackObject.label,
      localize(action.description) || "Escolha uma característica para receber +1 ou -1.",
      choices,
      stackObject.label,
      resolve
    ));
    return Boolean(result?.changes?.length);
  }

  if (effectId === "fight") {
    const leftRefs = await chooseEngineTargetRefs({ ...action, target: action.sourceTarget || action.left || action.target }, stackObject, "buff");
    const left = leftRefs[0];
    if (!left?.instance) return false;
    const rightSpec = action.target || action.right;
    let rightRefs = getEngineTargetRefs(rightSpec, stackObject, { ignoreCount: true })
      .filter((ref) => ref.instance && ref.instance.uid !== left.instance.uid);
    if (!rightRefs.length) return false;
    const right = stackObject.controllerId === "human"
      ? await showEngineTargetChoiceModal({
        title: stackObject.label,
        description: "Escolha o outro Personagem que lutará.",
        refs: rightRefs,
        kind: "damage",
        visualOnly: true,
        showStats: true
      })
      : chooseBotEngineTargetRefForStack(stackObject, rightRefs, "damage");
    if (!right?.instance) return false;
    const leftPower = getCharacterPower(left.instance);
    const rightPower = getCharacterPower(right.instance);
    await Promise.all([
      applyEffectDamageEvent(game, {
        type: "character",
        playerId: right.playerId,
        uid: right.instance.uid,
        amount: leftPower,
        reason: stackObject.label,
        source: { ...stackObject.source, playerId: left.playerId, uid: left.instance.uid, cardId: left.instance.cardId },
        damageType: action.damageType || "effect"
      }),
      applyEffectDamageEvent(game, {
        type: "character",
        playerId: left.playerId,
        uid: left.instance.uid,
        amount: rightPower,
        reason: stackObject.label,
        source: { ...stackObject.source, playerId: right.playerId, uid: right.instance.uid, cardId: right.instance.cardId },
        damageType: action.damageType || "effect"
      })
    ]);
    destroyLethalCharacters(game);
    checkGameEnd(game);
    return true;
  }

  if (effectId === "reveal_lower_cost_character_from_hand_then_heal") {
    const player = getPlayer(game, getStackPlayerId(action.player, stackObject));
    if (!player) return false;
    const maxControlledCost = player.battlefield
      .filter((instance) => getCardTypeCode(app.cardByCode.get(instance.cardId)) === "PER")
      .reduce((max, instance) => Math.max(max, getCost(app.cardByCode.get(instance.cardId))), -Infinity);
    const entries = player.hand
      .map((cardId, index) => ({ cardId, index, zone: "hand" }))
      .filter((entry) => {
        const card = app.cardByCode.get(entry.cardId);
        return getCardTypeCode(card) === "PER" && getCost(card) < maxControlledCost;
      });
    const chosen = player.id === "human"
      ? await showEngineSingleCardChoiceModal({
        title: stackObject.label,
        description: "Revele um Personagem da sua mão com custo menor que o de um Personagem que você controla.",
        entries,
        confirmText: "Revelar"
      })
      : chooseBotCardEntry(entries, player);
    if (!chosen) return false;
    const cardId = chosen.cardId || player.hand[chosen.index];
    if (!cardId) return false;
    await showRevealCardsAnimation([cardId], player.id, {
      title: stackObject.label,
      detail: `${player.label} revelou ${getCardName(app.cardByCode.get(cardId))}.`
    });
    const healed = Math.min(getActionAmount(action.healAmount || action.amount, 2), player.territoryDamage);
    player.territoryDamage = Math.max(0, player.territoryDamage - healed);
    if (healed > 0) {
      addLog(game, `curou ${healed} de dano do territorio.`, player.label);
      emitGameEvent("heal.applied", {
        game,
        source: stackObject.source,
        target: { type: "territory", playerId: player.id },
        amount: healed
      }, { resolveImmediately: true });
      renderGame();
      await animateResolutionEvents([{ type: "territory", playerId: player.id, amount: healed }], "heal");
    }
    return true;
  }

  if (effectId === "destroy_if_power_gte_else_damage") {
    const threshold = toNumber(action.powerGte ?? action.powerAtLeast, 6);
    const amount = getActionAmount(action.amount, 1);
    const refs = await chooseEngineTargetRefs(action, stackObject, "damage");
    let resolved = false;
    for (const ref of refs) {
      if (!ref.instance) continue;
      if (getCharacterPower(ref.instance) >= threshold) {
        const card = app.cardByCode.get(ref.instance.cardId);
        if (removeBattlefieldCardToZone(game, ref.playerId, ref.instance, "cemetery")) {
          addLog(game, `${getCardName(card)} foi destruido por ${stackObject.label}.`, getPlayer(game, ref.playerId).label);
          resolved = true;
        }
        continue;
      }
      await applyEffectDamageEvent(game, {
        type: "character",
        playerId: ref.playerId,
        uid: ref.instance.uid,
        amount,
        reason: stackObject.label,
        source: stackObject.source,
        damageType: action.damageType || "effect",
        damageAsCost: Boolean(action.damageAsCost)
      });
      resolved = true;
    }
    destroyLethalCharacters(game);
    checkGameEnd(game);
    return resolved;
  }

  if (effectId === "destroy_permanent") {
    const refs = await chooseEngineTargetRefs(action, stackObject, "destroy");
    refs.forEach(({ playerId, instance }) => {
      const player = getPlayer(game, playerId);
      const card = app.cardByCode.get(instance.cardId);
      if (removeBattlefieldCardToZone(game, playerId, instance, "cemetery")) {
        addLog(game, `${getCardName(card)} foi destruido.`, player.label);
      }
    });
    destroyLethalCharacters(game);
    checkGameEnd(game);
    return refs.length > 0;
  }

  addLog(game, `efeito ${effectId} ainda sem handler ativo.`, "Engine");
  return options.isCost ? false : true;
}

function chooseBotCardsForBottom(player, amount) {
  return [...player.hand]
    .sort((a, b) => getCost(app.cardByCode.get(a)) - getCost(app.cardByCode.get(b)))
    .slice(0, amount);
}

function createTemporaryEffect(game, effect) {
  if (!game) return null;
  const created = {
    id: `effect-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...effect
  };
  game.effects.push(created);
  return created;
}

function expireTemporaryEffect(game, effect) {
  if (!game || !effect) return;
  if (effect.type === "temporaryControl") {
    const uid = effect.target?.uid;
    const currentController = getInstanceControllerInGame(game, uid);
    const previousController = getPlayer(game, effect.previousControllerId);
    if (!uid || !currentController || !previousController || currentController.id === previousController.id) return;
    const instance = removeBattlefieldInstance(currentController, uid);
    if (!instance) return;
    previousController.battlefield.push(instance);
    addLog(game, `${getCardName(app.cardByCode.get(instance.cardId))} voltou ao controle de ${previousController.label}.`, "Engine");
  }
}

function expireTemporaryEffects(game, duration) {
  if (!game?.effects?.length) return;
  const expiring = game.effects.filter((effect) => effect.duration === duration);
  expiring.forEach((effect) => expireTemporaryEffect(game, effect));
  game.effects = game.effects.filter((effect) => effect.duration !== duration);
  if (expiring.length) applyStateBasedActions(game);
}

function getModifiedEventAmount(game, triggerId, baseAmount, payload = {}) {
  let amount = baseAmount;
  const consumed = new Set();
  (game.effects || []).forEach((effect) => {
    const temp = effect.temporaryEffect;
    if (effect.type !== "eventModifier" || temp?.trigger !== triggerId) return;
    if (temp.action !== "modify_event_amount") return;
    const delta = toNumber(temp.amount, 0);
    if (temp.operation === "set") amount = delta;
    if (temp.operation === "add") amount += delta;
    if (temp.operation === "subtract") amount -= delta;
    if (effect.duration === "next_phase_draw_amount" || effect.duration === "next_event") {
      consumed.add(effect.id);
    }
  });
  if (consumed.size) {
    game.effects = game.effects.filter((effect) => !consumed.has(effect.id));
  }
  return Math.max(0, amount);
}

function clearHumanAutoPass() {
  if (app.autoPassTimer) window.clearTimeout(app.autoPassTimer);
  app.autoPassTimer = null;
}

function schedulePriorityAutoPass(game) {
  if (!isHumanPriorityOpen() || app.priority.game !== game || hasPendingEngineChoiceWork() || hasHumanPriorityPlay(game)) return;
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
  if (hasBlockingEngineWork(game)) return;
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

function selectAllAttackersForTerritory(playerId) {
  const game = app.game;
  const player = getPlayer(game, playerId);
  if (!canAct(playerId) || player.combatDeclaredThisTurn) return [];
  const target = getTerritoryAttackTarget(getOpponentId(playerId));
  const readyAttackers = player.battlefield.filter((item) => canAttackWith(player, item.uid));
  const selected = [];
  readyAttackers.forEach((instance) => {
    if (!setAttackTarget(playerId, instance.uid, target)) return;
    selected.push(instance.uid);
  });
  game.combat.selectedAttackers = selected;
  game.combat.selectedAttackerUid = selected[0] || "";
  if (selected.length) {
    playTone("soft");
  }
  return selected;
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

async function applyDraw(playerId) {
  const game = app.game;
  const player = getPlayer(game, playerId);
  if (!canDraw(player)) return false;
  const baseDrawAmount = 2;
  emitGameEvent("phase.draw.amount.replace", {
    game,
    playerId,
    baseAmount: baseDrawAmount,
    currentAmount: baseDrawAmount,
    reason: "automatic_draw"
  }, { resolveImmediately: true });
  const drawAmount = getModifiedEventAmount(game, "phase.draw.amount.replace", baseDrawAmount, {
    playerId,
    reason: "automatic_draw"
  });
  const { drawn, missing, fatigueDamage } = drawCardsWithFatigue(player, drawAmount);
  player.drewThisTurn = true;
  addPlayerStat(game, "cardsDrawn", playerId, drawn.length);
  addLog(game, `comprou ${drawn.length} carta${drawn.length === 1 ? "" : "s"}.`, player.label);
  if (missing > 0) addLog(game, `sofreu fadiga por nao conseguir comprar ${missing} carta${missing === 1 ? "" : "s"}.`, player.label);
  app.drawAnimationPending = true;
  playTone("draw");
  checkGameEnd(game);
  const finishDraw = async () => {
    app.drawAnimationPending = false;
    if (!app.game || app.game !== game || game.status !== "active" || game.activePlayer !== playerId) return;
    if (fatigueDamage > 0) {
      renderGame();
      await animateResolutionEvents([{ type: "territory", playerId, amount: fatigueDamage }], "damage");
      if (!app.game || app.game !== game || game.status !== "active" || game.activePlayer !== playerId) return;
    }
    await resolveImmediateGameEvent("phase.draw.after_auto_draw", { game, playerId, drawnCards: drawn });
    if (!app.game || app.game !== game || game.status !== "active" || game.activePlayer !== playerId) return;
    scheduleStackResolution(game);
    waitForEngineStack(game, () => {
      if (!app.game || app.game !== game || game.status !== "active" || game.activePlayer !== playerId) return;
      setGamePhase(game, "consecration", playerId);
      emitPhaseBeginEvent(game, "consecration", playerId);
      addLog(game, `entrou em ${PHASE_LABELS.consecration}.`, player.label);
      renderGame();
    });
  };
  if (drawn.length) {
    showDrawAnimation(drawn, playerId, () => {
      void finishDraw();
    });
  } else {
    void finishDraw();
  }
  return true;
}

function finishConsecrationAction(playerId) {
  const game = app.game;
  if (!game || game.status !== "active" || game.activePlayer !== playerId || currentPhase(game) !== "consecration") return;
  const player = getPlayer(game, playerId);
  setGamePhase(game, "preparation", playerId);
  emitPhaseBeginEvent(game, "preparation", playerId);
  addLog(game, `entrou em ${PHASE_LABELS.preparation}.`, player.label);
  playTone("soft");
  renderGame();
}

function getControlledCharacterRefs(player) {
  return (player?.battlefield || [])
    .filter((instance) => getCardTypeCode(app.cardByCode.get(instance.cardId)) === "PER")
    .map((instance) => ({ playerId: player.id, instance }));
}

async function chooseConsecrationCharacterTarget(player, sourceCard) {
  const refs = getControlledCharacterRefs(player);
  if (!refs.length) return null;
  if (player.id !== "human") return chooseBotEngineTargetRef(refs, "buff");
  if (refs.length === 1) return refs[0];
  return showEngineTargetChoiceModal({
    title: "Consagração de Personagem",
    description: `Escolha um Personagem para receber +1/+1 até o Reagrupamento por ${getCardName(sourceCard)}.`,
    refs,
    kind: "buff",
    visualOnly: true
  });
}

async function applyCharacterConsecrationEffect(player, card) {
  const target = await chooseConsecrationCharacterTarget(player, card);
  if (!target?.instance) {
    addLog(app.game, "Consagração de Personagem sem alvo válido.", player.label);
    return null;
  }
  createTemporaryEffect(app.game, {
    controllerId: player.id,
    type: "modifyStats",
    target: { playerId: target.playerId, uid: target.instance.uid },
    power: 1,
    resistance: 1,
    duration: "until_regroup",
    source: {
      sourceType: "consecration",
      cardId: card.code,
      controllerId: player.id,
      label: `Consagração de ${getCardName(card)}`
    },
    label: "Consagração de Personagem"
  });
  const targetCard = app.cardByCode.get(target.instance.cardId);
  addLog(app.game, `${getCardName(targetCard)} recebeu +1/+1 até o Reagrupamento.`, player.label);
  if (!markPositiveStatFeedback([target], 1, 1)) renderGame();
  return { label: `${getCardName(targetCard)} +1/+1` };
}

async function applySinConsecrationEffect(player) {
  const result = await queueConsecrationSinMoralAdjustment(player);
  if (!result?.changes?.length) {
    addLog(app.game, "Consagração de Pecado sem Desvirtude ativa para redimir.", player.label);
    return null;
  }
  return {
    label: `Pecado: ${formatMoralResultForAlert(result)}`,
    moralResult: result,
    consumesGeneralMoralAdjustment: true
  };
}

function applyArtifactConsecrationEffect(player, card) {
  createTemporaryEffect(app.game, {
    controllerId: player.id,
    type: "nextPlayCostDiscount",
    amount: 1,
    duration: "until_regroup",
    source: {
      sourceType: "consecration",
      cardId: card.code,
      controllerId: player.id,
      label: `Consagração de ${getCardName(card)}`
    },
    label: "Desconto de Consagração de Artefato"
  });
  addLog(app.game, "próxima carta jogada neste turno custa 1 Essência a menos.", player.label);
  return { label: "Próxima carta custa -1" };
}

async function applyMiracleConsecrationEffect(player) {
  const healed = Math.min(3, toNumber(player.territoryDamage, 0));
  if (healed <= 0) {
    addLog(app.game, "Consagração de Milagre não curou porque o Território não tinha dano.", player.label);
    return null;
  }
  player.territoryDamage = Math.max(0, player.territoryDamage - healed);
  addLog(app.game, `curou ${healed} de dano do Território pela Consagração de Milagre.`, player.label);
  emitGameEvent("heal.applied", {
    game: app.game,
    source: { sourceType: "consecration", controllerId: player.id, label: "Consagração de Milagre" },
    target: { type: "territory", playerId: player.id },
    amount: healed
  }, { resolveImmediately: true });
  renderGame();
  await animateResolutionEvents([{ type: "territory", playerId: player.id, amount: healed }], "heal");
  return { label: `Curou ${healed} do Território` };
}

async function applyConsecrationTypeEffect(player, card) {
  const typeCode = getCardTypeCode(card);
  if (typeCode === "PER") return applyCharacterConsecrationEffect(player, card);
  if (typeCode === "PEC") return applySinConsecrationEffect(player);
  if (typeCode === "ART") return applyArtifactConsecrationEffect(player, card);
  if (typeCode === "MIL") return applyMiracleConsecrationEffect(player);
  return null;
}

async function applyPresenceTempleReplacement(player, card) {
  if (!playerHasTemple(player, TEMPLE_IDS.presence)) return null;
  if (player.id !== "human") return null;
  const temple = app.cardByCode.get(TEMPLE_IDS.presence);
  const shouldReplace = await showEngineChoiceModal({
    title: "Tenda da Presença",
    description: "",
    confirmText: "Comprar e descartar",
    cancelText: "Aplicar efeito normal",
    sourceLabel: "Tenda da Presença",
    sourceIcon: getCardArt(temple),
    effectText: `Substituir o efeito de tipo de ${getCardName(card)} por comprar 1 carta e descartar 1 carta. O ajuste moral ainda acontece.`
  });
  if (!shouldReplace) return null;

  const { drawn, missing, fatigueDamage } = drawCardsWithFatigue(player, 1);
  addPlayerStat(app.game, "cardsDrawn", player.id, drawn.length);
  addLog(app.game, "substituiu o efeito de tipo pela Tenda da Presença.", player.label);
  if (drawn.length) {
    await new Promise((resolve) => showDrawAnimation(drawn, player.id, resolve));
  }
  if (missing > 0) {
    addLog(app.game, `sofreu fadiga por nao conseguir comprar ${missing} carta${missing === 1 ? "" : "s"}.`, player.label);
  }
  if (fatigueDamage > 0) {
    renderGame();
    await animateResolutionEvents([{ type: "territory", playerId: player.id, amount: fatigueDamage }], "damage");
  }
  if (player.hand.length) {
    const chosen = await showEngineSingleCardChoiceModal({
      title: "Tenda da Presença",
      description: "Escolha uma carta da sua mão para descartar.",
      entries: player.hand.map((cardId, index) => ({ cardId, index })),
      confirmText: "Descartar"
    });
    const discardId = chosen?.cardId || player.hand[chosen?.index];
    if (discardId && discardCardFromHand(player, discardId)) {
      addLog(app.game, `descartou ${getCardName(app.cardByCode.get(discardId))}.`, player.label);
    }
  }
  renderGame();
  return { label: "Tenda: comprou 1 e descartou 1" };
}

async function getConsecrationMoralAmount(player, card) {
  if (!playerHasTemple(player, TEMPLE_IDS.judgment)) return 1;
  if (getCardTypeCode(card) !== "PER") return 1;
  if (!player.hand.length) return 1;

  const temple = app.cardByCode.get(TEMPLE_IDS.judgment);
  const shouldPay = player.id === "human"
    ? await showEngineChoiceModal({
      title: "Santuário do Julgamento",
      description: "",
      confirmText: "Colocar no fundo",
      cancelText: "Manter ajuste +1",
      sourceLabel: "Santuário do Julgamento",
      sourceIcon: getCardArt(temple),
      effectText: "Coloque 1 carta da sua mão no fundo do baralho. Se fizer isso, o ajuste moral da Consagração deste Personagem será 2 em vez de 1."
    })
    : player.hand.length >= 3;
  if (!shouldPay) return 1;

  const selected = player.id === "human"
    ? await showEngineHandChoiceModal(player, 1, {
      title: "Santuário do Julgamento",
      description: "Escolha uma carta da sua mão para colocar no fundo do baralho.",
      confirmText: "Colocar no fundo"
    })
    : chooseBotCardsForBottom(player, 1);
  const moved = moveHandCardsToDeck(player, selected, "bottom");
  if (!moved.length) return 1;
  addLog(app.game, "colocou 1 carta no fundo pelo Santuário do Julgamento.", player.label);
  renderGame();
  return 2;
}

function formatConsecrationAlertDetail(typeResult, moralResult) {
  return {
    text: typeResult?.label || "",
    moral: getMoralResultAlertData(moralResult)
  };
}

async function resolveConsecrationSequence(game, player, card, cardId, playerId) {
  const typeResult = await applyPresenceTempleReplacement(player, card) || await applyConsecrationTypeEffect(player, card);
  if (!app.game || app.game !== game || game.status !== "active") return;
  let result = typeResult?.moralResult || null;
  if (!typeResult?.consumesGeneralMoralAdjustment) {
    const moralAmount = await getConsecrationMoralAmount(player, card);
    if (!app.game || app.game !== game || game.status !== "active") return;
    result = await queueConsecrationMoralAdjustmentAsync(player, moralAmount);
  }
  if (!app.game || app.game !== game || game.status !== "active") return;
  emitGameEvent("action.consecrate.after", {
    game,
    playerId,
    cardId,
    cardType: getCardTypeCode(card),
    consecrationTypeResult: typeResult,
    moralResult: result
  });
  showConsecratedCardAnimation(card, playerId, formatConsecrationAlertDetail(typeResult, result));
  waitForEngineStack(game, () => finishConsecrationAction(playerId));
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
  playTone("consecrate");
  void resolveConsecrationSequence(game, player, card, cardId, playerId);
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
  playTone("profane");
  queueProfanationMoralAdjustment(player, (result) => {
    emitGameEvent("action.profane.after", {
      game,
      playerId,
      cardId,
      moralResult: result
    });
    showCardActionAnimation(card, playerId, playerId === "human" ? "Voce profanou" : "Bot profanou", {
      moral: getMoralResultAlertData(result)
    });
    waitForEngineStack(game, () => finishConsecrationAction(playerId));
  });
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

function applyCardMoralAfterEngineResolution(game, playerId, card) {
  waitForEngineStack(game, () => {
    if (!app.game || app.game !== game || game.status !== "active") return;
    applyCardMoralPips(playerId, card);
    renderGame();
    checkGameEnd(game);
  });
}

function applyPlayCard(playerId, cardId) {
  const game = app.game;
  const player = getPlayer(game, playerId);
  const card = app.cardByCode.get(cardId);
  if (card && player?.hand?.includes(cardId) && !canResolveCardWhenPlayed(cardId, playerId)) {
    showInteractionHint(`${getCardName(card)} nao possui alvo valido agora.`);
    return false;
  }
  if (!canPlayCard(player, cardId)) return false;

  const baseCost = getCost(card);
  const effectiveCost = getEffectivePlayCost(player, card);
  const typeCode = getCardTypeCode(card);
  if (typeCode === "PEC") {
    dealTerritoryDamage(player, baseCost, `custo de Pecado: ${getCardName(card)}`, playerId);
    checkGameEnd(game);
    if (game.status !== "active") return true;
  } else {
    if (!ensureGeneratedEssenceForCost(player, effectiveCost)) return false;
    const payment = spendEssenceCost(player, effectiveCost);
    if (!payment) return false;
    if (payment.poolSpent > 0) {
      addLog(game, `usou ${payment.poolSpent} {E} gerado para pagar ${getCardName(card)}.`, player.label);
    }
  }
  const consumedDiscount = typeCode !== "PEC" ? consumePendingPlayCostDiscount(player) : 0;
  if (consumedDiscount > 0) {
    addLog(game, `desconto de Consagração de Artefato consumido (${consumedDiscount}).`, player.label);
  }
  player.hand = player.hand.filter((id) => id !== cardId);
  player.cardsPlayedThisTurn = toNumber(player.cardsPlayedThisTurn, 0) + 1;
  addPlayerStat(game, "cardsPlayed", playerId);
  const playObject = createCardPlayStackObject(game, playerId, cardId);
  if (!playObject) return false;
  game.stack.push(playObject);
  addLog(game, `jogou ${getCardName(card)} e colocou a jogada na pilha.`, player.label);
  emitGameEvent("stack.object_added", { game, stackObject: playObject }, { resolveImmediately: true });
  emitGameEvent("card.played", {
    game,
    playerId,
    cardId,
    cardType: typeCode,
    stackObjectId: playObject.id
  });
  showPlayedCardAnimation(card, playerId);
  playTone(`play-${String(typeCode || "card").toLowerCase()}`);
  checkGameEnd(game);
  scheduleStackResolution(game);
  return true;
}

function resolveSimpleSpell(playerId, card) {
  const game = app.game;
  const player = getPlayer(game, playerId);
  const typeCode = getCardTypeCode(card);

  if (typeCode === "MIL") {
    addLog(game, `${getCardName(card)} ainda nao possui efeito de Milagre cadastrado.`, player.label);
    return;
  }

  if (typeCode === "PEC") {
    addLog(game, `${getCardName(card)} ainda nao possui efeito de Pecado cadastrado; apenas o custo foi pago.`, player.label);
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
  if (playerId === "human" && !uid && !selected.length) {
    return selectAllAttackersForTerritory(playerId).length > 0;
  }
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
  const requestedUids = [...new Set(uids || [])];
  const cowardiceLevel = getVirtueValue(player, VIRTUE_IDS.cowardice);
  if ((cowardiceLevel === 1 || cowardiceLevel === 2) && requestedUids.length === 1) {
    const instance = findBattlefieldInstance(player, requestedUids[0]);
    if (isDamagedCharacterInstance(instance)) {
      if (playerId === "human") showInteractionHint("Covardia impede Personagem danificado de atacar sozinho.");
      return [];
    }
  }
  if (hasVirtueLevel(player, VIRTUE_IDS.egoism, 3) && requestedUids.length > 1) {
    if (playerId === "human") showInteractionHint("Egoismo impede atacar com mais de um Personagem.");
    return [];
  }
  game.combat.attackerId = playerId;
  requestedUids.forEach((uid) => {
    if (!canAttackWith(player, uid)) return;
    const target = getAttackTarget(playerId, uid);
    if (!setAttackTarget(playerId, uid, target)) return;
    const instance = player.battlefield.find((item) => item.uid === uid);
    if (!instance) return;
    instance.exhausted = true;
    instance.declaredAttacker = true;
    if (!game.combat.attackers.includes(uid)) game.combat.attackers.push(uid);
    declared.push(instance);
    emitGameEvent("combat.attacker.targeted", {
      game,
      attackerId: playerId,
      attackerUid: uid,
      target,
      source: {
        playerId,
        uid,
        cardId: instance.cardId
      }
    });
  });
  game.combat.selectedAttackers = [];
  if (declared.length) {
    player.combatDeclaredThisTurn = true;
    emitGameEvent("combat.attackers.declared", {
      game,
      attackerId: playerId,
      attackers: declared.map((instance) => ({
        uid: instance.uid,
        cardId: instance.cardId
      })),
      targets: Object.fromEntries(declared.map((instance) => [instance.uid, getAttackTarget(playerId, instance.uid)]))
    });
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
  const attackers = getCombatAttackers(attackerId);
  const blockers = defender.battlefield.filter((instance) =>
    attackers.some((attacker) => canBlockAttack(defender, instance.uid, attackerPlayer, attacker.uid))
  );
  if (!blockers.length) return false;
  return attackers.some((attacker) => {
    const availableForAttacker = blockers.filter((blocker) => canBlockAttack(defender, blocker.uid, attackerPlayer, attacker.uid));
    return availableForAttacker.length >= getMinimumBlockersRequired(attacker);
  });
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
  if (!availableBlockers.length) return [];
  const attackerPower = getCharacterPower(attackerInstance);
  if (attackerPower <= 0) return [];
  const attackerLethal = Math.max(1, getLethalDamageNeeded(attackerInstance));
  const minimumBlockers = getMinimumBlockersRequired(attackerInstance);
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
    if (chosen.length >= minimumBlockers && blockingPower >= attackerLethal) break;
    if (chosen.length >= 3) break;
  }
  return chosen.length >= minimumBlockers ? chosen : [];
}

function declareAutoBlockers(attackerId) {
  const game = app.game;
  const attackerPlayer = getPlayer(game, attackerId);
  const defender = getOpponent(game, attackerId);
  const attackers = attackerPlayer.battlefield.filter((instance) => game.combat.attackers.includes(instance.uid));
  let availableBlockers = defender.battlefield.filter((instance) => canPotentiallyBlockWith(defender, instance.uid));
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
    emitGameEvent("combat.blockers.declared", {
      game,
      defenderId: defender.id,
      attackerId,
      blockers: Object.fromEntries(Object.entries(game.combat.blockers).map(([attackerUid, blockerUids]) => [
        attackerUid,
        blockerUids.map((blockerUid) => {
          const blocker = findBattlefieldInstance(defender, blockerUid);
          return {
            uid: blockerUid,
            cardId: blocker?.cardId || ""
          };
        })
      ]))
    });
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
  const attackerPlayer = getPlayer(game, game.combat.attackerId);
  const invalidEntry = Object.entries(game.combat.blockers || {}).find(([attackerUid, blockerUids]) => {
    if (!blockerUids.length) return false;
    const attacker = findBattlefieldInstance(attackerPlayer, attackerUid);
    return blockerUids.length < getMinimumBlockersRequired(attacker);
  });
  if (invalidEntry) {
    const attacker = findBattlefieldInstance(attackerPlayer, invalidEntry[0]);
    showInteractionHint(`${getCardName(app.cardByCode.get(attacker?.cardId))} só pode ser bloqueado por ${getMinimumBlockersRequired(attacker)} ou mais personagens.`);
    return false;
  }
  exhaustDeclaredBlockers(game.players.human);
  game.combat.awaitingBlockers = "";
  if (hasDeclaredBlockers(game)) {
    emitGameEvent("combat.blockers.declared", {
      game,
      defenderId: "human",
      attackerId: game.combat.attackerId,
      blockers: Object.fromEntries(Object.entries(game.combat.blockers).map(([attackerUid, blockerUids]) => [
        attackerUid,
        blockerUids.map((blockerUid) => {
          const blocker = findBattlefieldInstance(game.players.human, blockerUid);
          return {
            uid: blockerUid,
            cardId: blocker?.cardId || ""
          };
        })
      ]))
    });
  }
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

  showModalElement(modal);
  modal.querySelector("[data-confirm-bot-blocks]")?.addEventListener("click", () => {
    const resume = app.blockReviewResume;
    app.blockReviewResume = null;
    resume?.();
  }, { once: true });
}

function hideBotBlockReview() {
  hideModalById("botBlockReview");
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
  const attackVisualEvents = buildCombatAttackVisualEvents(game, playerId, attackers);
  const directCharacterGroups = new Map();
  attackers.forEach((attacker) => {
    const target = getAttackTarget(playerId, attacker.uid);
    const blockerUids = game.combat.blockers[attacker.uid] || [];
    const blockers = blockerUids
      .map((blockerUid) => findBattlefieldInstance(opponent, blockerUid))
      .filter(Boolean);

    if (blockers.length >= getMinimumBlockersRequired(attacker)) {
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
  runCombatDamageSequence(game, playerId, damageEvents, attackers.length, attackVisualEvents);
  return true;
}

function buildCombatAttackVisualEvents(game, attackerId, attackers) {
  const attackerPlayer = getPlayer(game, attackerId);
  const defender = getOpponent(game, attackerId);
  const events = [];
  attackers.forEach((attacker) => {
    const target = getAttackTarget(attackerId, attacker.uid);
    const blockerUids = game.combat.blockers[attacker.uid] || [];
    const blockers = blockerUids
      .map((blockerUid) => findBattlefieldInstance(defender, blockerUid))
      .filter(Boolean);
    const source = getDamageSource(attackerPlayer.id, attacker.uid);
    const batch = getCombatBatch(attacker.uid);

    if (blockers.length >= getMinimumBlockersRequired(attacker)) {
      blockers.forEach((blocker) => {
        events.push({
          type: "character",
          playerId: defender.id,
          uid: blocker.uid,
          source,
          batch,
          visualOnly: true
        });
      });
      return;
    }

    if (target.type === "character") {
      events.push({
        type: "character",
        playerId: target.playerId,
        uid: target.uid,
        source,
        batch,
        visualOnly: true
      });
      return;
    }

    events.push({
      type: "territory",
      playerId: target.playerId,
      source,
      batch,
      visualOnly: true
    });
  });
  return events;
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
  const player = app.game ? getPlayer(app.game, playerId) : null;
  const instance = findBattlefieldInstance(player, uid);
  const card = app.cardByCode.get(instance?.cardId);
  return {
    playerId,
    uid,
    cardId: instance?.cardId || "",
    type: getCardTypeCode(card),
    power: getCharacterPower(instance)
  };
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
  const hasOverrun = instanceHasKeyword(attacker, "SOBREPUJAR");
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
    const isLast = index === blockers.length - 1;
    const lethal = Math.max(0, getLethalDamageNeeded(blocker));
    const assigned = hasOverrun
      ? Math.min(remainingPower, lethal)
      : isLast
        ? remainingPower
        : Math.min(remainingPower, lethal);
    if (assigned > 0) {
      queueCharacterDamage(events, defender.id, blocker.uid, assigned, `${getCardName(attackerCard)} causou dano ao bloqueador`, {
        batch,
        source: getDamageSource(attackerPlayer.id, attacker.uid)
      });
    }
    remainingPower -= assigned;
  });

  if (hasOverrun && remainingPower > 0) {
    assignDamageToAttackTarget(events, attackerPlayer, attacker, target, remainingPower, `${getCardName(attackerCard)} causou dano excedente`, { batch });
  }
}

function normalizeDamageSourceRef(source, game = app.game) {
  if (!source) return null;
  if (typeof source === "string") return source ? { playerId: source } : null;
  const playerId = source.playerId || source.controllerId || "";
  const player = getPlayer(game, playerId);
  const instance = source.uid ? findBattlefieldInstance(player, source.uid) : null;
  return {
    ...source,
    playerId,
    cardId: source.cardId || instance?.cardId || ""
  };
}

async function applyDamageReplacementWindow(game, event) {
  const source = normalizeDamageSourceRef(event.source, game);
  const target = event.type === "territory"
    ? { type: "territory", playerId: event.playerId }
    : { type: "character", playerId: event.playerId, uid: event.uid };
  const damageEvent = {
    ...event,
    source,
    target,
    amount: toNumber(event.amount, 0),
    preventedAmount: 0
  };
  (game.effects || []).forEach((effect) => {
    if (effect.type !== "preventDamageToInstance") return;
    if (!effectTargetsInstance(effect, { uid: target.uid, owner: target.playerId })) return;
    damageEvent.preventedAmount = "all";
    addLog(game, `${effect.label || "Prevenção"} preveniu ${damageEvent.amount} de dano.`, "Engine");
  });
  await resolveImmediateGameEvent("damage.would_be_dealt", {
    game,
    source,
    target,
    amount: damageEvent.amount,
    damageType: event.damageType || "combat",
    damageAsCost: Boolean(event.damageAsCost),
    damageEvent
  });
  const preventedAmount = damageEvent.preventedAmount === "all"
    ? damageEvent.amount
    : toNumber(damageEvent.preventedAmount, 0);
  return {
    ...event,
    source,
    amount: Math.max(0, toNumber(damageEvent.amount, event.amount) - preventedAmount),
    originalAmount: event.amount,
    preventedAmount
  };
}

async function applyCombatDamageEvent(game, event) {
  const nextEvent = await applyDamageReplacementWindow(game, {
    ...event,
    damageType: "combat"
  });
  if (nextEvent.amount <= 0) {
    addLog(game, `dano prevenido (${event.reason}).`, "Engine");
    return;
  }
  if (nextEvent.type === "territory") {
    dealTerritoryDamage(getPlayer(game, nextEvent.playerId), nextEvent.amount, nextEvent.reason, nextEvent.source, { damageType: "combat" });
    return;
  }
  dealCharacterDamage(getPlayer(game, nextEvent.playerId), nextEvent.uid, nextEvent.amount, nextEvent.reason, nextEvent.source, { damageType: "combat" });
}

async function applyEffectDamageEvent(game, event) {
  const nextEvent = await applyDamageReplacementWindow(game, {
    ...event,
    damageType: event.damageType || "effect",
    damageAsCost: Boolean(event.damageAsCost)
  });
  if (nextEvent.amount <= 0) {
    addLog(game, `dano prevenido (${event.reason}).`, "Engine");
    return;
  }
  if (nextEvent.type === "territory") {
    dealTerritoryDamage(getPlayer(game, nextEvent.playerId), nextEvent.amount, nextEvent.reason, nextEvent.source, {
      damageType: nextEvent.damageType || "effect",
      damageAsCost: Boolean(nextEvent.damageAsCost)
    });
    renderGame();
    await animateResolutionEvents([{ type: "territory", playerId: nextEvent.playerId, amount: nextEvent.amount }], "damage");
    applyStateBasedActions(game);
    return;
  }
  dealCharacterDamage(getPlayer(game, nextEvent.playerId), nextEvent.uid, nextEvent.amount, nextEvent.reason, nextEvent.source, {
    damageType: nextEvent.damageType || "effect",
    damageAsCost: Boolean(nextEvent.damageAsCost)
  });
  renderGame();
  await animateResolutionEvents([{ type: "character", playerId: nextEvent.playerId, uid: nextEvent.uid, amount: nextEvent.amount }], "damage");
  applyStateBasedActions(game);
}

async function applyCombatDamageEvents(game, events) {
  for (const event of events) {
    await applyCombatDamageEvent(game, event);
  }
  applyStateBasedActions(game);
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

async function runCombatDamageSequence(game, attackerId, events, attackerCount, attackVisualEvents = []) {
  await wait(560);
  emitGameEvent("combat.damage.before", {
    game,
    attackerId,
    events
  });
  await waitForEngineStackAsync(game);
  await animateCombatAttackLunge(attackVisualEvents.length ? attackVisualEvents : events);
  const batches = groupDamageEvents(events);
  for (const batch of batches) {
    if (!app.game || app.game !== game || game.status !== "active") return;
    await animateCombatDamageEvents(batch);
    for (const event of batch) {
      await applyCombatDamageEvent(game, event);
    }
    renderGame();
    await wait(820);
    clearDamageFlashFlags(game);
    renderGame();
    await wait(260);
  }

  const dying = getLethalCharacterRefs(game);
  if (dying.length) {
    dying.forEach(({ instance }) => {
      instance.dying = true;
    });
    renderGame();
    await wait(860);
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

function getResolutionEventElement(event) {
  return getDamageEventElement(event);
}

function getEssenceBurstElement(playerId, sourceUid = "") {
  if (sourceUid) {
    const source = getBattlefieldCardElement(playerId, sourceUid);
    if (source) return source;
  }
  return playerId === "human"
    ? els.humanEssence?.closest(".essence-panel") || els.humanArea
    : els.botEssence?.closest(".essence-panel") || els.botArea;
}

function showEssenceBurst(playerId, amount = 1, kind = "gain", sourceUid = "") {
  const target = getEssenceBurstElement(playerId, sourceUid);
  if (!target) return;
  const value = Math.max(1, toNumber(amount, 1));
  const rect = target.getBoundingClientRect();
  const burst = document.createElement("div");
  burst.className = `essence-burst is-${kind}`;
  burst.innerHTML = `
    <img src="${escapeHtml(ESSENCE_ICON_IMAGE)}" alt="" draggable="false" />
    <span>${kind === "spend" ? "-" : "+"}${value}</span>
  `;
  burst.style.left = `${rect.left + rect.width / 2}px`;
  burst.style.top = `${rect.top + rect.height / 2}px`;
  document.body.appendChild(burst);
  window.setTimeout(() => burst.remove(), 1120);
}

function getCombatAttackLungeGroups(events) {
  const game = app.game;
  const attackerUids = new Set(game?.combat?.attackers || []);
  const groups = new Map();
  (events || []).forEach((event) => {
    const source = normalizeDamageSourceRef(event.source, game);
    if (!source?.uid || !attackerUids.has(source.uid)) return;
    const sourceElement = getBattlefieldCardElement(source.playerId, source.uid);
    const targetElement = getDamageEventElement(event);
    if (!sourceElement || !targetElement || sourceElement === targetElement) return;
    const key = `${source.playerId}:${source.uid}`;
    if (!groups.has(key)) {
      groups.set(key, {
        sourceElement,
        targets: [],
        targetKeys: new Set()
      });
    }
    const group = groups.get(key);
    const targetKey = `${event.type}:${event.playerId}:${event.uid || "territory"}`;
    if (group.targetKeys.has(targetKey)) return;
    group.targetKeys.add(targetKey);
    group.targets.push(targetElement);
  });
  return [...groups.values()];
}

function createCombatAttackLungeClone(sourceElement) {
  const sourceImage = sourceElement?.querySelector?.("img");
  const imageSource = sourceImage?.getAttribute("src") || "";
  if (!imageSource) return null;
  const rect = sourceElement.getBoundingClientRect();
  const clone = document.createElement("div");
  clone.className = "combat-attack-lunge";
  clone.style.left = `${rect.left}px`;
  clone.style.top = `${rect.top}px`;
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  clone.innerHTML = `<img src="${escapeHtml(imageSource)}" alt="" draggable="false" />`;
  document.body.appendChild(clone);
  sourceElement.classList.add("is-attack-lunge-source");
  return { clone, sourceElement };
}

async function animateCombatAttackSourceLunge(sourceElement, targetElements) {
  const entry = createCombatAttackLungeClone(sourceElement);
  if (!entry) return;
  const { clone } = entry;
  try {
    for (const targetElement of targetElements) {
      const sourceRect = sourceElement.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      const dx = (targetRect.left + targetRect.width / 2) - (sourceRect.left + sourceRect.width / 2);
      const dy = (targetRect.top + targetRect.height / 2) - (sourceRect.top + sourceRect.height / 2);
      const impactTransform = `translate3d(${dx}px, ${dy}px, 0) scale(1.08)`;
      await animateCombatLungeSegment(clone, "translate3d(0, 0, 0) scale(1)", impactTransform, 280);
      await animateCombatImpactShake(clone, targetElement);
      await animateCombatLungeSegment(clone, impactTransform, "translate3d(0, 0, 0) scale(1)", 320);
      await wait(80);
    }
  } finally {
    clone.remove();
    sourceElement.classList.remove("is-attack-lunge-source");
  }
}

async function animateCombatLungeSegment(clone, fromTransform, toTransform, duration) {
  if (typeof clone.animate !== "function") {
    clone.style.transform = toTransform;
    await wait(duration);
    return;
  }
  const animation = clone.animate([
    { transform: fromTransform },
    { transform: toTransform }
  ], {
    duration,
    easing: "cubic-bezier(.2, .9, .2, 1)",
    fill: "forwards"
  });
  if (animation?.finished) {
    await animation.finished.catch(() => {});
  } else {
    await wait(duration);
  }
  clone.style.transform = toTransform;
}

async function animateCombatImpactShake(clone, targetElement) {
  const shaking = [clone, targetElement].filter(Boolean);
  shaking.forEach((element) => {
    element.classList.remove("is-combat-shaking");
    void element.offsetWidth;
    element.classList.add("is-combat-shaking");
  });
  playTone("hit");
  await wait(430);
  shaking.forEach((element) => element.classList.remove("is-combat-shaking"));
}

async function animateCombatAttackLunge(events) {
  const groups = getCombatAttackLungeGroups(events);
  if (!groups.length) return;
  playTone("soft");
  await Promise.all(groups.map((group) => animateCombatAttackSourceLunge(group.sourceElement, group.targets)));
}

async function animateResolutionEvents(events, kind = "damage") {
  const bursts = [];
  const flashed = new Set();
  events.forEach((event) => {
    const target = getResolutionEventElement(event);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    target.classList.add(kind === "heal" ? "is-heal-flash" : "is-damage-flash");
    flashed.add(target);
    const burst = document.createElement("div");
    burst.className = `combat-damage-burst is-${event.type} is-${kind}`;
    burst.textContent = `${Math.abs(toNumber(event.amount, 0))}`;
    burst.style.left = `${rect.left + rect.width / 2}px`;
    burst.style.top = `${rect.top + rect.height / 2}px`;
    document.body.appendChild(burst);
    bursts.push(burst);
  });
  playTone(kind === "heal" ? "heal" : "hit");
  await wait(events.some((event) => getResolutionEventElement(event)) ? 1080 : 520);
  bursts.forEach((burst) => burst.remove());
  flashed.forEach((element) => {
    element.classList.remove("is-heal-flash", "is-damage-flash");
  });
}

async function animateCombatDamageEvents(events) {
  const bursts = [];
  events.forEach((event) => {
    const target = getDamageEventElement(event);
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const burst = document.createElement("div");
    burst.className = `combat-damage-burst is-${event.type}`;
    burst.textContent = `${Math.abs(toNumber(event.amount, 0))}`;
    burst.style.left = `${rect.left + rect.width / 2}px`;
    burst.style.top = `${rect.top + rect.height / 2}px`;
    document.body.appendChild(burst);
    bursts.push(burst);
  });
  playTone("hit");
  await wait(events.some((event) => getDamageEventElement(event)) ? 860 : 420);
  bursts.forEach((burst) => burst.remove());
}

function dealCharacterDamage(player, uid, amount, reason, source = "", options = {}) {
  const instance = findBattlefieldInstance(player, uid);
  if (!instance || amount <= 0) return;
  const sourceRef = normalizeDamageSourceRef(source);
  const sourcePlayerId = sourceRef?.playerId || "";
  const card = app.cardByCode.get(instance.cardId);
  if (instanceHasKeyword(instance, "INDESTRUTIVEL")) {
    addLog(app.game, `${getCardName(card)} preveniu ${amount} de dano por INDESTRUTIVEL.`);
    return;
  }
  instance.damage = Math.max(0, toNumber(instance.damage, 0) + amount);
  instance.damageFlash = true;
  player.characterDamageTakenThisTurn = toNumber(player.characterDamageTakenThisTurn, 0) + amount;
  addPlayerStat(app.game, "damageTaken", player.id, amount);
  if (sourcePlayerId) {
    addPlayerStat(app.game, "damageDealt", sourcePlayerId, amount);
    addPlayerStat(app.game, "characterDamageDealt", sourcePlayerId, amount);
  }
  emitGameEvent("damage.dealt", {
    game: app.game,
    source: sourceRef,
    target: { type: "character", playerId: player.id, uid, cardId: instance.cardId },
    amount,
    damageType: options.damageType || "effect",
    damageAsCost: Boolean(options.damageAsCost)
  });
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
      if (lethalByDamage && instanceHasKeyword(instance, "INDESTRUTIVEL")) {
        survivors.push(instance);
        return;
      }
      if (lethalByDamage || zeroResistance) {
        const isToken = Boolean(instance.token || card?.token);
        cleanupAttachmentsForLeaving(game, instance.uid);
        if (!isToken) player.cemetery.push(instance.cardId);
        emitGameEvent("permanent.leaves_battlefield", {
          game,
          playerId: player.id,
          instanceUid: instance.uid,
          cardId: instance.cardId,
          destination: isToken ? "void" : "cemetery"
        });
        emitGameEvent("permanent.dies", {
          game,
          playerId: player.id,
          instanceUid: instance.uid,
          cardId: instance.cardId
        });
        addLog(game, isToken
          ? `${getCardName(card)} foi destruido por dano e deixou de existir.`
          : `${getCardName(card)} foi destruido por dano.`, player.label);
        return;
      }
      survivors.push(instance);
    });
    player.battlefield = survivors;
  });
}

function applyStateBasedActions(game) {
  if (!game || game.status !== "active") return false;
  const lethalRefs = getLethalCharacterRefs(game);
  if (!lethalRefs.length) return false;
  destroyLethalCharacters(game);
  checkGameEnd(game);
  return true;
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
      if (lethalByDamage && instanceHasKeyword(instance, "INDESTRUTIVEL")) return;
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

function dealTerritoryDamage(player, amount, reason, source = "", options = {}) {
  const sourceRef = normalizeDamageSourceRef(source);
  const sourcePlayerId = sourceRef?.playerId || "";
  const damageAsCost = Boolean(options.damageAsCost) || /custo de Pecado/i.test(reason);
  player.territoryDamage = Math.max(0, player.territoryDamage + Math.max(0, amount));
  player.territoryDamageTakenThisTurn = toNumber(player.territoryDamageTakenThisTurn, 0) + Math.max(0, amount);
  addPlayerStat(app.game, "damageTaken", player.id, amount);
  if (sourcePlayerId) {
    addPlayerStat(app.game, "damageDealt", sourcePlayerId, amount);
    addPlayerStat(app.game, "territoryDamageDealt", sourcePlayerId, amount);
    addPlayerStat(app.game, sourcePlayerId === player.id ? "ownTerritoryDamageDealt" : "enemyTerritoryDamageDealt", sourcePlayerId, amount);
  }
  emitGameEvent("damage.dealt", {
    game: app.game,
    source: sourceRef,
    target: { type: "territory", playerId: player.id },
    amount,
    damageType: options.damageType || (damageAsCost ? "cost" : "effect"),
    damageAsCost
  });
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
  }
  const next = currentPhase(game);
  emitPhaseBeginEvent(game, next, game.activePlayer);
  if (next === "regroup") {
    clearAllEssencePools(game);
    expireTemporaryEffects(game, "until_regroup");
  }
  addLog(game, `avancou de ${PHASE_LABELS[previous]} para ${PHASE_LABELS[next]}.`, currentPlayer(game).label);
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
    emitPhaseBeginEvent(game, "discard", player.id);
    addLog(game, `precisa descartar ${getHandOverflow(player)} carta${getHandOverflow(player) === 1 ? "" : "s"} para ficar com ${MAX_HAND_SIZE} na mao.`, player.label);
  }
  renderGame();
  if (player.isBot) {
    window.setTimeout(() => autoDiscardToHandLimit(game, player.id), 720);
  }
  return true;
}

function endTurn(game) {
  const previousPlayerId = game.activePlayer;
  clearAllEssencePools(game);
  emitGameEvent("turn.end", {
    game,
    playerId: previousPlayerId,
    turnNumber: game.turnNumber
  });
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
  const effectiveDelay = Number.isFinite(delay) ? delay : game.openingDrawSkipped ? 4300 : 2400;
  setTimeout(() => {
    if (!app.game || app.game !== game || game.status !== "active" || game.activePlayer !== "bot") return;
    runBotTurn();
  }, effectiveDelay);
}

function finalizeResolutionQueue(game) {
  if (!game) return;
  game.stack = [];
  game.stackResolving = false;
  if (app.priority?.game === game) app.priority = null;
  app.pendingEngineChoice = null;
  app.pendingMoralChoice = null;
  app.pendingVirtueDebug = null;
  app.drawAnimationPending = false;
  clearDecisionBattlefieldView();
  clearHumanAutoPass();
  if (app.game === game) renderStackEdgePanel(game);
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
    finalizeResolutionQueue(game);
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
  app.resultViewingBoard = false;
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
    syncFeedbackOverlayState();
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
          <b>${escapeHtml(title)}</b>
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

      <div class="result-actions">
        <button type="button" data-result-view-board>Ver campo de batalha</button>
        <button type="button" data-result-new-game>Nova partida</button>
      </div>
    </div>
  `;
  els.gameResult.classList.remove("is-hidden");
  syncFeedbackOverlayState();
}

function showPhaseAlert(phase, playerId) {
  const player = app.game?.players?.[playerId];
  const champion = player ? app.cardByCode.get(player.identity.champion) : null;
  const avatar = champion ? getCardArt(champion) : "";
  const label = phase === "prepare"
    ? (playerId === "human" ? "Seu turno" : "Turno do oponente")
    : (PHASE_LABELS[phase] || phase);
  const detail = phase === "prepare"
    ? `Turno ${app.game?.turnNumber || 1}`
    : (player?.label || "Turno");
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
      <span>${escapeHtml(detail)}</span>
      <strong>${escapeHtml(label)}</strong>
    </div>
  `;
  syncFeedbackOverlayState();
  playTone(playerId === "human" ? "phase" : "phase-opponent");
  window.clearTimeout(overlay._hideTimer);
  overlay._hideTimer = window.setTimeout(() => {
    overlay.classList.remove("is-visible");
    syncFeedbackOverlayState();
  }, 2300);
}

function showPlayedCardAnimation(card, playerId) {
  showCardActionAnimation(card, playerId, playerId === "human" ? "Voce jogou" : "Bot jogou");
}

function showConsecratedCardAnimation(card, playerId, detail = "") {
  showCardActionAnimation(card, playerId, playerId === "human" ? "Voce consagrou" : "Bot consagrou", detail);
}

function showCardActionAnimation(card, playerId, label, detail = "") {
  if (!card) return;
  const detailData = typeof detail === "object" && detail !== null ? detail : { text: detail };
  const detailText = detailData.text || `${getCardTypeLabel(card)} - custo ${getCost(card)}`;
  const moral = detailData.moral || null;
  const normalizedLabel = label.toLowerCase();
  const kind = normalizedLabel.includes("consag")
    ? "consecrate"
    : normalizedLabel.includes("jog")
      ? "play"
      : normalizedLabel.includes("profan")
        ? "profane"
        : normalizedLabel.includes("descart")
          ? "discard"
          : "action";
  document.getElementById("playedCardAnimation")?.classList.remove("is-visible");
  pushEdgePanelEvent({
    kind,
    playerId,
    kicker: kind === "play" ? "Jogada" : kind === "consecrate" ? "Consagração" : "Evento",
    title: label,
    subtitle: getCardName(card),
    detail: detailText,
    cardId: card.code,
    moral
  });
  syncFeedbackOverlayState();
}

function showPulverizeAnimation(cardIds, playerId) {
  const cards = (cardIds || []).map((cardId) => app.cardByCode.get(cardId)).filter(Boolean);
  if (!cards.length) return Promise.resolve();
  return new Promise((resolve) => {
    playTone("pulverize");
    let overlay = document.getElementById("pulverizeAnimation");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "pulverizeAnimation";
      overlay.className = "pulverize-animation";
      document.body.appendChild(overlay);
    }
    const player = app.game?.players?.[playerId];
    overlay.className = `pulverize-animation is-visible ${playerId === "human" ? "is-human-pulverize" : "is-bot-pulverize"}`;
    overlay.innerHTML = `
      <div class="pulverize-animation-panel">
        <span>${escapeHtml(player?.label || "Jogador")}</span>
        <strong>Pulverizou</strong>
        <div class="pulverize-animation-cards" style="--pulverize-count:${cards.length};">
          ${cards.map((card, index) => `
            <img
              style="--pulverize-index:${index};--pulverize-shift:${index - ((cards.length - 1) / 2)}"
              src="${escapeHtml(getCardImage(card))}"
              alt="${escapeHtml(getCardName(card))}"
              draggable="false"
            />
          `).join("")}
        </div>
      </div>
    `;
    syncFeedbackOverlayState();
    window.clearTimeout(overlay._hideTimer);
    overlay._hideTimer = window.setTimeout(() => {
      overlay.classList.remove("is-visible");
      syncFeedbackOverlayState();
      resolve();
    }, 1900);
  });
}

function showRevealCardsAnimation(cardIds, playerId, options = {}) {
  const cards = (cardIds || []).map((cardId) => app.cardByCode.get(cardId)).filter(Boolean);
  if (!cards.length) return Promise.resolve();
  return new Promise((resolve) => {
    playTone("soft");
    let overlay = document.getElementById("revealAnimation");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "revealAnimation";
      overlay.className = "reveal-animation";
      document.body.appendChild(overlay);
    }
    const player = app.game?.players?.[playerId];
    const title = options.title || "Cartas reveladas";
    const detail = options.detail || `${player?.label || "Jogador"} revelou ${cards.length} carta${cards.length === 1 ? "" : "s"}.`;
    overlay.className = `reveal-animation is-visible ${playerId === "human" ? "is-human-reveal" : "is-bot-reveal"}`;
    overlay.innerHTML = `
      <div class="reveal-animation-panel">
        <span>${escapeHtml(detail)}</span>
        <strong>${escapeHtml(title)}</strong>
        <div class="reveal-animation-cards" style="--reveal-count:${cards.length};">
          ${cards.map((card, index) => `
            <figure style="--reveal-index:${index};">
              <img src="${escapeHtml(getCardImage(card))}" alt="${escapeHtml(getCardName(card))}" draggable="false" />
              <figcaption>${escapeHtml(getCardName(card))}</figcaption>
            </figure>
          `).join("")}
        </div>
        <button type="button" data-reveal-confirm>Continuar</button>
      </div>
    `;
    const finish = () => {
      overlay.classList.remove("is-visible");
      syncFeedbackOverlayState();
      resolve();
    };
    window.clearTimeout(overlay._hideTimer);
    overlay.querySelector("[data-reveal-confirm]")?.addEventListener("click", finish, { once: true });
    syncFeedbackOverlayState();
  });
}

function showDrawAnimation(cardIds, playerId, onComplete = () => {}) {
  if (!cardIds.length) return;
  const visibleCards = cardIds.map((cardId) => app.cardByCode.get(cardId)).filter(Boolean);
  const isBotDraw = playerId !== "human";
  const overlay = document.getElementById("drawAnimation");
  overlay?.classList.remove("is-visible", "requires-confirm");
  const detail = isBotDraw
    ? "Cartas ocultas"
    : visibleCards.map((card) => getCardName(card)).join(", ");
  pushEdgePanelEvent({
    kind: "draw",
    playerId,
    kicker: "Compra",
    title: playerId === "human" ? "Voce comprou" : "Bot comprou",
    subtitle: `${cardIds.length} carta${cardIds.length === 1 ? "" : "s"}`,
    detail,
    cardIds,
    hidden: isBotDraw
  });
  const finish = () => {
    syncFeedbackOverlayState();
    onComplete();
  };
  window.setTimeout(finish, isBotDraw ? 760 : 1100);
  syncFeedbackOverlayState();
}

function scheduleBotStep(game, delay, action) {
  window.setTimeout(() => runBotStepWhenReady(game, action), delay);
}

function runBotStepWhenReady(game, action) {
  if (!app.game || app.game !== game || game.status !== "active" || game.activePlayer !== "bot") return;
  if (hasBlockingBotWork(game)) {
    if (isHumanPriorityOpen()) schedulePriorityAutoPass(game);
    window.setTimeout(() => runBotStepWhenReady(game, action), 240);
    return;
  }
  action();
}

function scheduleBotPhaseStep(game, phase, delay, action) {
  scheduleBotStep(game, delay, () => {
    if (!app.game || app.game !== game || game.status !== "active" || game.activePlayer !== "bot") return;
    const currentIndex = PHASES.indexOf(currentPhase(game));
    const targetIndex = PHASES.indexOf(phase);
    if (currentPhase(game) === phase) {
      action();
      return;
    }
    if (currentIndex >= 0 && targetIndex >= 0 && currentIndex < targetIndex) {
      scheduleBotPhaseStep(game, phase, 240, action);
    }
  });
}

function runBotTurn() {
  const game = app.game;
  if (!game || game.status !== "active" || game.activePlayer !== "bot") return;
  const bot = game.players.bot;
  const mode = game.botMode || "basic";

  scheduleBotPhaseStep(game, "consecration", 1300, () => {
    const consecrateId = chooseBotConsecration(bot, mode);
    if (consecrateId) applyConsecrate("bot", consecrateId);
    if (currentPhase(app.game) === "consecration") {
      advanceBotTo("preparation");
    }
    renderGame();
  });

  scheduleBotPhaseStep(game, "preparation", 2600, () => {
    if (activateBotChampionIfUseful(bot)) {
      renderGame();
      return;
    }
    playBotCards(bot, mode, 1);
    renderGame();
  });

  scheduleBotPhaseStep(game, "preparation", 3900, () => {
    if (activateBotChampionIfUseful(bot)) {
      renderGame();
      return;
    }
    playBotCards(bot, mode, 1);
    renderGame();
  });

  scheduleBotPhaseStep(game, "preparation", 5200, () => {
    if (activateBotChampionIfUseful(bot)) {
      renderGame();
      return;
    }
    playBotCards(bot, mode, 1);
    renderGame();
  });

  scheduleBotPhaseStep(game, "preparation", 6800, () => {
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
  });

  scheduleBotStep(game, 9000, () => {
    endBotTurnWhenCombatIsReady(game);
  });
}

function endBotTurnWhenCombatIsReady(game) {
  if (!app.game || app.game !== game || game.status !== "active" || game.activePlayer !== "bot") return;
  if (hasBlockingBotWork(game) || game.combat.attackers.length) {
    window.setTimeout(() => endBotTurnWhenCombatIsReady(game), 520);
    return;
  }
  if (PHASES.indexOf(currentPhase(game)) < PHASES.indexOf("combat")) {
    window.setTimeout(() => endBotTurnWhenCombatIsReady(game), 520);
    return;
  }
  if (!["regroup", "discard"].includes(currentPhase(game))) {
    advanceBotTo("regroup");
    renderGame();
    waitForEngineStack(game, () => {
      window.setTimeout(() => endBotTurnWhenCombatIsReady(game), 520);
    });
    return;
  }
  if (requestHumanPriority(game, "before-end", "Voce recebeu prioridade antes do fim do turno do bot.", () => {
    endBotTurnWhenCombatIsReady(game);
  })) return;
  enterDiscardStepOrEndTurn(game);
}

function advanceBotTo(phase) {
  const game = app.game;
  const changed = setGamePhase(game, phase, "bot");
  if (changed) {
    emitPhaseBeginEvent(game, phase, "bot");
    if (phase === "regroup") {
      clearAllEssencePools(game);
      expireTemporaryEffects(game, "until_regroup");
    }
  }
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

function getBotEssenceGeneratorUids(bot) {
  return getReadyEssenceGeneratorInstances(bot).map((instance) => instance.uid);
}

function getCheapestReachableNonSinCost(player) {
  const generatorCount = getPotentialGeneratedEssence(player);
  const availableAfterGenerators = getAvailableEssence(player) + generatorCount;
  return [...player.hand]
    .map((cardId) => app.cardByCode.get(cardId))
    .filter((card) => card && getCardTypeCode(card) !== "PEC")
    .map((card) => getEffectivePlayCost(player, card))
    .filter((cost) => cost > getAvailableEssence(player) && cost <= availableAfterGenerators)
    .sort((a, b) => a - b)[0] ?? Infinity;
}

function activateBotEssenceGeneratorsForHand(bot) {
  let activated = 0;
  let targetCost = getCheapestReachableNonSinCost(bot);
  while (Number.isFinite(targetCost) && getAvailableEssence(bot) < targetCost) {
    const uid = getBotEssenceGeneratorUids(bot)[0];
    const instance = uid ? findBattlefieldInstance(bot, uid) : null;
    if (!instance || !activateEssenceGeneratorForPayment(bot, instance)) break;
    activated += 1;
    targetCost = getCheapestReachableNonSinCost(bot);
  }
  return activated;
}

function scoreEquipmentAttachmentTarget(equipment, target) {
  const power = getCharacterPower(target);
  const resistance = getCharacterResistance(target);
  let score = power * 2 + resistance;
  if (equipment.cardId === EQUIPMENT_IDS.sword && power >= 4) score += 6;
  if (equipment.cardId === EQUIPMENT_IDS.crown) score += resistance + 3;
  if (target.cardId === "FND-PER-001") score += 4;
  return score;
}

function autoAttachEquipmentForBot(bot) {
  let attached = 0;
  bot.battlefield
    .filter((instance) => isEquipmentInstance(instance))
    .forEach((equipment) => {
      const target = bot.battlefield
        .filter((candidate) => canAttachEquipmentTo(equipment, candidate, bot.id, bot.id))
        .sort((left, right) => scoreEquipmentAttachmentTarget(equipment, right) - scoreEquipmentAttachmentTarget(equipment, left))[0];
      if (!target) return;
      if (equipment.attachedTo === target.uid) return;
      if (attachEquipmentTo(app.game, { playerId: bot.id, instance: equipment }, { playerId: bot.id, instance: target })) {
        attached += 1;
      }
    });
  return attached;
}

function playBotCards(bot, mode, maxCards = Infinity) {
  let played = true;
  let playedCount = 0;
  while (played && playedCount < maxCards) {
    played = false;
    activateBotEssenceGeneratorsForHand(bot);
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
      autoAttachEquipmentForBot(bot);
      playedCount += 1;
      played = mode === "test" ? false : getAvailableEssence(bot) > 0;
    }
  }
  return playedCount;
}

function attackWithBot(bot) {
  const attackers = bot.battlefield.filter((instance) => (
    canAttackWith(bot, instance.uid) && getCharacterPower(instance) > 0
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

function updateHandDockStateClasses(game, phase, human, selectedHandId = "") {
  const handCount = human?.hand?.length || 0;
  const handAccess = canAct("human") || isHumanPriorityOpen();
  const hasPlayableCard = Boolean(handAccess && human?.hand?.some((cardId) => canPlayCard(human, cardId)));
  const hasConsecratableCard = Boolean(handAccess && human?.hand?.some((cardId) => canConsecrate(human, cardId)));
  const hasDiscardCard = Boolean(handAccess && human?.hand?.some((cardId) => canDiscardForHandLimit(human, cardId)));

  els.handDock?.style.setProperty("--hand-count", String(handCount));
  els.handDock?.classList.toggle("is-empty-hand", handCount === 0);
  els.handDock?.classList.toggle("has-hand-cards", handCount > 0);
  els.handDock?.classList.toggle("has-selected-hand-card", Boolean(selectedHandId));
  els.handDock?.classList.toggle("has-playable-card", hasPlayableCard);
  els.handDock?.classList.toggle("has-consecratable-card", hasConsecratableCard);
  els.handDock?.classList.toggle("has-discard-card", hasDiscardCard);
  els.handDock?.classList.toggle("is-human-turn", game.activePlayer === "human");
  els.handDock?.classList.toggle("is-priority-open", isHumanPriorityOpen());
  if (els.handDock) els.handDock.dataset.phase = phase || "";
}

function updateGameFeelStateClasses(game, phase) {
  const view = els.gameView;
  if (!view || !game) return;
  const hasVisibleModal = Boolean(document.querySelector(".zone-modal.is-visible, .block-prompt.is-visible, .game-result:not(.is-hidden)"));
  const hasVisibleAnimation = Boolean(document.querySelector(".played-card-animation.is-visible, .draw-animation.is-visible, .reveal-animation.is-visible, .pulverize-animation.is-visible, .phase-alert.is-visible"));
  const stackDepth = game.stack?.length || 0;
  view.dataset.phase = phase || "";
  view.dataset.stackDepth = String(stackDepth);
  view.classList.toggle("is-human-turn", game.activePlayer === "human");
  view.classList.toggle("is-bot-turn", game.activePlayer === "bot");
  view.classList.toggle("is-priority-open", isHumanPriorityOpen());
  view.classList.toggle("is-stack-active", stackDepth > 0);
  view.classList.toggle("is-stack-deep", stackDepth > 2);
  view.classList.toggle("is-combat-phase", phase === "combat");
  view.classList.toggle("is-resolution-busy", Boolean(game.stackResolving || game.combat?.resolving));
  view.classList.toggle("is-feedback-overlay-active", hasVisibleModal || hasVisibleAnimation);
  view.classList.toggle("is-draw-animation-pending", Boolean(app.drawAnimationPending));
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
  enforceEquipmentState(game);
  normalizeAllIncenseTokenStacks(game);
  const human = game.players.human;
  const bot = game.players.bot;
  const selectedHandId = getSelectedHandCardId();
  const selectedBattlefieldUid = getSelectedBattlefieldUid();
  const phase = currentPhase(game);
  const selectedAttackers = new Set(game.combat.selectedAttackers || []);

  updateViewportDensityState();
  els.gameView.classList.toggle("is-consecration-focus", phase === "consecration");
  updateGameFeelStateClasses(game, phase);
  els.phaseIndicator.textContent = getPhaseDisplayLabel(game);
  els.phasePanel.classList.toggle("is-human-turn", game.activePlayer === "human");
  els.phasePanel.classList.toggle("is-bot-turn", game.activePlayer === "bot");
  els.phasePanel.classList.toggle("is-discard-phase", phase === "discard");
  els.phaseTracker.innerHTML = renderPhaseTracker(game);
  updateConsecrationHighlights(game, phase);
  updateBattlefieldWallpapers(human, bot);
  setHandExpanded(app.handExpanded);
  updateHandDockStateClasses(game, phase, human, selectedHandId);

  els.botArea.innerHTML = renderPlayerArea(bot, true);
  els.humanArea.innerHTML = renderPlayerArea(human, false);
  els.botBattlefield.innerHTML = renderBattlefield(bot, selectedBattlefieldUid);
  els.humanBattlefield.innerHTML = renderBattlefield(human, selectedBattlefieldUid, selectedAttackers);
  els.botEssence.innerHTML = renderEssence(bot, true);
  els.humanEssence.innerHTML = renderEssence(human);
  updatePhaseFocusHighlights(game, phase);
  updateBattlefieldStateClasses(game, phase, human, bot);
  els.humanHand.style.setProperty("--hand-count", String(human.hand.length));
  els.humanHand.innerHTML = human.hand.map((cardId) => {
    const card = app.cardByCode.get(cardId);
    const baseCost = getCost(card);
    const effectiveCost = getEffectivePlayCost(human, card);
    const costDiscounted = getCardTypeCode(card) !== "PEC" && effectiveCost < baseCost;
    return renderCardButton(cardId, {
      selected: selectedHandId === cardId,
      actionable: (canAct("human") || isHumanPriorityOpen()) && (canConsecrate(human, cardId) || canPlayCard(human, cardId) || canDiscardForHandLimit(human, cardId)),
      costDiscounted,
      effectiveCost,
      zone: "hand"
    });
  }).join("");
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

function updateBattlefieldStateClasses(game, phase, human, bot) {
  [
    [els.humanBattlefield, human],
    [els.botBattlefield, bot]
  ].forEach(([zone, player]) => {
    if (!zone || !player) return;
    const isHuman = player.id === "human";
    const isActive = game.activePlayer === player.id;
    const committedAttackers = Array.isArray(game.combat?.attackers) ? game.combat.attackers : [];
    const canDeclareAttack = isActive
      && phase === "combat"
      && !game.combat?.awaitingBlockers
      && !game.combat?.resolving
      && !committedAttackers.length
      && !player.combatDeclaredThisTurn
      && player.battlefield.some((instance) => canAttackWith(player, instance.uid));
    const canUseFieldAction = player.battlefield.some((instance) => canUsePermanentAction(player, instance));

    zone.dataset.battlefieldPlayer = player.id;
    zone.classList.toggle("is-human-battlefield", isHuman);
    zone.classList.toggle("is-bot-battlefield", !isHuman);
    zone.classList.toggle("is-active-battlefield", isActive);
    zone.classList.toggle("is-empty-battlefield", player.battlefield.length === 0);
    zone.classList.toggle("has-battlefield-cards", player.battlefield.length > 0);
    zone.classList.toggle("is-combat-battlefield", phase === "combat");
    zone.classList.toggle("has-battlefield-action", canUseFieldAction || canDeclareAttack);
  });
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

function getStackObjectVirtueBackground(stackObject) {
  const source = stackObject?.source || {};
  if (source.sourceType !== "virtue") return "";
  return getVirtueArtwork(getVirtueById(source.sourceId));
}

function getStackObjectVirtueCardImage(stackObject) {
  const source = stackObject?.source || {};
  if (source.sourceType !== "virtue") return "";
  return getVirtueCardImage(getVirtueById(source.sourceId));
}

function clearEdgePanelEvents() {
  app.edgeEventTimers.forEach((timer) => window.clearTimeout(timer));
  app.edgeEventTimers.clear();
  app.edgeEvents = [];
  renderStackEdgePanel(app.game);
}

function removeEdgePanelEvent(eventId) {
  const before = app.edgeEvents.length;
  app.edgeEvents = app.edgeEvents.filter((event) => event.id !== eventId);
  const timer = app.edgeEventTimers.get(eventId);
  if (timer) window.clearTimeout(timer);
  app.edgeEventTimers.delete(eventId);
  if (app.edgeEvents.length !== before) renderStackEdgePanel(app.game);
}

function pushEdgePanelEvent(event) {
  if (!event) return;
  const id = `edge-event-${Date.now()}-${++app.edgeEventSeq}`;
  app.edgeEvents.unshift({
    id,
    createdAt: Date.now(),
    gameId: app.game?.id || "",
    ...event
  });
  app.edgeEvents = app.edgeEvents.slice(0, EDGE_EVENT_MAX_ITEMS);
  const activeIds = new Set(app.edgeEvents.map((item) => item.id));
  app.edgeEventTimers.forEach((timer, eventId) => {
    if (activeIds.has(eventId)) return;
    window.clearTimeout(timer);
    app.edgeEventTimers.delete(eventId);
  });
  app.edgeEventTimers.set(id, window.setTimeout(() => removeEdgePanelEvent(id), EDGE_EVENT_TTL_MS));
  renderStackEdgePanel(app.game);
}

function renderEdgeEventArtwork(event) {
  const cardIds = Array.isArray(event.cardIds) ? event.cardIds : [];
  if (cardIds.length > 1) {
    const visibleIds = cardIds.slice(0, 3);
    return `
      <div class="stack-edge-event-thumbs" style="--edge-thumb-count:${visibleIds.length};">
        ${visibleIds.map((cardId, index) => {
          const card = app.cardByCode.get(cardId);
          const image = event.hidden ? CARD_BACK_IMAGE : getCardImage(card);
          const label = event.hidden ? "Carta oculta" : getCardName(card);
          return image ? `<img style="--edge-thumb-index:${index};" src="${escapeHtml(image)}" alt="${escapeHtml(label)}" draggable="false" />` : "";
        }).join("")}
        ${cardIds.length > visibleIds.length ? `<b>+${cardIds.length - visibleIds.length}</b>` : ""}
      </div>
    `;
  }
  const cardId = event.cardId || cardIds[0] || "";
  const card = app.cardByCode.get(cardId);
  const image = event.icon || (event.hidden ? CARD_BACK_IMAGE : getCardImage(card));
  const label = event.iconLabel || (event.hidden ? "Carta oculta" : getCardName(card));
  return image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(label)}" draggable="false" />` : "";
}

function renderEdgeEventCard(event) {
  const kind = event.kind || "event";
  const cardId = event.cardId || (Array.isArray(event.cardIds) ? event.cardIds.find((id) => app.cardByCode.has(id)) : "");
  const moralVirtue = event.moral?.virtueId ? getVirtueById(event.moral.virtueId) : null;
  const moralZoomImage = event.moral?.cardImage || (moralVirtue ? getVirtueCardImage(moralVirtue) : "");
  const moralZoomLabel = event.moral?.virtueName || (moralVirtue ? getVirtueName(moralVirtue) : "Virtude");
  const zoomAttr = cardId && !event.hidden && app.cardByCode.has(cardId)
    ? `data-zoom-card="${escapeHtml(cardId)}"`
    : moralZoomImage
      ? `data-zoom-image="${escapeHtml(moralZoomImage)}" data-zoom-label="${escapeHtml(moralZoomLabel)}"`
      : "";
  const detail = event.detail || event.subtitle || "";
  return `
    <div class="stack-edge-card stack-edge-event-card is-edge-event-${escapeHtml(kind)} ${event.playerId === "bot" ? "is-bot-event" : "is-human-event"}" ${zoomAttr}>
      ${renderEdgeEventArtwork(event)}
      <div>
        <span class="stack-edge-event-kicker">${escapeHtml(event.kicker || "Evento")}</span>
        <strong>${escapeHtml(event.title || "Evento")}</strong>
        ${event.subtitle ? `<small>${escapeHtml(event.subtitle)}</small>` : ""}
        ${detail && detail !== event.subtitle ? `<small class="stack-edge-event-detail">${escapeHtml(detail)}</small>` : ""}
        ${event.moral ? `
          <em class="stack-edge-event-moral is-${escapeHtml(event.moral.tone || "neutral")}">
            ${event.moral.icon ? `<img src="${escapeHtml(event.moral.icon)}" alt="${escapeHtml(event.moral.virtueName || "Virtude")}" draggable="false" />` : ""}
            <span>${escapeHtml(event.moral.virtueName || "Virtude")} Nv${escapeHtml(event.moral.after ?? "")}</span>
          </em>
        ` : ""}
      </div>
    </div>
  `;
}

function renderStackEdgePanel(game) {
  if (!els.stackEdgePanel) return;
  const visibleStack = game?.stack?.slice().reverse() || [];
  const visibleEvents = app.edgeEvents.filter((event) => !event.gameId || !game?.id || event.gameId === game.id);
  if (!visibleStack.length && !visibleEvents.length) {
    els.stackEdgePanel.classList.remove("is-visible");
    els.stackEdgePanel.classList.remove("has-virtue-bg");
    els.stackEdgePanel.classList.remove("is-stack-single", "is-stack-deep", "has-stack", "has-events", "is-events-only");
    els.stackEdgePanel.style.removeProperty("--stack-edge-bg");
    els.stackEdgePanel.removeAttribute("data-stack-count");
    els.stackEdgePanel.innerHTML = "";
    return;
  }
  els.stackEdgePanel.classList.add("is-visible");
  const topVirtueBg = getStackObjectVirtueBackground(visibleStack[0]);
  els.stackEdgePanel.dataset.stackCount = String(visibleStack.length);
  els.stackEdgePanel.classList.toggle("is-stack-single", visibleStack.length === 1);
  els.stackEdgePanel.classList.toggle("is-stack-deep", visibleStack.length > 2);
  els.stackEdgePanel.classList.toggle("has-stack", visibleStack.length > 0);
  els.stackEdgePanel.classList.toggle("has-events", visibleEvents.length > 0);
  els.stackEdgePanel.classList.toggle("is-events-only", !visibleStack.length && visibleEvents.length > 0);
  els.stackEdgePanel.classList.toggle("has-virtue-bg", Boolean(topVirtueBg));
  if (topVirtueBg) {
    els.stackEdgePanel.style.setProperty("--stack-edge-bg", `url("${cssUrl(topVirtueBg)}")`);
  } else {
    els.stackEdgePanel.style.removeProperty("--stack-edge-bg");
  }
  els.stackEdgePanel.innerHTML = `
    ${visibleStack.length ? `
      <section class="stack-edge-section stack-edge-section--stack" aria-label="Pilha">
        <span class="stack-edge-section-head"><em>Pilha</em><b>${visibleStack.length}</b></span>
        ${visibleStack.map((item, index) => {
      const card = app.cardByCode.get(item.cardId);
      const ownerId = item.owner || item.controllerId;
      const owner = ownerId === "human" ? "Voce" : "Bot";
      const icon = card ? getCardArt(card) : item.source?.icon || "";
      const iconLabel = card ? getCardName(card) : item.source?.label || item.label;
      const zoomCardId = card?.code || item.source?.cardId || item.source?.sourceId || "";
      const virtueBg = getStackObjectVirtueBackground(item);
      const virtueZoomImage = getStackObjectVirtueCardImage(item);
      const cardStyle = virtueBg ? `style="--stack-virtue-bg:url(&quot;${escapeHtml(cssUrl(virtueBg))}&quot;)"` : "";
      const zoomAttrs = zoomCardId && app.cardByCode.has(zoomCardId)
        ? `data-zoom-card="${escapeHtml(zoomCardId)}"`
        : virtueZoomImage
          ? `data-zoom-image="${escapeHtml(virtueZoomImage)}" data-zoom-label="${escapeHtml(iconLabel || item.label || "Virtude")}"`
          : "";
      return `
        <div class="stack-edge-card ${index === 0 ? "is-stack-top" : ""} ${virtueBg ? "has-virtue-bg" : ""}" ${cardStyle} ${zoomAttrs}>
          ${icon ? `<img src="${escapeHtml(icon)}" alt="${escapeHtml(iconLabel)}" />` : ""}
          <div>
            <strong>${escapeHtml(item.label)}</strong>
            <small>${index === 0 ? "Topo" : "Abaixo"} · ${escapeHtml(owner)}</small>
          </div>
        </div>
      `;
    }).join("")}
      </section>
    ` : ""}
    ${visibleEvents.length ? `
      <section class="stack-edge-section stack-edge-section--events" aria-label="Eventos recentes">
        <span class="stack-edge-section-head"><em>Eventos</em><b>${visibleEvents.length}</b></span>
        ${visibleEvents.map(renderEdgeEventCard).join("")}
      </section>
    ` : ""}
  `;
}

function renderPhaseTracker(game) {
  return `
    <span class="phase-current">
      <strong>${escapeHtml(getPhaseDisplayLabel(game))}</strong>
    </span>
  `;
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

function renderDockVirtueMetric(player) {
  const axes = getSortedVirtueAxes().slice(0, 7);
  const chips = axes.map((axis) => {
    const options = app.virtues
      .filter((virtue) => Number(virtue.axis) === axis)
      .sort((a, b) => Number(a.id) - Number(b.id));
    const active = options
      .map((virtue) => ({ virtue, value: getVirtueValue(player, virtue.id) }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value || Number(a.virtue.id) - Number(b.virtue.id))[0];
    const displayVirtue = active?.virtue || options.find((virtue) => virtue.polarity === "virtue") || options[0];
    const icon = getVirtueIcon(displayVirtue);
    const label = displayVirtue ? getVirtueName(displayVirtue) : `Virtude ${axis}`;
    const feedback = getVirtueFeedback(player.id, axis);
    const feedbackClass = feedback ? `has-feedback is-feedback-${feedback.tone} is-feedback-${feedback.marker}` : "";
    const feedbackMarker = feedback?.marker === "up"
      ? `<em class="dock-virtue-feedback" aria-hidden="true">▲</em>`
      : feedback?.marker === "down"
        ? `<em class="dock-virtue-feedback" aria-hidden="true">▼</em>`
        : "";
    return `
      <span class="dock-virtue-chip ${active ? active.virtue.polarity === "vice" ? "is-vice" : "is-virtue" : "is-empty"} ${feedbackClass}" title="${escapeHtml(active ? `${getVirtueName(active.virtue)} Nv${active.value}` : label)}">
        ${icon
          ? `<img src="${escapeHtml(icon)}" alt="${escapeHtml(label)}" loading="lazy" draggable="false" />`
          : `<i>${escapeHtml(axis)}</i>`}
        ${active ? `<b>${escapeHtml(active.value)}</b>` : ""}
        ${feedbackMarker}
      </span>
    `;
  }).join("");
  const hasActiveVirtues = getActiveVirtues(player).length > 0;
  return `
    <button class="dock-metric dock-metric--virtues ${hasActiveVirtues ? "is-active" : ""}" type="button" data-virtues-player="${escapeHtml(player.id)}" aria-label="Virtudes de ${escapeHtml(player.label)}">
      <span>Virtudes</span>
      <strong class="dock-virtue-icons">${chips}</strong>
    </button>
  `;
}

function renderIdentityTile(player, card, kind, attrs = "") {
  if (!card) return "";
  const isTerritory = kind === "territory";
  const isChampion = kind === "champion";
  const isTemple = kind === "temple";
  const remaining = isTerritory ? Math.max(0, player.maxTerritory - player.territoryDamage) : 0;
  const currentValue = isTerritory ? remaining : isTemple ? getAvailableEssence(player) : "";
  const totalValue = isTerritory ? player.maxTerritory : isTemple ? getTotalEssenceCapacity(player) : "";
  const labels = isTerritory ? getTerritoryCombatLabels(player.id) : [];
  const attackTargetClass = isTerritory && isHumanAttackTargetAvailable(getTerritoryAttackTarget(player.id)) ? " is-click-attack-target" : "";
  const damagedClass = isTerritory && labels.length ? " is-attack-target" : "";
  const championCoveredClass = isChampion && player.championCovered ? " is-covered" : "";
  const championActionClass = isChampion && player.id === "human" && canUseChampionAction(player) ? " is-actionable" : "";
  const image = getCardArt(card);
  const label = kind === "champion" ? "Campeao" : kind === "territory" ? "Territorio" : "Templo";
  const marker = isTerritory || isTemple
    ? `<strong class="identity-dock-value"><span>${escapeHtml(currentValue)}</span><small>/${escapeHtml(totalValue)}</small></strong>`
    : isChampion && player.championCovered
      ? `<strong class="identity-dock-state">Encoberto</strong>`
      : "";
  return `
    <button class="identity-dock-tile identity-dock-tile--${escapeHtml(kind)}${damagedClass}${attackTargetClass}${championCoveredClass}${championActionClass}" type="button" ${attrs}>
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
  const templeExpanded = app.expandedTemplePlayer === player.id;
  const identityMarkup = `
    <div class="player-dock-identity ${templeExpanded ? "is-expanded" : ""}">
      ${templeExpanded
        ? renderTempleDockExpansion(player, temple)
        : `
          ${renderIdentityTile(player, champion, "champion", `data-champion-player="${escapeHtml(player.id)}" data-zoom-card="${escapeHtml(player.identity.champion)}"`)}
          ${renderIdentityTile(player, territory, "territory", `data-territory-player="${escapeHtml(player.id)}" data-zoom-card="${escapeHtml(player.identity.territory)}"`)}
          ${renderIdentityTile(player, temple, "temple", `data-temple-player="${escapeHtml(player.id)}" data-zoom-card="${escapeHtml(player.identity.temple)}"`)}
        `}
    </div>
  `;
  const labelMarkup = `
    <div class="player-dock-label">
      <span>${hideHand ? "Oponente" : "Você"}</span>
      <strong>${escapeHtml(player.label)}</strong>
    </div>
  `;
  const metricsMarkup = `
    <div class="player-dock-metrics">
      ${renderDockMetric({ label: "Mão", value: player.hand.length, icon: "hand" })}
      ${renderDockMetric({ label: "Deck", value: player.deck.length, icon: "deck" })}
      ${labelMarkup}
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
  const virtuesMarkup = renderDockVirtueMetric(player);
  const activePlayerClass = app.game?.activePlayer === player.id ? " is-active-player" : "";
  return `
    <div class="player-dock ${hideHand ? "player-dock--opponent" : "player-dock--human"}${activePlayerClass}${dangerClass}${damagedClass}" data-player-id="${escapeHtml(player.id)}">
      ${hideHand
        ? `${metricsMarkup}${virtuesMarkup}${identityMarkup}`
        : `${identityMarkup}${virtuesMarkup}${metricsMarkup}`}
    </div>
  `;
}

function renderBattlefield(player, selectedUid, selectedAttackers = new Set()) {
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
    <div class="battlefield-line battlefield-line--${name} ${instances.length ? "has-cards" : "is-empty-line"}" data-line="${escapeHtml(name)}">
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
          actionable: player.id === "human" && canUsePermanentAction(player, instance),
          essenceGenerator: isEssenceGeneratorInstance(instance),
          combatLabels,
          damage: instance.damage || 0,
          damageFlash: instance.damageFlash,
          statFeedback: instance.statFeedback,
          dying: instance.dying,
          instance,
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
  const instance = options.instance || null;
  const attachedEquipment = isFieldTile && isCharacter && instance ? getAttachedEquipmentInstances(instance) : [];
  const isAttachedEquipment = isFieldTile && instance && isEquipmentInstance(instance) && Boolean(instance.attachedTo);
  const statModifier = isFieldTile && isCharacter && instance ? getCharacterStatModifier(instance) : null;
  const attack = isFieldTile && isCharacter && instance ? getCharacterPower(instance) : toNumber(card.stats?.attack, 0);
  const resistance = isFieldTile && isCharacter && instance ? getCharacterResistance(instance) : toNumber(card.stats?.resistance, 0);
  const tokenQuantity = isFieldTile && instance && isIncenseTokenCard(card) ? getTokenQuantity(instance) : 0;
  const costDisplay = options.costDiscounted ? options.effectiveCost : getCost(card);
  const damage = toNumber(options.damage, 0);
  const virtuePips = isHandTile
    ? renderCardVirtuePips(card, 5, { fixedSlots: true })
    : renderCardVirtuePips(card);
  const statusPips = [
    options.essenceGenerator ? `<span class="field-card-pip field-card-pip--tap" title="Despreparar: gera Essência" aria-label="Despreparar para gerar Essência"></span>` : "",
    ...(options.combatLabels || []).map((label) => `<span class="field-card-pip" title="Combate">${escapeHtml(label)}</span>`),
    options.declared && !(options.combatLabels || []).some((label) => label.startsWith("A")) ? `<span class="field-card-pip" title="Atacante declarado">A</span>` : ""
  ].filter(Boolean).join("");
  const classes = [
    "play-card",
    isFieldTile ? "is-field-tile" : "",
    isHandTile ? "is-hand-tile" : "",
    isFieldTile ? `is-field-type-${String(typeCode || "CRD").toLowerCase()}` : "",
    isHandTile ? `is-hand-type-${String(typeCode || "CRD").toLowerCase()}` : "",
    isLandscapeCard(card) ? "is-landscape" : "",
    options.costDiscounted ? "is-cost-discounted" : "",
    statModifier ? "is-stat-modified" : "",
    statModifier ? `is-stat-${statModifier.tone}` : "",
    options.statFeedback ? "has-stat-feedback" : "",
    options.statFeedback ? `is-stat-feedback-${options.statFeedback.tone || "buff"}` : "",
    tokenQuantity > 0 ? "has-token-count" : "",
    options.actionable ? "is-actionable-card" : "",
    options.essenceGenerator ? "is-essence-generator" : "",
    attachedEquipment.length ? "is-equipped-card" : "",
    isAttachedEquipment ? "is-attached-equipment" : "",
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
  const draggable = options.zone === "hand" || options.zone === "battlefield" ? "draggable=\"false\"" : "";
  const style = "";

  return `
    <button class="${classes}" type="button" ${data} ${draggable} ${style} data-zoom-card="${escapeHtml(cardId)}" title="${escapeHtml(getCardName(card))}">
      <img class="card-main-art" src="${escapeHtml(image)}" alt="${escapeHtml(getCardName(card))}" loading="lazy" draggable="false" />
      ${isHandTile ? `<span class="hand-card-cost"><b>${escapeHtml(costDisplay)}</b></span>` : ""}
      ${isHandTile && virtuePips ? `<span class="hand-card-pips">${virtuePips}</span>` : ""}
      ${isHandTile ? `<span class="card-type-gem card-type-gem--${String(typeCode || "CRD").toLowerCase()}"></span>` : ""}
      ${isHandTile && isCharacter ? `<span class="hand-card-stats">${attack}/${resistance}</span>` : ""}
      ${isFieldTile && statusPips ? `<span class="field-card-pips">${statusPips}</span>` : ""}
      ${tokenQuantity > 0 ? `<span class="field-card-token-count" title="${escapeHtml(`${tokenQuantity} ficha${tokenQuantity === 1 ? "" : "s"} de Incenso`)}">${tokenQuantity}</span>` : ""}
      ${isFieldTile && attachedEquipment.length ? `
        <span class="field-card-equipment" title="${escapeHtml(attachedEquipment.map(({ instance: equipment }) => getCardName(app.cardByCode.get(equipment.cardId))).join(", "))}">
          ${attachedEquipment.slice(0, 3).map(({ instance: equipment }) => {
            const equipmentCard = app.cardByCode.get(equipment.cardId);
            return `<img src="${escapeHtml(getCardArt(equipmentCard))}" alt="${escapeHtml(getCardName(equipmentCard))}" draggable="false" />`;
          }).join("")}
          ${attachedEquipment.length > 3 ? `<b>+${attachedEquipment.length - 3}</b>` : ""}
        </span>
      ` : ""}
      ${isFieldTile && attachedEquipment.length ? `<span class="field-card-equipped-link" aria-hidden="true"></span>` : ""}
      ${isAttachedEquipment ? `<span class="field-card-attachment" title="Anexado">EQ</span>` : ""}
      ${isFieldTile && isCharacter ? `<span class="field-card-stats ${statModifier ? `is-${statModifier.tone}` : ""}">${attack}/${resistance}</span>` : ""}
      ${isFieldTile && isCharacter && damage > 0 ? `<span class="field-card-damage">${damage}</span>` : ""}
      ${isFieldTile && isCharacter && options.statFeedback ? `<span class="field-card-stat-feedback is-${escapeHtml(options.statFeedback.tone || "buff")}">${escapeHtml(options.statFeedback.label || "")}</span>` : ""}
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
  const modal = getInformationalModalElement();
  const cards = [...player.cemetery].reverse();
  modal.innerHTML = `
    <div class="zone-modal-panel" role="dialog" aria-modal="true" aria-label="Cemiterio de ${escapeHtml(player.label)}">
      <div class="zone-modal-head">
        <div>
          <span>Zona de cemiterio</span>
          <b>${escapeHtml(player.label)} - ${cards.length} carta${cards.length === 1 ? "" : "s"}</b>
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
  showModalElement(modal);
}

function showReserveModal(playerId) {
  const player = app.game?.players?.[playerId];
  if (!player) return;
  const modal = getInformationalModalElement();
  const cards = player.reserve || [];
  const canReveal = player.id === "human";
  modal.innerHTML = `
    <div class="zone-modal-panel zone-modal-panel--reserve" role="dialog" aria-modal="true" aria-label="Reserva de ${escapeHtml(player.label)}">
      <div class="zone-modal-head">
        <div>
          <span>Zona de reserva</span>
          <b>${escapeHtml(player.label)} - ${cards.length} carta${cards.length === 1 ? "" : "s"}</b>
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
  showModalElement(modal);
}

function showVirtuesModal(playerId) {
  const player = app.game?.players?.[playerId];
  if (!player) return;
  const modal = getInformationalModalElement();
  const state = player.virtues || {};
  const activeVirtues = sortVirtuesByDisplayOrder(app.virtues
    .map((virtue) => ({
      virtue,
      value: toNumber(state[String(virtue.id)], 0),
      level: getVirtueLevelData(virtue, toNumber(state[String(virtue.id)], 0))
    }))
    .filter((item) => item.value > 0), (item) => item.virtue);
  modal.innerHTML = `
    <div class="zone-modal-panel zone-modal-panel--virtues" role="dialog" aria-modal="true" aria-label="Virtudes de ${escapeHtml(player.label)}">
      <div class="zone-modal-head">
        <div>
          <span>Eixos morais</span>
          <b>${escapeHtml(player.label)}</b>
        </div>
        <button type="button" data-close-zone-modal>Fechar</button>
      </div>
      <div class="virtue-modal-grid">
        ${activeVirtues.length
          ? activeVirtues.map(({ virtue, value, level }) => {
          const icon = getVirtueIcon(virtue);
          return `
            <article class="virtue-modal-card is-active">
              <div class="virtue-modal-head">
                ${icon ? `<img src="${escapeHtml(icon)}" alt="${escapeHtml(getVirtueName(virtue))}" loading="lazy" draggable="false" />` : ""}
                <div>
                  <strong>${escapeHtml(getVirtueName(virtue))}</strong>
                </div>
                <b>${value > 0 ? `Nv${value}` : "0"}</b>
              </div>
              <p>${escapeHtml(localize(level?.text) || localize(virtue.flavor) || "Efeito ainda sem descrição.")}</p>
            </article>
          `;
        }).join("")
          : `<p class="zone-modal-empty">Nenhuma Virtude ou Desvirtude ativa.</p>`}
      </div>
    </div>
  `;
  showModalElement(modal);
}

function shouldOfferVirtueDebug(game = app.game, playerId = "human") {
  return Boolean(
    game &&
    app.isLocalDebugHost &&
    game.config?.virtueDebugEnabled &&
    playerId === "human" &&
    game.activePlayer === "human" &&
    currentPhase(game) === "prepare"
  );
}

function getVirtueDebugKey(game = app.game, playerId = "human") {
  if (!game) return "";
  return `${game.id}:${game.turnNumber}:${playerId}:prepare`;
}

function getVirtueDebugSummary(changes = []) {
  return changes.map((change) => `${getVirtueName(change.virtue)} ${change.before}->${change.after}`).join(", ");
}

function applyManualVirtueLevel(playerId, virtueId, level) {
  const game = app.game;
  const player = game?.players?.[playerId];
  const virtue = getVirtueById(virtueId);
  if (!player || !virtue) return false;

  const before = new Map(app.virtues.map((item) => [Number(item.id), getVirtueValue(player, item.id)]));
  const normalizedLevel = Math.max(0, Math.min(4, toNumber(level, 0)));
  setVirtueValue(player, virtue.id, normalizedLevel);
  if (normalizedLevel > 0) {
    const opposite = getVirtueById(virtue.oppositeId);
    if (opposite) setVirtueValue(player, opposite.id, 0);
  }

  const changes = app.virtues
    .map((item) => ({
      virtue: item,
      before: before.get(Number(item.id)) || 0,
      after: getVirtueValue(player, item.id)
    }))
    .filter((item) => item.before !== item.after);

  if (!changes.length) return false;
  const result = { changes };
  markMoralResultFeedback(playerId, result);
  addLog(game, `ajuste manual de virtudes: ${getVirtueDebugSummary(changes)}.`, player.label);
  renderGame();
  renderVirtueDebugModal(playerId);
  return true;
}

function renderVirtueDebugModal(playerId = "human") {
  const player = app.game?.players?.[playerId];
  let modal = document.getElementById("zoneModal");
  if (!player || !modal || !app.pendingVirtueDebug) return;

  const axes = getSortedVirtueAxes();
  modal.innerHTML = `
    <div class="zone-modal-panel zone-modal-panel--virtue-debug" role="dialog" aria-modal="true" aria-label="Ajuste manual de virtudes">
      <div class="zone-modal-head">
        <div>
          <span>Teste local</span>
          <b>Ajuste manual de virtudes</b>
        </div>
        <button type="button" data-close-virtue-debug>Continuar</button>
      </div>
      <div class="virtue-debug-grid">
        ${axes.map((axis) => {
          const entries = sortVirtuesByDisplayOrder(app.virtues
            .filter((virtue) => Number(virtue.axis) === axis)
            .sort((a, b) => Number(a.id) - Number(b.id)));
          return `
            <section class="virtue-debug-axis">
              ${entries.map((virtue) => {
                const value = getVirtueValue(player, virtue.id);
                const icon = getVirtueIcon(virtue);
                const levelData = getVirtueLevelData(virtue, value);
                return `
                  <article class="virtue-debug-card ${virtue.polarity === "vice" ? "is-vice" : "is-virtue"} ${value > 0 ? "is-active" : ""}">
                    <div class="virtue-debug-card-head">
                      ${icon ? `<img src="${escapeHtml(icon)}" alt="${escapeHtml(getVirtueName(virtue))}" draggable="false" />` : ""}
                      <div>
                        <strong>${escapeHtml(getVirtueName(virtue))}</strong>
                        <small>${escapeHtml(localize(levelData?.title) || (value > 0 ? `Nv${value}` : "Neutra"))}</small>
                      </div>
                    </div>
                    <div class="virtue-debug-levels">
                      ${[0, 1, 2, 3, 4].map((option) => `
                        <button type="button" class="${option === value ? "is-active" : ""}" data-virtue-debug-set="${escapeHtml(virtue.id)}" data-virtue-debug-level="${option}">
                          ${option}
                        </button>
                      `).join("")}
                    </div>
                  </article>
                `;
              }).join("")}
            </section>
          `;
        }).join("")}
      </div>
    </div>
  `;
  showModalElement(modal);
}

function showVirtueDebugModal(playerId = "human") {
  if (!shouldOfferVirtueDebug(app.game, playerId)) return false;
  let modal = document.getElementById("zoneModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "zoneModal";
    modal.className = "zone-modal";
    document.body.appendChild(modal);
  }
  app.pendingVirtueDebug = {
    playerId,
    key: getVirtueDebugKey(app.game, playerId)
  };
  clearHumanAutoPass();
  renderVirtueDebugModal(playerId);
  return true;
}

function closeVirtueDebugModal() {
  if (!app.pendingVirtueDebug) return;
  app.pendingVirtueDebug = null;
  hideModalById("zoneModal");
  renderGame();
}

function waitForPrepareDebug(game, playerId, onReady) {
  if (!shouldOfferVirtueDebug(game, playerId)) {
    onReady?.();
    return;
  }
  const key = getVirtueDebugKey(game, playerId);
  if (game.virtueDebugPromptKey !== key) {
    game.virtueDebugPromptKey = key;
    showVirtueDebugModal(playerId);
  }
  const tick = () => {
    if (!app.game || app.game !== game || game.status !== "active" || game.activePlayer !== playerId) return;
    if (currentPhase(game) !== "prepare") return;
    if (app.pendingVirtueDebug?.key === key) {
      window.setTimeout(tick, 120);
      return;
    }
    onReady?.();
  };
  tick();
}

function showMoralChoiceModal({ playerId, title, description, choices, context, onComplete }) {
  const player = app.game?.players?.[playerId];
  if (!player) return;
  let modal = document.getElementById("zoneModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "zoneModal";
    modal.className = "zone-modal";
    document.body.appendChild(modal);
  }
  clearHumanAutoPass();
  app.pendingMoralChoice = { playerId, choices, context, onComplete };
  modal.innerHTML = `
    <div class="zone-modal-panel zone-modal-panel--moral-choice" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
      <div class="zone-modal-head">
        <div>
          <span>Ajuste moral</span>
          <b>${escapeHtml(title)}</b>
        </div>
      </div>
      <p class="moral-choice-description">${escapeHtml(description)}</p>
      <div class="moral-choice-grid">
        ${choices.map((choice, index) => `
          <button class="moral-choice-card" type="button" data-moral-choice="${index}">
            ${choice.icon ? `<img src="${escapeHtml(choice.icon)}" alt="${escapeHtml(choice.title)}" draggable="false" />` : ""}
            <span>
              <em>${escapeHtml(choice.effectTitle)}</em>
              <p>${escapeHtml(choice.effectText)}</p>
            </span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
  decorateDecisionModal(modal);
  showModalElement(modal);
}

function resolveMoralChoice(index) {
  const pending = app.pendingMoralChoice;
  if (!pending || pending.playerId !== "human") return false;
  const choice = pending.choices[Number(index)];
  const player = app.game?.players?.[pending.playerId];
  if (!choice || !player) return false;
  const result = applyMoralShift(player, choice.targetId, choice.delta);
  addMoralShiftLog(app.game, player, result, pending.context);
  app.pendingMoralChoice = null;
  closeDecisionModal(document.getElementById("zoneModal"));
  pending.onComplete?.(result);
  renderGame();
  return true;
}

function hideZoneModal() {
  if (app.pendingMoralChoice || app.pendingEngineChoice || app.pendingVirtueDebug) return;
  hideModalById("zoneModal");
}

function clearTransientOverlays() {
  app.blockReviewResume = null;
  app.pendingMoralChoice = null;
  app.pendingEngineChoice = null;
  app.pendingVirtueDebug = null;
  app.drawAnimationPending = false;
  clearEdgePanelEvents();
  clearDecisionBattlefieldView();
  clearAllVirtueFeedback();
  clearAllStatFeedback();
  ["phaseAlert", "playedCardAnimation", "pulverizeAnimation", "revealAnimation", "drawAnimation", "interactionHint", "cardZoomPreview", "zoneModal", "fieldViewModal", "blockPrompt", "botBlockReview"].forEach((id) => {
    document.getElementById(id)?.classList.remove("is-visible", "is-closing");
  });
  syncFeedbackOverlayState();
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

function updateActionDockStateClasses({
  phase = "",
  mode = "",
  priorityOpen = false,
  visibleActionCount = 0,
  showAttack = false,
  showEndTurn = false,
  hasSelection = false
} = {}) {
  const dock = els.actionDock;
  if (!dock) return;
  const actionMode = mode || (priorityOpen ? "priority" : showAttack ? "combat" : showEndTurn ? "end-turn" : "phase");
  dock.dataset.phase = phase || "";
  dock.dataset.actionMode = actionMode;
  dock.style.setProperty("--visible-actions", String(visibleActionCount));
  dock.classList.toggle("is-result-viewing", actionMode === "result");
  dock.classList.toggle("is-decision-view", actionMode === "decision");
  dock.classList.toggle("is-waiting-opponent", actionMode === "waiting-opponent");
  dock.classList.toggle("is-priority-open", priorityOpen);
  dock.classList.toggle("is-combat-action", showAttack || actionMode === "combat");
  dock.classList.toggle("is-end-turn-action", showEndTurn || actionMode === "end-turn");
  dock.classList.toggle("is-single-action", visibleActionCount === 1);
  dock.classList.toggle("has-visible-actions", visibleActionCount > 0);
  dock.classList.toggle("has-selected-card", hasSelection);
  els.gameView?.classList.toggle("is-action-dock-empty", visibleActionCount === 0);
}

function renderActionState() {
  if (app.resultViewingBoard) {
    els.selectedCardPanel.hidden = true;
    els.drawButton.hidden = true;
    els.consecrateButton.hidden = true;
    els.playCardButton.hidden = true;
    els.attackButton.hidden = true;
    els.endTurnButton.hidden = true;
    els.nextPhaseButton.hidden = false;
    els.nextPhaseButton.disabled = false;
    els.nextPhaseButton.textContent = "VER RESULTADOS";
    els.nextPhaseButton.dataset.actionSubtitle = "Retornar para a tela final";
    els.nextPhaseButton.classList.remove("is-priority-button");
    els.actionGrid?.style.setProperty("--action-columns", "1");
    updateActionDockStateClasses({
      phase: currentPhase(app.game),
      mode: "result",
      visibleActionCount: 1,
      hasSelection: Boolean(app.selected)
    });
    return;
  }
  els.selectedCardPanel.hidden = false;
  if (app.decisionBattlefieldView && hasPendingChoiceWork()) {
    els.selectedCardPanel.innerHTML = "<span>Escolha pendente</span><strong>Ver campo</strong><small>Volte à escolha para continuar</small>";
    els.drawButton.hidden = true;
    els.consecrateButton.hidden = true;
    els.playCardButton.hidden = true;
    els.attackButton.hidden = true;
    els.nextPhaseButton.hidden = false;
    els.endTurnButton.hidden = true;
    els.nextPhaseButton.disabled = false;
    els.nextPhaseButton.textContent = "VOLTAR À ESCOLHA";
    els.nextPhaseButton.dataset.actionSubtitle = "Reabrir modal de decisão";
    els.nextPhaseButton.classList.remove("is-priority-button");
    els.actionGrid?.style.setProperty("--action-columns", "1");
    updateActionDockStateClasses({
      phase: currentPhase(app.game),
      mode: "decision",
      visibleActionCount: 1,
      hasSelection: Boolean(app.selected)
    });
    return;
  }
  const human = app.game.players.human;
  const humanTurn = canAct("human");
  const priorityOpen = isHumanPriorityOpen();
  const combatLocked = Boolean(app.game.combat.awaitingBlockers || app.game.combat.resolving || app.game.combat.attackers.length);
  const readyAttackers = human.battlefield.filter((instance) => canAttackWith(human, instance.uid));
  const selectedAttackers = getSelectedAttackers(human);
  const phase = currentPhase(app.game);
  const showAttack = !priorityOpen && humanTurn && phase === "combat" && !combatLocked && !human.combatDeclaredThisTurn && readyAttackers.length > 0;
  const showNextPhase = priorityOpen || (humanTurn && ["consecration", "preparation", "combat"].includes(phase) && !combatLocked);
  const showEndTurn = !priorityOpen && humanTurn && phase === "regroup" && !combatLocked;
  const visibleActionCount = [showAttack, showNextPhase, showEndTurn].filter(Boolean).length;

  if (!visibleActionCount) {
    els.drawButton.hidden = true;
    els.consecrateButton.hidden = true;
    els.playCardButton.hidden = true;
    els.attackButton.hidden = true;
    els.endTurnButton.hidden = true;
    els.nextPhaseButton.hidden = false;
    els.nextPhaseButton.disabled = true;
    els.nextPhaseButton.textContent = app.game.activePlayer === "bot" ? "TURNO DO OPONENTE" : "AGUARDANDO";
    els.nextPhaseButton.dataset.actionSubtitle = app.game.activePlayer === "bot" ? "Aguardando Bot" : "Resolvendo a partida";
    els.nextPhaseButton.classList.remove("is-priority-button");
    els.actionGrid?.style.setProperty("--action-columns", "1");
    updateActionDockStateClasses({
      phase,
      mode: "waiting-opponent",
      visibleActionCount: 1,
      hasSelection: Boolean(app.selected)
    });
    return;
  }

  els.drawButton.textContent = "Comprar 2";
  els.consecrateButton.textContent = "Consagrar";
  els.playCardButton.textContent = "Jogar";
  els.attackButton.textContent = selectedAttackers.length ? `Atacar com ${selectedAttackers.length}` : "TODAS ATACAM";
  els.nextPhaseButton.textContent = getNextActionLabel(app.game, priorityOpen);
  els.attackButton.dataset.actionSubtitle = selectedAttackers.length ? "Confirmar atacantes selecionados" : "Declarar todos os atacantes preparados";
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
  els.attackButton.disabled = combatLocked || !humanTurn || phase !== "combat" || !readyAttackers.length;
  els.nextPhaseButton.disabled = !showNextPhase;
  els.endTurnButton.disabled = !showEndTurn;
  updateActionDockStateClasses({
    phase,
    priorityOpen,
    visibleActionCount,
    showAttack,
    showEndTurn,
    hasSelection: Boolean(app.selected)
  });
}

function getNextActionSubtitle(game, priorityOpen = false) {
  if (priorityOpen) return "Não fazer nada nesta janela";
  const phase = currentPhase(game);
  const activePlayer = currentPlayer(game);
  const hasReadyAttackers = activePlayer?.battlefield?.some((instance) => canAttackWith(activePlayer, instance.uid));
  const subtitles = {
    prepare: "Continuar para a compra",
    draw: "Continuar para a Consagração",
    consecration: "Omitir a ação estrutural",
    preparation: "Avançar para o Combate",
    combat: game.combat?.step === "attackers-declared"
      ? "Abrir declaração de bloqueadores"
      : hasReadyAttackers ? "Encerrar a etapa de Combate" : "Nenhum atacante preparado",
    regroup: "Finalizar o turno"
  };
  return subtitles[phase] || "Continuar a partida";
}

function getNextActionLabel(game, priorityOpen = false) {
  if (priorityOpen) return "Passar prioridade";
  const phase = currentPhase(game);
  const activePlayer = currentPlayer(game);
  const hasReadyAttackers = activePlayer?.battlefield?.some((instance) => canAttackWith(activePlayer, instance.uid));
  const nextLabels = {
    prepare: "Ir para compra",
    draw: "Ir para consagracao",
    consecration: "Nao quero consagrar",
    preparation: "Ir para combate",
    combat: game.combat?.step === "attackers-declared"
      ? "Ir para bloqueadores"
      : hasReadyAttackers ? "Sem ataques" : "Ir para reagrupamento",
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
  const statModifier = isCharacter ? getCharacterStatModifier(instance) : null;
  const equipment = isCharacter ? getAttachedEquipmentInstances(instance) : [];
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
      ${isCharacter ? `<strong class="block-mini-stats ${statModifier ? `is-${statModifier.tone}` : ""}">${getCharacterPower(instance)}/${getCharacterResistance(instance)}</strong>` : ""}
      ${isCharacter && damage > 0 ? `<em class="block-mini-damage">${damage}</em>` : ""}
      ${equipment.length ? `
        <span class="block-mini-equipment" aria-label="Equipamentos anexados">
          ${equipment.map(({ instance: equipmentInstance }) => {
            const equipmentCard = app.cardByCode.get(equipmentInstance.cardId);
            return `<img src="${escapeHtml(getCardArt(equipmentCard))}" alt="${escapeHtml(getCardName(equipmentCard))}" draggable="false" />`;
          }).join("")}
        </span>
      ` : ""}
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
    hideModalElement(modal);
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
  const blockers = defender.battlefield.filter((instance) =>
    attackers.some((attacker) => canBlockAttack(defender, instance.uid, attackerPlayer, attacker.uid))
  );
  const assignedBlockerUids = new Set(Object.values(game.combat.blockers || {}).flat());
  const unassignedBlockers = blockers.filter((blocker) => !assignedBlockerUids.has(blocker.uid));
  modal.dataset.attackers = String(attackers.length);
  modal.dataset.blockers = String(blockers.length);
  modal.classList.toggle("has-available-blockers", unassignedBlockers.length > 0);
  modal.classList.toggle("has-multiple-attackers", attackers.length > 1);

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

  showModalElement(modal);
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
  hideModalById("blockPrompt");
}

function getAudioContext() {
  if (!app.soundEnabled || !window.AudioContext && !window.webkitAudioContext) return null;
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!app.audio) app.audio = new AudioContextCtor();
  if (app.audio.state === "suspended") {
    app.audio.resume?.().catch(() => {});
  }
  return app.audio;
}

function getNoiseBuffer(ctx) {
  if (app.noiseBuffer && app.noiseBuffer.sampleRate === ctx.sampleRate) return app.noiseBuffer;
  const length = Math.floor(ctx.sampleRate * 1.1);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let previous = 0;
  for (let index = 0; index < length; index += 1) {
    const white = Math.random() * 2 - 1;
    previous = previous * .82 + white * .18;
    data[index] = previous;
  }
  app.noiseBuffer = buffer;
  return buffer;
}

function getSfxOutput(ctx) {
  if (app.sfxOutput?.ctx === ctx) return app.sfxOutput.input;
  const input = ctx.createGain();
  const dry = ctx.createGain();
  const delay = ctx.createDelay(.18);
  const feedback = ctx.createGain();
  const wet = ctx.createGain();
  const compressor = ctx.createDynamicsCompressor();
  dry.gain.value = .84;
  wet.gain.value = .16;
  delay.delayTime.value = .058;
  feedback.gain.value = .18;
  compressor.threshold.value = -20;
  compressor.knee.value = 20;
  compressor.ratio.value = 5;
  compressor.attack.value = .002;
  compressor.release.value = .18;
  input.connect(dry);
  input.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(wet);
  dry.connect(compressor);
  wet.connect(compressor);
  compressor.connect(ctx.destination);
  app.sfxOutput = { ctx, input };
  return input;
}

function connectEnvelope(ctx, volume, start, duration, attack = .006, releaseFloor = .0001) {
  const gain = ctx.createGain();
  gain.gain.cancelScheduledValues(start);
  gain.gain.setValueAtTime(releaseFloor, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(releaseFloor, volume), start + attack);
  gain.gain.exponentialRampToValueAtTime(releaseFloor, start + Math.max(attack + .01, duration));
  gain.connect(getSfxOutput(ctx));
  return gain;
}

function playOscLayer(ctx, options = {}) {
  const start = ctx.currentTime + (options.delay || 0);
  const duration = options.duration || .12;
  const oscillator = ctx.createOscillator();
  const gain = connectEnvelope(ctx, options.volume || .035, start, duration, options.attack || .006);
  oscillator.type = options.type || "sine";
  oscillator.frequency.setValueAtTime(options.frequency || 440, start);
  if (options.endFrequency) {
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, options.endFrequency), start + duration);
  }
  oscillator.detune.setValueAtTime(options.detune || 0, start);
  oscillator.connect(gain);
  oscillator.start(start);
  oscillator.stop(start + duration + .04);
}

function playNoiseLayer(ctx, options = {}) {
  const start = ctx.currentTime + (options.delay || 0);
  const duration = options.duration || .12;
  const source = ctx.createBufferSource();
  const filter = ctx.createBiquadFilter();
  const gain = connectEnvelope(ctx, options.volume || .026, start, duration, options.attack || .004);
  source.buffer = getNoiseBuffer(ctx);
  filter.type = options.filterType || "bandpass";
  filter.frequency.setValueAtTime(options.frequency || 1200, start);
  if (options.endFrequency) {
    filter.frequency.exponentialRampToValueAtTime(Math.max(40, options.endFrequency), start + duration);
  }
  filter.Q.value = options.q || 1.2;
  source.connect(filter);
  filter.connect(gain);
  source.start(start);
  source.stop(start + duration + .04);
}

function playCardChime(ctx, frequencies, baseDelay = 0, options = {}) {
  frequencies.forEach((frequency, index) => {
    playOscLayer(ctx, {
      frequency,
      endFrequency: frequency * (options.endRatio || 1.015),
      delay: baseDelay + index * (options.spacing || .035),
      duration: options.duration || .18,
      volume: options.volume || .023,
      type: options.type || "triangle",
      attack: options.attack || .01
    });
  });
}

function playTone(kind) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const normalized = String(kind || "soft").toLowerCase();
  const cardType = normalized.startsWith("play-") ? normalized.replace("play-", "") : "";

  if (normalized === "draw") {
    playNoiseLayer(ctx, { frequency: 2600, endFrequency: 720, duration: .14, volume: .038, filterType: "bandpass", q: 2.4 });
    playNoiseLayer(ctx, { frequency: 5200, endFrequency: 1800, delay: .045, duration: .13, volume: .018, filterType: "highpass", q: .9 });
    playOscLayer(ctx, { frequency: 520, endFrequency: 760, delay: .03, duration: .12, volume: .016, type: "triangle" });
    playOscLayer(ctx, { frequency: 1040, endFrequency: 1220, delay: .07, duration: .1, volume: .01, type: "sine" });
    return;
  }

  if (normalized === "shuffle") {
    [0, .055, .11, .17, .235].forEach((delay, index) => {
      playNoiseLayer(ctx, {
        frequency: 850 + index * 180,
        endFrequency: 420 + index * 90,
        delay,
        duration: .09,
        volume: .024,
        filterType: "bandpass",
        q: 1.1
      });
    });
    playOscLayer(ctx, { frequency: 92, endFrequency: 68, delay: .02, duration: .22, volume: .018, type: "sine" });
    return;
  }

  if (normalized === "hit") {
    playOscLayer(ctx, { frequency: 92, endFrequency: 38, duration: .2, volume: .07, type: "sawtooth", attack: .0015 });
    playNoiseLayer(ctx, { frequency: 210, endFrequency: 58, duration: .2, volume: .06, filterType: "lowpass", q: .7 });
    playNoiseLayer(ctx, { frequency: 2100, endFrequency: 760, duration: .055, volume: .035, filterType: "bandpass", q: 2.6 });
    playNoiseLayer(ctx, { frequency: 4600, delay: .018, duration: .035, volume: .012, filterType: "highpass", q: .8 });
    return;
  }

  if (normalized === "heal") {
    playCardChime(ctx, [392, 523, 659, 784], 0, { spacing: .03, duration: .22, volume: .019, endRatio: 1.025 });
    playNoiseLayer(ctx, { frequency: 2300, endFrequency: 5200, duration: .3, volume: .016, filterType: "highpass", q: .8 });
    playOscLayer(ctx, { frequency: 196, endFrequency: 262, duration: .28, volume: .018, type: "sine" });
    return;
  }

  if (normalized === "buff") {
    playNoiseLayer(ctx, { frequency: 1700, endFrequency: 5800, duration: .28, volume: .022, filterType: "highpass", q: .7 });
    playNoiseLayer(ctx, { frequency: 620, endFrequency: 1800, delay: .015, duration: .18, volume: .018, filterType: "bandpass", q: 1.8 });
    playOscLayer(ctx, { frequency: 196, endFrequency: 247, duration: .26, volume: .025, type: "triangle" });
    playCardChime(ctx, [494, 659, 988, 1318], .035, { spacing: .026, duration: .2, volume: .018, endRatio: 1.035 });
    playOscLayer(ctx, { frequency: 1760, endFrequency: 2349, delay: .1, duration: .12, volume: .008, type: "sine" });
    return;
  }

  if (normalized === "pulverize") {
    playNoiseLayer(ctx, { frequency: 460, endFrequency: 72, duration: .36, volume: .06, filterType: "lowpass", q: .9 });
    playNoiseLayer(ctx, { frequency: 2800, endFrequency: 520, delay: .03, duration: .26, volume: .034, filterType: "bandpass", q: 2 });
    playOscLayer(ctx, { frequency: 132, endFrequency: 52, delay: .025, duration: .32, volume: .038, type: "sawtooth" });
    playNoiseLayer(ctx, { frequency: 6000, delay: .18, duration: .08, volume: .012, filterType: "highpass" });
    return;
  }

  if (normalized === "consecrate") {
    playNoiseLayer(ctx, { frequency: 1600, endFrequency: 5200, duration: .32, volume: .022, filterType: "highpass", q: .7 });
    playOscLayer(ctx, { frequency: 98, endFrequency: 147, duration: .42, volume: .022, type: "sine" });
    playCardChime(ctx, [330, 495, 660, 990, 1320], .02, { spacing: .032, duration: .24, volume: .021, endRatio: 1.02 });
    return;
  }

  if (normalized === "profane") {
    playNoiseLayer(ctx, { frequency: 1500, endFrequency: 260, duration: .3, volume: .036, filterType: "bandpass", q: 1.6 });
    playOscLayer(ctx, { frequency: 392, endFrequency: 147, delay: .028, duration: .28, volume: .032, type: "triangle" });
    playNoiseLayer(ctx, { frequency: 280, endFrequency: 80, delay: .08, duration: .18, volume: .022, filterType: "lowpass" });
    return;
  }

  if (normalized === "phase" || normalized === "phase-opponent") {
    const root = normalized === "phase-opponent" ? 220 : 294;
    playOscLayer(ctx, { frequency: root, endFrequency: root * 1.5, duration: .18, volume: .026, type: "triangle" });
    playOscLayer(ctx, { frequency: root * 2, delay: .055, duration: .2, volume: .016, type: "sine" });
    playNoiseLayer(ctx, { frequency: 2200, endFrequency: 900, delay: .015, duration: .12, volume: .014, filterType: "bandpass" });
    return;
  }

  if (normalized === "start") {
    playNoiseLayer(ctx, { frequency: 1600, endFrequency: 4200, duration: .34, volume: .016, filterType: "highpass" });
    playCardChime(ctx, [220, 330, 440, 660, 880], 0, { spacing: .04, duration: .24, volume: .02 });
    playOscLayer(ctx, { frequency: 110, endFrequency: 146, duration: .42, volume: .026, type: "sine" });
    return;
  }

  if (normalized === "win") {
    playCardChime(ctx, [392, 494, 587, 784, 988], 0, { spacing: .045, duration: .28, volume: .024, endRatio: 1.018 });
    playOscLayer(ctx, { frequency: 196, endFrequency: 392, duration: .58, volume: .034, type: "triangle" });
    playNoiseLayer(ctx, { frequency: 2600, endFrequency: 5200, delay: .08, duration: .34, volume: .014, filterType: "highpass" });
    return;
  }

  if (normalized === "end") {
    playOscLayer(ctx, { frequency: 164, endFrequency: 74, duration: .28, volume: .038, type: "triangle" });
    playNoiseLayer(ctx, { frequency: 520, endFrequency: 100, delay: .02, duration: .22, volume: .02, filterType: "lowpass" });
    return;
  }

  if (cardType) {
    const palettes = {
      per: [196, 294, 392],
      art: [247, 370, 494],
      mil: [330, 495, 660],
      pec: [130, 196, 260],
      tem: [220, 330, 440],
      ter: [146, 220, 294]
    };
    const notes = palettes[cardType] || [260, 390, 520];
    if (cardType === "pec") {
      playTone("hit");
      playOscLayer(ctx, { frequency: 260, endFrequency: 185, delay: .08, duration: .18, volume: .02, type: "square" });
      return;
    }
    playNoiseLayer(ctx, { frequency: 900, endFrequency: 2600, duration: .13, volume: .022, filterType: "bandpass", q: 1.5 });
    playOscLayer(ctx, { frequency: notes[0] / 2, endFrequency: notes[0] * .72, duration: .2, volume: .016, type: "sine" });
    playCardChime(ctx, notes, .025, { spacing: .03, duration: .2, volume: .02 });
    return;
  }

  playNoiseLayer(ctx, { frequency: 1800, endFrequency: 900, duration: .08, volume: .01, filterType: "bandpass" });
  playOscLayer(ctx, { frequency: normalized === "play" ? 520 : 330, endFrequency: normalized === "play" ? 660 : 392, duration: .11, volume: .022, type: "triangle" });
}

async function loadData() {
  els.startGameButton.textContent = "Carregando";
  const [
    cardsResponse,
    decksResponse,
    typesResponse,
    collectionsResponse,
    virtuesResponse,
    engineTriggersResponse,
    engineActionsResponse,
    engineKeywordsResponse,
    engineAbilitiesResponse,
    engineAbilityLinksResponse
  ] = await Promise.all([
    fetch(DATA_URLS.cards),
    fetch(DATA_URLS.decks),
    fetch(DATA_URLS.types),
    fetch(DATA_URLS.collections),
    fetch(DATA_URLS.virtues),
    fetch(DATA_URLS.engineTriggers),
    fetch(DATA_URLS.engineActions),
    fetch(DATA_URLS.engineKeywords),
    fetch(DATA_URLS.engineAbilities),
    fetch(DATA_URLS.engineAbilityLinks)
  ]);
  if (
    !cardsResponse.ok ||
    !decksResponse.ok ||
    !typesResponse.ok ||
    !collectionsResponse.ok ||
    !virtuesResponse.ok ||
    !engineTriggersResponse.ok ||
    !engineActionsResponse.ok ||
    !engineKeywordsResponse.ok ||
    !engineAbilitiesResponse.ok ||
    !engineAbilityLinksResponse.ok
  ) {
    throw new Error("Nao foi possivel carregar os dados do jogo.");
  }

  const [
    cardsPayload,
    decksPayload,
    typesPayload,
    collectionsPayload,
    virtuesPayload,
    engineTriggersPayload,
    engineActionsPayload,
    engineKeywordsPayload,
    engineAbilitiesPayload,
    engineAbilityLinksPayload
  ] = await Promise.all([
    cardsResponse.json(),
    decksResponse.json(),
    typesResponse.json(),
    collectionsResponse.json(),
    virtuesResponse.json(),
    engineTriggersResponse.json(),
    engineActionsResponse.json(),
    engineKeywordsResponse.json(),
    engineAbilitiesResponse.json(),
    engineAbilityLinksResponse.json()
  ]);

  app.typesById = new Map((typesPayload.types || []).map((type) => [Number(type.id), type]));
  app.collectionsById = new Map((collectionsPayload.collections || []).map((collection) => [Number(collection.id), collection]));
  app.virtues = virtuesPayload.virtues || [];
  app.virtuesById = new Map(app.virtues.map((virtue) => [Number(virtue.id), virtue]));
  app.engine = createEngineRegistry({
    triggers: engineTriggersPayload,
    actions: engineActionsPayload,
    keywords: engineKeywordsPayload,
    abilities: engineAbilitiesPayload,
    abilityLinks: engineAbilityLinksPayload
  });
  app.cards = [
    ...(cardsPayload.cards || []).map((card, index) => normalizeCard(card, cardsPayload.defaults || {}, index)),
    ...INTERNAL_TOKEN_CARDS
  ];
  app.cardByCode = new Map(app.cards.map((card) => [card.code, card]));
  app.decks = decksPayload.decks || [];

  const saved = readPlayStorage();
  if (typeof saved.soundEnabled === "boolean") {
    app.soundEnabled = saved.soundEnabled;
  }
  if (app.isLocalDebugHost && typeof saved.virtueDebugEnabled === "boolean") {
    app.virtueDebugEnabled = saved.virtueDebugEnabled;
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
  els.setupMatchPreview?.addEventListener("change", (event) => {
    const toggle = event.target.closest("[data-toggle-virtue-debug]");
    if (!toggle || !app.isLocalDebugHost) return;
    app.virtueDebugEnabled = Boolean(toggle.checked);
    writePlayStorage({ virtueDebugEnabled: app.virtueDebugEnabled });
    updateSetupPreview(getDeckOption(els.humanDeckSelect.value), app.decks.find((deck) => deck.id === els.botDeckSelect.value));
  });
  els.startGameButton.addEventListener("click", startGame);
  els.resultNewGameButton?.addEventListener("click", showSetup);
  els.gameResult.addEventListener("click", (event) => {
    if (event.target.closest("[data-result-view-board]")) {
      app.resultViewingBoard = true;
      els.gameResult.classList.add("is-hidden");
      renderGame();
      return;
    }
    if (event.target.closest("[data-result-new-game]")) showSetup();
  });
  els.humanHand.addEventListener("click", (event) => {
    if (Date.now() < toNumber(app.suppressPlayClickUntil, 0)) {
      event.preventDefault();
      return;
    }
    setHandExpanded(true);
    const button = event.target.closest("[data-hand-card]");
    if (!button) return;
    selectHandCard(button.dataset.handCard);
  });

  document.addEventListener("pointerdown", (event) => {
    if (event.target.closest(".zone-modal, .block-prompt, .game-result, #fieldViewModal, #decisionReturnButton, .phase-alert, .played-card-animation, .pulverize-animation, .draw-animation, .reveal-animation")) return;
    if (event.target.closest("[data-essence-index]")) return;
    if (!els.handDock || els.handDock.contains(event.target)) return;
    if (els.actionDock?.contains(event.target)) return;
    collapseHand();
    if (app.selected?.zone === "hand") {
      app.selected = null;
      renderGame();
    }
  });

  document.addEventListener("contextmenu", (event) => {
    if (event.target.closest(".play-card, .essence-card, .identity-dock-tile, .identity-dock-essence, .zone-modal-card, .engine-review-card, .stack-edge-card, .combat-resolution-chip, .block-prompt, #cardZoomPreview, .played-card-animation, .pulverize-animation, .draw-animation")) {
      event.preventDefault();
    }
  });

  els.humanBattlefield.addEventListener("click", async (event) => {
    if (Date.now() < toNumber(app.suppressPlayClickUntil, 0)) {
      event.preventDefault();
      return;
    }
    const button = event.target.closest("[data-battlefield-card]");
    if (!button) return;
    if (await applyActivatePermanentAction("human", button.dataset.battlefieldCard)) {
      app.selected = null;
      renderGame();
      return;
    }
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
    void applyDraw("human").then((applied) => {
      if (applied) renderGame();
    });
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
    if (app.resultViewingBoard) {
      app.resultViewingBoard = false;
      els.gameResult.classList.remove("is-hidden");
      renderGame();
      return;
    }
    if (app.decisionBattlefieldView && hasPendingChoiceWork()) {
      returnToDecisionModal();
      return;
    }
    if (isHumanPriorityOpen()) {
      passHumanPriority();
    } else {
      applyNextPhase();
    }
    renderGame();
  });
  els.endTurnButton.addEventListener("click", applyEndTurn);
  document.addEventListener("click", async (event) => {
    if (event.target.closest("[data-return-to-decision]")) {
      returnToDecisionModal();
      return;
    }
    if (event.target.closest("[data-view-battlefield]")) {
      enterDecisionBattlefieldView();
      return;
    }
    const fieldViewCloseButton = event.target.closest("#fieldViewModal [data-close-zone-modal]");
    if (fieldViewCloseButton || event.target.id === "fieldViewModal") {
      hideFieldViewModal();
      return;
    }
    const moralChoiceButton = event.target.closest("[data-moral-choice]");
    if (moralChoiceButton) {
      resolveMoralChoice(moralChoiceButton.dataset.moralChoice);
      return;
    }
    const closeButton = event.target.closest("[data-close-zone-modal]");
    if (closeButton || event.target.id === "zoneModal") {
      if (app.pendingMoralChoice || app.pendingEngineChoice || app.pendingVirtueDebug) return;
      hideZoneModal();
      return;
    }
    const closeVirtueDebugButton = event.target.closest("[data-close-virtue-debug]");
    if (closeVirtueDebugButton) {
      closeVirtueDebugModal();
      return;
    }
    const virtueDebugButton = event.target.closest("[data-virtue-debug-set]");
    if (virtueDebugButton) {
      applyManualVirtueLevel(
        app.pendingVirtueDebug?.playerId || "human",
        virtueDebugButton.dataset.virtueDebugSet,
        virtueDebugButton.dataset.virtueDebugLevel
      );
      return;
    }
    if (event.target.closest("[data-close-temple-dock]")) {
      app.expandedTemplePlayer = "";
      renderGame();
      return;
    }
    const championButton = event.target.closest("[data-champion-player]");
    if (championButton) {
      const playerId = championButton.dataset.championPlayer;
      if (playerId === "human" && await applyActivateChampionAction(playerId)) {
        app.selected = null;
        renderGame();
      } else if (playerId === "human") {
        showInteractionHint("Nenhuma habilidade de Campeão está disponível agora.");
      }
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
      if (shouldOfferVirtueDebug(app.game, virtuesButton.dataset.virtuesPlayer)) {
        showVirtueDebugModal(virtuesButton.dataset.virtuesPlayer);
        return;
      }
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
    if (event.key === "Escape" && document.getElementById("fieldViewModal")?.classList.contains("is-visible")) {
      hideFieldViewModal();
      return;
    }
    if (event.key === "Escape" && app.decisionBattlefieldView) {
      returnToDecisionModal();
      return;
    }
    if (event.key === "Escape" && app.pendingVirtueDebug) {
      closeVirtueDebugModal();
      return;
    }
    if (event.key === "Escape") hideZoneModal();
  });
  bindDragAndDrop();
}

function bindDragAndDrop() {
  const humanEssencePanel = els.humanEssence?.closest(".essence-panel");
  document.addEventListener("pointerdown", (event) => {
    const zoomTarget = event.target.closest("[data-zoom-card], [data-zoom-image]");
    if (!zoomTarget) return;
    const cardId = zoomTarget.dataset.zoomCard || "";
    const zoomImage = zoomTarget.dataset.zoomImage || "";
    const zoomLabel = zoomTarget.dataset.zoomLabel || "";
    const zoomKey = cardId || zoomImage;
    if (!zoomKey) return;
    clearTimeout(app.zoomTimer);
    app.zoomCardId = zoomKey;
    app.zoomTimer = setTimeout(() => {
      if (cardId && app.pointerDrag?.cardId === cardId) app.pointerDrag.longPress = true;
      if (app.zoomCardId !== zoomKey) return;
      if (cardId) {
        showCardZoom(cardId);
      } else {
        showZoomPreviewImage(zoomImage, zoomLabel);
      }
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
    if (handCard || battlefieldCard) {
      event.preventDefault();
      app.dragPayload = null;
      return;
    }
    if (essenceCard) {
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
    const sourceElement = handCard || battlefieldCard || essenceCard || blockerCard;
    const previewCardId = getDragPreviewCardId(app.dragPayload);
    setNativeDragImage(event);
    showNativeDragGhost(previewCardId, sourceElement, event.clientX, event.clientY);
  });

  document.addEventListener("dragend", () => {
    app.dragPayload = null;
    cleanupNativeDragGhost();
    document.querySelectorAll(".is-drop-hover").forEach((node) => node.classList.remove("is-drop-hover"));
  });

  document.addEventListener("dragover", (event) => {
    moveNativeDragGhost(event.clientX, event.clientY);
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
    cleanupNativeDragGhost();
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
      cleanupNativeDragGhost();
    });
  });

  document.addEventListener("pointerdown", (event) => {
    const blockerCard = event.target.closest("[data-blocker]");
    const essenceCard = event.target.closest("[data-essence-index]");
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
    if (essenceCard || event.pointerType === "mouse") event.preventDefault();
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
    if (event.pointerType !== "mouse" && !drag.longPress && !drag.moved && drag.payload.zone === "hand" && Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.25) {
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
      drag.ghost = createDragGhost(drag.cardId, drag.sourceElement);
      document.body.appendChild(drag.ghost);
    }
    drag.ghost.style.transform = `translate(${event.clientX - 38}px, ${event.clientY - 52}px)`;
    const zone = getDropZoneFromPoint(event.clientX, event.clientY);
    document.querySelectorAll(".is-drop-hover").forEach((node) => {
      if (node !== zone) node.classList.remove("is-drop-hover");
    });
    zone?.classList.add("is-drop-hover");
  }, { passive: false, capture: true });

  document.addEventListener("pointerup", (event) => {
    const drag = app.pointerDrag;
    if (!drag) return;
    if (drag.moved) event.preventDefault();
    const dropElement = drag.moved ? document.elementFromPoint(event.clientX, event.clientY) : null;
    const zone = drag.moved ? getDropZoneFromPoint(event.clientX, event.clientY, drag.payload) : null;
    if (drag.ghost) drag.ghost.remove();
    document.querySelectorAll(".is-drop-hover").forEach((node) => node.classList.remove("is-drop-hover"));
    if (zone) handleDrop(zone, drag.payload, dropElement);
    if (drag.moved) app.suppressPlayClickUntil = Date.now() + 350;
    releasePointerDragCapture(drag);
    app.pointerDrag = null;
  }, true);
}

function showZoomPreviewImage(image, label = "") {
  if (!image) return;
  let zoom = document.getElementById("cardZoomPreview");
  if (!zoom) {
    zoom = document.createElement("div");
    zoom.id = "cardZoomPreview";
    zoom.className = "card-zoom-preview";
    document.body.appendChild(zoom);
  }
  zoom.innerHTML = `<img src="${escapeHtml(image)}" alt="${escapeHtml(label)}" draggable="false" />`;
  zoom.classList.add("is-visible");
}

function showCardZoom(cardId) {
  const card = app.cardByCode.get(cardId);
  if (!card) return;
  showZoomPreviewImage(getCardImage(card), getCardName(card));
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

function createDragPreviewNode(sourceElement, cardId) {
  if (sourceElement) {
    const clone = sourceElement.cloneNode(true);
    clone.classList?.add("is-drag-preview-card");
    clone.removeAttribute?.("id");
    clone.setAttribute?.("draggable", "false");
    clone.querySelectorAll?.("[id]").forEach((node) => node.removeAttribute("id"));
    clone.querySelectorAll?.("[draggable]").forEach((node) => node.setAttribute("draggable", "false"));
    clone.querySelectorAll?.("img").forEach((node) => {
      node.removeAttribute("loading");
      node.setAttribute("draggable", "false");
      node.decoding = "sync";
    });
    return clone;
  }
  const card = app.cardByCode.get(cardId);
  const fallback = document.createElement("img");
  fallback.src = getCardArt(card);
  fallback.alt = "";
  fallback.draggable = false;
  return fallback;
}

function createDragGhost(cardId, sourceElement = null) {
  const card = app.cardByCode.get(cardId);
  const imageSource = card ? getCardArt(card) : sourceElement?.querySelector?.("img")?.getAttribute("src");
  if (!imageSource) return document.createElement("div");
  const ghost = document.createElement("div");
  ghost.className = "drag-ghost drag-ghost--image";
  ghost.innerHTML = `<img src="${escapeHtml(imageSource)}" alt="" draggable="false" />`;
  return ghost;
}

function moveDragGhostElement(ghost, x, y) {
  if (!ghost) return;
  ghost.style.transform = `translate(${x - 48}px, ${y - 66}px)`;
}

function showNativeDragGhost(cardId, sourceElement, x, y) {
  cleanupNativeDragGhost();
  const ghost = createDragGhost(cardId, sourceElement);
  ghost.classList.add("drag-ghost--native");
  document.body.appendChild(ghost);
  app.nativeDragGhost = ghost;
  moveDragGhostElement(ghost, x, y);
}

function moveNativeDragGhost(x, y) {
  if (!app.nativeDragGhost) return;
  moveDragGhostElement(app.nativeDragGhost, x, y);
}

function cleanupNativeDragGhost() {
  app.nativeDragGhost?.remove();
  app.nativeDragGhost = null;
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

function setNativeDragImage(event) {
  if (!event.dataTransfer?.setDragImage) return;
  if (!app.transparentDragImage) {
    app.transparentDragImage = document.createElement("canvas");
    app.transparentDragImage.width = 1;
    app.transparentDragImage.height = 1;
  }
  event.dataTransfer.setDragImage(app.transparentDragImage, 0, 0);
}

function pointInsideElement(element, x, y, inset = 0) {
  if (!element?.getBoundingClientRect) return false;
  const rect = element.getBoundingClientRect();
  return x >= rect.left + inset &&
    x <= rect.right - inset &&
    y >= rect.top + inset &&
    y <= rect.bottom - inset;
}

function getDropZoneFromPoint(x, y, payload = app.pointerDrag?.payload || app.dragPayload) {
  const element = document.elementFromPoint(x, y);
  const selectors = ".essence-panel--human, #humanBattlefield, #botArea, #botBattlefield, #humanHand, .hand-dock, [data-cemetery-player='human'], [data-block-attack]";
  const directZone = element?.closest(selectors);
  if (payload?.zone === "hand") {
    const essencePanel = els.humanEssence?.closest(".essence-panel--human");
    if (pointInsideElement(essencePanel, x, y)) return essencePanel;
    const cemeteryPanel = document.querySelector("[data-cemetery-player='human']");
    if (pointInsideElement(cemeteryPanel, x, y)) return cemeteryPanel;
  }
  if (payload?.zone === "essence") {
    if (pointInsideElement(els.handDock, x, y)) return els.handDock;
  }
  if (directZone) return directZone;
  const fallbackZones = [
    els.humanEssence?.closest(".essence-panel--human"),
    els.humanBattlefield,
    els.botArea,
    els.botBattlefield,
    els.humanHand,
    els.handDock,
    document.querySelector("[data-cemetery-player='human']")
  ];
  return fallbackZones.find((zone) => pointInsideElement(zone, x, y)) || null;
}

function isHumanHandDropZone(zone) {
  return zone === els.humanHand || zone === els.handDock || zone?.id === "humanHand" || zone?.classList?.contains("hand-dock");
}

function isHumanEssenceDropZone(zone) {
  return Boolean(zone?.matches?.(".essence-panel--human") || zone?.closest?.(".essence-panel--human"));
}

function isHumanCemeteryDropZone(zone) {
  return zone?.matches?.("[data-cemetery-player='human']");
}

function canDropHandCardToHumanCemetery(payload) {
  return payload?.zone === "hand" && canDiscardForHandLimit(app.game?.players?.human, payload.id);
}

async function handleDrop(zone, payload, targetElement = null) {
  if (!payload || !app.game || app.game.status !== "active") return;
  if (app.decisionBattlefieldView && hasPendingChoiceWork()) return;
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
  if (!isHumanPriorityOpen() && payload.zone === "hand" && isHumanEssenceDropZone(zone)) {
    if (applyConsecrate("human", payload.id)) {
      collapseHand();
      app.selected = null;
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

  if (payload.zone === "battlefield" && zone === els.humanBattlefield) {
    const targetUid = targetElement?.closest?.("[data-battlefield-card]")?.dataset.battlefieldCard || "";
    if (targetUid && targetUid !== payload.id) {
      changed = await applyAttachEquipmentToTarget("human", payload.id, targetUid);
    }
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
  updateViewportDensityState();
  observeModalRenders();
  window.addEventListener("resize", scheduleViewportDensityUpdate, { passive: true });
  window.addEventListener("orientationchange", scheduleViewportDensityUpdate, { passive: true });
  bindEvents();
  try {
    await loadData();
  } catch (error) {
    els.startGameButton.textContent = error.message || "Erro ao carregar";
    els.startGameButton.disabled = true;
  }
}

init();
