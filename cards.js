const cardsData = [
  {
    id: 1,
    name: "Leão da Aurora",
    type: "Herói",
    virtue: "Justiça",
    rarity: "Lendária",
    cost: 7,
    meta: "Core",
    role: "Finisher",
    power: "7 / 6",
    deck: "Midrange Justiça",
    text: "Pressiona a mesa com presença inevitável e converte domínio territorial em letalidade no late game.",
    details: "Quando entra em campo, concede +1 de pressão para cada Virtude aliada revelada neste turno. Excelente para fechar partidas depois de uma curva sólida.",
    tags: ["Top-end", "Pressure", "Closing Tool"],
    strengths: ["Finaliza jogos travados", "Escala com board desenvolvido", "Exige resposta imediata"],
    weaknesses: ["Custo alto", "Vulnerável a remoção limpa", "Pede setup prévio"],
    image: "./img/artCards/121.png",
    cardImage: "./img/cards/8.webp"
  },
  {
    id: 2,
    name: "Chamado do Reino",
    type: "Milagre",
    virtue: "Fé",
    rarity: "Rara",
    cost: 3,
    meta: "Flex",
    role: "Tempo Swing",
    power: "Spell",
    deck: "Fé Tempo",
    text: "Gera reposicionamento eficiente de mesa e protege ameaças-chave em turnos de pressão.",
    details: "Retorna uma unidade inimiga para a mão e concede escudo breve a um aliado. Flexível em ambientes com curvas agressivas.",
    tags: ["Tempo", "Protection", "Utility"],
    strengths: ["Excelente contra curva média", "Abre janela de ataque", "Mantém iniciativa"],
    weaknesses: ["Menos impacto em board vazio", "Não remove permanentemente"],
    image: "https://picsum.photos/seed/card-2/720/920"
  },
  {
    id: 3,
    name: "Véu Rasgado",
    type: "Milagre",
    virtue: "Misericórdia",
    rarity: "Lendária",
    cost: 5,
    meta: "Tech",
    role: "Reset",
    power: "Spell",
    deck: "Control Misericórdia",
    text: "Resposta de alto teto para mesas expandidas e linhas overcommit do oponente.",
    details: "Desativa habilidades de entrada em campo durante um ciclo e redefine o estado do board em ambientes explosivos.",
    tags: ["Board Reset", "Meta Call", "Control"],
    strengths: ["Pune overextension", "Excelente contra tokens", "Alto teto estratégico"],
    weaknesses: ["Pesada em matchups lentos", "Janela de uso específica"],
    image: "https://picsum.photos/seed/card-3/720/920"
  },
  {
    id: 4,
    name: "Coroa do Reino",
    type: "Profecia",
    virtue: "Sabedoria",
    rarity: "Épica",
    cost: 4,
    meta: "Core",
    role: "Value Engine",
    power: "Ongoing",
    deck: "Sabedoria Value",
    text: "Mantém recursos fluindo e recompensa construção paciente de vantagem incremental.",
    details: "Ao final do turno, observa o topo do grimório e reorganiza sua próxima compra. Núcleo de listas orientadas a consistência.",
    tags: ["Engine", "Consistency", "Value"],
    strengths: ["Melhora draws", "Escala em partidas longas", "Suporta planos control"],
    weaknesses: ["Pouco impacto imediato", "Exige tempo para pagar valor"],
    image: "https://picsum.photos/seed/card-4/720/920"
  },
  {
    id: 5,
    name: "Virtude da Luz",
    type: "Virtude",
    virtue: "Fé",
    rarity: "Incomum",
    cost: 2,
    meta: "Core",
    role: "Buff Engine",
    power: "+1 Aura",
    deck: "Aggro Fé",
    text: "Peça de identidade que melhora a curva inicial e amplia trocas favoráveis na mesa.",
    details: "Aliados com custo 3 ou menos recebem presença adicional. Fundamental em shells agressivos e listas de abertura forte.",
    tags: ["Aura", "Aggro", "Identity"],
    strengths: ["Pressão desde cedo", "Sinergia ampla", "Baixo custo"],
    weaknesses: ["Dependente de board", "Fraca topdeck tardia"],
    image: "https://picsum.photos/seed/card-5/720/920"
  },
  {
    id: 6,
    name: "Escriba do Véu",
    type: "Herói",
    virtue: "Sabedoria",
    rarity: "Rara",
    cost: 3,
    meta: "Flex",
    role: "Card Flow",
    power: "2 / 4",
    deck: "Sabedoria Midrange",
    text: "Corpo eficiente que transforma setup de mão em vantagem técnica ao longo do duelo.",
    details: "Na entrada, compra uma carta se você tiver ativado Profecia neste turno. Excelente pivot de turno 3.",
    tags: ["Draw", "Midgame", "Synergy"],
    strengths: ["Boa curva", "Vantagem de recursos", "Alta sinergia"],
    weaknesses: ["Médio sem setup", "Baixa pressão"],
    image: "https://picsum.photos/seed/card-6/720/920"
  },
  {
    id: 7,
    name: "Tribunal Silente",
    type: "Profecia",
    virtue: "Justiça",
    rarity: "Rara",
    cost: 2,
    meta: "Tech",
    role: "Disruption",
    power: "Ongoing",
    deck: "Justiça Control",
    text: "Dificulta linhas explosivas e enfraquece decks que dependem de múltiplas ações por turno.",
    details: "A primeira carta extra jogada pelo oponente a cada turno entra exaurida. Forte em metas de combo e value turns.",
    tags: ["Tax", "Control", "Meta"],
    strengths: ["Ótima contra combo", "Atrasa desenvolvimento", "Barata"],
    weaknesses: ["Fraca contra midrange reto", "Baixo clock"],
    image: "https://picsum.photos/seed/card-7/720/920"
  },
  {
    id: 8,
    name: "Manto de Reversão",
    type: "Virtude",
    virtue: "Misericórdia",
    rarity: "Rara",
    cost: 4,
    meta: "Flex",
    role: "Stabilizer",
    power: "Aura",
    deck: "Misericórdia Tempo",
    text: "Permite recuperar presença de mesa sem abdicar de defesa em matchups agressivos.",
    details: "Quando um aliado sofre dano letal pela primeira vez no turno, retorna com um marcador de paz. Excelente contra burn e trades forçados.",
    tags: ["Recovery", "Defense", "Tempo"],
    strengths: ["Ganha tempo", "Melhora trocas", "Protege peças-chave"],
    weaknesses: ["Não progride sozinho", "Fraco contra exile"],
    image: "https://picsum.photos/seed/card-8/720/920"
  },
  {
    id: 9,
    name: "Arauto da Alvorada",
    type: "Herói",
    virtue: "Fé",
    rarity: "Comum",
    cost: 1,
    meta: "Core",
    role: "Starter",
    power: "1 / 2",
    deck: "Fé Aggro",
    text: "Abertura consistente para pressionar vida, habilitar buffs e escalar presença desde o turno inicial.",
    details: "Ao atacar com outra unidade, ganha fervor temporário. Um dos melhores one-drops para shells lineares.",
    tags: ["One-drop", "Aggro", "Curve"],
    strengths: ["Alta consistência", "Ótimo início", "Ativa sinergias"],
    weaknesses: ["Perde valor tarde", "Baixo impacto isolado"],
    image: "https://picsum.photos/seed/card-9/720/920"
  },
  {
    id: 10,
    name: "Memória do Trono",
    type: "Profecia",
    virtue: "Sabedoria",
    rarity: "Incomum",
    cost: 1,
    meta: "Core",
    role: "Setup",
    power: "Ongoing",
    deck: "Sabedoria Control",
    text: "Refina draws e prepara o turno-chave com muita eficiência de custo.",
    details: "Olhe duas cartas do topo e mantenha uma. Carta discreta, porém central para listas de consistência.",
    tags: ["Setup", "Cantrip", "Control"],
    strengths: ["Muito eficiente", "Melhora mulligan pós-mulligan", "Baixo investimento"],
    weaknesses: ["Sem presença de mesa", "Impacto indireto"],
    image: "https://picsum.photos/seed/card-10/720/920"
  },
  {
    id: 11,
    name: "Edito do Amanhã",
    type: "Milagre",
    virtue: "Justiça",
    rarity: "Incomum",
    cost: 2,
    meta: "Flex",
    role: "Removal",
    power: "Spell",
    deck: "Justiça Tempo",
    text: "Resposta limpa para ameaças médias, mantendo a curva funcional e o plano proativo ativo.",
    details: "Exila uma unidade com custo 3 ou menos. Muito eficiente para abrir passagem sem perder tempo.",
    tags: ["Removal", "Tempo", "Efficient"],
    strengths: ["Alta eficiência", "Excelente contra agro", "Aumenta ritmo"],
    weaknesses: ["Alcance limitado", "Menos forte no late"],
    image: "https://picsum.photos/seed/card-11/720/920"
  },
  {
    id: 12,
    name: "Salmo das Águas",
    type: "Milagre",
    virtue: "Misericórdia",
    rarity: "Comum",
    cost: 3,
    meta: "Tech",
    role: "Recovery",
    power: "Spell",
    deck: "Misericórdia Control",
    text: "Ferramenta de estabilização para partidas de atrito e ciclos longos.",
    details: "Recupere 4 de essência e compre uma carta se estiver atrás em presença de mesa. Side option frequente em campos agressivos.",
    tags: ["Healing", "Control", "Sideboard"],
    strengths: ["Ganha fôlego", "Compra carta", "Boa contra burn"],
    weaknesses: ["Baixa pressão", "Ruim quando na frente"],
    image: "https://picsum.photos/seed/card-12/720/920"
  }
];

const state = {
  currentPage: 1,
  itemsPerPage: 6,
  search: "",
  type: "all",
  virtue: "all",
  rarity: "all",
  maxCost: 9,
  meta: "all",
  sort: "name-asc",
  lang: "pt"
};

const rarityOrder = { "Comum": 1, "Incomum": 2, "Rara": 3, "Épica": 4, "Lendária": 5 };

const els = {
  header: document.getElementById("siteHeader"),
  mobileToggle: document.getElementById("mobileToggle"),
  primaryNav: document.getElementById("primaryNav"),
  cardsGrid: document.getElementById("cardsGrid"),
  resultCount: document.getElementById("resultCount"),
  pagination: document.getElementById("pagination"),
  // metaSummary: document.getElementById("metaSummary"),
  searchInput: document.getElementById("searchInput"),
  typeFilter: document.getElementById("typeFilter"),
  virtueFilter: document.getElementById("virtueFilter"),
  rarityFilter: document.getElementById("rarityFilter"),
  costFilter: document.getElementById("costFilter"),
  costValue: document.getElementById("costValue"),
  metaChips: document.getElementById("metaChips"),
  sortSelect: document.getElementById("sortSelect"),
  clearFilters: document.getElementById("clearFilters"),
  drawer: document.getElementById("cardDrawer"),
  drawerBackdrop: document.getElementById("drawerBackdrop"),
  drawerClose: document.getElementById("drawerClose"),
  drawerContent: document.getElementById("drawerContent"),
  langButtons: document.querySelectorAll(".lang-btn"),
  revealElements: document.querySelectorAll(".reveal")
};

function handleHeader() {
  if (window.scrollY > 20) {
    els.header.classList.add("is-scrolled");
  } else {
    els.header.classList.remove("is-scrolled");
  }
}

function handleReveal() {
  const trigger = window.innerHeight * 0.9;
  els.revealElements.forEach((element) => {
    if (element.getBoundingClientRect().top < trigger) {
      element.classList.add("is-visible");
    }
  });
}

function sortCards(cards) {
  const sorted = [...cards];
  switch (state.sort) {
    case "cost-asc":
      sorted.sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));
      break;
    case "cost-desc":
      sorted.sort((a, b) => b.cost - a.cost || a.name.localeCompare(b.name));
      break;
    case "rarity-desc":
      sorted.sort((a, b) => (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0) || a.name.localeCompare(b.name));
      break;
    default:
      sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  return sorted;
}

function getFilteredCards() {
  const search = state.search.trim().toLowerCase();
  return sortCards(cardsData.filter((card) => {
    const matchesSearch = !search || [card.name, card.text, card.role, card.deck, card.virtue, ...card.tags]
      .join(" ")
      .toLowerCase()
      .includes(search);

    const matchesType = state.type === "all" || card.type === state.type;
    const matchesVirtue = state.virtue === "all" || card.virtue === state.virtue;
    const matchesRarity = state.rarity === "all" || card.rarity === state.rarity;
    const matchesCost = card.cost <= state.maxCost;
    const matchesMeta = state.meta === "all" || card.meta === state.meta;

    return matchesSearch && matchesType && matchesVirtue && matchesRarity && matchesCost && matchesMeta;
  }));
}

function renderSummary(cards) {
  const coreCount = cards.filter((card) => card.meta === "Core").length;
  const avgCost = cards.length ? (cards.reduce((sum, card) => sum + card.cost, 0) / cards.length).toFixed(1) : "0.0";
  const topVirtue = cards.reduce((acc, card) => {
    acc[card.virtue] = (acc[card.virtue] || 0) + 1;
    return acc;
  }, {});
  const bestVirtue = Object.entries(topVirtue).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  // els.metaSummary.innerHTML = `
  //   <article class="summary-card">
  //     <span>${state.lang === "pt" ? "Núcleo de meta" : "Meta core"}</span>
  //     <strong>${coreCount}</strong>
  //     <p>${state.lang === "pt" ? "Cartas que aparecem com frequência em shells competitivos e listas-base do formato." : "Cards frequently seen in competitive shells and baseline lists for the format."}</p>
  //   </article>
  //   <article class="summary-card">
  //     <span>${state.lang === "pt" ? "Curva média" : "Average curve"}</span>
  //     <strong>${avgCost}</strong>
  //     <p>${state.lang === "pt" ? "Leitura rápida da velocidade da seleção filtrada para apoiar build, mulligan e planejamento." : "A quick read of the filtered pool speed to support building, mulligans, and planning."}</p>
  //   </article>
  //   <article class="summary-card">
  //     <span>${state.lang === "pt" ? "Virtude dominante" : "Dominant virtue"}</span>
  //     <strong>${bestVirtue}</strong>
  //     <p>${state.lang === "pt" ? "Sinaliza a linha temática mais presente entre as cartas exibidas no momento." : "Signals the most present thematic line among the cards currently shown."}</p>
  //   </article>
  // `;

}

function renderCards() {
  
  const filtered = getFilteredCards();
  const start = (state.currentPage - 1) * state.itemsPerPage;
  const paginated = filtered.slice(start, start + state.itemsPerPage);

  els.resultCount.textContent = String(filtered.length);
  renderSummary(filtered);

  if (!paginated.length) {
    els.cardsGrid.innerHTML = `
      <article class="empty-state">
        <h3>${state.lang === "pt" ? "Nenhuma carta encontrada" : "No cards found"}</h3>
        <p>${state.lang === "pt" ? "Tente reduzir a combinação de filtros ou buscar por outro eixo de deckbuilding." : "Try reducing the filter combination or search by a different deckbuilding axis."}</p>
      </article>
    `;
    renderPagination(filtered.length);
    return;
  }

  els.cardsGrid.innerHTML = paginated.map((card) => `
    <article class="card-entry tilt-card" data-id="${card.id}">
      <div class="card-entry-media">
        <img src="${card.image}" alt="${card.name}" />
        <div class="card-entry-topline">
          <span class="badge">${card.rarity}</span>
          <span class="cost-badge">${state.lang === "pt" ? "Custo" : "Cost"} ${card.cost}</span>
        </div>
        <div class="card-entry-glow"></div>
      </div>
      <div class="card-entry-body">
        <div class="card-meta-row">
          <span class="card-tag">${card.type}</span>
          <span class="card-tag">${card.virtue}</span>
          <span class="card-tag">${card.meta}</span>
        </div>
        <h4>${card.name}</h4>
        <div class="card-subtitle">
          <span>${card.role}</span>
          <span>•</span>
          <span>${card.power}</span>
        </div>
        <div class="card-footer">
          <span class="card-role">${card.deck}</span>
          <button class="card-link" data-open-card="${card.id}">${state.lang === "pt" ? "Ver detalhes" : "View details"}</button>
        </div>
      </div>
    </article>
  `).join("");

  bindTilt();
  bindCardButtons();
  renderPagination(filtered.length);

}

function renderPagination(totalItems) {
  const totalPages = Math.max(1, Math.ceil(totalItems / state.itemsPerPage));
  if (state.currentPage > totalPages) state.currentPage = totalPages;

  const pageButtons = Array.from({ length: totalPages }, (_, index) => {
    const page = index + 1;
    return `<button class="page-btn ${page === state.currentPage ? "is-active" : ""}" data-page="${page}">${page}</button>`;
  }).join("");

  const start = totalItems === 0 ? 0 : (state.currentPage - 1) * state.itemsPerPage + 1;
  const end = Math.min(state.currentPage * state.itemsPerPage, totalItems);

  els.pagination.innerHTML = `
    <div class="pagination-info">${state.lang === "pt" ? `Mostrando ${start}–${end} de ${totalItems}` : `Showing ${start}-${end} of ${totalItems}`}</div>
    <div class="pagination-controls">
      <button class="page-btn" data-page="prev" ${state.currentPage === 1 ? "disabled" : ""}>${state.lang === "pt" ? "Anterior" : "Prev"}</button>
      ${pageButtons}
      <button class="page-btn" data-page="next" ${state.currentPage === totalPages ? "disabled" : ""}>${state.lang === "pt" ? "Próxima" : "Next"}</button>
    </div>
  `;

  els.pagination.querySelectorAll("[data-page]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = button.dataset.page;
      if (value === "prev") state.currentPage -= 1;
      else if (value === "next") state.currentPage += 1;
      else state.currentPage = Number(value);
      renderCards();
      window.scrollTo({ top: els.cardsGrid.offsetTop - 120, behavior: "smooth" });
    });
  });
}

function openDrawer(cardId) {

  const card = cardsData.find((item) => item.id === Number(cardId));
  if (!card) return;

  els.drawerContent.innerHTML = `
    <div class="drawer-card-art">
      <img src="${card.cardImage}" alt="${card.name}" />
    </div>
    <div class="drawer-card-copy">
      <span class="section-kicker">${card.type} • ${card.virtue}</span>
      <h2>${card.name}</h2>
      <p>${card.details}</p>

      <div class="drawer-meta">
        <article class="drawer-meta-card"><span>${state.lang === "pt" ? "Raridade" : "Rarity"}</span><strong>${card.rarity}</strong></article>
        <article class="drawer-meta-card"><span>${state.lang === "pt" ? "Custo" : "Cost"}</span><strong>${card.cost}</strong></article>
        <article class="drawer-meta-card"><span>${state.lang === "pt" ? "Papel" : "Role"}</span><strong>${card.role}</strong></article>
        <article class="drawer-meta-card"><span>${state.lang === "pt" ? "Shell" : "Shell"}</span><strong>${card.deck}</strong></article>
      </div>

      <div class="drawer-section">
        <h3>${state.lang === "pt" ? "Texto competitivo" : "Competitive read"}</h3>
        <p>${card.text}</p>
      </div>

      <div class="drawer-section">
        <h3>${state.lang === "pt" ? "Pontos fortes" : "Strengths"}</h3>
        <div>
          <ul class="drawer-list">${card.strengths.map((item) => `<li>${item}</li>`).join("")}</ul>
        </div>
      </div>

      <div class="drawer-section">
        <h3>${state.lang === "pt" ? "Limitações" : "Weaknesses"}</h3>
        <ul class="drawer-list">${card.weaknesses.map((item) => `<li>${item}</li>`).join("")}</ul>
      </div>

    </div>
  `;

  els.drawer.classList.add("is-open");
  els.drawer.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

}

function closeDrawer() {
  els.drawer.classList.remove("is-open");
  els.drawer.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function bindCardButtons() {
  document.querySelectorAll("[data-open-card]").forEach((button) => {
    button.addEventListener("click", () => openDrawer(button.dataset.openCard));
  });
}

function bindTilt() {
  document.querySelectorAll(".tilt-card").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      if (window.innerWidth < 900) return;
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 10;
      const rotateX = ((y / rect.height) - 0.5) * -10;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

function updateStateFromControls() {
  state.search = els.searchInput.value;
  state.type = els.typeFilter.value;
  state.virtue = els.virtueFilter.value;
  state.rarity = els.rarityFilter.value;
  state.maxCost = Number(els.costFilter.value);
  state.sort = els.sortSelect.value;
  state.currentPage = 1;
  els.costValue.textContent = String(state.maxCost);
  renderCards();
}

function resetFilters() {
  state.search = "";
  state.type = "all";
  state.virtue = "all";
  state.rarity = "all";
  state.maxCost = 9;
  state.meta = "all";
  state.sort = "name-asc";
  state.currentPage = 1;

  els.searchInput.value = "";
  els.typeFilter.value = "all";
  els.virtueFilter.value = "all";
  els.rarityFilter.value = "all";
  els.costFilter.value = "9";
  els.costValue.textContent = "9";
  els.sortSelect.value = "name-asc";
  els.metaChips.querySelectorAll(".filter-chip").forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.meta === "all");
  });

  renderCards();
}

function applyLanguage(lang) {
  state.lang = lang;
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  document.querySelectorAll("[data-pt]").forEach((node) => {
    if (node.tagName === "INPUT") {
      node.placeholder = node.dataset[lang];
    } else {
      node.innerHTML = node.dataset[lang];
    }
  });
  els.langButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
  });
  renderCards();
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

els.searchInput.addEventListener("input", updateStateFromControls);
els.typeFilter.addEventListener("change", updateStateFromControls);
els.virtueFilter.addEventListener("change", updateStateFromControls);
els.rarityFilter.addEventListener("change", updateStateFromControls);
els.costFilter.addEventListener("input", updateStateFromControls);
els.sortSelect.addEventListener("change", updateStateFromControls);
els.clearFilters.addEventListener("click", resetFilters);
els.metaChips.querySelectorAll(".filter-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    state.meta = chip.dataset.meta;
    state.currentPage = 1;
    els.metaChips.querySelectorAll(".filter-chip").forEach((item) => item.classList.remove("is-active"));
    chip.classList.add("is-active");
    renderCards();
  });
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
  els.costValue.textContent = els.costFilter.value;
  renderCards();
});
