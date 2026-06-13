const cards = {
  paladin: { name: "Guardião da Aliança", cost: 3, power: 3, life: 3, icon: "🛡️", type: "Personagem", art: "linear-gradient(135deg,#5f4b30,#182522 56%,#2d3032)" },
  archer: { name: "Arqueira Élfica", cost: 2, power: 2, life: 4, icon: "🏹", type: "Personagem", art: "linear-gradient(135deg,#314f2e,#151d18 50%,#62502f)" },
  priest: { name: "Clérigo da Luz", cost: 4, power: 4, life: 4, icon: "☀️", type: "Personagem", art: "linear-gradient(135deg,#87652d,#2d312c 47%,#e0bc6f)" },
  rogue: { name: "Explorador", cost: 1, power: 1, life: 3, icon: "🗡️", type: "Personagem", art: "linear-gradient(135deg,#483421,#151717 53%,#9a6a2d)" },
  giant: { name: "Gigante de Pedra", cost: 5, power: 5, life: 5, icon: "🪨", type: "Personagem", art: "linear-gradient(135deg,#504d48,#171918 50%,#81786a)" },
  soldier: { name: "Cavaleiro Real", cost: 2, power: 2, life: 2, icon: "⚔️", type: "Personagem", art: "linear-gradient(135deg,#7a5d33,#1a2222 49%,#a78148)" },
  dwarf: { name: "Guerreiro Anão", cost: 4, power: 4, life: 4, icon: "🪓", type: "Personagem", art: "linear-gradient(135deg,#9a6a2f,#201919 48%,#5b3320)" },
  mage: { name: "Mago Ígneo", cost: 2, power: 2, life: 2, icon: "🔥", type: "Milagre", art: "linear-gradient(135deg,#a94224,#1d1010 55%,#e77938)" },
  mystic: { name: "Sombra Devota", cost: 2, power: 2, life: 2, icon: "🌘", type: "Pecado", art: "linear-gradient(135deg,#5f3377,#151016 50%,#c073ff)" },
  temple: { name: "Santuário da Fé", cost: 0, power: "", life: "", icon: "⛪", type: "Templo", art: "linear-gradient(135deg,#74613b,#1d2320 50%,#c8aa62)" },
  lightning: { name: "Negar", cost: 1, power: "", life: "", icon: "⚡", type: "Milagre", art: "linear-gradient(135deg,#123a66,#10141d 52%,#8fd8ff)" },
  punish: { name: "Punir os Ímpios", cost: 1, power: "", life: "", icon: "🔥", type: "Habilidade", art: "linear-gradient(135deg,#791c18,#130707 52%,#ff884e)" },
  shield: { name: "Escudo da Fé", cost: 2, power: "", life: "", icon: "🛡️", type: "Habilidade", art: "linear-gradient(135deg,#1e4b74,#0d1218 52%,#92d1ff)" }
};

const enemyCards = ["paladin", "archer", "priest", "rogue", "giant", "soldier", "dwarf"];
const myCards = ["soldier", "priest", "dwarf", "rogue"];
const handCards = ["soldier", "archer", "priest", "mystic", "lightning", "dwarf", "mage"];
const essenceColors = ["green", "green", "blue", "blue spent", "purple", "yellow", "red"];

const modes = [
  { id: "A", title: "Tela Principal", subtitle: "Estado neutro / visão geral" },
  { id: "B", title: "Consagração / Profanação", subtitle: "Escolha de ação na etapa de Consagração" },
  { id: "C", title: "Alistamento", subtitle: "Jogando uma carta da mão" },
  { id: "D", title: "Combate", subtitle: "Declaração de atacantes e escolha de alvos" },
  { id: "E", title: "Pilha / Resposta", subtitle: "Habilidade na pilha e prioridade" }
];

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function card(id, options = {}) {
  const c = cards[id];
  if (!c) return "";
  const classes = ["card", options.hand ? "hand-card" : "", options.className || ""].filter(Boolean).join(" ");
  const stats = c.power !== "" && c.life !== "" ? `<div class="stats"><span>${esc(c.power)}</span><span>${esc(c.life)}</span></div>` : "";
  const badge = options.badge ? `<b class="${options.badgeType || "target-badge"}">${esc(options.badge)}</b>` : "";
  return `
    <button class="${classes}" type="button" data-card="${esc(id)}" style="--art:${c.art}">
      ${badge}
      <span class="cost">${esc(c.cost)}</span>
      <span class="type-icon">${esc(c.icon)}</span>
      <span class="card-figure">${esc(c.icon)}</span>
      ${stats}
      <span class="name">${esc(c.name)}</span>
    </button>
  `;
}

function slots(ids, options = {}) {
  const max = options.max || 10;
  const filled = ids.map((id, index) => {
    const cardOptions = options.cardOptions?.(id, index) || {};
    return `<div class="slot">${card(id, cardOptions)}</div>`;
  });
  while (filled.length < max) filled.push(`<div class="slot empty"></div>`);
  return filled.join("");
}

function pips() {
  return essenceColors.map((color) => `<i class="pip ${color}" aria-hidden="true"></i>`).join("");
}

function identityZone(kind = "human") {
  const enemy = kind === "enemy";
  return `
    <section class="identity-zone ${enemy ? "enemy-id" : "human-id"}">
      <div class="player-label">${enemy ? "Oponente" : "Você"}</div>
      <div class="identity-strip">
        <button class="identity-tile champion" type="button" data-identity="campeão" data-card="champion-${kind}">
          <span class="avatar">${enemy ? "🧔" : "🦁"}</span>
          <i class="status-dot ${enemy ? "enemy" : ""}"></i>
          <span>
            <small>Campeão</small>
            <strong>${enemy ? "Uriel" : "Miguel"}</strong>
            <span>Encoberto</span>
          </span>
        </button>
        <button class="identity-tile territory" type="button" data-identity="território" data-card="territory-${kind}">
          <small>Território</small>
          <span class="life-value">${enemy ? "10" : "15"}<em>/18</em></span>
        </button>
        <button class="identity-tile temple" type="button" data-identity="templo" data-card="temple-${kind}">
          <span>
            <small>Templo</small>
            <strong>${enemy ? "Templo da Justiça" : "Templo da Sabedoria"}</strong>
          </span>
          <i class="temple-icon">🏛️</i>
        </button>
      </div>
      <div class="metrics-row">
        <div class="metric"><small>Mão</small><strong>${enemy ? 5 : 7}</strong></div>
        <div class="metric"><small>Deck</small><strong>${enemy ? 27 : 24}</strong></div>
        <div class="metric essence-summary"><small>Essências 6/6</small><span class="essence-pips">${pips()}</span></div>
        <div class="metric"><small>Cemitério</small><strong>${enemy ? 2 : 1}</strong></div>
        <div class="metric"><small>Exílio</small><strong>${enemy ? 1 : 0}</strong></div>
      </div>
    </section>
  `;
}

function titleBar(mode) {
  return `
    <header class="screen-title">
      <button class="icon-button" type="button" aria-label="Menu">☰</button>
      <div class="screen-heading">
        <span class="screen-letter">${mode.id}</span>
        <strong>${esc(mode.title)}</strong>
        <span>${esc(mode.subtitle)}</span>
      </div>
      <button class="icon-button" type="button" aria-label="Chat">●●</button>
    </header>
  `;
}

function fieldPanel(which, modeId) {
  const enemy = which === "enemy";
  let ids = enemy ? enemyCards : myCards;
  let max = enemy ? 10 : 5;

  if (modeId === "E" && enemy) ids = ["paladin", "archer", "priest", "soldier", "dwarf"];
  if (modeId === "D" && !enemy) ids = ["soldier", "priest", "dwarf", "rogue", "archer"];

  const options = {
    max,
    cardOptions: (id, index) => {
      if (modeId === "D" && !enemy && index < 3) return { className: "highlight-green", badge: index + 1, badgeType: "attack-badge" };
      if (modeId === "D" && enemy && index < 4) return { badge: [1, 2, "", 1][index] || "", className: index === 0 ? "highlight-gold" : "" };
      if (modeId === "E" && !enemy && index === 0) return { className: "highlight-green" };
      if (modeId === "C" && !enemy && index === 2) return { className: "highlight-green" };
      return {};
    }
  };

  return `
    <section class="field-panel ${enemy ? "enemy" : "mine"}">
      <div class="card-grid ${modeId === "E" ? "compact" : ""}">${slots(ids, options)}</div>
      <div class="zone-label">${enemy ? "Campo do Oponente" : "Meu Campo"}</div>
    </section>
  `;
}

function handRow(modeId) {
  const classes = modeId === "C" ? "hand-row is-recruit" : "hand-row";
  return `<section class="${classes}">${handCards.map((id, index) => card(id, {
    hand: true,
    className: (modeId === "C" && id === "priest") || (modeId === "E" && id === "lightning") ? "highlight-blue" : ""
  })).join("")}</section>`;
}

function footer(modeId) {
  let selected = `<div class="selected-mini"><div></div><div><small>Carta selecionada</small><strong>Nenhuma</strong></div></div>`;
  let actions = `<div class="actions-row"><button class="action-button gold" type="button">Avançar</button><button class="action-button ghost" type="button">Detalhes</button></div>`;

  if (modeId === "D") {
    selected = `<div class="selected-mini"><div></div><div><small>Ataque</small><strong>3 atacantes selecionados</strong><p>Toque nos alvos para ajustar.</p></div></div>`;
    actions = `<div class="actions-row"><button class="action-button ghost" type="button">Cancelar</button><button class="action-button gold" type="button">Confirmar ataques</button></div>`;
  }

  if (modeId === "E") {
    selected = `<div class="selected-mini">${card("lightning")}<div><small>Carta selecionada</small><strong>Negar</strong><p>Anule a mágica ou habilidade alvo.</p></div></div>`;
    actions = `<div class="actions-row"><button class="action-button primary" type="button">Jogar resposta</button><button class="action-button ghost" type="button">Passar prioridade</button></div>`;
  }

  if (modeId === "B") {
    selected = `<div class="selected-mini">${card("dwarf")}<div><small>Carta selecionada</small><strong>Guerreiro Anão</strong><p>Arraste para a Essência.</p></div></div>`;
    actions = `<div class="actions-row"><button class="action-button primary" type="button">Consagrar</button><button class="action-button ghost" type="button">Pular</button></div>`;
  }

  if (modeId === "C") {
    selected = `<div class="selected-mini">${card("priest")}<div><small>Carta selecionada</small><strong>Guardião da Aliança</strong><p>Custa 3 Essências. Solte no campo.</p></div></div>`;
    actions = `<div class="actions-row"><button class="action-button primary" type="button">Jogar carta</button><button class="action-button ghost" type="button">Cancelar</button></div>`;
  }

  return `
    <footer class="player-footer">
      ${selected}
      ${actions}
      ${handRow(modeId)}
      <div class="phase-dots">${["A","B","C","D","E","F"].map((_, index) => `<i class="phase-dot ${index === phaseIndex(modeId) ? "active" : ""}"></i>`).join("")}</div>
    </footer>
  `;
}

function phaseIndex(modeId) {
  return { A: 0, B: 1, C: 2, D: 3, E: 3 }[modeId] ?? 0;
}

function mainStage(modeId) {
  if (modeId === "B") return consagrationStage();
  if (modeId === "C") return recruitmentStage();

  const prompt = modeId === "D"
    ? `<section class="center-prompt"><div><h2>Declare seus atacantes</h2><p>Toque em um alvo para cada atacante. Você pode atacar personagens, o território ou ambos.</p></div></section>`
    : modeId === "E"
      ? `<section class="priority-box"><div><h2>Aguardando sua ação</h2><p>Você tem prioridade.</p><button class="action-button ghost" type="button">Passar prioridade</button></div></section>`
      : `<section class="center-prompt neutral"></section>`;

  return `
    <section class="board-stage">
      ${fieldPanel("enemy", modeId)}
      ${prompt}
      ${fieldPanel("human", modeId)}
    </section>
    ${modeId === "E" ? stackPanel() : ""}
  `;
}

function consagrationStage() {
  return `
    <section class="board-stage">
      <section class="consecration-panel">
        <div class="panel-title">
          <h2>Etapa de Consagração</h2>
          <p>Arraste uma carta para a zona de Essência para consagrar; arraste uma Essência para sua mão para profanar.</p>
        </div>
        <div class="consecration-flow">
          <div class="flow-box">
            <h3>Sua mão</h3>
            <div class="flow-cards">${["soldier", "archer", "mystic", "dwarf"].map((id) => card(id)).join("")}</div>
          </div>
          <div class="flow-arrows"><span>→</span><span>←</span></div>
          <div class="flow-box">
            <h3>Zona de Essência (6/6)</h3>
            <div class="flow-cards essence-cards">${["soldier", "lightning", "mystic", "priest", "dwarf", "giant"].map((id, i) => card(id, { className: i === 5 ? "tapped" : "" })).join("")}</div>
          </div>
        </div>
        <div class="legend-line"><span>→ Da mão para a Essência: <b>consagrar</b></span><span>← Da Essência para a mão: <b>profanar</b></span></div>
      </section>
    </section>
  `;
}

function recruitmentStage() {
  return `
    <section class="board-stage">
      <section class="recruitment-panel">
        <div class="panel-title">
          <h2>Jogue uma carta</h2>
          <p>Arraste a carta para seu campo para jogá-la.</p>
        </div>
        <div class="drop-grid">
          <div class="drop-slot">+</div><div class="drop-slot">+</div><div class="drop-slot">+</div><div class="drop-slot active">Solte aqui</div><div class="drop-slot">+</div>
          <div class="drop-slot">+</div><div class="drop-slot">+</div><div class="drop-slot">+</div><div class="drop-slot">+</div><div class="drop-slot">+</div>
        </div>
        <div class="floating-card">${card("priest")}</div>
        <div class="drag-arrow"></div>
        <div class="legend-line"><span>Essência disponível: <b>4/6</b></span><span>Custo da carta: <b>3</b></span></div>
      </section>
    </section>
  `;
}

function stackPanel() {
  return `
    <aside class="stack-panel">
      <div class="stack-head"><span>Pilha</span><span>×</span></div>
      <article class="stack-item top">
        <div class="stack-thumb" style="--art:${cards.punish.art}">🔥</div>
        <div class="stack-copy"><strong>Punir os Ímpios</strong><span>Habilidade · Oponente</span></div>
      </article>
      <article class="stack-item response">
        <div class="stack-thumb" style="--art:${cards.shield.art}">🛡️</div>
        <div class="stack-copy"><strong>Escudo da Fé</strong><span>Habilidade · Você</span></div>
      </article>
      <article class="stack-item">
        <div class="stack-thumb" style="--art:${cards.priest.art}">☀️</div>
        <div class="stack-copy"><strong>Bênção da Luz</strong><span>Mais antigo</span></div>
      </article>
    </aside>
  `;
}

function screen(mode) {
  return `
    <article class="screen-card" data-screen="${mode.id}">
      <div class="phone mode-${mode.id}">
        <div class="phone-screen">
          ${titleBar(mode)}
          ${identityZone("enemy")}
          ${mainStage(mode.id)}
          ${identityZone("human")}
          ${footer(mode.id)}
        </div>
      </div>
    </article>
  `;
}

function render() {
  document.getElementById("showcase").innerHTML = modes.map(screen).join("");
}

function setupFilters() {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach((b) => b.classList.toggle("is-active", b === button));
      document.querySelectorAll("[data-screen]").forEach((panel) => {
        panel.classList.toggle("is-hidden-filter", filter !== "all" && panel.dataset.screen !== filter);
      });
    });
  });
}

function setupModal() {
  const modal = document.getElementById("cardModal");
  const modalCard = document.getElementById("modalCard");
  const modalCopy = document.getElementById("modalCopy");

  document.body.addEventListener("click", (event) => {
    const close = event.target.closest("[data-close-modal]");
    if (close) {
      modal.close();
      return;
    }

    const target = event.target.closest("[data-card]");
    if (!target) return;

    const id = target.dataset.card;
    const isIdentity = target.dataset.identity;
    let data = cards[id] || null;

    if (!data && id?.startsWith("champion")) {
      data = { name: id.includes("enemy") ? "Uriel" : "Miguel", type: "Campeão", cost: "—", power: "—", life: "—", icon: id.includes("enemy") ? "🧔" : "🦁", art: "linear-gradient(135deg,#856031,#191f1f 52%,#8d3433)", text: "Habilidades de identidade ficam disponíveis conforme Virtudes e Desvirtudes ativas." };
    }
    if (!data && id?.startsWith("territory")) {
      data = { name: id.includes("enemy") ? "Vale Sitiado" : "Planície Consagrada", type: "Território", cost: "—", power: "—", life: "18", icon: "🏰", art: "linear-gradient(135deg,#7b5528,#394936 50%,#172424)", text: "Recebe dano, pode ser alvo de ataque e define a derrota quando o dano alcança a resistência." };
    }
    if (!data && id?.startsWith("temple")) {
      data = { name: id.includes("enemy") ? "Templo da Justiça" : "Templo da Sabedoria", type: "Templo", cost: "—", power: "—", life: "—", icon: "🏛️", art: "linear-gradient(135deg,#74613b,#1d2320 50%,#c8aa62)", text: "Modifica regras de Consagração e Profanação conforme seu texto." };
    }

    if (!data) return;

    modalCard.innerHTML = cardFromData(data);
    modalCopy.innerHTML = `
      <h2>${esc(data.name)}</h2>
      <p>${esc(data.text || "Texto de carta demonstrativo para validação visual do modal e leitura ampliada.")}</p>
      <dl>
        <dt>Tipo</dt><dd>${esc(data.type)}</dd>
        <dt>Custo</dt><dd>${esc(data.cost)}</dd>
        <dt>Poder / Resistência</dt><dd>${esc(data.power)} / ${esc(data.life)}</dd>
        ${isIdentity ? `<dt>Identidade</dt><dd>${esc(isIdentity)}</dd>` : ""}
      </dl>
    `;
    modal.showModal();
  });
}

function cardFromData(data) {
  const id = `modal-${Math.random().toString(36).slice(2)}`;
  const tmp = { [id]: data };
  const backup = cards[id];
  cards[id] = data;
  const html = card(id);
  if (backup) cards[id] = backup; else delete cards[id];
  return html;
}

render();
setupFilters();
setupModal();
