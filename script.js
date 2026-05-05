const header = document.getElementById("siteHeader");
const revealElements = document.querySelectorAll(".reveal");
const heroImage = document.querySelector(".hero-media img");
const tiltCards = document.querySelectorAll(".tilt-card");
const mobileToggle = document.getElementById("mobileToggle");
const primaryNav = document.getElementById("primaryNav");
const langButtons = document.querySelectorAll(".lang-btn");

let currentLang = "pt";

const translations = {
  pt: {
    ".btn-secondary": "Ver cards",
    ".btn-primary": "Conheça o universo"
  },
  en: {
    ".btn-secondary": "View cards",
    ".btn-primary": "Discover the universe"
  }
};

function handleHeader() {
  if (window.scrollY > 20) {
    header.classList.add("is-scrolled");
  } else {
    header.classList.remove("is-scrolled");
  }
}

function handleReveal() {
  const trigger = window.innerHeight * 0.88;
  revealElements.forEach((element) => {
    const top = element.getBoundingClientRect().top;
    if (top < trigger) {
      element.classList.add("is-visible");
    }
  });
}

function handleParallax() {
  if (!heroImage) return;
  const offset = window.scrollY * 0.12;
  heroImage.style.transform = `scale(1.06) translateY(${offset}px)`;
}

function bindTilt(card) {
  card.addEventListener("mousemove", (event) => {
    if (window.innerWidth < 900) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 12;
    const rotateX = ((y / rect.height) - 0.5) * -12;
    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
}

tiltCards.forEach(bindTilt);

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
    node.innerHTML = node.dataset[lang];
  });

  Object.entries(translations[lang]).forEach(([selector, text]) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = text;
  });

  langButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
  });
}

langButtons.forEach((button) => {
  button.addEventListener("click", () => applyLanguage(button.dataset.lang));
});

window.addEventListener("scroll", () => {
  handleHeader();
  handleReveal();
  handleParallax();
});

window.addEventListener("load", () => {
  handleHeader();
  handleReveal();
  handleParallax();
  applyLanguage(currentLang);
});
