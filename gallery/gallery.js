const DATA_URLS = {
  instagram: "../data/content/instagram.json",
  youtube: "../data/content/youtube.json"
};

const PLACEHOLDER_THUMB = "../assets/logo/adonai_logo_base-4.webp";

const els = {
  header: document.getElementById("siteHeader"),
  primaryNav: document.getElementById("primaryNav"),
  mobileToggle: document.getElementById("mobileToggle"),
  galleryGrid: document.getElementById("galleryGrid"),
  gallerySummary: document.getElementById("gallerySummary"),
  featuredSection: document.getElementById("galleryHighlights"),
  featuredStrip: document.getElementById("featuredStrip"),
  creatorFilters: document.getElementById("creatorFilters"),
  filterButtons: document.querySelectorAll("[data-filter]"),
  dateButtons: document.querySelectorAll("[data-date-filter]"),
  langButtons: document.querySelectorAll(".lang-btn")
};

let currentFilter = "all";
let currentDateFilter = "all";
let currentCreator = "all";
let currentLang = "pt";
let galleryItems = [];
let maxContentDate = new Date(0);

const creatorAliases = {
  jeff3nd: { key: "jeff3nd", display: "Jeff3ND" },
  rafaelfanganiello: { key: "rafaelfanganiello", display: "Rafael Fanganiello" },
  skullservantdobem: { key: "skullservantdobem", display: "Skull Servant do Bem" }
};

function escapeHtml(value) {
  return String(value === null || typeof value === "undefined" ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeSearch(value) {
  return String(value === null || typeof value === "undefined" ? "" : value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function resolveMediaUrl(value) {
  if (!value) return "";
  const path = String(value);
  if (path.startsWith("http:") || path.startsWith("https:") || path.startsWith("data:") || path.startsWith("/") || path.startsWith("../")) {
    return path;
  }
  if (path.startsWith("./")) return path;
  return "../" + path;
}

function resolveInstagramThumb(item) {
  const raw = item.image || item.thumb || item.thumbnail || "";
  const path = String(raw);
  if (path.indexOf("./img/review/instagram/thumbnails/") === 0) {
    return path.replace("./img/review/instagram/thumbnails/", "./review/instagram/thumbnails/");
  }
  return resolveMediaUrl(raw) || PLACEHOLDER_THUMB;
}

function resolveInstagramAvatar(item) {
  const raw = item.avatar || "";
  const path = String(raw);
  if (path.indexOf("./img/instagram/") === 0) {
    return path.replace("./img/instagram/", "./review/instagram/avatar/");
  }
  return resolveMediaUrl(raw);
}

function parseBrazilianDate(value) {
  if (!value) return new Date(0);
  const [day, month, year] = String(value).split("/").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(dateValue) {
  return new Intl.DateTimeFormat(currentLang === "pt" ? "pt-BR" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(dateValue);
}

function normalizeCreator(name) {
  if (!name) return { key: "adonai", display: "Adonai Card Game" };
  const key = String(name).toLowerCase().replace("@", "").replace(/\s+/g, "");
  if (creatorAliases[key]) return creatorAliases[key];
  return {
    key,
    display: name
  };
}

function getInitials(value) {
  return String(value || "A")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getYoutubeVideoId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.split("/").filter(Boolean)[0] || "";
    if (parsed.pathname.startsWith("/shorts/")) return parsed.pathname.split("/").filter(Boolean)[1] || "";
    if (parsed.searchParams.get("v")) return parsed.searchParams.get("v");
    if (parsed.pathname.startsWith("/embed/")) return parsed.pathname.split("/").filter(Boolean)[1] || "";
  } catch (error) {
    return "";
  }
  return "";
}

function getYoutubeStart(url) {
  try {
    const parsed = new URL(url);
    const time = parsed.searchParams.get("t");
    if (!time) return "";
    const match = time.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?/);
    if (!match) return "";
    const seconds = Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0);
    return seconds ? `?start=${seconds}` : "";
  } catch (error) {
    return "";
  }
}

function buildYoutubeEmbed(url) {
  const videoId = getYoutubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}${getYoutubeStart(url)}` : "";
}

function normalizeInstagramItem(item, index) {
  const creator = normalizeCreator(item.user || item.creator || item.author);
  const dateObj = parseBrazilianDate(item.date);

  return {
    id: item.id || `instagram-${index}`,
    platform: "instagram",
    title: item.title || `Post de @${creator.display}`,
    creator: creator.display,
    creatorKey: creator.key,
    thumb: resolveInstagramThumb(item),
    avatar: resolveInstagramAvatar(item),
    url: item.url,
    date: item.date,
    dateObj,
    priority: Number(item.priority) || 0,
    tags: item.tags || []
  };
}

function normalizeYoutubeItem(item, index) {
  const videoId = getYoutubeVideoId(item.url);
  const creator = normalizeCreator(item.channel || item.creator || item.author_name);
  const dateObj = parseBrazilianDate(item.date);

  return {
    id: item.id || `youtube-${index}`,
    platform: "youtube",
    title: item.title || (currentLang === "pt" ? "Vídeo no YouTube" : "YouTube video"),
    creator: creator.display,
    creatorKey: creator.key,
    thumb: item.thumb || item.thumbnail || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : PLACEHOLDER_THUMB),
    avatar: resolveMediaUrl(item.avatar || ""),
    url: item.url,
    date: item.date,
    dateObj,
    priority: Number(item.priority) || 0,
    tags: item.tags || [],
    embedUrl: buildYoutubeEmbed(item.url)
  };
}

function itemMatchesDate(item) {
  if (currentDateFilter === "all") return true;
  const days = Number(currentDateFilter);
  if (!Number.isFinite(days)) return true;
  const difference = maxContentDate.getTime() - item.dateObj.getTime();
  return difference <= days * 24 * 60 * 60 * 1000;
}

function getFilteredItems() {
  return galleryItems.filter((item) => {
    if (currentFilter !== "all" && item.platform !== currentFilter) return false;
    if (currentCreator !== "all" && item.creatorKey !== currentCreator) return false;
    return itemMatchesDate(item);
  });
}

function getSortedItems(items) {
  const list = items.slice();
  return list.sort((a, b) => b.dateObj - a.dateObj || b.priority - a.priority);
}

function getFeaturedScore(item) {
  const ageDays = Math.max(0, Math.floor((maxContentDate.getTime() - item.dateObj.getTime()) / (24 * 60 * 60 * 1000)));
  const recentBoost = Math.max(0, 180 - ageDays);
  return recentBoost + item.priority * 24;
}

function renderAvatar(item) {
  if (!item.avatar) return `<span class="avatar-fallback">${escapeHtml(getInitials(item.creator))}</span>`;
  return `<img class="gallery-card-avatar" src="${escapeHtml(item.avatar)}" alt="${escapeHtml(item.creator)}" loading="lazy" />`;
}

function getPlatformMeta(platform) {
  return platform === "youtube"
    ? { label: "YouTube", icon: "▶" }
    : { label: "Instagram", icon: "◉" };
}

function renderCard(item) {
  const platform = getPlatformMeta(item.platform);
  return `
    <a class="gallery-card reveal" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
      <div class="gallery-card-media">
        <img src="${escapeHtml(item.thumb)}" alt="${escapeHtml(item.title)}" loading="lazy" />
        <span class="platform-badge platform-badge--${escapeHtml(item.platform)}">${platform.icon} ${escapeHtml(platform.label)}</span>
      </div>
      <div class="gallery-card-body">
        <h2 class="gallery-card-title">${escapeHtml(item.title)}</h2>
        <div class="gallery-card-user">
          ${renderAvatar(item)}
          <div>
            <strong>${escapeHtml(item.creator)}</strong>
            <p class="gallery-card-subtitle">${escapeHtml(formatDate(item.dateObj))}</p>
          </div>
        </div>
      </div>
    </a>
  `;
}

function renderFeatured() {
  const featured = galleryItems
    .slice()
    .sort((a, b) => getFeaturedScore(b) - getFeaturedScore(a) || b.dateObj - a.dateObj)
    .slice(0, 4);
  els.featuredSection.hidden = !featured.length;
  if (!featured.length) return;

  els.featuredStrip.innerHTML = featured.map((item) => `
    <a class="featured-card" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
      <img src="${escapeHtml(item.thumb)}" alt="${escapeHtml(item.title)}" loading="lazy" />
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.creator)} · ${escapeHtml(getPlatformMeta(item.platform).label)} · ${escapeHtml(formatDate(item.dateObj))}</span>
      </div>
    </a>
  `).join("");
}

function renderEmptyState() {
  els.galleryGrid.innerHTML = `
    <div class="gallery-empty is-visible">
      <div>
        <h3>${currentLang === "pt" ? "Nenhum conteúdo encontrado" : "No content found"}</h3>
        <p>${currentLang === "pt" ? "Tente ajustar plataforma, período ou criador." : "Try adjusting platform, date range, or creator."}</p>
      </div>
    </div>
  `;
}

function renderGallery() {
  const filtered = getFilteredItems();
  const sorted = getSortedItems(filtered);
  const youtubeCount = sorted.filter((item) => item.platform === "youtube").length;
  const instagramCount = sorted.filter((item) => item.platform === "instagram").length;

  els.gallerySummary.textContent = currentLang === "pt"
    ? `${sorted.length} conteúdos exibidos · ${youtubeCount} YouTube · ${instagramCount} Instagram`
    : `${sorted.length} items shown · ${youtubeCount} YouTube · ${instagramCount} Instagram`;

  if (!sorted.length) {
    renderEmptyState();
    return;
  }

  els.galleryGrid.innerHTML = sorted.map(renderCard).join("");
  handleReveal();
}

function setActiveButton(buttons, activeValue, key) {
  buttons.forEach((button) => button.classList.toggle("is-active", button.dataset[key] === activeValue));
}

function applyLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";

  document.querySelectorAll("[data-pt][data-en]").forEach((node) => {
    const value = node.dataset[lang];
    if (typeof value === "undefined") return;
    if (node.matches("input")) node.placeholder = value;
    else node.textContent = value;
  });

  els.langButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.lang === lang));
  if (galleryItems.length) {
    renderFeatured();
    renderGallery();
  }
}

function getCreatorOptions() {
  const map = new Map();
  galleryItems.forEach((item) => {
    const existing = map.get(item.creatorKey);
    if (!existing || item.priority > existing.priority || item.dateObj > existing.dateObj) {
      map.set(item.creatorKey, item);
    }
  });
  return Array.from(map.values()).sort((a, b) => a.creator.localeCompare(b.creator, currentLang === "pt" ? "pt-BR" : "en-US"));
}

function renderCreatorFilters() {
  const creators = getCreatorOptions();
  const allLabel = currentLang === "pt" ? "Todos" : "All";
  els.creatorFilters.innerHTML = `
    <button class="creator-filter is-active" type="button" data-creator-filter="all">
      <span class="avatar-fallback">${allLabel.slice(0, 1)}</span>
      <strong>${escapeHtml(allLabel)}</strong>
    </button>
    ${creators.map((item) => `
      <button class="creator-filter" type="button" data-creator-filter="${escapeHtml(item.creatorKey)}">
        ${renderAvatar(item)}
        <strong>${escapeHtml(item.creator)}</strong>
      </button>
    `).join("")}
  `;
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

  els.filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentFilter = button.dataset.filter;
      setActiveButton(els.filterButtons, currentFilter, "filter");
      renderGallery();
    });
  });

  els.dateButtons.forEach((button) => {
    button.addEventListener("click", () => {
      currentDateFilter = button.dataset.dateFilter;
      setActiveButton(els.dateButtons, currentDateFilter, "dateFilter");
      renderGallery();
    });
  });

  els.creatorFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-creator-filter]");
    if (!button) return;
    currentCreator = button.dataset.creatorFilter;
    setActiveButton(els.creatorFilters.querySelectorAll("[data-creator-filter]"), currentCreator, "creatorFilter");
    renderGallery();
  });

  els.langButtons.forEach((button) => {
    button.addEventListener("click", () => applyLanguage(button.dataset.lang));
  });

  window.addEventListener("scroll", () => {
    handleHeader();
    handleReveal();
  });
}

async function loadGallery() {
  try {
    els.galleryGrid.innerHTML = `
      <div class="gallery-loading is-visible">
        <div>
          <h3>${currentLang === "pt" ? "Carregando mural" : "Loading feed"}</h3>
          <p>${currentLang === "pt" ? "Organizando Instagram e YouTube em um único feed." : "Organizing Instagram and YouTube into a single feed."}</p>
        </div>
      </div>
    `;

    const [instagramResponse, youtubeResponse] = await Promise.all([
      fetch(DATA_URLS.instagram),
      fetch(DATA_URLS.youtube)
    ]);

    const instagram = await instagramResponse.json();
    const youtube = await youtubeResponse.json();

    galleryItems = [
      ...instagram.map(normalizeInstagramItem),
      ...youtube.map(normalizeYoutubeItem)
    ];
    maxContentDate = galleryItems.reduce((latest, item) => item.dateObj > latest ? item.dateObj : latest, new Date(0));

    renderCreatorFilters();
    renderFeatured();
    renderGallery();
  } catch (error) {
    console.error(error);
    els.gallerySummary.textContent = currentLang === "pt"
      ? "Não foi possível carregar a galeria."
      : "Could not load the gallery.";
    els.galleryGrid.innerHTML = `
      <div class="gallery-empty is-visible">
        <div>
          <h3>${currentLang === "pt" ? "Falha ao carregar" : "Loading failed"}</h3>
          <p>${currentLang === "pt" ? "Verifique se os arquivos JSON estão disponíveis na pasta data." : "Check whether the JSON files are available in the data folder."}</p>
        </div>
      </div>
    `;
  }
}

bindEvents();
window.addEventListener("load", () => {
  handleHeader();
  handleReveal();
  applyLanguage(currentLang);
  loadGallery();
});
