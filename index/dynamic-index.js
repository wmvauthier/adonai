(() => {
  let footerLinks = null;
  const text = (value, lang) =>
    typeof value === "string"
      ? value
      : value?.[lang] || value?.pt || value?.en || "";
  const safeUrl = (value) => {
    if (typeof value !== "string" || !value.trim()) return "";
    try {
      const url = new URL(value, document.baseURI);
      return ["https:", "http:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  };
  const renderFooter = () => {
    if (!footerLinks) return;
    const lang = document.documentElement.lang === "en" ? "en" : "pt";
    const container = document.querySelector('[data-render="footerLinks"]');
    container.replaceChildren();
    footerLinks
      .filter((link) => link.enabled !== false && safeUrl(link.href))
      .forEach((link) => {
        const anchor = document.createElement("a");
        anchor.href = safeUrl(link.href);
        anchor.textContent = text(link.label, lang);
        if (
          new URL(anchor.href).pathname ===
          new URL("index.html", document.baseURI).pathname
        ) {
          anchor.setAttribute("aria-current", "page");
        }
        container.append(anchor);
      });
  };
  document.addEventListener("home:language", () => {
    renderFooter();
  });
  fetch("index/index-content.json")
    .then((response) => {
      if (!response.ok) throw new Error(`Home: HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      if (Array.isArray(data.footer?.links)) footerLinks = data.footer.links;
      renderFooter();
    })
    .catch((error) =>
      console.error("Mantendo a navegação padrão do rodapé.", error),
    );
})();
