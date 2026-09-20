(() => {
  const header = document.getElementById("siteHeader");
  const toggle = document.getElementById("mobileToggle");
  const nav = document.getElementById("primaryNav");
  const buttons = document.querySelectorAll(".lang-btn");
  const closeMenu = () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      closeMenu();
      toggle.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) closeMenu();
  });
  const updateHeader = () =>
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  const applyLanguage = (lang) => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
    document.querySelectorAll("[data-pt][data-en]").forEach((node) => {
      node.textContent = node.dataset[lang];
    });
    buttons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.lang === lang);
      button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
    });
    toggle.setAttribute(
      "aria-label",
      lang === "pt" ? "Alternar menu" : "Toggle menu",
    );
    document.dispatchEvent(new CustomEvent("home:language", { detail: lang }));
  };
  buttons.forEach((button) =>
    button.addEventListener("click", () => applyLanguage(button.dataset.lang)),
  );
  applyLanguage("pt");
})();
