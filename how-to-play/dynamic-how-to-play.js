(() => {
  const track = document.querySelector('[data-render="tutorials"]');
  const carousel = track.closest(".content-carousel");
  const previous = carousel.querySelector(".carousel-arrow--prev");
  const next = carousel.querySelector(".carousel-arrow--next");
  let items = [];
  let failed = false;
  const text = (value) =>
    typeof value === "string"
      ? value
      : value?.[document.documentElement.lang === "en" ? "en" : "pt"] ||
        value?.pt ||
        value?.en ||
        "";
  const safeUrl = (value) => {
    if (typeof value !== "string" || !value.trim()) return "";
    try {
      const url = new URL(value, document.baseURI);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  };
  const render = () => {
    const en = document.documentElement.lang === "en";
    track.replaceChildren();
    const enabled = items.filter(
      (item) => item && item.enabled !== false && safeUrl(item.url),
    );
    carousel.classList.toggle("is-empty", !enabled.length);
    previous.hidden = next.hidden = !enabled.length;
    previous.setAttribute(
      "aria-label",
      en ? "Previous tutorials" : "Tutoriais anteriores",
    );
    next.setAttribute(
      "aria-label",
      en ? "Next tutorials" : "Próximos tutoriais",
    );
    if (!enabled.length) {
      const message = document.createElement("p");
      message.className = "tutorial-status";
      message.setAttribute("role", "status");
      message.textContent = failed
        ? en
          ? "Tutorials could not be loaded. You can continue with the guide or rulebook."
          : "Não foi possível carregar os tutoriais. Continue pelo guia ou pelo manual."
        : en
          ? "Video tutorials coming soon. In the meantime, explore the steps in this guide."
          : "Tutoriais em vídeo em breve. Enquanto isso, explore as etapas deste guia.";
      track.append(message);
      return;
    }
    enabled.forEach((item) => {
      const card = document.createElement("a");
      card.className = "media-card";
      card.href = safeUrl(item.url);
      card.target = "_blank";
      card.rel = "noopener noreferrer";
      const image = document.createElement("img");
      image.src =
        safeUrl(item.thumbnail) ||
        (/^[\w-]{11}$/.test(item.youtubeId || "")
          ? `https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg`
          : "../assets/logo/adonai_logo_base-4.webp");
      image.alt = "";
      image.loading = "lazy";
      image.addEventListener(
        "error",
        () => {
          image.src = "../assets/logo/adonai_logo_base-4.webp";
        },
        { once: true },
      );
      const copy = document.createElement("div");
      copy.className = "media-copy";
      const tag = document.createElement("span");
      tag.textContent = text(item.tag);
      const title = document.createElement("h3");
      title.textContent = text(item.title);
      copy.append(tag, title);
      card.append(image, copy);
      track.append(card);
    });
  };
  const scroll = (direction) => {
    const card = track.firstElementChild;
    if (!card || !items.length) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    track.scrollBy({
      left: direction * (card.getBoundingClientRect().width + gap),
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };
  previous.addEventListener("click", () => scroll(-1));
  next.addEventListener("click", () => scroll(1));
  document.addEventListener("home:language", render);
  fetch("./how-to-play-content.json")
    .then((response) => {
      if (!response.ok) throw new Error(`Tutorials: HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      items = Array.isArray(data.tutorials?.items) ? data.tutorials.items : [];
      render();
    })
    .catch((error) => {
      failed = true;
      render();
      console.error(error);
    });
})();
