// Apply the saved theme before the stylesheets, independently of the OS theme.
(() => {
  const storageKey = "adonai-theme";
  const root = document.documentElement;
  const apply = (value) => {
    const theme = value === "light" ? "light" : "dark";
    root.dataset.theme = theme;
    document.querySelectorAll("[data-theme-option]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.themeOption === theme),
      );
    });
  };
  let saved = "dark";
  try {
    saved = localStorage.getItem(storageKey);
  } catch {
    /* Storage may be unavailable. */
  }
  apply(saved);

  document.addEventListener("DOMContentLoaded", () => {
    apply(root.dataset.theme);
    document.querySelectorAll("[data-theme-option]").forEach((button) => {
      button.addEventListener("click", () => {
        apply(button.dataset.themeOption);
        try {
          localStorage.setItem(storageKey, root.dataset.theme);
        } catch {
          /* Keep the choice for this visit. */
        }
      });
    });
    const labels = () => {
      const english = root.lang === "en";
      document
        .querySelector(".theme-control")
        .setAttribute("aria-label", english ? "Page theme" : "Tema da página");
      document.querySelectorAll("[data-theme-option]").forEach((button) => {
        const light = button.dataset.themeOption === "light";
        const label = english
          ? light
            ? "Use light mode"
            : "Use dark mode"
          : light
            ? "Ativar modo claro"
            : "Ativar modo escuro";
        button.setAttribute("aria-label", label);
        button.title = label;
      });
    };
    labels();
    document.addEventListener("home:language", labels);
  });
  window.addEventListener("storage", (event) => {
    if (event.key === storageKey || event.key === null) apply(event.newValue);
  });
})();
