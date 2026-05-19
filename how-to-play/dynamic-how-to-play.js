(() => {
  const CONTENT_URL = "how-to-play/how-to-play-content.json";

  const getLang = () => {
    const active = document.querySelector(".lang-btn.is-active");
    return active?.dataset.lang || "pt";
  };

  const text = (value, lang) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value[lang] || value.pt || value.en || "";
  };

  const youtubeThumb = (item) => {
    if (item.thumbnail) return item.thumbnail;
    if (item.youtubeId)
      return `https://img.youtube.com/vi/${item.youtubeId}/maxresdefault.jpg`;
    return "";
  };

  const setTextBindings = (data, lang) => {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const path = el.dataset.i18n.split(".");
      const value = path.reduce((acc, key) => acc?.[key], data);
      el.textContent = text(value, lang);
    });

    document.querySelectorAll("[data-bind-src]").forEach((el) => {
      const path = el.dataset.bindSrc.split(".");
      const value = path.reduce((acc, key) => acc?.[key], data);
      if (value) el.src = value;
    });
  };

  const renderTutorials = (items, lang) => {
    const track = document.querySelector('[data-render="tutorials"]');
    if (!track) return;

    track.innerHTML = items
      .map(
        (item) => `
      <a class="media-card" href="${item.url}" target="_blank" rel="noopener noreferrer">
        <img src="${youtubeThumb(item)}" alt="${text(item.title, lang)}">
        <div class="media-copy">
          <span>${text(item.tag, lang)}</span>
          <h3>${text(item.title, lang)}</h3>
        </div>
      </a>
    `,
      )
      .join("");
  };

  const renderReviews = (items, lang) => {
    const track = document.querySelector('[data-render="reviews"]');
    if (!track) return;

    track.innerHTML = items
      .map(
        (item) => `
      <a class="influencer-card review-card" href="${item.url}" target="_blank" rel="noopener noreferrer">
        <img src="${youtubeThumb(item)}" alt="Review de ${item.name}">
        <div>
          <strong>${item.name}</strong>
          <span>“${text(item.quote, lang)}”</span>
        </div>
      </a>
    `,
      )
      .join("");
  };

  const renderFooterLinks = (links, lang) => {
    const container = document.querySelector('[data-render="footerLinks"]');
    if (!container) return;

    container.innerHTML = links
      .map(
        (link) => `
      <a href="${link.href}">${text(link.label, lang)}</a>
    `,
      )
      .join("");
  };

  const initCarousels = () => {
    document.querySelectorAll(".content-carousel").forEach((carousel) => {
      const track = carousel.querySelector(".carousel-track");
      const prev = carousel.querySelector(".carousel-arrow--prev");
      const next = carousel.querySelector(".carousel-arrow--next");

      if (!track || !prev || !next) return;

      const getStep = () => {
        const firstItem = track.children[0];
        const styles = window.getComputedStyle(track);
        const gap = parseFloat(styles.columnGap || styles.gap || 0);
        return firstItem.getBoundingClientRect().width + gap;
      };

      prev.onclick = () => {
        track.scrollBy({ left: -getStep(), behavior: "smooth" });
      };

      next.onclick = () => {
        track.scrollBy({ left: getStep(), behavior: "smooth" });
      };
    });
  };

  const render = (data) => {
    const lang = getLang();

    setTextBindings(data, lang);
    renderTutorials(data.tutorials.items, lang);
    renderReviews(data.reviews.items, lang);
    renderFooterLinks(data.footer.links, lang);
    initCarousels();
  };

  fetch(CONTENT_URL)
    .then((res) => res.json())
    .then((data) => {
      render(data);

      document.querySelectorAll(".lang-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          document
            .querySelectorAll(".lang-btn")
            .forEach((b) => b.classList.remove("is-active"));
          btn.classList.add("is-active");
          render(data);
        });
      });
    })
    .catch((err) => {
      console.error("Erro ao carregar " + CONTENT_URL + ":", err);
    });
})();
