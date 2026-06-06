const DATA_URLS = {
  lore: "../data/lore.json",
  cards: "../data/cards.json",
  collections: "../data/collections.json",
  types: "../data/types.json",
  virtues: "../data/virtues.json"
};

const STORAGE_KEY = "adonai.lore.reader.v1";

const els = {
  header: document.getElementById("siteHeader"),
  mobileToggle: document.getElementById("mobileToggle"),
  primaryNav: document.getElementById("primaryNav"),
  langButtons: document.querySelectorAll(".lang-btn"),
  searchForm: document.getElementById("loreSearchForm"),
  search: document.getElementById("loreSearch"),
  clearSearch: document.getElementById("clearSearch"),
  librarySummary: document.getElementById("librarySummary"),
  bookGrid: document.getElementById("bookGrid"),
  drawer: document.getElementById("readingDrawer"),
  drawerBackdrop: document.getElementById("drawerBackdrop"),
  drawerClose: document.getElementById("drawerClose"),
  readingBackground: document.getElementById("readingBackground"),
  readingRoom: document.getElementById("readingRoom"),
  readingMain: document.getElementById("readingMain"),
  chapterList: document.getElementById("chapterList"),
  chapterCounter: document.getElementById("chapterCounter"),
  activeBookLabel: document.getElementById("activeBookLabel"),
  chapterTitle: document.getElementById("chapterTitle"),
  chapterCardName: document.getElementById("chapterCardName"),
  chapterLore: document.getElementById("chapterLore"),
  prevChapter: document.getElementById("prevChapter"),
  nextChapter: document.getElementById("nextChapter")
};

const copy = {
  pt: {
    loadingTitle: "Carregando biblioteca",
    loadingBody: "Organizando livros, capítulos e cartas.",
    emptyTitle: "Nenhum capítulo encontrado",
    emptyBody: "Tente buscar por outro nome, coleção ou trecho da lore.",
    books: "livros",
    chapters: "capítulos",
    released: "Lançamento",
    collection: "Coleção",
    type: "Tipo",
    virtues: "Virtudes",
    noVirtues: "Sem virtudes",
    chapter: "Capítulo",
    continuation: "Continuar leitura",
    openBook: "Abrir livro"
  },
  en: {
    loadingTitle: "Loading library",
    loadingBody: "Organizing books, chapters, and cards.",
    emptyTitle: "No chapters found",
    emptyBody: "Try searching for another name, set, or lore excerpt.",
    books: "books",
    chapters: "chapters",
    released: "Released",
    collection: "Collection",
    type: "Type",
    virtues: "Virtues",
    noVirtues: "No virtues",
    chapter: "Chapter",
    continuation: "Continue reading",
    openBook: "Open book"
  }
};

const state = {
  lang: "pt",
  query: "",
  activeBookId: "",
  activeChapterId: ""
};

let books = [];
let cards = [];
let collections = new Map();
let types = new Map();
let virtues = new Map();
let pageTurnTimer = null;

function t(key) {
  return copy[state.lang][key] || copy.pt[key] || key;
}

function escapeHtml(value) {
  return String(value === null || typeof value === "undefined" ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cssUrl(value) {
  return String(value || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function localize(value) {
  if (value === null || typeof value === "undefined") return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(localize).filter(Boolean).join(", ");
  if (typeof value === "object") {
    const label = value.label || {};
    const name = value.name || {};
    return value[state.lang] || value.pt || value.en || label[state.lang] || name[state.lang] || "";
  }
  return "";
}

function localizeList(value) {
  const localized = value && typeof value === "object" && !Array.isArray(value)
    ? value[state.lang] || value.pt || value.en
    : value;
  if (Array.isArray(localized)) return localized.map((item) => String(item)).filter(Boolean);
  const text = localize(localized);
  return text ? [text] : [];
}

function normalizeSearch(value) {
  return String(value === null || typeof value === "undefined" ? "" : value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value || "";
  return new Intl.DateTimeFormat(state.lang === "pt" ? "pt-BR" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function toMap(payload, key) {
  return new Map((payload[key] || []).map((item) => [item.id, item]));
}

function getType(card) {
  return types.get((card.type || [])[0]) || null;
}

function getCollection(cardOrBook) {
  return collections.get(cardOrBook.collection || cardOrBook.collectionId) || null;
}

function getCardCode(card) {
  const collection = getCollection(card);
  const type = getType(card);
  const collectionCode = collection && collection.code ? collection.code : "FND";
  const typeCode = type && type.code ? type.code : "CRD";
  return `${collectionCode}-${typeCode}-${card.number}`;
}

function getAssetTypeName(card) {
  const type = getType(card);
  return type && type.name && type.name.pt ? type.name.pt : "Personagem";
}

function getCardImage(card) {
  if (card && card.images && card.images.card) return card.images.card;
  return `../assets/cards/${getAssetTypeName(card)} - Foundations-${Number(card.number)}.webp`;
}

function getCardArt(card) {
  if (card && card.images && card.images.art) return card.images.art;
  return `../assets/imgs/${getAssetTypeName(card)} - Foundations-${Number(card.number)} - img.webp`;
}

function getVirtueLabels(card) {
  const ids = card.virtues || [];
  return ids.map((id) => virtues.get(id)).filter(Boolean).map((item) => localize(item.name));
}

function getBookTitle(book) {
  return localize(book && book.title) || localize(book && book.collection && book.collection.label) || localize(book && book.collection && book.collection.name);
}

function enrichBooks(rawBooks) {
  const cardMap = new Map(cards.map((card) => [getCardCode(card), card]));
  return rawBooks.map((book) => {
    const collection = collections.get(book.collectionId);
    const chapters = (book.chapters || [])
      .map((chapter) => {
        const card = cardMap.get(chapter.cardId);
        return {
          ...chapter,
          card,
          searchText: normalizeSearch([
            chapter.cardId,
            localize(chapter.title),
            localize(chapter.lore),
            localize(card && card.name),
            localize(collection && collection.name),
            localize(collection && collection.label),
            getVirtueLabels(card || {}).join(" ")
          ].join(" "))
        };
      })
      .filter((chapter) => chapter.card)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

    const coverCard = chapters[0] ? chapters[0].card : null;
    return {
      ...book,
      collection,
      chapters,
      coverImage: coverCard ? getCardArt(coverCard) : "../assets/logo/Fundo - Foundation.webp",
      searchText: normalizeSearch([
        book.id,
        localize(book.title),
        localize(collection && collection.name),
        localize(collection && collection.label),
        localize(book.preface),
        chapters.map((chapter) => chapter.searchText).join(" ")
      ].join(" "))
    };
  });
}

function getVisibleBooks() {
  if (!state.query) return books;
  return books
    .map((book) => ({
      ...book,
      chapters: book.chapters.filter((chapter) => chapter.searchText.includes(state.query))
    }))
    .filter((book) => book.searchText.includes(state.query) || book.chapters.length);
}

function getActiveBook() {
  return books.find((book) => book.id === state.activeBookId) || books[0] || null;
}

function getActiveChapter() {
  const book = getActiveBook();
  if (!book) return null;
  return book.chapters.find((chapter) => chapter.cardId === state.activeChapterId) || book.chapters[0] || null;
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    bookId: state.activeBookId,
    chapterId: state.activeChapterId
  }));
}

function openDrawer() {
  els.drawer.classList.add("is-open");
  els.drawer.setAttribute("aria-hidden", "false");
  document.body.classList.add("lore-drawer-open");
}

function closeDrawer() {
  els.drawer.classList.remove("is-open");
  els.drawer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("lore-drawer-open");
}

function restoreProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (saved.bookId) state.activeBookId = saved.bookId;
    if (saved.chapterId) state.activeChapterId = saved.chapterId;
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function renderLoading() {
  els.bookGrid.innerHTML = `
    <div class="lore-loading">
      <div>
        <h3>${escapeHtml(t("loadingTitle"))}</h3>
        <p>${escapeHtml(t("loadingBody"))}</p>
      </div>
    </div>
  `;
}

function renderBooks() {
  const visibleBooks = getVisibleBooks();
  const chapterTotal = visibleBooks.reduce((sum, book) => sum + book.chapters.length, 0);
  els.librarySummary.textContent = `${visibleBooks.length} ${t("books")} · ${chapterTotal} ${t("chapters")}`;

  if (!visibleBooks.length) {
    els.bookGrid.innerHTML = `
      <div class="lore-empty">
        <div>
          <h3>${escapeHtml(t("emptyTitle"))}</h3>
          <p>${escapeHtml(t("emptyBody"))}</p>
        </div>
      </div>
    `;
    return;
  }

  els.bookGrid.innerHTML = visibleBooks.map((book) => {
    const bookTitle = getBookTitle(book);
    const collectionName = localize(book.collection && book.collection.label) || localize(book.collection && book.collection.name);
    const preface = localizeList(book.preface)[0] || "";
    const isActive = book.id === state.activeBookId;
    return `
      <button class="book-card ${isActive ? "is-active" : ""}" type="button" data-book-id="${escapeHtml(book.id)}"
        style="--book-bg:url('${cssUrl(book.coverImage)}')">
        <div class="book-body">
          <span class="section-kicker">${escapeHtml(collectionName)}</span>
          <h3>${escapeHtml(bookTitle)}</h3>
          <div class="book-meta">
            <span>${escapeHtml(formatDate(book.releaseDate))}</span>
            <span>${book.chapters.length} ${escapeHtml(t("chapters"))}</span>
            ${isActive ? `<span>${escapeHtml(t("continuation"))}</span>` : ""}
          </div>
          <p>${escapeHtml(preface)}</p>
        </div>
      </button>
    `;
  }).join("");
}

function renderChapterList() {
  const book = getActiveBook();
  if (!book) return;
  const activeChapter = getActiveChapter();
  const chapters = state.query
    ? book.chapters.filter((chapter) => chapter.searchText.includes(state.query))
    : book.chapters;
  const currentIndex = book.chapters.findIndex((chapter) => chapter.cardId === (activeChapter && activeChapter.cardId));
  els.chapterCounter.textContent = `${Math.max(currentIndex + 1, 0)}/${book.chapters.length}`;

  els.chapterList.innerHTML = chapters.map((chapter) => `
    <button class="chapter-button ${chapter.cardId === (activeChapter && activeChapter.cardId) ? "is-active" : ""}" type="button"
      data-chapter-id="${escapeHtml(chapter.cardId)}">
      <img src="${escapeHtml(getCardArt(chapter.card))}" alt="${escapeHtml(localize(chapter.card.name))}" loading="lazy" />
      <div>
        <strong>${escapeHtml(localize(chapter.title))}</strong>
        <span>${escapeHtml(localize(chapter.card.name))}</span>
      </div>
    </button>
  `).join("");
}

function renderReader() {
  const book = getActiveBook();
  const chapter = getActiveChapter();
  if (!book || !chapter) return;

  state.activeBookId = book.id;
  state.activeChapterId = chapter.cardId;
  saveProgress();

  const card = chapter.card;
  const cardArt = getCardArt(card);
  const bookTitle = getBookTitle(book);
  const currentIndex = book.chapters.findIndex((item) => item.cardId === chapter.cardId);

  els.readingBackground.style.backgroundImage = `url("${cssUrl(cardArt)}")`;
  els.readingMain.style.setProperty("--chapter-art", `url("${cssUrl(cardArt)}")`);
  els.activeBookLabel.textContent = bookTitle;
  els.chapterTitle.textContent = localize(chapter.title);
  els.chapterCardName.textContent = `${chapter.cardId} · ${localize(card.name)}`;
  els.chapterLore.innerHTML = localizeList(chapter.lore)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
  els.prevChapter.disabled = currentIndex <= 0;
  els.nextChapter.disabled = currentIndex >= book.chapters.length - 1;
}

function renderAll() {
  renderBooks();
  renderChapterList();
  renderReader();
  handleReveal();
}

function setActiveChapterByOffset(offset) {
  const book = getActiveBook();
  if (!book) return;
  const index = book.chapters.findIndex((chapter) => chapter.cardId === state.activeChapterId);
  const next = book.chapters[index + offset];
  if (!next) return;
  setActiveChapter(next.cardId, offset >= 0 ? "next" : "prev");
}

function setActiveChapter(cardId, direction = "next") {
  if (!cardId || cardId === state.activeChapterId) return;
  const shouldAnimate = els.drawer.classList.contains("is-open")
    && els.readingRoom
    && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!shouldAnimate) {
    state.activeChapterId = cardId;
    renderAll();
    return;
  }
  clearTimeout(pageTurnTimer);
  els.readingRoom.classList.remove("is-turning-next", "is-turning-prev");
  void els.readingRoom.offsetWidth;
  els.readingRoom.classList.add(direction === "prev" ? "is-turning-prev" : "is-turning-next");
  pageTurnTimer = setTimeout(() => {
    state.activeChapterId = cardId;
    renderAll();
    requestAnimationFrame(() => {
      els.readingRoom.classList.remove("is-turning-next", "is-turning-prev");
    });
  }, 170);
}

function applyLanguage(lang) {
  state.lang = lang;
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  document.querySelectorAll("[data-pt][data-en]").forEach((node) => {
    const value = node.dataset[lang];
    if (typeof value === "undefined") return;
    if (node.matches("input")) node.placeholder = value;
    else node.textContent = value;
  });
  els.langButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.lang === lang));
  if (books.length) renderAll();
}

function handleHeader() {
  if (els.header) els.header.classList.toggle("is-scrolled", window.scrollY > 20);
}

function handleReveal() {
  const trigger = window.innerHeight * 0.9;
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

  els.bookGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-book-id]");
    if (!button) return;
    const book = books.find((item) => item.id === button.dataset.bookId);
    if (!book) return;
    state.activeBookId = book.id;
    state.activeChapterId = book.chapters[0] ? book.chapters[0].cardId : "";
    renderAll();
    openDrawer();
  });

  els.chapterList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-chapter-id]");
    if (!button) return;
    const book = getActiveBook();
    const currentIndex = book ? book.chapters.findIndex((chapter) => chapter.cardId === state.activeChapterId) : -1;
    const nextIndex = book ? book.chapters.findIndex((chapter) => chapter.cardId === button.dataset.chapterId) : -1;
    setActiveChapter(button.dataset.chapterId, nextIndex < currentIndex ? "prev" : "next");
  });

  els.searchForm.addEventListener("submit", (event) => event.preventDefault());
  els.search.addEventListener("input", () => {
    state.query = normalizeSearch(els.search.value);
    const visible = getVisibleBooks();
    if (visible.length && !visible.some((book) => book.id === state.activeBookId)) {
      state.activeBookId = visible[0].id;
      state.activeChapterId = visible[0].chapters[0] ? visible[0].chapters[0].cardId : "";
    }
    renderAll();
  });

  els.clearSearch.addEventListener("click", () => {
    els.search.value = "";
    state.query = "";
    renderAll();
  });

  els.prevChapter.addEventListener("click", () => setActiveChapterByOffset(-1));
  els.nextChapter.addEventListener("click", () => setActiveChapterByOffset(1));
  els.drawerBackdrop.addEventListener("click", closeDrawer);
  els.drawerClose.addEventListener("click", closeDrawer);

  els.langButtons.forEach((button) => {
    button.addEventListener("click", () => applyLanguage(button.dataset.lang));
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && els.drawer.classList.contains("is-open")) closeDrawer();
  });

  window.addEventListener("scroll", () => {
    handleHeader();
    handleReveal();
  });
}

async function loadLore() {
  renderLoading();
  try {
    const [loreResponse, cardsResponse, collectionsResponse, typesResponse, virtuesResponse] = await Promise.all([
      fetch(DATA_URLS.lore),
      fetch(DATA_URLS.cards),
      fetch(DATA_URLS.collections),
      fetch(DATA_URLS.types),
      fetch(DATA_URLS.virtues)
    ]);

    const [lorePayload, cardsPayload, collectionsPayload, typesPayload, virtuesPayload] = await Promise.all([
      loreResponse.json(),
      cardsResponse.json(),
      collectionsResponse.json(),
      typesResponse.json(),
      virtuesResponse.json()
    ]);

    cards = cardsPayload.cards || [];
    collections = toMap(collectionsPayload, "collections");
    types = toMap(typesPayload, "types");
    virtues = toMap(virtuesPayload, "virtues");
    books = enrichBooks(lorePayload.books || []);
    restoreProgress();
    if (!state.activeBookId) state.activeBookId = books[0] ? books[0].id : "";
    if (!state.activeChapterId) {
      const activeBook = getActiveBook();
      state.activeChapterId = activeBook && activeBook.chapters[0] ? activeBook.chapters[0].cardId : "";
    }
    renderAll();
  } catch (error) {
    console.error(error);
    els.librarySummary.textContent = "Erro";
    els.bookGrid.innerHTML = `
      <div class="lore-empty">
        <div>
          <h3>Não foi possível carregar a lore</h3>
          <p>Confira se a página está sendo servida por um servidor local e se os arquivos em data existem.</p>
        </div>
      </div>
    `;
  }
}

bindEvents();
window.addEventListener("load", () => {
  handleHeader();
  handleReveal();
  applyLanguage(state.lang);
  loadLore();
});
