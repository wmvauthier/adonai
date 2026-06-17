const RULES_URL = "../data/rules/comprehensive_rules.md";

const els = {
  header: document.getElementById("siteHeader"),
  primaryNav: document.getElementById("primaryNav"),
  mobileToggle: document.getElementById("mobileToggle"),
  langButtons: document.querySelectorAll(".lang-btn"),
  search: document.getElementById("manualSearch"),
  clearSearch: document.getElementById("clearSearch"),
  summary: document.getElementById("manualSummary"),
  toc: document.getElementById("manualToc"),
  content: document.getElementById("manualContent"),
  askRules: document.getElementById("askRules"),
  modeButtons: document.querySelectorAll(".manual-mode-btn"),
  assistantResults: document.getElementById("assistantResults")
};

const copy = {
  pt: {
    loading: "Carregando regras...",
    loaded: "Mostrando {visible} de {total} seções do manual.",
    emptyTitle: "Nenhuma regra encontrada",
    emptyBody: "Tente buscar por outro termo ou reduzir a quantidade de palavras.",
    assistantTitle: "Sugestões do assistente",
    assistantEmpty: "Não encontrei uma seção forte o bastante para essa pergunta. Tente usar termos mais específicos.",
    clear: "Limpar"
  },
  en: {
    loading: "Loading rules...",
    loaded: "Showing {visible} of {total} rulebook sections.",
    emptyTitle: "No rule found",
    emptyBody: "Try another term or reduce the number of words.",
    assistantTitle: "Assistant suggestions",
    assistantEmpty: "I did not find a strong enough section for that question. Try more specific terms.",
    clear: "Clear"
  }
};

let currentLang = "pt";
let sections = [];
let visibleSectionIds = new Set();
let queryMode = "search";

const queryAliases = {
  descarte: ["descartar", "descarta", "descartado", "descartada", "limite de mao"],
  descartar: ["descarte", "descarta", "descartado", "descartada"],
  combate: ["atacar", "ataque", "bloqueio", "bloquear", "dano de combate"],
  atacar: ["combate", "ataque", "alvo de ataque"],
  bloqueio: ["bloquear", "bloqueador", "combate"],
  consagrar: ["consagracao", "essencia", "zona de essencia", "consagra"],
  consagracao: ["consagrar", "essencia", "zona de essencia"],
  profanar: ["profanacao", "essencia", "zona de essencia", "cemiterio"],
  profanacao: ["profanar", "essencia", "zona de essencia"],
  prioridade: ["pilha", "responder", "resposta", "passar prioridade"],
  pilha: ["prioridade", "resolver", "resolucao", "habilidade"],
  dano: ["causar dano", "marcado", "cura", "resistencia"],
  cura: ["curar", "dano", "remover dano"],
  equipamento: ["equipar", "artefato", "anexar"],
  virtude: ["virtudes", "desvirtude", "desvirtudes", "eixo moral", "ajuste moral"],
  reserva: ["sideboard", "fora do jogo"],
  mulligan: ["mao inicial", "preparacao da partida"]
};

function t(key) {
  return copy[currentLang][key] || copy.pt[key] || key;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeSearch(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function slugify(value, fallback) {
  const slug = normalizeSearch(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || fallback;
}

function tokenize(value) {
  const stopwords = new Set(["como", "funciona", "funcionam", "qual", "quais", "quando", "onde", "para", "sobre", "uma", "umas", "uns", "com", "dos", "das", "que", "por", "porque", "posso", "pode", "podem", "devo", "deve", "the", "how", "what", "when", "where", "does"]);
  return normalizeSearch(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !stopwords.has(token));
}

function normalizeList(value) {
  if (value === null || typeof value === "undefined") return [];
  return Array.isArray(value) ? value : [value];
}

function expandTerms(value, includeAliases = true) {
  const terms = tokenize(value);
  const expanded = new Set(terms);

  terms.forEach((term) => {
    const stem = term.replace(/(cao|coes|ado|ada|ados|adas|ando|endo|ar|er|ir|s)$/g, "");
    if (stem.length > 3) expanded.add(stem);
    if (!includeAliases) return;
    normalizeList(queryAliases[term]).forEach((alias) => {
      tokenize(alias).forEach((aliasTerm) => expanded.add(aliasTerm));
    });
  });

  return [...expanded];
}

function termMatchesText(text, term) {
  const normalizedText = normalizeSearch(text);
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9])${escaped}[a-z0-9]*(?=$|[^a-z0-9])`, "i").test(normalizedText);
}

function formatInline(value, query = "") {
  let html = escapeHtml(value)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\{([^}]+)\}/g, "<strong>{$1}</strong>");

  const terms = expandTerms(query, false);
  terms.forEach((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    html = html.replace(new RegExp(`(^|[^A-Za-zÀ-ÿ0-9])(${escaped}[A-Za-zÀ-ÿ0-9]*)(?=$|[^A-Za-zÀ-ÿ0-9])`, "gi"), "$1<mark>$2</mark>");
  });

  return html;
}

function parseMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const parsed = [];
  let current = null;
  let currentChapter = "";

  lines.forEach((line) => {
    const heading = line.match(/^(#{1,3})\s+(.+)$/);

    if (heading) {
      const level = heading[1].length;
      const title = heading[2].trim();
      if (level === 1) currentChapter = title;

      if (current) parsed.push(current);
      current = {
        id: slugify(title, `section-${parsed.length + 1}`),
        level,
        title,
        chapter: level === 1 ? title : currentChapter,
        lines: []
      };
      return;
    }

    if (!current) {
      current = {
        id: "intro",
        level: 1,
        title: "Comprehensive Rules",
        chapter: "Comprehensive Rules",
        lines: []
      };
    }

    current.lines.push(line);
  });

  if (current) parsed.push(current);
  return parsed.map((section, index) => ({
    ...section,
    id: `${index + 1}-${section.id}`,
    text: [section.title, ...section.lines].join(" "),
    searchableLines: section.lines.filter((line) => line.trim() && line.trim() !== "---")
  }));
}

function lineMatches(line, query) {
  if (!query) return true;
  return expandTerms(query, false).some((term) => termMatchesText(line, term));
}

function renderLines(lines, query = "", onlyMatches = false) {
  const chunks = [];
  let listItems = [];

  const flushList = () => {
    if (!listItems.length) return;
    chunks.push(`<ul>${listItems.map((item) => `<li>${formatInline(item, query)}</li>`).join("")}</ul>`);
    listItems = [];
  };

  const visibleLines = onlyMatches ? lines.filter((line) => lineMatches(line, query)) : lines;

  visibleLines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed === "---") {
      flushList();
      return;
    }
    if (trimmed.startsWith("- ")) {
      listItems.push(trimmed.slice(2));
      return;
    }
    flushList();
    chunks.push(`<p>${formatInline(trimmed, query)}</p>`);
  });

  flushList();
  return chunks.join("");
}

function renderToc() {
  const items = sections
    .filter((section) => section.level <= 2)
    .map((section) => `
      <a class="toc-link ${section.level === 1 ? "toc-link--chapter" : "toc-link--section"}"
        data-toc-section="${escapeHtml(section.id)}"
        href="#${escapeHtml(section.id)}">${escapeHtml(section.title)}</a>
    `)
    .join("");

  els.toc.innerHTML = items;
}

function sectionMatches(section, query) {
  if (!query) return true;
  return expandTerms(query, false).some((term) => termMatchesText(section.text, term));
}

function setActiveToc(sectionId) {
  document.querySelectorAll(".toc-link.is-active").forEach((link) => link.classList.remove("is-active"));
  const link = [...document.querySelectorAll(".toc-link")].find((item) => item.dataset.tocSection === sectionId);
  if (!link) return;
  link.classList.add("is-active");
  link.scrollIntoView({ block: "nearest", inline: "nearest" });
}

function bindSectionHover() {
  document.querySelectorAll(".rule-section").forEach((section) => {
    section.addEventListener("mouseenter", () => setActiveToc(section.dataset.sectionId));
    section.addEventListener("focusin", () => setActiveToc(section.dataset.sectionId));
  });
}

function setQueryMode(mode) {
  queryMode = mode === "ask" ? "ask" : "search";
  els.modeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === queryMode);
  });
  els.askRules.hidden = queryMode !== "ask";
  if (queryMode === "search") {
    els.assistantResults.hidden = true;
    els.assistantResults.innerHTML = "";
  }
}

function renderManual() {
  const query = els.search.value.trim();
  const visibleSections = sections.filter((section) => sectionMatches(section, query));
  visibleSectionIds = new Set(visibleSections.map((section) => section.id));
  const params = new URLSearchParams(window.location.search);

  if (query) params.set("q", query);
  else params.delete("q");
  const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}${window.location.hash}`;
  window.history.replaceState({}, "", nextUrl);

  els.summary.textContent = t("loaded")
    .replace("{visible}", String(visibleSections.length))
    .replace("{total}", String(sections.length));

  if (!visibleSections.length) {
    els.content.innerHTML = `
      <article class="rule-empty">
        <h2>${escapeHtml(t("emptyTitle"))}</h2>
        <p>${escapeHtml(t("emptyBody"))}</p>
      </article>
    `;
    return;
  }

  els.content.innerHTML = visibleSections.map((section) => `
    <article class="rule-section" id="${escapeHtml(section.id)}" data-section-id="${escapeHtml(section.id)}" tabindex="0">
      ${section.level <= 1
        ? `<h2>${formatInline(section.title, query)}</h2>`
        : `<h3>${formatInline(section.title, query)}</h3>`}
      ${renderLines(section.lines, query, Boolean(query))}
    </article>
  `).join("");
  bindSectionHover();
}

function answerQuestion() {
  const question = els.search.value.trim();
  if (!question) return;

  renderManual();

  const primaryTerms = expandTerms(question, false);
  const terms = expandTerms(question, true);
  const scored = sections
    .map((section) => {
      const lines = section.searchableLines;
      const primaryScore = primaryTerms.reduce((total, term) => {
        let next = total;
        if (termMatchesText(section.title, term)) next += 12;
        if (termMatchesText(section.chapter, term)) next += 5;
        next += lines.filter((line) => termMatchesText(line, term)).length * 4;
        if (termMatchesText(section.text, term)) next += 1;
        return next;
      }, 0);
      const score = terms.reduce((total, term) => {
        let next = total;
        if (termMatchesText(section.title, term)) next += 6;
        if (termMatchesText(section.chapter, term)) next += 2;
        next += lines.filter((line) => termMatchesText(line, term)).length;
        if (termMatchesText(section.text, term)) next += 1;
        if (visibleSectionIds.has(section.id)) next += 1;
        return next;
      }, primaryScore);
      let firstMatchIndex = lines.findIndex((line) => primaryTerms.some((term) => termMatchesText(line, term)));
      if (firstMatchIndex < 0) {
        firstMatchIndex = lines.findIndex((line) => terms.some((term) => termMatchesText(line, term)));
      }
      return { section, score, primaryScore, firstMatchIndex };
    })
    .filter((item) => item.primaryScore > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.section.level - b.section.level;
    })
    .slice(0, 5);

  els.assistantResults.hidden = false;

  if (!scored.length) {
    els.assistantResults.innerHTML = `
      <h2>${escapeHtml(t("assistantTitle"))}</h2>
      <p>${escapeHtml(t("assistantEmpty"))}</p>
    `;
    return;
  }

  els.assistantResults.innerHTML = `
    <h2>${escapeHtml(t("assistantTitle"))}</h2>
    <div class="assistant-result-list">
      ${scored.map(({ section, firstMatchIndex }) => {
        const preview = firstMatchIndex >= 0
          ? section.searchableLines[firstMatchIndex]
          : section.searchableLines[0] || section.title;
        return `
          <article class="assistant-result">
            <a href="#${escapeHtml(section.id)}">${escapeHtml(section.title)}</a>
            <p>${formatInline(preview.replace(/^- /, ""), question)}</p>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function applyLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  document.querySelectorAll("[data-pt][data-en]").forEach((node) => {
    const value = node.dataset[lang];
    if (typeof value !== "undefined") {
      if (node.matches("input")) node.placeholder = value;
      else node.textContent = value;
    }
  });
  els.langButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.lang === lang));
  setQueryMode(queryMode);
  renderManual();
}

function handleHeader() {
  els.header?.classList.toggle("is-scrolled", window.scrollY > 20);
}

function handleReveal() {
  const trigger = window.innerHeight * 0.9;
  document.querySelectorAll(".reveal").forEach((element) => {
    if (element.getBoundingClientRect().top < trigger) {
      element.classList.add("is-visible");
    }
  });
}

async function init() {
  try {
    const response = await fetch(RULES_URL);
    if (!response.ok) throw new Error(`Could not load ${RULES_URL}`);
    const markdown = await response.text();
    sections = parseMarkdown(markdown);
    renderToc();

    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";
    els.search.value = query;
    setQueryMode("search");
    renderManual();
  } catch (error) {
    console.error(error);
    els.summary.textContent = "Não foi possível carregar o manual.";
    els.content.innerHTML = `
      <article class="rule-empty">
        <h2>Manual indisponível</h2>
        <p>Confira se a página está sendo servida por um servidor local e se o arquivo de regras existe em data.</p>
      </article>
    `;
  }
}

els.search?.addEventListener("input", () => {
  renderManual();
  if (queryMode === "search") {
    els.assistantResults.hidden = true;
    els.assistantResults.innerHTML = "";
  }
});
els.search?.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && queryMode === "ask") {
    answerQuestion();
  }
});
els.clearSearch?.addEventListener("click", () => {
  els.search.value = "";
  els.assistantResults.hidden = true;
  els.assistantResults.innerHTML = "";
  renderManual();
  els.search.focus();
});
els.askRules?.addEventListener("click", answerQuestion);
els.modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setQueryMode(button.dataset.mode);
    if (queryMode === "ask" && els.search.value.trim()) answerQuestion();
    else renderManual();
    els.search.focus();
  });
});
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
});

init();
