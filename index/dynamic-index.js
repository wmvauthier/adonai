(() => {
  const section = document.getElementById("reviews");
  const track = document.querySelector('[data-render="reviews"]');
  let reviews = [];
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
  const thumbnail = (item) => {
    if (safeUrl(item.thumbnail)) return safeUrl(item.thumbnail);
    try {
      const url = new URL(item.url);
      const id =
        item.youtubeId ||
        (url.hostname === "youtu.be"
          ? url.pathname.slice(1)
          : ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(
                url.hostname,
              )
            ? url.searchParams.get("v") ||
              url.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1]
            : "");
      if (/^[\w-]{11}$/.test(id || ""))
        return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    } catch {
      /* A imagem padrão mantém o review utilizável. */
    }
    return "assets/logo/adonai_logo_base-4.webp";
  };
  const renderReviews = () => {
    const lang = document.documentElement.lang === "en" ? "en" : "pt";
    track.replaceChildren();
    reviews.forEach((item) => {
      if (
        !item ||
        item.enabled === false ||
        typeof item.name !== "string" ||
        !item.name.trim() ||
        !safeUrl(item.url)
      )
        return;
      const card = document.createElement("a");
      card.className = "home-review";
      card.href = safeUrl(item.url);
      card.target = "_blank";
      card.rel = "noopener noreferrer";
      const image = document.createElement("img");
      image.src = thumbnail(item);
      image.alt = "";
      image.loading = "lazy";
      image.addEventListener(
        "error",
        () => {
          image.src = "assets/logo/adonai_logo_base-4.webp";
        },
        { once: true },
      );
      const copy = document.createElement("div");
      copy.className = "home-review-copy";
      const name = document.createElement("h3");
      name.textContent = item.name;
      copy.append(name);
      const quoteText = text(item.quote, lang);
      if (quoteText) {
        const quote = document.createElement("blockquote");
        quote.textContent = quoteText;
        copy.append(quote);
      }
      const label = document.createElement("span");
      label.className = "home-review-label";
      label.textContent = lang === "pt" ? "Ver review ↗" : "View review ↗";
      copy.append(label);
      card.append(image, copy);
      track.append(card);
    });
    section.hidden = !track.childElementCount;
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
    renderReviews();
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
  fetch("data/content/reviews.json")
    .then((response) => {
      if (!response.ok) throw new Error(`Reviews: HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      reviews = Array.isArray(data) ? data : [];
      renderReviews();
    })
    .catch((error) => {
      section.hidden = true;
      console.error("Não foi possível carregar os reviews.", error);
    });
})();
