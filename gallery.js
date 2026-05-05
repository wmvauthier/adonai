const header = document.getElementById("siteHeader");
const primaryNav = document.getElementById("primaryNav");
const mobileToggle = document.getElementById("mobileToggle");
const galleryGrid = document.getElementById("galleryGrid");
const gallerySummary = document.getElementById("gallerySummary");
const highlightStack = document.getElementById("highlightStack");
const filterButtons = document.querySelectorAll("[data-filter]");
const sortButtons = document.querySelectorAll("[data-sort]");
const langButtons = document.querySelectorAll(".lang-btn");

let currentFilter = "all";
let currentSort = "recent";
let currentLang = "pt";
let galleryItems = [];
let influencerItems = [];

const userAliases = {
  skullservantdobem: "Skull Servant do Bem",
  rafaelfanganiello: "Rafael Fanganiello",
};

function normalizeCreator(name) {
  if (!name) return "";

  const key = String(name).toLowerCase().replace("@", "").replace(/\s+/g, "");

  if (userAliases[key]) {
    return {
      key,
      display: userAliases[key],
    };
  }

  return {
    key,
    display: name,
  };
}

function handleHeader() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 20);
}

function handleReveal() {
  const trigger = window.innerHeight * 0.9;
  document.querySelectorAll(".reveal").forEach((element) => {
    if (element.getBoundingClientRect().top < trigger) {
      element.classList.add("is-visible");
    }
  });
}

mobileToggle?.addEventListener("click", () => {
  const isOpen = primaryNav.classList.toggle("is-open");
  mobileToggle.setAttribute("aria-expanded", String(isOpen));
});

primaryNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    primaryNav.classList.remove("is-open");
    mobileToggle?.setAttribute("aria-expanded", "false");
  });
});

function applyLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";

  document.querySelectorAll("[data-pt]").forEach((node) => {
    const value = node.dataset[lang];
    if (typeof value !== "undefined") {
      node.innerHTML = value;
    }
  });

  langButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
  });

  if (galleryItems.length) {
    renderGallery();
  }
}

langButtons.forEach((button) => {
  button.addEventListener("click", () => applyLanguage(button.dataset.lang));
});

function parseBrazilianDate(value) {
  const [day, month, year] = value.split("/").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(dateValue) {
  const date =
    typeof dateValue === "string" ? parseBrazilianDate(dateValue) : dateValue;
  return new Intl.DateTimeFormat(currentLang === "pt" ? "pt-BR" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function normalizeInstagramItem(item, index) {
  const creator = normalizeCreator(item.user);

  return {
    id: `instagram-${index}`,
    platform: "instagram",
    title: `Post de @${item.user}`,
    creator: creator.display,
    creatorKey: creator.key,
    thumb: item.image,
    avatar: item.avatar,
    url: item.url,
    date: item.date,
    priority: Number(item.priority) || 0,
    dateObj: parseBrazilianDate(item.date),
    cta: currentLang === "pt" ? "Abrir no Instagram" : "Open on Instagram",
  };
}

function normalizeYoutubeItem(item, index) {
  const creator = normalizeCreator(item.channel);

  return {
    id: `youtube-${index}`,
    platform: "youtube",
    title: item.title,
    creator: creator.display,
    creatorKey: creator.key,
    thumb: item.thumb,
    avatar: item.avatar,
    url: item.url,
    date: item.date,
    priority: Number(item.priority) || 0,
    dateObj: parseBrazilianDate(item.date),
    cta: currentLang === "pt" ? "Assistir no YouTube" : "Watch on YouTube",
  };
}

function filterItems(items) {
  if (currentFilter === "all") return items;
  return items.filter((item) => item.platform === currentFilter);
}

function sortItems(items) {
  const list = [...items];

  if (currentSort === "creator") {
    return list.sort(
      (a, b) =>
        a.creator.localeCompare(
          b.creator,
          currentLang === "pt" ? "pt-BR" : "en-US",
        ) || b.dateObj - a.dateObj,
    );
  }

  return list.sort((a, b) => b.dateObj - a.dateObj || b.priority - a.priority);
}

function getUniqueInfluencers(items) {
  const map = new Map();

  items.forEach((item) => {
    if (item.priority < 1) return;

    const existing = map.get(item.creatorKey);
    if (!existing) {
      map.set(item.creatorKey, { ...item });
      return;
    }

    const isBetter =
      item.priority > existing.priority ||
      (item.priority === existing.priority && item.dateObj > existing.dateObj);

    if (isBetter) {
      map.set(item.creatorKey, { ...item });
    }
  });

  return [...map.values()].sort(
    (a, b) =>
      b.priority - a.priority ||
      b.dateObj - a.dateObj ||
      a.creator.localeCompare(b.creator, "pt-BR"),
  ).slice(0, 15);
}

function renderHighlights(items) {
  if (!highlightStack) return;
  highlightStack.innerHTML = "";

  items.forEach((item) => {
    const link = document.createElement("a");
    link.className = "highlight-bubble";
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `${item.creator} - ${item.platform}`);

    const ring = document.createElement("div");
    ring.className = "highlight-bubble-ring";

    const image = document.createElement("img");
    image.src = item.avatar;
    image.alt = item.creator;
    ring.appendChild(image);

    const name = document.createElement("span");
    name.className = "highlight-bubble-name";
    name.textContent = item.creator;

    link.append(ring, name);
    highlightStack.appendChild(link);
  });
}

function buildCard(item) {
  const link = document.createElement("a");
  link.className = "gallery-card reveal tilt-card";
  link.href = item.url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("data-platform", item.platform);

  const media = document.createElement("div");
  media.className = "gallery-card-media";

  const image = document.createElement("img");
  image.src = item.thumb;
  image.alt = item.title;

  media.append(image);

  const body = document.createElement("div");
  body.className = "gallery-card-body";

  const userRow = document.createElement("div");
  userRow.className = "gallery-card-user";

  const avatar = document.createElement("img");
  avatar.className = "gallery-card-avatar";
  avatar.src = item.avatar;
  avatar.alt = item.creator;

  const info = document.createElement("div");
  const title = document.createElement("h3");
  title.className = "gallery-card-title";
  title.textContent = item.title;

  const subtitle = document.createElement("p");
  subtitle.className = "gallery-card-subtitle";
  subtitle.textContent = item.creator;

  info.append(title, subtitle);

  const arrow = document.createElement("div");
  arrow.className = "gallery-card-arrow";
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "↗";

  userRow.append(avatar, info, arrow);

  const footer = document.createElement("div");
  footer.className = "gallery-card-footer";

  const date = document.createElement("span");
  date.className = "gallery-card-date";
  date.textContent = formatDate(item.dateObj);

  const cta = document.createElement("span");
  cta.className = "gallery-card-cta";
  cta.textContent = item.cta;

  footer.append(date, cta);
  body.append(userRow, footer);
  link.append(media, body);

  return link;
}

function renderEmptyState() {
  galleryGrid.innerHTML = `
    <div class="gallery-empty is-visible">
      <div>
        <h3>${currentLang === "pt" ? "Nenhum conteúdo encontrado" : "No content found"}</h3>
        <p>${currentLang === "pt" ? "Tente mudar o filtro ou a ordenação para ver outros resultados." : "Try changing the filter or sorting to see other results."}</p>
      </div>
    </div>
  `;
}

function renderGallery() {
  const filtered = filterItems(galleryItems);
  const sorted = sortItems(filtered);

  const youtubeCount = galleryItems.filter(
    (item) => item.platform === "youtube",
  ).length;
  const instagramCount = galleryItems.filter(
    (item) => item.platform === "instagram",
  ).length;

  gallerySummary.textContent =
    currentLang === "pt"
      ? `${sorted.length} conteúdos exibidos • ${youtubeCount} no YouTube • ${instagramCount} no Instagram`
      : `${sorted.length} items shown • ${youtubeCount} on YouTube • ${instagramCount} on Instagram`;

  galleryGrid.innerHTML = "";

  if (!sorted.length) {
    renderEmptyState();
    return;
  }

  const fragment = document.createDocumentFragment();
  sorted.forEach((item) => fragment.appendChild(buildCard(item)));
  galleryGrid.appendChild(fragment);
  handleReveal();
}

function setActiveButton(buttons, activeValue, key) {
  buttons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset[key] === activeValue);
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    setActiveButton(filterButtons, currentFilter, "filter");
    renderGallery();
  });
});

sortButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentSort = button.dataset.sort;
    setActiveButton(sortButtons, currentSort, "sort");
    renderGallery();
  });
});

async function loadGallery() {

  try {

    galleryGrid.innerHTML = `
      <div class="gallery-loading is-visible">
        <div>
          <h3>${currentLang === "pt" ? "Carregando mural" : "Loading feed"}</h3>
          <p>${currentLang === "pt" ? "Organizando Instagram e YouTube em um único feed." : "Organizing Instagram and YouTube into a single feed."}</p>
        </div>
      </div>
    `;

    const [instagramResponse, youtubeResponse] = await Promise.all([
      fetch("instagram.json"),
      fetch("youtube.json"),
    ]);

    const instagram = await instagramResponse.json();
    const youtube = await youtubeResponse.json();

    galleryItems = [
      ...instagram.map(normalizeInstagramItem),
      ...youtube.map(normalizeYoutubeItem),
    ];

    influencerItems = getUniqueInfluencers(galleryItems);
    renderHighlights(influencerItems);
    renderGallery();

  } catch (error) {

    console.error(error);
    gallerySummary.textContent =
      currentLang === "pt"
        ? "Não foi possível carregar a galeria."
        : "Could not load the gallery.";
    galleryGrid.innerHTML = `
      <div class="gallery-empty is-visible">
        <div>
          <h3>${currentLang === "pt" ? "Falha ao carregar" : "Loading failed"}</h3>
          <p>${currentLang === "pt" ? "Verifique se os arquivos JSON estão disponíveis no mesmo diretório da página." : "Check whether the JSON files are available in the same directory as the page."}</p>
        </div>
      </div>
    `;

  }

}

window.addEventListener("scroll", handleHeader);
window.addEventListener("scroll", handleReveal);
window.addEventListener("load", () => {
  handleHeader();
  handleReveal();
  applyLanguage(currentLang);
  loadGallery();
});
