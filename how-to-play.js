const header = document.getElementById("siteHeader");
const primaryNav = document.getElementById("primaryNav");
const mobileToggle = document.getElementById("mobileToggle");
const langButtons = document.querySelectorAll(".lang-btn");
const ruleItems = document.querySelectorAll(".rule-item");
const turnSteps = document.querySelectorAll(".turn-step");

let currentLang = "pt";
let activeStep = 0;
let autoplayId = null;

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
}

function setActiveStep(index) {
  if (!turnSteps.length) return;
  activeStep = (index + turnSteps.length) % turnSteps.length;
  turnSteps.forEach((step, stepIndex) => {
    step.classList.toggle("is-active", stepIndex === activeStep);
  });
}

function startTurnAutoplay() {
  if (!turnSteps.length) return;
  clearInterval(autoplayId);
  autoplayId = setInterval(() => {
    setActiveStep(activeStep + 1);
  }, 2400);
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

langButtons.forEach((button) => {
  button.addEventListener("click", () => applyLanguage(button.dataset.lang));
});

turnSteps.forEach((step, index) => {
  step.addEventListener("mouseenter", () => setActiveStep(index));
  step.addEventListener("focusin", () => setActiveStep(index));
});

ruleItems.forEach((item) => {
  const trigger = item.querySelector(".rule-trigger");
  trigger?.addEventListener("click", () => {
    const isOpen = item.classList.contains("is-open");

    ruleItems.forEach((rule) => {
      rule.classList.remove("is-open");
      rule.querySelector(".rule-trigger")?.setAttribute("aria-expanded", "false");
    });

    if (!isOpen) {
      item.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
    }
  });
});

window.addEventListener("scroll", () => {
  handleHeader();
  handleReveal();
});
window.addEventListener("load", () => {
  handleHeader();
  handleReveal();
  applyLanguage(currentLang);
  setActiveStep(0);
  startTurnAutoplay();
});
window.addEventListener("resize", handleReveal);
